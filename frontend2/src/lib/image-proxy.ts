// Utility for handling profile images through proxy
export const getProxiedImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Check if it's a Google profile picture that needs proxying
  const needsProxy = 
    imageUrl.includes('googleusercontent.com') || 
    imageUrl.includes('lh3.googleusercontent.com') ||
    imageUrl.includes('lh4.googleusercontent.com') ||
    imageUrl.includes('lh5.googleusercontent.com') ||
    imageUrl.includes('lh6.googleusercontent.com');
    
  if (needsProxy) {
    // Use environment variable for backend URL, fallback to localhost for development
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1504';
    return `${backendUrl}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  }
  
  // For other image sources, use direct URL
  return imageUrl;
};

// Preload profile image to improve performance
export const preloadProfileImage = (imageUrl: string | null | undefined): void => {
  const proxiedUrl = getProxiedImageUrl(imageUrl);
  if (proxiedUrl) {
    const img = new Image();
    img.src = proxiedUrl;
  }
};
