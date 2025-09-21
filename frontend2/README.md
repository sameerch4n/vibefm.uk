# VibeFM Frontend 2.0

A modern, Apple Music-inspired music player frontend built with React, TypeScript, and Tailwind CSS.

## Features

### Design
- 20:80 split layout (sidebar : main content)
- Apple Music dark theme with authentic styling
- Responsive design with grid and list view modes
- Taper-formed mini-player with expandable full-screen player
- Color-adaptive backgrounds based on album artwork

### Navigation
- **Discover**: Top 10 tracks from all charts with browse charts callout
- **Search**: Live search with grid/list toggle and pagination
- **Charts**: Multiple regional charts (India, US, Global, UK, Canada, Australia, UAE)
- **Library**: Liked songs and user-created playlists
- **Radio**: Disabled with "Coming soon" tooltip

### Music Features
- YouTube-based audio playback using YouTube IFrame API
- Local storage for liked tracks and playlists
- Queue management with shuffle and repeat modes
- Real-time progress tracking and volume control
- Keyboard shortcuts in full-screen player

### Technical Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React (SF-like outline icons)
- **API**: Connected to backend music search and metadata service
- **Player**: YouTube IFrame API for audio playback
- **Storage**: Local storage for user preferences and data

## Development

### Prerequisites
- Node.js 18+
- Backend server running on port 5178

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Connection
The frontend connects to the backend API running on `http://localhost:5178` via Vite proxy configuration. The API provides:
- `/api/search` - Song search functionality
- `/api/charts` - Chart data
- `/api/youtube` - YouTube video lookup
- `/api/details/:id` - Track metadata

### File Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and API clients
├── types/         # TypeScript type definitions
└── App.tsx        # Main application component
```

## Usage

1. **Start the backend server** (port 5178)
2. **Run the frontend** with `npm run dev` (port 3000)
3. **Navigate** between sections using the sidebar
4. **Search** for music using the search page
5. **Browse charts** from different regions
6. **Like songs** to build your personal library
7. **Create playlists** for organizing music
8. **Enjoy** the full-screen player experience

## Browser Support
- Modern browsers with ES2020 support
- YouTube IFrame API compatibility required for audio playback

## Architecture Notes

### State Management
- Custom hooks for player state and navigation
- Local storage for persistence
- Component-level state for UI interactions

### API Integration
- Modular API client with error handling
- Debounced search for better performance
- Mock data fallbacks for development

### Styling System
- CSS custom properties for theme tokens
- Tailwind utility classes for consistent spacing
- Responsive grid system for adaptive layouts
- Custom animations and transitions
