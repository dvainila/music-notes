import { useEffect, useState } from 'react';

// Only guard orientation on small/mobile-sized viewports — desktop windows
// resized tall-and-narrow shouldn't trigger the "rotate your device" prompt.
const MOBILE_QUERY = '(orientation: portrait) and (max-width: 900px)';

function getShouldPromptRotate(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function useShouldPromptRotate(): boolean {
  const [shouldPrompt, setShouldPrompt] = useState(getShouldPromptRotate);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = () => setShouldPrompt(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  return shouldPrompt;
}
