/**
 * useBYOTData Hook
 * Manages BYOT tokens, world uses, and inventory
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { byotService } from '@/services/byotService';
import type {
  BYOTToken,
  WorldUseMapping,
  TokenCapability,
} from '@/services/byotService';
import type {
  InventoryToken,
  WorldUse,
} from '@/services/byotTypes';
import { useAuth } from './useAuth';

// ========== NEW PHASE 1 INVENTORY HOOKS ==========

/**
 * useInventoryTokens - Get user's inventory (new format)
 * Uses InventoryToken type from byotTypes
 */
export function useInventoryTokens() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<InventoryToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTokens = useCallback(async () => {
    if (!user) {
      setTokens([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await byotService.getUserInventory(user.id);
      setTokens(data);
    } catch (err) {
      setError(err as Error);
      console.error('[useInventoryTokens] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  return { tokens, loading, error, refresh: loadTokens };
}

/**
 * useWorldUses - Get world uses for user's tokens
 */
export function useWorldUses(tokens: InventoryToken[]) {
  const [uses, setUses] = useState<WorldUse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const tokenIds = useMemo(() => tokens.map((t) => t.id), [tokens]);

  const loadUses = useCallback(async () => {
    if (!tokenIds.length) {
      setUses([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await byotService.getWorldUsesForTokens(tokenIds);
      setUses(data);
    } catch (err) {
      setError(err as Error);
      console.error('[useWorldUses] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(tokenIds)]);

  useEffect(() => {
    loadUses();
  }, [loadUses]);

  return { uses, loading, error, refresh: loadUses };
}

// ========== LEGACY HOOKS (kept for backward compatibility) ==========

export interface UseInventoryTokensReturn {
  tokens: BYOTToken[];
  nativeTokens: BYOTToken[];
  byotTokens: BYOTToken[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useInventoryTokensLegacy(userId: string | null): UseInventoryTokensReturn {
  const [tokens, setTokens] = useState<BYOTToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTokens = useCallback(async () => {
    if (!userId) {
      setTokens([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await byotService.getUserTokens(userId);
      setTokens(data);
    } catch (err) {
      setError(err as Error);
      console.error('[useInventoryTokens] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const nativeTokens = useMemo(
    () => tokens.filter(t => !t.isBYOT),
    [tokens]
  );

  const byotTokens = useMemo(
    () => tokens.filter(t => t.isBYOT),
    [tokens]
  );

  return {
    tokens,
    nativeTokens,
    byotTokens,
    loading,
    error,
    refresh: loadTokens,
  };
}

export interface UseWorldUsesReturn {
  worldUses: WorldUseMapping[];
  loading: boolean;
  error: Error | null;
  getUsesForToken: (tokenAddress: string) => WorldUseMapping[];
  activateUse: (useId: string) => Promise<void>;
}

export function useWorldUses(tokenAddresses: string[]): UseWorldUsesReturn {
  const [worldUses, setWorldUses] = useState<WorldUseMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadWorldUses = useCallback(async () => {
    if (!tokenAddresses.length) {
      setWorldUses([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await byotService.getWorldUses(tokenAddresses);
      setWorldUses(data);
    } catch (err) {
      setError(err as Error);
      console.error('[useWorldUses] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(tokenAddresses)]);

  useEffect(() => {
    loadWorldUses();
  }, [loadWorldUses]);

  const getUsesForToken = useCallback((tokenAddress: string) => {
    return worldUses.filter(u => u.tokenAddress === tokenAddress);
  }, [worldUses]);

  const activateUse = useCallback(async (useId: string) => {
    const use = worldUses.find(u => u.id === useId);
    if (!use) {
      throw new Error('World use not found');
    }
    
    await byotService.activateTokenPerk(use.tokenAddress, useId);
    await loadWorldUses();
  }, [worldUses, loadWorldUses]);

  return {
    worldUses,
    loading,
    error,
    getUsesForToken,
    activateUse,
  };
}

export interface UseTokenCapabilitiesReturn {
  capabilities: Map<string, TokenCapability>;
  loading: boolean;
  error: Error | null;
  hasCapability: (tokenAddress: string, capability: string) => boolean;
}

export function useTokenCapabilities(tokenAddresses: string[]): UseTokenCapabilitiesReturn {
  const [capabilities, setCapabilities] = useState<Map<string, TokenCapability>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tokenAddresses.length) {
      setCapabilities(new Map());
      return;
    }

    const loadCapabilities = async () => {
      setLoading(true);
      setError(null);
      try {
        const capMap = new Map<string, TokenCapability>();
        
        for (const address of tokenAddresses) {
          const cap = await byotService.getTokenCapabilities(address);
          capMap.set(address, cap);
        }
        
        setCapabilities(capMap);
      } catch (err) {
        setError(err as Error);
        console.error('[useTokenCapabilities] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCapabilities();
  }, [JSON.stringify(tokenAddresses)]);

  const hasCapability = useCallback((tokenAddress: string, capability: string): boolean => {
    const cap = capabilities.get(tokenAddress);
    if (!cap) return false;
    
    return cap.worldUses.some(use => use.type === capability);
  }, [capabilities]);

  return {
    capabilities,
    loading,
    error,
    hasCapability,
  };
}

export interface UseBYOTRegistrationReturn {
  isRegistering: boolean;
  error: Error | null;
  registerToken: (config: any) => Promise<void>;
}

export function useBYOTRegistration(): UseBYOTRegistrationReturn {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const registerToken = useCallback(async (config: any) => {
    setIsRegistering(true);
    setError(null);
    try {
      await byotService.registerBYOTToken(config);
    } catch (err) {
      setError(err as Error);
      console.error('[useBYOTRegistration] Error:', err);
      throw err;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return {
    isRegistering,
    error,
    registerToken,
  };
}
