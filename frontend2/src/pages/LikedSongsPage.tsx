import { useState, useEffect } from 'react';
import { Grid, List, Heart } from 'lucide-react';
import { Track, ViewMode } from '@/types';
import { storage } from '@/lib/storage';
import { MusicCard } from '@/components/MusicCard';
import { cn } from '@/lib/utils';

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
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'list' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:text-white'
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none p-6 render-optimized">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {likedTracks.map((track) => (
              <MusicCard
                key={track.id}
                track={track}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                onPlay={() => onPlayTrack(track)}
                onToggleLike={() => handleToggleLike(track)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 no-layout-shift">
            {likedTracks.map((track) => (
              <MusicCard
                key={track.id}
                track={track}
                compact={true}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                onPlay={() => onPlayTrack(track)}
                onToggleLike={() => handleToggleLike(track)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
