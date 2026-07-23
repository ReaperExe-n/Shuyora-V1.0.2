import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

import { createClient } from 'redis';
import axios from 'axios';
import http from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { syncMeilisearch, searchAnime } from './search.js';
import { validate } from './middleware/validate.js';
import { authSchema, searchSchema, idParamSchema, animeIdParamSchema, proxySchema, reviewSchema, oauthCallbackSchema, watchSchema } from './schemas/index.js';

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
// Protect API from spam/DDoS with Advanced Limiters
const publicLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX) || 200,
  message: { error: 'Too many requests from this IP, please try again later.' },
  skip: (req) => req.originalUrl.startsWith('/api/proxy') // Do not limit video chunk streaming
});

const userLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_USER_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_USER_MAX) || 500, // Looser limit for auth actions
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// Custom key generator for auth routes: Use IP + Username/Email if present to prevent botnet brute force on single accounts
const authKeyGenerator = (req) => {
  const accountIdentifier = req.body?.username || req.body?.email || 'unknown';
  console.log(`[RateLimit] Generating key for: ${req.ip}_${accountIdentifier}`);
  return `${req.ip}_${accountIdentifier}`;
};

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 10,
  keyGenerator: authKeyGenerator,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes before trying again.' }
});

const authSlowDown = slowDown({
  windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
  delayAfter: parseInt(process.env.RATE_LIMIT_AUTH_DELAY_AFTER) || 3, // Delay after 3 attempts
  delayMs: parseInt(process.env.RATE_LIMIT_AUTH_DELAY_MS) || 500, // Exponential backoff
  keyGenerator: authKeyGenerator,
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

// Apply publicLimiter as default to all /api/ routes, EXCEPT we will override on specific routes.
// Actually, applying it globally here would apply it to auth/user routes too. 
// Instead, we will apply it directly to specific endpoints in the route definitions.

// ===== DATABASE SETUP =====
const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL
});

const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        points INTEGER DEFAULT 0,
        discord_id VARCHAR(255),
        email VARCHAR(255),
        avatar TEXT
      );
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
app.get('/api/search', publicLimiter, validate(searchSchema), async (req, res) => {
  const query = req.query.q;
  
  const results = await searchAnime(query);
  res.json(results);
});



