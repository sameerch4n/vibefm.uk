import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import { Track, ViewMode } from '@/types';
import { MusicAPI } from '@/lib/api';
import { MusicCard } from '@/components/MusicCard';
import { cn } from '@/lib/utils';

interface ChartsPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying: boolean;
}

export function ChartsPage({ currentPath, onNavigate, onPlayTrack, onToggleLike, currentTrack, isPlaying }: ChartsPageProps) {
  const [currentCountry, setCurrentCountry] = useState<string>('');
  const [currentChartTracks, setCurrentChartTracks] = useState<Track[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    loadCharts();
  }, []);

  useEffect(() => {
    if (currentPath === '/charts') {
      setCurrentCountry('');
      setCurrentChartTracks([]);
    } else if (currentPath.startsWith('/charts/')) {
      const chartId = currentPath.split('/').pop();
      const countryMap: { [key: string]: string } = {
        'top100-india': 'India',
        'top100-usa': 'USA', 
        'top100-global': 'Global',
        'top100-uk': 'UK',
        'top100-canada': 'Canada',
        'top100-australia': 'Australia',
        'top100-uae': 'UAE'
      };
      
      const country = countryMap[chartId || ''];
      if (country && country !== currentCountry) {
        setCurrentCountry(country);
        // Load tracks for this country
        loadCountryChart(country);
      }
    }
  }, [currentPath, currentCountry]);

  const loadCountryChart = async (country: string) => {
    try {
      setTrackLoading(true);
      const tracks = await MusicAPI.getChartsByCountry(country);
      setCurrentChartTracks(tracks);
    } catch (error) {
      console.error('Failed to load chart tracks:', error);
      setCurrentChartTracks([]);
    } finally {
      setTrackLoading(false);
    }
  };

  const loadCharts = async () => {
    try {
      setLoading(true);
      // Charts data is loaded per country when needed
    } catch (error) {
      console.error('Failed to load charts:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartMetadata = [
    {
      id: 'top100-india',
      name: 'Top 100 India',
      description: 'The most popular songs in India',
      coverUrl: '/assets/chartscovers/top100india.jpg',
      country: 'India',
    },
    {
      id: 'top100-usa',
      name: 'Top 100 US',
      description: 'The most popular songs in the United States', 
      coverUrl: '/assets/chartscovers/top100usa.jpg',
      country: 'USA',
    },
    {
      id: 'top100-global',
      name: 'Top 100 Global',
      description: 'The most popular songs worldwide',
      coverUrl: '/assets/chartscovers/top100global.jpg',
      country: 'Global',
    },
    {
      id: 'top100-uk',
      name: 'Top 100 UK',
      description: 'The most popular songs in the United Kingdom',
      coverUrl: '/assets/chartscovers/top100uk.jpg',
      country: 'UK',
    },
    {
      id: 'top100-canada',
      name: 'Top 100 Canada',
      description: 'The most popular songs in Canada',
      coverUrl: '/assets/chartscovers/top100canada.jpg',
      country: 'Canada',
    },
    {
      id: 'top100-australia',
      name: 'Top 100 Australia',
      description: 'The most popular songs in Australia',
      coverUrl: '/assets/chartscovers/top100australia.jpg',
      country: 'Australia',
    },
    {
      id: 'top100-uae',
      name: 'Top 100 UAE',
      description: 'The most popular songs in the United Arab Emirates',
      coverUrl: '/assets/chartscovers/top100uae.jpg',
      country: 'UAE',
    },
  ];

  const handleChartClick = (country: string) => {
    onNavigate(`/charts/${country}`);
  };

  const handlePlayTrack = useCallback((track: Track) => {
    onPlayTrack(track);
  }, [onPlayTrack]);

  const handleToggleTrackLike = useCallback((track: Track) => {
    onToggleLike(track);
  }, [onToggleLike]);

  const renderGridView = (tracks: Track[]) => (
    <div className="grid-responsive music-card-stable">
      {tracks.map((track, index) => (
        <MusicCard
          key={track.id}
          track={track}
          chartPosition={index + 1}
          isPlaying={currentTrack?.id === track.id && isPlaying}
          onPlay={() => handlePlayTrack(track)}
          onToggleLike={() => handleToggleTrackLike(track)}
        />
      ))}
    </div>
  );

  const renderListView = (tracks: Track[]) => (
    <div className="space-y-2">
      {tracks.map((track, index) => (
        <MusicCard
          key={track.id}
          track={track}
          chartPosition={index + 1}
          isPlaying={currentTrack?.id === track.id && isPlaying}
          compact={true}
          onPlay={() => handlePlayTrack(track)}
          onToggleLike={() => handleToggleTrackLike(track)}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-secondary">Loading charts...</div>
      </div>
    );
  }

  // Chart detail view
  if (currentCountry) {
    const currentChartMeta = chartMetadata.find(c => c.country === currentCountry);
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('/charts')}
              className="p-2 rounded-full bg-surface hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white">{currentChartMeta?.name || currentCountry}</h1>
          </div>
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

        {/* Play All Button */}
        <div className="p-6 border-b border-surface-border">
          <button
            onClick={() => currentChartTracks.length > 0 && onPlayTrack(currentChartTracks[0])}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Play All
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 stable-layout no-layout-shift">
          {trackLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-text-secondary">Loading tracks...</div>
            </div>
          ) : currentChartTracks.length > 0 ? (
            <div className="render-optimized">
              {viewMode === 'grid' ? (
                renderGridView(currentChartTracks)
              ) : (
                renderListView(currentChartTracks)
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-text-secondary">No tracks available</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Charts landing page
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-surface-border">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-surface hover:bg-surface-hover transition-colors disabled:opacity-40">
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 rounded-full bg-surface hover:bg-surface-hover transition-colors disabled:opacity-40">
            <ChevronRight size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Charts</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto stable-layout no-layout-shift">
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 render-optimized">
          {chartMetadata.map((chart) => (
            <button
              key={chart.country}
              onClick={() => handleChartClick(chart.country)}
              className="p-4 bg-surface rounded-lg hover:bg-surface-hover transition-colors group text-left"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-accent/20">
                <img
                  src={chart.coverUrl}
                  alt={chart.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <h3 className="font-semibold text-white mb-1">{chart.name}</h3>
              <p className="text-sm text-text-secondary">{chart.country}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
