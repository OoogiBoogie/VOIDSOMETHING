'use client';

/**
 * SOCIAL SNAPSHOT - Friends online, nearby players
 */

import React from 'react';
import type { HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';

interface SocialSnapshotProps {
  snapshot: EconomySnapshot;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

// Mock friends data
const MOCK_FRIENDS = [
  { id: '1', username: 'CyberVoid42', status: 'online', zone: 'DEFI_TOWER', activity: 'Staking' },
  { id: '2', username: 'PixelPunk', status: 'online', zone: 'CREATOR_HUB', activity: 'Building' },
  { id: '3', username: 'DAOWhale', status: 'idle', zone: 'DAO_PLAZA', activity: 'Voting' },
];

const MOCK_NEARBY = [
  { id: 'n1', username: 'Anon_7788', distance: 45, zone: 'VOID_CENTER' },
  { id: 'n2', username: 'GlitchRunner', distance: 120, zone: 'VOID_CENTER' },
];

export default function SocialSnapshot({
  snapshot,
  onOpenWindow,
  theme
}: SocialSnapshotProps) {
  return (
    <div className={`
      rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/30
      p-4 relative overflow-hidden
      transition-all duration-500
    `}>
      {/* chrome corner glow */}
      <div className={`
        pointer-events-none absolute -bottom-4 -left-4 w-24 h-24 blur-2xl opacity-50
        bg-[radial-gradient(circle,${theme.chromeGlow},transparent_70%)]
      `} />

      <div className="relative">
        {/* Friends section */}
        <div className="mb-4">
          <button
            onClick={() => onOpenWindow('FRIENDS')}
            className="w-full text-left group mb-2"
          >
            <h3 className="text-xs font-bold tracking-widest text-bio-silver/70 group-hover:text-bio-silver transition-colors flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-signal-green" />
              FRIENDS ({MOCK_FRIENDS.filter(f => f.status === 'online').length}/{MOCK_FRIENDS.length})
            </h3>
          </button>

          <div className="flex flex-col gap-1.5">
            {MOCK_FRIENDS.slice(0, 3).map(friend => (
              <button
                key={friend.id}
                onClick={() => onOpenWindow('PLAYER_PROFILE', { playerId: friend.id })}
                className={`
                  group text-left p-2 rounded-lg bg-bio-dark-bone/30 border border-bio-silver/10
                  hover:bg-bio-dark-bone/50 hover:border-bio-silver/30
                  transition-all duration-300
                  flex items-center gap-2
                `}
              >
                <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-signal-green' : 'bg-bio-silver/40'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-bio-silver group-hover:text-white transition-colors truncate">
                    {friend.username}
                  </div>
                  <div className="text-[9px] text-bio-silver/50 truncate">
                    {friend.zone} · {friend.activity}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nearby players */}
        <div>
          <button
            onClick={() => onOpenWindow('WORLD_MAP')}
            className="w-full text-left group mb-2"
          >
            <h3 className="text-xs font-bold tracking-widest text-bio-silver/70 group-hover:text-bio-silver transition-colors flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: theme.borderColor }} />
              NEARBY ({MOCK_NEARBY.length})
            </h3>
          </button>

          <div className="flex flex-col gap-1.5">
            {MOCK_NEARBY.map(player => (
              <button
                key={player.id}
                onClick={() => onOpenWindow('PLAYER_PROFILE', { playerId: player.id })}
                className={`
                  group text-left p-2 rounded-lg bg-bio-dark-bone/30 border border-bio-silver/10
                  hover:bg-bio-dark-bone/50 hover:border-bio-silver/30
                  transition-all duration-300
                  flex items-center justify-between gap-2
                `}
              >
                <div className="text-[11px] font-bold text-bio-silver group-hover:text-white transition-colors truncate">
                  {player.username}
                </div>
                <div className="text-[9px] text-bio-silver/50 whitespace-nowrap">
                  {player.distance}m
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
