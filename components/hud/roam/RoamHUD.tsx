"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TopLeftCluster } from './TopLeftCluster';
import { TopRightCluster } from './TopRightCluster';
import { BottomLeftCluster } from './BottomLeftCluster';
import { BottomRightCluster } from './BottomRightCluster';
import type { PlayerXp } from '@/lib/xp/types';

interface RoamHUDProps {
  // Player data
  playerPosition: { x: number; y: number; z: number };
  playerXp: PlayerXp;
  voidBalance: number;
  
  // User profile
  username: string;
  pfpUrl?: string | null;
  onlineStatus: 'online' | 'away' | 'dnd' | 'in-voice';
  
  // Callbacks
  onOpenLiteMode: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onInteract?: () => void;
  onEmote?: () => void;
  
  // Chat/social
  nearbyUserCount: number;
  unreadProx: number;
  unreadGlobal: number;
}

/**
 * ROAM HUD - Main overlay for 3D exploration mode
 * 
 * DESIGN PRINCIPLE: CENTER 50-60% OF SCREEN MUST STAY CLEAR
 * All UI elements hug edges and corners only
 */
export function RoamHUD({
  playerPosition,
  playerXp,
  voidBalance,
  username,
  pfpUrl,
  onlineStatus,
  onOpenLiteMode,
  onOpenProfile,
  onOpenSettings,
  onInteract,
  onEmote,
  nearbyUserCount,
  unreadProx,
  unreadGlobal
}: RoamHUDProps) {
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* TOP-LEFT: Logo + Mini-Profile */}
      <motion.div 
        className="absolute top-4 left-4 pointer-events-auto"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <TopLeftCluster
          username={username}
          pfpUrl={pfpUrl}
          onlineStatus={onlineStatus}
          level={playerXp.level}
          totalXp={playerXp.totalXp}
          onProfileClick={onOpenProfile}
        />
      </motion.div>

      {/* TOP-RIGHT: Mini-Map + Settings */}
      <motion.div 
        className="absolute top-4 right-4 pointer-events-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <TopRightCluster
          playerPosition={playerPosition}
          onSettingsClick={onOpenSettings}
        />
      </motion.div>

      {/* BOTTOM-LEFT: Chat + Tipping */}
      <motion.div 
        className="absolute bottom-4 left-4 pointer-events-auto max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <BottomLeftCluster
          nearbyUserCount={nearbyUserCount}
          unreadProx={unreadProx}
          unreadGlobal={unreadGlobal}
        />
      </motion.div>

      {/* BOTTOM-RIGHT: Action Buttons */}
      <motion.div 
        className="absolute bottom-4 right-4 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <BottomRightCluster
          onLiteModeClick={onOpenLiteMode}
          onInteract={onInteract}
          onEmote={onEmote}
        />
      </motion.div>
    </div>
  );
}
