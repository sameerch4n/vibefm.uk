// Minimal example server to test search + metadata + stream URL
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { searchSongs, getTrackDetails, findOnYouTube, getTopCharts } from './src/index.js';
import { getTopChartsByRegions, getItunesDetailsById } from './src/itunes.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fetch from 'node-fetch';
import sharp from 'sharp';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory cache for profile images
const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Image proxy endpoint for Google profile pictures
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing image URL' });
    }

    // Check cache first
    const cacheKey = imageUrl;
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
      return res.send(cached.buffer);
    }

    // Fetch image with proper headers to avoid blocking
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://accounts.google.com/',
        'Origin': 'https://accounts.google.com',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    
    // Process image with Sharp to ensure it's properly formatted and optimized
    const processedBuffer = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Cache the processed image
    imageCache.set(cacheKey, {
      buffer: processedBuffer,
      timestamp: Date.now()
    });

    // Clean up old cache entries (simple cleanup)
    if (imageCache.size > 1000) {
      const entries = Array.from(imageCache.entries());
      const oldEntries = entries.filter(([, data]) => Date.now() - data.timestamp > CACHE_DURATION);
      oldEntries.forEach(([key]) => imageCache.delete(key));
    }

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.send(processedBuffer);

  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const limit = Number(req.query.limit || 10);
    const country = String(req.query.country || 'US');
    if (!q) return res.status(400).json({ error: 'missing q' });
    const results = await searchSongs(q, { limit, country });
    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/details/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const country = String(req.query.country || 'US');
    const details = await getTrackDetails(id, { country });
    if (!details) return res.status(404).json({ error: 'not found' });
    res.json(details);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/youtube', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q) return res.status(400).json({ error: 'missing q' });
    const yt = await findOnYouTube(q);
    res.json(yt || {});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/charts', async (req, res) => {
  try {
    const charts = await getTopChartsByRegions();
    res.json(charts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/charts/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const countryCodeMap = {
      'USA': 'us',
      'India': 'in', 
      'UK': 'gb',
      'Canada': 'ca',
      'Australia': 'au',
      'UAE': 'ae',
      'Global': 'us'
    };
    
    const countryCode = countryCodeMap[country] || 'us';
    const tracks = await getTopCharts({ country: countryCode, limit: 100 });
    res.json(tracks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/itunes/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const country = req.query.country || 'US';
    const metadata = await getItunesDetailsById(trackId, { country });
    if (!metadata) {
      return res.status(404).json({ error: 'Track not found' });
    }
    res.json(metadata);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Remove play-dl audio proxy entirely - using YouTube Iframe API instead

const PORT = process.env.PORT || 1504;

// Serve static files - for production, serve built frontend from dist folder
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In production, serve the built frontend
if (process.env.NODE_ENV === 'production') {
  // In Docker, the frontend is built to /app/dist
  const frontendDistPath = path.join(__dirname, 'dist');
  app.use(express.static(frontendDistPath));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
  });
} else {
  // In development, serve the demo page
  const webDir = path.join(__dirname, 'web');
  app.use(express.static(webDir));
}

app.listen(PORT, () => console.log(`VibeFM server listening on http://localhost:${PORT}`));
