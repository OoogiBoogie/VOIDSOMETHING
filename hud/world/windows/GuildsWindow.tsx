'use client';

/**
 * GUILDS WINDOW - SOCIAL • GUILDS
 * Community management, guild discovery, member lists
 */

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Shield, Users, Star, TrendingUp, Trophy, Medal } from 'lucide-react';
import type { WindowType } from '@/hud/windowTypes';
import { useScoreEvents } from '@/hooks/useScoreEvents';
import { useVoidQuests } from '@/hooks/useVoidQuests';
import { emitVoidEvent } from '@/lib/events/voidEvents';
import { useGuildExternalLeaderboard } from '@/hooks/useGuildExternalLeaderboard';

interface GuildsWindowProps {
  onOpenWindow?: (type: WindowType, props?: any) => void;
  onClose?: () => void;
}

type TabType = 'MY_GUILDS' | 'TRENDING' | 'GUILDXYZ';

export function GuildsWindow({ onOpenWindow }: GuildsWindowProps) {
  const [activeTab, setActiveTab] = useState<TabType>('MY_GUILDS');

  return (
    <div className="flex flex-col gap-4">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="My Guilds" value={2} icon={Shield} />
        <StatCard label="Members" value={47} icon={Users} />
        <StatCard label="Rank" value="Elite" icon={Star} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-bio-silver/30 pb-2">
        <TabButton
          label="My Guilds"
          icon={Shield}
          active={activeTab === 'MY_GUILDS'}
          onClick={() => setActiveTab('MY_GUILDS')}
        />
        <TabButton
          label="Trending"
          icon={TrendingUp}
          active={activeTab === 'TRENDING'}
          onClick={() => setActiveTab('TRENDING')}
        />
        <TabButton
          label="Guild.xyz Rankings"
          icon={Trophy}
          active={activeTab === 'GUILDXYZ'}
          onClick={() => setActiveTab('GUILDXYZ')}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'MY_GUILDS' && <MyGuildsTab />}
      {activeTab === 'TRENDING' && <TrendingGuildsTab />}
      {activeTab === 'GUILDXYZ' && <GuildXYZLeaderboardTab />}
    </div>
  );
}

