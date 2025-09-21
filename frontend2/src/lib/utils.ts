export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout>;
  
  const debouncedFunc = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debouncedFunc;
}

export function extractColorsFromImage(imageUrl: string): Promise<{ primary: string; secondary: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({ primary: '#1C1C1E', secondary: '#121212' });
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractDominantColors(imageData.data);
        resolve(colors);
      } catch {
        resolve({ primary: '#1C1C1E', secondary: '#121212' });
      }
    };
    
    img.onerror = () => {
      resolve({ primary: '#1C1C1E', secondary: '#121212' });
    };
    
    img.src = imageUrl;
  });
}

function extractDominantColors(imageData: Uint8ClampedArray): { primary: string; secondary: string } {
  const colorMap = new Map<string, number>();
  
  // Sample every 10th pixel for performance
  for (let i = 0; i < imageData.length; i += 40) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const alpha = imageData[i + 3];
    
    if (alpha < 128) continue; // Skip transparent pixels
    
    // Group similar colors
    const groupedR = Math.floor(r / 32) * 32;
    const groupedG = Math.floor(g / 32) * 32;
    const groupedB = Math.floor(b / 32) * 32;
    
    const color = `${groupedR},${groupedG},${groupedB}`;
    colorMap.set(color, (colorMap.get(color) || 0) + 1);
  }
  
  // Get the most frequent colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  
  if (sortedColors.length === 0) {
    return { primary: '#1C1C1E', secondary: '#121212' };
  }
  
  const primary = sortedColors[0] ? `rgb(${sortedColors[0][0]})` : '#1C1C1E';
  const secondary = sortedColors[1] ? `rgb(${sortedColors[1][0]})` : '#121212';
  
  return { primary, secondary };
}

export function getRandomColor(): string {
  const colors = [
    '#FF2D55', '#007AFF', '#34C759', '#FF9500',
    '#AF52DE', '#FF3B30', '#5856D6', '#FF2D92',
    '#64D2FF', '#30D158', '#FFD60A', '#BF5AF2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}
