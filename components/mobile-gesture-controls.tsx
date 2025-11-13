"use client";

import React, { useRef, useState, useEffect } from 'react';

/**
 * MOBILE GESTURE CONTROLS
 * Advanced touch gestures for ROAM mode 3D navigation
 * - Pinch to zoom
 * - Drag to rotate camera
 * - Double tap to reset view
 * - Tap to select parcel
 */

interface MobileGestureControlsProps {
  children: React.ReactNode;
  onCameraRotate?: (deltaX: number, deltaY: number) => void;
  onCameraZoom?: (scale: number) => void;
  onCameraReset?: () => void;
  onTap?: (x: number, y: number) => void;
  enabled?: boolean;
  className?: string;
}

interface Touch {
  x: number;
  y: number;
  id: number;
}

export function MobileGestureControls({
  children,
  onCameraRotate,
  onCameraZoom,
  onCameraReset,
  onTap,
  enabled = true,
  className = '',
}: MobileGestureControlsProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [lastTap, setLastTap] = useState(0);
  const [touches, setTouches] = useState<Touch[]>([]);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [lastTouchPos, setLastTouchPos] = useState<{ x: number; y: number } | null>(null);

  // Calculate distance between two touches (for pinch)
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch start handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;

    const newTouches: Touch[] = Array.from(e.touches).map(t => ({
      x: t.clientX,
      y: t.clientY,
      id: t.identifier,
    }));
    setTouches(newTouches);

    if (e.touches.length === 2) {
      // Two fingers - start pinch
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
    } else if (e.touches.length === 1) {
      // One finger - start drag
      setLastTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  // Touch move handler
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enabled) return;
    e.preventDefault();

    if (e.touches.length === 2 && initialPinchDistance) {
      // Pinch zoom
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance;
      onCameraZoom?.(scale);
    } else if (e.touches.length === 1 && lastTouchPos) {
      // Drag rotate
      const deltaX = e.touches[0].clientX - lastTouchPos.x;
      const deltaY = e.touches[0].clientY - lastTouchPos.y;
      
      onCameraRotate?.(deltaX * 0.5, deltaY * 0.5);
      
      setLastTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  // Touch end handler
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enabled) return;

    if (e.touches.length === 0) {
      // All fingers lifted
      setInitialPinchDistance(null);
      setLastTouchPos(null);

      // Check for double tap
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTap < DOUBLE_TAP_DELAY) {
        // Double tap - reset camera
        onCameraReset?.();
      } else {
        // Single tap - select parcel (if it was a tap, not a drag)
        if (e.changedTouches.length > 0) {
          const rect = targetRef.current?.getBoundingClientRect();
          if (rect) {
            const touch = e.changedTouches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            onTap?.(x, y);
          }
        }
      }

      setLastTap(now);
    } else if (e.touches.length === 1) {
      // One finger remaining
      setInitialPinchDistance(null);
      setLastTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  return (
    <div
      ref={targetRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`touch-none select-none ${className}`}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </div>
  );
}

/**
 * USAGE EXAMPLE:
 * 
 * ```tsx
 * import { MobileGestureControls } from '@/components/mobile-gesture-controls';
 * import { Canvas } from '@react-three/fiber';
 * 
 * function RoamView() {
 *   const cameraRef = useRef();
 *   
 *   const handleRotate = (dx: number, dy: number) => {
 *     if (cameraRef.current) {
 *       cameraRef.current.rotation.y += dx * 0.01;
 *       cameraRef.current.rotation.x += dy * 0.01;
 *     }
 *   };
 *   
 *   const handleZoom = (scale: number) => {
 *     if (cameraRef.current) {
 *       cameraRef.current.position.z = 50 / scale;
 *     }
 *   };
 *   
 *   return (
 *     <MobileGestureControls
 *       onCameraRotate={handleRotate}
 *       onCameraZoom={handleZoom}
 *       onCameraReset={() => resetCamera()}
 *       onTap={(x, y) => handleParcelClick(x, y)}
 *     >
 *       <Canvas>
 *         <PerspectiveCamera ref={cameraRef} position={[0, 50, 50]} />
 *         <CybercityWorld />
 *       </Canvas>
 *     </MobileGestureControls>
 *   );
 * }
 * ```
 */

/**
 * USAGE EXAMPLE:
 * 
 * ```tsx
 * import { MobileGestureControls } from '@/components/mobile-gesture-controls';
 * import { Canvas } from '@react-three/fiber';
 * 
 * function RoamView() {
 *   const cameraRef = useRef();
 *   
 *   const handleRotate = (dx: number, dy: number) => {
 *     if (cameraRef.current) {
 *       cameraRef.current.rotation.y += dx * 0.01;
 *       cameraRef.current.rotation.x += dy * 0.01;
 *     }
 *   };
 *   
 *   const handleZoom = (scale: number) => {
 *     if (cameraRef.current) {
 *       cameraRef.current.position.z = 50 / scale;
 *     }
 *   };
 *   
 *   return (
 *     <MobileGestureControls
 *       onCameraRotate={handleRotate}
 *       onCameraZoom={handleZoom}
 *       onCameraReset={() => resetCamera()}
 *       onTap={(x, y) => handleParcelClick(x, y)}
 *     >
 *       <Canvas>
 *         <PerspectiveCamera ref={cameraRef} position={[0, 50, 50]} />
 *         <CybercityWorld />
 *       </Canvas>
 *     </MobileGestureControls>
 *   );
 * }
 * ```
 */
