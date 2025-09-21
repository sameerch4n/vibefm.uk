import React from 'react';
import { Home, Search, Heart, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: 'home' | 'search' | 'liked';
  onTabChange: (tab: 'home' | 'search' | 'liked') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'liked', label: 'Liked Songs', icon: Heart },
  ] as const;

  return (
    <div className="w-16 lg:w-64 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-border/30">
        <div className="flex items-center justify-center lg:justify-start space-x-0 lg:space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <Music className="w-6 h-6 text-white" />
          </div>
          <h1 className="hidden lg:block text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Music Player
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full h-12 justify-center lg:justify-start text-left relative overflow-hidden group transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10" 
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onTabChange(item.id)}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
              )}
              <Icon className={cn(
                "w-5 h-5 lg:mr-3 transition-transform group-hover:scale-110",
                isActive && "text-primary"
              )} />
              <span className="hidden lg:inline relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 lg:p-4 border-t border-border/30">
        <div className="text-center lg:text-left">
          <p className="text-xs text-muted-foreground/70 hidden lg:block">
            Modern Music Player
          </p>
          <div className="w-8 h-1 bg-gradient-to-r from-primary to-accent rounded mx-auto lg:mx-0 lg:hidden" />
        </div>
      </div>
    </div>
  );
}
