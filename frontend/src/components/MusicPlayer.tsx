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
  Maximize2,
  ChevronDown,
  RotateCcw,
  RotateCw,
  Calendar,
  Music2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track } from '@/types/music';
import { formatTime, cn, getTrackMetadata } from '@/lib/utils';

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isExpanded: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onExpand: () => void;
  onMinimize: () => void;
  onRewind: () => void;
  onForward: () => void;
  onToggleLike: () => void;
  isLiked: boolean;
}

export function MusicPlayer({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isShuffled,
  repeatMode,
  isExpanded,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onShuffle,
  onRepeat,
  onExpand,
  onMinimize,
  onRewind,
  onForward,
  onToggleLike,
  isLiked
}: MusicPlayerProps) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const defaultCover = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAyMkMyNiAyMC44OTU0IDI2Ljg5NTQgMjAgMjggMjBIMzZDMzcuMTA0NiAyMCAzOCAyMC44OTU0IDM4IDIyVjI0SDI2VjIyWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjQgMjZDMjQgMjQuODk1NCAyNC44OTU0IDI0IDI2IDI0SDM4QzM5LjEwNDYgMjQgNDAgMjQuODk1NCA0MCAyNlY0MEg0MFY0MkMyNCA0Mi4yMDkxIDI0IDQyIDI0IDQyVjI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  
  const metadata = currentTrack ? getTrackMetadata(currentTrack) : null;

  if (!currentTrack) {
    return null;
  }

  // Bottom player bar - more compact and polished
  if (!isExpanded) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 z-50">
        {/* Progress Bar - at the very top */}
        <div className="h-1 bg-muted/30 relative group cursor-pointer" 
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const percent = (e.clientX - rect.left) / rect.width;
               onSeek(percent * duration);
             }}>
          <div
            className="h-full bg-primary transition-all duration-100 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-0 w-3 h-3 bg-primary rounded-full transform translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0 max-w-sm">
            <div className="relative">
              <img
                src={currentTrack.cover || defaultCover}
                alt={currentTrack.title}
                className="w-14 h-14 rounded-lg object-cover shadow-lg"
              />
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <div className="flex space-x-0.5">
                    <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
                    <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleLike}
              className="h-9 w-9 hover:bg-accent/50 transition-colors"
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="h-9 w-9 hover:bg-accent/50 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={isPlaying ? onPause : onPlay}
              className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="h-9 w-9 hover:bg-accent/50 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExpand}
              className="h-9 w-9 hover:bg-accent/50 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Controls */}
          <div className="hidden lg:flex items-center space-x-3 min-w-0 max-w-sm">
            <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 max-w-24">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded player - redesigned
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-accent/10 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="hover:bg-accent/50"
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
        <h2 className="text-lg font-semibold">Now Playing</h2>
        <Button variant="ghost" size="icon" className="hover:bg-accent/50">
          <MoreHorizontal className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-8">
        {/* Album Cover */}
        <div className="relative">
          <img
            src={currentTrack.cover || defaultCover}
            alt={currentTrack.title}
            className="w-72 h-72 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl" />
        </div>

        {/* Track Info */}
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {currentTrack.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {currentTrack.artist}
          </p>
          {currentTrack.album && (
            <p className="text-sm text-muted-foreground/70">
              {currentTrack.album}
            </p>
          )}
          
          {/* Metadata */}
          {metadata && (metadata.genre || metadata.year) && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {metadata.genre && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  <Music2 className="w-3 h-3" />
                  <span>{metadata.genre}</span>
                </span>
              )}
              {metadata.year && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-accent/30 text-accent-foreground rounded-full text-sm">
                  <Calendar className="w-3 h-3" />
                  <span>{metadata.year}</span>
                </span>
              )}
              {metadata.duration && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm">
                  <Clock className="w-3 h-3" />
                  <span>{metadata.duration}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="w-full max-w-md space-y-3">
          <div className="relative h-2 bg-muted/30 rounded-full cursor-pointer group"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const percent = (e.clientX - rect.left) / rect.width;
                 onSeek(percent * duration);
               }}>
            <div
              className="h-full bg-primary rounded-full transition-all duration-100 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 w-4 h-4 bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 md:space-x-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onShuffle}
            className={cn("h-10 w-10 hover:bg-accent/50", isShuffled && "text-primary bg-accent/30")}
          >
            <Shuffle className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="h-12 w-12 hover:bg-accent/50"
          >
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRewind}
            className="h-10 w-10 hover:bg-accent/50"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={isPlaying ? onPause : onPlay}
            className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105 shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onForward}
            className="h-10 w-10 hover:bg-accent/50"
          >
            <RotateCw className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="h-12 w-12 hover:bg-accent/50"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRepeat}
            className={cn("h-10 w-10 hover:bg-accent/50", repeatMode !== 'none' && "text-primary bg-accent/30")}
          >
            <Repeat className="w-5 h-5" />
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-center space-x-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleLike}
            className="hover:bg-accent/50"
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-red-500 text-red-500")} />
          </Button>
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-24 h-1 bg-muted/30 rounded-full appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
