import React from 'react';
import { Search, Music, TrendingUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrackCard } from '@/components/TrackCard';
import { Track, ChartData } from '@/types/music';
import { MusicAPI } from '@/lib/api';
import { debounce } from '@/lib/utils';

interface SearchAndChartsProps {
  onPlay: (track: Track, index: number, playlist: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export function SearchAndCharts({ onPlay, currentTrack, isPlaying }: SearchAndChartsProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Track[]>([]);
  const [charts, setCharts] = React.useState<ChartData>({});
  const [selectedCountry, setSelectedCountry] = React.useState('USA');
  const [isSearching, setIsSearching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);
      try {
        const results = await MusicAPI.search(query, 16);
        setSearchResults(results);
      } catch (err) {
        setError('Search failed. Make sure the server is running.');
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Load charts on mount
  React.useEffect(() => {
    const loadCharts = async () => {
      try {
        const chartsData = await MusicAPI.getCharts();
        setCharts(chartsData);
      } catch (err) {
        setError('Failed to load charts.');
        console.error('Charts error:', err);
      }
    };

    loadCharts();
  }, []);

  // Handle search input change
  React.useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const currentCharts = charts[selectedCountry] || [];
  const availableCountries = Object.keys(charts);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8 pb-32">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Discover Music
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">Find your next favorite song</p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 h-14 text-base bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl focus:bg-card focus:border-primary/50 transition-all"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-center bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold text-foreground">Search Results</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
              {searchResults.map((track, index) => (
                <TrackCard
                  key={`search-${track.id}-${index}`}
                  track={track}
                  index={index}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  onPlay={(track, index) => onPlay(track, index, searchResults)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Charts Section */}
        <section className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold text-foreground">Top Charts</h2>
              <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            {availableCountries.length > 0 && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-card/50 text-foreground px-4 py-2.5 rounded-xl border border-border/50 focus:border-primary/50 focus:bg-card transition-colors backdrop-blur-sm text-sm"
              >
                {availableCountries.map((country) => (
                  <option key={country} value={country} className="bg-card">
                    {country}
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentCharts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
              {currentCharts.slice(0, 20).map((track, index) => (
                <TrackCard
                  key={`chart-${track.id}-${index}`}
                  track={track}
                  index={index}
                  chartPosition={index + 1}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  onPlay={(track, index) => onPlay(track, index, currentCharts)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Music className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-lg">No charts available</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Check back later for trending music</p>
            </div>
          )}
        </section>

        {/* Empty State for Search */}
        {!searchResults.length && !searchQuery && !isSearching && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Musical Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Search for your favorite artists, albums, or songs to begin discovering amazing music.
            </p>
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90 px-8 py-2 rounded-xl"
              onClick={() => document.querySelector('input')?.focus()}
            >
              Start Searching
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
