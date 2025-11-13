'use client';

import React, { useState } from 'react';
import { MessageSquare, Clock, Sparkles, Gift } from 'lucide-react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  type: 'global' | 'nearby';
}

interface AIActivity {
  id: string;
  message: string;
  timestamp: number;
}

interface RightRailProps {
  hasNearbyPlayers: boolean;
  claimableRewards: number;
  totalStaked: number;
  emissionCountdown: number;
  aiActivity: AIActivity[];
  onClaimRewards: () => void;
}

export default function RightRail({
  hasNearbyPlayers,
  claimableRewards,
  totalStaked,
  emissionCountdown,
  aiActivity,
  onClaimRewards,
}: RightRailProps) {
  const [chatTab, setChatTab] = useState<'global' | 'nearby'>('global');
  const [messages] = useState<ChatMessage[]>([
    { id: '1', username: 'Operator', message: 'System online. Welcome to the VOID.', type: 'global' },
    { id: '2', username: 'Agent_47', message: 'Looking for a crew for the DeFi heist', type: 'global' },
  ]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Emission Countdown */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-signal-green/40 via-cyber-cyan/30 to-void-purple/20 blur-sm rounded-2xl" />
        <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,255,157,0.25)]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-signal-green animate-pulse" />
            <h3 className="text-xs font-display text-signal-green uppercase tracking-[0.25em]">Next Emission</h3>
          </div>
          <div className="text-2xl font-mono text-white text-center tracking-wider">
            {formatTime(emissionCountdown)}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-cyber-cyan/40 via-psx-blue/30 to-void-purple/20 blur-sm rounded-2xl" />
        <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.25)] h-[280px] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-bio-silver/20">
            <button
              onClick={() => setChatTab('global')}
              className={`flex-1 px-3 py-2 text-xs font-display uppercase tracking-[0.2em] transition-colors ${
                chatTab === 'global'
                  ? 'bg-signal-green/20 text-signal-green border-b-2 border-signal-green'
                  : 'text-bio-silver/60 hover:text-bio-silver'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setChatTab('nearby')}
              disabled={!hasNearbyPlayers}
              className={`flex-1 px-3 py-2 text-xs font-display uppercase tracking-[0.2em] transition-colors ${
                chatTab === 'nearby'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border-b-2 border-cyber-cyan'
                  : hasNearbyPlayers
                  ? 'text-bio-silver/60 hover:text-bio-silver'
                  : 'text-bio-silver/30 cursor-not-allowed'
              }`}
            >
              Nearby {hasNearbyPlayers && <span className="ml-1 text-[0.6rem]">●</span>}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-bio-silver/20 scrollbar-track-transparent">
            {messages
              .filter((msg) => msg.type === chatTab)
              .map((msg) => (
                <div key={msg.id} className="text-xs">
                  <span className={`font-display ${chatTab === 'global' ? 'text-signal-green' : 'text-cyber-cyan'}`}>
                    {msg.username}:
                  </span>
                  <span className="text-bio-silver ml-2">{msg.message}</span>
                </div>
              ))}
            {messages.filter((msg) => msg.type === chatTab).length === 0 && (
              <p className="text-xs text-bio-silver/60 text-center py-4">
                {chatTab === 'nearby' ? 'No nearby players' : 'No messages'}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-bio-silver/20 p-2">
            <input
              type="text"
              placeholder="Type message..."
              className="w-full bg-void-deep/50 border border-bio-silver/20 rounded px-3 py-1.5 text-xs text-white placeholder:text-bio-silver/40 focus:outline-none focus:border-signal-green/50"
            />
          </div>
        </div>
      </div>

      {/* AI Activity Feed */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-void-purple/40 via-cyber-cyan/30 to-signal-green/20 blur-sm rounded-2xl" />
        <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(124,0,255,0.25)] h-[140px] flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-void-purple" />
            <h3 className="text-xs font-display text-void-purple uppercase tracking-[0.25em]">AI Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-bio-silver/20 scrollbar-track-transparent">
            {aiActivity.slice(0, 3).map((activity) => (
              <p key={activity.id} className="text-xs text-bio-silver/80 leading-relaxed">
                {activity.message}
              </p>
            ))}
            {aiActivity.length === 0 && (
              <p className="text-xs text-bio-silver/60 text-center">No recent AI activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Rewards Summary */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-yellow-500/40 via-orange-500/30 to-red-500/20 blur-sm rounded-2xl" />
        <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(255,200,0,0.25)]">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-3.5 h-3.5 text-yellow-500" />
            <h3 className="text-xs font-display text-yellow-500 uppercase tracking-[0.25em]">Rewards</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] text-bio-silver/60 uppercase">Claimable</span>
              <span className="text-sm font-mono text-signal-green">{claimableRewards.toFixed(2)} VOID</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] text-bio-silver/60 uppercase">Staked</span>
              <span className="text-sm font-mono text-white">{totalStaked.toLocaleString()} VOID</span>
            </div>
            {claimableRewards > 0 && (
              <button
                onClick={onClaimRewards}
                className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-signal-green to-cyber-cyan text-void-black text-xs font-display uppercase tracking-wider rounded hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-all"
              >
                Claim Rewards
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
