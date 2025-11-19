// components/game/VoidGameShell.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene3D } from "@/components/scene-3d";
import VoidHudApp from "@/hud/VoidHudApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { TerminalIntro } from "@/components/intro/TerminalIntro";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/providers/simple-wallet-provider";
import { MiniAppManagerProvider } from "@/src/miniapps/MiniAppManager";
import { MiniAppContainer } from "@/src/miniapps/MiniAppContainer";
import { useVoidRuntime } from "@/src/runtime/VoidRuntimeProvider";
import { PlayerPositionProvider, usePlayerPosition, type PlayerPosition } from "@/contexts/PlayerPositionContext";
import { getParcelInfo } from "@/world/WorldCoords";
import { 
  emitWorldEvent,
  WorldEventType,
  type ParcelEnteredEvent,
  type DistrictEnteredEvent,
} from "@/world/worldEvents";
import { xpEngine } from "@/world/xp";
import { achievementEngine } from "@/world/achievements";
import { airdropEngine } from "@/world/airdrop";
import { useChainId } from "wagmi";

/**
 * VOID Game Shell - Integrates Terminal Intro + Wallet + 3D World + HUD
 * 
 * Phase 4.7 Production Net Protocol Flow:
 * 1. TerminalIntro - Terminal-style intro with password
 * 2. WalletGate - Enforces wallet connection (shows WalletTerminal if not connected)
 * 3. VoidRuntime - Loads on-chain profile and resumes progress (position, XP, level)
 * 4. Full 3D World + HUD with MiniApp support
 * 
 * Phase 5.1 World Events:
 * - Tracks parcel transitions (move/teleport)
 * - Emits PARCEL_ENTERED events
 * - HUD components subscribe for real-time notifications
 * 
 * Architecture:
 * - Bottom layer: Three.js Canvas with 3D world (Scene3D)
 * - Middle layer: HUD overlay (VoidHudApp) with pointer-events-none on container
 * - Top layer: MiniApp windows (pointer-events-auto)
 * 
 * CRITICAL: Wallet gate blocks world until wallet is connected.
 * Net Protocol profile is loaded on connect and position is restored from on-chain state.
 */
const positionsEqual = (a: PlayerPosition, b: PlayerPosition) => {
  return Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01 && Math.abs(a.z - b.z) < 0.01;
};

