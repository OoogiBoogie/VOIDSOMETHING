/**
 * BYOT Service
 * Manages user inventory, world uses, and BYOT project integration
 * Phase 1: Returns mock data; Phase 2+: Connects to blockchain/API
 * 
 * VOID ENGINE INTEGRATION:
 * - Activating token perks/world uses awards vXP + SIGNAL via voidEmitterService
 * - Token usage tracked across 5 hubs (World, Creator, DeFi, Gov, AI)
 */

import {
  InventoryToken,
  WorldUse as WorldUseNew,
  BYOTProjectConfig,
} from './byotTypes';
import {
  MOCK_INVENTORY_TOKENS,
  MOCK_WORLD_USES,
  MOCK_BYOT_PROJECTS,
} from './byotMockData';
import { voidEmitterService } from './voidEmitterService';

// Legacy types (kept for backward compatibility)
export interface BYOTToken {
  address: string;
  chain: string;
  symbol: string;
  name: string;
  decimals: number;
  projectId?: string;
  creatorId?: string;
  bridgeConfig?: BridgeConfig;
  worldUses: WorldUse[];
}

export interface BridgeConfig {
  type: 'native' | 'wrapped' | 'oracle';
  wrapperAddress?: string;
  oracleAddress?: string;
  chainId: number;
}

export interface WorldUse {
  id: string;
  type: 'access' | 'cosmetic' | 'power-up' | 'business-tool';
  tokenAddress: string;
  tokenAmount: number; // Amount required (1 token = 1e18 if 18 decimals)
  capability: string;
  description: string;
  active: boolean;
}

export interface UserToken {
  tokenAddress: string;
  balance: number;
  tokenInfo: BYOTToken;
  worldUsesAvailable: WorldUse[];
}

class BYOTService {
  private registeredTokens: Map<string, BYOTToken> = new Map();
  private worldUses: Map<string, WorldUse[]> = new Map();

  /**
   * Get user's token balances (native + BYOT + 1155)
   */
  async getUserTokens(userId: string): Promise<UserToken[]> {
    // TODO: Replace with actual on-chain queries
    // Query wallet for ERC-20, ERC-1155 balances
    // Cross-reference with registered BYOT tokens

    return [];
  }

  /**
   * Get world uses for tokens
   */
  async getWorldUses(tokenAddresses: string[]): Promise<Map<string, WorldUse[]>> {
    // TODO: Replace with actual API call from BYOT registry DB
    const result = new Map<string, WorldUse[]>();

    for (const address of tokenAddresses) {
      const uses = this.worldUses.get(address.toLowerCase()) || [];
      result.set(address, uses);
    }

    return result;
  }

  /**
   * Register BYOT token
   */
  async registerBYOTToken(config: {
    address: string;
    chain: string;
    symbol: string;
    name: string;
    decimals: number;
    projectId?: string;
    bridgeConfig?: BridgeConfig;
  }): Promise<BYOTToken> {
    // TODO: Replace with actual API call + contract verification
    const token: BYOTToken = {
      ...config,
      worldUses: [],
    };

    this.registeredTokens.set(token.address.toLowerCase(), token);

    return token;
  }

  /**
   * Add world use mapping for token
   */
  async addWorldUse(
    tokenAddress: string,
    worldUse: Omit<WorldUse, 'id' | 'tokenAddress'>
  ): Promise<WorldUse> {
    // TODO: Replace with actual API call
    const use: WorldUse = {
      ...worldUse,
      id: `use-${Date.now()}`,
      tokenAddress: tokenAddress.toLowerCase(),
    };

    const existing = this.worldUses.get(tokenAddress.toLowerCase()) || [];
    existing.push(use);
    this.worldUses.set(tokenAddress.toLowerCase(), existing);

    return use;
  }

