export class YouTubePlayer {
  private player: any = null;
  private isReady = false;
  private callbacks: { [key: string]: Function[] } = {};

  constructor() {
    this.initializeAPI();
  }

  private initializeAPI() {
    if (typeof window === 'undefined') return;

    // Check if YouTube API is already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      this.createPlayer();
      return;
    }

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback for when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };
  }

  private createPlayer() {
    const playerElement = document.getElementById('youtube-player');
    if (!playerElement) {
      // Create hidden player element
      const div = document.createElement('div');
      div.id = 'youtube-player';
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      div.style.top = '-9999px';
      div.style.width = '1px';
      div.style.height = '1px';
      div.style.opacity = '0';
      div.style.pointerEvents = 'none';
      document.body.appendChild(div);
    }

    this.player = new (window as any).YT.Player('youtube-player', {
      height: '1',
      width: '1',
      events: {
        onReady: () => {
          this.isReady = true;
          this.emit('ready');
        },
        onStateChange: (event: any) => {
          this.handleStateChange(event);
        },
        onError: (event: any) => {
          const errorMessages: { [key: number]: string } = {
            2: 'Invalid video ID',
            5: 'HTML5 player error',
            100: 'Video not found or private',
            101: 'Video owner does not allow embedding',
            150: 'Video owner does not allow embedding'
          };
          const errorMessage = errorMessages[event.data] || `Unknown error: ${event.data}`;
          this.emit('error', { code: event.data, message: errorMessage });
        }
      },
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0
      }
    });
  }

  private handleStateChange(event: any) {
    const YT = (window as any).YT;
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        this.emit('playing');
        break;
      case YT.PlayerState.PAUSED:
        this.emit('paused');
        break;
      case YT.PlayerState.ENDED:
        this.emit('ended');
        break;
      case YT.PlayerState.BUFFERING:
        this.emit('buffering');
        break;
      case YT.PlayerState.CUED:
        this.emit('cued');
        break;
      case YT.PlayerState.UNSTARTED:
        this.emit('unstarted');
        break;
    }
  }

  private emit(event: string, data?: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  async loadVideo(videoId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!videoId) {
        reject(new Error('No video ID provided'));
        return;
      }

      if (!this.isReady || !this.player) {
        this.on('ready', () => {
          try {
            this.player.loadVideoById(videoId);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
        return;
      }

      try {
        this.player.loadVideoById(videoId);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  play() {
    if (this.player && this.isReady) {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.player && this.isReady) {
      this.player.pauseVideo();
    }
  }

  seekTo(seconds: number) {
    if (this.player && this.isReady) {
      this.player.seekTo(seconds);
    }
  }

  getCurrentTime(): number {
    if (this.player && this.isReady) {
      return this.player.getCurrentTime() || 0;
    }
    return 0;
  }

  getDuration(): number {
    if (this.player && this.isReady) {
      return this.player.getDuration() || 0;
    }
    return 0;
  }

  getPlayerState(): number {
    if (this.player && this.isReady) {
      return this.player.getPlayerState();
    }
    return -1;
  }

  isBuffering(): boolean {
    const YT = (window as any).YT;
    return this.getPlayerState() === YT?.PlayerState?.BUFFERING;
  }

  setVolume(volume: number) {
    if (this.player && this.isReady) {
      this.player.setVolume(volume);
    }
  }

  setPlaybackRate(rate: number) {
    if (this.player && this.isReady) {
      this.player.setPlaybackRate(rate);
    }
  }
}

export const youtubePlayerManager = new YouTubePlayer();
