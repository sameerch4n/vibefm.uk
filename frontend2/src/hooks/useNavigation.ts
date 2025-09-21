import { useState, useCallback } from 'react';

interface NavigationState {
  currentView: string;
  history: string[];
  historyIndex: number;
}

export function useNavigation(initialView = '/discover') {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentView: initialView,
    history: [initialView],
    historyIndex: 0,
  });

  const navigate = useCallback((path: string) => {
    setNavigationState(prev => {
      // If we're not at the end of history, remove everything after current position
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(path);
      
      return {
        currentView: path,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setNavigationState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          currentView: prev.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const goForward = useCallback(() => {
    setNavigationState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          currentView: prev.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const canGoBack = navigationState.historyIndex > 0;
  const canGoForward = navigationState.historyIndex < navigationState.history.length - 1;

  return {
    currentView: navigationState.currentView,
    navigate,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  };
}
