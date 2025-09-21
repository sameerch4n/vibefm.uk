import { useState, useEffect, useRef } from 'react';
import { Track, PlayerState, SavedPlayerState } from '@/types';
import { LocalStorage } from '@/lib/storage';
import { MusicAPI } from '@/lib/api';
import { YouTubePlayer } from '@/lib/youtube-player';

const initialPlayerState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  volume: 0.7,
  queue: [],
  currentIndex: -1,
  isFullScreen: false,
  repeat: 'none',
  shuffle: false,
  isBuffering: false,
};

export function usePlayer() {
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState);
  const [youtubePlayer] = useState(() => new YouTubePlayer());
  const progressIntervalRef = useRef<number | null>(null);
  const currentTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const isBufferingRef = useRef<boolean>(false);
  const progressCallbacksRef = useRef<Set<(time: number, duration: number) => void>>(new Set());
  const playStateCallbacksRef = useRef<Set<(isPlaying: boolean) => void>>(new Set());
  const bufferingCallbacksRef = useRef<Set<(isBuffering: boolean) => void>>(new Set());

  useEffect(() => {
    // Load saved player state
    const savedState = LocalStorage.getPlayerState();
    if (savedState) {
      setPlayerState(prev => ({
        ...prev,
        ...savedState,
        isPlaying: false, // Don't auto-play on load
        currentTime: 0,
      }));
    }

    // Initialize YouTube player events
    youtubePlayer.on('playing', () => {
      isPlayingRef.current = true;
      isBufferingRef.current = false;
      playStateCallbacksRef.current.forEach(callback => callback(true));
      bufferingCallbacksRef.current.forEach(callback => callback(false));
      setPlayerState(prev => ({
        ...prev,
        isPlaying: true,
        isBuffering: false,
      }));
      startProgressTracking();
    });

    youtubePlayer.on('paused', () => {
      isPlayingRef.current = false;
      isBufferingRef.current = false;
      playStateCallbacksRef.current.forEach(callback => callback(false));
      bufferingCallbacksRef.current.forEach(callback => callback(false));
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
        isBuffering: false,
      }));
      stopProgressTracking();
    });

    youtubePlayer.on('buffering', () => {
      isBufferingRef.current = true;
      bufferingCallbacksRef.current.forEach(callback => callback(true));
      setPlayerState(prev => ({
        ...prev,
        isBuffering: true,
      }));
      // Stop progress tracking while buffering to prevent desync
      stopProgressTracking();
    });

    youtubePlayer.on('ended', () => {
      isPlayingRef.current = false;
      isBufferingRef.current = false;
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false,
        isBuffering: false,
      }));
      stopProgressTracking();
      // Auto-play next track
      playNext();
    });

    youtubePlayer.on('cued', () => {
      // Video is loaded but not playing yet
      setPlayerState(prev => ({
        ...prev,
        isBuffering: false,
      }));
    });

    youtubePlayer.on('unstarted', () => {
      // Video hasn't started yet
      setPlayerState(prev => ({
        ...prev,
        isBuffering: false,
      }));
    });

    youtubePlayer.on('error', (error: any) => {
      console.error('YouTube player error:', error);
      isPlayingRef.current = false;
      isBufferingRef.current = false;
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false,
        isBuffering: false,
      }));
      stopProgressTracking();
    });

    return () => {
      stopProgressTracking();
    };
  }, []);

  useEffect(() => {
    // Save player state changes (excluding current time for performance)
    const { currentTime, ...stateToSave } = playerState;
    LocalStorage.savePlayerState(stateToSave as SavedPlayerState);
  }, [playerState]);

  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = window.setInterval(() => {
      // Only track progress if YouTube is actually playing (not buffering or paused)
      if (youtubePlayer.isBuffering() || !isPlayingRef.current) {
        return;
      }

      const current = youtubePlayer.getCurrentTime();
      const total = youtubePlayer.getDuration();
      
      // Validate that we got valid time values from YouTube
      if (isNaN(current) || isNaN(total) || current < 0 || total <= 0) {
        return;
      }
      
      // Store current time in ref to avoid constant re-renders
      currentTimeRef.current = current;
      
      // Only update state for duration if it changes significantly (avoid flickering)
      if (total > 0 && playerState.currentTrack && Math.abs((playerState.currentTrack.duration || 0) - total) > 5) {
        setPlayerState(prev => ({ 
          ...prev,
          currentTrack: prev.currentTrack ? { ...prev.currentTrack, duration: total } : null
        }));
      }
      
      // Call progress callbacks without state updates
      progressCallbacksRef.current.forEach(callback => callback(current, total));
    }, 500); // Update more frequently for smoother progress
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const playTrack = async (track: Track, queue?: Track[], startIndex?: number) => {
    try {
      // Check if this is the same track that's currently loaded
      const isSameTrack = playerState.currentTrack?.id === track.id;
      
      if (isSameTrack) {
        // Same track - just toggle play/pause
        togglePlayPause();
        return;
      }

      // Try multiple search strategies for better success rate
      const originalArtistTitle = `${track.artist} ${track.title}`.trim();
      const originalTitleOnly = track.title.trim();

      const searchQueries = [
        originalArtistTitle, // Original artist + title
        originalTitleOnly, // Original title only
        `${track.title} ${track.artist}`.trim(), // Reversed order
        `${originalTitleOnly} official`.trim(), // Original title + official
        `${originalTitleOnly} cover`.trim(), // Cover versions (often embeddable)
        `${originalTitleOnly} karaoke`.trim(), // Karaoke versions
        `${originalTitleOnly} instrumental`.trim(), // Instrumental versions
        `${track.artist} ${track.title} live`.trim(), // Live versions
        `${track.title} remix`.trim(), // Remix versions
      ].filter((query, index, self) => 
        query && self.indexOf(query) === index // Remove duplicates and empty strings
      );

      let youtubeResult: { id: string; title?: string; channel?: string; durationSec?: number } | null = null;
      let usedQuery = '';

      // Try each query until we find a result that can be embedded
      for (const query of searchQueries) {
        try {
          youtubeResult = await MusicAPI.getYouTubeVideo(query);
          if (youtubeResult?.id) {
            // Test if this video can be embedded by attempting to load it
            try {
              const trackWithYoutube = { ...track, youtubeId: youtubeResult.id };
              
              setPlayerState(prev => ({
                ...prev,
                currentTrack: trackWithYoutube,
                queue: queue || [track],
                currentIndex: startIndex !== undefined ? startIndex : (queue || [track]).findIndex(t => t.id === track.id),
                isPlaying: true,
                isBuffering: true,
              }));

              await youtubePlayer.loadVideo(youtubeResult.id);
              
              // Wait a moment to see if there's an embedding error
              await new Promise((resolve, reject) => {
                const timeout = setTimeout(resolve, 1000);
                
                const errorHandler = (error: any) => {
                  clearTimeout(timeout);
                  youtubePlayer.off('error', errorHandler);
                  if (error.code === 150 || error.code === 101) {
                    reject(new Error('Embedding not allowed'));
                  } else {
                    resolve(undefined);
                  }
                };
                
                youtubePlayer.on('error', errorHandler);
                
                setTimeout(() => {
                  youtubePlayer.off('error', errorHandler);
                  resolve(undefined);
                }, 1000);
              });
              
              // If we get here, the video loaded successfully
              usedQuery = query;
              break;
              
            } catch (embeddingError) {
              continue;
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!youtubeResult?.id || !usedQuery) {
        console.error('No embeddable YouTube video found for track:', track.title, 'by', track.artist);
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
          isBuffering: false,
        }));
        return;
      }

      // Add to recent tracks
      if (playerState.currentTrack) {
        LocalStorage.addRecentTrack(playerState.currentTrack);
      }
      
    } catch (error) {
      console.error('Error playing track:', error);
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
        isBuffering: false,
      }));
    }
  };

  const togglePlayPause = () => {
    if (isPlayingRef.current) {
      // Immediately update ref and notify callbacks to prevent jerk
      isPlayingRef.current = false;
      playStateCallbacksRef.current.forEach(callback => callback(false));
      // Update state immediately for UI responsiveness
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      youtubePlayer.pause();
    } else {
      // Immediately update ref and notify callbacks to prevent jerk
      isPlayingRef.current = true;
      playStateCallbacksRef.current.forEach(callback => callback(true));
      // Update state immediately for UI responsiveness
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      youtubePlayer.play();
    }
  };

  const playNext = () => {
    const { queue, currentIndex, repeat, shuffle } = playerState;
    
    if (queue.length === 0) return;

    let nextIndex = currentIndex;

    if (repeat === 'one') {
      // Replay current track
      youtubePlayer.seekTo(0);
      youtubePlayer.play();
      return;
    }

    if (shuffle) {
      // Random next track (but not current)
      const availableIndices = queue.map((_, i) => i).filter(i => i !== currentIndex);
      if (availableIndices.length > 0) {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          // End of queue
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
          return;
        }
      }
    }

    if (nextIndex < queue.length) {
      playTrack(queue[nextIndex], queue, nextIndex);
    }
  };

  const playPrevious = () => {
    const { queue, currentIndex } = playerState;
    
    if (queue.length === 0 || currentIndex <= 0) return;

    const previousIndex = currentIndex - 1;
    playTrack(queue[previousIndex], queue, previousIndex);
  };

  const seekTo = (seconds: number) => {
    // Validate seek time
    const duration = youtubePlayer.getDuration();
    const clampedSeconds = Math.max(0, Math.min(seconds, duration || 0));
    
    youtubePlayer.seekTo(clampedSeconds);
    currentTimeRef.current = clampedSeconds;
    
    // Immediately update progress callbacks with the new time
    progressCallbacksRef.current.forEach(callback => callback(clampedSeconds, duration || 0));
    
    // Force buffering state if needed since seek might cause buffering
    if (!youtubePlayer.isBuffering()) {
      // Small delay to allow YouTube to process the seek
      setTimeout(() => {
        if (youtubePlayer.isBuffering()) {
          isBufferingRef.current = true;
          bufferingCallbacksRef.current.forEach(callback => callback(true));
          setPlayerState(prev => ({ ...prev, isBuffering: true }));
        }
      }, 100);
    }
  };

  const setVolume = (volume: number) => {
    youtubePlayer.setVolume(volume * 100);
    setPlayerState(prev => ({ ...prev, volume }));
  };

  const toggleShuffle = () => {
    setPlayerState(prev => ({ ...prev, shuffle: !prev.shuffle }));
  };

  const toggleRepeat = () => {
    setPlayerState(prev => ({
      ...prev,
      repeat: prev.repeat === 'none' ? 'all' : prev.repeat === 'all' ? 'one' : 'none'
    }));
  };

  const toggleFullScreen = () => {
    setPlayerState(prev => ({ ...prev, isFullScreen: !prev.isFullScreen }));
  };

  const addToQueue = (track: Track) => {
    setPlayerState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  };

  const removeFromQueue = (index: number) => {
    setPlayerState(prev => {
      const newQueue = prev.queue.filter((_, i) => i !== index);
      let newCurrentIndex = prev.currentIndex;
      
      if (index < prev.currentIndex) {
        newCurrentIndex = prev.currentIndex - 1;
      } else if (index === prev.currentIndex) {
        newCurrentIndex = -1;
      }

      return {
        ...prev,
        queue: newQueue,
        currentIndex: newCurrentIndex,
      };
    });
  };

  const getCurrentTime = () => currentTimeRef.current;
  
  const getIsPlaying = () => isPlayingRef.current;
  
  const subscribeToProgress = (callback: (time: number, duration: number) => void) => {
    progressCallbacksRef.current.add(callback);
    return () => progressCallbacksRef.current.delete(callback);
  };

  const subscribeToPlayState = (callback: (isPlaying: boolean) => void) => {
    playStateCallbacksRef.current.add(callback);
    // Immediately call with current state
    callback(isPlayingRef.current);
    return () => playStateCallbacksRef.current.delete(callback);
  };

  const subscribeToBufferingState = (callback: (isBuffering: boolean) => void) => {
    bufferingCallbacksRef.current.add(callback);
    // Immediately call with current state
    callback(isBufferingRef.current);
    return () => bufferingCallbacksRef.current.delete(callback);
  };

  return {
    playerState,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleFullScreen,
    addToQueue,
    removeFromQueue,
    getCurrentTime,
    getIsPlaying,
    subscribeToProgress,
    subscribeToPlayState,
    subscribeToBufferingState,
  };
}

export default usePlayer;
