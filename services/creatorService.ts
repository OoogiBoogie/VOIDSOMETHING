/**
 * Creator Service
 * Handles creator registry, profiles, tokens, SKUs, and incubator
 * 
 * VOID ENGINE INTEGRATION:
 * - SKU mints processed through voidCreatorRouterService (40/20/20/20 split)
 * - CREATE token royalties tracked and claimable
 * - Creator actions award vXP + SIGNAL
 */

import { voidCreatorRouterService } from './voidCreatorRouterService';
import { voidEmitterService } from './voidEmitterService';
import { TokenSymbol } from './voidTypes';

export interface Creator {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  category: CreatorCategory;
  status: CreatorStatus;
  socials?: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  tokenAddress?: string;
  createdAt: Date;
  stats?: CreatorStats;
}

export type CreatorCategory = 'music' | 'art' | 'games' | 'dev' | 'agency' | 'infra';
export type CreatorStatus = 'new' | 'rising' | 'incubated' | 'partner';

export interface CreatorStats {
  tokenSupply: number;
  tokenPrice: number;
  volume24h: number;
  volume7d: number;
  holders: number;
  landOwned: number;
  skusSold: number;
}

export interface CreatorToken {
  address: string;
  symbol: string;
  name: string;
  supply: number;
  decimals: number;
  creatorId: string;
  poolAddress?: string;
  hookProfile?: HookProfile;
}

export type HookProfile = 'standard' | 'growth' | 'partner';

export interface SKU {
  id: string;
  creatorId: string;
  type: '1155' | 'erc20' | 'service';
  name: string;
  description: string;
  price: number;
  priceToken: string;
  supply?: number;
  sold: number;
  imageUrl?: string;
  worldUses?: string[];
}

export interface IncubatorApplication {
  id: string;
  creatorId: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'graduated';
  submittedAt: Date;
  reviewedAt?: Date;
  milestones: Milestone[];
  funding?: {
    requested: number;
    approved: number;
    token: string;
  };
  teamInfo: {
    size: number;
    experience: string;
  };
  productInfo: {
    description: string;
    mvpUrl?: string;
    roadmap: string;
  };
  metrics?: {
    userBase: number;
    volume: number;
    landUsage: number;
  };
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  reward?: number;
}

class CreatorService {
  private creators: Map<string, Creator> = new Map();
  private applications: Map<string, IncubatorApplication> = new Map();

  /**
   * Get all creators with filters
   */
  async getCreators(filters?: {
    category?: CreatorCategory;
    status?: CreatorStatus;
    chain?: string;
    search?: string;
  }): Promise<Creator[]> {
    // TODO: Replace with actual API call
    let creators = Array.from(this.creators.values());

    if (filters) {
      if (filters.category) {
        creators = creators.filter(c => c.category === filters.category);
      }
      if (filters.status) {
        creators = creators.filter(c => c.status === filters.status);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        creators = creators.filter(
          c =>
            c.username.toLowerCase().includes(query) ||
            c.bio?.toLowerCase().includes(query)
        );
      }
    }

    return creators;
  }

  /**
   * Get creator by ID
   */
  async getCreator(creatorId: string): Promise<Creator | null> {
    // TODO: Replace with actual API call
    return this.creators.get(creatorId) || null;
  }

  /**
   * Get creator token stats
   */
  async getCreatorTokenStats(creatorId: string): Promise<CreatorStats | null> {
    // TODO: Replace with actual API call from DeFi indexer
    const creator = await this.getCreator(creatorId);
    return creator?.stats || null;
  }

  /**
   * Get creator SKUs
   */
  async getCreatorSKUs(creatorId: string): Promise<SKU[]> {
    // TODO: Replace with actual API call
    return [];
  }

  /**
   * Deploy new token for creator
   */
  async deployToken(config: {
    name: string;
    symbol: string;
    supply: number;
    creatorId: string;
  }): Promise<CreatorToken> {
    // TODO: Replace with actual smart contract deployment
    const token: CreatorToken = {
      address: `0x${Math.random().toString(16).slice(2)}`,
      symbol: config.symbol,
      name: config.name,
      supply: config.supply,
      decimals: 18,
      creatorId: config.creatorId,
    };

    return token;
  }

  /**
   * Register BYOT (Bring Your Own Token)
   */
  async registerBYOT(config: {
    tokenAddress: string;
    chain: string;
    creatorId: string;
    bridgeConfig?: any;
  }): Promise<CreatorToken> {
    // TODO: Replace with actual API call to register external token
    const token: CreatorToken = {
      address: config.tokenAddress,
      symbol: 'BYOT',
      name: 'Brought Token',
      supply: 0,
      decimals: 18,
      creatorId: config.creatorId,
    };

    return token;
  }

