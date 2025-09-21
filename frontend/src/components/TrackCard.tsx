import React from 'react';
import { Heart, Play, Pause, MoreHorizontal, Trophy, Calendar, Music2, Clock } from 'lucide-react';
import { Track } from '@/types/music';
import { Button } from '@/components/ui/button';
import { LocalStorage } from '@/lib/storage';
import { cn, getTrackMetadata } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  index: number;
  isPlaying?: boolean;
  onPlay: (track: Track, index: number) => void;
  onToggleLike?: (track: Track) => void;
  compact?: boolean;
  chartPosition?: number;
}

export function TrackCard({ 
  track, 
  index, 
  isPlaying = false, 
  onPlay, 
  onToggleLike,
  compact = false,
  chartPosition
}: TrackCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);

  React.useEffect(() => {
    setIsLiked(LocalStorage.isTrackLiked(track.id));
  }, [track.id]);

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      LocalStorage.removeLikedTrack(track.id);
    } else {
      LocalStorage.addLikedTrack(track);
    }
    setIsLiked(!isLiked);
    onToggleLike?.(track);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(track, index);
  };

  const defaultCover = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAyMkMyNiAyMC44OTU0IDI2Ljg5NTQgMjAgMjggMjBIMzZDMzcuMTA0NiAyMCAzOCAyMC44OTU0IDM4IDIyVjI0SDI2VjIyWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjQgMjZDMjQgMjQuODk1NCAyNC44OTU0IDI0IDI2IDI0SDM4QzM5LjEwNDYgMjQgNDAgMjQuODk1NCA0MCAyNlY0MEg0MFY0MkMyNCA0Mi4yMDkxIDI0IDQyIDI0IDQyVjI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  
  const metadata = getTrackMetadata(track);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 cursor-pointer group border border-transparent hover:border-border/50",
          isPlaying && "bg-primary/10 border-primary/30"
        )}
        onClick={() => onPlay(track, index)}
      >
        {chartPosition && (
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold flex-shrink-0",
            chartPosition <= 3 
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg" 
              : "bg-muted text-muted-foreground"
          )}>
            {chartPosition <= 3 ? <Trophy className="w-4 h-4" /> : chartPosition}
          </div>
        )}
        <div className="relative flex-shrink-0">
          <img
            src={track.cover || defaultCover}
            alt={track.title}
            className="w-12 h-12 rounded-lg object-cover shadow-md"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
              <div className="flex space-x-0.5">
                <div className="w-1 h-2 bg-white rounded-full animate-pulse" />
                <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{track.title}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
          {(metadata.genre || metadata.year) && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground/70 mt-0.5">
              {metadata.genre && (
                <span className="flex items-center space-x-1">
                  <Music2 className="w-3 h-3" />
                  <span>{metadata.genre}</span>
                </span>
              )}
              {metadata.year && (
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{metadata.year}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleLike}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
        </Button>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className={cn(
        "bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-4 hover:bg-card/60 hover:border-border/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-primary/5",
        isPlaying && "bg-primary/5 border-primary/30"
      )}>
        {/* Chart Position Badge */}
        {chartPosition && (
          <div className="absolute -top-2 -left-2 z-10">
            <div className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-lg",
              chartPosition <= 3 
                ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" 
                : "bg-gradient-to-br from-primary to-accent text-white"
            )}>
              {chartPosition <= 3 ? <Trophy className="w-3 h-3" /> : chartPosition}
            </div>
          </div>
        )}

        <div className="relative mb-4 overflow-hidden rounded-xl">
          <img
            src={track.cover || defaultCover}
            alt={track.title}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="default"
              size="icon"
              onClick={handlePlay}
              className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 transition-transform shadow-xl"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
          </div>

          {/* Playing Indicator */}
          {isPlaying && (
            <div className="absolute top-3 right-3">
              <div className="flex space-x-1 bg-black/50 rounded-full px-2 py-1">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="space-y-1.5">
          <h3 className="font-semibold text-foreground truncate text-sm leading-tight">{track.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          {track.album && (
            <p className="text-xs text-muted-foreground/70 truncate">{track.album}</p>
          )}
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mt-2">
            {metadata.genre && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-accent/30 text-accent-foreground rounded-md text-xs">
                <Music2 className="w-3 h-3" />
                <span>{metadata.genre}</span>
              </span>
            )}
            {metadata.year && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-md text-xs">
                <Calendar className="w-3 h-3" />
                <span>{metadata.year}</span>
              </span>
            )}
            {metadata.duration && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-muted/50 text-muted-foreground rounded-md text-xs">
                <Clock className="w-3 h-3" />
                <span>{metadata.duration}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleLike}
            className="h-9 w-9 hover:bg-accent/50 transition-colors"
          >
            <Heart className={cn("w-4 h-4 transition-colors", isLiked && "fill-red-500 text-red-500")} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-accent/50 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
