/**
 * USE NET PROFILE HOOK - V4.7 Production
 * 
 * DEPRECATED: This hook is now a compatibility wrapper around VoidRuntimeProvider.
 * For new code, use useVoidRuntime() directly from @/src/runtime/VoidRuntimeProvider.
 * 
 * React hook for managing user on-chain profile via Net Protocol.
 * Automatically loads profile when wallet connects and provides
 * methods for updating progress.
 */

'use client';

import { useCallback } from 'react';
import { useVoidRuntime } from '@/src/runtime/VoidRuntimeProvider';

interface NetProfileUpdate {
  lastPosition?: { x: number; y: number; z: number };
  lastSceneId?: string;
  xp?: string;
  level?: number;
  displayName?: string;
}

interface UseNetProfileReturn {
  profile: {
    wallet: string;
    xp: string;
    level: number;
    lastPosition?: { x: number; y: number; z: number };
  } | null;
  isLoading: boolean;
  error: string | null;
  saveProfile: (updates: NetProfileUpdate) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Hook for managing user's on-chain profile
 * 
 * DEPRECATED: Use useVoidRuntime() directly for new code.
 * This is a compatibility wrapper for existing code.
 */
export function useNetProfile(): UseNetProfileReturn {
  const runtime = useVoidRuntime();
  
  // Map VoidRuntime to old NetProfile format for compatibility
  const profile = runtime.netProfile ? {
    wallet: runtime.netProfile.wallet,
    xp: runtime.netProfile.xp.toString(),
    level: runtime.netProfile.level,
    lastPosition: {
      x: runtime.netProfile.posX,
      y: runtime.netProfile.posY,
      z: runtime.netProfile.posZ,
    },
  } : null;
  
  const saveProfile = useCallback(async (updates: NetProfileUpdate) => {
    console.log(`[useNetProfile] saveProfile called with:`, updates);
    
    // Map old updates to new VoidRuntime methods
    if (updates.lastPosition) {
      const { x, y, z } = updates.lastPosition;
      await runtime.updatePosition(x, y, z);
    }
    
    if (updates.xp) {
      await runtime.updateXP(BigInt(updates.xp));
    }
    
    // Note: Other fields like displayName, lastSceneId are handled by dataHash in production
    // For now we just ignore them - they can be added later
  }, [runtime]);
  
  const refreshProfile = useCallback(async () => {
    await runtime.refreshProfile();
  }, [runtime]);
  
  return {
    profile,
    isLoading: runtime.isLoadingProfile,
    error: null, // VoidRuntime doesn't expose errors, catches them internally
    saveProfile,
    refreshProfile,
  };
}

/**
 * Helper hook for updating specific profile fields
 * Provides convenience methods for common updates
 */
export function useProfileUpdates() {
  const runtime = useVoidRuntime();

  const updatePosition = useCallback((x: number, y: number, z: number) => {
    runtime.updatePosition(x, y, z);
  }, [runtime]);

  const updateScene = useCallback((sceneId: string) => {
    console.log(`[useProfileUpdates] updateScene called with ${sceneId} - not implemented yet`);
    // TODO: Store sceneId in dataHash when implementing off-chain rich data
  }, []);

  const updateXP = useCallback((xp: string, level?: number) => {
    runtime.updateXP(BigInt(xp));
  }, [runtime]);

  const updateDisplayName = useCallback((displayName: string) => {
    console.log(`[useProfileUpdates] updateDisplayName called with ${displayName} - not implemented yet`);
    // TODO: Store displayName in dataHash when implementing off-chain rich data
  }, []);

  return {
    updatePosition,
    updateScene,
    updateXP,
    updateDisplayName,
  };
}
