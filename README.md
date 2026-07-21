# 📺 Shuyora

Shuyora is a modern, high-performance anime streaming platform built with React, Vite, and Express.

## 🚀 Features
- **Fast & Responsive UI**: Built with React and optimized with Vite.
- **Real-time Sync**: Watch anime together with friends using the WatchParty feature.
- **Secure Authentication**: Built-in JWT authentication with HttpOnly cookies.
- **Dynamic Streaming**: Custom backend proxy and caching architecture for lightning-fast playback.
- **Full History Tracking**: Automatically saves your watch progress and synchronizes episode tracking.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Styled Components, React Router
- **Backend**: Express.js, PostgreSQL, Redis, Socket.io
- **Caching & Proxy**: Integrated hybrid cache (In-Memory + Redis) and robust SSRF protection.

## ⚙️ Getting Started

1. **Install Dependencies**
   ```bash
   # In the root folder
   npm install
   
   # In the server folder
   cd server && npm install
   ```

2. **Start the Development Servers**
   ```bash
   # Start the Express backend (runs on port 4000)
   npm run server
   
   # Start the React frontend
   npm run dev
   ```

## 🛡️ Security Updates
Shuyora includes custom enterprise-grade security patches:
- Comprehensive XSS protection using DOMPurify.
- Rate-limited API routes to prevent DDoS.
- Secure, HttpOnly JWT implementation (no localStorage vulnerabilities).
- Advanced SSRF blocking on all video proxies and metadata endpoints.

---
*Built by ReaperExe-n*
