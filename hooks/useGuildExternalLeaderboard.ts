/**
 * Guild.xyz External Leaderboard Hook
 * 
 * Fetches and displays Guild.xyz leaderboard data
 * Falls back to mock data when integration is disabled
 */

import { useState, useEffect } from 'react';
import { fetchGuildLeaderboard, type GuildLeaderboardEntry } from '@/lib/guild/guildApi';
import { FEATURES } from '@/config/voidConfig';

function generateMockGuildLeaderboard(): GuildLeaderboardEntry[] {
  const mockUsers = [
    { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', username: 'CyberWhale', score: 12450 },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', username: 'VoidMaster', score: 10230 },
    { address: '0x1a1ec25DC08e98e5E93F1104B5e5cdD298707d31', username: 'NetRunner', score: 8920 },
    { address: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3', username: 'DataDrifter', score: 7650 },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', username: 'GuildKing', score: 6890 },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', username: 'CryptoSage', score: 6120 },
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', username: 'ByteBaron', score: 5340 },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', username: 'PixelPioneer', score: 4870 },
    { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', username: 'CodeCrusader', score: 4220 },
    { address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', username: 'ChainChampion', score: 3890 },
  ];

  return mockUsers.map((user, index) => ({
    rank: index + 1,
    address: user.address,
    username: user.username,
    score: user.score,
    change: Math.floor(Math.random() * 10) - 3, // Random change -3 to +6
  }));
}

export function useGuildExternalLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<GuildLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    async function loadLeaderboard() {
      setIsLoading(true);
      setError(null);

      try {
        // Use mock data if Guild.xyz integration is disabled
        if (!FEATURES.enableGuildXYZIntegration) {
          const mockData = generateMockGuildLeaderboard();
          setLeaderboard(mockData);
          setLastUpdated(Date.now());
          setIsLoading(false);
          return;
        }

        // Fetch live Guild.xyz data
        const response = await fetchGuildLeaderboard();
        setLeaderboard(response.entries);
        setLastUpdated(response.lastUpdated);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Guild.xyz leaderboard:', err);
        setError('Failed to load leaderboard');
        
        // Fallback to mock data on error
        const mockData = generateMockGuildLeaderboard();
        setLeaderboard(mockData);
        setLastUpdated(Date.now());
        setIsLoading(false);
      }
    }

    loadLeaderboard();

    // Refresh every 5 minutes if integration is enabled
    const interval = FEATURES.enableGuildXYZIntegration 
      ? setInterval(loadLeaderboard, 5 * 60 * 1000) 
      : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return {
    leaderboard,
    isLoading,
    error,
    lastUpdated,
  };
}
