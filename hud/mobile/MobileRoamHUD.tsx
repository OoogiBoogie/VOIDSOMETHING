'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useVoidEmitter } from '@/hooks/useVoidEngine';
import { useWorldState } from '@/hooks/useWorldState';
import { useLandMap } from '@/hooks/useLandData';
import { useGamification } from '@/hooks/useGamification';
import { 
  Map, 
  Target, 
  Scan, 
  Zap, 
  Navigation,
  Plus,
  Minus,
  X
} from 'lucide-react';

type RoamMode = 'explore' | 'mission' | 'scan';

export default function MobileRoamHUD() {
  const { address } = useAccount();
  const [mode, setMode] = useState<RoamMode>('explore');
  const [showMissions, setShowMissions] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  // Real data
  const { vxp } = useVoidEmitter(address || '');
  const { position, nearbyEvents } = useWorldState(address);
  const { districts } = useLandMap();
  const gamification = useGamification(address || '');

  const level = vxp ? Math.floor(vxp.total / 5000) + 1 : 7;
  const currentXP = vxp?.total || 14820;
  const streakDays = 4; // TODO: wire from gamification when available

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="relative w-full h-screen bg-void-deep overflow-hidden pointer-events-auto">
        {/* Fullscreen world view - AR camera placeholder */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060914] via-[#0a0e1f] to-[#060914]">
        {/* Grid overlay for AR feel */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: 'linear-gradient(0deg, rgba(0,255,157,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,157,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Radial scan effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-96 h-96 rounded-full opacity-20 animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,157,0.3), transparent 70%)'
            }}
          />
        </div>
      </div>

      {/* Top HUD - XP overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          {/* Level + XP */}
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-4 py-2 border border-[#00FF9D]/40">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-[0.65rem] text-[#C7D8FF]/60 uppercase tracking-wider">Level</p>
                <p className="text-xl font-display text-[#00FF9D]">{level}</p>
              </div>
              <div className="w-px h-8 bg-[#00FF9D]/30" />
              <div>
                <p className="text-[0.65rem] text-[#C7D8FF]/60 mb-1">vXP Progress</p>
                <div className="w-32 h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00FF9D]"
                    style={{ width: `${((currentXP % 5000) / 5000) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Streak badge */}
          <div className="bg-black/80 backdrop-blur-xl rounded-full px-4 py-2 border border-[#00D4FF]/40">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00D4FF]" />
              <span className="text-sm font-mono text-[#00D4FF]">{streakDays} day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Minimap - top right */}
      {showMinimap && (
        <div className="absolute top-20 right-4 z-20">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-3 border border-[#00FF9D]/30 w-32 h-32">
            <div className="relative w-full h-full bg-void-deep rounded-lg overflow-hidden">
              {/* Simple minimap placeholder */}
              <div className="absolute inset-0">
                {districts.slice(0, 3).map((d, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-6 rounded-full border-2 border-[#00FF9D]/40"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${30 + i * 20}%`,
                    }}
                  />
                ))}
                {/* Player position */}
                <div 
                  className="absolute w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse"
                  style={{
                    left: position ? `${(position.x % 100)}%` : '50%',
                    top: position ? `${(position.z % 100)}%` : '50%',
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => setShowMinimap(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-black/90 border border-[#FF3A52]/40 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-[#FF3A52]" />
            </button>
          </div>
        </div>
      )}

      {/* Center reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-[#00FF9D] rounded-full opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-[#00FF9D] rounded-full" />
          </div>
        </div>
      </div>

      {/* Position indicator - bottom left */}
      {position && (
        <div className="absolute bottom-24 left-4 z-20">
          <div className="bg-black/80 backdrop-blur-xl rounded-xl px-3 py-2 border border-[#00D4FF]/30">
            <p className="text-[0.65rem] text-[#C7D8FF]/60 uppercase tracking-wider mb-1">Position</p>
            <p className="text-sm font-mono text-[#00D4FF]">
              {Math.floor(position.x)}, {Math.floor(position.z)}
            </p>
          </div>
        </div>
      )}

      {/* Mission list overlay - slides from left */}
      {showMissions && (
        <div className="absolute inset-y-0 left-0 z-30 w-80 bg-black/95 backdrop-blur-xl border-r border-[#00FF9D]/30 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display text-[#00FF9D] uppercase tracking-wider">
              Nearby Missions
            </h2>
            <button
              onClick={() => setShowMissions(false)}
              className="w-8 h-8 bg-[#FF3A52]/20 border border-[#FF3A52]/40 rounded-lg flex items-center justify-center"
            >
              <X className="w-4 h-4 text-[#FF3A52]" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Explore Gaming District', distance: '120m', reward: 35, type: 'exploration' },
              { title: 'Visit DeFi Tower', distance: '340m', reward: 50, type: 'discovery' },
              { title: 'Check Creator Hub', distance: '580m', reward: 25, type: 'social' },
            ].map((mission, i) => (
              <div 
                key={i}
                className="hud-card-signal active:scale-95 transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-mono text-[#00FF9D]/70">
                    {mission.type}
                  </span>
                  <span className="text-xs font-mono text-[#00D4FF]">{mission.distance}</span>
                </div>
                <p className="text-sm text-[#C7D8FF] mb-2">{mission.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#00FF9D]">+{mission.reward} SIGNAL</span>
                  <button className="px-3 py-1 bg-[#00FF9D]/20 border border-[#00FF9D]/40 rounded text-[0.65rem] text-[#00FF9D] uppercase tracking-wider">
                    Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom control panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            {!showMinimap && (
              <ActionButton
                icon={<Map className="w-5 h-5" />}
                label="Map"
                onClick={() => setShowMinimap(true)}
                color="#00D4FF"
              />
            )}
            <ActionButton
              icon={<Target className="w-5 h-5" />}
              label="Missions"
              onClick={() => setShowMissions(!showMissions)}
              active={showMissions}
              color="#00FF9D"
            />
          </div>

          {/* Center mode switcher */}
          <div className="flex items-center gap-2 bg-black/90 backdrop-blur-xl rounded-2xl p-2 border border-[#00FF9D]/30">
            <ModeButton
              icon={<Navigation className="w-5 h-5" />}
              active={mode === 'explore'}
              onClick={() => setMode('explore')}
            />
            <ModeButton
              icon={<Scan className="w-5 h-5" />}
              active={mode === 'scan'}
              onClick={() => setMode('scan')}
            />
            <ModeButton
              icon={<Zap className="w-5 h-5" />}
              active={mode === 'mission'}
              onClick={() => setMode('mission')}
            />
          </div>

          {/* Right action button */}
          <div className="flex items-center gap-2">
            {mode === 'scan' && (
              <ActionButton
                icon={<Scan className="w-6 h-6" />}
                label="Scan"
                onClick={() => console.log('Scanning...')}
                color="#7C00FF"
                large
              />
            )}
            {mode === 'mission' && (
              <ActionButton
                icon={<Plus className="w-6 h-6" />}
                label="Claim"
                onClick={() => console.log('Claiming...')}
                color="#00FF9D"
                large
              />
            )}
          </div>
        </div>
      </div>

      {/* Scan mode overlay */}
      {mode === 'scan' && (
        <div className="absolute inset-0 pointer-events-none z-15">
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Scanning ring */}
              <div 
                className="absolute inset-0 border-4 border-[#7C00FF] rounded-full animate-ping opacity-40"
              />
              <div 
                className="absolute inset-4 border-2 border-[#7C00FF] rounded-full opacity-60"
              />
              
              {/* Nearby items */}
              {nearbyEvents?.slice(0, 3).map((event, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-[#00FF9D] rounded-full animate-pulse"
                  style={{
                    left: `${30 + i * 40}%`,
                    top: `${20 + i * 30}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

function ActionButton({ 
  icon, 
  label, 
  onClick, 
  active, 
  color = '#00FF9D',
  large 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  active?: boolean;
  color?: string;
  large?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl border-2 backdrop-blur-xl transition-all active:scale-95 ${
        active 
          ? 'bg-black/90 border-[#00FF9D] shadow-[0_0_20px_rgba(0,255,157,0.4)]' 
          : 'bg-black/80 border-opacity-40'
      } ${large ? 'px-6 py-3' : ''}`}
      style={{ borderColor: active ? color : `${color}66` }}
    >
      <div style={{ color }}>{icon}</div>
      <span 
        className={`text-[0.65rem] uppercase tracking-wider font-mono ${large ? 'text-sm' : ''}`}
        style={{ color }}
      >
        {label}
      </span>
    </button>
  );
}

function ModeButton({ 
  icon, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
        active 
          ? 'bg-[#00FF9D]/20 border-2 border-[#00FF9D] text-[#00FF9D] shadow-[0_0_15px_rgba(0,255,157,0.3)]' 
          : 'bg-transparent border-2 border-transparent text-[#C7D8FF]/50 hover:text-[#C7D8FF]'
      }`}
    >
      {icon}
    </button>
  );
}
