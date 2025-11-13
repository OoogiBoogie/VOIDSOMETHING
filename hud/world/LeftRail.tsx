'use client';

import React from 'react';
import { Target, Users, Flame, Trophy } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  progress: number;
  reward: string;
}

interface LeftRailProps {
  level: number;
  streak: number;
  missions: Mission[];
  friendsOnline: number;
  nearbyPlayers: number;
  achievements: number;
}

export default function LeftRail({
  level,
  streak,
  missions,
  friendsOnline,
  nearbyPlayers,
  achievements,
}: LeftRailProps) {
  return (
    <div className="space-y-3">
      {/* Operator Panel */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-signal-green/40 via-cyber-cyan/30 to-void-purple/20 blur-sm rounded-2xl" />
        <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,255,157,0.25)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-1 rounded-full bg-signal-green shadow-[0_0_8px_rgba(0,255,157,1)] animate-pulse" />
            <h3 className="text-xs font-display text-signal-green uppercase tracking-[0.25em]">Operator</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] text-bio-silver/60 uppercase">Level</span>
              <span className="text-sm font-mono text-white">{level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] text-bio-silver/60 uppercase">Streak</span>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-sm font-mono text-orange-500">{streak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Missions */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-void-purple/40 via-cyber-cyan/30 to-signal-green/20 blur-sm rounded-2xl" />
        <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(124,0,255,0.25)]">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-3.5 h-3.5 text-void-purple" />
            <h3 className="text-xs font-display text-void-purple uppercase tracking-[0.25em]">Missions</h3>
          </div>
          <div className="space-y-3">
            {missions.slice(0, 3).map((mission) => (
              <div key={mission.id}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-bio-silver truncate pr-2">{mission.title}</p>
                  <span className="text-[0.6rem] text-signal-green font-mono whitespace-nowrap">{mission.reward}</span>
                </div>
                <div className="w-full h-1 bg-void-deep rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-void-purple to-signal-green transition-all duration-500"
                    style={{ width: `${mission.progress}%` }}
                  />
                </div>
              </div>
            ))}
            {missions.length === 0 && (
              <p className="text-xs text-bio-silver/60 text-center">No active missions</p>
            )}
          </div>
        </div>
      </div>

      {/* Social Snapshot */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-cyber-cyan/40 via-psx-blue/30 to-void-purple/20 blur-sm rounded-2xl" />
        <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,212,255,0.25)]">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-cyber-cyan" />
            <h3 className="text-xs font-display text-cyber-cyan uppercase tracking-[0.25em]">Social</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] text-bio-silver/60 uppercase">Friends Online</span>
              <span className="text-sm font-mono text-signal-green">{friendsOnline}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] text-bio-silver/60 uppercase">Nearby</span>
              <span className="text-sm font-mono text-psx-blue">{nearbyPlayers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-yellow-500/40 via-orange-500/30 to-red-500/20 blur-sm rounded-2xl" />
        <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(255,200,0,0.25)]">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <h3 className="text-xs font-display text-yellow-500 uppercase tracking-[0.25em]">Achievements</h3>
            <span className="ml-auto text-sm font-mono text-white">{achievements}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
