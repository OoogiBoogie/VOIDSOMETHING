"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { 
  Maximize2, Minimize2, Map, Navigation, 
  Eye, EyeOff, Settings, X, ChevronUp
} from 'lucide-react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';

/**
 * MOBILE ROAM MODE
 * Immersive world-first view with minimal overlay & gesture controls
 * Designed for exploration and 3D navigation
 */

interface MobileRoamViewProps {
  // Player state
  playerPosition: { x: number; z: number };
  currentZone?: any;
  
  // Selected parcel (shared state with LITE mode)
  selectedParcelId?: string | null;
  onParcelSelect?: (parcelId: string | null) => void;
  
  // Actions
  onToggleMode?: () => void; // Switch back to LITE
  onQuickAction?: (action: string) => void;
  
  // User info
  userProfile?: any;
  voidBalance?: number;
  psxBalance?: number;
}

export function MobileRoamView({
  playerPosition,
  currentZone,
  selectedParcelId,
  onParcelSelect,
  onToggleMode,
  onQuickAction,
  userProfile,
  voidBalance = 0,
  psxBalance = 0,
}: MobileRoamViewProps) {
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [hudVisible, setHudVisible] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  // Gesture state for camera control
  const rotationY = useMotionValue(0);
  const zoom = useMotionValue(1);

  // Double tap to toggle HUD
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      setHudVisible(!hudVisible);
    }
    setLastTap(now);
  };

  // Pinch to zoom (handled by parent 3D component, but we track state)
  const handlePinch = (scale: number) => {
    zoom.set(Math.max(0.5, Math.min(2, scale)));
  };

  return (
    <div 
      className="fixed inset-0 z-40 bg-transparent"
      onClick={handleDoubleTap}
    >
      {/* ========== MINIMAL HUD OVERLAY ========== */}
      {hudVisible && (
        <>
          {/* Top Bar - Mode Switch & Quick Info */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-50 p-3 flex items-start justify-between pointer-events-auto"
          >
            {/* Mode Switcher - Switch to LITE */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMode?.();
              }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-[0_0_30px_rgba(255,0,50,0.8)] border-2 border-[#ff0032]"
              style={{
                background: "linear-gradient(135deg, rgba(255, 0, 50, 0.3), rgba(123, 0, 255, 0.3))",
                backdropFilter: "blur(10px)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span className="text-xl">📱</span>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-[#ff0032] font-mono font-black tracking-widest leading-none">
                  LITE
                </span>
                <span className="text-[7px] text-gray-400 font-mono">TAP</span>
              </div>
            </motion.button>

            {/* Quick Info - Position & Zone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg px-3 py-2 bg-black/60 backdrop-blur-md border border-[#00f0ff]/30"
            >
              <div className="text-right">
                <p className="text-[#00f0ff] text-[10px] font-mono font-bold">
                  [{Math.floor(playerPosition.x)}, {Math.floor(playerPosition.z)}]
                </p>
                <p className="text-white/60 text-[8px] font-mono">
                  {currentZone?.name || 'Unknown Zone'}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Mini-Map Bubble (Upper Right) */}
          {minimapVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 50, y: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 50, y: -50 }}
              className="absolute top-20 right-3 z-50 pointer-events-auto"
            >
              <div className="w-32 h-32 rounded-2xl bg-black/80 backdrop-blur-lg border-2 border-[#00f0ff]/50 p-2 shadow-[0_0_40px_rgba(0,240,255,0.6)]">
                {/* Mini-map content - simplified grid */}
                <div className="w-full h-full relative bg-gradient-to-br from-black/40 to-[#0a0014]/40 rounded-lg overflow-hidden">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-px opacity-30">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="bg-[#00f0ff]/20" />
                    ))}
                  </div>
                  
                  {/* Player position indicator */}
                  <motion.div
                    className="absolute w-3 h-3 rounded-full bg-[#ff0032] shadow-[0_0_10px_rgba(255,0,50,1)]"
                    style={{
                      left: `${((playerPosition.x % 40) / 40) * 100}%`,
                      top: `${((playerPosition.z % 40) / 40) * 100}%`,
                    }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />

                  {/* Compass indicator */}
                  <div className="absolute top-1 left-1">
                    <Navigation className="w-3 h-3 text-[#00f0ff]" style={{ transform: 'rotate(0deg)' }} />
                  </div>
                </div>

                {/* Toggle minimap visibility button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimapVisible(false);
                  }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-black/80 border border-[#00f0ff]/30 flex items-center justify-center"
                >
                  <Minimize2 className="w-3 h-3 text-[#00f0ff]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Restore minimap button (if hidden) */}
          {!minimapVisible && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                setMinimapVisible(true);
              }}
              className="absolute top-20 right-3 z-50 w-10 h-10 rounded-full bg-black/80 backdrop-blur-md border border-[#00f0ff]/30 flex items-center justify-center pointer-events-auto"
            >
              <Map className="w-5 h-5 text-[#00f0ff]" />
            </motion.button>
          )}

          {/* Bottom HUD - Parcel Info & Quick Actions */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-50 p-3 pointer-events-auto"
          >
            {/* Selected Parcel Info */}
            {selectedParcelId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-3 rounded-xl bg-black/80 backdrop-blur-lg border border-[#00f0ff]/30 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
                    <h4 className="text-white font-orbitron font-bold text-sm">
                      {selectedParcelId}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onParcelSelect?.(null);
                    }}
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                {/* Quick Actions Row */}
                <div className="flex gap-2">
                  <QuickActionBtn 
                    label="View" 
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => onQuickAction?.('view')}
                  />
                  <QuickActionBtn 
                    label="Info" 
                    icon={<Settings className="w-4 h-4" />}
                    onClick={() => onQuickAction?.('info')}
                  />
                  <QuickActionBtn 
                    label="Buy" 
                    icon={<ChevronUp className="w-4 h-4" />}
                    onClick={() => onQuickAction?.('buy')}
                  />
                </div>
              </motion.div>
            )}

            {/* Wallet Info Bar */}
            <div className="rounded-xl bg-black/80 backdrop-blur-lg border border-[#7b00ff]/30 p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* VOID Balance */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff0032] to-[#7b00ff] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">V</span>
                  </div>
                  <div>
                    <p className="text-[8px] text-white/40 font-mono">VOID</p>
                    <p className="text-sm font-bold text-white font-mono">
                      {(voidBalance / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>

                {/* PSX Balance */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7b00ff] to-[#00f0ff] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">P</span>
                  </div>
                  <div>
                    <p className="text-[8px] text-white/40 font-mono">PSX</p>
                    <p className="text-sm font-bold text-white font-mono">
                      {(psxBalance / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>

              {/* Hide HUD Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHudVisible(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <EyeOff className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Restore HUD button (if hidden) */}
      {!hudVisible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            setHudVisible(true);
          }}
          className="absolute bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-[#00f0ff]/30 flex items-center justify-center pointer-events-auto shadow-[0_0_30px_rgba(0,240,255,0.6)]"
        >
          <Eye className="w-6 h-6 text-[#00f0ff]" />
        </motion.button>
      )}

      {/* Gesture Instructions (fade after 3s) */}
      <GestureHints />
    </div>
  );
}

// Quick Action Button Component
function QuickActionBtn({ 
  label, 
  icon, 
  onClick 
}: { 
  label: string; 
  icon: React.ReactNode; 
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-gradient-to-b from-[#00f0ff]/20 to-[#7b00ff]/20 border border-[#00f0ff]/30 hover:border-[#00f0ff]/50 transition-all"
    >
      <div className="text-[#00f0ff]">{icon}</div>
      <span className="text-[10px] text-white/80 font-mono">{label}</span>
    </motion.button>
  );
}

// Gesture Hints Component (shows on mount, fades after 3s)
function GestureHints() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
    >
      <div className="rounded-2xl bg-black/90 backdrop-blur-lg border border-[#00f0ff]/30 p-6 shadow-[0_0_60px_rgba(0,240,255,0.4)]">
        <h3 className="text-white font-orbitron font-bold text-center mb-4">
          ROAM MODE
        </h3>
        <div className="space-y-2 text-sm text-white/80 font-mono">
          <p>🤏 Pinch to Zoom</p>
          <p>👆 Drag to Rotate</p>
          <p>👆👆 Double Tap to Hide HUD</p>
          <p>🎯 Tap Parcel to Select</p>
        </div>
      </div>
    </motion.div>
  );
}
