/**
 * WALLET GATE - Global Authentication Guard
 * 
 * Blocks access to world, HUD, and miniapps until wallet is connected.
 * Enforces wallet-first architecture across all entry points.
 * 
 * CRITICAL: This gate wraps the entire app to ensure no unauthorized access.
 */

'use client';

import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, ReactNode } from 'react';
import { WalletTerminal } from '@/components/WalletTerminal';

interface WalletGateProps {
  children: ReactNode;
  /**
   * If true, shows wallet terminal when not authenticated
   * If false, just blocks rendering (for use in nested components)
   */
  showTerminal?: boolean;
}

/**
 * Wallet Gate Component
 * 
 * Usage:
 * - Wrap around world/HUD to require wallet before rendering
 * - Automatically shows wallet connection screen if not authenticated
 * - Passes through once wallet is connected
 */
export function WalletGate({ children, showTerminal = true }: WalletGateProps) {
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();

  // Debug logging
  useEffect(() => {
    console.log('[WalletGate] Status:', { authenticated, isConnected, address });
  }, [authenticated, isConnected, address]);

  // User must be authenticated AND have wallet address
  const isAuthorized = authenticated && address && isConnected;

  if (!isAuthorized) {
    if (showTerminal) {
      // Show wallet connection terminal
      return <WalletTerminal onStart={() => {
        // This will be called after wallet connects
        // No need to do anything here - component will re-render due to state change
        console.log('[WalletGate] Wallet connected, allowing access');
      }} />;
    }
    
    // Just block rendering (for nested usage)
    return null;
  }

  // User is authorized - render protected content
  return <>{children}</>;
}

/**
 * Hook to check if user is wallet-gated (authorized)
 * Useful for conditional rendering within components
 */
export function useWalletGate() {
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();

  const isAuthorized = authenticated && address && isConnected;

  return {
    isAuthorized,
    address: address || null,
    isConnected,
    authenticated,
  };
}
