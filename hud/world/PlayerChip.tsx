'use client';

import React, { useState } from 'react';
import { User, Zap, MapPin, Wallet, Shield, Coins } from 'lucide-react';

interface PlayerChipProps {
  // WORLD - Social identity
  username: string;
  avatarUrl: string;
  zone: string;
  coordinates: { x: number; z: number };
  
  // DEFI - Economic stake
  voidBalance: number;
  signalBalance: number;
  
  // DAO - Governance power
  psxBalance: number;
  votingPower: number;
  
  // CREATOR - Earnings
  createBalance: number;
  
  // AGENCY - Role/Pledge
  agencyRole: 'EXPLORER' | 'BUILDER' | 'AGENT' | 'FREELANCE';
  agencyName?: string; // e.g. "VOID OPS", "Chromelink"
  pledgeStatus: 'NONE' | 'PSX_PLEDGED' | 'RECRUITING';
  
  // Meta
  level: number;
  xp: number;
  xpProgress: number;
  walletAddress: string;
  chain: string;
}

export default function PlayerChip({
  username,
  walletAddress,
  level,
  xp,
  xpProgress,
  zone,
  coordinates,
  voidBalance,
  signalBalance,
  psxBalance,
  votingPower,
  createBalance,
  agencyRole,
  agencyName,
  pledgeStatus,
  chain,
}: PlayerChipProps) {
  const [expanded, setExpanded] = useState(false);

  const walletShort = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  
  // Agency color coding
  const agencyColor = pledgeStatus === 'PSX_PLEDGED' ? 'text-psx-blue' : 
                      pledgeStatus === 'RECRUITING' ? 'text-red-500' : 
                      'text-bio-silver/60';

  return (
    <div
      className="relative group"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Chrome frame - multi-hub gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-signal-green via-void-purple to-psx-blue opacity-50 blur-sm group-hover:opacity-75 transition-opacity rounded-2xl" />
      
      <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/50 rounded-2xl p-3 shadow-[0_0_40px_rgba(0,255,157,0.35)] transition-all duration-300">
        {/* Header - WORLD identity */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-signal-green to-cyber-cyan flex items-center justify-center">
            <User className="w-6 h-6 text-void-black" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-sm text-signal-green uppercase tracking-[0.25em]">
              {username}
            </h3>
            <p className="text-[0.65rem] font-mono text-bio-silver/60">{walletShort}</p>
          </div>
          <div className="px-2 py-1 bg-psx-blue/20 border border-psx-blue/40 rounded text-[0.6rem] text-psx-blue uppercase tracking-wider">
            {chain}
          </div>
        </div>

        {/* XP Progress - WORLD + meta */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.65rem] text-bio-silver/60 uppercase tracking-wider">Level {level}</span>
            <span className="text-[0.65rem] font-mono text-signal-green">{xp.toLocaleString()} vXP</span>
          </div>
          <div className="w-full h-1.5 bg-void-deep rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-signal-green to-cyber-cyan transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Token Row - DEFI + DAO + CREATOR */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          {/* DEFI - VOID */}
          <div className="bg-void-purple/10 border border-void-purple/30 rounded px-1.5 py-1">
            <p className="text-[0.55rem] text-void-purple uppercase">VOID</p>
            <p className="text-[0.65rem] font-mono text-white">{voidBalance.toFixed(1)}</p>
          </div>
          {/* DEFI - SIGNAL */}
          <div className="bg-signal-green/10 border border-signal-green/30 rounded px-1.5 py-1">
            <p className="text-[0.55rem] text-signal-green uppercase">SIG</p>
            <p className="text-[0.65rem] font-mono text-white">{signalBalance.toFixed(0)}</p>
          </div>
          {/* DAO - PSX */}
          <div className="bg-psx-blue/10 border border-psx-blue/30 rounded px-1.5 py-1">
            <p className="text-[0.55rem] text-psx-blue uppercase">PSX</p>
            <p className="text-[0.65rem] font-mono text-white">{psxBalance.toFixed(0)}</p>
          </div>
          {/* CREATOR - CREATE */}
          <div className="bg-cyber-cyan/10 border border-cyber-cyan/30 rounded px-1.5 py-1">
            <p className="text-[0.55rem] text-cyber-cyan uppercase">CRT</p>
            <p className="text-[0.65rem] font-mono text-white">{createBalance.toFixed(0)}</p>
          </div>
        </div>

        {/* AGENCY tag */}
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-black/40 border border-bio-silver/20 rounded ${agencyColor}`}>
          <Shield className="w-3 h-3" />
          <span className="text-[0.6rem] uppercase tracking-wider">
            {agencyName || agencyRole}
            {pledgeStatus === 'PSX_PLEDGED' && ' · PLEDGED'}
            {pledgeStatus === 'RECRUITING' && ' · RECRUITING'}
          </span>
        </div>

        {/* Expandable section - WORLD location + DAO voting power */}
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-2 border-t border-bio-silver/20 space-y-2">
            {/* WORLD Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyber-cyan" />
              <span className="text-xs text-bio-silver">{zone}</span>
              <span className="text-[0.65rem] font-mono text-bio-silver/60">
                ({Math.floor(coordinates.x)}, {Math.floor(coordinates.z)})
              </span>
            </div>

            {/* DAO Voting Power */}
            <div className="flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-psx-blue" />
              <span className="text-xs text-bio-silver">Voting Power</span>
              <span className="text-xs font-mono text-psx-blue">{votingPower.toFixed(2)}×</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
