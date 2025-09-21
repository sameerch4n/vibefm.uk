# VibeFM Music Platform

A complete music discovery and streaming platform with a Node.js API backend and React frontend.

## Project Structure

```
vibefm/
├── backend/          # Node.js API server
├── frontend/         # Original React music player 
├── frontend2/        # New Apple Music-inspired UI
├── assets/           # Chart covers and images
├── Dockerfile        # Docker configuration for production
├── docker-compose.yml # Docker Compose for local testing
├── start.sh          # Startup script for both services
├── start-vibefm.sh   # New startup script with frontend2
├── COOLIFY_DEPLOYMENT_GUIDE.md # Detailed deployment guide
├── DEPLOYMENT_CHECKLIST.md     # Quick deployment checklist
└── README.md         # This file
```

## Quick Start Options

### 🐳 Docker Deployment (Recommended for Production)

**Single Container (Production Ready):**
```bash
# Build and run with Docker
docker build -t vibefm:latest .
docker run -p 1504:1504 -e NODE_ENV=production vibefm:latest

# Or use Docker Compose
docker-compose up -d
```

Access the application at: `http://localhost:1504`

### 🖥️ Local Development

**Option 1: New UI Experience (frontend2)**
```bash
./start-vibefm.sh
```
Launches the new Apple Music-inspired interface with advanced features.

**Option 2: Original UI (frontend)**
```bash
./start.sh  
```
Launches the original music player interface.

**Option 3: Manual startup**

Backend (API Server):
```bash
cd backend
npm install
npm start
```
Server runs on: `http://localhost:1504`

New Frontend (frontend2):
```bash
cd frontend2
npm install
npm run dev
```
App runs on: `http://localhost:3000`

## 🚀 Production Deployment

For production deployment on platforms like Coolify, Railway, or any Docker-compatible hosting:

1. **See the complete deployment guide**: [COOLIFY_DEPLOYMENT_GUIDE.md](./COOLIFY_DEPLOYMENT_GUIDE.md)
2. **Use the deployment checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Production Features
- ✅ Single container deployment on port **1504**
- ✅ Frontend and backend served from same port
- ✅ Health checks and monitoring ready
- ✅ Environment variable configuration
- ✅ Production-optimized builds
- ✅ Docker security best practices

## Features

### New Frontend2 Features
- 🎵 **Apple Music-inspired UI** with authentic dark theme
- 📱 **20:80 sidebar layout** with sticky navigation
- 🎯 **Advanced navigation** with back/forward support
- 📊 **Multiple chart regions** (India, US, Global, UK, Canada, Australia, UAE)
- 🔍 **Live search** with grid/list view toggle
- ❤️ **Liked songs management** with local storage
- 📱 **Taper-formed mini-player** expanding to full-screen
- 🎨 **Color-adaptive backgrounds** from album artwork
- ⌨️ **Keyboard shortcuts** and accessibility features
- 🎵 **YouTube-based playback** with queue management

### Core Features (Both UIs)
- 🎵 Music search across multiple sources
- 📊 Country-based music charts
- 🎬 YouTube integration for playback
- ❤️ Liked songs management
- 🌚 Dark theme interfaces
- 📱 Fully responsive design

## API Endpoints

- `GET /api/search` - Search for music
- `GET /api/charts` - Get music charts
- `GET /api/youtube` - Get YouTube videos
- `GET /api/itunes` - iTunes metadata
- `GET /api/details/:id` - Track details

## Tech Stack

**Backend:**
- Node.js + Express
- iTunes API integration
- YouTube API integration

**Frontend2 (New):**
- React 18 + TypeScript
- Vite
- Tailwind CSS (custom Apple Music theme)
- Lucide React icons
- YouTube IFrame API

**Frontend (Original):**
- React 18 + TypeScript
- Vite  
- Tailwind CSS + shadcn/ui
- Lucide React icons

## Development

1. Start the backend server first
2. Choose your preferred frontend (frontend2 recommended)
3. The frontend automatically connects to the backend API

For detailed setup instructions, see the README files in each folder.

---

## 📋 Complete Project Overview

### 🏗️ Architecture

This is a **full-stack music streaming application** with a clean separation between backend API and frontend UI:

```
Client (React) ←→ API Server (Node.js) ←→ External APIs (iTunes/Last.fm/YouTube)
```

### 🔧 How It Works

1. **User searches** for music in the React frontend
2. **Frontend sends request** to Node.js backend API
3. **Backend queries** iTunes/Last.fm APIs for music metadata
4. **Backend finds** corresponding YouTube video for playback
5. **Frontend receives** track data and plays via YouTube Iframe API
6. **User interactions** (like, skip, etc.) are handled client-side with localStorage

### 📁 Backend Structure (`/backend/`)

