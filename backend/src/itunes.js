// iTunes Search API helpers
// Docs: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

async function getItunesDetailsById(trackId, { country = 'US' } = {}) {
  const url = new URL('https://itunes.apple.com/lookup');
  url.searchParams.set('id', trackId);
  url.searchParams.set('entity', 'song');
  url.searchParams.set('country', country);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`iTunes lookup failed: ${res.status}`);
  const data = await res.json();
  const r = (data.results || [])[0];
  if (!r) return null;

  return {
    id: String(r.trackId),
    title: r.trackName,
    artist: r.artistName,
    album: r.collectionName,
    cover: r.artworkUrl100?.replace('100x100', '512x512') || r.artworkUrl60,
    durationMs: r.trackTimeMillis,
    previewUrl: r.previewUrl,
    releaseDate: r.releaseDate,
    genre: r.primaryGenreName,
    source: 'iTunes',
  };
}

// Get top charts from iTunes - returns flat array for compatibility
async function getTopCharts({ country = 'us', limit = 20 } = {}) {
  try {
    let url;
    if (country.toLowerCase() === 'in') {
      // For India, fetch Bollywood charts
      url = `https://itunes.apple.com/in/rss/topsongs/limit=50/json`;
    } else {
      url = `https://itunes.apple.com/${country}/rss/topsongs/limit=50/json`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`iTunes RSS failed: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const tracks = data.feed?.entry || [];
    
    return tracks.slice(0, limit).map(track => {
      // Get the highest quality image available and enhance it
      let coverUrl = track['im:image']?.[2]?.label || track['im:image']?.[1]?.label || track['im:image']?.[0]?.label || '';
      
      // Enhance image quality by replacing size parameters
      if (coverUrl) {
        // Replace common low-res sizes with high-res
        coverUrl = coverUrl
          .replace(/55x55bb/g, '512x512bb')
          .replace(/60x60bb/g, '512x512bb')
          .replace(/170x170bb/g, '512x512bb')
          .replace(/100x100bb/g, '512x512bb');
      }
      
      return {
        id: track.id?.attributes?.['im:id'] || Math.random().toString(),
        title: track['im:name']?.label || 'Unknown',
        artist: track['im:artist']?.label || 'Unknown Artist',
        album: track['im:collection']?.['im:name']?.label || 'Unknown Album',
        cover: coverUrl,
        previewUrl: track.link?.[1]?.attributes?.href || '',
        iTunesUrl: track.link?.[0]?.attributes?.href || '',
        releaseDate: track['im:releaseDate']?.label || '',
        price: track['im:price']?.label || '',
        genre: track.category?.attributes?.label || '',
        source: 'iTunes'
      };
    });
  } catch (error) {
    console.error('Error fetching iTunes top charts:', error);
    return [];
  }
}

// Get top charts by regions - returns object with regions
async function getTopChartsByRegions() {
  try {
    const regions = [
      { name: 'USA', code: 'us' },
      { name: 'India', code: 'in' },
      { name: 'UK', code: 'gb' },
      { name: 'Canada', code: 'ca' },
      { name: 'Australia', code: 'au' },
      { name: 'UAE', code: 'ae' },
      { name: 'Global', code: 'us' } // Use US as global for now
    ];

    const results = {};
    
    for (const region of regions) {
      console.log(`Fetching charts for ${region.name}...`);
      const tracks = await getTopCharts({ country: region.code, limit: 100 });
      results[region.name] = tracks;
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching iTunes top charts by regions:', error);
    return {};
  }
}

export { getItunesDetailsById, getTopCharts, getTopChartsByRegions };
