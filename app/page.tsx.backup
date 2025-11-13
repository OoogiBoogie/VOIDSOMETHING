"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import { useOrientation } from "@/hooks/use-orientation";
import { useIsMobile } from "@/hooks/use-mobile";

// Core UI
import { HudShell, HudSection } from "@/components/ui/HudShell";
import { RoamHUD } from "@/components/hud/roam";
import { CRTOverlay } from "@/components/ui/crt-overlay";
import { LoadingScreen } from "@/components/loading-screen";
import { PhotosensitivityWarning } from "@/components/PhotosensitivityWarning";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { StartScreen } from "@/components/StartScreen";

// Screen Components
import {
  HomeScreen,
  LandMapScreen,
  RealEstateScreen,
  InventoryScreen,
  BusinessScreen,
  DAOScreen,
  SettingsScreen,
} from "@/components/screens";

// Mobile
import { MobileModeManager, MobileMode } from "@/components/mobile-mode-manager";

// 3D World
import { Scene3D } from "@/components/scene-3d";

// Modal/Overlay Systems
import { CasinoGame } from "@/components/casino-game";
import { MusicJukebox } from "@/components/music-jukebox";
import { VoiceChatSystem } from "@/components/voice-chat-system";
import { TippingSystem } from "@/components/tipping-system";
import { ProximityChat } from "@/components/proximity-chat";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import { XpDrawer } from "@/components/xp-drawer";

import type { PlayerXp, DailyTask } from "@/lib/xp/types";

/**
 * PSX-VOID MAIN APP (REFACTORED - FIXED)
 * Clean architecture with HudShell navigation + unified state management
 * All component prop interfaces aligned correctly
 */

