/**
 * HOOK: useVoidLeaderboards
 * Leaderboard system - tracks top performers across all categories
 * Ready for indexer integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { shouldUseMockData } from '@/config/voidConfig';
import { getTierForScore } from '@/lib/score/tierRules';
import type { Tier } from '@/lib/score/tierRules';

export type LeaderboardCategory =
  | 'TOP_XP' // Highest lifetime score
  | 'TOP_TIER' // Highest current tier
  | 'TOP_GUILDS' // Most successful guilds
  | 'TOP_EARNERS' // Most VOID earned
  | 'TOP_EXPLORERS' // Most zones visited
  | 'TOP_CREATORS'; // Most content created

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName?: string;
  score: number; // Context-dependent (XP, tier, zones, etc.)
  tier?: Tier;
  change?: number; // Rank change from last period (+ or -)
}

export interface Leaderboard {
  category: LeaderboardCategory;
  entries: LeaderboardEntry[];
  lastUpdated: number;
  userRank?: number; // Current user's rank
}

// ================================
// MOCK DATA (for development)
// ================================

const MOCK_ADDRESSES = [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
  '0x3333333333333333333333333333333333333333',
  '0x4444444444444444444444444444444444444444',
  '0x5555555555555555555555555555555555555555',
  '0x6666666666666666666666666666666666666666',
  '0x7777777777777777777777777777777777777777',
  '0x8888888888888888888888888888888888888888',
  '0x9999999999999999999999999999999999999999',
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
];

function generateMockLeaderboard(
  category: LeaderboardCategory,
  userAddress?: string
): Leaderboard {
  const entries: LeaderboardEntry[] = [];

  // Generate top 10 entries (ENFORCED CAP for demo performance)
  const LEADERBOARD_CAP = 10;
  for (let i = 0; i < LEADERBOARD_CAP; i++) {
    const score = generateScoreForCategory(category, i);
    entries.push({
      rank: i + 1,
      address: MOCK_ADDRESSES[i],
      displayName: `User ${i + 1}`,
      score,
      tier: category === 'TOP_XP' || category === 'TOP_TIER' ? getTierForScore(score) : undefined,
      change: Math.floor(Math.random() * 5) - 2, // Random -2 to +2
    });
  }

  // Find user rank (if connected)
  const userRank = userAddress
    ? Math.floor(Math.random() * 1000) + 11 // Random rank between 11-1000
    : undefined;

  return {
    category,
    entries,
    lastUpdated: Date.now(),
    userRank,
  };
}

function generateScoreForCategory(category: LeaderboardCategory, rank: number): number {
  switch (category) {
    case 'TOP_XP':
      return 10000 - rank * 500; // 10000, 9500, 9000, ...
    case 'TOP_TIER':
      return 10000 - rank * 500; // Same as XP for tier calculation
    case 'TOP_GUILDS':
      return 500 - rank * 25; // Guild members count
    case 'TOP_EARNERS':
      return 50000 - rank * 2500; // VOID earned
    case 'TOP_EXPLORERS':
      return 100 - rank * 5; // Zones visited
    case 'TOP_CREATORS':
      return 200 - rank * 10; // Content pieces created
  }
}

export function useVoidLeaderboards(category: LeaderboardCategory) {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load leaderboard data
   */
  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (shouldUseMockData()) {
        // Mock mode: Generate mock data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        const mockData = generateMockLeaderboard(category, address);
        setLeaderboard(mockData);
      } else {
        // Live mode: TODO - Fetch from indexer/contract
        console.log('[useVoidLeaderboards] Live mode: Indexer call would happen here', {
          category,
        });

        // For now, use mock data even in live mode until indexer is ready
        const mockData = generateMockLeaderboard(category, address);
        setLeaderboard(mockData);
      }
    } catch (err) {
      console.error('[useVoidLeaderboards] Failed to load leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, [category, address]);

  /**
   * Get user's position on leaderboard
   */
  const getUserPosition = useCallback((): LeaderboardEntry | null => {
    if (!address || !leaderboard) return null;

    // Check if user is in top 10
    const topEntry = leaderboard.entries.find(
      (entry) => entry.address.toLowerCase() === address.toLowerCase()
    );
    if (topEntry) return topEntry;

    // User is outside top 10
    if (leaderboard.userRank) {
      return {
        rank: leaderboard.userRank,
        address,
        score: 0, // Unknown score for users outside top 10
      };
    }

    return null;
  }, [address, leaderboard]);

  // Load on mount and when category changes
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    getUserPosition,
    refresh: loadLeaderboard,
  };
}

/**
 * Get all leaderboards at once
 */
export function useAllLeaderboards() {
  const topXP = useVoidLeaderboards('TOP_XP');
  const topTier = useVoidLeaderboards('TOP_TIER');
  const topGuilds = useVoidLeaderboards('TOP_GUILDS');
  const topEarners = useVoidLeaderboards('TOP_EARNERS');
  const topExplorers = useVoidLeaderboards('TOP_EXPLORERS');
  const topCreators = useVoidLeaderboards('TOP_CREATORS');

  const isLoading =
    topXP.isLoading ||
    topTier.isLoading ||
    topGuilds.isLoading ||
    topEarners.isLoading ||
    topExplorers.isLoading ||
    topCreators.isLoading;

  const refresh = useCallback(() => {
    topXP.refresh();
    topTier.refresh();
    topGuilds.refresh();
    topEarners.refresh();
    topExplorers.refresh();
    topCreators.refresh();
  }, [topXP, topTier, topGuilds, topEarners, topExplorers, topCreators]);

  return {
    leaderboards: {
      topXP: topXP.leaderboard,
      topTier: topTier.leaderboard,
      topGuilds: topGuilds.leaderboard,
      topEarners: topEarners.leaderboard,
      topExplorers: topExplorers.leaderboard,
      topCreators: topCreators.leaderboard,
    },
    isLoading,
    refresh,
  };
}
