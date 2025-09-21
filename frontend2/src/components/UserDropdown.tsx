import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import type { User } from '@/lib/firebase';
import { getProxiedImageUrl, preloadProfileImage } from '@/lib/image-proxy';

interface UserDropdownProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export function UserDropdown({ user, onSignOut }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const proxiedImageUrl = getProxiedImageUrl(user.photoURL);

  // Preload the image for better performance
  useEffect(() => {
    preloadProfileImage(user.photoURL);
  }, [user.photoURL]);

  // Calculate dropdown position when opening
  const handleToggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full p-2 pr-4 hover:bg-black/70 transition-colors"
      >
        {proxiedImageUrl ? (
          <img
            src={proxiedImageUrl}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="text-white text-sm font-medium max-w-32 truncate">
          {user.displayName || 'User'}
        </span>
      </button>

      {/* Dropdown Menu - Rendered as Portal */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl py-2 min-w-[200px] overflow-hidden"
          style={{
            top: dropdownPosition.top,
            right: dropdownPosition.right,
            zIndex: 999999,
          }}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-medium truncate">{user.displayName}</p>
            <p className="text-white/60 text-sm truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              className="w-full px-4 py-2 text-left text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
              onClick={() => {
                setIsOpen(false);
                // TODO: Implement settings
                console.log('Settings clicked');
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            <button
              className="w-full px-4 py-2 text-left text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
