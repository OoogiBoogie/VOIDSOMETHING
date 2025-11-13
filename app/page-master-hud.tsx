/**
 * PSX-VOID METAVERSE - MASTER HUD SYSTEM
 * 
 * ARCHITECTURE:
 * - Intro Pipeline: Warning → Cinematic → Password → Wallet → User Info → World
 * - Two Modes: ROAM (3D exploration, center clear) + LITE (phone UI on PC, native on mobile)
 * - Chat + Tipping: Always accessible (0-1 clicks)
 * - Profile + PFP: Always visible
 * - High-Engagement UX: Smooth, rewarding, respectful
 */

"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

// INTRO PIPELINE (Steps 1-5)
import { PhotosensitivityWarning } from "@/components/PhotosensitivityWarning";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { StartScreen } from "@/components/StartScreen";

// HUD SYSTEM
import { RoamHUD } from "@/components/hud/roam/RoamHUD";
import { HudShell, HudSection } from "@/components/ui/HudShell"; // LITE mode (existing)
import {
  HomeScreen,
  LandMapScreen,
  RealEstateScreen,
  InventoryScreen,
  BusinessScreen,
  DAOScreen,
  SettingsScreen,
} from "@/components/screens";

// 3D WORLD
import { Scene3D } from "@/components/scene-3d";

// OVERLAYS & SYSTEMS
import { CRTOverlay } from "@/components/ui/crt-overlay";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import { XpDrawer } from "@/components/xp-drawer";

// TYPES
import type { PlayerXp, DailyTask } from "@/lib/xp/types";

type IntroState = 'warning' | 'cinematic' | 'password' | 'wallet' | 'userInfo' | 'world';
type HUDMode = 'roam' | 'lite';

