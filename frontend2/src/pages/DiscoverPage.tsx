import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Music, Flag } from 'lucide-react';
import { Track } from '@/types';
import { MusicCard } from '@/components/MusicCard';
import { MusicAPI } from '@/lib/api';

interface DiscoverPageProps {
  onPlayTrack: (track: Track) => void;
  onToggleLike: (track: Track) => void;
  onNavigate: (path: string) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export function DiscoverPage({ onPlayTrack, onToggleLike, onNavigate, currentTrack, isPlaying }: DiscoverPageProps) {
  const [featuredCharts, setFeaturedCharts] = useState<{ country: string; tracks: Track[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedCharts();
  }, []);

  const loadFeaturedCharts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load top 10 tracks from each chart
      const countries = ['USA', 'India', 'UK', 'Canada', 'Australia', 'UAE', 'Global'];
      const chartPromises = countries.map(async (country) => {
        try {
          const tracks = await MusicAPI.getChartsByCountry(country);
          return { country, tracks: tracks.slice(0, 10) }; // Top 10 from each
        } catch (error) {
          console.error(`Failed to load ${country} chart:`, error);
          return { country, tracks: [] };
        }
      });
      
      const charts = await Promise.all(chartPromises);
      setFeaturedCharts(charts.filter(chart => chart.tracks.length > 0));
    } catch (error) {
      console.error('Failed to load featured charts:', error);
      setError('Failed to load charts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-text-secondary">Loading featured music...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={loadFeaturedCharts}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">{/* Removed bg-background to allow blur effects to show through */}
      {/* Header with Browse Charts Button */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Trending Worldwide</h2>
          <button
            onClick={() => onNavigate('/charts')}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Browse All Charts
          </button>
        </div>
        <div className="mt-2 h-px bg-surface-border"></div>
      </div>

      {/* Regular Grid Layout for Charts (NOT horizontal scroll) */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-2 pb-32 space-y-8">
          {featuredCharts.map((chart) => (
            <section key={chart.country} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center">
                  <Flag className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Top 10 • {chart.country}</h3>
                <div className="flex-1 h-px bg-surface-border" />
                <button className="text-accent hover:text-accent-hover text-sm font-medium transition-colors">
                  View All
                </button>
              </div>

              {/* Regular grid layout */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {chart.tracks.map((track, index) => (
                  <MusicCard
                    key={`${chart.country}-${track.id}-${index}`}
                    track={track}
                    chartPosition={index + 1}
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                    onPlay={() => onPlayTrack(track)}
                    onToggleLike={() => onToggleLike(track)}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Empty State */}
          {featuredCharts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Charts Available</h3>
              <p className="text-text-secondary mb-6">
                We're having trouble loading the charts right now.
              </p>
              <button
                onClick={loadFeaturedCharts}
                className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
