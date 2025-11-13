// components/game/VoidGameShell.tsx
"use client";

import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene3D } from "@/components/scene-3d";
import VoidHudApp from "@/hud/VoidHudApp";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * VOID Game Shell - Integrates 3D World + HUD Overlay
 * 
 * Architecture:
 * - Bottom layer: Three.js Canvas with 3D world (Scene3D)
 * - Top layer: HUD overlay (VoidHudApp) with pointer-events-none on container
 * - HUD interactive elements have pointer-events-auto
 */
export default function VoidGameShell() {
  const isMobile = useIsMobile();
  
  // Player state
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1, z: 5 });
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [mobileMovement, setMobileMovement] = useState({ x: 0, z: 0 });

  // Callbacks for 3D scene
  const handlePlayerMove = useCallback((pos: { x: number; y: number; z: number }) => {
    setPlayerPosition(pos);
  }, []);

  const handleZoneEnter = useCallback((zone: any) => {
    setCurrentZone(zone);
  }, []);

  const handleZoneExit = useCallback(() => {
    setCurrentZone(null);
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D World Layer (bottom) */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 15, 20], fov: 65 }}
          gl={{ 
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
          }}
          shadows
        >
          <Scene3D
            playerPosition={playerPosition}
            onPlayerMove={handlePlayerMove}
            onZoneEnter={handleZoneEnter}
            onZoneExit={handleZoneExit}
            controlsEnabled={true}
            mobileMovement={mobileMovement}
            isMobile={isMobile}
          />
        </Canvas>
      </div>

      {/* HUD Overlay Layer (top) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <VoidHudApp />
      </div>

      {/* Mobile Touch Controls (if mobile) */}
      {isMobile && (
        <div className="absolute bottom-20 left-4 right-4 z-20 flex justify-between pointer-events-auto">
          {/* Virtual joystick would go here */}
          <div className="w-24 h-24 bg-black/30 rounded-full border border-cyan-500/50" />
          <div className="w-24 h-24 bg-black/30 rounded-full border border-purple-500/50" />
        </div>
      )}
    </div>
  );
}
