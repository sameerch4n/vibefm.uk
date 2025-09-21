import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Shuffle,
  Repeat,
  Heart,
  MoreHorizontal,
  ChevronDown,
  List,
  Loader2,
  Video,
  Music
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { Track, PlayerState } from '@/types';

interface FullScreenPlayerProps {
  playerState: PlayerState;
  onTogglePlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleLike: (track: Track) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onMinimize: () => void;
  onShowQueue: () => void;
  isLiked: boolean;
  subscribeToProgress: (callback: (time: number, duration: number) => void) => () => void;
  subscribeToPlayState: (callback: (isPlaying: boolean) => void) => () => void;
  subscribeToBufferingState: (callback: (isBuffering: boolean) => void) => () => void;
}

export function FullScreenPlayer({
  playerState,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrevious,
  onSeek,
  onVolumeChange,
  onToggleLike,
  onToggleShuffle,
  onToggleRepeat,
  onMinimize,
  onShowQueue,
  isLiked,
  subscribeToProgress,
  subscribeToPlayState,
  subscribeToBufferingState,
}: FullScreenPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [videoPlayer, setVideoPlayer] = useState<any>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [audioWasPlaying, setAudioWasPlaying] = useState(false);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isVideoMode) {
      const unsubscribe = subscribeToProgress((time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      });
      return unsubscribe;
    }
  }, [subscribeToProgress, isVideoMode]);

  useEffect(() => {
    const unsubscribe = subscribeToPlayState((playing) => {
      // In video mode, ignore audio play state changes to avoid conflicts
      if (!isVideoMode) {
        setIsPlaying(playing);
      }
    });
    return unsubscribe;
  }, [subscribeToPlayState, isVideoMode]);

  useEffect(() => {
    const unsubscribe = subscribeToBufferingState((buffering) => {
      setIsBuffering(buffering);
    });
    return unsubscribe;
  }, [subscribeToBufferingState]);

  const { currentTrack, volume, repeat, shuffle } = playerState;

  if (!currentTrack) {
    return null;
  }

  const progressPercentage = duration > 0 
    ? ((isVideoMode ? videoTime : currentTime) / duration) * 100 
    : 0;

  // Update video time every second when in video mode
  useEffect(() => {
    if (!isVideoMode || !videoPlayer) return;
    
    const interval = setInterval(() => {
      try {
        const time = videoPlayer.getCurrentTime();
        setVideoTime(time);
        setCurrentTime(time);
      } catch (e) {
        // ignore
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVideoMode, videoPlayer]);

  // Sync video player with audio play/pause state - simplified
  useEffect(() => {
    if (isVideoMode && videoPlayer) {
      try {
        const YT = (window as any).YT;
        const videoState = videoPlayer.getPlayerState();
        
        // Only sync if there's a clear state mismatch and avoid rapid state changes
        if (isPlaying && videoState === YT.PlayerState.PAUSED) {
          videoPlayer.playVideo();
          setVideoIsPlaying(true);
        } else if (!isPlaying && videoState === YT.PlayerState.PLAYING) {
          videoPlayer.pauseVideo();
          setVideoIsPlaying(false);
        }
      } catch (e) {
        console.log('Video sync error:', e);
      }
    }
  }, [isPlaying, isVideoMode, videoPlayer]);

  // Remove the aggressive audio monitoring - it was causing conflicts
  // When video player becomes ready and we were playing, start video
  useEffect(() => {
    if (isVideoMode && videoPlayer && audioWasPlaying) {
      setAudioWasPlaying(false); // Reset the flag
    }
  }, [videoPlayer, isVideoMode, audioWasPlaying]);

  // Sync video volume with audio volume
  useEffect(() => {
    if (isVideoMode && videoPlayer) {
      try {
        videoPlayer.setVolume(volume * 100);
      } catch (e) {
        // ignore
      }
    }
  }, [volume, isVideoMode, videoPlayer]);

  const createVideoPlayer = () => {
    if (!currentTrack?.youtubeId || !videoContainerRef.current || !(window as any).YT?.Player) {
      return;
    }

    videoContainerRef.current.innerHTML = '';
    
    const playerId = `video-player-${Date.now()}`;
    const playerDiv = document.createElement('div');
    playerDiv.id = playerId;
    playerDiv.style.width = '100%';
    playerDiv.style.height = '100%';
    videoContainerRef.current.appendChild(playerDiv);

    new (window as any).YT.Player(playerId, {
      height: '100%',
      width: '100%',
      videoId: currentTrack.youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        playsinline: 1
      },
      events: {
        onReady: (event: any) => {
          setVideoPlayer(event.target);
          event.target.seekTo(currentTime);
          event.target.setVolume(volume * 100);
          
          // Start video if audio was playing when we switched
          if (audioWasPlaying) {
            setTimeout(() => {
              event.target.playVideo();
              setVideoIsPlaying(true);
              setIsPlaying(true); // Update local state directly
            }, 500);
          }
        },
        onStateChange: (event: any) => {
          const YT = (window as any).YT;
          const newState = event.data;
          
          // Update video playing state for UI
          const isVideoPlaying = newState === YT.PlayerState.PLAYING;
          setVideoIsPlaying(isVideoPlaying);
          
          // In video mode, sync the local playing state with video state
          if (isVideoMode) {
            setIsPlaying(isVideoPlaying);
          }
          
          console.log('Video state changed:', newState, 'isPlaying:', isVideoPlaying);
        }
      }
    });
  };

  const handleModeToggle = () => {
    if (!currentTrack?.youtubeId) return;

    if (isVideoMode) {
      // Switching from video to audio
      let videoCurrentTime = currentTime;
      const wasVideoPlaying = videoPlayer?.getPlayerState() === (window as any).YT?.PlayerState?.PLAYING;
      
      if (videoPlayer) {
        try {
          videoCurrentTime = videoPlayer.getCurrentTime();
          videoPlayer.destroy();
        } catch (e) {
          console.log('Error destroying video:', e);
        }
        setVideoPlayer(null);
        setVideoIsPlaying(false);
      }
      
      setIsVideoMode(false);
      
      // Seek audio to video position and restore play state
      setTimeout(() => {
        onSeek(videoCurrentTime);
        if (wasVideoPlaying) {
          // Force audio to play by updating local state first then calling toggle
          setIsPlaying(false); // Ensure we're in paused state first
          setTimeout(() => {
            onTogglePlayPause(); // This will start audio playback
          }, 200);
        }
      }, 100);
      
    } else {
      // Switching from audio to video
      setAudioWasPlaying(isPlaying);
      
      // Pause audio first
      if (isPlaying) {
        onTogglePlayPause();
      }
      
      setIsVideoMode(true);
      setVideoIsPlaying(false);
      setTimeout(createVideoPlayer, 400);
    }
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (isVideoMode && videoPlayer) {
      try {
        videoPlayer.seekTo(newTime);
        setVideoTime(newTime);
        setCurrentTime(newTime);
      } catch (e) {
        // ignore
      }
    } else {
      onSeek(newTime);
    }
  };

  const handlePlayPause = () => {
    if (isVideoMode && videoPlayer) {
      // In video mode, control ONLY the video player
      try {
        const YT = (window as any).YT;
        const videoState = videoPlayer.getPlayerState();
        
        if (videoState === YT.PlayerState.PLAYING) {
          videoPlayer.pauseVideo();
          setVideoIsPlaying(false);
          setIsPlaying(false); // Update local state directly
        } else {
          videoPlayer.playVideo();
          setVideoIsPlaying(true);
          setIsPlaying(true); // Update local state directly
        }
        
        // Don't call onTogglePlayPause in video mode to avoid conflicts
      } catch (e) {
        console.error('Video control error:', e);
      }
    } else {
      // In audio mode, control the audio player
      onTogglePlayPause();
    }
  };

  const handleMinimize = () => {
    // If we're in video mode, perform background state transfer before minimizing
    if (isVideoMode && videoPlayer) {
      try {
        let videoCurrentTime = currentTime;
        const wasVideoPlaying = videoPlayer.getPlayerState() === (window as any).YT?.PlayerState?.PLAYING;
        
        // Get current video time
        videoCurrentTime = videoPlayer.getCurrentTime();
        
        console.log('Transferring video state to audio in background:', { videoCurrentTime, wasVideoPlaying });
        
        // Immediately minimize the fullscreen player to avoid visible state transfer
        onMinimize();
        
        // Perform state transfer in background after minimizing
        setTimeout(() => {
          // Destroy video player
          videoPlayer.destroy();
          setVideoPlayer(null);
          setVideoIsPlaying(false);
          setIsVideoMode(false);
          
          // Transfer state to audio player
          onSeek(videoCurrentTime);
          if (wasVideoPlaying) {
            // If video was playing, make sure audio starts playing
            setIsPlaying(false); // Reset state first
            setTimeout(() => {
              onTogglePlayPause(); // Start audio playback
            }, 100);
          }
        }, 50); // Small delay to ensure minimize happens first
        
      } catch (error) {
        console.error('Error during video state transfer:', error);
        onMinimize();
      }
    } else {
      // No video mode, just minimize normally
      onMinimize();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Background with album art */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ 
          backgroundImage: `url(${currentTrack.coverUrl})`,
          filter: 'blur(60px) brightness(0.4) saturate(1.2)'
        }}
      />
      
      <div className="absolute inset-0 bg-black/40" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10">
        <button
          onClick={handleMinimize}
          className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-lg font-semibold text-white">Now Playing</h2>
        <div className="flex items-center space-x-2">
          {currentTrack?.youtubeId && (
            <button
              onClick={handleModeToggle}
              className={cn(
                "p-2 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors",
                isVideoMode ? "text-accent bg-white/20" : "text-white/70"
              )}
              title={isVideoMode ? "Switch to Audio" : "Switch to Video"}
            >
              {isVideoMode ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={onShowQueue}
            className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors"
          >
            <List className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 space-y-8">
        {/* Album Cover / Video Player */}
        <div className="relative">
          {!isVideoMode ? (
            <div className="relative">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-72 h-72 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl pointer-events-none" />
            </div>
          ) : (
            <div className="relative">
              <div
                ref={videoContainerRef}
                className="w-[600px] h-[337px] md:w-[720px] md:h-[405px] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20"
                style={{ aspectRatio: '16/9' }}
              />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {currentTrack.title}
          </h1>
          <p className="text-lg text-white/80">
            {currentTrack.artist}
          </p>
          {currentTrack.album && (
            <p className="text-sm text-white/60">
              {currentTrack.album}
            </p>
          )}
        </div>

        {/* Progress Section */}
        <div className="w-full max-w-md space-y-3">
          <div 
            className="relative h-2 bg-white/30 rounded-full cursor-pointer group"
            onClick={handleSeekClick}
          >
            <div
              className="h-full rounded-full transition-all duration-100 relative overflow-hidden bg-accent"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 w-4 h-4 bg-accent rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
          <div className="flex justify-between text-sm text-white/80">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 md:space-x-6">
          <button
            onClick={onToggleShuffle}
            className={cn(
              "p-3 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors",
              shuffle ? "text-accent bg-white/20" : "text-white/70"
            )}
          >
            <Shuffle className="w-5 h-5" />
          </button>
          
          <button
            onClick={onPlayPrevious}
            className="p-3 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-4 rounded-full bg-white text-black hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
            disabled={isBuffering}
          >
            {isBuffering ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (isVideoMode ? videoIsPlaying : isPlaying) ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>
          
          <button
            onClick={onPlayNext}
            className="p-3 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
          >
            <SkipForward className="w-6 h-6" />
          </button>
          
          <button
            onClick={onToggleRepeat}
            className={cn(
              "p-3 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors",
              repeat !== 'none' ? "text-accent bg-white/20" : "text-white/70"
            )}
          >
            <Repeat className="w-5 h-5" />
            {repeat === 'one' && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={() => onToggleLike(currentTrack)}
            className={cn(
              "p-2 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors",
              isLiked ? "text-accent" : "text-white/70"
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          </button>
          
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-white/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-white/30 rounded-full appearance-none cursor-pointer slider"
            />
          </div>
          
          <button className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors text-white/70">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hidden YouTube Player */}
      <div id="youtube-player-fullscreen" className="hidden" />
    </div>
  );
}
