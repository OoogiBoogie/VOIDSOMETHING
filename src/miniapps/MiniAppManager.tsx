/**
 * MINIAPP MANAGER - Context & Provider
 * 
 * Manages miniapp lifecycle, state, and runtime context.
 * Provides useVoidRuntime hook for miniapps to access wallet/xp/land/profile.
 * 
 * CRITICAL: This must be wrapped around the app after wallet providers.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useNetProfile } from '@/hooks/useNetProfile';
import { useVoidScore } from '@/hooks/useVoidScore';
import { MINIAPP_REGISTRY, getMiniAppById } from './miniapps.registry';
import type { 
  MiniAppDefinition, 
  VoidRuntimeContext, 
  MiniAppManagerState, 
  MiniAppManagerActions 
} from './types';

// ================================
// CONTEXT TYPES
// ================================

interface MiniAppManagerContextValue extends MiniAppManagerState, MiniAppManagerActions {}

const MiniAppManagerContext = createContext<MiniAppManagerContextValue | null>(null);

// ================================
// PROVIDER COMPONENT
// ================================

interface MiniAppManagerProviderProps {
  children: ReactNode;
}

export function MiniAppManagerProvider({ children }: MiniAppManagerProviderProps) {
  const { address, isConnected, chainId } = useAccount();
  const { profile: netProfile } = useNetProfile();
  const { voidScore } = useVoidScore(address || '');
  
  // Manager state
  const [activeMiniAppId, setActiveMiniAppId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  /**
   * Build runtime context for miniapps
   * This is the data exposed via useVoidRuntime()
   */
  const runtime: VoidRuntimeContext = useMemo(() => {
    return {
      // Wallet
      walletAddress: address || null,
      chainId: chainId || null,
      isConnected: isConnected,
      
      // Net Protocol Profile
      netProfile: netProfile ? {
        agentId: address || '',
        xp: netProfile.xp,
        level: netProfile.level,
        lastSceneId: 'main-hub',
        lastPosition: netProfile.lastPosition,
        displayName: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined,
      } : null,
      
      // XP System (from VoidScore)
      xp: voidScore ? {
        current: BigInt(voidScore.currentScore || 0),
        level: voidScore.tier === 'S_TIER' ? 4 : voidScore.tier === 'GOLD' ? 3 : voidScore.tier === 'SILVER' ? 2 : 1,
        tier: voidScore.tier || 'INITIATE',
      } : undefined,
      
      // Land Summary (TODO: integrate useLandMap when needed)
      landSummary: undefined,
      
      // Additional context
      hubMode: undefined,
      currentScene: 'main-hub',
    };
  }, [address, chainId, isConnected, netProfile, voidScore]);

  /**
   * Open a miniapp by ID
   * Wallet must be connected to open any miniapp
   */
  const openMiniApp = useCallback((id: string) => {
    console.log(`[MiniAppManager] Opening miniapp: ${id}`);
    
    // Validate wallet is connected
    if (!isConnected || !address) {
      console.error(`[MiniAppManager] Cannot open miniapp - wallet not connected`);
      // TODO: Trigger wallet connect modal
      return;
    }
    
    // Validate app exists
    const app = getMiniAppById(id);
    if (!app) {
      console.error(`[MiniAppManager] Miniapp not found: ${id}`);
      return;
    }
    
    // Validate app is enabled
    if (app.enabled === false) {
      console.error(`[MiniAppManager] Miniapp is disabled: ${id}`);
      return;
    }
    
    // Update state
    setActiveMiniAppId(id);
    setHistory(prev => [...prev, id]);
  }, [isConnected, address]);

  /**
   * Close the active miniapp
   */
  const closeMiniApp = useCallback(() => {
    console.log(`[MiniAppManager] Closing miniapp: ${activeMiniAppId}`);
    setActiveMiniAppId(null);
  }, [activeMiniAppId]);

  /**
   * Get miniapp definition by ID
   */
  const getMiniApp = useCallback((id: string) => {
    return getMiniAppById(id);
  }, []);

  /**
   * Get all miniapps
   */
  const getAllMiniApps = useCallback(() => {
    return MINIAPP_REGISTRY.filter(app => app.enabled !== false);
  }, []);

  /**
   * Get miniapps by category
   */
  const getMiniAppsByCategory = useCallback((category: string) => {
    return MINIAPP_REGISTRY.filter(
      app => app.category === category && app.enabled !== false
    );
  }, []);

  // Context value
  const value: MiniAppManagerContextValue = {
    activeMiniAppId,
    history,
    runtime,
    openMiniApp,
    closeMiniApp,
    getMiniApp,
    getAllMiniApps,
    getMiniAppsByCategory,
  };

  return (
    <MiniAppManagerContext.Provider value={value}>
      {children}
    </MiniAppManagerContext.Provider>
  );
}

// ================================
// HOOKS
// ================================

/**
 * Hook to access MiniApp Manager
 * Use this in HUD/UI components to control miniapps
 */
export function useMiniAppManager() {
  const context = useContext(MiniAppManagerContext);
  
  if (!context) {
    throw new Error('useMiniAppManager must be used within MiniAppManagerProvider');
  }
  
  return context;
}

/**
 * Hook to access Void Runtime
 * Use this INSIDE miniapps to access wallet/xp/land/profile
 */
export function useVoidRuntime(): VoidRuntimeContext {
  const context = useContext(MiniAppManagerContext);
  
  if (!context) {
    throw new Error('useVoidRuntime must be used within MiniAppManagerProvider');
  }
  
  return context.runtime;
}

/**
 * Hook to get the currently active miniapp
 */
export function useActiveMiniApp(): MiniAppDefinition | null {
  const { activeMiniAppId, getMiniApp } = useMiniAppManager();
  
  if (!activeMiniAppId) {
    return null;
  }
  
  return getMiniApp(activeMiniAppId) || null;
}
