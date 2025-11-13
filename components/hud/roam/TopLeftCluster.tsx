"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface TopLeftClusterProps {
  username: string;
  pfpUrl?: string | null;
  onlineStatus: 'online' | 'away' | 'dnd' | 'in-voice';
  level: number;
  totalXp: number;
  onProfileClick: () => void;
}

const STATUS_COLORS = {
  online: '#00ff88',
  away: '#ffaa00',
  dnd: '#ff4444',
  'in-voice': '#00aaff'
};

const STATUS_LABELS = {
  online: 'Online',
  away: 'Away',
  dnd: 'Do Not Disturb',
  'in-voice': 'In Voice Chat'
};

/**
 * TOP-LEFT CLUSTER
 * VOID logo + User mini-profile (PFP, name, status, level, XP bar)
 */
export function TopLeftCluster({
  username,
  pfpUrl,
  onlineStatus,
  level,
  totalXp,
  onProfileClick
}: TopLeftClusterProps) {
  
  // Calculate XP progress to next level (simple formula)
  const xpForNextLevel = (level + 1) * 250;
  const xpProgress = (totalXp % 250) / 250 * 100;

  return (
    <div className="flex flex-col gap-2">
      {/* VOID Logo */}
      <motion.div 
        className="text-sm font-bold tracking-wider text-white/90"
        whileHover={{ textShadow: '0 0 20px rgba(123, 0, 255, 0.8)' }}
      >
        🌀 VOID
      </motion.div>

      {/* Mini Profile Card */}
      <motion.button
        onClick={onProfileClick}
        className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 hover:border-cyan-500/50 transition-all group"
        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          {/* PFP */}
          <div className="relative">
            {pfpUrl ? (
              <img
                src={pfpUrl}
                alt={username}
                className="w-16 h-16 rounded-lg object-cover border-2"
                style={{ borderColor: getLevelColor(level) }}
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center border-2"
                style={{ 
                  borderColor: getLevelColor(level),
                  background: `linear-gradient(135deg, ${getLevelColor(level)}40, ${getLevelColor(level)}20)`
                }}
              >
                <User className="w-8 h-8 text-white/60" />
              </div>
            )}
            
            {/* Status indicator */}
            <div 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black"
              style={{ backgroundColor: STATUS_COLORS[onlineStatus] }}
              title={STATUS_LABELS[onlineStatus]}
            />
          </div>

          {/* User Info */}
          <div className="flex flex-col items-start gap-1">
            <div className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors">
              @{username}
            </div>
            <div 
              className="text-xs font-bold"
              style={{ color: getLevelColor(level) }}
            >
              Level {level}
            </div>
            <div className="text-white/60 text-xs">
              {totalXp.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-3 w-full">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#7b00ff] to-[#ff0032]"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="text-[10px] text-white/40 mt-1 text-right">
            {Math.round(xpProgress)}% to Level {level + 1}
          </div>
        </div>
      </motion.button>
    </div>
  );
}

function getLevelColor(level: number): string {
  if (level >= 21) return '#B9F2FF'; // Diamond
  if (level >= 11) return '#E5E4E2'; // Platinum
  return '#FFD700'; // Gold
}
