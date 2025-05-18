import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial matches value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Create a callback for changes
    const listener = () => {
      setMatches(media.matches);
    };
    
    // Add event listener
    media.addEventListener('change', listener);
    
    // Clean up listener on unmount
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [matches, query]);
  
  return matches;
} 