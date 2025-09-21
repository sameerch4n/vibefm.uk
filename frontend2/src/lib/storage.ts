import { Track, Playlist, SavedPlayerState } from '@/types';

export class LocalStorage {
  private static LIKED_TRACKS_KEY = 'music-player-liked-tracks';
  private static RECENT_TRACKS_KEY = 'music-player-recent-tracks';
  private static PLAYER_STATE_KEY = 'music-player-state';
  private static PLAYLISTS_KEY = 'vibefm_playlists';
  private static VIEW_MODE_KEY = 'vibefm_view_mode';
  private static LAST_SEARCH_KEY = 'vibefm_last_search';

  // Liked tracks management
  static getLikedTracks(): Track[] {
    const stored = localStorage.getItem(this.LIKED_TRACKS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static addLikedTrack(track: Track): void {
    const liked = this.getLikedTracks();
    const exists = liked.find(t => t.id === track.id);
    if (!exists) {
      liked.unshift(track);
      localStorage.setItem(this.LIKED_TRACKS_KEY, JSON.stringify(liked));
    }
  }

  static removeLikedTrack(trackId: string): void {
    const liked = this.getLikedTracks();
    const filtered = liked.filter(t => t.id !== trackId);
    localStorage.setItem(this.LIKED_TRACKS_KEY, JSON.stringify(filtered));
  }

  static isTrackLiked(trackId: string): boolean {
    const liked = this.getLikedTracks();
    return liked.some(t => t.id === trackId);
  }

  static toggleLikedTrack(track: Track): boolean {
    const isCurrentlyLiked = this.isTrackLiked(track.id);
    if (isCurrentlyLiked) {
      this.removeLikedTrack(track.id);
      return false;
    } else {
      this.addLikedTrack(track);
      return true;
    }
  }

  // Recent tracks management
  static getRecentTracks(): Track[] {
    const stored = localStorage.getItem(this.RECENT_TRACKS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static addRecentTrack(track: Track): void {
    const recent = this.getRecentTracks();
    // Remove if already exists
    const filtered = recent.filter(t => t.id !== track.id);
    // Add to beginning
    filtered.unshift(track);
    // Keep only last 50 tracks
    const limited = filtered.slice(0, 50);
    localStorage.setItem(this.RECENT_TRACKS_KEY, JSON.stringify(limited));
  }

  // Playlists
  static getPlaylists(): Playlist[] {
    try {
      const stored = localStorage.getItem(this.PLAYLISTS_KEY);
      const playlists = stored ? JSON.parse(stored) : [];
      // Convert date strings back to Date objects
      return playlists.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch {
      return [];
    }
  }

  static savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(this.PLAYLISTS_KEY, JSON.stringify(playlists));
    } catch (error) {
      console.error('Failed to save playlists:', error);
    }
  }

  static createPlaylist(name: string, description?: string): Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    playlists.push(newPlaylist);
    this.savePlaylists(playlists);
    return newPlaylist;
  }

  static updatePlaylist(id: string, updates: Partial<Playlist>): Playlist | null {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex(p => p.id === id);
    
    if (index >= 0) {
      playlists[index] = {
        ...playlists[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.savePlaylists(playlists);
      return playlists[index];
    }
    
    return null;
  }

  static deletePlaylist(id: string): boolean {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex(p => p.id === id);
    
    if (index >= 0) {
      playlists.splice(index, 1);
      this.savePlaylists(playlists);
      return true;
    }
    
    return false;
  }

  static addTrackToPlaylist(playlistId: string, track: Track): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (playlist && !playlist.tracks.some(t => t.id === track.id)) {
      playlist.tracks.push(track);
      playlist.updatedAt = new Date();
      this.savePlaylists(playlists);
      return true;
    }
    
    return false;
  }

  static removeTrackFromPlaylist(playlistId: string, trackId: string): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (playlist) {
      const trackIndex = playlist.tracks.findIndex(t => t.id === trackId);
      if (trackIndex >= 0) {
        playlist.tracks.splice(trackIndex, 1);
        playlist.updatedAt = new Date();
        this.savePlaylists(playlists);
        return true;
      }
    }
    
    return false;
  }

  // View preferences
  static getViewMode(): 'grid' | 'list' {
    return localStorage.getItem(this.VIEW_MODE_KEY) as 'grid' | 'list' || 'grid';
  }

  static setViewMode(mode: 'grid' | 'list'): void {
    localStorage.setItem(this.VIEW_MODE_KEY, mode);
  }

  // Search
  static getLastSearch(): string {
    return localStorage.getItem(this.LAST_SEARCH_KEY) || '';
  }

  static setLastSearch(query: string): void {
    localStorage.setItem(this.LAST_SEARCH_KEY, query);
  }

  // Player state management
  static savePlayerState(state: SavedPlayerState): void {
    localStorage.setItem(this.PLAYER_STATE_KEY, JSON.stringify(state));
  }

  static getPlayerState(): SavedPlayerState | null {
    const stored = localStorage.getItem(this.PLAYER_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}

// Export as singleton for consistency with original frontend
export const storage = LocalStorage;
