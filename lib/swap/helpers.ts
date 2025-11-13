/**
 * VOID SWAP HELPERS
 * Dual-ABI support for VoidSwapTestnet contract variations
 * 
 * Base Sepolia: 0x74bD32c493C9be6237733507b00592e6AB231e4F
 */

import { readContract, writeContract } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmiConfig';

export const VOID_SWAP_ADDRESS = '0x74bD32c493C9be6237733507b00592e6AB231e4F' as const;

// ABI Shape A: getQuote(tokenIn, amountIn)
const abiShapeA = [
  {
    type: 'function',
    name: 'getQuote',
    stateMutability: 'view',
    inputs: [
      { type: 'address', name: 'tokenIn' },
      { type: 'uint256', name: 'amountIn' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'swap',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'tokenIn' },
      { type: 'address', name: 'tokenOut' },
      { type: 'uint256', name: 'amountIn' },
      { type: 'uint256', name: 'minAmountOut' },
      { type: 'uint256', name: 'deadline' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;

// ABI Shape B: getQuote(amountIn, tokenIn, tokenOut)
const abiShapeB = [
  {
    type: 'function',
    name: 'getQuote',
    stateMutability: 'view',
    inputs: [
      { type: 'uint256', name: 'amountIn' },
      { type: 'address', name: 'tokenIn' },
      { type: 'address', name: 'tokenOut' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'swap',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'tokenIn' },
      { type: 'address', name: 'tokenOut' },
      { type: 'uint256', name: 'amountIn' },
      { type: 'uint256', name: 'minAmountOut' },
      { type: 'uint256', name: 'deadline' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export interface GetQuoteArgs {
  amountIn: bigint;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
}

export interface SwapArgs {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
  minOut: bigint;
  deadline: bigint;
}

/**
 * Tolerant getQuote - tries both ABI shapes
 * Returns quote in output token decimals
 */
export async function safeGetQuote(args: GetQuoteArgs): Promise<bigint> {
  // Try shape B first (newer)
  try {
    return (await readContract(wagmiConfig, {
      address: VOID_SWAP_ADDRESS,
      abi: abiShapeB,
      functionName: 'getQuote',
      args: [args.amountIn, args.tokenIn, args.tokenOut],
    })) as bigint;
  } catch {
    // Fall back to shape A
    return (await readContract(wagmiConfig, {
      address: VOID_SWAP_ADDRESS,
      abi: abiShapeA,
      functionName: 'getQuote',
      args: [args.tokenIn, args.amountIn],
    })) as bigint;
  }
}

/**
 * Execute swap transaction
 * Returns transaction hash
 */
export async function doSwap(args: SwapArgs): Promise<`0x${string}`> {
  return await writeContract(wagmiConfig, {
    address: VOID_SWAP_ADDRESS,
    abi: abiShapeA, // swap signature is same on both
    functionName: 'swap',
    args: [args.tokenIn, args.tokenOut, args.amountIn, args.minOut, args.deadline],
  });
}

/**
 * Calculate fee amount (0.3%)
 */
export function calculateSwapFee(amountIn: bigint): bigint {
  return (amountIn * 3n) / 1000n; // 0.3% = 0.003
}

/**
 * Calculate minimum output with slippage tolerance
 * @param quote - Expected output amount
 * @param slippageBps - Slippage in basis points (e.g., 50 = 0.5%)
 */
export function calculateMinOut(quote: bigint, slippageBps: number): bigint {
  return (quote * BigInt(10000 - slippageBps)) / 10000n;
}

/**
 * Get deadline timestamp (current time + minutes)
 */
export function getDeadline(minutes: number = 10): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + 60 * minutes);
}
