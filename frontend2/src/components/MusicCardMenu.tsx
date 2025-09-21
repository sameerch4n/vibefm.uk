import { Plus, ListPlus, Heart, Download, Share } from 'lucide-react';
import { Track } from '@/types';

interface MusicCardMenuProps {
  track: Track;
  isLiked: boolean;
  onClose: () => void;
  onToggleLike: (e: React.MouseEvent) => void;
  onAddToQueue?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
}

export function MusicCardMenu({
  track,
  isLiked,
  onClose,
  onToggleLike,
  onAddToQueue,
  onAddToPlaylist
}: MusicCardMenuProps) {
  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToQueue?.(track);
    onClose();
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToPlaylist?.(track);
    onClose();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    // TODO: Download functionality
    console.log('Download:', track.title);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    // TODO: Share functionality
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Listen to "${track.title}" by ${track.artist} on Vibe FM`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="absolute top-full right-0 mt-1 bg-surface/95 backdrop-blur-md border border-surface-border rounded-lg shadow-xl z-20 py-2 min-w-[180px] overflow-hidden">
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
        onClick={onToggleLike}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-surface-hover transition-colors"
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        {isLiked ? 'Remove from Liked' : 'Add to Liked'}
      </button>
      
      <hr className="my-2 border-surface-border" />
      
      <button
        onClick={handleShare}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-surface-hover transition-colors"
      >
        <Share size={16} />
        Share
      </button>
      
      <button
        onClick={handleDownload}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-surface-hover transition-colors"
      >
        <Download size={16} />
        Download
      </button>
    </div>
  );
}
