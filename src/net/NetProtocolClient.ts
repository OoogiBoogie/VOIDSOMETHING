/**
 * NET PROTOCOL CLIENT - V4.7 Production
 * 
 * Production client for NetProtocolProfiles contract.
 * Replaces localStorage stub with real on-chain calls via viem/wagmi.
 * 
 * CRITICAL: This is the production implementation that writes to Base blockchain.
 */

'use client';

import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import type { NetProfileCore, NetProfileUpdate } from './types';
import { NET_PROTOCOL_PROFILES_ABI } from './types';

// ================================
// CONFIGURATION
// ================================

/**
 * Net Protocol Profiles contract address
 * TODO: Update with deployed contract address on Base Sepolia / Base Mainnet
 */
const NET_PROTOCOL_ADDRESS = (process.env.NEXT_PUBLIC_NET_PROTOCOL_ADDRESS as `0x${string}`) || 
  '0x0000000000000000000000000000000000000000' as `0x${string}`;

// Log warning if contract not configured
if (NET_PROTOCOL_ADDRESS === '0x0000000000000000000000000000000000000000') {
  console.warn('[NetProtocol] Contract address not configured. Set NEXT_PUBLIC_NET_PROTOCOL_ADDRESS');
}

// ================================
// CLIENT CLASS
// ================================

class NetProtocolClient {
  private cache: Map<string, NetProfileCore> = new Map();
  
  /**
   * Get wagmi config (lazy loaded)
   */
  private async getWagmiConfig() {
    const { wagmiConfig } = await import('../../lib/wagmiConfig');
    if (!wagmiConfig) {
      throw new Error('Wagmi config not initialized');
    }
    return wagmiConfig;
  }
  