**Main Files:**
- `server.js` - Express server setup, API routes, CORS configuration
- `package.json` - Dependencies (express, cors, play-dl), scripts, metadata

**Core Logic (`/src/`):**
- `index.js` - Main API functions, search orchestration, data merging
- `itunes.js` - iTunes Search API integration, chart fetching
- `lastfm.js` - Last.fm API integration, additional metadata
- `youtube.js` - YouTube Data API, video search and streaming
- `types.d.ts` - TypeScript definitions for data structures

**Utilities:**
- `scripts/build.cjs` - Build script for distribution
- `test-api.js` - API endpoint testing script

### 🎯 Backend API Endpoints

| Endpoint | Purpose | Parameters | Response |
|----------|---------|------------|----------|
| `GET /api/search` | Search tracks | `q` (query), `limit`, `country` | Array of track objects |
| `GET /api/charts` | Get top charts | None | Object with country-based charts |
| `GET /api/youtube` | Find YouTube video | `q` (search query) | Video ID and metadata |
| `GET /api/itunes/:id` | Get iTunes metadata | `id` (track ID) | Detailed track information |

### 📱 Frontend Structure (`/frontend/`)

**Main Files:**
- `index.html` - App entry point, YouTube API script loading
- `vite.config.ts` - Vite bundler configuration, path aliases
- `tailwind.config.js` - Tailwind CSS theme, dark mode setup
- `package.json` - React dependencies, build scripts

**Core App (`/src/`):**
- `main.tsx` - React app initialization and DOM mounting
- `App.tsx` - Main application logic, state management, API integration
- `globals.css` - Global styles, dark theme variables, custom CSS

**Components (`/src/components/`):**
- `Sidebar.tsx` - Navigation menu (Home, Search, Liked Songs)
- `SearchAndCharts.tsx` - Search interface and charts display
- `TrackCard.tsx` - Individual track display component
- `MusicPlayer.tsx` - Bottom player bar + full-screen player
- `LikedTracks.tsx` - Liked songs management page
- `ui/` - Basic UI components (Button, Input) with shadcn/ui styling

**Services (`/src/lib/`):**
- `api.ts` - Backend API communication class
- `youtube-player.ts` - YouTube Iframe API wrapper
- `storage.ts` - localStorage management (liked songs, recent tracks)
- `utils.ts` - Utility functions (formatting, debouncing, etc.)

**Types (`/src/types/`):**
- `music.ts` - TypeScript interfaces for Track, Playlist, etc.

### 🔄 Data Flow

1. **Search Flow:**
   ```
   User Input → SearchAndCharts → MusicAPI.search() → Backend /api/search 
   → iTunes/Last.fm APIs → Merged Results → TrackCard Components
   ```

2. **Playback Flow:**
   ```
   TrackCard Click → App.handlePlay() → MusicAPI.getYouTubeVideo() 
   → Backend /api/youtube → YouTube API → YouTubePlayer.loadVideo() 
   → MusicPlayer UI Update
   ```

3. **Charts Flow:**
   ```
   App Mount → MusicAPI.getCharts() → Backend /api/charts 
   → iTunes API → Charts Display
   ```

### 💾 Data Storage

**Backend:** No persistent storage - all data fetched from external APIs in real-time

**Frontend:** Browser localStorage for:
- Liked songs list
- Recently played tracks
- Player state (volume, repeat mode)

### 🎨 UI/UX Features

**Design:**
- Pure dark theme inspired by Apple Music
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Responsive grid layouts

**Interactions:**
- Click to play tracks
- Heart icon to like/unlike songs
- Progress bar seeking
- Volume control
- Shuffle/repeat modes
- Full-screen player experience

### 🚀 Performance Optimizations

- **Debounced search** - Prevents excessive API calls while typing
- **Image lazy loading** - Album covers load on demand
- **Component memoization** - React components re-render only when needed
- **API response caching** - Charts cached to reduce repeated requests

### 🔌 External API Integrations

1. **iTunes Search API** - Music metadata, album art, charts
2. **Last.fm API** - Additional track info, tags, play counts
3. **YouTube Data API v3** - Video search for music playback
4. **YouTube Iframe API** - Embedded video player control

### 🛠️ Technology Stack

**Backend:**
- Node.js (ES modules)
- Express.js (REST API)
- CORS (cross-origin requests)
- play-dl (YouTube integration)

**Frontend:**
- React 18 (hooks, functional components)
- TypeScript (type safety)
- Vite (fast development server)
- Tailwind CSS (utility-first styling)
- shadcn/ui (component library)
- Lucide React (modern icons)

### 🔧 Development Tools

- **Hot reload** for both frontend and backend
- **TypeScript** for compile-time error checking
- **ESLint/Prettier** for code formatting
- **Modular architecture** for easy maintenance

This project demonstrates modern full-stack development practices with clean separation of concerns, real-time API integration, and a polished user experience.
