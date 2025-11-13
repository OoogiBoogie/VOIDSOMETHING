'use client';

/**
 * WORLD MISSIONS PANEL - Left column missions display
 */

import React from 'react';
import { Target } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  progress: number;
  reward: string;
}

interface WorldMissionsPanelProps {
  missions: Mission[];
}

export default function WorldMissionsPanel({ missions = [] }: WorldMissionsPanelProps) {
  return (
    <div className="rounded-2xl bg-black/80 border border-slate-700/80 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-3.5 h-3.5 text-emerald-400" />
        <div className="text-[10px] font-mono tracking-[0.2em] text-emerald-300 uppercase">
          WORLD MISSIONS ({missions.length})
        </div>
      </div>

      <div className="space-y-1.5 max-h-32 overflow-y-auto">
        {missions.map((mission) => (
          <button
            key={mission.id}
            className="w-full text-left rounded-xl bg-black/70 border border-emerald-500/30 px-2.5 py-1.5 hover:border-emerald-400/60 transition-colors"
          >
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-200 truncate flex-1">{mission.title}</span>
              <span className="text-emerald-300 ml-2">{mission.reward}</span>
            </div>
            <div className="mt-1 h-1 bg-black/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500/60 rounded-full"
                style={{ width: `${mission.progress}%` }}
              />
            </div>
          </button>
        ))}

        {missions.length === 0 && (
          <div className="text-[11px] text-emerald-400/40 italic text-center py-2">
            no active missions
          </div>
        )}
      </div>
    </div>
  );
}
