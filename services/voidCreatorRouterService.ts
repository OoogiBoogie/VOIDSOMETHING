/**
 * VOID Creator Router Service
 * 
 * Manages creator economy:
 * - NFT mints and SKU purchases
 * - Royalty distribution
 * - Fee splits (40% creator, 20% emitter, 20% vault, 20% treasury)
 * 
 * All transactions use CREATE tokens (fixed ERC-20, distributed from treasury)
 */

import {
  CreatorMintEvent,
  CreatorFeeSplit,
  CreatorRoyalties,
  TokenSymbol,
} from './voidTypes';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_MINTS: CreatorMintEvent[] = [];
const MOCK_ROYALTIES: Map<string, CreatorRoyalties> = new Map();

// Fee split percentages
const FEE_SPLIT = {
  creator: 0.40,          // 40% to creator
  voidEmitter: 0.20,      // 20% to SIGNAL emissions
  voidVault: 0.20,        // 20% to vault yields
  psxTreasury: 0.20,      // 20% to PSX DAO treasury
};

// ============================================================================
// SERVICE
// ============================================================================

class VoidCreatorRouterService {
  /**
   * Process a creator mint/purchase
   */
  async processMint(
    creatorId: string,
    buyerId: string,
    skuId: string,
    price: string,
    priceToken: 'CREATE' | 'VOID' = 'CREATE'
  ): Promise<CreatorMintEvent> {
    const priceNum = parseFloat(price);

    // Calculate fee split
    const feeSplit: CreatorFeeSplit = {
      totalFee: price,
      creatorShare: (priceNum * FEE_SPLIT.creator).toFixed(4),
      voidEmitterShare: (priceNum * FEE_SPLIT.voidEmitter).toFixed(4),
      voidVaultShare: (priceNum * FEE_SPLIT.voidVault).toFixed(4),
      psxTreasuryShare: (priceNum * FEE_SPLIT.psxTreasury).toFixed(4),
    };

    // Create mint event
    const mintEvent: CreatorMintEvent = {
      id: `mint-${Date.now()}-${Math.random()}`,
      creatorId,
      buyerId,
      skuId,
      price,
      priceToken,
      feeSplit,
      nftContractAddress: '0xMOCK_ERC1155_CONTRACT',
      nftTokenId: `${skuId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      txHash: '0xMOCK_MINT_TX',
    };

    MOCK_MINTS.push(mintEvent);

    // Update creator royalties
    await this.updateCreatorRoyalties(creatorId, feeSplit.creatorShare);

    // TODO: Trigger voidEmitterService to award SIGNAL to buyer
    // TODO: Add to voidVaultService reward pools
    // TODO: Transfer to PSX treasury

    return mintEvent;
  }

  /**
   * Update creator's royalty balance
   */
  private async updateCreatorRoyalties(
    creatorId: string,
    amount: string
  ): Promise<void> {
    let royalties = MOCK_ROYALTIES.get(creatorId);

    if (!royalties) {
      royalties = {
        creatorId,
        totalEarned: '0',
        claimable: '0',
        claimed: '0',
      };
    }

    const totalEarned = parseFloat(royalties.totalEarned) + parseFloat(amount);
    const claimable = parseFloat(royalties.claimable) + parseFloat(amount);

    royalties.totalEarned = totalEarned.toFixed(4);
    royalties.claimable = claimable.toFixed(4);

    MOCK_ROYALTIES.set(creatorId, royalties);
  }

  /**
   * Get creator's royalty information
   */
  async getCreatorRoyalties(creatorId: string): Promise<CreatorRoyalties> {
    const royalties = MOCK_ROYALTIES.get(creatorId);

    if (!royalties) {
      return {
        creatorId,
        totalEarned: '0',
        claimable: '0',
        claimed: '0',
      };
    }

    return royalties;
  }

  /**
   * Claim creator royalties
   */
  async claimRoyalties(creatorId: string): Promise<{
    amount: string;
    token: TokenSymbol;
    txHash: string;
  }> {
    const royalties = MOCK_ROYALTIES.get(creatorId);

    if (!royalties || parseFloat(royalties.claimable) === 0) {
      throw new Error('No claimable royalties');
    }

    const amount = royalties.claimable;

    // Update royalties
    royalties.claimable = '0';
    royalties.claimed = (parseFloat(royalties.claimed) + parseFloat(amount)).toFixed(4);
    royalties.lastClaim = new Date().toISOString();

    MOCK_ROYALTIES.set(creatorId, royalties);

    // TODO: Replace with actual blockchain transaction (CREATE transfer)
    return {
      amount,
      token: 'CREATE',
      txHash: '0xMOCK_CLAIM_ROYALTIES_TX',
    };
  }

  /**
   * Get mint history for a creator
   */
  async getCreatorMints(
    creatorId: string,
    limit: number = 50
  ): Promise<CreatorMintEvent[]> {
    return MOCK_MINTS
      .filter((m) => m.creatorId === creatorId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get purchase history for a buyer
   */
  async getBuyerPurchases(
    buyerId: string,
    limit: number = 50
  ): Promise<CreatorMintEvent[]> {
    return MOCK_MINTS
      .filter((m) => m.buyerId === buyerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get mint statistics
   */
  async getMintStats(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalMints: number;
    totalVolume: number;
    totalCreatorEarnings: number;
    totalEmitterShare: number;
    totalVaultShare: number;
    totalTreasuryShare: number;
    topCreators: {
      creatorId: string;
      mints: number;
      volume: number;
      earnings: number;
    }[];
  }> {
    const now = Date.now();
    const timeMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeframe];

    const recentMints = MOCK_MINTS.filter(
      (m) => now - new Date(m.timestamp).getTime() < timeMs
    );

    let totalVolume = 0;
    let totalCreatorEarnings = 0;
    let totalEmitterShare = 0;
    let totalVaultShare = 0;
    let totalTreasuryShare = 0;

    const creatorStats: Map<string, { mints: number; volume: number; earnings: number }> = new Map();

    for (const mint of recentMints) {
      const price = parseFloat(mint.price);
      totalVolume += price;
      totalCreatorEarnings += parseFloat(mint.feeSplit.creatorShare);
      totalEmitterShare += parseFloat(mint.feeSplit.voidEmitterShare);
      totalVaultShare += parseFloat(mint.feeSplit.voidVaultShare);
      totalTreasuryShare += parseFloat(mint.feeSplit.psxTreasuryShare);

      const stats = creatorStats.get(mint.creatorId) || { mints: 0, volume: 0, earnings: 0 };
      stats.mints += 1;
      stats.volume += price;
      stats.earnings += parseFloat(mint.feeSplit.creatorShare);
      creatorStats.set(mint.creatorId, stats);
    }

    const topCreators = Array.from(creatorStats.entries())
      .map(([creatorId, stats]) => ({ creatorId, ...stats }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    return {
      totalMints: recentMints.length,
      totalVolume,
      totalCreatorEarnings,
      totalEmitterShare,
      totalVaultShare,
      totalTreasuryShare,
      topCreators,
    };
  }

  /**
   * Get all creators with royalties
   */
  async getAllCreatorRoyalties(): Promise<CreatorRoyalties[]> {
    return Array.from(MOCK_ROYALTIES.values())
      .sort((a, b) => parseFloat(b.totalEarned) - parseFloat(a.totalEarned));
  }
}

// Singleton export
export const voidCreatorRouterService = new VoidCreatorRouterService();
