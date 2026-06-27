import { useCallback, useEffect, useState } from 'react';

function getIsFullscreen(): boolean {
  return typeof document !== 'undefined' && document.fullscreenElement !== null;
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(getIsFullscreen);

  const isSupported =
    typeof document !== 'undefined' && document.fullscreenEnabled && !!document.documentElement.requestFullscreen;

  useEffect(() => {
    const handleChange = () => setIsFullscreen(getIsFullscreen());
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen request was denied or unsupported on this device — fail silently.
    }
  }, []);

  return { isFullscreen, isSupported, toggle };
}
