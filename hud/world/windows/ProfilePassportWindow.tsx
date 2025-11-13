'use client';

/**
 * PROFILE PASSPORT WINDOW - SOCIAL · PROFILE
 * User identity card: avatar, tier, scores, achievements, guilds, activity
 * PHASE-3 PRIORITY 1 — WIRED TO VOIDSCORE ✅
 */

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  User, Edit, Camera, Award, Shield, Star, TrendingUp, 
  Twitter, MessageCircle, Link as LinkIcon, CheckCircle,
  Clock, Zap, Loader2, AlertCircle, Trophy, Target
} from 'lucide-react';
import type { WindowType } from '@/hud/windowTypes';
import { useVoidScore } from '@/hooks/useVoidScore';
import { useVoidQuests } from '@/hooks/useVoidQuests';
import { useVoidAirdrop } from '@/hooks/useVoidAirdrop';
import { useVoidUnlocks } from '@/hooks/useVoidUnlocks';

interface ProfilePassportProps {
  address?: string; // If viewing someone else's profile
  onOpenWindow?: (type: WindowType, props?: any) => void;
  onClose?: () => void;
}

export function ProfilePassportWindow({ address: viewAddress, onOpenWindow }: ProfilePassportProps) {
  const { address: connectedAddress } = useAccount();
  const address = viewAddress || connectedAddress;
  const isOwnProfile = !viewAddress || viewAddress === connectedAddress;

  // Wire to real hooks
  const { voidScore, isLoading, refresh } = useVoidScore(address);
  const { quests, getCompletedQuests } = useVoidQuests();
  const { airdropData } = useVoidAirdrop();
  const { unlockedZones, nextZone, progress: unlockProgress } = useVoidUnlocks();

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'quests' | 'unlocks'>('overview');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-void-purple mb-3" />
        <p className="text-sm text-bio-silver/60">Loading profile...</p>
      </div>
    );
  }

  // No score data (new user)
  if (!voidScore) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <Shield className="w-16 h-16 text-void-purple/40 mb-4" />
        <h2 className="text-lg font-bold text-bio-silver mb-2">Welcome to The VOID</h2>
        <p className="text-sm text-bio-silver/70 mb-4 max-w-md">
          Complete your first quest, send a message, or participate in governance to begin leveling up your VoidScore.
        </p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-void-purple/20 hover:bg-void-purple/30 border border-void-purple/40 text-void-purple rounded-lg text-sm transition"
        >
          Refresh Profile
        </button>
      </div>
    );
  }

  // Display name defaults to address truncation
  // Future: Off-chain profile storage will provide username/bio/avatar
  const displayName = address?.slice(0, 8) || 'Unknown';

  return (
    <div className="flex flex-col h-full">
      {/* Header Section - Avatar + Basic Info */}
      <div className="relative pb-4 mb-4 border-b border-bio-silver/20">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-void-purple/30 to-psx-blue/30 border-2 border-void-purple/60 flex items-center justify-center overflow-hidden">
              {/* Avatar placeholder - future: off-chain profile storage */}
              <User className="w-10 h-10 text-void-purple" />
            </div>
            {isOwnProfile && (
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-void-purple border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          {/* Info Column */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-bio-silver">
                {displayName}
              </h2>
              {/* Verification badge - future: off-chain profile verification */}
            </div>
            <div className="text-xs text-bio-silver/60 font-mono mb-2">
              {address?.slice(0, 8)}...{address?.slice(-6)}
            </div>
            {/* Bio - future: off-chain profile storage */}
            <p className="text-sm text-bio-silver/80 leading-relaxed mb-2">
              VoidScore member since day {Math.floor(voidScore.accountAge)}
            </p>
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <button className="px-3 py-1.5 rounded-lg bg-void-purple/20 hover:bg-void-purple/30 border border-void-purple/40 text-void-purple text-xs font-mono transition flex items-center gap-1.5">
              <Edit className="w-3 h-3" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Tier & Score Card */}
      <div className="rounded-2xl bg-gradient-to-br from-void-purple/20 to-psx-blue/20 border border-void-purple/40 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${getTierStyle(voidScore.tier).bg}
              ${getTierStyle(voidScore.tier).border}
              border-2
            `}>
              <Star className={`w-5 h-5 ${getTierStyle(voidScore.tier).text}`} fill="currentColor" />
            </div>
            <div>
              <div className={`text-sm font-bold ${getTierStyle(voidScore.tier).text}`}>
                {voidScore.tier}
              </div>
              <div className="text-xs text-bio-silver/60">
                VoidScore
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-bio-silver/60 uppercase tracking-wider">Current Score</div>
            <div className="text-xl font-bold font-mono text-void-purple">{voidScore.currentScore.toLocaleString()}</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-bio-silver/60 mb-1">
            <span>XP Progress</span>
            <span>{voidScore.progress.toFixed(0)}% to next tier</span>
          </div>
          <div className="h-2 rounded-full bg-black/50 overflow-hidden">
            <div 
              className={`h-full ${getTierStyle(voidScore.tier).gradient} transition-all duration-500`}
              style={{ width: `${voidScore.progress}%` }}
            />
          </div>
          <div className="text-xs text-bio-silver/50 mt-1 text-center">
            {voidScore.currentScore}/{voidScore.nextTierThreshold} - {voidScore.nextTierThreshold - voidScore.currentScore} XP needed
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Lifetime Score" value={voidScore.lifetimeScore.toLocaleString()} />
          <StatPill label="Account Age" value={`${Math.floor(voidScore.accountAge)}d`} />
          <StatPill label="Global Msgs" value={`${voidScore.globalMessagesRemaining}`} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-3 border-b border-bio-silver/10 pb-2">
        {(['overview', 'achievements', 'quests', 'unlocks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition
              ${activeTab === tab
                ? 'bg-void-purple/20 text-void-purple border border-void-purple/40'
                : 'text-bio-silver/60 hover:text-bio-silver hover:bg-bio-silver/5'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Airdrop Preview */}
            {airdropData && (
              <Section title="Airdrop Weight" icon={Star}>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-bio-silver/70">Total Weight</span>
                    <span className="text-void-purple font-bold">{airdropData.weight.toLocaleString()}</span>
                  </div>
                  <div className="text-xs space-y-1 text-bio-silver/60">
                    <div className="flex justify-between">
                      <span>XP Component (40%)</span>
                      <span>{airdropData.breakdown.xpComponent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier Component (30%)</span>
                      <span>{airdropData.breakdown.tierComponent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quest Component (20%)</span>
                      <span>{airdropData.breakdown.questComponent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guild Component (10%)</span>
                      <span>{airdropData.breakdown.guildComponent}</span>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Badges Section - Future: Off-chain profile storage integration */}
            <Section title="Badges" icon={Award}>
              <div className="text-xs text-bio-silver/60 text-center py-4">
                Badges will be loaded from off-chain profile storage
              </div>
            </Section>

            {/* Guilds Section - Future: Guilds contract integration */}
            <Section title="Guilds" icon={Shield}>
              <div className="text-xs text-bio-silver/60 text-center py-4">
                Guild memberships will be loaded from on-chain data
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'achievements' && (
          <Section title="Achievements" icon={Award}>
            <div className="text-xs text-bio-silver/60 text-center py-4">
              Achievements will be loaded from on-chain contracts & off-chain indexer
            </div>
          </Section>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-4">
            <Section title={`Completed Quests (${getCompletedQuests().length})`} icon={Trophy}>
              {getCompletedQuests().length === 0 ? (
                <div className="text-xs text-bio-silver/60 text-center py-4">
                  No quests completed yet
                </div>
              ) : (
                <div className="space-y-2">
                  {getCompletedQuests().slice(0, 5).map((quest) => (
                    <div key={quest.id} className="p-2 bg-black/40 rounded-lg border border-bio-silver/10">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-bio-silver">{quest.title}</div>
                          <div className="text-xs text-bio-silver/60 mt-0.5">{quest.description}</div>
                        </div>
                        <div className="text-xs text-emerald-400 font-bold">+{quest.reward.xp} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}

        {activeTab === 'unlocks' && (
          <div className="space-y-4">
            <Section title={`World Progress (${unlockProgress}%)`} icon={Target}>
              <div className="space-y-3">
                <div className="h-2 rounded-full bg-black/50 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-void-purple to-psx-blue transition-all duration-500"
                    style={{ width: `${unlockProgress}%` }}
                  />
                </div>
                <div className="text-xs text-bio-silver/70">
                  <div className="font-bold mb-2">Unlocked Zones ({unlockedZones.length})</div>
                  {unlockedZones.map((zone) => (
                    <div key={zone.zoneId} className="flex items-center gap-2 py-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>{zone.displayName}</span>
                    </div>
                  ))}
                </div>
                {nextZone && (
                  <div className="mt-3 p-2 bg-void-purple/10 border border-void-purple/30 rounded-lg">
                    <div className="text-xs text-void-purple font-bold mb-1">Next Unlock</div>
                    <div className="text-xs text-bio-silver/70">{nextZone.displayName}</div>
                    <div className="text-xs text-bio-silver/50">Requires {nextZone.requiredTier} tier</div>
                  </div>
                )}
              </div>
            </Section>
          </div>
        )}
      </div>

      {/* Action Buttons (if own profile) */}
      {isOwnProfile && (
        <div className="flex gap-2 pt-3 border-t border-bio-silver/10 mt-3">
          <button className="flex-1 px-4 py-2 rounded-lg bg-void-purple/20 hover:bg-void-purple/30 border border-void-purple/40 text-void-purple text-sm font-mono transition">
            Customize Avatar
          </button>
          <button 
            onClick={() => onOpenWindow?.('ACHIEVEMENTS')}
            className="flex-1 px-4 py-2 rounded-lg bg-black/40 hover:bg-black/60 border border-bio-silver/40 text-bio-silver text-sm font-mono transition"
          >
            View All Achievements
          </button>
        </div>
      )}
    </div>
  );
}

// Helper Components

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-black/40 border border-bio-silver/20 p-3">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-bio-silver/10">
        <Icon className="w-4 h-4 text-void-purple" />
        <h3 className="text-sm font-mono uppercase tracking-wider text-bio-silver/80">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-bio-silver/60 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-sm font-mono font-bold text-bio-silver">{value}</div>
    </div>
  );
}

// Helper Functions

function getTierStyle(tier: string) {
  switch (tier) {
    case 'S_TIER':
      return {
        bg: 'bg-gradient-to-br from-amber-500/30 to-orange-500/30',
        border: 'border-amber-500',
        text: 'text-amber-500',
        gradient: 'bg-gradient-to-r from-amber-500 to-orange-500'
      };
    case 'GOLD':
      return {
        bg: 'bg-gradient-to-br from-yellow-500/30 to-amber-500/30',
        border: 'border-yellow-500',
        text: 'text-yellow-500',
        gradient: 'bg-gradient-to-r from-yellow-500 to-amber-500'
      };
    case 'SILVER':
      return {
        bg: 'bg-gradient-to-br from-gray-300/30 to-gray-400/30',
        border: 'border-gray-400',
        text: 'text-gray-300',
        gradient: 'bg-gradient-to-r from-gray-300 to-gray-400'
      };
    default: // BRONZE
      return {
        bg: 'bg-gradient-to-br from-orange-700/30 to-orange-800/30',
        border: 'border-orange-700',
        text: 'text-orange-700',
        gradient: 'bg-gradient-to-r from-orange-700 to-orange-800'
      };
  }
}

function getNextTier(tier: string): string {
  switch (tier) {
    case 'BRONZE': return 'Silver';
    case 'SILVER': return 'Gold';
    case 'GOLD': return 'S-Tier';
    default: return 'Max';
  }
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// User Profile Type Definition
// Integrated with Phase 4.0 useVoidScore hook

interface UserProfile {
  address: string;
  username?: string;
  bio?: string;
  avatar?: string;
  verified: boolean;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER';
  level: number;
  currentScore: number;
  lifetimeScore: number;
  xpProgress: number;
  xpToNext: number;
  badges: { id: string; name: string }[];
  achievements: { id: string; name: string; icon: string; unlocked: boolean }[];
  linkedSocials: { platform: string; username: string; verified: boolean }[];
  guilds: { id: string; name: string; role: string }[];
  recentActivity: { type: string; timestamp: number; description: string }[];
  stats: {
    totalMessages: number;
    streak: number;
  };
}

/*
 * Legacy mock profile provider removed - Phase 4.0 complete
 * ProfilePassportWindow now uses useVoidScore hook for all XP/tier/level data
 * See hooks/useVoidScore.ts for live implementation
 */

/*
function getMockProfile(address: string): UserProfile {
  return {
    address,
    username: 'voidbuilder',
    bio: 'Building the future of decentralized metaverses. Creator, trader, and community leader.',
    avatar: undefined,
    verified: true,
    tier: 'GOLD',
    level: 12,
    currentScore: 327,
    lifetimeScore: 8942,
    xpProgress: 78,
    xpToNext: 273, // 600 - 327 = 273 to S-tier
    badges: [
      { id: 'og', name: 'OG' },
      { id: 'alpha', name: 'ALPHA' },
      { id: 'builder', name: 'BUILDER' },
      { id: 'whale', name: 'WHALE' }
    ],
    achievements: [
      { id: '1', name: 'First Message', icon: '🎯', unlocked: true },
      { id: '2', name: 'Staker', icon: '🏆', unlocked: true },
      { id: '3', name: 'Guild Leader', icon: '⚡', unlocked: true },
      { id: '4', name: '100 Messages', icon: '🔥', unlocked: true },
      { id: '5', name: 'Whale', icon: '💎', unlocked: true },
      { id: '6', name: 'Early Adopter', icon: '🌟', unlocked: true },
      { id: '7', name: 'Land Owner', icon: '🏠', unlocked: false },
      { id: '8', name: 'DAO Voter', icon: '🗳️', unlocked: false },
      { id: '9', name: 'Creator', icon: '🎨', unlocked: false },
      { id: '10', name: 'Gig Master', icon: '💼', unlocked: false },
      { id: '11', name: 'Social Butterfly', icon: '🦋', unlocked: false },
      { id: '12', name: 'Platinum', icon: '💠', unlocked: false }
    ],
    linkedSocials: [
      { platform: 'twitter', username: '@voidbuilder', verified: true },
      { platform: 'discord', username: 'voidbuilder#1234', verified: true },
      { platform: 'farcaster', username: 'voidbuilder', verified: false }
    ],
    guilds: [
      { id: '1', name: 'Void Architects', role: 'Member' },
      { id: '2', name: 'PSX Whales', role: 'Admin' }
    ],
    recentActivity: [
      { type: 'stake', timestamp: Date.now() - 2 * 3600000, description: 'Staked 500 VOID' },
      { type: 'guild', timestamp: Date.now() - 86400000, description: 'Joined guild "Alpha Builders"' },
      { type: 'gig', timestamp: Date.now() - 3 * 86400000, description: 'Completed gig "3D Design"' },
      { type: 'message', timestamp: Date.now() - 5 * 86400000, description: 'Sent 50+ messages in Creator Zone' },
      { type: 'tier', timestamp: Date.now() - 7 * 86400000, description: 'Reached Gold tier' }
    ],
    stats: {
      totalMessages: 342,
      streak: 12
    }
  };
}
*/