  /**
   * Get profile from on-chain Net Protocol contract
   */
  async getProfile(wallet: `0x${string}`): Promise<NetProfileCore | null> {
    console.log(`[NetProtocol] Fetching on-chain profile for ${wallet}`);
    
    // Check cache first
    const cached = this.cache.get(wallet.toLowerCase());
    if (cached) {
      console.log(`[NetProtocol] Cache hit for ${wallet}`);
      return cached;
    }
    
    try {
      const config = await this.getWagmiConfig();
      
      // Read from contract
      const raw = await readContract(config, {
        address: NET_PROTOCOL_ADDRESS,
        abi: NET_PROTOCOL_PROFILES_ABI,
        functionName: 'getProfile',
        args: [wallet],
      });
      
      // Check if profile exists (createdAt === 0 means no profile)
      const createdAt = Number(raw.createdAt);
      if (createdAt === 0) {
        console.log(`[NetProtocol] No profile found for ${wallet}`);
        return null;
      }
      
      // Parse and normalize
      const profile: NetProfileCore = {
        wallet,
        createdAt,
        updatedAt: Number(raw.updatedAt),
        zoneX: Number(raw.zoneX),
        zoneY: Number(raw.zoneY),
        posX: Number(raw.posX),
        posY: Number(raw.posY),
        posZ: Number(raw.posZ),
        sceneId: Number(raw.sceneId),
        level: Number(raw.level),
        xp: BigInt(raw.xp),
        dataHash: raw.dataHash && raw.dataHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
          ? (raw.dataHash as `0x${string}`)
          : undefined,
      };
      
      // Cache it
      this.cache.set(wallet.toLowerCase(), profile);
      
      console.log(`[NetProtocol] Loaded profile from chain:`, profile);
      return profile;
      
    } catch (error) {
      console.error(`[NetProtocol] Error fetching profile:`, error);
      
      // Fallback to localStorage for development/testing
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn(`[NetProtocol] Falling back to localStorage (dev mode)`);
        const stored = localStorage.getItem(`net:profile:${wallet.toLowerCase()}`);
        if (stored) {
          try {
            const profile = JSON.parse(stored) as NetProfileCore;
            // Convert xp string back to bigint
            profile.xp = BigInt(profile.xp);
            this.cache.set(wallet.toLowerCase(), profile);
            return profile;
          } catch (parseError) {
            console.error(`[NetProtocol] Error parsing localStorage:`, parseError);
          }
        }
      }
      
      return null;
    }
  }
  
  /**
   * Create or update profile on-chain
   */
  async upsertProfile(
    wallet: `0x${string}`,
    partial: Partial<NetProfileCore>
  ): Promise<void> {
    console.log(`[NetProtocol] Upserting profile for ${wallet}`, partial);
    
    try {
      const config = await this.getWagmiConfig();
      
      // Get existing profile or create default
      let existing = await this.getProfile(wallet);
      
      if (!existing) {
        // Create default profile
        existing = {
          wallet,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
          zoneX: 0,
          zoneY: 0,
          posX: 0,
          posY: 1,
          posZ: 5,
          sceneId: 0, // 0 = main hub
          level: 1,
          xp: 0n,
        };
      }
      
      // Merge with partial update
      const merged: NetProfileCore = {
        ...existing,
        ...partial,
        wallet, // Ensure wallet stays correct
        updatedAt: Math.floor(Date.now() / 1000), // Always update timestamp
      };
      
      // Write to contract
      const hash = await writeContract(config, {
        address: NET_PROTOCOL_ADDRESS,
        abi: NET_PROTOCOL_PROFILES_ABI,
        functionName: 'upsertProfile',
        args: [{
          createdAt: BigInt(merged.createdAt),
          updatedAt: BigInt(merged.updatedAt),
          zoneX: merged.zoneX,
          zoneY: merged.zoneY,
          posX: merged.posX,
          posY: merged.posY,
          posZ: merged.posZ,
          sceneId: merged.sceneId,
          level: merged.level,
          xp: merged.xp,
          dataHash: merged.dataHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        }],
      });
      
      console.log(`[NetProtocol] Transaction submitted: ${hash}`);
      
      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(config, { hash });
      
      console.log(`[NetProtocol] Profile updated on-chain. Block: ${receipt.blockNumber}`);
      
      // Update cache
      this.cache.set(wallet.toLowerCase(), merged);
      
      // Also save to localStorage as backup (dev mode)
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        const toStore = { ...merged, xp: merged.xp.toString() };
        localStorage.setItem(`net:profile:${wallet.toLowerCase()}`, JSON.stringify(toStore));
      }
      
    } catch (error) {
      console.error(`[NetProtocol] Error upserting profile:`, error);
      
      // Fallback to localStorage in dev mode
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn(`[NetProtocol] Falling back to localStorage (dev mode)`);
        
        let existing = this.cache.get(wallet.toLowerCase());
        if (!existing) {
          const stored = localStorage.getItem(`net:profile:${wallet.toLowerCase()}`);
          if (stored) {
            existing = JSON.parse(stored);
            if (existing) existing.xp = BigInt(existing.xp);
          }
        }
        
        if (!existing) {
          existing = {
            wallet,
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000),
            zoneX: 0,
            zoneY: 0,
            posX: 0,
            posY: 1,
            posZ: 5,
            sceneId: 0,
            level: 1,
            xp: 0n,
          };
        }
        
        const merged = {
          ...existing,
          ...partial,
          wallet,
          updatedAt: Math.floor(Date.now() / 1000),
        };
        
        this.cache.set(wallet.toLowerCase(), merged);
        const toStore = { ...merged, xp: merged.xp.toString() };
        localStorage.setItem(`net:profile:${wallet.toLowerCase()}`, JSON.stringify(toStore));
        
        console.log(`[NetProtocol] Profile saved to localStorage`);
        return;
      }
      
      throw error;
    }
  }
  
  /**
   * Clear cache (useful for logout/testing)
   */
  clearCache() {
    this.cache.clear();
    console.log(`[NetProtocol] Cache cleared`);
  }
}

// ================================
// SINGLETON
// ================================

export const netProtocolClient = new NetProtocolClient();

// ================================
// CONVENIENCE FUNCTIONS
// ================================

/**
 * Get profile for a wallet
 */
export async function getNetProfile(wallet: `0x${string}`): Promise<NetProfileCore | null> {
  return await netProtocolClient.getProfile(wallet);
}

/**
 * Update profile for a wallet
 */
export async function upsertNetProfile(
  wallet: `0x${string}`,
  partial: Partial<NetProfileCore>
): Promise<void> {
  await netProtocolClient.upsertProfile(wallet, partial);
}

/**
 * Create default profile
 */
export function createDefaultProfile(wallet: `0x${string}`): NetProfileCore {
  return {
    wallet,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
    zoneX: 0,
    zoneY: 0,
    posX: 0,
    posY: 1,
    posZ: 5,
    sceneId: 0, // Main hub
    level: 1,
    xp: 0n,
  };
}
