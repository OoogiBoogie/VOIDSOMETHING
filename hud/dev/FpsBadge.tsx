"use client";

import { useFps } from "./useFps";

/**
 * FPS Overlay Badge
 * 
 * Displays live frames per second in bottom-right corner
 * Uses voidTheme CSS variables for consistent styling
 * 
 * Enable with environment variable:
 * NEXT_PUBLIC_SHOW_FPS=1
 * 
 * Usage:
 * ```tsx
 * {process.env.NEXT_PUBLIC_SHOW_FPS === "1" && <FpsBadge />}
 * ```
 */
export function FpsBadge() {
  const fps = useFps();

  // Color based on performance
  const color =
    fps >= 55
      ? "var(--void-neon-teal)" // Good: 55+ FPS
      : fps >= 30
        ? "var(--void-neon-yellow)" // Acceptable: 30-54 FPS
        : "var(--void-neon-pink)"; // Poor: <30 FPS

  return (
    <div
      style={{
        position: "fixed",
        bottom: "12px",
        right: "12px",
        background: "var(--void-bg-dark)",
        border: `1px solid ${color}`,
        borderRadius: "4px",
        padding: "6px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: "14px",
        fontWeight: 600,
        color,
        zIndex: 9999,
        pointerEvents: "none",
        userSelect: "none",
        boxShadow: `0 0 8px ${color}40`,
      }}
    >
      {fps} FPS
    </div>
  );
}
