// hud/debug/useDebugToggle.ts
/**
 * Debug Overlay Toggle Hook
 * F3 to toggle debug overlay visibility (dev mode only)
 */

import { useState, useEffect } from 'react';

export function useDebugToggle() {
  const [isVisible, setIsVisible] = useState(false);
  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (!isDev) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDev]);

  return { isVisible: isDev && isVisible, toggle: () => setIsVisible(prev => !prev) };
}
