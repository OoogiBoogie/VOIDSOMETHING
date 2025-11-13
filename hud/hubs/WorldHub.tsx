'use client';

import React, { useState } from 'react';
import { Zap, Target, TrendingUp } from 'lucide-react';
import { useLandMap } from '@/hooks/useLandData';
import { useWorldState } from '@/hooks/useWorldState';
import { useAccount } from 'wagmi';

interface Mission {
  id: number;
  title: string;
  reward: number;
  progress: number;
  type: string;
  timeLeft: string;
}

export default function WorldHub() {
  const { address } = useAccount();
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  
  // Real world data
  const { parcels, districts, loading: landLoading } = useLandMap();
  const { position, nearbyEvents, friends } = useWorldState(address);

  // Mock missions for now - TODO: integrate with mission service
  const missions: Mission[] = [
    { 
      id: 1, 
      title: 'Explore a new district', 
      reward: 35, 
      progress: 0.4,
      type: 'exploration',
      timeLeft: '2h 15m'
    },
    { 
      id: 2, 
      title: 'Complete 3 creator interactions', 
      reward: 50, 
      progress: 0.33,
      type: 'social',
      timeLeft: '5h 42m'
    },
    { 
      id: 3, 
      title: 'Stake into any vault', 
      reward: 20, 
      progress: 0.7,
      type: 'defi',
      timeLeft: '1h 08m'
    },
  ];

  return (
    <section className="space-y-4">
      {/* Active missions - The main engagement loop */}
      <div className="hud-card-signal">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#00FF9D] flex items-center gap-2">
            <Zap className="w-4 h-4" />
            ACTIVE MISSIONS · WORLD
          </h2>
          <div className="flex items-center gap-2">
            {position && (
              <span className="text-[0.65rem] text-[#C7D8FF]/60">
                POS: <span className="data-text text-[#00D4FF]">
                  {Math.floor(position.x)}, {Math.floor(position.z)}
                </span>
              </span>
            )}
            <span className="hud-pill bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/40">
              {missions.length} ACTIVE
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {missions.map((m: Mission) => (
            <div
              key={m.id}
              onClick={() => setSelectedMission(m.id)}
              className={`bg-black/70 border rounded-xl p-3 cursor-pointer transition-all ${
                selectedMission === m.id
                  ? 'border-[#00FF9D] shadow-[0_0_20px_rgba(0,255,157,0.5)]'
                  : 'border-[#00FF9D]/30 hover:border-[#00FF9D] hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]'
              }`}
            >
              {/* Mission header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-display text-[0.8rem] text-[#C7D8FF] mb-1">
                    {m.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="hud-pill bg-[#00FF9D]/10 text-[#00FF9D] border-0 text-[0.55rem]">
                      {m.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reward - Dopamine trigger */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-[0.7rem] text-[#C7D8FF]/70">
                  Reward
                </p>
                <span className="data-text text-[#00FF9D] text-sm">
                  +{m.reward} SIGNAL
                </span>
              </div>

              {/* Progress bar - Visual feedback */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-[0.65rem] mb-1">
                  <span className="text-[#C7D8FF]/60">Progress</span>
                  <span className="data-text text-[#00FF9D]">{Math.floor(m.progress * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/70 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${m.progress * 100}%`,
                      background: 'linear-gradient(to right, #00FF9D, #00D4FF, #7C00FF)'
                    }}
                  />
                </div>
              </div>

              {/* Time remaining - Urgency */}
              <div className="flex items-center justify-between text-[0.65rem]">
                <span className="text-[#C7D8FF]/60">Time left</span>
                <span className="data-text text-[#00D4FF]">{m.timeLeft}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily objectives - Habit loop */}
      <div className="hud-card-cyber">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#00D4FF] flex items-center gap-2">
            <Target className="w-4 h-4" />
            DAILY OBJECTIVES
          </h2>
          <span className="text-[0.65rem] text-[#C7D8FF]/60">
            Resets in <span className="data-text text-[#00D4FF]">06:15:32</span>
          </span>
        </div>

        <div className="space-y-3">
          <ObjectiveItem 
            title="Complete 1 mission"
            progress={1}
            max={1}
            reward="+10 SIGNAL"
            completed={true}
          />
          <ObjectiveItem 
            title="Claim vault rewards"
            progress={0}
            max={1}
            reward="+10 SIGNAL"
            completed={false}
          />
          <ObjectiveItem 
            title="Vote on 1 proposal"
            progress={0}
            max={1}
            reward="+10 SIGNAL"
            completed={false}
          />
        </div>
      </div>

      {/* Activity heatmap - Social proof */}
      <div className="hud-card-void">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#7C00FF] flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            WORLD ACTIVITY · HEATMAP
          </h2>
          <span className="hud-pill bg-[#7C00FF]/10 text-[#7C00FF] border border-[#7C00FF]/40">
            LIVE
          </span>
        </div>

        <div className="h-40 bg-black/70 rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* Placeholder for activity visualization */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 30% 40%, rgba(0,255,157,0.3), transparent 50%), radial-gradient(circle at 70% 60%, rgba(124,0,255,0.3), transparent 50%)'
            }}
          />
          <div className="relative z-10 text-center">
            <p className="text-[0.75rem] text-[#C7D8FF]/60 mb-2">Activity visualization</p>
            <div className="flex items-center gap-4 justify-center text-[0.7rem]">
              <div>
                <span className="data-text text-[#00FF9D] text-lg">
                  {friends?.length || 0}
                </span>
                <p className="text-[#C7D8FF]/60">Online friends</p>
              </div>
              <div>
                <span className="data-text text-[#00D4FF] text-lg">
                  {nearbyEvents?.length || 0}
                </span>
                <p className="text-[#C7D8FF]/60">Nearby events</p>
              </div>
              <div>
                <span className="data-text text-[#7C00FF] text-lg">
                  {districts?.length || 7}
                </span>
                <p className="text-[#C7D8FF]/60">Districts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard snippet - Competition */}
      <div className="hud-card border-[#00FF9D]/35 bg-[#00FF9D]/5">
        <h2 className="text-xs text-[#00FF9D] mb-3">
          TOP OPERATORS · THIS WEEK
        </h2>
        <div className="space-y-2">
          {[
            { rank: 1, name: 'AGENT-X42', score: 15420, color: '#FFD700' },
            { rank: 2, name: 'VOID-HUNTER', score: 14820, color: '#C0C0C0' },
            { rank: 3, name: 'SIGNAL-MASTER', score: 13105, color: '#CD7F32' },
            { rank: 4, name: 'AGENT-VOID', score: 12840, color: '#00FF9D' },
          ].map((player) => (
            <div 
              key={player.rank}
              className="flex items-center justify-between p-2 bg-black/40 rounded hover:bg-black/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <span 
                  className="data-text text-sm font-bold"
                  style={{ color: player.color }}
                >
                  #{player.rank}
                </span>
                <span className="text-[0.75rem] text-[#C7D8FF]">{player.name}</span>
              </div>
              <span className="data-text text-[#00FF9D] text-sm">
                {player.score.toLocaleString()} vXP
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ObjectiveItem({ 
  title, 
  progress, 
  max, 
  reward, 
  completed 
}: { 
  title: string; 
  progress: number; 
  max: number; 
  reward: string; 
  completed: boolean;
}) {
  const percent = (progress / max) * 100;

  return (
    <div className={`p-3 rounded-lg border transition-all ${
      completed 
        ? 'bg-[#00FF9D]/10 border-[#00FF9D]/40' 
        : 'bg-black/40 border-[#00D4FF]/20 hover:border-[#00D4FF]/40'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.75rem] text-[#C7D8FF]">{title}</span>
        <span className="data-text text-[#00D4FF] text-[0.7rem]">{reward}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-black/60 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${completed ? 'bg-[#00FF9D]' : 'bg-[#00D4FF]'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[0.65rem] data-text text-[#C7D8FF]/60">
          {progress}/{max}
        </span>
      </div>
    </div>
  );
}
