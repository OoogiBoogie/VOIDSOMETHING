'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useVoidVault, useClaimableRewards } from '@/hooks/useVoidEngine';
import { aiAgentService } from '@/services/aiAgentService';

export default function RightRail() {
  const { address } = useAccount();
  const { positions } = useVoidVault(address || '');
  const { rewards, claimRewards } = useClaimableRewards(address || '');
  const [aiAgents, setAIAgents] = useState<any[]>([]);
  const [countdown, setCountdown] = useState({ hours: 3, minutes: 42, seconds: 10 });

  // Load AI agents
  useEffect(() => {
    const loadAgents = async () => {
      const agents = await aiAgentService.getAllAgents();
      setAIAgents(agents.slice(0, 4)); // Top 4 for feed
    };
    loadAgents();
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate vault summary
  const totalStaked = positions?.reduce((sum, p) => 
    p.stakedToken === 'VOID' ? sum + parseFloat(p.stakedAmount) : sum, 0
  ) || 1250;
  const avgAPR = positions?.reduce((sum, p) => sum + p.multiplier, 0) / (positions?.length || 1) * 100 || 18.5;
  const pendingRewards = positions?.reduce((sum, p) => 
    sum + p.pendingRewards.reduce((s, r) => s + parseFloat(r.amount), 0), 0
  ) || 12.4;

  return (
    <aside className="space-y-4">
      {/* Emission status - Anticipation mechanic */}
      <div className="hud-card-void">
        <h2 className="text-[0.7rem] text-[#7C00FF] mb-2">
          EMISSION STATUS
        </h2>
        <p className="text-[0.8rem] mb-1">
          Current multiplier:{' '}
          <span className="data-text text-[#7C00FF]">1.32×</span>
        </p>
        <p className="text-[0.7rem] text-[#C7D8FF]/70">
          Next epoch in <span className="data-text text-[#00FF9D]">
            {countdown.hours.toString().padStart(2, '0')}:
            {countdown.minutes.toString().padStart(2, '0')}:
            {countdown.seconds.toString().padStart(2, '0')}
          </span>
        </p>
        
        {/* Emission waveform visualization */}
        <div className="mt-3 h-16 bg-black/60 rounded-xl overflow-hidden relative">
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              background: 'linear-gradient(to right, rgba(124,0,255,0.4), rgba(0,255,157,0.3), rgba(0,212,255,0.4))'
            }}
          />
          {/* Animated pulse effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1/2 opacity-40">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
                <path 
                  d="M 0 10 Q 25 5, 50 10 T 100 10"
                  fill="none"
                  stroke="#00FF9D"
                  strokeWidth="1"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* AI Feed - Live engagement */}
      <div className="hud-card-signal">
        <h2 className="text-[0.7rem] text-[#00FF9D] mb-2">
          AI FEED
        </h2>
        <div className="space-y-1 text-[0.7rem] font-mono text-[#C7D8FF]/80 max-h-40 overflow-y-auto">
          {aiAgents.length > 0 ? (
            aiAgents.map((agent, i) => (
              <div key={i} className="flex items-start gap-2 hover:bg-[#00FF9D]/5 p-1 rounded transition-all">
                <span className={
                  agent.type === 'vault' ? 'text-[#00D4FF]' :
                  agent.type === 'mission' ? 'text-[#7C00FF]' :
                  agent.type === 'governance' ? 'text-[#3AA3FF]' :
                  'text-[#00FF9D]'
                }>
                  [{agent.name}]
                </span>
                <span>{agent.status === 'active' ? 'monitoring' : agent.status}</span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-start gap-2 hover:bg-[#00FF9D]/5 p-1 rounded transition-all">
                <span className="text-[#00D4FF]">[VAULT AI]</span>
                <span>pools stable · refill ETA 9h</span>
              </div>
              <div className="flex items-start gap-2 hover:bg-[#00FF9D]/5 p-1 rounded transition-all">
                <span className="text-[#7C00FF]">[MISSION AI]</span>
                <span>3 new world quests added</span>
              </div>
              <div className="flex items-start gap-2 hover:bg-[#00FF9D]/5 p-1 rounded transition-all">
                <span className="text-[#3AA3FF]">[GOV AI]</span>
                <span>proposal #27 trending YES (71%)</span>
              </div>
              <div className="flex items-start gap-2 hover:bg-[#00FF9D]/5 p-1 rounded transition-all">
                <span className="text-[#00FF9D]">[SECURITY]</span>
                <span>no active threats</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent rewards - Loot box appeal */}
      <div className="hud-card border-[#00FF9D]/35 bg-[#00FF9D]/5" style={{ boxShadow: '0 0 20px rgba(0,255,157,0.3)' }}>
        <h2 className="text-[0.7rem] text-[#00FF9D] mb-2">
          RECENT REWARDS
        </h2>
        <div className="space-y-2">
          {rewards && rewards.length > 0 ? (
            rewards.slice(0, 3).map((reward, i) => (
              <div key={i} className="flex items-center justify-between text-[0.7rem]">
                <span className="text-[#C7D8FF]/70">{reward.source}</span>
                <span className="data-text text-[#00FF9D]">+{parseFloat(reward.amount).toFixed(1)} {reward.token}</span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center justify-between text-[0.7rem]">
                <span className="text-[#C7D8FF]/70">Mission completed</span>
                <span className="data-text text-[#00FF9D]">+35 SIGNAL</span>
              </div>
              <div className="flex items-center justify-between text-[0.7rem]">
                <span className="text-[#C7D8FF]/70">Vault stake</span>
                <span className="data-text text-[#7C00FF]">+2.5 VOID</span>
              </div>
              <div className="flex items-center justify-between text-[0.7rem]">
                <span className="text-[#C7D8FF]/70">Daily check-in</span>
                <span className="data-text text-[#00D4FF]">+5 SIGNAL</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Vault summary - Progress visibility */}
      <div className="hud-card-void">
        <h2 className="text-[0.7rem] text-[#7C00FF] mb-2">
          VAULT SUMMARY
        </h2>
        <div className="space-y-2 text-[0.7rem]">
          <div className="flex justify-between">
            <span className="text-[#C7D8FF]/70">Staked</span>
            <span className="data-text text-[#7C00FF]">{totalStaked.toLocaleString()} VOID</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#C7D8FF]/70">Earning</span>
            <span className="data-text text-[#00FF9D]">{avgAPR.toFixed(1)}% APR</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#C7D8FF]/70">Pending</span>
            <span className="data-text text-[#00D4FF]">+{pendingRewards.toFixed(1)} VOID</span>
          </div>
          <button 
            onClick={async () => {
              if (rewards && rewards.length > 0) {
                await claimRewards(rewards.map(r => r.id));
              }
            }}
            className="w-full mt-2 px-3 py-2 bg-[#7C00FF]/20 hover:bg-[#7C00FF]/30 border border-[#7C00FF]/60 rounded-lg text-[#7C00FF] font-mono text-xs transition-all"
          >
            Claim Rewards
          </button>
        </div>
      </div>
    </aside>
  );
}
