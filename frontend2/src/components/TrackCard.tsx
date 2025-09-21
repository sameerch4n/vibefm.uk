import { useState, useEffect } from 'react';
import { Heart, Play, Pause, MoreHorizontal, Trophy, Plus, ListPlus, Download } from 'lucide-react';
import { Track } from '@/types';
import { storage } from '@/lib/storage';
import { cn, formatDuration } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  isPlaying?: boolean;
  onPlay: () => void;
  onToggleLike?: () => void;
  onAddToQueue?: (track: Track) => void;
  compact?: boolean;
  chartPosition?: number;
}

export function TrackCard({ 
  track, 
  isPlaying = false, 
  onPlay, 
  onToggleLike,
  onAddToQueue,
  compact = false,
  chartPosition
}: TrackCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setIsLiked(storage.isTrackLiked(track.id));
  }, [track.id]);

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    storage.toggleLikedTrack(track);
    setIsLiked(!isLiked);
    onToggleLike?.();
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    // TODO: Open playlist selector modal
    console.log('Add to playlist:', track.title);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onAddToQueue?.(track);
    console.log('Added to queue:', track.title);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    // TODO: Download functionality
    console.log('Download:', track.title);
  };

  const MenuDropdown = () => (
    <div className="absolute top-full right-0 mt-1 bg-background border border-surface-border rounded-lg shadow-2xl z-20 py-2 min-w-[180px] backdrop-blur-sm">
      <button
        onClick={handleAddToQueue}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-surface-hover transition-colors"
      >
        <Plus size={16} />
        Add to Queue
      </button>
      <button
        onClick={handleAddToPlaylist}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-surface-hover transition-colors"
      >
        <ListPlus size={16} />
        Add to Playlist
      </button>
      <button
        onClick={handleToggleLike}
        className={cn(
          "flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors",
          isLiked ? "text-accent hover:bg-accent/10" : "text-white hover:bg-surface-hover"
        )}
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        {isLiked ? 'Remove from Liked' : 'Add to Liked'}
      </button>
      <hr className="my-1 border-surface-border" />
      <button
        onClick={handleDownload}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-surface-hover transition-colors"
      >
        <Download size={16} />
        Download
      </button>
    </div>
  );

  const defaultCover = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAyMkMyNiAyMC44OTU0IDI2Ljg5NTQgMjAgMjggMjBIMzZDMzcuMTA0NiAyMCAzOCAyMC44OTU0IDM4IDIyVjI0SDI2VjIyWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjQgMjZDMjQgMjQuODk1NCAyNC44OTU0IDI0IDI2IDI0SDM4QzM5LjEwNDYgMjQgNDAgMjQuODk1NCA0MCAyNlY0MEg0MFY0MkMyNCA0Mi4yMDkxIDI0IDQyIDI0IDQyVjI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3 rounded-xl hover:bg-surface transition-all duration-200 cursor-pointer group border border-transparent hover:border-surface-border",
          isPlaying && "bg-accent/10 border-accent/30"
        )}
        onClick={onPlay}
      >
        {chartPosition && (
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold flex-shrink-0",
            chartPosition <= 3 
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg" 
              : "bg-surface text-text-secondary"
          )}>
            {chartPosition <= 3 ? <Trophy className="w-4 h-4" /> : chartPosition}
          </div>
        )}
        <div className="relative flex-shrink-0">
          <img
            src={track.coverUrl || defaultCover}
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
          <p className="text-sm font-semibold text-white truncate">{track.title}</p>
          <p className="text-xs text-text-secondary truncate">{track.artist}</p>
        </div>
        <button
          onClick={handleToggleLike}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-hover"
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className={cn(
        "bg-surface border border-surface-border rounded-card p-4 hover:bg-surface-hover transition-all duration-300 cursor-pointer hover:shadow-xl",
        isPlaying && "bg-accent/10 border-accent/30"
      )}>
        {/* Chart Position Badge */}
        {chartPosition && (
          <div className="absolute -top-2 -left-2 z-10">
            <div className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-lg",
              chartPosition <= 3 
                ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" 
                : "bg-gradient-to-br from-accent to-accent-hover text-white"
            )}>
              {chartPosition <= 3 ? <Trophy className="w-3 h-3" /> : chartPosition}
            </div>
          </div>
        )}

        <div className="relative mb-4 overflow-hidden rounded-lg">
          <img
            src={track.coverUrl || defaultCover}
            alt={track.title}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 transition-transform shadow-xl flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
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
          <h3 className="font-semibold text-white truncate text-sm leading-tight">{track.title}</h3>
          <p className="text-sm text-text-secondary truncate">{track.artist}</p>
          {track.album && (
            <p className="text-xs text-text-secondary/70 truncate">{track.album}</p>
          )}
          
          {/* Genre and Year Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {track.genre && (
              <span className="text-xs bg-surface-hover px-2 py-1 rounded-full text-text-secondary border border-surface-border">
                {track.genre}
              </span>
            )}
            {track.year && (
              <span className="text-xs bg-surface-hover px-2 py-1 rounded-full text-text-secondary border border-surface-border">
                {track.year}
              </span>
            )}
          </div>
          
          {track.duration > 0 && (
            <p className="text-xs text-text-secondary/70">{formatDuration(track.duration)}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleToggleLike}
            className="h-9 w-9 hover:bg-surface transition-colors rounded-full flex items-center justify-center"
          >
            <Heart className={cn("w-4 h-4 transition-colors", isLiked && "fill-red-500 text-red-500")} />
          </button>
          
          <div className="relative">
            <button 
              onClick={handleMenuClick}
              className="h-9 w-9 hover:bg-surface transition-colors rounded-full flex items-center justify-center"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <MenuDropdown />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