  /**
   * Check if user has token capability
   */
  async hasCapability(
    userId: string,
    capability: string
  ): Promise<boolean> {
    // TODO: Replace with actual on-chain + DB check
    const userTokens = await this.getUserTokens(userId);

    for (const userToken of userTokens) {
      for (const use of userToken.worldUsesAvailable) {
        if (use.capability === capability && use.active) {
          // Check if user has enough tokens
          if (userToken.balance >= use.tokenAmount) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Activate token perk in world
   * 
   * VOID ENGINE: Awards vXP + SIGNAL based on perk type
   */
  async activateTokenPerk(
    tokenAddress: string,
    perkId: string,
    userId: string
  ): Promise<{ success: boolean; duration?: number }> {
    // TODO: Replace with actual world state update
    // Check balance, deduct if consumable, activate effect

    // Award vXP + SIGNAL for using token perk
    await voidEmitterService.recordAction(
      userId,
      'world',
      'token_perk_used',
      { tokenAddress, perkId }
    );

    return { success: true, duration: 3600 }; // 1 hour example
  }

  /**
   * Get available cosmetics from tokens
   */
  async getAvailableCosmetics(userId: string): Promise<WorldUse[]> {
    const userTokens = await this.getUserTokens(userId);
    const cosmetics: WorldUse[] = [];

    for (const userToken of userTokens) {
      const tokenCosmetics = userToken.worldUsesAvailable.filter(
        use => use.type === 'cosmetic' && use.active
      );
      cosmetics.push(...tokenCosmetics);
    }

    return cosmetics;
  }

  /**
   * Get available access passes from tokens
   */
  async getAvailableAccess(userId: string): Promise<WorldUse[]> {
    const userTokens = await this.getUserTokens(userId);
    const access: WorldUse[] = [];

    for (const userToken of userTokens) {
      const tokenAccess = userToken.worldUsesAvailable.filter(
        use => use.type === 'access' && use.active
      );
      access.push(...tokenAccess);
    }

    return access;
  }

  /**
   * Verify token ownership on-chain
   */
  async verifyTokenOwnership(
    userId: string,
    tokenAddress: string,
    requiredAmount: number
  ): Promise<boolean> {
    // TODO: Replace with actual on-chain query
    // const provider = new ethers.providers.JsonRpcProvider(...);
    // const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    // const balance = await contract.balanceOf(userWallet);
    // return balance.gte(requiredAmount);

    return true; // Mock
  }

  /**
   * Get BYOT registry (all registered external tokens)
   */
  async getBYOTRegistry(filters?: {
    chain?: string;
    projectId?: string;
  }): Promise<BYOTToken[]> {
    // TODO: Replace with actual API call
    let tokens = Array.from(this.registeredTokens.values());

    if (filters) {
      if (filters.chain) {
        tokens = tokens.filter(t => t.chain === filters.chain);
      }
      if (filters.projectId) {
        tokens = tokens.filter(t => t.projectId === filters.projectId);
      }
    }

    return tokens;
  }

  // ========== NEW PHASE 1 INVENTORY METHODS ==========

  /**
   * Get user's inventory (tokens + items they hold)
   * Phase 1: Returns mock data
   * Later: Query wallet balances + BYOT registry
   */
  async getUserInventory(userId: string): Promise<InventoryToken[]> {
    console.log('[byotService] getUserInventory mock for userId:', userId);
    return Promise.resolve(MOCK_INVENTORY_TOKENS);
  }

  /**
   * Get world uses for specific tokens (new format)
   * @param tokenIds - Array of InventoryToken.id values
   */
  async getWorldUsesForTokens(tokenIds: string[]): Promise<WorldUseNew[]> {
    return Promise.resolve(
      MOCK_WORLD_USES.filter((use) => tokenIds.includes(use.tokenId))
    );
  }

  /**
   * Get all registered BYOT projects
   */
  async getBYOTProjects(): Promise<BYOTProjectConfig[]> {
    return Promise.resolve(MOCK_BYOT_PROJECTS);
  }

  /**
   * Register a new BYOT project (admin/creator action)
   * Phase 1: Stub
   */
  async registerBYOTProject(config: BYOTProjectConfig): Promise<void> {
    console.warn('[byotService] registerBYOTProject is mocked in Phase 1.', config);
    return Promise.resolve();
  }

  /**
   * Link token to world uses (admin/creator action)
   * Phase 1: Stub
   */
  async linkTokenToWorldUses(
    tokenId: string,
    worldUseIds: string[],
  ): Promise<void> {
    console.warn('[byotService] linkTokenToWorldUses is mocked in Phase 1.', {
      tokenId,
      worldUseIds,
    });
    return Promise.resolve();
  }
}

// Export singleton instance
export const byotService = new BYOTService();