function TabButton({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.7rem] font-medium transition
        ${active 
          ? 'bg-void-purple/20 text-void-purple border border-void-purple/40' 
          : 'text-bio-silver/60 hover:text-bio-silver/90 hover:bg-bio-silver/5'}
      `}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </button>
  );
}

function MyGuildsTab() {
  return (
    <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-void-purple/60 shadow-[0_0_30px_rgba(139,92,246,0.5)] overflow-hidden">
      <div className="px-3 py-2 border-b border-bio-silver/30 flex items-center justify-between">
        <h3 className="text-[0.8rem] font-mono tracking-[0.22em] uppercase text-void-purple">
          My Guilds
        </h3>
        <button className="text-[0.6rem] px-2 py-1 rounded bg-void-purple/20 hover:bg-void-purple/30 text-void-purple border border-void-purple/40 transition">
          + Join Guild
        </button>
      </div>
      <div className="max-h-[50vh] overflow-y-auto divide-y divide-bio-silver/15">
        {MOCK_MY_GUILDS.map((guild) => (
          <GuildCard key={guild.id} guild={guild} isJoined />
        ))}
        {MOCK_MY_GUILDS.length === 0 && (
          <div className="px-6 py-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-void-purple/40" />
            <h3 className="text-[0.85rem] font-bold text-void-purple mb-2">No Guilds Yet</h3>
            <p className="text-[0.7rem] text-bio-silver/60 mb-4">
              Join a guild to unlock team benefits and exclusive content
            </p>
            <button className="text-[0.7rem] px-4 py-2 rounded bg-void-purple/20 hover:bg-void-purple/30 text-void-purple border border-void-purple/40 transition font-semibold">
              Explore Guilds →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function TrendingGuildsTab() {
  return (
    <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden">
      <div className="px-3 py-2 border-b border-bio-silver/30 flex items-center justify-between">
        <h3 className="text-[0.8rem] font-mono tracking-[0.22em] uppercase text-bio-silver/80">
          Trending Guilds
        </h3>
        <TrendingUp className="w-4 h-4 text-signal-green" />
      </div>
      <div className="max-h-[50vh] overflow-y-auto divide-y divide-bio-silver/15">
        {MOCK_TRENDING_GUILDS.map((guild) => (
          <GuildCard key={guild.id} guild={guild} />
        ))}
        {MOCK_TRENDING_GUILDS.length === 0 && (
          <div className="px-6 py-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-bio-silver/40" />
            <p className="text-[0.8rem] text-bio-silver/80 mb-1">No trending guilds found</p>
            <p className="text-[0.65rem] text-bio-silver/50">Check back later or create your own</p>
          </div>
        )}
      </div>
    </section>
  );
}

function GuildXYZLeaderboardTab() {
  const { leaderboard, isLoading, error, lastUpdated } = useGuildExternalLeaderboard();
  const { address } = useAccount();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-amber-400'; // Gold
    if (rank === 2) return 'text-gray-300'; // Silver
    if (rank === 3) return 'text-orange-400'; // Bronze
    return 'text-bio-silver/60';
  };

  return (
    <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-signal-green/40 overflow-hidden">
      <div className="px-3 py-2 border-b border-bio-silver/30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-signal-green" />
            <h3 className="text-[0.8rem] font-mono tracking-[0.22em] uppercase text-signal-green">
              Guild.xyz Global Rankings
            </h3>
          </div>
          {!isLoading && (
            <div className="text-[0.6rem] text-bio-silver/50">
              Updated {formatTimestamp(lastUpdated)}
            </div>
          )}
        </div>
        <div className="text-[0.65rem] text-bio-silver/60">
          Platform ID: 96dae542-447d-4103-b05f-38bd7050980c
        </div>
      </div>

      {isLoading ? (
        <div className="px-6 py-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-signal-green/30 border-t-signal-green rounded-full mx-auto mb-3"></div>
          <div className="text-[0.75rem] text-bio-silver/60">Loading rankings...</div>
        </div>
      ) : error ? (
        <div className="px-6 py-8 text-center">
          <div className="text-[0.75rem] text-signal-red mb-2">{error}</div>
          <div className="text-[0.65rem] text-bio-silver/50">Using cached data</div>
        </div>
      ) : (
        <div className="max-h-[50vh] overflow-y-auto">
          <div className="divide-y divide-bio-silver/15">
            {leaderboard.map((entry) => {
              const isCurrentUser = address?.toLowerCase() === entry.address.toLowerCase();
              
              return (
                <div
                  key={entry.address}
                  className={`
                    px-3 py-2.5 flex items-center gap-3 transition
                    ${isCurrentUser ? 'bg-void-purple/20' : 'hover:bg-bio-silver/5'}
                  `}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8">
                    {entry.rank <= 3 ? (
                      <Medal className={`w-5 h-5 ${getMedalColor(entry.rank)}`} />
                    ) : (
                      <div className="text-[0.75rem] font-mono text-bio-silver/60">
                        #{entry.rank}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.75rem] font-medium text-bio-silver/90 truncate">
                      {entry.username || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                    </div>
                    <div className="text-[0.65rem] text-bio-silver/50 font-mono truncate">
                      {entry.address}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-[0.8rem] font-bold text-signal-green">
                      {entry.score.toLocaleString()}
                    </div>
                    {entry.change !== undefined && (
                      <div className={`text-[0.65rem] ${entry.change > 0 ? 'text-signal-green' : entry.change < 0 ? 'text-signal-red' : 'text-bio-silver/50'}`}>
                        {entry.change > 0 && '+'}
                        {entry.change}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 px-3 py-2">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3 text-void-purple" />
        <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          {label}
        </div>
      </div>
      <div className="text-[0.95rem] text-void-purple font-mono font-bold">
        {value}
      </div>
    </div>
  );
}

function GuildCard({ guild, isJoined = false }: { guild: any; isJoined?: boolean }) {
  const { address } = useAccount();
  const { joinGuildXP } = useScoreEvents();
  const { incrementQuestProgress } = useVoidQuests();
  const [joined, setJoined] = useState(isJoined);

  const handleJoinGuild = async () => {
    if (!address || joined) return;
    
    try {
      // Mock mode: Local state update only
      // Live mode: Contract call when guild system deployed
      // await joinGuild(guild.id);
      
      setJoined(true);
      
      // Grant XP for joining
      await joinGuildXP(guild.id);
      
      // Progress quests
      incrementQuestProgress('milestone_first_guild', 0); // Guild Initiate milestone
      
      // Emit event for notifications
      emitVoidEvent({
        type: 'SCORE_EVENT',
        address,
        payload: {
          eventType: 'GUILD_JOINED',
          xpReward: 15,
          description: `Joined ${guild.name}`,
          metadata: { guildId: guild.id },
        },
      });
    } catch (error) {
      console.error('[GuildsWindow] Join failed:', error);
    }
  };

  return (
    <div className="px-3 py-2.5 hover:bg-void-deep/50 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          {/* Guild Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-void-purple/30 to-void-purple/10 border border-void-purple/40 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-void-purple" />
          </div>

          {/* Guild Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[0.8rem] text-bio-silver/90 font-semibold truncate">
                {guild.name}
              </div>
              {guild.verified && (
                <Star className="w-3 h-3 text-signal-green" fill="currentColor" />
              )}
            </div>
            <div className="text-[0.65rem] text-bio-silver/60 mt-0.5">
              {guild.members.toLocaleString()} members · {guild.category}
            </div>
            {guild.description && (
              <div className="text-[0.65rem] text-bio-silver/50 mt-1 line-clamp-1">
                {guild.description}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleJoinGuild}
          disabled={joined}
          className={`
            text-[0.6rem] px-2.5 py-1 rounded font-mono font-bold
            border transition flex-shrink-0
            ${joined
              ? 'bg-bio-silver/10 text-bio-silver border-bio-silver/40 cursor-not-allowed'
              : 'bg-void-purple/20 text-void-purple border-void-purple/40 hover:bg-void-purple/30'
            }
          `}
        >
          {joined ? 'Joined' : 'Join'}
        </button>
      </div>

      {/* Guild Stats */}
      {guild.stats && (
        <div className="flex gap-3 mt-2 pt-2 border-t border-bio-silver/10">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-bio-silver/50" />
            <span className="text-[0.6rem] text-bio-silver/60">
              {guild.stats.onlineNow} online
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-signal-green/70" />
            <span className="text-[0.6rem] text-bio-silver/60">
              Level {guild.stats.level}
            </span>
          </div>
          {guild.stats.weeklyXP && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-psx-blue/70" />
              <span className="text-[0.6rem] text-bio-silver/60">
                +{guild.stats.weeklyXP.toLocaleString()} XP/week
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const MOCK_MY_GUILDS = [
  {
    id: 1,
    name: "Void Architects",
    members: 2847,
    category: "Builders",
    description: "Creating the metaverse one block at a time",
    verified: true,
    stats: {
      onlineNow: 143,
      level: 47,
      weeklyXP: 125000,
    }
  },
  {
    id: 2,
    name: "PSX Whales",
    members: 892,
    category: "DeFi",
    description: "High-stakes governance and protocol maximalism",
    verified: true,
    stats: {
      onlineNow: 28,
      level: 62,
      weeklyXP: 89000,
    }
  },
];

const MOCK_TRENDING_GUILDS = [
  {
    id: 3,
    name: "Neon Dreamers",
    members: 5432,
    category: "Social",
    description: "Cyberpunk aesthetics and night city vibes",
    verified: true,
    stats: {
      onlineNow: 234,
      level: 38,
      weeklyXP: 156000,
    }
  },
  {
    id: 4,
    name: "Code Samurai",
    members: 1204,
    category: "Developers",
    description: "Building the future of Web3",
    verified: false,
    stats: {
      onlineNow: 67,
      level: 29,
      weeklyXP: 73000,
    }
  },
  {
    id: 5,
    name: "Alpha Hunters",
    members: 3891,
    category: "Trading",
    description: "Finding alpha before it's mainstream",
    verified: true,
    stats: {
      onlineNow: 178,
      level: 51,
      weeklyXP: 198000,
    }
  },
];
