/**
 * VOID Hook Router Service
 * 
 * Central router for all fees, swaps, and emissions in the VOID ecosystem.
 * Routes transactions through v4 hooks with configurable fee splits.
 * 
 * Key Functions:
 * - Route swap fees to Emitter/Vault/Creator/Treasury
 * - Manage emission rates for VOID and SIGNAL
 * - Execute trades with automatic fee collection
 * - Coordinate between all VOID Engine modules
 * 
 * This is the "brain" that EmissionAI (Phase 5) will adjust.
 */

import {
  VoidHook,
  VoidHookSplit,
  TokenSymbol,
} from './voidTypes';
import { voidEmitterService } from './voidEmitterService';
import { voidVaultService } from './voidVaultService';
import { voidCreatorRouterService } from './voidCreatorRouterService';

// ============================================================================
// MOCK DATA
// ============================================================================

// Default hook configurations
const DEFAULT_HOOKS: VoidHook[] = [
  {
    id: 'swap-hook-standard',
    type: 'swap',
    fromToken: 'VOID',
    toToken: 'PSX',
    feeBps: 20, // 0.20%
    split: {
      voidEmitterPct: 20,      // 20% to SIGNAL emissions
      voidVaultPct: 30,        // 30% to staking yields
      creatorRouterPct: 0,     // 0% (no creator on swaps)
      psxTreasuryPct: 30,      // 30% to PSX DAO
      createDaoPct: 10,        // 10% to CREATE DAO
      reservePct: 10,          // 10% to reserve
    },
  },
  {
    id: 'mint-hook-creator',
    type: 'mint',
    fromToken: 'CREATE',
    feeBps: 500, // 5% mint fee
    split: {
      voidEmitterPct: 20,      // 20% to SIGNAL emissions
      voidVaultPct: 20,        // 20% to vault yields
      creatorRouterPct: 40,    // 40% to creator
      psxTreasuryPct: 20,      // 20% to PSX treasury
      createDaoPct: 0,         // 0% (already using CREATE)
      reservePct: 0,           // 0%
    },
  },
  {
    id: 'stake-hook',
    type: 'stake',
    fromToken: 'VOID',
    feeBps: 0, // No fee on staking
    split: {
      voidEmitterPct: 0,
      voidVaultPct: 100,       // 100% to vault (no fee, just routing)
      creatorRouterPct: 0,
      psxTreasuryPct: 0,
      createDaoPct: 0,
      reservePct: 0,
    },
  },
];

const MOCK_HOOKS: Map<string, VoidHook> = new Map(
  DEFAULT_HOOKS.map((h) => [h.id, h])
);

// Emission rates (adjusted by EmissionAI in Phase 5)
let emissionRates = {
  voidBaseRate: 1.0,         // VOID emission multiplier
  signalBaseRate: 1.0,       // SIGNAL emission multiplier
  activityIndex: 1.0,        // Activity multiplier (tx volume, users)
  liquidityIndex: 1.0,       // Liquidity multiplier (TVL, DEX volume)
};

// ============================================================================
// SERVICE
// ============================================================================

class VoidHookRouterService {
  /**
   * Execute a swap with fee routing
   */
  async executeSwap(
    userId: string,
    fromToken: TokenSymbol,
    toToken: TokenSymbol,
    amountIn: string,
    slippageBps: number = 50 // 0.5% default slippage
  ): Promise<{
    amountOut: string;
    fee: string;
    feeDistribution: Record<string, string>;
    txHash: string;
  }> {
    // Get hook for this swap pair
    const hook = this.getHookForSwap(fromToken, toToken);
    if (!hook) {
      throw new Error(`No hook configured for ${fromToken} → ${toToken}`);
    }

    // Calculate fee
    const amountInNum = parseFloat(amountIn);
    const feeAmount = amountInNum * (hook.feeBps / 10000);
    const amountAfterFee = amountInNum - feeAmount;

    // TODO: Get actual price from DEX
    // For now, mock exchange rate
    const mockRate = this.getMockExchangeRate(fromToken, toToken);
    const amountOut = (amountAfterFee * mockRate).toFixed(6);

    // Distribute fees
    const feeDistribution = await this.distributeFees(feeAmount.toFixed(6), fromToken, hook.split, userId);

    // TODO: Replace with actual blockchain transaction
    return {
      amountOut,
      fee: feeAmount.toFixed(6),
      feeDistribution,
      txHash: '0xMOCK_SWAP_TX',
    };
  }

