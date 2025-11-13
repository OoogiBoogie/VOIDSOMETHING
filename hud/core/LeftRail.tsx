'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useVoidEmitter } from '@/hooks/useVoidEngine';
import { useGamification } from '@/hooks/useGamification';

interface LeftRailProps {
  activeHub: string;
}

export default function LeftRail({ activeHub }: LeftRailProps) {
  const { address } = useAccount();
  const { vxp } = useVoidEmitter(address || '');
  const gamification = useGamification(address || '');

  // Real data from VOID Engine - map to proper properties
  const level = vxp ? Math.floor(vxp.total / 5000) + 1 : 7; // Calculate level from total XP
  const currentXP = vxp?.total || 14820;
  const xpToNextLevel = level * 5000;
  const progress = vxp ? ((vxp.total % 5000) / 5000) : 0.68;
  const streakDays = gamification?.currentStreak || 4;

  return (
    <aside className="space-y-4">
      {/* Profile + Level - Instant dopamine feedback */}
      <div className="hud-card-signal">
        <h2 className="text-[0.7rem] text-[#00FF9D] mb-2">
          OPERATOR · LEVEL {level.toString().padStart(2, '0')}
        </h2>
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-12 h-12 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,157,0.6), rgba(124,0,255,0.7))'
            }}
          />
          <div className="text-xs">
            <p className="font-display text-sm text-[#C7D8FF]">
              AGENT–VOID
            </p>
            <p className="font-mono text-[0.65rem] text-[#C7D8FF]/70">
              HUB: {activeHub}
            </p>
          </div>
        </div>
        
        {/* Level progress bar with gradient */}
        <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
          <div 
            className="h-full transition-all duration-500"
            style={{
              width: `${Math.min(progress * 100, 100)}%`,
              background: 'linear-gradient(to right, #00FF9D, #00D4FF, #7C00FF)'
            }}
          />
        </div>
        <p className="mt-1 text-[0.7rem] font-mono text-[#C7D8FF]/70">
          vXP: <span className="data-text text-[#00FF9D]">{currentXP.toLocaleString()}</span> ·
          streak: <span className="data-text text-[#00D4FF]">{streakDays} days</span>
        </p>
      </div>

      {/* Quick missions - One more thing loop */}
      <div className="hud-card-signal">
        <h2 className="text-[0.7rem] text-[#00FF9D] mb-2">
          QUICK MISSIONS
        </h2>
        <ul className="space-y-2 text-[0.75rem] font-mono">
          <li className="flex justify-between items-center hover:bg-[#00FF9D]/5 p-2 rounded cursor-pointer transition-all">
            <span className="text-[#C7D8FF]">Stake into VOID vault</span>
            <span className="text-[#00FF9D] data-text">+20 SIGNAL</span>
          </li>
          <li className="flex justify-between items-center hover:bg-[#00D4FF]/5 p-2 rounded cursor-pointer transition-all">
            <span className="text-[#C7D8FF]">Support a CREATE drop</span>
            <span className="text-[#00D4FF] data-text">+12 SIGNAL</span>
          </li>
          <li className="flex justify-between items-center hover:bg-[#3AA3FF]/5 p-2 rounded cursor-pointer transition-all">
            <span className="text-[#C7D8FF]">Vote in 1 DAO proposal</span>
            <span className="text-[#3AA3FF] data-text">+15 SIGNAL</span>
          </li>
        </ul>
      </div>

      {/* Daily streak - Habit loop */}
      <div className="hud-card border-[#00D4FF]/35" style={{ boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}>
        <h2 className="text-[0.7rem] text-[#00D4FF] mb-2">
          DAILY STREAK
        </h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-display text-[#00D4FF]">4</span>
          <span className="text-[0.65rem] text-[#C7D8FF]/60">DAYS</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[1, 1, 1, 1, 0, 0, 0].map((active, i) => (
            <div 
              key={i}
              className={`h-2 rounded-full ${
                active ? 'bg-[#00D4FF]' : 'bg-black/40'
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-[0.65rem] text-[#C7D8FF]/60">
          Check in today: <span className="text-[#00D4FF]">+5 SIGNAL</span>
        </p>
      </div>
    </aside>
  );
}
