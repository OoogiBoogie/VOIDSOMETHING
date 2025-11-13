/**
 * VOID Engine React Hooks
 * 
 * React hooks for all VOID Engine services with loading/error states and auto-refresh.
 * All hooks follow the same pattern: { data, loading, error, refresh }
 */

import { useState, useEffect, useCallback } from 'react';
import { voidEmitterService } from '@/services/voidEmitterService';
import { voidVaultService } from '@/services/voidVaultService';
import { voidCreatorRouterService } from '@/services/voidCreatorRouterService';
import { voidHookRouterService } from '@/services/voidHookRouterService';
import { voidTreasuryService } from '@/services/voidTreasuryService';
import { voidGovernanceService } from '@/services/voidGovernanceService';
import { analyticsService } from '@/services/analyticsService';
import {
  VirtualXP,
  VoidEmission,
  ClaimableReward,
  VoidVaultPosition,
  PendingReward,
  VaultYieldRate,
  RewardPool,
  CreatorRoyalties,
  VoidHook,
  TreasuryWallet,
  TreasurySnapshot,
  GovernanceProposal,
  VotingPower,
} from '@/services/voidTypes';

// ============================================================================
// VOID EMITTER HOOKS
// ============================================================================

/**
 * Get user's vXP score
 */
export function useVoidEmitter(userId: string) {
  const [vxp, setVXP] = useState<VirtualXP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await voidEmitterService.getUserVXP(userId);
      setVXP(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vXP');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vxp, loading, error, refresh };
}

/**
 * Get user's emission history
 */
export function useEmissionHistory(userId: string, limit: number = 50) {
  const [emissions, setEmissions] = useState<VoidEmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await voidEmitterService.getUserEmissions(userId, limit);
      setEmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emissions');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { emissions, loading, error, refresh };
}

/**
 * Get claimable SIGNAL rewards
 */
export function useClaimableRewards(userId: string) {
  const [rewards, setRewards] = useState<ClaimableReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await voidEmitterService.getClaimableRewards(userId);
      setRewards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const claimRewards = useCallback(async (rewardIds: string[]) => {
    try {
      const result = await voidEmitterService.claimRewards(userId, rewardIds);
      await refresh(); // Refresh after claim
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to claim rewards');
    }
  }, [userId, refresh]);

  return { rewards, loading, error, refresh, claimRewards };
}

// ============================================================================
// VOID VAULT HOOKS
// ============================================================================

/**
 * Get user's vault positions
 */
export function useVoidVault(userId: string) {
  const [positions, setPositions] = useState<VoidVaultPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await voidVaultService.getPositions(userId);
      setPositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { positions, loading, error, refresh };
}

/**
 * Get yield rates for all stakeable tokens
 */
export function useVaultYieldRates() {
  const [rates, setRates] = useState<VaultYieldRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidVaultService.getYieldRates();
      setRates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch yield rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rates, loading, error, refresh };
}

/**
 * Get reward pool balances
 */
export function useRewardPools() {
  const [pools, setPools] = useState<RewardPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidVaultService.getRewardPools();
      setPools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reward pools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pools, loading, error, refresh };
}

// ============================================================================
// VOID CREATOR ROUTER HOOKS
// ============================================================================

/**
 * Get creator royalties
 */
export function useCreatorRoyalties(creatorId: string) {
  const [royalties, setRoyalties] = useState<CreatorRoyalties | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!creatorId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await voidCreatorRouterService.getCreatorRoyalties(creatorId);
      setRoyalties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch royalties');
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const claimRoyalties = useCallback(async () => {
    try {
      const result = await voidCreatorRouterService.claimRoyalties(creatorId);
      await refresh(); // Refresh after claim
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to claim royalties');
    }
  }, [creatorId, refresh]);

  return { royalties, loading, error, refresh, claimRoyalties };
}

// ============================================================================
// VOID HOOK ROUTER HOOKS
// ============================================================================

/**
 * Get all configured hooks
 */
export function useVoidHooks() {
  const [hooks, setHooks] = useState<VoidHook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidHookRouterService.getHooks();
      setHooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { hooks, loading, error, refresh };
}

/**
 * Get current emission rates
 */
export function useEmissionRates() {
  const [rates, setRates] = useState<{
    voidBaseRate: number;
    signalBaseRate: number;
    activityIndex: number;
    liquidityIndex: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidHookRouterService.getEmissionRates();
      setRates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emission rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rates, loading, error, refresh };
}

// ============================================================================
// VOID TREASURY HOOKS
// ============================================================================

/**
 * Get treasury wallets
 */
export function useTreasuryWallets() {
  const [wallets, setWallets] = useState<TreasuryWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidTreasuryService.getTreasuryWallets();
      setWallets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch treasury wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { wallets, loading, error, refresh };
}

/**
 * Get current treasury snapshot
 */
export function useTreasurySnapshot() {
  const [snapshot, setSnapshot] = useState<TreasurySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidTreasuryService.getCurrentSnapshot();
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch treasury snapshot');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { snapshot, loading, error, refresh };
}

/**
 * Get pool health status
 */
export function usePoolHealth() {
  const [health, setHealth] = useState<Awaited<ReturnType<typeof voidTreasuryService.checkPoolHealth>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidTreasuryService.checkPoolHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pool health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Auto-refresh every 5 minutes
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { health, loading, error, refresh };
}

// ============================================================================
// VOID GOVERNANCE HOOKS
// ============================================================================

/**
 * Get all proposals
 */
export function useProposals(status?: GovernanceProposal['status']) {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidGovernanceService.getProposals(status);
      setProposals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { proposals, loading, error, refresh };
}

/**
 * Get user's voting power
 */
export function useVotingPower(userId: string) {
  const [votingPower, setVotingPower] = useState<VotingPower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await voidGovernanceService.calculateVotingPower(userId);
      setVotingPower(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch voting power');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { votingPower, loading, error, refresh };
}

/**
 * Get governance statistics
 */
export function useGovernanceStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof voidGovernanceService.getGovernanceStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voidGovernanceService.getGovernanceStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch governance stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}

/**
 * useEcosystemStats - Get VOID ecosystem metrics
 */
export function useEcosystemStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof analyticsService.getVoidEcosystemStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getVoidEcosystemStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ecosystem stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
