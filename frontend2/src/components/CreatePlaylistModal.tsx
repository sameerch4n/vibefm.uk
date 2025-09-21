import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist: (name: string, description?: string) => void;
}

export function CreatePlaylistModal({ isOpen, onClose, onCreatePlaylist }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreatePlaylist(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Playlist</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-hover transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="playlistName" className="block text-sm font-medium text-white mb-2">
              Playlist Name
            </label>
            <input
              id="playlistName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              className="w-full px-3 py-2 bg-background border border-surface-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="playlistDescription" className="block text-sm font-medium text-white mb-2">
              Description (Optional)
            </label>
            <textarea
              id="playlistDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-surface-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-surface hover:bg-surface-hover text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 px-4 bg-accent hover:bg-accent-hover disabled:bg-surface disabled:text-text-secondary text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
