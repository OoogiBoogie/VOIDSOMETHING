'use client';

/**
 * CRT Overlay - Optional fullscreen retro effects
 * 
 * Add this component anywhere in your app to enable CRT/scanline/noise effects
 * Can be toggled on/off globally
 */

import React, { useEffect, useRef } from 'react';

interface CRTOverlayProps {
  enabled?: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
  showScanlines?: boolean;
  showNoise?: boolean;
  showVignette?: boolean;
}

export function CRTOverlay({
  enabled = true,
  intensity = 'light',
  showScanlines = true,
  showNoise = true,
  showVignette = true,
}: CRTOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || !showNoise) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Noise animation
    let animationId: number;
    const drawNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      const noiseIntensity = 
        intensity === 'heavy' ? 25 :
        intensity === 'medium' ? 15 : 8;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * noiseIntensity;
        data[i] = noise;     // R
        data[i + 1] = noise; // G
        data[i + 2] = noise; // B
        data[i + 3] = noise; // A
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(drawNoise);
    };

    drawNoise();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
    };
  }, [enabled, showNoise, intensity]);

  if (!enabled) return null;

  const opacityClass = 
    intensity === 'heavy' ? 'opacity-[0.06]' :
    intensity === 'medium' ? 'opacity-[0.04]' : 'opacity-[0.02]';

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Animated noise canvas */}
      {showNoise && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 mix-blend-overlay ${opacityClass}`}
        />
      )}

      {/* Scanlines */}
      {showScanlines && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              rgba(0, 0, 0, ${intensity === 'heavy' ? '0.25' : intensity === 'medium' ? '0.15' : '0.08'}) 1px,
              transparent 2px
            )`,
          }}
        />
      )}

      {/* CRT vignette */}
      {showVignette && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
          }}
        />
      )}

      {/* Subtle screen curvature simulation */}
      {intensity === 'heavy' && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at top, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(0, 0, 0, 0.05) 0%, transparent 50%)
            `,
          }}
        />
      )}
    </div>
  );
}

/**
 * Chromatic Aberration Effect
 * Add slight RGB color separation to create retro CRT bleeding
 */
export function ChromaticAberrationOverlay({ 
  enabled = true,
  strength = 1
}: { 
  enabled?: boolean;
  strength?: number;
}) {
  if (!enabled) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9998] mix-blend-screen"
      style={{
        filter: `blur(${strength * 0.5}px)`,
        background: `
          radial-gradient(
            circle at 30% 30%,
            rgba(255, 0, 0, ${0.03 * strength}) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 70% 70%,
            rgba(0, 255, 255, ${0.03 * strength}) 0%,
            transparent 50%
          )
        `,
      }}
    />
  );
}

/**
 * VHS Tracking Lines (occasional glitch effect)
 * Shows rare horizontal distortion lines like VHS tracking errors
 */
export function VHSGlitchOverlay({ 
  enabled = true,
  frequency = 8000 // ms between glitches
}: { 
  enabled?: boolean;
  frequency?: number;
}) {
  const [glitching, setGlitching] = React.useState(false);

  useEffect(() => {
    if (!enabled) return;

    const triggerGlitch = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    };

    const interval = setInterval(triggerGlitch, frequency);
    return () => clearInterval(interval);
  }, [enabled, frequency]);

  if (!enabled || !glitching) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9997]">
      <div 
        className="absolute inset-0 vhs-distort"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              rgba(255, 255, 255, 0.1) ${Math.random() * 100}px,
              rgba(0, 255, 157, 0.15) ${Math.random() * 100 + 2}px,
              transparent ${Math.random() * 100 + 4}px
            )
          `,
        }}
      />
    </div>
  );
}
