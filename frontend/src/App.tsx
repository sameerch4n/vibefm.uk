import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SearchAndCharts } from '@/components/SearchAndCharts';
import { LikedTracks } from '@/components/LikedTracks';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Track } from '@/types/music';
import { MusicAPI } from '@/lib/api';
import { LocalStorage } from '@/lib/storage';
import { YouTubePlayer } from '@/lib/youtube-player';

function App() {
  // UI State
  const [activeTab, setActiveTab] = React.useState<'home' | 'search' | 'liked'>('home');
  const [isPlayerExpanded, setIsPlayerExpanded] = React.useState(false);

  // Player State
  const [currentTrack, setCurrentTrack] = React.useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = React.useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(100);
  const [isShuffled, setIsShuffled] = React.useState(false);
  const [repeatMode, setRepeatMode] = React.useState<'none' | 'one' | 'all'>('none');

  // YouTube Player
  const [youtubePlayer] = React.useState(() => new YouTubePlayer());

  // Initialize YouTube player events
  React.useEffect(() => {
    youtubePlayer.on('play', () => {
      setIsPlaying(true);
      startProgressTracking();
    });

    youtubePlayer.on('pause', () => {
      setIsPlaying(false);
      stopProgressTracking();
    });

    youtubePlayer.on('ended', () => {
      setIsPlaying(false);
      stopProgressTracking();
      // Auto-play next track
      handleNext();
    });

    youtubePlayer.on('error', (error: any) => {
      console.error('YouTube player error:', error);
      setIsPlaying(false);
    });

    return () => {
      stopProgressTracking();
    };
  }, []);

  // Progress tracking
  const progressIntervalRef = React.useRef<number | null>(null);

  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      const current = youtubePlayer.getCurrentTime();
      const total = youtubePlayer.getDuration();
      setCurrentTime(current);
      setDuration(total);
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Play track
  const handlePlay = async (track: Track, index: number, playlist: Track[]) => {
    try {
      // Find YouTube video
      const query = `${track.title} ${track.artist}`;
      const youtubeData = await MusicAPI.getYouTubeVideo(query);
      
      if (!youtubeData.id) {
        console.error('Could not find track on YouTube');
        return;
      }

      const trackWithYoutube = { ...track, youtubeId: youtubeData.id };

      // Update state
      setCurrentTrack(trackWithYoutube);
      setCurrentPlaylist(playlist);
      setCurrentIndex(index);

      // Load and play video
      await youtubePlayer.loadVideo(youtubeData.id);
      
      // Add to recent tracks
      LocalStorage.addRecentTrack(trackWithYoutube);
      
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  // Player controls
  const handlePlayPause = () => {
    if (isPlaying) {
      youtubePlayer.pause();
    } else {
      youtubePlayer.play();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevTrack = currentPlaylist[currentIndex - 1];
      handlePlay(prevTrack, currentIndex - 1, currentPlaylist);
    }
  };

  const handleNext = () => {
    let nextIndex = currentIndex + 1;
    
    if (repeatMode === 'one') {
      nextIndex = currentIndex;
    } else if (repeatMode === 'all' && nextIndex >= currentPlaylist.length) {
      nextIndex = 0;
    }
    
    if (nextIndex < currentPlaylist.length) {
      const nextTrack = currentPlaylist[nextIndex];
      handlePlay(nextTrack, nextIndex, currentPlaylist);
    }
  };

  const handleSeek = (time: number) => {
    youtubePlayer.seekTo(time);
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    youtubePlayer.setVolume(newVolume);
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    // TODO: Implement shuffle logic
  };

  const handleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const handleRewind = () => {
    const newTime = Math.max(0, currentTime - 10);
    handleSeek(newTime);
  };

  const handleForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    handleSeek(newTime);
  };

  const handleToggleLike = () => {
    if (!currentTrack) return;
    
    if (LocalStorage.isTrackLiked(currentTrack.id)) {
      LocalStorage.removeLikedTrack(currentTrack.id);
    } else {
      LocalStorage.addLikedTrack(currentTrack);
    }
  };

  const isLiked = currentTrack ? LocalStorage.isTrackLiked(currentTrack.id) : false;

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
      case 'search':
        return (
          <SearchAndCharts
            onPlay={handlePlay}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
          />
        );
      case 'liked':
        return (
          <LikedTracks
            onPlay={handlePlay}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {renderContent()}
      </div>

      {/* Music Player */}
      {currentTrack && (
        <MusicPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          isExpanded={isPlayerExpanded}
          onPlay={handlePlayPause}
          onPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onShuffle={handleShuffle}
          onRepeat={handleRepeat}
          onExpand={() => setIsPlayerExpanded(true)}
          onMinimize={() => setIsPlayerExpanded(false)}
          onRewind={handleRewind}
          onForward={handleForward}
          onToggleLike={handleToggleLike}
          isLiked={isLiked}
        />
      )}
    </div>
  );
}

export default App;
