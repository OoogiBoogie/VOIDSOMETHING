// components/game/VoidGameShell.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene3D } from "@/components/scene-3d";
import VoidHudApp from "@/hud/VoidHudApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { TerminalIntro } from "@/components/intro/TerminalIntro";
import { WalletGate } from "@/components/auth/WalletGate";
import { MiniAppManagerProvider } from "@/src/miniapps/MiniAppManager";
import { MiniAppContainer } from "@/src/miniapps/MiniAppContainer";
import { useVoidRuntime } from "@/src/runtime/VoidRuntimeProvider";

/**
 * VOID Game Shell - Integrates Terminal Intro + Wallet + 3D World + HUD
 * 
 * Phase 4.7 Production Net Protocol Flow:
 * 1. TerminalIntro - Terminal-style intro with password
 * 2. WalletGate - Enforces wallet connection (shows WalletTerminal if not connected)
 * 3. VoidRuntime - Loads on-chain profile and resumes progress (position, XP, level)
 * 4. Full 3D World + HUD with MiniApp support
 * 
 * Architecture:
 * - Bottom layer: Three.js Canvas with 3D world (Scene3D)
 * - Middle layer: HUD overlay (VoidHudApp) with pointer-events-none on container
 * - Top layer: MiniApp windows (pointer-events-auto)
 * 
 * CRITICAL: Wallet gate blocks world until wallet is connected.
 * Net Protocol profile is loaded on connect and position is restored from on-chain state.
 */
export default function VoidGameShell() {
  const isMobile = useIsMobile();
  const runtime = useVoidRuntime();
  
  // Intro flow state - single terminal intro, then wallet gate handles rest
  const [showTerminal, setShowTerminal] = useState(true);
  
  // Player state - initialize from Net Protocol profile if available
  const [playerPosition, setPlayerPosition] = useState(() => {
    // Default spawn position (Hub)
    return { x: 0, y: 1, z: 5 };
  });
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [mobileMovement, setMobileMovement] = useState({ x: 0, z: 0 });

  // Resume from Net Protocol profile when wallet connects
  useEffect(() => {
    if (runtime.netProfile) {
      const resumePosition = {
        x: runtime.netProfile.posX,
        y: runtime.netProfile.posY,
        z: runtime.netProfile.posZ,
      };
      
      console.log('[VoidGameShell] Resuming from Net Protocol position:', resumePosition);
      console.log('[VoidGameShell] Profile zone:', `(${runtime.netProfile.zoneX}, ${runtime.netProfile.zoneY})`);
      console.log('[VoidGameShell] Level:', runtime.netProfile.level, 'XP:', runtime.netProfile.xp.toString());
      
      setPlayerPosition(resumePosition);
    }
  }, [runtime.netProfile]);

  // Callbacks for 3D scene - save to Net Protocol
  const handlePlayerMove = useCallback((pos: { x: number; y: number; z: number }) => {
    setPlayerPosition(pos);
    
    // Save position to Net Protocol (auto-debounced in client)
    runtime.updatePosition(pos.x, pos.y, pos.z);
  }, [runtime]);

  const handleZoneEnter = useCallback((zone: any) => {
    setCurrentZone(zone);
    
    // Save zone change to Net Protocol
    if (zone?.gridX !== undefined && zone?.gridY !== undefined) {
      console.log('[VoidGameShell] Zone entered:', `(${zone.gridX}, ${zone.gridY})`);
      runtime.updateZone(zone.gridX, zone.gridY);
    }
  }, [runtime]);

  const handleZoneExit = useCallback(() => {
    setCurrentZone(null);
  }, []);

  // Intro flow handlers
  const handleTerminalComplete = useCallback(() => {
    setShowTerminal(false);
  }, []);

  // Show terminal intro first
  if (showTerminal) {
    return <TerminalIntro onComplete={handleTerminalComplete} />;
  }

  // Wallet Gate + MiniApp Provider wrap the world
  return (
    <WalletGate showTerminal={true}>
      <MiniAppManagerProvider>
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

          {/* HUD Overlay Layer (middle) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <VoidHudApp />
          </div>

          {/* MiniApp Container (top) */}
          <MiniAppContainer />

          {/* Mobile Touch Controls (if mobile) */}
          {isMobile && (
            <div className="absolute bottom-20 left-4 right-4 z-20 flex justify-between pointer-events-auto">
              {/* Virtual joystick would go here */}
              <div className="w-24 h-24 bg-black/30 rounded-full border border-cyan-500/50" />
              <div className="w-24 h-24 bg-black/30 rounded-full border border-purple-500/50" />
            </div>
          )}
        </div>
      </MiniAppManagerProvider>
    </WalletGate>
  );
}
