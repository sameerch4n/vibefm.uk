import React, { useState, useEffect, memo } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart,
  List,
  Maximize2,
  Loader2
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { Track, PlayerState } from '@/types';

interface MiniPlayerProps {
  playerState: PlayerState;
  onTogglePlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleLike: (track: Track) => void;
  onToggleFullScreen: () => void;
  onShowQueue: () => void;
  isLiked: boolean;
  subscribeToProgress: (callback: (time: number, duration: number) => void) => () => void;
  subscribeToPlayState: (callback: (isPlaying: boolean) => void) => () => void;
  subscribeToBufferingState: (callback: (isBuffering: boolean) => void) => () => void;
}

export const MiniPlayer = memo(function MiniPlayer({
  playerState,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrevious,
  onSeek,
  onVolumeChange,
  onToggleLike,
  onToggleFullScreen,
  onShowQueue,
  isLiked,
  subscribeToProgress,
  subscribeToPlayState,
  subscribeToBufferingState
}: MiniPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  useEffect(() => {
    const unsubscribe = subscribeToProgress((time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    });
    return unsubscribe;
  }, [subscribeToProgress]);

  useEffect(() => {
    const unsubscribe = subscribeToPlayState((playing) => {
      setIsPlaying(playing);
    });
    return unsubscribe;
  }, [subscribeToPlayState]);

  useEffect(() => {
    const unsubscribe = subscribeToBufferingState((buffering) => {
      setIsBuffering(buffering);
    });
    return unsubscribe;
  }, [subscribeToBufferingState]);

  const { currentTrack, volume } = playerState;

  if (!currentTrack) {
    return null;
  }

  const progressPercentage = duration > 0 
    ? (currentTime / duration) * 100 
    : 0;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  return (
    <div className="relative overflow-hidden player-container">
      {/* Content */}
      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 stable-layout">
        <div className="flex items-center justify-between max-w-full render-optimized">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-11 h-11 rounded-card object-cover shadow-lg ring-1 ring-white/20"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-white text-sm truncate">
                {currentTrack.title}
              </div>
              <div className="text-text-secondary text-xs truncate">
                {currentTrack.artist}
              </div>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={onPlayPrevious}
            className="text-white hover:text-accent transition-colors p-1"
          >
            <SkipBack size={18} />
          </button>
          
          <button
            onClick={onTogglePlayPause}
            className="text-white hover:text-accent transition-colors p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 relative"
            disabled={isBuffering}
          >
            {isBuffering ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>
          
          <button
            onClick={onPlayNext}
            className="text-white hover:text-accent transition-colors p-1"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Seek Bar */}
        <div className="flex-1 mx-6 min-w-0">
          <div
            onClick={handleSeekClick}
            className={cn(
              "h-1 bg-white/30 rounded-full cursor-pointer relative group",
              isBuffering && "opacity-80"
            )}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all group-hover:bg-accent-hover relative overflow-hidden",
                isBuffering 
                  ? "bg-gradient-to-r from-orange-400 to-yellow-500" 
                  : "bg-accent"
              )}
              style={{ width: `${progressPercentage}%` }}
            >
              {isBuffering && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              )}
            </div>
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
            />
            {isBuffering && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/20 to-transparent animate-ping" />
            )}
          </div>
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => onToggleLike(currentTrack)}
            className={cn(
              'transition-colors p-1',
              isLiked ? 'text-accent' : 'text-white hover:text-accent'
            )}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={onShowQueue}
            className="text-white hover:text-accent transition-colors p-1"
          >
            <List size={18} />
          </button>

          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-white" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer slider"
            />
          </div>

          <button
            onClick={onToggleFullScreen}
            className="text-white hover:text-accent transition-colors p-1"
          >
            <Maximize2 size={18} />
          </button>
        </div>
        </div>
      </div>

      {/* Hidden YouTube Player */}
      <div id="youtube-player" className="hidden" />
    </div>
  );
});
