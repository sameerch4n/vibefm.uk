import { Track } from '@/types/music';

export class LocalStorage {
  private static LIKED_TRACKS_KEY = 'music-player-liked-tracks';
  private static RECENT_TRACKS_KEY = 'music-player-recent-tracks';
  private static PLAYER_STATE_KEY = 'music-player-state';

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

  // Player state management
  static savePlayerState(state: any): void {
    localStorage.setItem(this.PLAYER_STATE_KEY, JSON.stringify(state));
  }

  static getPlayerState(): any {
    const stored = localStorage.getItem(this.PLAYER_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
