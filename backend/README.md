# Music Library API Backend

A Node.js Express API server that provides music search, charts, and metadata from multiple sources including iTunes, Last.fm, and YouTube.

## Features

- 🎵 **Music Search**: Search across iTunes and Last.fm
- 📊 **Music Charts**: Get top charts by country (USA, India Bollywood)
- 🎬 **YouTube Integration**: Find YouTube videos for tracks
- � **iTunes Metadata**: Detailed track information
- � **CORS Enabled**: Ready for frontend integration

## Quick Start

```bash
npm install
npm start
```

Server runs on: `http://localhost:5178`

## API Endpoints

### Search Music
```
GET /api/search?q={query}&limit={number}&source={source}
```
- `q`: Search query (required)
- `limit`: Number of results (default: 10)
- `source`: 'itunes' or 'lastfm' (default: 'itunes')

**Example:**
```bash
curl "http://localhost:5178/api/search?q=bohemian+rhapsody&limit=5"
```

### Get Charts
```
GET /api/charts
```
Returns top charts for different countries (USA, India Bollywood).

**Example:**
```bash
curl "http://localhost:5178/api/charts"
```

### YouTube Video Search
```
GET /api/youtube?q={query}
```
Find YouTube video ID for a song.

**Example:**
```bash
curl "http://localhost:5178/api/youtube?q=bohemian+rhapsody+queen"
```

### iTunes Metadata
```
GET /api/itunes/{id}
```
Get detailed iTunes metadata for a track.

## Testing

Test the API:
```bash
npm run test
```

## Tech Stack

- **Node.js** + **Express**
- **iTunes Search API**
- **Last.fm API** 
- **YouTube Data API v3**
- **CORS** for cross-origin requests

## Project Structure

```
backend/
├── src/
│   ├── index.js      # Main API routes
│   ├── itunes.js     # iTunes API integration
│   ├── lastfm.js     # Last.fm API integration
│   ├── youtube.js    # YouTube API integration
│   └── types.d.ts    # TypeScript definitions
├── scripts/
│   └── build.cjs     # Build script
├── server.js         # Express server setup
├── test-api.js       # API testing script
└── package.json
```

## Environment Variables (Optional)

Create a `.env` file for API keys:
```
LASTFM_API_KEY=your_lastfm_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

## Development

The server includes:
- Hot reload for development
- CORS enabled for frontend integration
- Error handling and logging
- Multiple data source integration
