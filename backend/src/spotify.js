// Spotify Web API integration for better search
// Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables

let spotifyAccessToken = null;
let tokenExpiry = null;

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.log('Spotify credentials not found, falling back to iTunes search');
    return null;
  }

  // Check if we have a valid token
  if (spotifyAccessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return spotifyAccessToken;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    spotifyAccessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early
    
    return spotifyAccessToken;
  } catch (error) {
    console.error('Failed to get Spotify access token:', error);
    return null;
  }
}

async function searchSpotify(query, { limit = 20 } = {}) {
  const token = await getSpotifyAccessToken();
  if (!token) return [];

  try {
    const searchUrl = new URL('https://api.spotify.com/v1/search');
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', 'track');
    searchUrl.searchParams.set('limit', Math.min(limit, 50).toString());
    searchUrl.searchParams.set('market', 'US');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const tracks = data.tracks?.items || [];

    return tracks.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album?.name,
      cover: track.album?.images?.[0]?.url || track.album?.images?.[1]?.url,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      releaseDate: track.album?.release_date,
      popularity: track.popularity,
      explicit: track.explicit,
      isrc: track.external_ids?.isrc,
      spotifyUrl: track.external_urls?.spotify,
      source: 'Spotify'
    }));
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
}

async function getSpotifyTrackDetails(trackId) {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify track details failed: ${response.statusText}`);
    }

    const track = await response.json();

    return {
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album?.name,
      cover: track.album?.images?.[0]?.url,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      releaseDate: track.album?.release_date,
      popularity: track.popularity,
      explicit: track.explicit,
      isrc: track.external_ids?.isrc,
      spotifyUrl: track.external_urls?.spotify,
      source: 'Spotify'
    };
  } catch (error) {
    console.error('Spotify track details error:', error);
    return null;
  }
}

export { searchSpotify, getSpotifyTrackDetails, getSpotifyAccessToken };
