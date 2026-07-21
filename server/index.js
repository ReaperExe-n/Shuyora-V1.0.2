import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import pg from 'pg';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import axios from 'axios';
import http from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { syncMeilisearch, searchAnime } from './search.js';

dotenv.config();

// ===== SENTRY ERROR MONITORING =====
Sentry.init({
  dsn: process.env.SENTRY_DSN || "", // Optional: User will need to add their DSN in production
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});



// ===== REDIS CACHE SETUP =====
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('[REDIS] Client Error', err));

const initRedis = async () => {
  try {
    await redisClient.connect();
    console.log('[REDIS] Connected to Redis cache');
  } catch (err) {
    console.error('[REDIS] Connection failed. Caching will be skipped.', err.message);
  }
};
initRedis();

const app = express();
const PORT = process.env.PORT || 4000;

// ===== SOCKET.IO SETUP =====
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow frontend to connect
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`[SOCKET] User connected: ${socket.id}`);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`[SOCKET] ${socket.id} joined room ${roomId}`);
  });

  socket.on('sync_play', ({ roomId, time }) => {
    socket.to(roomId).emit('force_play', { time });
  });

  socket.on('sync_pause', ({ roomId, time }) => {
    socket.to(roomId).emit('force_pause', { time });
  });

  socket.on('sync_seek', ({ roomId, time }) => {
    socket.to(roomId).emit('force_seek', { time });
  });

  socket.on('send_chat', ({ roomId, username, message }) => {
    io.to(roomId).emit('chat_message', { username, message });
  });

  socket.on('request_sync', ({ roomId, target }) => {
    // Tell the host to send their current time
    socket.to(roomId).emit('request_sync', { target });
  });

  socket.on('send_sync', ({ target, time, isPlaying }) => {
    // Send the host's sync data to the specific user who requested it
    io.to(target).emit('initial_sync', { time, isPlaying });
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${socket.id}`);
  });
});

// ===== MIDDLEWARE & RATE LIMITING =====
// Protect API from spam/DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use('/api/', apiLimiter); // Apply rate limiter to all API routes

// ===== DATABASE SETUP =====
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shuyora'
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        anime_id VARCHAR(50) NOT NULL,
        author VARCHAR(100) NOT NULL,
        rating INTEGER NOT NULL,
        review_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB] PostgreSQL initialized successfully');
    
    // Sync Meilisearch in the background
    syncMeilisearch();
  } catch (err) {
    console.error('[DB] Failed to initialize tables:', err.message);
  }
};
initDB();

// ========== MEILISEARCH ROUTE ==========
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  
  const results = await searchAnime(query);
  res.json(results);
});



// ========== PROXY FOR MIRURO-API (Watch.jsx/WatchParty.jsx) ==========
app.get('/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`http://localhost:8000/info/${id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Miruro-API' });
  }
});

app.get('/episodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`http://localhost:8000/episodes/${id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Miruro-API' });
  }
});

// In-Memory fallback cache
const memCache = new Map();

