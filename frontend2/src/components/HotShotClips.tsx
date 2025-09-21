import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { playlistService, HotShotClip, ChannelType, CHANNELS } from '@/lib/playlist-service';

// YouTube API type declarations
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface HotShotClipsProps {}

const HotShotClips: React.FC<HotShotClipsProps> = () => {
  // State
  const [clips, setClips] = useState<HotShotClip[]>([]);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [previousClipIndex, setPreviousClipIndex] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('hindi'); // Channel selection
  const [isPlaying, setIsPlaying] = useState(true); // Always start in playing state
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  // YouTube player state
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [isYoutubeReady, setIsYoutubeReady] = useState(false);
  
  // Refs
  const touchStartY = useRef(0);
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize clips from top charts - AGGRESSIVE PRELOADING
  useEffect(() => {
    initializeClips(selectedChannel);
    loadYouTubeAPI();
  }, []);

  // Handle channel switching - COMPLETE RESET like opening page for first time  
  const switchToChannel = async (newChannel: ChannelType) => {
    if (newChannel !== selectedChannel) {
      setSelectedChannel(newChannel);
      await handleChannelSwitch(newChannel);
    }
  };

  // Preload clips AGGRESSIVELY when YouTube is ready
  useEffect(() => {
    if (isYoutubeReady && clips.length > 0) {
      console.log(`🚀 YouTube ready - starting initial preloading for ${selectedChannel.toUpperCase()}...`);
      
      // Load the first video immediately when YouTube is ready
      loadCurrentVideo();
      
      // Then start preloading
      preloadInitialClips();
    }
  }, [isYoutubeReady, clips.length, selectedChannel]); // Added selectedChannel dependency

  // Load current video when clip index changes
  useEffect(() => {
    if (isYoutubeReady && clips.length > 0) {
      console.log(`🎬 Loading clip ${currentClipIndex} for ${selectedChannel.toUpperCase()} channel`);
      loadCurrentVideo();
      
      // Preload surrounding clips (5 ahead + 5 behind)
      preloadSurroundingClips();
    }
  }, [currentClipIndex]);

  // Backup mechanism to ensure first clip loops - triggers when everything is ready
  useEffect(() => {
    if (youtubePlayer && clips.length > 0 && currentClipIndex === 0) {
      console.log(`🔧 BACKUP: Ensuring first ${selectedChannel.toUpperCase()} clip looping is active...`);
      
      // Multiple aggressive attempts to ensure looping starts for first clip
      const ensureLooping = () => {
        console.log(`🚨 AGGRESSIVE BACKUP: Force starting loop for first ${selectedChannel.toUpperCase()} clip`);
        startLooping();
        
        // Also ensure the video is playing
        if (youtubePlayer && youtubePlayer.getPlayerState) {
          const state = youtubePlayer.getPlayerState();
          if (state !== window.YT.PlayerState.PLAYING) {
            console.log(`🎵 BACKUP: Force playing first ${selectedChannel.toUpperCase()} clip`);
            youtubePlayer.playVideo();
          }
        }
      };
      
      // Check immediately
      setTimeout(ensureLooping, 500);
      // Check again after 1.5 seconds
      setTimeout(ensureLooping, 1500);
      // Check again after 3 seconds
      setTimeout(ensureLooping, 3000);
      // Final check after 5 seconds
      setTimeout(ensureLooping, 5000);
    }
  }, [youtubePlayer, clips.length, currentClipIndex, selectedChannel]); // Added selectedChannel dependency

    // Initial preloading of first 5 clips when HotShot page opens
  const preloadInitialClips = async () => {
    if (clips.length === 0) return;
    
    const settings = playlistService.getSettings();
    const preloadCount = Math.min(settings.preloadCount, clips.length);
    
    console.log(`� INITIAL PRELOAD: Loading first ${preloadCount} clips for HotShot page opening...`);
    
    const preloadPromises = clips.slice(0, preloadCount).map(async (clip, index) => {
      try {
        if (clip.videoId) {
          await preloadClip(clip);
          console.log(`✅ Initial preload ${index + 1}/${preloadCount}: ${clip.track.title}`);
        }
      } catch (error) {
        console.error(`❌ Failed to initial preload clip ${index + 1}:`, error);
      }
    });
    
    await Promise.allSettled(preloadPromises);
    console.log(`🎯 INITIAL PRELOAD COMPLETE - First ${preloadCount} clips ready for flawless playback!`);
  };

  // Load YouTube API
  const loadYouTubeAPI = () => {
    if (window.YT && window.YT.Player) {
      console.log('🎬 YouTube API already loaded, setting ready state');
      setIsYoutubeReady(true);
      return;
    }

    console.log('🎬 Loading YouTube API...');
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    
    window.onYouTubeIframeAPIReady = () => {
      console.log('🎬 YouTube API ready');
      setIsYoutubeReady(true);
    };
    
    document.head.appendChild(script);
  };

  // Advanced preloading: 5 ahead + 5 behind current clip
  const preloadSurroundingClips = async () => {
    if (clips.length === 0) return;
    
    // Get preload indices from playlist service (5 ahead + 5 behind + current)
    const preloadIndices = playlistService.getPreloadIndices(currentClipIndex, clips.length);
    
    console.log(`🚀 Preloading ${preloadIndices.length} clips (5 ahead + 5 behind + current) for index ${currentClipIndex}`);
    
    const preloadPromises = preloadIndices.map(async (index) => {
      try {
        const clip = clips[index];
        if (clip && clip.videoId) {
          await preloadClip(clip);
          console.log(`✅ Preloaded clip ${index}: ${clip.track.title}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to preload clip ${index}:`, error);
      }
    });
    
    await Promise.allSettled(preloadPromises);
    console.log(`🎯 Preloading complete for clips around index ${currentClipIndex}`);
  };

  const preloadClip = async (clip: HotShotClip) => {
    if (clip.videoId) {
      console.log(`✅ Clip already has video ID: ${clip.videoId} for "${clip.track.title}"`);
      return; // Already has video ID
    }
    
    console.warn(`⚠️ Clip missing video ID for: "${clip.track.title}" by ${clip.track.artist}`);
    // Since our playlist service should already provide video IDs, this shouldn't happen
    // But if it does, we can't do much without the video ID
  };

  const loadCurrentVideo = async () => {
    const currentClip = getCurrentClip();
    if (!currentClip || !isYoutubeReady) return;

    try {
      console.log(`🎬 Loading video for: ${currentClip.track.title} by ${currentClip.track.artist}`);
      
      const videoId = currentClip.videoId;
      
      // Check if we have a video ID from the playlist service
      if (!videoId) {
        console.error(`❌ No video ID available for: "${currentClip.track.title}" by ${currentClip.track.artist}`);
        return;
      }
      
      if (videoId) {
        console.log(`✅ Playing YouTube video: ${videoId}`);
        
        // Initialize or update YouTube player
        if (youtubePlayer) {
          console.log(`🔄 Loading new video in existing player: ${videoId} for ${selectedChannel.toUpperCase()}`);
          youtubePlayer.loadVideoById({
            videoId: videoId,
            startSeconds: currentClip.startTime,
            endSeconds: Math.min(currentClip.startTime + 30, currentClip.endTime)
          });
          setIsPlaying(true); // Ensure playing state is set
          youtubePlayer.playVideo(); // Auto-play
          
          // Start looping with multiple attempts to ensure it works
          setTimeout(() => {
            startLooping(currentClip);
          }, 1000); // Wait 1 second for video to start playing
          
          // Backup attempt in case first one fails
          setTimeout(() => {
            if (!loopIntervalRef.current) {
              console.log(`🚨 Backup looping attempt for existing player - ${selectedChannel.toUpperCase()}`);
              startLooping(currentClip);
            }
          }, 3000); // Another attempt after 3 seconds
        } else {
          // For new player creation, use consistent ID per channel
          const playerId = 'youtube-player-hotshot';
          
          console.log(`🎬 Creating new YouTube player for ${selectedChannel.toUpperCase()}`);
          
          new window.YT.Player(playerId, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
              autoplay: 1, // Auto-play enabled
              controls: 0, // Hide all controls
              disablekb: 1, // Disable keyboard controls
              fs: 0, // Disable fullscreen
              modestbranding: 1, // Remove YouTube logo
              playsinline: 1, // Play inline on mobile
              rel: 0, // Don't show related videos
              showinfo: 0, // Hide video title
              iv_load_policy: 3, // Disable annotations
              cc_load_policy: 0, // Disable captions
              start: currentClip.startTime,
              end: Math.min(currentClip.startTime + 30, currentClip.endTime),
              loop: 0, // We'll handle looping manually
              mute: 0,
              // DISABLE END SCREEN AND TITLES + 480P FOR FAST LOADING
              endscreen: 0, // Disable end screen
              branding: 0, // Remove branding
              color: 'white', // Player color
              enablejsapi: 1, // Enable JS API
              origin: window.location.origin, // Set origin
              widget_referrer: window.location.origin,
              vq: 'medium', // Force 480p quality for faster loading
              hd: 0, // Disable HD to force lower quality
              // DISABLE CLICK INTERACTIONS AND SUGGESTIONS
              hl: 'en', // Set language to avoid suggestions
              cc_lang_pref: 'en', // Set caption language
              autohide: 1, // Auto-hide controls
              theme: 'dark', // Dark theme
              showsearch: 0 // Disable search
            },
            events: {
              onReady: (event: any) => {
                setYoutubePlayer(event.target);
                console.log(`🎵 YouTube player ready for ${selectedChannel.toUpperCase()} channel`);
                setIsPlaying(true); // Set playing state immediately
                event.target.playVideo(); // Force autoplay
                
                // AGGRESSIVE looping initialization for first clip
                setTimeout(() => {
                  console.log(`🔄 Starting initial loop for first ${selectedChannel.toUpperCase()} clip...`);
                  startLooping(currentClip);
                  // Double-ensure video is playing
                  if (event.target.getPlayerState() !== window.YT.PlayerState.PLAYING) {
                    event.target.playVideo();
                  }
                }, 500);
                
                // Additional backup attempts
                setTimeout(() => {
                  console.log(`🚨 BACKUP: Starting loop for first ${selectedChannel.toUpperCase()} clip - attempt 2`);
                  startLooping(currentClip);
                  event.target.playVideo();
                }, 1500);
                
                setTimeout(() => {
                  console.log(`🚨 BACKUP: Starting loop for first ${selectedChannel.toUpperCase()} clip - attempt 3`);
                  startLooping(currentClip);
                  event.target.playVideo();
                }, 3000);
              },
              onStateChange: (event: any) => {
                const playerState = event.data;
                console.log('Player state changed:', playerState, 'Current clip index:', currentClipIndex, 'Channel:', selectedChannel);
                
                if (playerState === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                  // ALWAYS ensure looping is active when playing starts
                  console.log(`🔄 Starting loop on PLAYING state for clip ${currentClipIndex} (${selectedChannel.toUpperCase()})`);
                  startLooping(currentClip);
                } else if (playerState === window.YT.PlayerState.ENDED) {
                  console.log('🔚 Video ended for clip:', currentClipIndex);
                  // Auto-continue to next clip when video ends
                  handleNextClip();
                } else if (playerState === window.YT.PlayerState.BUFFERING) {
                  console.log('🔄 Video buffering for clip:', currentClipIndex);
                } else if (playerState === window.YT.PlayerState.PAUSED) {
                  console.log('⏸️ Video paused for clip:', currentClipIndex);
                  // Stop looping when paused
                  stopLooping();
                }
                // Note: We don't auto-pause anymore - clips should always play unless user clicks pause
              }
            }
          });
        }
        } else {
          console.warn(`❌ No YouTube video found for: ${currentClip.track.title}`);
        }
      } catch (error) {
        console.error('Failed to load YouTube video:', error);
      }
    };

  const startLooping = (clip?: HotShotClip) => {
    const currentClip = clip || getCurrentClip();
    if (!currentClip || !youtubePlayer) {
      console.warn('🚨 Cannot start looping - missing clip or player', {
        hasClip: !!currentClip,
        hasPlayer: !!youtubePlayer,
        clipIndex: currentClipIndex,
        channel: selectedChannel
      });
      return;
    }
    
    // ALWAYS clear existing loop first
    if (loopIntervalRef.current) {
      console.log('🧹 Clearing existing loop interval');
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    
    console.log(`🔄 Starting FLAWLESS 30s loop for: ${currentClip.track.title} (Index: ${currentClipIndex}, Channel: ${selectedChannel.toUpperCase()})`);
    console.log(`⏰ Loop bounds: ${currentClip.startTime}s to ${Math.min(currentClip.startTime + 30, currentClip.endTime)}s`);
    
    // AGGRESSIVE LOOPING - Check every 100ms for ultra-smooth transitions
    loopIntervalRef.current = setInterval(() => {
      if (youtubePlayer && youtubePlayer.getCurrentTime) {
        try {
          const currentTime = youtubePlayer.getCurrentTime();
          const clipEnd = Math.min(currentClip.startTime + 30, currentClip.endTime);
          
          // FLAWLESS LOOP: If within 0.5s of end, immediately restart
          if (currentTime >= (clipEnd - 0.5)) {
            console.log(`🔄 SEAMLESS loop back to start: ${currentClip.startTime}s (was at ${currentTime}s) for clip ${currentClipIndex} (${selectedChannel.toUpperCase()})`);
            youtubePlayer.seekTo(currentClip.startTime, true); // allowSeekAhead = true
            if (youtubePlayer.getPlayerState() !== window.YT.PlayerState.PLAYING) {
              youtubePlayer.playVideo();
            }
          }
          
          // If we've somehow gone before the start, fix immediately
          if (currentTime < currentClip.startTime) {
            console.log(`⚡ Fixing time - was ${currentTime}s, should be ${currentClip.startTime}s for clip ${currentClipIndex} (${selectedChannel.toUpperCase()})`);
            youtubePlayer.seekTo(currentClip.startTime, true);
          }
          
          // Emergency fallback: if video has ended or paused unexpectedly, restart
          const playerState = youtubePlayer.getPlayerState();
          if (playerState === window.YT.PlayerState.ENDED || 
              (playerState === window.YT.PlayerState.PAUSED && isPlaying)) {
            console.log(`🚨 Emergency restart - video ended/paused unexpectedly for clip ${currentClipIndex} (${selectedChannel.toUpperCase()})`);
            youtubePlayer.seekTo(currentClip.startTime, true);
            youtubePlayer.playVideo();
          }
        } catch (error) {
          console.error('Error in loop interval:', error);
        }
      }
    }, 100); // Check every 100ms for FLAWLESS looping
    
    console.log(`✅ Loop interval started for clip ${currentClipIndex} (${selectedChannel.toUpperCase()})`);
  };

  const stopLooping = () => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }
  };

  // COMPLETE CHANNEL SWITCH - Like opening HotShot page for first time
  const handleChannelSwitch = async (newChannel: ChannelType) => {
    if (newChannel === selectedChannel) return; // No change needed
    
    console.log(`🔄 CHANNEL SWITCH: From ${selectedChannel.toUpperCase()} to ${newChannel.toUpperCase()}`);
    
    // COMPLETE RESET - Stop everything
    stopLooping();
    if (youtubePlayer) {
      try {
        youtubePlayer.pauseVideo();
        youtubePlayer.destroy(); // Completely destroy the player
      } catch (error) {
        console.warn('Error destroying player during channel switch:', error);
      }
    }
    
    // Reset all states to initial values (like fresh page load)
    setYoutubePlayer(null); // Reset player state
    setIsYoutubeReady(false); // Reset YouTube ready state
    setCurrentClipIndex(0);
    setPreviousClipIndex(-1);
    setIsTransitioning(false);
    setIsPlaying(true); // Always start playing like fresh page
    setLoading(true);
    
    // Load new channel clips
    await initializeClips(newChannel);
    
    // Reload YouTube API and player for new clips
    setTimeout(() => {
      console.log(`🎬 Reinitializing YouTube player for ${newChannel.toUpperCase()} channel`);
      if (window.YT && window.YT.Player) {
        setIsYoutubeReady(true);
      } else {
        loadYouTubeAPI();
      }
    }, 500);
    
    console.log(`✅ CHANNEL SWITCH COMPLETE: Now playing ${newChannel.toUpperCase()} clips`);
  };

  const initializeClips = async (channel: ChannelType = 'hindi') => {
    try {
      setLoading(true);
      console.log(`🎵 Loading HotShot clips from ${channel.toUpperCase()} JSON playlist...`);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Clips loading timeout')), 10000) // 10 second timeout
      );
      
      const playlistPromise = playlistService.createClips(channel);
      
      const playlistClips = await Promise.race([playlistPromise, timeoutPromise]) as HotShotClip[];
      console.log(`📊 Loaded ${playlistClips.length} clips from ${channel.toUpperCase()} playlist`);
      
      if (!playlistClips || playlistClips.length === 0) {
        console.warn(`⚠️ No clips received from ${channel} playlist`);
        setClips([]);
      } else {
        // Clips are already in the right format from the service
        setClips(playlistClips);
        
        // Preload first 5 clips in background for flawless experience (NON-BLOCKING)
        console.log(`🚀 Starting background preload of first 5 ${channel.toUpperCase()} clips...`);
        const preloadPromises = playlistClips.slice(0, 5).map(clip => preloadClip(clip));
        Promise.all(preloadPromises)
          .then(() => console.log(`✅ First 5 ${channel.toUpperCase()} clips preloaded`))
          .catch(error => console.warn(`⚠️ Some ${channel} clips failed to preload:`, error));
      }
      
      setLoading(false);
    } catch (error) {
      console.error(`💥 Failed to load clips from ${channel} playlist:`, error);
      
      // Show error message - no fallback clips
      console.log(`🆘 Failed to load ${channel} playlist clips`);
      setClips([]);
      
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLooping();
      if (youtubePlayer && youtubePlayer.destroy) {
        youtubePlayer.destroy();
      }
    };
  }, [youtubePlayer]);

  const getCurrentClip = () => clips[currentClipIndex];

  const handlePlayPause = useCallback(() => {
    if (!youtubePlayer) return;

    try {
      if (isPlaying) {
        youtubePlayer.pauseVideo();
        setIsPlaying(false);
        stopLooping();
      } else {
        youtubePlayer.playVideo();
        setIsPlaying(true);
        startLooping();
      }
      setShowControls(true);
    } catch (error) {
      console.error('Error controlling YouTube player:', error);
    }
  }, [isPlaying, youtubePlayer]);

  const handleMute = useCallback(() => {
    if (!youtubePlayer) return;

    try {
      if (isMuted) {
        youtubePlayer.unMute();
        setIsMuted(false);
      } else {
        youtubePlayer.mute();
        setIsMuted(true);
      }
      setShowControls(true);
    } catch (error) {
      console.error('Error muting YouTube player:', error);
    }
  }, [isMuted, youtubePlayer]);

  const handleNextClip = useCallback(async () => {
    if (currentClipIndex < clips.length - 1) {
      const newIndex = currentClipIndex + 1;
      setPreviousClipIndex(currentClipIndex); // Track previous for smooth transition
      setIsTransitioning(true); // Start transition
      setCurrentClipIndex(newIndex);
      
      // Clear previous clip index after transition completes
      setTimeout(() => {
        setPreviousClipIndex(-1);
        setIsTransitioning(false);
      }, 700);
      
      // Immediately preload surrounding clips (5 ahead + 5 behind) for flawless navigation
      console.log(`🚀 Moving to clip ${newIndex}, preloading surrounding clips...`);
      
      // Use the proper preloading system in background
      setTimeout(() => {
        preloadSurroundingClips();
      }, 100); // Small delay to not block UI
      
    } else {
      // Load more clips when reaching the end
      loadMoreClips();
    }
  }, [currentClipIndex, clips.length]);

  const handlePrevClip = useCallback(async () => {
    if (currentClipIndex > 0) {
      const newIndex = currentClipIndex - 1;
      setPreviousClipIndex(currentClipIndex); // Track previous for smooth transition
      setIsTransitioning(true); // Start transition
      setCurrentClipIndex(newIndex);
      
      // Clear previous clip index after transition completes
      setTimeout(() => {
        setPreviousClipIndex(-1);
        setIsTransitioning(false);
      }, 700);
      
      // Immediately preload surrounding clips (5 ahead + 5 behind) for flawless navigation
      console.log(`🚀 Moving to clip ${newIndex}, preloading surrounding clips...`);
      
      // Use the proper preloading system in background
      setTimeout(() => {
        preloadSurroundingClips();
      }, 100); // Small delay to not block UI
      const prevIndex = currentClipIndex - 1;
      const preloadPromises = [];
      
      for (let i = 1; i <= 2; i++) {
        const preloadIndex = prevIndex - i;
        if (preloadIndex >= 0 && clips[preloadIndex]) {
          preloadPromises.push(preloadClip(clips[preloadIndex]));
        }
      }
      
      // Start preloading in background (don't await)
      Promise.all(preloadPromises).catch(console.error);
    }
  }, [currentClipIndex]);

  const loadMoreClips = async () => {
    try {
      console.log(`🔄 Loading more clips from ${selectedChannel.toUpperCase()} playlist...`);
      
      // For playlist-based system, we can reshuffle existing clips or reload from playlist
      const playlistClips = await playlistService.createClips(selectedChannel);
      
      if (playlistClips.length > 0) {
        const newClips: HotShotClip[] = playlistClips.map((clip: HotShotClip) => ({
          id: `${clip.id}-${Date.now()}`, // Add timestamp to avoid duplicates
          track: clip.track,
          startTime: clip.startTime,
          endTime: clip.endTime,
          confidence: clip.confidence,
          videoId: clip.videoId,
          source: 'playlist' as const
        }));
        
        // Add new clips to existing ones
        setClips(prevClips => [...prevClips, ...newClips]);
        console.log(`✅ Added ${newClips.length} more ${selectedChannel.toUpperCase()} clips`);
        
        // Preload new clips
        const preloadPromises = newClips.slice(0, 5).map(clip => preloadClip(clip));
        Promise.all(preloadPromises).catch(console.error);
      }
    } catch (error) {
      console.error(`Failed to load more ${selectedChannel} clips:`, error);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        handleNextClip(); // Swipe up = next clip
      } else {
        handlePrevClip(); // Swipe down = previous clip
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevClip();
      } else if (e.key.toLowerCase() === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextClip();
      } else if (e.key === ' ') {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrevClip, handleNextClip, handlePlayPause]);

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg mb-2">Loading {selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1)} HotShot Clips...</p>
          <p className="text-sm opacity-70">Loading from {selectedChannel} playlist in 480p for faster experience</p>
          <div className="mt-4 text-xs opacity-50">
            Shuffled and ready to play
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (clips.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-2">No clips available</p>
          <p className="text-sm opacity-70 mb-4">No videos found in the configured playlist</p>
          <p className="text-xs opacity-50 mb-4">Please add videos to the playlist or check the playlist URL</p>
          <button 
            onClick={() => {
              setLoading(true);
              initializeClips(selectedChannel);
            }}
            className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            Retry Loading {selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1)} Playlist
          </button>
        </div>
      </div>
    );
  }

  const currentClip = getCurrentClip();

  return (
    <>
      {/* Global styles to disable YouTube iframe interactions */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .youtube-player-wrapper iframe {
            pointer-events: none !important;
          }
        `
      }} />
      
      <div className="h-screen bg-black relative overflow-hidden flex">
            {/* Channel Selection Sidebar - Clean Minimalistic UI */}
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 backdrop-blur-2xl rounded-3xl">
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl shadow-xl shadow-black/20 p-5 w-72 backdrop-saturate-150">
          {/* Header */}
          <div className="text-white font-semibold text-base mb-5 flex items-center gap-2">
            <img 
              src="/assets/logo/hotclip.apng" 
              alt="Hot Clips" 
              className="w-5 h-5 object-contain"
            />
            Channels
          </div>
          
          {/* Channel Categories */}
          <div className="space-y-5">
            {/* Top Hits Category */}
            <div>
              <div className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wider pl-1">
                Top Hits
              </div>
              <div className="flex flex-wrap gap-2 justify-between">
                {Object.values(CHANNELS)
                  .filter(channel => channel.category === 'tophits')
                  .map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => switchToChannel(channel.id)}
                      className={`flex-1 min-w-fit px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-300 transform backdrop-blur-lg ${
                        selectedChannel === channel.id
                          ? 'bg-white/20 text-white shadow-lg shadow-white/10 scale-105'
                          : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white hover:scale-105'
                      }`}
                    >
                      {channel.name}
                    </button>
                  ))}
              </div>
            </div>
            
            {/* Mood & Genres Category */}
            <div>
              <div className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wider pl-1">
                Mood & Genres
              </div>
              <div className="flex flex-wrap gap-2 justify-between">
                {Object.values(CHANNELS)
                  .filter(channel => channel.category === 'mood')
                  .map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => switchToChannel(channel.id)}
                      className={`flex-1 min-w-fit px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-300 transform backdrop-blur-lg ${
                        selectedChannel === channel.id
                          ? 'bg-white/20 text-white shadow-lg shadow-white/10 scale-105'
                          : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white hover:scale-105'
                      }`}
                    >
                      {channel.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area - Full Screen */}
      <div className="flex-1 relative">
      {/* Blurred Video Background with Cross-fade */}
      <div className="absolute inset-0 z-0">
        {/* Previous clip background (fading out) */}
        {previousClipIndex >= 0 && clips[previousClipIndex] && (
          <div 
            className="absolute inset-0 scale-125 blur-2xl transition-opacity duration-700 ease-out"
            style={{
              background: `url(https://img.youtube.com/vi/${clips[previousClipIndex].videoId}/maxresdefault.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: isTransitioning ? 0 : 0.45 // Smooth fade out during transition
            }}
          />
        )}
        
        {/* Current clip background (fading in) */}
        {currentClip && (
          <div 
            className="absolute inset-0 scale-125 blur-2xl transition-opacity duration-700 ease-in"
            style={{
              background: `url(https://img.youtube.com/vi/${currentClip.videoId}/maxresdefault.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.45 // Reduced brightness
            }}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 transition-all duration-700 ease-in-out" />
      </div>
      
      {/* Touch handlers */}
      <div
        className="absolute inset-0 z-10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setShowControls(!showControls)}
      />

      {/* Background Blur Effect - Enhanced with Video Accent */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10" />
      
      {/* Main Content Area - YouTube Player */}
      <div className="relative h-full w-full flex items-center justify-center z-20">
        {/* YouTube Player Container - 9:16 FRAME like Instagram with Rounded Borders */}
        <div className="relative bg-black overflow-hidden youtube-container rounded-[2rem] shadow-2xl border border-white/10 shadow-purple-500/20" style={{ width: '400px', height: '710px', aspectRatio: '9/16' }}>
          {/* YouTube Player - FORCE FILL */}
          <div 
            id="youtube-player-hotshot"
            key={`player-${selectedChannel}`}
            className="absolute inset-0 w-full h-full youtube-player-wrapper rounded-[2rem] overflow-hidden pointer-events-none"
            style={{ borderRadius: '2rem', pointerEvents: 'none' }}
          />
          
          {/* Loading State */}
          {!isYoutubeReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 rounded-[2rem]">
              <div className="text-white text-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Loading video...</p>
              </div>
            </div>
          )}
          
          {/* Left Side Navigation Controls - Aligned with right controls */}
          <div className="absolute left-4 bottom-20 z-30">
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePrevClip}
                className="w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors shadow-lg"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextClip}
                className="w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors shadow-lg"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Right Side Controls - Always visible */}
          <div className="absolute right-4 bottom-20 z-30">
            <div className="flex flex-col gap-3 items-center">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
              
              {/* Like - Disabled */}
              <button
                disabled
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 cursor-not-allowed transition-colors shadow-lg opacity-50"
              >
                <Heart 
                  className="w-5 h-5 text-gray-500"
                />
              </button>
              
              {/* Mute */}
              <button
                onClick={handleMute}
                className="w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors shadow-lg"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Bottom Info - Always visible */}
          <div className="absolute bottom-4 left-4 right-4 z-30">
            {/* Track Info */}
            <div className="text-white">
              <h3 className="text-sm font-semibold leading-tight mb-1 line-clamp-2">
                {currentClip?.track.title}
              </h3>
              <p className="text-xs text-white/80 mb-1">
                {currentClip?.track.artist}
              </p>
            </div>
          </div>          
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default HotShotClips;
