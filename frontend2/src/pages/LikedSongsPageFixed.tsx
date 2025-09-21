import { useState, useEffect } from 'react';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { Track, ViewMode } from '@/types';
import { storage } from '@/lib/storage';
import { cn, formatDuration } from '@/lib/utils';

interface LikedSongsPageProps {
  onPlayTrack: (track: Track) => void;
  onToggleLike: (track: Track) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export function LikedSongsPage({ onPlayTrack, onToggleLike, currentTrack, isPlaying }: LikedSongsPageProps) {
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    loadLikedTracks();
  }, []);

  const loadLikedTracks = () => {
    const tracks = storage.getLikedTracks();
    setLikedTracks(tracks);
  };

  const handleToggleLike = (track: Track) => {
    onToggleLike(track);
    loadLikedTracks(); // Refresh the list
  };

  const GridView = ({ tracks }: { tracks: Track[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="group relative bg-surface border border-surface-border rounded-card p-4 hover-lift transition-all music-card-stable"
        >
          <div className="relative mb-3">
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full aspect-square object-cover rounded-card"
            />
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-card flex items-center justify-center gap-2">
              <button
                onClick={() => onPlayTrack(track)}
                className={cn(
                  "bg-accent hover:bg-accent-hover text-white p-2 rounded-full transition-colors",
                  currentTrack?.id === track.id && isPlaying && "bg-accent-hover"
                )}
              >
                <Play size={16} fill="currentColor" />
              </button>
              <button
                onClick={() => handleToggleLike(track)}
                className="bg-accent text-white p-2 rounded-full transition-colors"
              >
                <Heart size={16} fill="currentColor" />
              </button>
              <button className="bg-surface hover:bg-surface-hover text-white p-2 rounded-full transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white text-sm truncate mb-1">
              {track.title}
            </h3>
            <p className="text-text-secondary text-xs truncate">
              {track.artist}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = ({ tracks }: { tracks: Track[] }) => (
    <div className="space-y-2 no-layout-shift">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={cn(
            "flex items-center gap-4 p-3 rounded-lg hover:bg-surface transition-colors group",
            currentTrack?.id === track.id && isPlaying && "bg-accent/10"
          )}
        >
          <span className="text-text-secondary text-sm w-8">{index + 1}</span>
          <img
            src={track.coverUrl}
            alt={`${track.title} by ${track.artist}`}
            className="w-10 h-10 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{track.title}</h3>
            <p className="text-sm text-text-secondary truncate">{track.artist}</p>
          </div>
          <div className="text-sm text-text-secondary">
            {formatDuration(track.duration)}
          </div>
          <button
            onClick={() => onPlayTrack(track)}
            className="p-2 rounded-full bg-accent text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play size={16} />
          </button>
          <button
            onClick={() => handleToggleLike(track)}
            className="p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart size={16} fill="currentColor" />
          </button>
        </div>
      ))}
    </div>
  );

  if (likedTracks.length === 0) {
    return (
      <div className="h-full flex flex-col stable-layout">
        <div className="flex items-center justify-between p-6 border-b border-surface-border no-layout-shift">
          <h1 className="text-xl font-bold text-white">Liked Songs</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center render-optimized">
          <div className="text-center no-layout-shift">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Liked Songs</h3>
            <p className="text-text-secondary">
              Songs you like will appear here. Start exploring and like some tracks!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col stable-layout">
      <div className="flex items-center justify-between p-6 border-b border-surface-border no-layout-shift">
        <h1 className="text-xl font-bold text-white">
          Liked Songs ({likedTracks.length})
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'grid' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:text-white'
            )}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'list' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:text-white'
            )}
          >
            List
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none p-6 render-optimized">
        {viewMode === 'grid' ? (
          <GridView tracks={likedTracks} />
        ) : (
          <ListView tracks={likedTracks} />
        )}
      </div>
    </div>
  );
}
