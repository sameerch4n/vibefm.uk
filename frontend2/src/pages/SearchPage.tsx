import { useState, useEffect, useCallback } from 'react';
import { Grid, List } from 'lucide-react';
import { Track, ViewMode } from '@/types';
import { MusicAPI } from '@/lib/api';
import { MusicCard } from '@/components/MusicCard';
import { storage } from '@/lib/storage';
import { debounce, cn } from '@/lib/utils';

interface SearchPageProps {
  onPlayTrack: (track: Track) => void;
  onToggleLike: (track: Track) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  globalSearchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export function SearchPage({ onPlayTrack, onToggleLike, currentTrack, isPlaying, globalSearchQuery }: SearchPageProps) {
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Debounced search function - reduced delay for faster results
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim()) {
        try {
          setLoading(true);
          const searchResults = await MusicAPI.search(searchQuery, 20);
          setResults(searchResults);
          storage.setLastSearch(searchQuery);
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 150), // Even faster response
    []
  );

  useEffect(() => {
    // Use global search query if provided
    if (globalSearchQuery !== undefined) {
      // Show loading immediately when query changes for better UX
      if (globalSearchQuery.trim() && globalSearchQuery !== storage.getLastSearch()) {
        setLoading(true);
      }
      debouncedSearch(globalSearchQuery);
    } else {
      // Load last search query
      const lastQuery = storage.getLastSearch();
      if (lastQuery) {
        debouncedSearch(lastQuery);
      }
    }

    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [globalSearchQuery, debouncedSearch]);

  const renderGridView = (tracks: Track[]) => (
    <div className="grid-responsive music-card-stable p-2">
      {tracks.map((track) => (
        <MusicCard
          key={track.id}
          track={track}
          isPlaying={currentTrack?.id === track.id && isPlaying}
          onPlay={() => onPlayTrack(track)}
          onToggleLike={() => onToggleLike(track)}
        />
      ))}
    </div>
  );

  const renderListView = (tracks: Track[]) => (
    <div className="space-y-2">
      {tracks.map((track) => (
        <MusicCard
          key={track.id}
          track={track}
          compact={true}
          isPlaying={currentTrack?.id === track.id && isPlaying}
          onPlay={() => onPlayTrack(track)}
          onToggleLike={() => onToggleLike(track)}
        />
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-surface-border">
        <h1 className="text-xl font-bold text-white">Search</h1>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 stable-layout no-layout-shift">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <div className="text-text-secondary">Searching...</div>
          </div>
        ) : globalSearchQuery && results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-secondary mb-2">No results found</div>
            <div className="text-text-tertiary text-sm">
              Try searching with different keywords
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="render-optimized">
            {viewMode === 'grid' ? (
              renderGridView(results)
            ) : (
              renderListView(results)
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-text-secondary mb-2">Start searching</div>
            <div className="text-text-tertiary text-sm">
              Find your favorite songs, artists, and albums
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
