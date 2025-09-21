import { Track } from '@/types';

// Channel types for HotShot clips
export type ChannelType = 
  // Top Hits
  | 'hindi' | 'english' | 'punjabi' | 'tamil' | 'telugu' | 'bhojpuri' | 'haryanvi' | 'arabic'
  // Mood & Genres  
  | 'hotviral' | 'romance' | 'dancefloor' | 'workout' | 'chill' | 'edmhits' | 'instrumental' | 'motivational' | 'bhakti';

// Channel metadata for UI
export interface ChannelInfo {
  id: ChannelType;
  name: string;
  category: 'tophits' | 'mood';
  jsonFile: string;
  emoji: string;
  color: string;
}

// Channel configuration
export const CHANNELS: Record<ChannelType, ChannelInfo> = {
  // Top Hits
  hindi: { id: 'hindi', name: 'Hindi', category: 'tophits', jsonFile: '/vibefm_hindi_pop.json', emoji: '🇮🇳', color: 'from-orange-500 to-red-500' },
  english: { id: 'english', name: 'English', category: 'tophits', jsonFile: '/vibefm_english_pop.json', emoji: '🇺🇸', color: 'from-blue-500 to-purple-500' },
  punjabi: { id: 'punjabi', name: 'Punjabi', category: 'tophits', jsonFile: '/vibepunjabi.json', emoji: '🎵', color: 'from-yellow-500 to-orange-500' },
  tamil: { id: 'tamil', name: 'Tamil', category: 'tophits', jsonFile: '/vibetamil.json', emoji: '🌴', color: 'from-green-500 to-teal-500' },
  telugu: { id: 'telugu', name: 'Telugu', category: 'tophits', jsonFile: '/vibetelugu.json', emoji: '🎭', color: 'from-purple-500 to-pink-500' },
  bhojpuri: { id: 'bhojpuri', name: 'Bhojpuri', category: 'tophits', jsonFile: '/vibebhojpuri.json', emoji: '🥳', color: 'from-red-500 to-pink-500' },
  haryanvi: { id: 'haryanvi', name: 'Haryanvi', category: 'tophits', jsonFile: '/vibeharayanvi.json', emoji: '💪', color: 'from-amber-500 to-yellow-500' },
  arabic: { id: 'arabic', name: 'Arabic', category: 'tophits', jsonFile: '/vibearabic.json', emoji: '🕌', color: 'from-emerald-500 to-cyan-500' },
  
  // Mood & Genres
  hotviral: { id: 'hotviral', name: 'Hot Viral', category: 'mood', jsonFile: '/vibehotviral.json', emoji: '🔥', color: 'from-red-500 to-orange-500' },
  romance: { id: 'romance', name: 'Romance', category: 'mood', jsonFile: '/viberomance.json', emoji: '💕', color: 'from-pink-500 to-rose-500' },
  dancefloor: { id: 'dancefloor', name: 'Dance Floor', category: 'mood', jsonFile: '/vibedancefloor.json', emoji: '🕺', color: 'from-purple-500 to-blue-500' },
  workout: { id: 'workout', name: 'Workout', category: 'mood', jsonFile: '/vibeworkout.json', emoji: '💪', color: 'from-orange-500 to-red-500' },
  chill: { id: 'chill', name: 'Chill', category: 'mood', jsonFile: '/vibechill.json', emoji: '😌', color: 'from-blue-500 to-cyan-500' },
  edmhits: { id: 'edmhits', name: 'EDM Hits', category: 'mood', jsonFile: '/vibeedmhits.json', emoji: '🎛️', color: 'from-cyan-500 to-blue-500' },
  instrumental: { id: 'instrumental', name: 'Instrumental', category: 'mood', jsonFile: '/vibeinstrumental.json', emoji: '🎼', color: 'from-indigo-500 to-purple-500' },
  motivational: { id: 'motivational', name: 'Motivational', category: 'mood', jsonFile: '/vibemotivation.json', emoji: '⚡', color: 'from-yellow-500 to-orange-500' },
  bhakti: { id: 'bhakti', name: 'Devotional', category: 'mood', jsonFile: '/vibebhakti.json', emoji: '🙏', color: 'from-amber-500 to-orange-500' },
};

export interface PlaylistConfig {
  videos: Array<{
    position: number;
    id: string;
    title: string;
    url: string;
    webpage_url: string;
    duration: number;
    view_count: number;
    uploader: string;
  }>;
  settings: {
    defaultQuality: string;
    shuffleEnabled: boolean;
    clipDuration: number;
    preloadCount: number;
  };
  lastUpdated: string;
}

export interface HotShotClip {
  id: string;
  track: Track;
  startTime: number;
  endTime: number;
  videoId: string;
  confidence: number;
  source: 'playlist';
}

class PlaylistService {
  private static instance: PlaylistService;
  private config: PlaylistConfig | null = null;
  
  static getInstance(): PlaylistService {
    if (!PlaylistService.instance) {
      PlaylistService.instance = new PlaylistService();
    }
    return PlaylistService.instance;
  }

