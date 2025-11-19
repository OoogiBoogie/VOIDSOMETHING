/**
 * VOID RUNTIME PROVIDER - V4.7
 * 
 * Aggregates all runtime state for the Void metaverse:
 * - Wallet connection (Wagmi + RainbowKit)
 * - Net Protocol profile (on-chain identity + position)
 * - XP/Tier system (VoidScore contract)
 * - Land ownership summary (optional)
 * 
 * This is the single source of truth for HUD components and MiniApps.
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
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
  isReady: boolean;
  
  // Net Protocol Profile (disabled on Sepolia)
  netProfile: NetProfileCore | null;
  isLoadingProfile: boolean;
  
  // XP / Tier (local state in Sepolia mode)
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
  reset: () => void; // CRITICAL: Clear all runtime state on disconnect
}

const VoidRuntimeContext = createContext<VoidRuntimeState | null>(null);

// ================================
// PROVIDER
// ================================

export function VoidRuntimeProvider({ children }: { children: React.ReactNode }) {
  const { address, chainId, isConnected: walletConnected } = useAccount();
  
  const [netProfile, setNetProfile] = useState<NetProfileCore | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Derived state
  const isReady = walletConnected;
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
  // SEPOLIA MODE: Skip Net Protocol, use localStorage
  // ================================
  
  useEffect(() => {
    if (!isReady || !wallet) {
      setNetProfile(null);
      return;
    }
    
    // Type guard - ensure wallet is never null
    const walletAddress = wallet as `0x${string}`;
    
    // SEPOLIA MODE: Net Protocol profiles don't work on testnet
    // Load from localStorage as off-chain session save
    async function loadLocalSession() {
      setIsLoadingProfile(true);
      console.log(`[VoidRuntime] SEPOLIA MODE: Loading local session for ${walletAddress}`);
      
      try {
        const savedSession = localStorage.getItem(`void-session-${walletAddress}`);
        const now = Math.floor(Date.now() / 1000);
        
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          console.log(`[VoidRuntime] Local session loaded:`, parsed);
          
          // Reconstruct profile from localStorage
          setNetProfile({
            wallet: walletAddress,
            createdAt: parsed.createdAt || now,
            updatedAt: now,
            posX: parsed.posX || 0,
            posY: parsed.posY || 1.5,
            posZ: parsed.posZ || 0,
            zoneX: parsed.zoneX || 0,
            zoneY: parsed.zoneY || 0,
            sceneId: parsed.sceneId || 0,
            level: parsed.level || 1,
            xp: BigInt(parsed.xp || 0),
          });
        } else {
          console.log(`[VoidRuntime] No local session, starting fresh`);
          // Create default session
          const defaultProfile: NetProfileCore = {
            wallet: walletAddress,
            createdAt: now,
            updatedAt: now,
            posX: 0,
            posY: 1.5,
            posZ: 0,
            zoneX: 0,
            zoneY: 0,
            sceneId: 0,
            level: 1,
            xp: BigInt(0),
          };
          setNetProfile(defaultProfile);
          localStorage.setItem(`void-session-${walletAddress}`, JSON.stringify({
            createdAt: now,
            posX: 0,
            posY: 1.5,
            posZ: 0,
            zoneX: 0,
            zoneY: 0,
            sceneId: 0,
            level: 1,
            xp: "0",
          }));
        }
      } catch (error) {
        console.error(`[VoidRuntime] Error loading local session:`, error);
        setNetProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    
    loadLocalSession();
  }, [isReady, wallet]);
  
  // ================================
  // ACTIONS
  // ================================
  
  const refreshProfile = async () => {
    if (!wallet) return;
    
    setIsLoadingProfile(true);
    
    try {
      // SEPOLIA MODE: Reload from localStorage
      const savedSession = localStorage.getItem(`void-session-${wallet}`);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setNetProfile({
          wallet,
          createdAt: parsed.createdAt || Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
          posX: parsed.posX || 0,
          posY: parsed.posY || 1.5,
          posZ: parsed.posZ || 0,
          zoneX: parsed.zoneX || 0,
          zoneY: parsed.zoneY || 0,
          sceneId: parsed.sceneId || 0,
          level: parsed.level || 1,
          xp: BigInt(parsed.xp || 0),
        });
      }
    } catch (error) {
      console.error(`[VoidRuntime] Error refreshing session:`, error);
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const updatePosition = async (x: number, y: number, z: number) => {
    if (!wallet || !netProfile) return;
    
    try {
      // SEPOLIA MODE: Save to localStorage only
      const savedSession = localStorage.getItem(`void-session-${wallet}`);
      const session = savedSession ? JSON.parse(savedSession) : {};
      
      session.posX = x;
      session.posY = y;
      session.posZ = z;
      
      localStorage.setItem(`void-session-${wallet}`, JSON.stringify(session));
      
      // Update local state
      setNetProfile({ ...netProfile, posX: x, posY: y, posZ: z, updatedAt: Math.floor(Date.now() / 1000) });
      
      console.log(`[VoidRuntime] Position saved to localStorage: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    } catch (error) {
      console.error(`[VoidRuntime] Error updating position:`, error);
    }
  };
  
  const updateZone = async (zoneX: number, zoneY: number) => {
    if (!wallet || !netProfile) return;
    
    try {
      // SEPOLIA MODE: Save to localStorage only
      const savedSession = localStorage.getItem(`void-session-${wallet}`);
      const session = savedSession ? JSON.parse(savedSession) : {};
      
      session.zoneX = zoneX;
      session.zoneY = zoneY;
      
      localStorage.setItem(`void-session-${wallet}`, JSON.stringify(session));
      
      // Update local state
      setNetProfile({ ...netProfile, zoneX, zoneY, updatedAt: Math.floor(Date.now() / 1000) });
      
      console.log(`[VoidRuntime] Zone saved to localStorage: (${zoneX}, ${zoneY})`);
    } catch (error) {
      console.error(`[VoidRuntime] Error updating zone:`, error);
    }
  };
  
  const updateXP = async (newXP: bigint) => {
    if (!wallet || !netProfile) return;
    
    try {
      // SEPOLIA MODE: Save to localStorage only
      const savedSession = localStorage.getItem(`void-session-${wallet}`);
      const session = savedSession ? JSON.parse(savedSession) : {};
      
      session.xp = newXP.toString();
      
      // Calculate level from XP (simple formula)
      const xpNum = Number(newXP);
      const newLevel = Math.floor(Math.sqrt(xpNum / 100)) + 1;
      session.level = newLevel;
      
      localStorage.setItem(`void-session-${wallet}`, JSON.stringify(session));
      
      // Update local state
      setNetProfile({ ...netProfile, xp: newXP, level: newLevel, updatedAt: Math.floor(Date.now() / 1000) });
      
      console.log(`[VoidRuntime] XP saved to localStorage: ${newXP} (Level ${newLevel})`);
    } catch (error) {
      console.error(`[VoidRuntime] Error updating XP:`, error);
    }
  };
  
  // CRITICAL: Reset all runtime state on disconnect
  const reset = () => {
    console.log('[VoidRuntime] ✓ Resetting runtime state');
    setNetProfile(null);
    setIsLoadingProfile(false);
    // Note: wallet state is managed by Wagmi, we just clear our internal state
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
    reset, // CRITICAL: Expose reset for disconnect flow
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
