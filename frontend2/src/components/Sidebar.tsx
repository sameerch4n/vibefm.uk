import { 
  Home, 
  Radio, 
  Heart, 
  Plus, 
  Music,
  Flag,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  onNavigate: (path: string) => void;
  playlists: Array<{ id: string; name: string }>;
}

const navigationItems = [
  { id: 'discover', label: 'Discover', icon: Home, path: '/discover' },
  { id: 'radio', label: 'Radio', icon: Radio, path: '/radio', disabled: true },
  { id: 'hotshot', label: 'HotShot Clips', icon: Flame, path: '/hotshot' },
];

const libraryItems = [
  { id: 'liked', label: 'Liked Songs', icon: Heart, path: '/library/liked' },
];

const chartItems = [
  { id: 'top100-usa', label: 'Top 100 USA', icon: Flag, path: '/charts/top100-usa' },
  { id: 'top100-india', label: 'Top 100 India', icon: Flag, path: '/charts/top100-india' },
  { id: 'top100-uk', label: 'Top 100 UK', icon: Flag, path: '/charts/top100-uk' },
  { id: 'top100-canada', label: 'Top 100 Canada', icon: Flag, path: '/charts/top100-canada' },
  { id: 'top100-global', label: 'Top 100 Global', icon: Flag, path: '/charts/top100-global' },
  { id: 'top100-australia', label: 'Top 100 Australia', icon: Flag, path: '/charts/top100-australia' },
  { id: 'top100-uae', label: 'Top 100 UAE', icon: Flag, path: '/charts/top100-uae' },
];

export function Sidebar({ currentView, onNavigate, playlists }: SidebarProps) {
  const isActive = (path: string) => currentView === path || currentView.startsWith(path);

  const handleNavigation = (path: string, disabled?: boolean) => {
    if (disabled) return;
    onNavigate(path);
  };

  const NavItem = ({ 
    item, 
    isActive, 
    disabled 
  }: { 
    item: { id: string; label: string; icon: any; path: string }; 
    isActive: boolean; 
    disabled?: boolean;
  }) => {
    const Icon = item.icon;
    
    return (
      <button
        onClick={() => handleNavigation(item.path, disabled)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-nav text-left w-full transition-colors',
          'text-sm font-medium',
          isActive && !disabled
            ? 'bg-accent text-white'
            : disabled
            ? 'text-text-inactive opacity-40 cursor-not-allowed'
            : 'text-text-inactive hover:text-white hover:bg-surface-hover'
        )}
        title={disabled ? 'Coming soon' : undefined}
      >
        <Icon size={18} className={cn(isActive && !disabled ? 'text-white' : '')} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <div className="w-sidebar min-w-sidebar max-w-sidebar flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-1 border-b border-surface-border flex justify-center items-center flex-shrink-0">
        <img 
          src="/assets/logo/logo.png" 
          alt="Vibe FM Logo"
          className="h-20 w-auto"
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={isActive(item.path)}
              disabled={item.disabled}
            />
          ))}
        </div>

        {/* Library Section */}
        <div className="px-4 py-2">
          <h3 className="text-small-caps mb-3">Library</h3>
          <div className="space-y-2">
            {libraryItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActive(item.path)}
              />
            ))}
            
            {/* Create Playlist Button */}
            <button
              onClick={() => onNavigate('/library/create-playlist')}
              className="flex items-center gap-3 px-4 py-2 rounded-nav text-left w-full transition-colors text-sm font-medium text-text-inactive hover:text-white hover:bg-surface-hover bg-surface"
            >
              <Plus size={18} />
              <span>Create Playlist</span>
            </button>

            {/* User Playlists */}
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onNavigate(`/library/playlist/${playlist.id}`)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-nav text-left w-full transition-colors',
                  'text-sm font-medium',
                  isActive(`/library/playlist/${playlist.id}`)
                    ? 'bg-accent text-white'
                    : 'text-text-inactive hover:text-white hover:bg-surface-hover'
                )}
              >
                <Music size={18} />
                <span className="truncate">{playlist.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="px-4 py-2">
          <h3 className="text-small-caps mb-3">Charts</h3>
          <div className="space-y-2">
            {chartItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActive(item.path)}
              />
            ))}
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
