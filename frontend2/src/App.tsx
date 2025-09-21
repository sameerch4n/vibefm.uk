import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MiniPlayer } from '@/components/MiniPlayer';
import { FullScreenPlayer } from '@/components/FullScreenPlayer';
import { AuthModal } from '@/components/AuthModal';
import { UserDropdown } from '@/components/UserDropdown';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { SearchPage } from '@/pages/SearchPage';
import { ChartsPage } from '@/pages/ChartsPage';
import { LikedSongsPage } from '@/pages/LikedSongsPage';
import { HotShotPage } from '@/pages/HotShotPage';
import { useNavigation } from '@/hooks/useNavigation';
import { usePlayer } from '@/hooks/usePlayer';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { Track, Playlist } from '@/types';

function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [wasPlayingBeforeHotShot, setWasPlayingBeforeHotShot] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigation = useNavigation();
  const player = usePlayer();
  const auth = useAuth();

  // Optimized search handler to prevent re-renders
  const handleSearchChange = useCallback((value: string) => {
    setGlobalSearchQuery(value);
    
    // Navigate to search page when user starts typing
    if (value.trim() && !navigation.currentView.startsWith('/search')) {
      navigation.navigate('/search');
    }
    // Navigate back when search becomes empty
    else if (!value.trim() && navigation.currentView.startsWith('/search')) {
      navigation.navigate('/discover');
    }
  }, [navigation]);

  // Handle HotShot page navigation - pause mini player when entering, resume when leaving
  useEffect(() => {
    const isOnHotShotPage = navigation.currentView.startsWith('/hotshot');
    
    if (isOnHotShotPage) {
      // Entering HotShot page - pause mini player if it's playing
      if (player.playerState.isPlaying && player.playerState.currentTrack) {
        setWasPlayingBeforeHotShot(true);
        player.togglePlayPause(); // Pause the mini player
        console.log('🎵 HotShot: Paused mini player');
      }
    } else {
      // Leaving HotShot page - resume mini player if it was playing before
      if (wasPlayingBeforeHotShot && player.playerState.currentTrack && !player.playerState.isPlaying) {
        player.togglePlayPause(); // Resume the mini player
        setWasPlayingBeforeHotShot(false);
        console.log('🎵 HotShot: Resumed mini player');
      }
    }
  }, [navigation.currentView, player.playerState.currentTrack?.id]); // Track current view and track changes

  useEffect(() => {
    // Load user data on app start
    setPlaylists(storage.getPlaylists());
  }, []);

  const handleToggleLike = (track: Track) => {
    const isNowLiked = storage.toggleLikedTrack(track);
    // Update track in current player state if it's the same track
    if (player.playerState.currentTrack?.id === track.id) {
      // Update the current track's liked status in player
    }
    return isNowLiked;
  };

  const isTrackLiked = (track: Track) => {
    return storage.isTrackLiked(track.id);
  };

  const renderCurrentPage = () => {
    const { currentView } = navigation;

    if (currentView.startsWith('/discover')) {
      return (
        <DiscoverPage 
          onPlayTrack={player.playTrack} 
          onToggleLike={handleToggleLike}
          onNavigate={navigation.navigate}
          currentTrack={player.playerState.currentTrack}
          isPlaying={player.playerState.isPlaying}
        />
      );
    }

    if (currentView.startsWith('/search')) {
      return (
        <SearchPage 
          onPlayTrack={player.playTrack} 
          onToggleLike={handleToggleLike}
          currentTrack={player.playerState.currentTrack}
          isPlaying={player.playerState.isPlaying}
          globalSearchQuery={globalSearchQuery}
          onSearchQueryChange={setGlobalSearchQuery}
        />
      );
    }

    if (currentView.startsWith('/hotshot')) {
      return (
        <HotShotPage />
      );
    }

    if (currentView.startsWith('/charts')) {
      return <ChartsPage 
        currentPath={currentView} 
        onNavigate={navigation.navigate} 
        onPlayTrack={player.playTrack}
        onToggleLike={handleToggleLike}
        currentTrack={player.playerState.currentTrack}
        isPlaying={player.playerState.isPlaying}
      />;
    }

    if (currentView.startsWith('/library/liked')) {
      return (
        <LikedSongsPage 
          onPlayTrack={player.playTrack} 
          onToggleLike={handleToggleLike}
          currentTrack={player.playerState.currentTrack}
          isPlaying={player.playerState.isPlaying}
        />
      );
    }

    if (currentView.startsWith('/library/playlist/')) {
      // Extract playlist ID and render playlist page
      const playlistId = currentView.split('/').pop();
      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist) {
        // Return playlist component when created
        return <div>Playlist: {playlist.name}</div>;
      }
    }

    if (currentView === '/library/create-playlist') {
      // Show create playlist modal or page
      return <div>Create Playlist</div>;
    }

    // Default fallback
    return (
      <DiscoverPage 
        onPlayTrack={player.playTrack} 
        onToggleLike={handleToggleLike}
        onNavigate={navigation.navigate}
        currentTrack={player.playerState.currentTrack}
        isPlaying={player.playerState.isPlaying}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background text-text-primary stable-layout">
      <div className="flex flex-1 min-h-0 no-layout-shift">
        {/* Common Surface with Album Color Accent */}
        <div 
          className="absolute inset-0 transition-colors duration-500"
          style={{
            background: player.playerState.currentTrack 
              ? `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${player.playerState.currentTrack.coverUrl})`
              : 'var(--bg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl" />
        
        {/* Sidebar Card */}
        <div className="relative z-10 m-1">
          <div 
            className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden h-full"
            style={{
              marginBottom: player.playerState.currentTrack && 
                          !player.playerState.isFullScreen && 
                          !navigation.currentView.startsWith('/hotshot') ? '90px' : '0px',
              transition: 'margin-bottom 0.3s ease'
            }}
          >
            <Sidebar
              currentView={navigation.currentView}
              onNavigate={navigation.navigate}
              playlists={playlists}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 render-optimized relative m-1 ml-0">
          {/* Content Container */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Top Bar with Search and Login */}
            <div className="mb-2 flex items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for music..."
                      value={globalSearchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Login Button / User Dropdown */}
              <div className="flex-shrink-0 relative z-[10000]">
                {auth.isAuthenticated ? (
                  <UserDropdown user={auth.user!} onSignOut={auth.signOut} />
                ) : (
                  <button
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg flex items-center gap-2"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Login
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Card */}
            <div 
              className="flex-1 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
              style={{
                marginBottom: player.playerState.currentTrack && 
                            !player.playerState.isFullScreen && 
                            !navigation.currentView.startsWith('/hotshot') ? '90px' : '0px',
                transition: 'margin-bottom 0.3s ease'
              }}
            >
              <div className="h-full overflow-y-auto overflow-x-hidden overscroll-none no-layout-shift">
                {renderCurrentPage()}
              </div>
            </div>

            {/* Mini Player - Full Width at Bottom */}
            {player.playerState.currentTrack && 
             !player.playerState.isFullScreen && 
             !navigation.currentView.startsWith('/hotshot') && (
              <div className="absolute bottom-1 left-0 right-1">
                <MiniPlayer
                  playerState={player.playerState}
                  onTogglePlayPause={player.togglePlayPause}
                  onPlayNext={player.playNext}
                  onPlayPrevious={player.playPrevious}
                  onSeek={player.seekTo}
                  onVolumeChange={player.setVolume}
                  onToggleLike={handleToggleLike}
                  onToggleFullScreen={player.toggleFullScreen}
                  onShowQueue={() => {}}
                  isLiked={player.playerState.currentTrack ? isTrackLiked(player.playerState.currentTrack) : false}
                  subscribeToProgress={player.subscribeToProgress}
                  subscribeToPlayState={player.subscribeToPlayState}
                  subscribeToBufferingState={player.subscribeToBufferingState}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Player */}
      {player.playerState.currentTrack && player.playerState.isFullScreen && (
        <FullScreenPlayer
          playerState={player.playerState}
          onTogglePlayPause={player.togglePlayPause}
          onPlayNext={player.playNext}
          onPlayPrevious={player.playPrevious}
          onSeek={player.seekTo}
          onVolumeChange={player.setVolume}
          onToggleLike={handleToggleLike}
          onToggleShuffle={player.toggleShuffle}
          onToggleRepeat={player.toggleRepeat}
          onMinimize={player.toggleFullScreen}
          onShowQueue={() => {}}
          isLiked={player.playerState.currentTrack ? isTrackLiked(player.playerState.currentTrack) : false}
          subscribeToProgress={player.subscribeToProgress}
          subscribeToPlayState={player.subscribeToPlayState}
          subscribeToBufferingState={player.subscribeToBufferingState}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={auth.signIn}
        loading={auth.loading}
        error={auth.error}
      />
    </div>
  );
}

export default App;
