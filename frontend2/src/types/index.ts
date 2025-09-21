export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  liked: boolean;
  previewUrl?: string;
  youtubeId?: string;
  spotifyId?: string;
  itunesId?: string;
  genre?: string;
  year?: number;
}

export interface Chart {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  country: string;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  tracks: Track[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  queue: Track[];
  currentIndex: number;
  isFullScreen: boolean;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
  isBuffering: boolean;
}

export interface SavedPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  currentIndex: number;
  isFullScreen: boolean;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
}

export interface NavigationState {
  currentView: string;
  history: string[];
  historyIndex: number;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'rank' | 'title' | 'artist' | 'duration';
export type SortDirection = 'asc' | 'desc';

export interface ChartRegion {
  id: string;
  name: string;
  country: string;
  coverUrl: string;
}

export interface ApiTrack {
  trackId: string;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  trackTimeMillis: number;
  previewUrl?: string;
  trackViewUrl?: string;
}

export interface ApiChart {
  feed: {
    results: ApiTrack[];
  };
}