  /**
   * Load playlist configuration from JSON file based on channel
   */
  async loadConfig(channel: ChannelType = 'hindi'): Promise<PlaylistConfig> {
    try {
      const channelInfo = CHANNELS[channel];
      const fileName = channelInfo.jsonFile;
      console.log(`📋 Loading ${channelInfo.name.toUpperCase()} playlist configuration from ${fileName}...`);
      
      const response = await fetch(fileName);
      if (!response.ok) {
        throw new Error(`Failed to load ${channelInfo.name} config: ${response.status}`);
      }
      
      this.config = await response.json();
      console.log(`✅ ${channelInfo.name.toUpperCase()} Playlist config loaded:`, this.config);
      return this.config!;
    } catch (error) {
      console.error(`❌ Failed to load ${CHANNELS[channel].name} playlist config:`, error);
      throw error;
    }
  }

  /**
   * Extract artist name from video title
   */
  private extractArtistFromTitle(title: string): string {
    // Common patterns: "Artist - Song", "Song by Artist", "Artist: Song"
    const patterns = [
      /^([^-]+)\s*-\s*(.+)$/,
      /^(.+)\s+by\s+([^(]+)/i,
      /^([^:]+):\s*(.+)$/
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'Unknown Artist';
  }

  /**
   * Load video IDs from JSON playlist data based on channel
   */
  async createClips(channel: ChannelType = 'hindi'): Promise<HotShotClip[]> {
    try {
      const channelInfo = CHANNELS[channel];
      console.log(`🎬 Loading clips from ${channelInfo.name.toUpperCase()} JSON playlist data`);
      
      const config = await this.loadConfig(channel);
      
      // Check if the config has the videos array you added
      if (!config.videos || !Array.isArray(config.videos)) {
        throw new Error(`No videos array found in ${channelInfo.name} JSON config`);
      }
      
      console.log(`📍 Found ${config.videos.length} videos in ${channelInfo.name.toUpperCase()} playlist JSON`);
      
      const clips: HotShotClip[] = [];
      
      // Create clips from actual playlist videos
      for (let i = 0; i < config.videos.length; i++) {
        const video = config.videos[i];
        
        // Extract artist from title (format: "Artist - Song" or just use uploader)
        const title = video.title;
        const artist = video.uploader || this.extractArtistFromTitle(title);
        
        const clip: HotShotClip = {
          id: `clip-${video.id}-${i}`,
          track: {
            id: video.id,
            title: title,
            artist: artist,
            album: `${channelInfo.name} HotShot Playlist`,
            duration: video.duration || 180,
            coverUrl: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
            genre: 'Music',
            liked: false
          },
          startTime: 30, // Start 30 seconds in
          endTime: Math.min(30 + config.settings.clipDuration, video.duration || 180), // Use clip duration setting
          videoId: video.id, // Real video ID from playlist
          confidence: 0.95,
          source: 'playlist'
        };
        clips.push(clip);
      }
      
      // Shuffle if enabled in config
      if (config.settings.shuffleEnabled) {
        console.log(`🔀 Shuffling ${channelInfo.name.toUpperCase()} playlist clips...`);
        this.shuffleArray(clips);
      }
      
      console.log(`✅ Created ${clips.length} clips from ${channelInfo.name.toUpperCase()} playlist with 5-clip preloading`);
      return clips;
      
    } catch (error) {
      console.error(`💥 Failed to load ${CHANNELS[channel].name} playlist clips:`, error);
      throw error;
    }
  }

  /**
   * Shuffle array in place
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Get configuration settings from YOUR JSON - with advanced preloading
   */
  getSettings() {
    const defaultSettings = {
      defaultQuality: '480p',
      shuffleEnabled: true,
      clipDuration: 30,
      preloadCount: 5, // Preload 5 clips initially
      preloadAhead: 5, // Always keep 5 clips ahead loaded
      preloadBehind: 5 // Always keep 5 clips behind loaded
    };
    
    return this.config?.settings ? { ...defaultSettings, ...this.config.settings } : defaultSettings;
  }

  /**
   * Get preload indices for flawless playback (5 ahead + 5 behind)
   */
  getPreloadIndices(currentIndex: number, totalClips: number): number[] {
    const indices: number[] = [];
    const settings = this.getSettings();
    
    // Add current clip
    indices.push(currentIndex);
    
    // Add next 5 clips (ahead)
    for (let i = 1; i <= settings.preloadAhead; i++) {
      const nextIndex = (currentIndex + i) % totalClips;
      indices.push(nextIndex);
    }
    
    // Add previous 5 clips (behind) 
    for (let i = 1; i <= settings.preloadBehind; i++) {
      const prevIndex = (currentIndex - i + totalClips) % totalClips;
      indices.push(prevIndex);
    }
    
    return [...new Set(indices)]; // Remove duplicates
  }
}

export const playlistService = PlaylistService.getInstance();