import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Track } from "@/types/music"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatReleaseYear(releaseDate?: string): string | null {
  if (!releaseDate) return null;
  try {
    const year = new Date(releaseDate).getFullYear();
    return isNaN(year) ? null : year.toString();
  } catch {
    return null;
  }
}

export function getTrackMetadata(track: Track): {
  genre: string | null;
  year: string | null;
  duration: string | null;
} {
  const genre = track.genre || null;
  const year = formatReleaseYear(track.releaseDate) || null;
  const duration = track.durationMs ? formatTime(track.durationMs / 1000) : 
                  track.duration ? formatTime(track.duration) : null;

  return {
    genre,
    year,
    duration
  };
}
