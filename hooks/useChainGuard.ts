import { useAccount, useChainId } from 'wagmi';

const REQUIRED_CHAIN_ID = 84532; // Base Sepolia

export interface ChainGuardResult {
  OK: boolean;
  message: string | null;
  address: string | undefined;
  chainId: number;
}

/**
 * Chain guard hook - ensures user is on Base Sepolia (84532)
 * 
 * Usage in tabs:
 * ```tsx
 * const { OK, message } = useChainGuard();
 * if (!OK) return <ErrorBanner>{message}</ErrorBanner>;
 * ```
 */
export function useChainGuard(): ChainGuardResult {
  const chainId = useChainId();
  const { address } = useAccount();
  
  const OK = chainId === REQUIRED_CHAIN_ID;
  
  const message = OK 
    ? null 
    : `Wrong network: ${chainId}. Please switch to Base Sepolia (${REQUIRED_CHAIN_ID}).`;

  return { OK, message, address, chainId };
}
