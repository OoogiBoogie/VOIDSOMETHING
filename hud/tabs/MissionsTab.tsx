'use client';

/**
 * MISSIONS TAB - Player missions and progression
 * Shows: available missions, active missions, completion tracking
 * Actions: track mission, complete mission, claim rewards
 */

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

type HubFilter = 'ALL' | 'WORLD' | 'DEFI' | 'CREATOR' | 'DAO' | 'AI';
type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';
type MissionStatus = 'available' | 'in-progress' | 'completed';

interface Mission {
  id: number;
  title: string;
  description: string;
  hub: HubFilter;
  difficulty: MissionDifficulty;
  vxpReward: number;
  voidReward?: number;
  status: MissionStatus;
  progress?: { current: number; total: number };
}

interface MissionsTabProps {
  onClose?: () => void;
}

export default function MissionsTab({ onClose }: MissionsTabProps) {
  const { authenticated } = usePrivy();
  const { address } = useAccount();
  const [activeFilter, setActiveFilter] = useState<HubFilter>('ALL');
  const [trackedMission, setTrackedMission] = useState<number | null>(null);

  // Mock missions - ready to replace with MissionRegistry.getAvailableMissions()
  const mockMissions: Mission[] = [
    {
      id: 1,
      title: 'Harvest from the Grid',
      description: 'Collect 500 VOID from any Vault',
      hub: 'DEFI',
      difficulty: 'Easy',
      vxpReward: 100,
      voidReward: 10,
      status: 'in-progress',
      progress: { current: 250, total: 500 },
    },
    {
      id: 2,
      title: 'Scout DeFi District',
      description: 'Walk through 3 DeFi parcels',
      hub: 'WORLD',
      difficulty: 'Easy',
      vxpReward: 5,
      voidReward: 1,
      status: 'in-progress',
      progress: { current: 1, total: 3 },
    },
    {
      id: 3,
      title: 'Stabilize the Router',
      description: 'Stake 100 VOID in xVOIDVault',
      hub: 'DEFI',
      difficulty: 'Medium',
      vxpReward: 150,
      status: 'available',
    },
    {
      id: 4,
      title: 'First Vote',
      description: 'Cast your first governance vote',
      hub: 'DAO',
      difficulty: 'Easy',
      vxpReward: 40,
      status: 'available',
    },
    {
      id: 5,
      title: 'Land Baron',
      description: 'Own 5 parcels in any district',
      hub: 'WORLD',
      difficulty: 'Hard',
      vxpReward: 500,
      voidReward: 50,
      status: 'in-progress',
      progress: { current: 2, total: 5 },
    },
    {
      id: 6,
      title: 'Decode the Signal',
      description: 'Complete Stage 1 of The Signal cipher',
      hub: 'AI',
      difficulty: 'Medium',
      vxpReward: 200,
      status: 'available',
    },
    {
      id: 7,
      title: 'Creator Genesis',
      description: 'Publish your first creator mission',
      hub: 'CREATOR',
      difficulty: 'Medium',
      vxpReward: 120,
      voidReward: 15,
      status: 'available',
    },
    {
      id: 8,
      title: 'Swap Master',
      description: 'Execute 10 swaps on VoidSwapTestnet',
      hub: 'DEFI',
      difficulty: 'Medium',
      vxpReward: 80,
      status: 'in-progress',
      progress: { current: 3, total: 10 },
    },
    {
      id: 9,
      title: 'Network Pioneer',
      description: 'Reach Level 10 (1000 XP)',
      hub: 'WORLD',
      difficulty: 'Hard',
      vxpReward: 300,
      voidReward: 100,
      status: 'completed',
    },
  ];

  const filters: HubFilter[] = ['ALL', 'WORLD', 'DEFI', 'CREATOR', 'DAO', 'AI'];

  const filteredMissions = activeFilter === 'ALL'
    ? mockMissions
    : mockMissions.filter(m => m.hub === activeFilter);

  const getDifficultyColor = (difficulty: MissionDifficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-signal-green';
      case 'Medium': return 'text-cyber-cyan';
      case 'Hard': return 'text-void-purple';
    }
  };

  const getHubColor = (hub: HubFilter) => {
    switch (hub) {
      case 'WORLD': return 'bg-signal-green/20 border-signal-green/40 text-signal-green';
      case 'DEFI': return 'bg-void-purple/20 border-void-purple/40 text-void-purple';
      case 'CREATOR': return 'bg-cyber-cyan/20 border-cyber-cyan/40 text-cyber-cyan';
      case 'DAO': return 'bg-psx-blue/20 border-psx-blue/40 text-psx-blue';
      case 'AI': return 'bg-lime-300/20 border-lime-300/40 text-lime-300';
      default: return 'bg-bio-silver/20 border-bio-silver/40 text-bio-silver';
    }
  };

  const handleTrack = (missionId: number) => {
    setTrackedMission(missionId);
    // TODO: Set as active mission in HUD overlay
  };

  const handleComplete = (missionId: number) => {
    // TODO: Wire to MissionRegistry.completeMission(missionId)
    // Then call XPOracle.addXP if contract handles this
    console.log('Complete mission:', missionId);
  };

  const stats = {
    completed: mockMissions.filter(m => m.status === 'completed').length,
    inProgress: mockMissions.filter(m => m.status === 'in-progress').length,
    available: mockMissions.filter(m => m.status === 'available').length,
    totalVXP: mockMissions.filter(m => m.status === 'completed').reduce((sum, m) => sum + m.vxpReward, 0),
  };

  if (!authenticated) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="text-4xl mb-2">🎯</div>
        <div className="text-lg font-bold text-cyber-cyan uppercase tracking-wider">Missions & Progression</div>
        <div className="text-sm text-bio-silver/60 max-w-md">
          Connect with Privy to start completing missions and earning XP.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          🎯 ACTIVE MISSIONS
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-2 bg-black/40 border border-signal-green/40 rounded text-center">
          <div className="text-lg font-bold text-signal-green">{stats.completed}</div>
          <div className="text-[0.6rem] text-bio-silver/60 uppercase">Completed</div>
        </div>
        <div className="p-2 bg-black/40 border border-cyber-cyan/40 rounded text-center">
          <div className="text-lg font-bold text-cyber-cyan">{stats.inProgress}</div>
          <div className="text-[0.6rem] text-bio-silver/60 uppercase">In Progress</div>
        </div>
        <div className="p-2 bg-black/40 border border-bio-silver/20 rounded text-center">
          <div className="text-lg font-bold text-bio-silver">{stats.available}</div>
          <div className="text-[0.6rem] text-bio-silver/60 uppercase">Available</div>
        </div>
        <div className="p-2 bg-black/40 border border-void-purple/40 rounded text-center">
          <div className="text-lg font-bold text-void-purple">{stats.totalVXP}</div>
          <div className="text-[0.6rem] text-bio-silver/60 uppercase">vXP Earned</div>
        </div>
      </div>

      {/* Hub Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded font-bold text-[0.65rem] uppercase tracking-wider whitespace-nowrap transition-all ${
              activeFilter === filter
                ? 'bg-void-purple/30 border border-void-purple text-void-purple shadow-[0_0_10px_rgba(124,0,255,0.3)]'
                : 'bg-black/40 border border-bio-silver/20 text-bio-silver/60 hover:text-bio-silver hover:border-bio-silver/40'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Missions List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {filteredMissions.map((mission) => (
          <div
            key={mission.id}
            className={`p-4 bg-black/40 border rounded transition-all ${
              mission.status === 'completed'
                ? 'border-signal-green/40 opacity-60'
                : mission.status === 'in-progress'
                ? 'border-cyber-cyan/40'
                : 'border-bio-silver/20 hover:border-bio-silver/40'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[0.6rem] px-2 py-0.5 border rounded ${getHubColor(mission.hub)}`}>
                    {mission.hub}
                  </span>
                  <span className={`text-[0.65rem] font-bold ${getDifficultyColor(mission.difficulty)}`}>
                    {mission.difficulty}
                  </span>
                  {mission.status === 'completed' && (
                    <span className="text-[0.6rem] px-2 py-0.5 bg-signal-green/20 border border-signal-green/40 rounded text-signal-green">
                      ✓ DONE
                    </span>
                  )}
                  {trackedMission === mission.id && (
                    <span className="text-[0.6rem] px-2 py-0.5 bg-cyber-cyan/20 border border-cyber-cyan/40 rounded text-cyber-cyan">
                      ⭐ TRACKED
                    </span>
                  )}
                </div>
                <div className="text-[0.75rem] font-bold text-bio-silver mb-1">{mission.title}</div>
                <div className="text-[0.65rem] text-bio-silver/60 mb-2">{mission.description}</div>

                {/* Progress Bar */}
                {mission.progress && mission.status === 'in-progress' && (
                  <div className="mb-2">
                    <div className="flex justify-between text-[0.65rem] mb-1">
                      <span className="text-bio-silver/60">Progress</span>
                      <span className="text-cyber-cyan">
                        {mission.progress.current} / {mission.progress.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyber-cyan to-signal-green"
                        style={{ width: `${(mission.progress.current / mission.progress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Rewards */}
                <div className="flex gap-3 text-[0.7rem]">
                  <span className="text-void-purple">+{mission.vxpReward} vXP</span>
                  {mission.voidReward && <span className="text-signal-green">+{mission.voidReward} VOID</span>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              {mission.status === 'available' && (
                <button
                  onClick={() => handleTrack(mission.id)}
                  className="flex-1 py-1.5 px-3 bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan/30 rounded text-cyber-cyan font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Track
                </button>
              )}
              {mission.status === 'in-progress' && (
                <>
                  <button
                    onClick={() => handleTrack(mission.id)}
                    disabled={trackedMission === mission.id}
                    className="flex-1 py-1.5 px-3 bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan/30 rounded text-cyber-cyan font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {trackedMission === mission.id ? 'Tracking' : 'Track'}
                  </button>
                  {mission.progress && mission.progress.current >= mission.progress.total && (
                    <button
                      onClick={() => handleComplete(mission.id)}
                      className="flex-1 py-1.5 px-3 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Complete
                    </button>
                  )}
                </>
              )}
              {mission.status === 'completed' && (
                <div className="flex-1 text-center text-[0.7rem] text-signal-green py-1">
                  ✓ Completed & Claimed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* XP Progress Summary */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">Progress Summary</div>
        <div className="flex justify-between items-center text-[0.7rem]">
          <span className="text-bio-silver">XP Level: <span className="text-void-purple font-bold">12</span></span>
          <span className="text-bio-silver">Rank: <span className="text-signal-green font-bold">Agent</span></span>
          <span className="text-bio-silver/60">Next Rank: Specialist (1,200 XP)</span>
        </div>
      </div>
    </div>
  );
}
