/**
 * Guild.xyz API Client
 * 
 * VOID Platform Integration
 * Platform ID: 96dae542-447d-4103-b05f-38bd7050980c
 */

const GUILDXYZ_PLATFORM_ID = '96dae542-447d-4103-b05f-38bd7050980c';
const GUILDXYZ_API_BASE = 'https://api.guild.xyz/v1';

export interface GuildLeaderboardEntry {
  rank: number;
  address: string;
  username?: string;
  score: number;
  avatar?: string;
  change?: number;
}

export interface GuildLeaderboardResponse {
  entries: GuildLeaderboardEntry[];
  totalUsers: number;
  lastUpdated: number;
}

/**
 * Fetch Guild.xyz leaderboard for VOID platform
 */
export async function fetchGuildLeaderboard(): Promise<GuildLeaderboardResponse> {
  try {
    const response = await fetch(`${GUILDXYZ_API_BASE}/leaderboard/${GUILDXYZ_PLATFORM_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Guild.xyz API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      entries: data.entries || [],
      totalUsers: data.totalUsers || 0,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Failed to fetch Guild.xyz leaderboard:', error);
    throw error;
  }
}

/**
 * Get user's Guild.xyz rank
 */
export async function getUserGuildRank(address: string): Promise<GuildLeaderboardEntry | null> {
  try {
    const response = await fetch(`${GUILDXYZ_API_BASE}/user/${GUILDXYZ_PLATFORM_ID}/${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch Guild.xyz user rank:', error);
    return null;
  }
}
