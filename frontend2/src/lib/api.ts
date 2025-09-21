import { Track } from '@/types';

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1504';

export class MusicAPI {
  private static async request(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  static async search(query: string, limit: number = 12): Promise<Track[]> {
    const results = await this.request('/api/search', { q: query, limit: limit.toString() });
    return results.map((track: any) => this.transformTrack(track));
  }

  static async getCharts(): Promise<Record<string, Track[]>> {
    const response = await fetch(`${API_BASE_URL}/api/charts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch charts: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform the data to ensure consistent Track format
    const transformedData: Record<string, Track[]> = {};
    
    for (const [country, tracks] of Object.entries(data)) {
      transformedData[country] = (tracks as any[]).map(track => this.transformTrack(track));
    }
    
    return transformedData;
  }

  static async getChartsByCountry(country: string): Promise<Track[]> {
    const response = await fetch(`${API_BASE_URL}/api/charts/${country}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch charts for ${country}: ${response.statusText}`);
    }
    
    const tracks = await response.json();
    
    // Transform to consistent Track format
    return tracks.map((track: any) => this.transformTrack(track));
  }

  static async getYouTubeVideo(query: string) {
    try {
      // Minimal cleaning - only normalize whitespace
      const cleanQuery = query
        .trim()
        .replace(/\s+/g, ' ') // Only normalize multiple spaces
        .trim();
      
      if (!cleanQuery) {
        throw new Error('Empty search query');
      }

      const result = await this.request('/api/youtube', { q: cleanQuery });
      
      if (!result?.id) {
        throw new Error('No valid YouTube video found');
      }
      
      return result;
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  }

  static async getITunesMetadata(id: string) {
    return this.request(`/api/itunes/${id}`);
  }

  private static transformTrack(apiTrack: any): Track {
    return {
      id: apiTrack.trackId || apiTrack.id || String(Math.random()),
      title: apiTrack.trackName || apiTrack.title || 'Unknown Title',
      artist: apiTrack.artistName || apiTrack.artist || 'Unknown Artist',
      album: apiTrack.collectionName || apiTrack.album || 'Unknown Album',
      coverUrl: apiTrack.artworkUrl100 || apiTrack.cover || '',
      duration: Math.floor((apiTrack.trackTimeMillis || apiTrack.duration || 0) / 1000),
      liked: false,
      previewUrl: apiTrack.previewUrl,
      itunesId: apiTrack.trackId,
      genre: apiTrack.primaryGenreName || apiTrack.genre,
      year: apiTrack.releaseDate ? new Date(apiTrack.releaseDate).getFullYear() : undefined,
    };
  }
}

// Backward compatibility
export const apiClient = MusicAPI;
