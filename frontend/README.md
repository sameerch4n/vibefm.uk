# Apple Music Clone - React Frontend

A modern, dark-themed music player built with React, TypeScript, and shadcn/ui components. Features an Apple Music-inspired design with responsive layout and YouTube integration.

## Features

- 🎵 **Music Search**: Search for songs, artists, and albums
- 📊 **Music Charts**: Browse top charts by country
- ❤️ **Liked Songs**: Save and manage your favorite tracks (localStorage)
- 🎛️ **Full Player Controls**: Play, pause, skip, seek, volume control
- 🔀 **Shuffle & Repeat**: Multiple playback modes
- 📱 **Responsive Design**: Works on desktop and mobile
- 🌚 **Dark Theme**: Pure dark Apple Music-style interface
- 💾 **Local Storage**: Persistent liked songs and recent tracks
- 🎬 **YouTube Integration**: Streams music via YouTube

## Quick Start

```bash
npm install
npm run dev
```

App runs on: `http://localhost:3000`

**Important**: Make sure the backend API server is running on `localhost:5178` first!

## Technology Stack

- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **YouTube Iframe API** for music playback

## Usage

### Search Music
- Use the search bar to find songs, artists, or albums
- Click on any track card to start playing

### Browse Charts
- Browse top charts from different countries
- Use the country selector to switch between regions

### Liked Songs
- Click the heart icon on any track to add it to your liked songs
- Access all liked songs from the sidebar
- Liked songs are stored locally and persist between sessions

### Player Controls
- **Play/Pause**: Control playback
- **Skip**: Navigate between tracks
- **Seek**: Click on progress bar to jump to any position
- **Volume**: Adjust playback volume
- **Shuffle**: Random track order
- **Repeat**: Loop single track or entire playlist
- **Expand**: Full-screen player experience

## Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Basic UI components (Button, Input, etc.)
│   │   ├── TrackCard.tsx    # Track display component
│   │   ├── MusicPlayer.tsx  # Main player interface
│   │   ├── SearchAndCharts.tsx # Search and charts view
│   │   ├── LikedTracks.tsx  # Liked songs view
│   │   └── Sidebar.tsx      # Navigation sidebar
│   ├── lib/                 # Utility functions and services
│   │   ├── api.ts           # API communication
│   │   ├── storage.ts       # localStorage management
│   │   ├── youtube-player.ts # YouTube integration
│   │   └── utils.ts         # Helper functions
│   ├── types/               # TypeScript type definitions
│   │   └── music.ts         # Music-related types
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── globals.css         # Global styles and themes
├── public/                 # Static assets
├── index.html             # Main HTML file
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Features in Detail

### Dark Theme
The app uses a carefully crafted dark theme that mimics Apple Music's aesthetic:
- Pure black backgrounds with subtle gradients
- Carefully chosen contrast ratios for accessibility
- Smooth animations and transitions
- Glassmorphism effects for modern look

### Responsive Design
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly controls
- Collapsible sidebar for mobile

### Local Storage
- Liked songs persistence
- Recent tracks history
- Player state preservation
- No account required

### YouTube Integration
- Seamless YouTube video integration
- Hidden player for audio-only experience
- Automatic quality selection
- Error handling for unavailable tracks

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Integration

The app connects to the backend API server running on `localhost:5178`. It uses these endpoints:

```typescript
// Search endpoint
GET /api/search?q=query&limit=12
Response: Track[]

// Charts endpoint  
GET /api/charts
Response: { [country: string]: Track[] }

// YouTube endpoint
GET /api/youtube?q=query
Response: { id: string, title: string }
```

## Development

1. Make sure the backend server is running on `localhost:5178`
2. Start the frontend development server: `npm run dev`
3. Open `http://localhost:3000` in your browser