  /**
   * Distribute fees according to hook split
   */
  private async distributeFees(
    totalFee: string,
    token: TokenSymbol,
    split: VoidHookSplit,
    userId: string
  ): Promise<Record<string, string>> {
    const feeNum = parseFloat(totalFee);
    const distribution: Record<string, string> = {};

    // Emitter share → award SIGNAL to user
    if (split.voidEmitterPct > 0) {
      const emitterShare = (feeNum * split.voidEmitterPct / 100).toFixed(6);
      distribution.emitter = emitterShare;

      // Award SIGNAL based on fee amount
      const signalAmount = parseFloat(emitterShare) * 10; // 1 fee unit = 10 SIGNAL
      await voidEmitterService.recordAction(userId, 'defi', 'swap', {
        feeAmount: emitterShare,
        signalAwarded: signalAmount,
      });
    }

    // Vault share → add to reward pool
    if (split.voidVaultPct > 0) {
      const vaultShare = (feeNum * split.voidVaultPct / 100).toFixed(6);
      distribution.vault = vaultShare;
      // TODO: Add to VoidVault reward pool
    }

    // Creator share (if applicable)
    if (split.creatorRouterPct > 0) {
      const creatorShare = (feeNum * split.creatorRouterPct / 100).toFixed(6);
      distribution.creator = creatorShare;
      // TODO: Route to VoidCreatorRouter
    }

    // PSX Treasury
    if (split.psxTreasuryPct > 0) {
      const psxShare = (feeNum * split.psxTreasuryPct / 100).toFixed(6);
      distribution.psxTreasury = psxShare;
      // TODO: Send to PSX treasury wallet
    }

    // CREATE DAO
    if (split.createDaoPct > 0) {
      const createShare = (feeNum * split.createDaoPct / 100).toFixed(6);
      distribution.createDao = createShare;
      // TODO: Send to CREATE DAO wallet
    }

    // Reserve
    if (split.reservePct > 0) {
      const reserveShare = (feeNum * split.reservePct / 100).toFixed(6);
      distribution.reserve = reserveShare;
      // TODO: Send to reserve wallet
    }

    return distribution;
  }

  /**
   * Get hook for a swap pair
   */
  private getHookForSwap(fromToken: TokenSymbol, toToken: TokenSymbol): VoidHook | null {
    // Find matching swap hook
    for (const hook of MOCK_HOOKS.values()) {
      if (hook.type === 'swap') {
        // Simple match for now; could be more sophisticated
        return hook;
      }
    }
    return null;
  }

  /**
   * Get all configured hooks
   */
  async getHooks(): Promise<VoidHook[]> {
    return Array.from(MOCK_HOOKS.values());
  }

  /**
   * Get a specific hook by ID
   */
  async getHook(hookId: string): Promise<VoidHook | null> {
    return MOCK_HOOKS.get(hookId) || null;
  }

  /**
   * Create or update a hook (DAO-controlled)
   */
  async setHook(hook: VoidHook): Promise<{ success: boolean; hookId: string }> {
    // Validate split percentages sum to 100
    const totalPct =
      hook.split.voidEmitterPct +
      hook.split.voidVaultPct +
      hook.split.creatorRouterPct +
      hook.split.psxTreasuryPct +
      hook.split.createDaoPct +
      hook.split.reservePct;

    if (totalPct !== 100) {
      throw new Error(`Hook split percentages must sum to 100, got ${totalPct}`);
    }

    MOCK_HOOKS.set(hook.id, hook);

    // TODO: Replace with actual on-chain transaction (DAO proposal required)
    return {
      success: true,
      hookId: hook.id,
    };
  }

