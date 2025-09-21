export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  duration?: number;
  youtubeId?: string;
  source?: string;
  releaseDate?: string;
  genre?: string;
  durationMs?: number;
  previewUrl?: string;
}

export interface PlaylistState {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

export interface SearchResult {
  tracks: Track[];
  total: number;
}

export interface ChartData {
  [country: string]: Track[];
}
