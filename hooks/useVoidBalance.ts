import { useReadContract } from 'wagmi';
import { Address } from 'viem';

const VOID_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Hook to read VOID token balance for a given address
 * @param address - Wallet address to check balance for
 * @returns VOID balance as a number (formatted from wei)
 */
export function useVoidBalance(address: Address | undefined) {
  const voidTokenAddress = process.env.NEXT_PUBLIC_VOID_TOKEN as Address;

  const { data: balanceWei, isLoading, isError, refetch } = useReadContract({
    address: voidTokenAddress,
    abi: VOID_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!voidTokenAddress,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  // Convert from wei (18 decimals) to VOID
  const balance = balanceWei 
    ? Number(balanceWei) / 1e18 
    : 0;

  return {
    balance,
    balanceWei,
    isLoading,
    isError,
    refetch,
  };
}
