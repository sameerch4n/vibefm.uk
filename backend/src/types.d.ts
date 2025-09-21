export interface SearchOptions {
  limit?: number;
  debounceMs?: number; // used by convenience debounce helper only (frontends)
  country?: string; // iTunes store country, e.g. 'US'
}

export interface TrackSearchItem {
  id: string; // Track ID as string
  title: string;
  artist: string;
  album?: string;
  cover?: string; // artwork url
  durationMs?: number;
  previewUrl?: string;
  source: 'iTunes' | 'Spotify';
}

export interface TrackDetails extends TrackSearchItem {
  releaseDate?: string;
  genre?: string;
  tags?: string[];
}

export interface YouTubeResult {
  id: string; // YouTube video id
  title: string;
  channel?: string;
  durationSec?: number;
}
