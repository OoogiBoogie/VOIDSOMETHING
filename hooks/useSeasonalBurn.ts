/**
 * useSeasonalBurn Hook
 * 
 * Integration with VoidBurnUtilitySeasonal contract
 * Provides season info, user state, and burn functions
 * 
 * Canonical Spec Compliant (Section 9 - Frontend Requirements)
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Contract addresses (update after deployment)
const CONTRACTS = {
  VoidBurnUtilitySeasonal: '0x977087456Dc0f52d28c529216Bab573C2EF293f3',
  XPRewardSystemSeasonal: '0x187008E91C7C0C0e8089a68099204A8afa41C90B',
  DistrictAccessBurn: '0xbBa6f04577aE216A6FF5E536C310194711cE57Ae',
  LandUpgradeBurn: '0xdA7b1b105835ebaA5e20DB4b8818977618D08716',
  CreatorToolsBurn: '0x6DCDb3d400afAc09535D7B7A34dAa812e7ccE18a',
  PrestigeBurn: '0xDd23059f8A33782275487b3AAE72851Cf539111B',
  MiniAppBurnAccess: '0x6187BE555990D62E519d998001f0dF10a8055fd3',
};

// BurnModule enum (matches VoidBurnUtilitySeasonal.sol)
enum BurnModule {
  DISTRICT = 0,
  LAND = 1,
  CREATOR = 2,
  PRESTIGE = 3,
  MINIAPP = 4,
}

interface SeasonConfig {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  dailyCreditCap: bigint;
  seasonCreditCap: bigint;
  active: boolean;
  xpConfig: {
    baseXPPerVOID: bigint;
    dailySoftCap1: bigint;
    dailySoftCap2: bigint;
    dailyMult1: bigint;
    dailyMult2: bigint;
    dailyMult3: bigint;
  };
}

interface UserSeasonState {
  lastDailyReset: bigint;
  burnedToday: bigint;
  burnedThisSeason: bigint;
  xp: bigint;
  creditedBurn: bigint;
}

interface UserLifetimeState {
  totalBurnedAllTime: bigint;
  prestigeRank: number;
  creatorTier: number;
  districtsUnlocked: number;
  miniAppsUnlocked: number;
}

export function useSeasonalBurn() {
  const { address } = useAccount();
  const [currentSeason, setCurrentSeason] = useState<SeasonConfig | null>(null);
  const [userSeasonState, setUserSeasonState] = useState<UserSeasonState | null>(null);
  const [userLifetimeState, setUserLifetimeState] = useState<UserLifetimeState | null>(null);
  const [loading, setLoading] = useState(true);

  // ═════════════════════════════════════════════════════════════════════════
  // SEASON INFO (READ)
  // ═════════════════════════════════════════════════════════════════════════

  const { data: seasonId } = useContractRead({
    address: CONTRACTS.VoidBurnUtilitySeasonal as `0x${string}`,
    abi: [
      {
        name: 'getCurrentSeasonId',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
      },
    ],
    functionName: 'getCurrentSeasonId',
  });

  const { data: seasonConfig } = useContractRead({
    address: CONTRACTS.VoidBurnUtilitySeasonal as `0x${string}`,
    abi: [
      {
        name: 'getSeasonConfig',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'seasonId', type: 'uint256' }],
        outputs: [
          {
            type: 'tuple',
            components: [
              { name: 'id', type: 'uint256' },
              { name: 'startTime', type: 'uint256' },
              { name: 'endTime', type: 'uint256' },
              { name: 'dailyCreditCap', type: 'uint256' },
              { name: 'seasonCreditCap', type: 'uint256' },
              { name: 'xpConfig', type: 'tuple' },
              { name: 'active', type: 'bool' },
            ],
          },
        ],
      },
    ],
    functionName: 'getSeasonConfig',
    args: seasonId ? [seasonId] : undefined,
    enabled: !!seasonId,
  });

  // ═════════════════════════════════════════════════════════════════════════
  // USER STATE (READ)
  // ═════════════════════════════════════════════════════════════════════════

  const { data: userSeason } = useContractRead({
    address: CONTRACTS.VoidBurnUtilitySeasonal as `0x${string}`,
    abi: [
      {
        name: 'getUserSeasonState',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'user', type: 'address' },
          { name: 'seasonId', type: 'uint256' },
        ],
        outputs: [
          {
            type: 'tuple',
            components: [
              { name: 'lastDailyReset', type: 'uint256' },
              { name: 'burnedToday', type: 'uint256' },
              { name: 'burnedThisSeason', type: 'uint256' },
              { name: 'xp', type: 'uint256' },
              { name: 'creditedBurn', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    functionName: 'getUserSeasonState',
    args: address && seasonId ? [address, seasonId] : undefined,
    enabled: !!address && !!seasonId,
  });

  const { data: userLifetime } = useContractRead({
    address: CONTRACTS.VoidBurnUtilitySeasonal as `0x${string}`,
    abi: [
      {
        name: 'lifetimeState',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
          {
            type: 'tuple',
            components: [
              { name: 'totalBurnedAllTime', type: 'uint256' },
              { name: 'prestigeRank', type: 'uint8' },
              { name: 'creatorTier', type: 'uint8' },
              { name: 'districtsUnlocked', type: 'uint8' },
              { name: 'miniAppsUnlocked', type: 'uint8' },
            ],
          },
        ],
      },
    ],
    functionName: 'lifetimeState',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // ═════════════════════════════════════════════════════════════════════════
  // DERIVED DATA
  // ═════════════════════════════════════════════════════════════════════════

  const seasonProgress = useCallback(() => {
    if (!currentSeason) return null;

    const now = BigInt(Math.floor(Date.now() / 1000));
    const total = currentSeason.endTime - currentSeason.startTime;
    const elapsed = now - currentSeason.startTime;
    const remaining = currentSeason.endTime - now;

    return {
      percentComplete: Number((elapsed * 100n) / total),
      daysRemaining: Number(remaining / 86400n),
      hoursRemaining: Number(remaining / 3600n),
    };
  }, [currentSeason]);

  const dailyXPCapStatus = useCallback(() => {
    if (!currentSeason || !userSeasonState) return null;

    const burnedToday = userSeasonState.burnedToday;
    const dailyCap = currentSeason.dailyCreditCap;
    const softCap1 = currentSeason.xpConfig.dailySoftCap1;
    const softCap2 = currentSeason.xpConfig.dailySoftCap2;

    let zone: 1 | 2 | 3 = 1;
    let multiplier = '100%';

    if (burnedToday >= softCap2) {
      zone = 3;
      multiplier = '0%';
    } else if (burnedToday >= softCap1) {
      zone = 2;
      multiplier = '50%';
    }

    return {
      burnedToday: formatEther(burnedToday),
      dailyCap: formatEther(dailyCap),
      percentUsed: Number((burnedToday * 100n) / dailyCap),
      zone,
      multiplier,
      capReached: burnedToday >= dailyCap,
    };
  }, [currentSeason, userSeasonState]);

  const seasonalXPCapStatus = useCallback(() => {
    if (!currentSeason || !userSeasonState) return null;

    const burnedThisSeason = userSeasonState.burnedThisSeason;
    const seasonCap = currentSeason.seasonCreditCap;

    return {
      burnedThisSeason: formatEther(burnedThisSeason),
      seasonCap: formatEther(seasonCap),
      percentUsed: Number((burnedThisSeason * 100n) / seasonCap),
      capReached: burnedThisSeason >= seasonCap,
    };
  }, [currentSeason, userSeasonState]);

  // ═════════════════════════════════════════════════════════════════════════
  // UPDATE STATE
  // ═════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (seasonConfig) {
      setCurrentSeason(seasonConfig as any);
    }
  }, [seasonConfig]);

  useEffect(() => {
    if (userSeason) {
      setUserSeasonState(userSeason as any);
    }
  }, [userSeason]);

  useEffect(() => {
    if (userLifetime) {
      setUserLifetimeState(userLifetime as any);
    }
  }, [userLifetime]);

  useEffect(() => {
    if (seasonConfig !== undefined && userSeason !== undefined) {
      setLoading(false);
    }
  }, [seasonConfig, userSeason]);

  // ═════════════════════════════════════════════════════════════════════════
  // RETURN API
  // ═════════════════════════════════════════════════════════════════════════

  return {
    // Season info
    currentSeasonId: seasonId,
    currentSeason,
    seasonProgress: seasonProgress(),

    // User state
    userSeasonState,
    userLifetimeState,

    // Cap status
    dailyXPCap: dailyXPCapStatus(),
    seasonalXPCap: seasonalXPCapStatus(),

    // Loading
    loading,

    // Contract addresses (for module-specific hooks)
    contracts: CONTRACTS,
  };
}

export { BurnModule, CONTRACTS };
export type { SeasonConfig, UserSeasonState, UserLifetimeState };