// Mock /watch/* for video player stream fetching with HYBRID CACHING
app.get(/^\/watch\/(.*)/, async (req, res) => {
  try {
    const fullPath = req.params[0]; // e.g. "zoro/21/sub/one-piece-100"
    const queryStr = new URLSearchParams(req.query).toString();
    const url = `http://localhost:8000/watch/${fullPath}${queryStr ? '?' + queryStr : ''}`;
    const cacheKey = `stream:${fullPath}:${queryStr}`;

    // 1. Check Redis Cache First
    if (redisClient && redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log("[CACHE HIT] Redis served stream instantly:", cacheKey);
        return res.json(JSON.parse(cached));
      }
    } 
    // 2. Check In-Memory Cache (Fallback)
    else if (memCache.has(cacheKey)) {
      const { data, expires } = memCache.get(cacheKey);
      if (Date.now() < expires) {
        console.log("[CACHE HIT] In-Memory served stream instantly:", cacheKey);
        return res.json(data);
      }
      memCache.delete(cacheKey);
    }

    console.log("[PROXY] Fetching new stream from Miruro-API:", url);
    const response = await axios.get(url);
    const streamData = response.data;

    // 3. Save to Cache (90 minutes TTL = 5400 seconds)
    if (redisClient && redisClient.isReady) {
      await redisClient.setEx(cacheKey, 5400, JSON.stringify(streamData));
    } else {
      memCache.set(cacheKey, { data: streamData, expires: Date.now() + 5400 * 1000 });
    }

    res.json(streamData);
  } catch (err) {
    console.error("[PROXY] Stream Fetch Error:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Failed to fetch stream from Miruro-API' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ message: 'Logged out successfully' });
});

// ========== M3U8 CORS PROXY ==========
app.get('/api/proxy', async (req, res) => {
    try {
      const url = req.query.url;
      if (!url) return res.status(400).send('Missing url parameter');

      // [SECURITY] SSRF Protection - Block internal and metadata IPs
      try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        if (
          hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname === '::1' || 
          hostname === '169.254.169.254' || 
          hostname.startsWith('10.') || 
          hostname.startsWith('192.168.') || 
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
          hostname.endsWith('.internal')
        ) {
          console.warn("[SECURITY] Blocked SSRF attempt to:", url);
          return res.status(403).json({ error: 'Forbidden: Cannot access internal network resources.' });
        }
      } catch (e) {
        return res.status(400).json({ error: 'Invalid URL provided.' });
      }

      
      const referer = req.query.referer || 'https://hianime.to';
      
      const headers = { 
        'Referer': referer, 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' 
      };
      
      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }
      
      const response = await fetch(url, { headers });
      
      const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      if (response.headers.get('content-length')) {
        res.setHeader('Content-Length', response.headers.get('content-length'));
      }
      if (response.headers.get('content-range')) {
        res.setHeader('Content-Range', response.headers.get('content-range'));
      }
      if (response.headers.get('accept-ranges')) {
        res.setHeader('Accept-Ranges', response.headers.get('accept-ranges'));
      }
      
      res.status(response.status);
      
      if (contentType.includes('mpegurl') || contentType.includes('m3u8')) {
        let content = await response.text();
        const baseUrl = new URL(url);
        
        content = content.split('\n').map(line => {
          line = line.trim();
          if (line && !line.startsWith('#')) {
            if (!line.startsWith('http')) {
              const absUrl = new URL(line, baseUrl.href).href;
              return `/api/proxy?url=${encodeURIComponent(absUrl)}&referer=${encodeURIComponent(referer)}`;
            } else {
              return `/api/proxy?url=${encodeURIComponent(line)}&referer=${encodeURIComponent(referer)}`;
            }
          }
          return line;
        }).join('\n');
        
        res.send(content);
      } else {
        const { Readable } = await import('stream');
        if (response.body) {
           Readable.fromWeb(response.body).pipe(res);
        } else {
           res.end();
        }
      }
    } catch (err) {
      console.error('[PROXY ERROR]', err.message);
      if (!res.headersSent) res.status(500).send(err.message);
    }
  });

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/scrape/manga/:id', async (req, res) => {
  // Placeholder for manga scraper
  res.json({ error: 'Manga scraper not implemented yet' });
});

// ========== REVIEWS API (POSTGRESQL) ==========
app.get('/api/reviews/:animeId', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reviews WHERE anime_id = $1 ORDER BY created_at DESC', [req.params.animeId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { animeId, author, rating, text } = req.body;
    if (!animeId || !author || !rating || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await pool.query(
      'INSERT INTO reviews (anime_id, author, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [animeId, author, rating, text]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ANILIST GRAPHQL CACHE (REDIS) ==========
app.get('/api/home', async (req, res) => {
  try {
    if (redisClient.isReady) {
      const cached = await redisClient.get('shuyora_home_data');
      if (cached) {
        console.log('[CACHE HIT] Serving /api/home from Redis');
        return res.json(JSON.parse(cached));
      }
    }

    console.log('[CACHE MISS] Fetching /api/home from AniList');
    const query = `
      query {
        spotlight: Page(page: 1, perPage: 10) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id title { romaji english native } description(asHtml: true) bannerImage coverImage { extraLarge }
            format episodes duration status seasonYear averageScore genres
          }
        }
        trending: Page(page: 1, perPage: 20) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id title { romaji english native } coverImage { extraLarge } episodes duration status format genres averageScore
          }
        }
        popular: Page(page: 1, perPage: 20) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            id title { romaji english native } coverImage { extraLarge } episodes duration status format genres averageScore
          }
        }
      }
    `;

    const response = await axios.post('https://graphql.anilist.co', { query });
    const data = response.data;

    if (redisClient.isReady) {
      // Cache for 1 hour (3600 seconds)
      await redisClient.setEx('shuyora_home_data', 3600, JSON.stringify(data));
    }

    res.json(data);
  } catch (err) {
    console.error('Failed to fetch home data:', err.message);
    res.status(500).json({ error: 'Failed to fetch AniList data' });
  }
});

// Sentry Error Handler must be after all routes
Sentry.setupExpressErrorHandler(app);

// ========== CLEANUP ON EXIT ==========
process.on('SIGINT', async () => {
  console.log('\n[SHUTDOWN] Closing server...');
  process.exit(0);
});

// Change app.listen to httpServer.listen for WebSockets
httpServer.listen(PORT, async () => {
  console.log(`\n🚀 Shuyora API & WebSocket Server running at http://localhost:${PORT}`);
  console.log(`   Target: HiAnime.to (formerly Zoro.to)`);
  console.log(`   Method: Headless Chrome (Cloudflare bypass)`);
  console.log(`\n   Endpoints:`);
  console.log(`   GET /api/search/:query     - Search anime`);
  console.log(`   GET /api/info/:id          - Get anime info & episodes`);
  console.log(`   GET /api/watch/:episodeId  - Get M3U8 video stream`);
  console.log(`   GET /api/health            - Health check\n`);
});