  /**
   * Get current emission rates (read by EmissionAI)
   */
  async getEmissionRates(): Promise<typeof emissionRates> {
    return { ...emissionRates };
  }

  /**
   * Update emission rates (called by EmissionAI via DAO proposal)
   */
  async setEmissionRates(newRates: Partial<typeof emissionRates>): Promise<{
    success: boolean;
    previousRates: typeof emissionRates;
    newRates: typeof emissionRates;
  }> {
    const previousRates = { ...emissionRates };

    // Update rates
    emissionRates = {
      ...emissionRates,
      ...newRates,
    };

    // Validate bounds (safety checks)
    if (emissionRates.voidBaseRate < 0.2 || emissionRates.voidBaseRate > 3.0) {
      throw new Error('voidBaseRate must be between 0.2 and 3.0');
    }
    if (emissionRates.signalBaseRate < 0.2 || emissionRates.signalBaseRate > 3.0) {
      throw new Error('signalBaseRate must be between 0.2 and 3.0');
    }

    // TODO: Replace with actual on-chain PolicyManager.setPolicy() call
    return {
      success: true,
      previousRates,
      newRates: { ...emissionRates },
    };
  }

  /**
   * Calculate dynamic emission rate (used by EmissionAI)
   * Formula: baseRate * (activityIndex / liquidityIndex)
   */
  async calculateDynamicEmissionRate(token: 'VOID' | 'SIGNAL'): Promise<number> {
    const baseRate = token === 'VOID' ? emissionRates.voidBaseRate : emissionRates.signalBaseRate;
    const dynamicRate = baseRate * (emissionRates.activityIndex / emissionRates.liquidityIndex);

    // Clamp to safe bounds
    return Math.max(0.2, Math.min(3.0, dynamicRate));
  }

  /**
   * Update activity and liquidity indices (called by EmissionAI)
   */
  async updateIndices(
    activityIndex: number,
    liquidityIndex: number
  ): Promise<void> {
    emissionRates.activityIndex = activityIndex;
    emissionRates.liquidityIndex = liquidityIndex;

    // TODO: Store on-chain via EmissionOracle.sol
  }

  /**
   * Get swap statistics
   */
  async getSwapStats(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalSwaps: number;
    totalVolume: number;
    totalFees: number;
    feeDistribution: {
      emitter: number;
      vault: number;
      psxTreasury: number;
      createDao: number;
      reserve: number;
    };
  }> {
    // TODO: Implement actual swap tracking
    // For now, return mock data
    return {
      totalSwaps: 1234,
      totalVolume: 567890,
      totalFees: 1136, // ~0.20% of volume
      feeDistribution: {
        emitter: 227,     // 20%
        vault: 341,       // 30%
        psxTreasury: 341, // 30%
        createDao: 114,   // 10%
        reserve: 114,     // 10%
      },
    };
  }

  /**
   * Helper: Mock exchange rate (TODO: replace with actual DEX oracle)
   */
  private getMockExchangeRate(fromToken: TokenSymbol, toToken: TokenSymbol): number {
    const rates: Record<string, Record<string, number>> = {
      VOID: { PSX: 0.1, CREATE: 0.2, SIGNAL: 10 },
      PSX: { VOID: 10, CREATE: 2, SIGNAL: 100 },
      CREATE: { VOID: 5, PSX: 0.5, SIGNAL: 50 },
      SIGNAL: { VOID: 0.1, PSX: 0.01, CREATE: 0.02 },
    };

    return rates[fromToken]?.[toToken] || 1.0;
  }
}

// Singleton export
export const voidHookRouterService = new VoidHookRouterService();
