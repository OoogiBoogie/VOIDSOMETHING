/**
 * Unified Wallet Hook
 * Simple wrapper around wagmi useAccount
 */

import { useAccount } from 'wagmi';

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();

  return {
    address: address || null,
    isConnected,
    authenticated: isConnected,
    chainId: chainId || null,
  };
}
