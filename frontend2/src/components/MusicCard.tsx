import { useState, useEffect, memo, useCallback } from 'react';
import { Heart, Play, Pause, MoreHorizontal, Trophy } from 'lucide-react';
import { Track } from '@/types';
import { storage } from '@/lib/storage';
import { cn, formatDuration } from '@/lib/utils';
import { MusicCardMenu } from './MusicCardMenu';

interface MusicCardProps {
  track: Track;
  isPlaying?: boolean;
  onPlay: () => void;
  onToggleLike?: () => void;
  onAddToQueue?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  compact?: boolean;
  chartPosition?: number;
  showMenu?: boolean;
}

export function MusicCard({ 
  track, 
  isPlaying = false, 
  onPlay, 
  onToggleLike,
  onAddToQueue,
  onAddToPlaylist,
  compact = false,
  chartPosition,
  showMenu = true
}: MusicCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);

  useEffect(() => {
    setIsLiked(storage.isTrackLiked(track.id));
  }, [track.id]);

  // Debounce the isPlaying state to prevent flickering
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLocalIsPlaying(isPlaying);
    }, 50); // Small delay to avoid rapid state changes

    return () => clearTimeout(timeout);
  }, [isPlaying]);

  const handleToggleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    storage.toggleLikedTrack(track);
    setIsLiked(!isLiked);
    onToggleLike?.();
  }, [track, isLiked, onToggleLike]);

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay();
  }, [onPlay]);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  }, [showDropdown]);

  const defaultCover = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAyMkMyNiAyMC44OTU0IDI2Ljg5NTQgMjAgMjggMjBIMzZDMzcuMTA0NiAyMCAzOCAyMC44OTU0IDM4IDIyVjI0SDI2VjIyWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjQgMjZDMjQgMjQuODk1NCAyNC44OTU0IDI0IDI2IDI0SDM4QzM5LjEwNDYgMjQgNDAgMjQuODk1NCA0MCAyNlY0MEg0MFY0MkMyNCA0Mi4yMDkxIDI0IDQyIDI0IDQyVjI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';

  if (compact) {
    return (
      <div
        className={cn(
          "relative flex items-center space-x-4 p-4 rounded-2xl overflow-hidden cursor-pointer group transition-colors duration-300 will-change-transform",
          localIsPlaying && "ring-2 ring-accent/50 border-accent/30"
        )}
        onClick={onPlay}
      >
        {/* Background Image with Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ 
            backgroundImage: `url(${track.coverUrl || defaultCover})`,
            filter: 'blur(30px) brightness(0.4) saturate(1.5)'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
        
        {/* Content */}
        <div className="relative flex items-center space-x-4 w-full">
          {chartPosition && (
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold flex-shrink-0 shadow-lg",
              chartPosition <= 3 
                ? "bg-gradient-to-br from-yellow-400/90 to-orange-500/90 text-white" 
                : "bg-black/60 text-white border border-white/20"
            )}>
              {chartPosition <= 3 ? <Trophy className="w-5 h-5" /> : chartPosition}
            </div>
          )}
          
          <div className="relative flex-shrink-0">
            <img
              src={track.coverUrl || defaultCover}
              alt={track.title}
              className="w-16 h-16 rounded-xl object-cover shadow-lg will-change-transform"
            />
            {localIsPlaying && (
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-1 h-3 bg-accent rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white truncate drop-shadow-sm">{track.title}</p>
            <p className="text-sm text-gray-300 truncate drop-shadow-sm">{track.artist}</p>
            {track.duration > 0 && (
              <p className="text-xs text-gray-400 mt-1 drop-shadow-sm">{formatDuration(track.duration)}</p>
            )}
          </div>
          
          {showMenu && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleToggleLike}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors border border-white/20"
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
              </button>
              
              <div className="relative">
                <button
                  onClick={handleMenuClick}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors border border-white/20"
                >
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </button>
                
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <MusicCardMenu
                      track={track}
                      isLiked={isLiked}
                      onClose={() => setShowDropdown(false)}
                      onToggleLike={handleToggleLike}
                      onAddToQueue={onAddToQueue}
                      onAddToPlaylist={onAddToPlaylist}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-[#181818] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group overflow-hidden relative will-change-transform",
        localIsPlaying && "ring-2 ring-accent/50"
      )}
    >
      {/* Chart Position Badge */}
      {chartPosition && (
        <div className="absolute top-3 left-3 z-30 pointer-events-none">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold shadow-lg transition-none",
            chartPosition <= 3 
              ? "bg-gradient-to-br from-yellow-400/90 to-orange-500/90 text-white" 
              : "bg-black/60 text-white border border-white/20"
          )}>
            {chartPosition <= 3 ? <Trophy className="w-4 h-4" /> : chartPosition}
          </div>
        </div>
      )}

      {/* Album Cover Section (~70% height) */}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-xl cursor-pointer" onClick={onPlay}>
        <img
          src={track.coverUrl || defaultCover}
          alt={track.title}
          className="w-full h-full object-cover will-change-transform"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Genre and Year Tags */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            {track.genre && (
              <span className="text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white/90 border border-white/20">
                {track.genre}
              </span>
            )}
            {track.year && (
              <span className="text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white/90 border border-white/20">
                {track.year}
              </span>
            )}
          </div>
        </div>
        
        {/* Static Play Button Overlay - Always Present */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={handlePlay}
            className="w-16 h-16 rounded-full bg-accent/90 text-white hover:bg-accent hover:scale-105 transition-all duration-200 shadow-xl flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 pointer-events-auto"
          >
            {localIsPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </button>
        </div>

        {/* Playing Indicator */}
        {localIsPlaying && (
          <div className="absolute top-3 right-3 z-30 pointer-events-none">
            <div className="flex space-x-1 bg-black/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20 shadow-lg transition-none">
              <div className="w-1 h-4 bg-accent rounded-full animate-pulse" />
              <div className="w-1 h-5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>
      
      {/* Drawer/Extension Section */}
      <div className="relative rounded-b-xl overflow-hidden">
        {/* Background Image with Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ 
            backgroundImage: `url(${track.coverUrl || defaultCover})`,
            filter: 'blur(30px) brightness(0.6) saturate(1.5)'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Content */}
        <div className="relative p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate drop-shadow-sm">{track.title}</p>
              <p className="text-xs text-gray-300 truncate drop-shadow-sm">{track.artist}</p>
              {track.duration > 0 && (
                <p className="text-xs text-gray-400 mt-1 drop-shadow-sm">{formatDuration(track.duration)}</p>
              )}
            </div>
          
          {showMenu && (
            <div className="flex items-start gap-2 flex-shrink-0">
              <button
                onClick={handleToggleLike}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors border border-white/20"
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
              </button>
              
              <div className="relative">
                <button
                  onClick={handleMenuClick}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors border border-white/20"
                >
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </button>
                
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <MusicCardMenu
                      track={track}
                      isLiked={isLiked}
                      onClose={() => setShowDropdown(false)}
                      onToggleLike={handleToggleLike}
                      onAddToQueue={onAddToQueue}
                      onAddToPlaylist={onAddToPlaylist}
                    />
                  </>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const MemoizedMusicCard = memo(MusicCard);
