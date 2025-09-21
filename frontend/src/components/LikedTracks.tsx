import React from 'react';
import { Heart } from 'lucide-react';
import { TrackCard } from '@/components/TrackCard';
import { Track } from '@/types/music';
import { LocalStorage } from '@/lib/storage';

interface LikedTracksProps {
  onPlay: (track: Track, index: number, playlist: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export function LikedTracks({ onPlay, currentTrack, isPlaying }: LikedTracksProps) {
  const [likedTracks, setLikedTracks] = React.useState<Track[]>([]);

  React.useEffect(() => {
    setLikedTracks(LocalStorage.getLikedTracks());
  }, []);

  const handleToggleLike = () => {
    const updated = LocalStorage.getLikedTracks();
    setLikedTracks(updated);
  };

  if (likedTracks.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Heart className="w-6 h-6 text-red-500" />
          <h1 className="text-3xl font-bold text-foreground">Liked Songs</h1>
        </div>
        
        <div className="text-center py-24">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No liked songs yet</h2>
          <p className="text-muted-foreground">
            Songs you like will appear here. Start exploring music to build your collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center space-x-2 mb-8">
        <Heart className="w-6 h-6 text-red-500" />
        <h1 className="text-3xl font-bold text-foreground">Liked Songs</h1>
        <span className="text-muted-foreground">({likedTracks.length})</span>
      </div>

      <div className="space-y-2">
        {likedTracks.map((track, index) => (
          <TrackCard
            key={`liked-${track.id}`}
            track={track}
            index={index}
            isPlaying={currentTrack?.id === track.id && isPlaying}
            onPlay={(track, index) => onPlay(track, index, likedTracks)}
            onToggleLike={handleToggleLike}
            compact
          />
        ))}
      </div>
    </div>
  );
}