function VoidGameShellInner() {
  const isMobile = useIsMobile();
  const runtime = useVoidRuntime();
  const { position: sharedPosition, source, syncFromWorld } = usePlayerPosition();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  
  // Log connection state changes
  useEffect(() => {
    console.log('[VoidGameShell] Connection state:', { isConnected, address: address?.slice(0, 6) });
  }, [isConnected, address]);

  // PHASE 6: Start progression engines when wallet connects
  useEffect(() => {
    if (!address) return;

    const isMainnet = chainId === 8453; // Base mainnet
    const hasProfile = runtime.netProfile !== null; // Has Net Protocol profile
    const isBeta = false; // TODO: Check beta user status

    console.log('[VoidGameShell] Starting Phase 6 engines...', { 
      address: address.slice(0, 6), 
      isMainnet, 
      hasProfile 
    });

    xpEngine.start(address);
    achievementEngine.start(address, isMainnet);
    airdropEngine.start(address, hasProfile, isBeta);

    return () => {
      console.log('[VoidGameShell] Stopping Phase 6 engines...');
      xpEngine.stop();
      achievementEngine.stop();
      airdropEngine.stop();
    };
  }, [address, chainId, runtime.netProfile]);
  
  // Terminal intro gate restored
  const [showTerminal, setShowTerminal] = useState(true);
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [mobileMovement, setMobileMovement] = useState({ x: 0, z: 0 });

  // PHASE 5: Track previous parcel AND district for comprehensive event emission
  const prevParcelRef = useRef<{ 
    parcelId: number | null; 
    districtId: string | null;
    enteredAt: number | null;
  }>({
    parcelId: null,
    districtId: null,
    enteredAt: null,
  });

  const visitedParcels = useRef<Set<number>>(new Set());
  const visitedDistricts = useRef<Set<string>>(new Set());

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
      
      if (!positionsEqual(sharedPosition, resumePosition)) {
        syncFromWorld(resumePosition);
      }
    }
  }, [runtime.netProfile, sharedPosition, syncFromWorld]);

  // PHASE 5: Detect parcel AND district changes, emit comprehensive events
  useEffect(() => {
    if (!sharedPosition) return;

    // Get current parcel info from world coordinates
    const parcelInfo = getParcelInfo({ x: sharedPosition.x, z: sharedPosition.z });
    const currentParcelId = parcelInfo.id;
    const currentDistrictId = parcelInfo.district;
    const now = Date.now();

    const prev = prevParcelRef.current;

    // Check if PARCEL has changed
    if (currentParcelId !== prev.parcelId && currentParcelId !== null) {
      const isFirstVisit = !visitedParcels.current.has(currentParcelId);
      
      if (isFirstVisit) {
        visitedParcels.current.add(currentParcelId);
      }

      // Emit PARCEL_ENTERED event
      const parcelEvent: ParcelEnteredEvent = {
        type: WorldEventType.PARCEL_ENTERED,
        timestamp: now,
        sessionId: runtime.wallet || undefined,
        walletAddress: (runtime.wallet as `0x${string}`) || undefined,
        parcelId: currentParcelId.toString(),
        parcelCoords: parcelInfo.coords,
        districtId: currentDistrictId,
        worldPosition: {
          x: sharedPosition.x,
          y: sharedPosition.y,
          z: sharedPosition.z,
        },
        previousParcelId: prev.parcelId?.toString(),
        isFirstVisit,
      };

      emitWorldEvent(parcelEvent);

      // Update prev ref
      prevParcelRef.current.parcelId = currentParcelId;
      prevParcelRef.current.enteredAt = now;
    }

    // Check if DISTRICT has changed
    if (currentDistrictId !== prev.districtId && currentDistrictId !== null) {
      const isFirstVisit = !visitedDistricts.current.has(currentDistrictId);
      
      if (isFirstVisit) {
        visitedDistricts.current.add(currentDistrictId);
      }

      // Emit DISTRICT_ENTERED event
      const districtEvent: DistrictEnteredEvent = {
        type: WorldEventType.DISTRICT_ENTERED,
        timestamp: now,
        sessionId: runtime.wallet || undefined,
        walletAddress: (runtime.wallet as `0x${string}`) || undefined,
        districtId: currentDistrictId,
        districtName: currentDistrictId.toUpperCase(),
        parcelId: currentParcelId.toString(),
        worldPosition: {
          x: sharedPosition.x,
          y: sharedPosition.y,
          z: sharedPosition.z,
        },
        previousDistrictId: prev.districtId || undefined,
        isFirstVisit,
      };

      emitWorldEvent(districtEvent);

      // Update prev ref
      prevParcelRef.current.districtId = currentDistrictId;
    }
  }, [sharedPosition, runtime.wallet]);

  // If UI requested teleport, push to runtime + mark handled
  useEffect(() => {
    if (source !== 'ui') return;
    if (!sharedPosition) return;

    console.log('[VoidGameShell] Teleport requested from HUD:', sharedPosition);
    runtime.updatePosition(sharedPosition.x, sharedPosition.y, sharedPosition.z);
    syncFromWorld(sharedPosition);
  }, [sharedPosition, source, runtime, syncFromWorld]);

  // Callbacks for 3D scene - save to Net Protocol
  const handlePlayerMove = useCallback((pos: { x: number; y: number; z: number }) => {
    if (!positionsEqual(sharedPosition, pos)) {
      syncFromWorld(pos);
    }

    runtime.updatePosition(pos.x, pos.y, pos.z);
  }, [runtime, sharedPosition, syncFromWorld]);

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

  // WALLET GATE - Must connect wallet to enter
  if (!isConnected || !address) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          {/* Terminal-style wallet connect screen */}
          <div className="border-2 border-cyan-500/50 bg-black/90 p-8 font-mono shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <div className="text-cyan-500 mb-6">
              <div className="text-3xl mb-2 font-bold">▲ WALLET REQUIRED</div>
              <div className="text-sm text-cyan-500/70 mb-4">
                &gt; Select your wallet to enter THE VOID
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-300 mb-8 bg-black/40 p-4 rounded border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span>
                <span>MetaMask • Phantom • Base Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span>
                <span>Progress saved on-chain</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span>
                <span>Web3 identity & rewards</span>
              </div>
            </div>

            {/* RainbowKit Connect Button - Opens wallet selector modal */}
            <div className="flex justify-center">
              <ConnectButton />
            </div>

            <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
              <div>New to Web3? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">Get MetaMask</a></div>
              <div className="text-gray-600">Your wallet = your passport to THE VOID</div>
            </div>
            
            {/* Privacy notice for auto-connect issues */}
            <div className="mt-4 text-xs text-yellow-500/70 bg-yellow-500/5 border border-yellow-500/20 p-3 rounded">
              <div className="font-bold mb-1">⚠ Auto-connecting?</div>
              <div className="text-gray-400">
                Open your wallet extension → Settings → Trusted Apps → 
                Remove "localhost:3000" to require approval each time.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WALLET CONNECTED - Render the world
  return (
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
                playerPosition={sharedPosition}
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

          {/* MiniApp Container (top) - above HUD */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <MiniAppContainer />
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
      </MiniAppManagerProvider>
  );
}

// Wrap with PlayerPositionProvider
export default function VoidGameShell() {
  return (
    <PlayerPositionProvider>
      <VoidGameShellInner />
    </PlayerPositionProvider>
  );
}
