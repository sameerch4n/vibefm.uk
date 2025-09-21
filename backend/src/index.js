// Public API
import { getItunesDetailsById, getTopCharts } from './itunes.js';
import { searchYouTubeId, getYouTubeStreamInfo } from './youtube.js';
import { searchSpotify, getSpotifyTrackDetails } from './spotify.js';

// Node 18+ has global fetch. If older, users must polyfill.

function debouncePromise(fn, wait = 200) {
  let t;
  let pendingReject;
  return (...args) => new Promise((resolve, reject) => {
    if (t) clearTimeout(t);
    if (pendingReject) pendingReject(new Error('debounced'));
    pendingReject = reject;
    t = setTimeout(async () => {
      try {
        const r = await fn(...args);
        resolve(r);
      } catch (e) {
        reject(e);
      }
    }, wait);
  });
}

// Spotify-only search for better quality
async function searchSongs(query, { limit = 10, country = 'US' } = {}) {
  try {
    const spotifyResults = await searchSpotify(query, { limit });
    return spotifyResults || [];
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
}

async function findOnYouTube(query) {
  return searchYouTubeId(query);
}

async function getTrackDetails(trackId, opts = {}) {
  const { country = 'US' } = opts;
  return await getItunesDetailsById(trackId, { country });
}

async function playTrack(youtubeId) {
  // server-side: return stream info (URL) for the client or another service to play
  const stream = await getYouTubeStreamInfo(youtubeId);
  return stream; // { url, type, bitrate }
}

async function getTopChartsData(opts = {}) {
  const { country = 'US', limit = 20 } = opts;
  const itunes = await getTopCharts({ country, limit });
  return itunes || [];
}

export { searchSongs, getTrackDetails, findOnYouTube, playTrack, debouncePromise, getTopChartsData as getTopCharts };
// Back-compat alias requested in spec
const searchTrack = searchSongs;
export { searchTrack };

// single-result only as requested

// Convenience: debounced search function factory for active-typing UIs
function createDebouncedSearchSongs(wait = 200) {
  const debounced = debouncePromise(searchSongs, wait);
  return (query, opts = {}) => debounced(query, opts);
}

export { createDebouncedSearchSongs };