export default function VOIDMetaverse() {
  // ========== ONBOARDING STATE ==========
  const [warningAccepted, setWarningAccepted] = useState<boolean | null>(null);
  const [introComplete, setIntroComplete] = useState<boolean | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // ========== NAVIGATION STATE (Consolidated) ==========
  const [currentSection, setCurrentSection] = useState<HudSection>('HOME');
  const [mobileMode, setMobileMode] = useState<MobileMode>('lite');
  const [hudMode, setHudMode] = useState<'roam' | 'lite'>('roam'); // NEW: ROAM vs LITE mode

  // ========== USER PROFILE (NEW for ROAM HUD) ==========
  const [username] = useState('Explorer'); // TODO: Get from auth
  const [pfpUrl] = useState<string | null>(null); // TODO: Get from DB
  const [onlineStatus] = useState<'online' | 'away' | 'dnd' | 'in-voice'>('online');

  // ========== PLAYER STATE ==========
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1, z: 5 });
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [mobileMovement, setMobileMovement] = useState({ x: 0, z: 0 });
  const [mobileSprinting, setMobileSprinting] = useState(false);

  // ========== WALLET & BALANCE ==========
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
    {
      id: "void-swap",
      label: "Void Trader",
      description: "Complete 1 trade on VOID DEX",
      xpReward: 50,
      progress: 0,
      target: 1,
      completed: false,
      track: "operator",
    },
  ]);

  // ========== MODAL STATE (Consolidated) ==========
  const [casinoOpen, setCasinoOpen] = useState(false);
  const [jukeboxOpen, setJukeboxOpen] = useState(false);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [tippingOpen, setTippingOpen] = useState(false);
  const [proximityChatOpen, setProximityChatOpen] = useState(false);

  // ========== CHAT/SOCIAL (NEW for ROAM HUD) ==========
  const [nearbyUserCount] = useState(12); // TODO: Real proximity calculation
  const [unreadProx] = useState(3); // TODO: Real unread count
  const [unreadGlobal] = useState(14); // TODO: Real unread count

  // ========== SETTINGS ==========
  const [crtEnabled, setCrtEnabled] = useState(true);

  // ========== DEVICE DETECTION ==========
  const isMobile = useIsMobile();
  const orientation = useOrientation();

  // ========== HANDLERS ==========
  const handleStartGame = () => {
    setGameStarted(true);
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

  // ========== KEYBOARD LISTENER: TAB to toggle HUD modes ==========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && gameStarted && !isMobile) {
        e.preventDefault();
        toggleHUDMode();
      }
      if (e.key === 'Escape' && hudMode === 'lite' && !isMobile) {
        e.preventDefault();
        setHudMode('roam');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isMobile, hudMode]);

  // ========== RENDER: ONBOARDING FLOW ==========
  if (warningAccepted === null) {
    return <PhotosensitivityWarning onAccept={() => setWarningAccepted(true)} />;
  }

  if (introComplete === null) {
    return <WelcomeScreen onComplete={() => setIntroComplete(true)} />;
  }

  if (!gameStarted) {
    return (
      <StartScreen
        onStart={handleStartGame}
      />
    );
  }

  // ========== RENDER: MAIN APP ==========
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* ========== 3D WORLD (Always rendered in background) ========== */}
      {gameStarted && (
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
      )}

      {/* ========== NEW: ROAM HUD (3D Exploration Mode) ========== */}
      {!isMobile && gameStarted && hudMode === 'roam' && (
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

      {/* ========== LITE HUD (Management/Phone Mode) ========== */}
      {!isMobile && gameStarted && hudMode === 'lite' && (
        <>
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
          
          {/* Back to ROAM button */}
          <button
            onClick={toggleHUDMode}
            className="fixed top-4 right-4 z-[60] px-4 py-2 bg-black/80 border border-white/20 rounded-lg text-white hover:border-cyan-500/50 transition-colors"
          >
            ← Back to ROAM (ESC)
          </button>
        </>
      )}

      {/* ========== MOBILE HUD (LITE + ROAM modes) ========== */}
      {isMobile && gameStarted && (
        <MobileModeManager
          initialMode={mobileMode}
          playerPosition={{ x: playerPosition.x, z: playerPosition.z }}
          currentZone={currentZone}
          voidBalance={voidBalance}
        />
      )}

      {/* ========== MODAL OVERLAYS (Cross-platform) ========== */}
      <AnimatePresence>
        {/* Casino */}
        {casinoOpen && (
          <CasinoGame
            onClose={() => setCasinoOpen(false)}
            voidBalance={voidBalance}
            onBalanceChange={setVoidBalance}
          />
        )}

        {/* Music Jukebox */}
        {jukeboxOpen && (
          <MusicJukebox
            isOpen={jukeboxOpen}
            onClose={() => setJukeboxOpen(false)}
            voidBalance={voidBalance}
            onVote={(trackId: string) => console.log('Voted for:', trackId)}
          />
        )}

        {/* Voice Chat */}
        {voiceChatOpen && (
          <VoiceChatSystem
            currentPosition={{ x: playerPosition.x, z: playerPosition.z }}
            isOpen={voiceChatOpen}
            onClose={() => setVoiceChatOpen(false)}
          />
        )}

        {/* Tipping - requires a selected player */}
        {tippingOpen && (
          <TippingSystem
            targetPlayer={{ id: "demo", name: "Demo Player", wallet: "0x..." }}
            userBalance={voidBalance}
            isOpen={tippingOpen}
            onClose={() => setTippingOpen(false)}
            onTip={(amount: number) => {
              setVoidBalance(prev => prev - amount);
              setTippingOpen(false);
            }}
          />
        )}

        {/* Proximity Chat */}
        {proximityChatOpen && (
          <ProximityChat
            playerPosition={{ x: playerPosition.x, z: playerPosition.z }}
            currentZone={currentZone}
            isOpen={proximityChatOpen}
            onClose={() => setProximityChatOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ========== ALWAYS-VISIBLE COMPONENTS ========== */}
      
      {/* Performance Dashboard (minimized by default) */}
      <PerformanceDashboard isMinimized={true} />

      {/* XP Drawer (always available) */}
      <XpDrawer xp={playerXp} tasks={dailyTasks} />

      {/* CRT Overlay */}
      {crtEnabled && <CRTOverlay />}

      {/* Loading indicator if needed */}
      {!gameStarted && <LoadingScreen />}
    </div>
  );
}