// ========== PROXY FOR MIRURO-API (Watch.jsx/WatchParty.jsx) ==========
app.get('/info/:id', publicLimiter, validate(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`http://localhost:8000/info/${id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Miruro-API' });
  }
});

app.get('/episodes/:id', publicLimiter, validate(idParamSchema), async (req, res) => {
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
app.get(/^\/watch\/(.*)/, publicLimiter, validate(watchSchema), async (req, res) => {
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


// ===== AUTHENTICATION MIDDLEWARE =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ===== AUTH ROUTES =====
app.post('/register', authSlowDown, authLimiter, validate(authSchema), async (req, res) => {
  const { username, password } = req.body;

  const defaultAvatars = [
    'https://s4.anilist.co/file/anilistcdn/character/large/b40-q0bOMPOnzKxG.png',
    'https://s4.anilist.co/file/anilistcdn/character/large/b66-yPeFFJAXYC1K.jpg',
    'https://s4.anilist.co/file/anilistcdn/character/large/b137-tLpD19hF1eIO.png',
    'https://s4.anilist.co/file/anilistcdn/character/large/b85-cI2yM99wKk3C.png',
    'https://s4.anilist.co/file/anilistcdn/character/large/b17-7V4lE5M3UaL8.png'
  ];
  const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password, points, avatar) VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, hashedPassword, 100, randomAvatar]
    );
    const newUser = result.rows[0];
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, username: newUser.username, points: newUser.points, avatar: newUser.avatar } });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/login', authSlowDown, authLimiter, validate(authSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, points: user.points, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/profile', userLimiter, authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, username, points, avatar FROM users WHERE id = $1`, [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

app.get('/auth/discord', authSlowDown, authLimiter, (req, res) => {
  const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI || 'http://localhost:4001/auth/discord/callback');
  const clientId = process.env.DISCORD_CLIENT_ID;
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email%20guilds.join`);
});

app.get('/auth/discord/callback', authSlowDown, authLimiter, validate(oauthCallbackSchema), async (req, res) => {
  const code = req.query.code;
  try {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:4001/auth/discord/callback'
    });
    
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const { access_token } = tokenResponse.data;
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const discordUser = userResponse.data;
    const discordId = discordUser.id;
    const username = discordUser.username;
    const email = discordUser.email || '';
    const avatar = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png` : null;

    // Auto-join server
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    if (botToken && guildId) {
      try {
        await axios.put(`https://discord.com/api/guilds/${guildId}/members/${discordId}`, {
          access_token: access_token
        }, {
          headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Failed to add user to guild:', err.response?.data || err.message);
      }
    }

    const result = await pool.query(`SELECT * FROM users WHERE discord_id = $1 OR email = $2 OR username = $3`, [discordId, email, username]);
    let row = result.rows[0];
    
    if (row) {
      if (!row.discord_id) {
        await pool.query('UPDATE users SET discord_id = $1 WHERE id = $2', [discordId, row.id]);
      }
      const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET);
      return res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(row))}`);
    } else {
      let insertResult;
      try {
        insertResult = await pool.query(
          `INSERT INTO users (username, discord_id, email, points, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
          [username, discordId, email, 100, avatar]
        );
      } catch (insertErr) {
        if (insertErr.code === '23505') { // Unique constraint violation
          const randomSuffix = Math.floor(Math.random() * 10000).toString();
          insertResult = await pool.query(
            `INSERT INTO users (username, discord_id, email, points, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
            [username + '_' + randomSuffix, discordId, email, 100, avatar]
          );
        } else {
          throw insertErr;
        }
      }
      const newUser = insertResult.rows[0];
      const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
      const newUserObj = { id: newUser.id, username: newUser.username, points: newUser.points, avatar: newUser.avatar };
      res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(newUserObj))}`);
    }
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('OAuth failure');
  }
});

app.get('/auth/anilist', authSlowDown, authLimiter, (req, res) => {
  const redirectUri = encodeURIComponent(process.env.ANILIST_REDIRECT_URI || 'http://localhost:4001/auth/anilist/callback');
  const clientId = process.env.ANILIST_CLIENT_ID;
  res.redirect(`https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`);
});

app.get('/auth/anilist/callback', authSlowDown, authLimiter, validate(oauthCallbackSchema), async (req, res) => {
  const code = req.query.code;
  
  try {
    const tokenResponse = await axios.post('https://anilist.co/api/v2/oauth/token', {
      client_id: process.env.ANILIST_CLIENT_ID,
      client_secret: process.env.ANILIST_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: process.env.ANILIST_REDIRECT_URI || 'http://localhost:4001/auth/anilist/callback',
      code
    });
    
    const { access_token } = tokenResponse.data;
    
    // GraphQL query to get the user profile
    const query = `
      query {
        Viewer {
          id
          name
          avatar { large }
        }
      }
    `;
    
    const userResponse = await axios.post('https://graphql.anilist.co', { query }, {
      headers: { 
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const anilistUser = userResponse.data.data.Viewer;
    const anilistId = anilistUser.id.toString();
    const username = anilistUser.name;
    const avatar = anilistUser.avatar.large;

    const result = await pool.query(`SELECT * FROM users WHERE anilist_id = $1 OR username = $2`, [anilistId, username]);
    let row = result.rows[0];
    
    if (row) {
      if (!row.anilist_id) {
        await pool.query('UPDATE users SET anilist_id = $1 WHERE id = $2', [anilistId, row.id]);
      }
      const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET);
      return res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(row))}`);
    } else {
      let insertResult;
      try {
        insertResult = await pool.query(
          `INSERT INTO users (username, anilist_id, points, avatar) VALUES ($1, $2, $3, $4) RETURNING *`, 
          [username, anilistId, 100, avatar]
        );
      } catch (insertErr) {
        if (insertErr.code === '23505') { // Unique constraint violation
          const randomSuffix = Math.floor(Math.random() * 10000).toString();
          insertResult = await pool.query(
            `INSERT INTO users (username, anilist_id, points, avatar) VALUES ($1, $2, $3, $4) RETURNING *`, 
            [username + '_' + randomSuffix, anilistId, 100, avatar]
          );
        } else {
          throw insertErr;
        }
      }
      const newUser = insertResult.rows[0];
      const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
      const newUserObj = { id: newUser.id, username: newUser.username, points: newUser.points, avatar: newUser.avatar };
      res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(newUserObj))}`);
    }
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('AniList OAuth failure');
  }
});

app.post('/api/logout', authSlowDown, authLimiter, (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ message: 'Logged out successfully' });
});

// ========== M3U8 CORS PROXY ==========
app.get('/api/proxy', publicLimiter, validate(proxySchema), async (req, res) => {
    try {
      const url = req.query.url;

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
      if (!res.headersSent) res.status(500).json({ error: 'Internal Proxy Error' });
    }
  });

// ========== HEALTH CHECK ==========
app.get('/api/health', publicLimiter, (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/scrape/manga/:id', publicLimiter, validate(idParamSchema), async (req, res) => {
  // Placeholder for manga scraper
  res.json({ error: 'Manga scraper not implemented yet' });
});

// ========== REVIEWS API (POSTGRESQL) ==========
app.get('/api/reviews/:animeId', publicLimiter, validate(animeIdParamSchema), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reviews WHERE anime_id = $1 ORDER BY created_at DESC', [req.params.animeId]);
    res.json(rows);
  } catch (err) {
    console.error('[DB ERROR] GET /reviews', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', userLimiter, validate(reviewSchema), async (req, res) => {
  try {
    const { animeId, author, rating, text } = req.body;
    const result = await pool.query(
      'INSERT INTO reviews (anime_id, author, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [animeId, author, rating, text]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[DB ERROR] POST /reviews', err.message);
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// ========== ANILIST GRAPHQL CACHE (REDIS) ==========
app.get('/api/home', publicLimiter, async (req, res) => {
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

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
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
