import { useEffect, useState, useRef } from "react";

/**
 * Performance Monitor Hook
 * 
 * Tracks frames per second using requestAnimationFrame
 * Updates state once per second
 * 
 * Usage:
 * ```tsx
 * const fps = useFps();
 * return <div>FPS: {fps}</div>;
 * ```
 */
export function useFps(): number {
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    function countFrame() {
      if (!mounted) return;

      frameCountRef.current++;

      const now = Date.now();
      const elapsed = now - lastTimeRef.current;

      // Update FPS every 1000ms
      if (elapsed >= 1000) {
        const currentFps = Math.round(
          (frameCountRef.current * 1000) / elapsed
        );
        setFps(currentFps);

        // Reset counters
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      // Continue loop
      rafIdRef.current = requestAnimationFrame(countFrame);
    }

    // Start loop
    rafIdRef.current = requestAnimationFrame(countFrame);

    return () => {
      mounted = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return fps;
}
