'use client';

/**
 * MISSION LIST - Hub-filtered missions with chrome spines
 */

import React from 'react';
import type { HubMode, HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';

interface VoidMission {
  id: string;
  title: string;
  hub: HubMode;
  progress: number; // 0-100
  reward: string;
  type: 'daily' | 'weekly' | 'ongoing';
}

// Mock missions (filtered by hub mode)
const MOCK_MISSIONS: VoidMission[] = [
  { id: '1', title: 'Explore 3 new zones', hub: 'WORLD', progress: 66, reward: '500 VOID', type: 'daily' },
  { id: '2', title: 'Create a new drop', hub: 'CREATOR', progress: 0, reward: '100 CREATE', type: 'daily' },
  { id: '3', title: 'Stake 1000 VOID', hub: 'DEFI', progress: 100, reward: '50 PSX', type: 'ongoing' },
  { id: '4', title: 'Vote on 2 proposals', hub: 'DAO', progress: 50, reward: '25 PSX', type: 'weekly' },
  { id: '5', title: 'Complete 1 gig', hub: 'AGENCY', progress: 0, reward: '200 VOID', type: 'daily' },
  { id: '6', title: 'Train AI agent 5 min', hub: 'AI_OPS', progress: 80, reward: '10 SIGNAL', type: 'daily' },
];

interface MissionListProps {
  hubMode: HubMode;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function MissionList({
  hubMode,
  onOpenWindow,
  theme
}: MissionListProps) {
  // Filter missions by current hub
  const filteredMissions = MOCK_MISSIONS.filter(m => m.hub === hubMode);

  return (
    <div className={`
      rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/30
      p-4 relative overflow-hidden
      transition-all duration-500
    `}>
      {/* chrome corner glow */}
      <div className={`
        pointer-events-none absolute -top-4 -left-4 w-24 h-24 blur-2xl opacity-50
        bg-[radial-gradient(circle,${theme.chromeGlow},transparent_70%)]
      `} />

      <div className="relative">
        <h3 className="text-xs font-bold tracking-widest text-bio-silver/70 mb-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full`} style={{ background: theme.borderColor }} />
          {hubMode} MISSIONS
        </h3>

        <div className="flex flex-col gap-2">
          {filteredMissions.length === 0 ? (
            <div className="text-xs text-bio-silver/40 italic py-4 text-center">
              No active missions
            </div>
          ) : (
            filteredMissions.map(mission => (
              <button
                key={mission.id}
                onClick={() => onOpenWindow('MISSION_DETAIL', { missionId: mission.id })}
                className={`
                  group text-left p-3 rounded-xl bg-bio-dark-bone/30 border border-bio-silver/20
                  hover:bg-bio-dark-bone/50 hover:border-bio-silver/40
                  transition-all duration-300
                  relative overflow-hidden
                `}
              >
                {/* chrome spine */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1`}
                  style={{ background: theme.spineColor }}
                />

                <div className="pl-2">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-xs font-bold text-bio-silver group-hover:text-white transition-colors">
                      {mission.title}
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded bg-black/50 text-bio-silver/70 whitespace-nowrap">
                      {mission.type.toUpperCase()}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-black/50 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${mission.progress}%`,
                        background: theme.borderColor
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-bio-silver/60">
                      {mission.progress}% complete
                    </div>
                    <div className="text-[10px] font-bold" style={{ color: theme.borderColor }}>
                      {mission.reward}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
