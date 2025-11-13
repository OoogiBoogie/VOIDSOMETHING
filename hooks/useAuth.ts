/**
 * useAuth Hook
 * Handles wallet connection, user authentication, and role management
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import type { UserRole } from '@/hud/HUDTypes';

export interface AuthUser {
  id: string;
  address: string;
  roles: UserRole[];
  username?: string;
  avatarUrl?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isConnected: boolean;
  isLoading: boolean;
  roles: UserRole[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  signMessage: (message: string) => Promise<string>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check localStorage for existing session
        const stored = localStorage.getItem('auth-user');
        if (stored) {
          const userData = JSON.parse(stored);
          setUser({
            id: userData.id,
            address: userData.walletAddress,
            roles: userData.roles,
            username: userData.username,
            avatarUrl: userData.avatarUrl,
          });
        }
      } catch (error) {
        console.error('[useAuth] Init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const connection = await authService.connectWallet();
      const loggedInUser = await authService.loginWithWallet(connection.address);
      
      setUser({
        id: loggedInUser.id,
        address: loggedInUser.walletAddress,
        roles: loggedInUser.roles,
        username: loggedInUser.username,
        avatarUrl: loggedInUser.avatarUrl,
      });
    } catch (error) {
      console.error('[useAuth] Connect error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await authService.disconnectWallet();
      setUser(null);
    } catch (error) {
      console.error('[useAuth] Disconnect error:', error);
      throw error;
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  }, [user]);

  // Sign arbitrary message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!user) {
      throw new Error('No user connected');
    }
    return authService.signMessage(message);
  }, [user]);

  return {
    user,
    isConnected: !!user,
    isLoading,
    roles: user?.roles || [],
    connect,
    disconnect,
    hasRole,
    signMessage,
  };
}