  /**
   * Create SKUs
   * 
   * VOID ENGINE: SKU mints will be tracked through voidCreatorRouterService
   */
  async createSKUs(
    creatorId: string,
    skuDefinitions: Omit<SKU, 'id' | 'creatorId' | 'sold'>[]
  ): Promise<SKU[]> {
    // TODO: Replace with actual API call / contract interaction
    const skus: SKU[] = skuDefinitions.map(def => ({
      ...def,
      id: `sku-${Date.now()}-${Math.random()}`,
      creatorId,
      sold: 0,
    }));

    // Award vXP + SIGNAL for creating SKUs
    await voidEmitterService.recordAction(
      creatorId,
      'creator',
      'sku_create',
      { skuCount: skus.length }
    );

    return skus;
  }

  /**
   * Process SKU mint (called when user buys a SKU)
   * 
   * VOID ENGINE: Routes through voidCreatorRouterService for fee splits
   */
  async processSKUMint(
    creatorId: string,
    buyerId: string,
    skuId: string,
    price: number,
    priceToken: TokenSymbol = 'CREATE'
  ): Promise<{ success: boolean; txHash?: string }> {
    // Process mint through VOID Creator Router
    const mintEvent = await voidCreatorRouterService.processMint(
      creatorId,
      buyerId,
      skuId,
      price.toString(),
      priceToken as 'CREATE' | 'VOID'
    );

    // Award vXP + SIGNAL to buyer for minting
    await voidEmitterService.recordAction(
      buyerId,
      'creator',
      'sku_mint',
      { skuId, creatorId, price: price.toString() }
    );

    // Award vXP to creator for making a sale
    await voidEmitterService.recordAction(
      creatorId,
      'creator',
      'sku_sale',
      { skuId, buyerId, price: price.toString() }
    );

    return { success: true, txHash: mintEvent.txHash };
  }

  /**
   * Finalize creator launch
   * 
   * VOID ENGINE: Awards vXP + SIGNAL for launching
   */
  async finalizeLaunch(creatorId: string): Promise<Creator> {
    // TODO: Replace with actual API call
    const creator = await this.getCreator(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    creator.status = 'rising';

    // Award vXP + SIGNAL for launching
    await voidEmitterService.recordAction(
      creatorId,
      'creator',
      'creator_launch',
      { creatorId }
    );

    return creator;
  }

  /**
   * Submit incubator application
   */
  async submitIncubatorApplication(
    form: Omit<IncubatorApplication, 'id' | 'status' | 'submittedAt' | 'milestones'>
  ): Promise<IncubatorApplication> {
    // TODO: Replace with actual API call
    const application: IncubatorApplication = {
      ...form,
      id: `app-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date(),
      milestones: [],
    };

    this.applications.set(application.id, application);
    return application;
  }

  /**
   * Get incubator status for creator
   */
  async getIncubatorStatus(creatorId: string): Promise<IncubatorApplication | null> {
    // TODO: Replace with actual API call
    return (
      Array.from(this.applications.values()).find(
        app => app.creatorId === creatorId
      ) || null
    );
  }

  /**
   * Get all incubator applications (for DAO)
   */
  async getIncubatorApplications(filter?: {
    status?: IncubatorApplication['status'];
  }): Promise<IncubatorApplication[]> {
    // TODO: Replace with actual API call
    let apps = Array.from(this.applications.values());

    if (filter?.status) {
      apps = apps.filter(app => app.status === filter.status);
    }

    return apps;
  }

  /**
   * Mark milestone complete
   */
  async markMilestone(
    applicationId: string,
    milestoneId: string
  ): Promise<IncubatorApplication> {
    // TODO: Replace with actual API call
    const app = this.applications.get(applicationId);
    if (!app) {
      throw new Error('Application not found');
    }

    const milestone = app.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.completed = true;
      milestone.completedAt = new Date();
    }

    return app;
  }

  /**
   * Get incubator applications for voting
   */
  async getIncubatorApplicationsForVoting(): Promise<IncubatorApplication[]> {
    return this.getIncubatorApplications({ status: 'in-review' });
  }

  /**
   * Link creator to land
   */
  async linkLandToCreator(parcelId: string, creatorId: string): Promise<void> {
    // This delegates to landService
    const { landService } = await import('./landService');
    await landService.linkLandToCreator(parcelId, creatorId);
  }
}

// Export singleton instance
export const creatorService = new CreatorService();
