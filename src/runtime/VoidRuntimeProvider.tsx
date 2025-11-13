/**
 * VOID RUNTIME PROVIDER - V4.7
 * 
 * Aggregates all runtime state for the Void metaverse:
 * - Wallet connection (Privy + Wagmi)
 * - Net Protocol profile (on-chain identity + position)
 * - XP/Tier system (VoidScore contract)
 * - Land ownership summary (optional)
 * 
 * This is the single source of truth for HUD components and MiniApps.
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { getNetProfile, upsertNetProfile } from '../net/NetProtocolClient';
import type { NetProfileCore } from '../net/types';

// ================================
// TYPES
// ================================

export interface VoidRuntimeState {
  // Wallet
  wallet: `0x${string}` | null;
  chainId: number | null;
  isConnected: boolean;
  isReady: boolean; // Privy + wallet both ready
  
  // Net Protocol Profile
  netProfile: NetProfileCore | null;
  isLoadingProfile: boolean;
  
  // XP / Tier (from VoidScore contract)
  xp: number;
  level: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER';
  
  // Land ownership (optional - can be expanded later)
  ownedLandCount: number;
  
  // Actions
  refreshProfile: () => Promise<void>;
  updatePosition: (x: number, y: number, z: number) => Promise<void>;
  updateZone: (zoneX: number, zoneY: number) => Promise<void>;
  updateXP: (newXP: bigint) => Promise<void>;
}

const VoidRuntimeContext = createContext<VoidRuntimeState | null>(null);

// ================================
// PROVIDER
// ================================

export function VoidRuntimeProvider({ children }: { children: React.ReactNode }) {
  const { address, chainId, isConnected: walletConnected } = useAccount();
  const { ready: privyReady, authenticated } = usePrivy();
  
  const [netProfile, setNetProfile] = useState<NetProfileCore | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Derived state
  const isReady = privyReady && authenticated && walletConnected;
  const wallet = address || null;
  
  // XP/Tier from profile (fallback to defaults)
  const xp = netProfile ? Number(netProfile.xp) : 0;
  const level = netProfile?.level || 1;
  const tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER' = 
    level >= 10 ? 'S_TIER' :
    level >= 7 ? 'GOLD' :
    level >= 4 ? 'SILVER' :
    'BRONZE';
  
  // Land ownership (placeholder - expand later if needed)
  const ownedLandCount = 0;
  
  // ================================
  // LOAD PROFILE ON WALLET CONNECT
  // ================================
  
  useEffect(() => {
    if (!isReady || !wallet) {
      setNetProfile(null);
      return;
    }
    
    async function loadProfile() {
      setIsLoadingProfile(true);
      console.log(`[VoidRuntime] Loading profile for ${wallet}`);
      
      try {
        const profile = await getNetProfile(wallet as `0x${string}`);
        
        if (profile) {
          console.log(`[VoidRuntime] Profile loaded:`, profile);
          setNetProfile(profile);
        } else {
          console.log(`[VoidRuntime] No profile found, will create on first move`);
          setNetProfile(null);
        }
      } catch (error) {
        console.error(`[VoidRuntime] Error loading profile:`, error);
        setNetProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    
    loadProfile();
  }, [isReady, wallet]);
  
  // ================================
  // ACTIONS
  // ================================
  
  const refreshProfile = async () => {
    if (!wallet) return;
    
    setIsLoadingProfile(true);
    try {
      const profile = await getNetProfile(wallet as `0x${string}`);
      setNetProfile(profile);
    } catch (error) {
      console.error(`[VoidRuntime] Error refreshing profile:`, error);
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const updatePosition = async (x: number, y: number, z: number) => {
    if (!wallet) return;
    
    console.log(`[VoidRuntime] Updating position: (${x}, ${y}, ${z})`);
    
    try {
      await upsertNetProfile(wallet as `0x${string}`, {
        posX: x,
        posY: y,
        posZ: z,
      });
      
      // Update local state
      if (netProfile) {
        setNetProfile({
          ...netProfile,
          posX: x,
          posY: y,
          posZ: z,
          updatedAt: Math.floor(Date.now() / 1000),
        });
      }
    } catch (error) {
      console.error(`[VoidRuntime] Error updating position:`, error);
    }
  };
  
  const updateZone = async (zoneX: number, zoneY: number) => {
    if (!wallet) return;
    
    console.log(`[VoidRuntime] Updating zone: (${zoneX}, ${zoneY})`);
    
    try {
      await upsertNetProfile(wallet as `0x${string}`, {
        zoneX,
        zoneY,
      });
      
      // Update local state
      if (netProfile) {
        setNetProfile({
          ...netProfile,
          zoneX,
          zoneY,
          updatedAt: Math.floor(Date.now() / 1000),
        });
      }
    } catch (error) {
      console.error(`[VoidRuntime] Error updating zone:`, error);
    }
  };
  
  const updateXP = async (newXP: bigint) => {
    if (!wallet) return;
    
    console.log(`[VoidRuntime] Updating XP: ${newXP}`);
    
    try {
      await upsertNetProfile(wallet as `0x${string}`, {
        xp: newXP,
      });
      
      // Update local state
      if (netProfile) {
        setNetProfile({
          ...netProfile,
          xp: newXP,
          updatedAt: Math.floor(Date.now() / 1000),
        });
      }
    } catch (error) {
      console.error(`[VoidRuntime] Error updating XP:`, error);
    }
  };
  
  // ================================
  // CONTEXT VALUE
  // ================================
  
  const value: VoidRuntimeState = {
    wallet,
    chainId: chainId || null,
    isConnected: walletConnected,
    isReady,
    netProfile,
    isLoadingProfile,
    xp,
    level,
    tier,
    ownedLandCount,
    refreshProfile,
    updatePosition,
    updateZone,
    updateXP,
  };
  
  return (
    <VoidRuntimeContext.Provider value={value}>
      {children}
    </VoidRuntimeContext.Provider>
  );
}

// ================================
// HOOK
// ================================

export function useVoidRuntime(): VoidRuntimeState {
  const context = useContext(VoidRuntimeContext);
  
  if (!context) {
    throw new Error('useVoidRuntime must be used within VoidRuntimeProvider');
  }
  
  return context;
}