export default function VOIDMetaverse() {
  
  // ========== INTRO FLOW STATE ==========
  const [introState, setIntroState] = useState<IntroState>('warning');
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // ========== HUD MODE (ROAM vs LITE) ==========
  const [hudMode, setHudMode] = useState<HUDMode>('roam');
  const [currentSection, setCurrentSection] = useState<HudSection>('HOME');

  // ========== PLAYER DATA ==========
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1, z: 5 });
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [mobileMovement, setMobileMovement] = useState({ x: 0, z: 0 });
  const [mobileSprinting, setMobileSprinting] = useState(false);

  // ========== USER PROFILE ==========
  const [username] = useState('CryptoKnight'); // TODO: Real user data
  const [pfpUrl] = useState<string | null>(null); // TODO: Real PFP
  const [onlineStatus] = useState<'online' | 'away' | 'dnd' | 'in-voice'>('online');

  // ========== WALLET & ECONOMY ==========
  const [voidBalance, setVoidBalance] = useState(10500);

  // ========== XP SYSTEM ==========
  const [playerXp] = useState<PlayerXp>({
    totalXp: 2450,
    explorerXp: 1100,
    builderXp: 750,
    operatorXp: 600,
    level: 12,
  });

  const [dailyTasks] = useState<DailyTask[]>([
    {
      id: "login",
      label: "Daily Login",
      description: "Log in to PSX-VOID",
      xpReward: 25,
      progress: 1,
      target: 1,
      completed: true,
      track: "explorer",
    },
    {
      id: "walk-500m",
      label: "Steps in the VOID",
      description: "Walk 500m in the city",
      xpReward: 40,
      progress: 0,
      target: 500,
      completed: false,
      track: "explorer",
    },
  ]);

  // ========== CHAT/SOCIAL ==========
  const [nearbyUserCount] = useState(12);
  const [unreadProx] = useState(3);
  const [unreadGlobal] = useState(14);

  // ========== SETTINGS ==========
  const [crtEnabled, setCrtEnabled] = useState(true);

  // ========== DEVICE DETECTION ==========
  const isMobile = useIsMobile();

  // ========== HANDLERS ==========
  
  const handleStartGame = () => {
    setGameStarted(true);
    setIntroState('world');
  };

  const toggleHUDMode = () => {
    setHudMode(prev => prev === 'roam' ? 'lite' : 'roam');
  };

  const handleOpenProfile = () => {
    setHudMode('lite');
    setCurrentSection('SETTINGS'); // YOU tab equivalent
  };

  const handleOpenSettings = () => {
    setHudMode('lite');
    setCurrentSection('SETTINGS');
  };

  // ========== INTRO PIPELINE RENDERING ==========

  // Step 1: Warning Screen
  if (introState === 'warning' && !warningAccepted) {
    return (
      <PhotosensitivityWarning 
        onAccept={() => {
          setWarningAccepted(true);
          setIntroState('cinematic');
        }} 
      />
    );
  }

  // Step 2: Cinematic Intro
  if (introState === 'cinematic' && !introComplete) {
    return (
      <WelcomeScreen 
        onComplete={() => {
          setIntroComplete(true);
          setIntroState('password');
        }} 
      />
    );
  }

  // Step 3: Password Terminal (using StartScreen for now)
  // TODO: Create dedicated PasswordTerminal component
  if (introState === 'password' || introState === 'wallet' || introState === 'userInfo') {
    if (!gameStarted) {
      return <StartScreen onStart={handleStartGame} />;
    }
  }

  // ========== MAIN APP (Step 6: 3D World + HUD) ==========
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      
      {/* ========== 3D WORLD (Always rendered in background) ========== */}
      <Canvas
        camera={{ position: [0, 50, 50], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <Scene3D
          playerPosition={playerPosition}
          onPlayerMove={setPlayerPosition}
          onZoneEnter={setCurrentZone}
          onZoneExit={() => setCurrentZone(null)}
          mobileMovement={mobileMovement}
          mobileSprinting={mobileSprinting}
          isMobile={isMobile}
          controlsEnabled={hudMode === 'roam'} // Disable controls in LITE mode
        />
      </Canvas>

      {/* ========== HUD LAYER ========== */}
      
      {/* ROAM HUD (3D exploration mode) */}
      {hudMode === 'roam' && (
        <RoamHUD
          playerPosition={playerPosition}
          playerXp={playerXp}
          voidBalance={voidBalance}
          username={username}
          pfpUrl={pfpUrl}
          onlineStatus={onlineStatus}
          onOpenLiteMode={toggleHUDMode}
          onOpenProfile={handleOpenProfile}
          onOpenSettings={handleOpenSettings}
          nearbyUserCount={nearbyUserCount}
          unreadProx={unreadProx}
          unreadGlobal={unreadGlobal}
        />
      )}

      {/* LITE HUD (Phone UI / Management mode) */}
      {hudMode === 'lite' && !isMobile && (
        <HudShell
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        >
          {currentSection === 'HOME' && <HomeScreen />}
          {currentSection === 'LAND' && <LandMapScreen />}
          {currentSection === 'REALESTATE' && <RealEstateScreen />}
          {currentSection === 'INVENTORY' && <InventoryScreen />}
          {currentSection === 'BUSINESS' && <BusinessScreen />}
          {currentSection === 'DAO' && <DAOScreen />}
          {currentSection === 'SETTINGS' && <SettingsScreen />}
        </HudShell>
      )}

      {/* TODO: Mobile LITE mode (native app UI) */}
      {hudMode === 'lite' && isMobile && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-2xl mb-4">📱 Mobile LITE Mode</div>
            <p className="text-white/60 mb-8">Coming soon: Native app interface</p>
            <button
              onClick={toggleHUDMode}
              className="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Back to ROAM
            </button>
          </div>
        </div>
      )}

      {/* ========== ALWAYS-VISIBLE OVERLAYS ========== */}

      {/* XP Drawer (always available) */}
      <XpDrawer xp={playerXp} tasks={dailyTasks} />

      {/* Performance Dashboard (minimized by default) */}
      <PerformanceDashboard isMinimized={true} />

      {/* CRT Overlay (optional) */}
      {crtEnabled && <CRTOverlay />}

      {/* LITE Mode Toggle (ESC to return to ROAM) */}
      {hudMode === 'lite' && (
        <button
          onClick={toggleHUDMode}
          className="fixed top-4 right-4 z-[60] px-4 py-2 bg-black/80 border border-white/20 rounded-lg text-white hover:border-cyan-500/50 transition-colors"
        >
          ← Back to ROAM (ESC)
        </button>
      )}
    </div>
  );
}
