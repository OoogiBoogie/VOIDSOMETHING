/**
 * VOID DEFI - Swap Hook
 * 
 * Handles VOID <-> USDC swaps via VoidSwapTestnet with fee routing
 */

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Address, formatUnits, parseUnits } from "viem";
import { toast } from "sonner";

const SWAP_ABI = [
  {
    name: "swapExactIn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "minAmountOut", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    name: "getQuote",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "fee", type: "uint256" },
    ],
  },
  {
    name: "getReserves",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "reserveVoid", type: "uint256" },
      { name: "reserveUsdc", type: "uint256" },
    ],
  },
  {
    name: "getPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "price", type: "uint256" }],
  },
] as const;

const TOKEN_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export type SwapToken = "VOID" | "USDC";

interface SwapParams {
  tokenIn: SwapToken;
  tokenOut: SwapToken;
  amountIn: string;
  slippage?: number; // Default 0.5%
}

export function useSwap() {
  const { address } = useAccount();
  const [quoteOut, setQuoteOut] = useState<string>("0");
  const [fee, setFee] = useState<string>("0");
  const [isQuoting, setIsQuoting] = useState(false);
  const [priceImpact, setPriceImpact] = useState<string>("0");
  
  const swapContractAddress = process.env.NEXT_PUBLIC_VOID_SWAP_ADDRESS as Address;
  const voidTokenAddress = process.env.NEXT_PUBLIC_VOID_ADDRESS as Address;
  const usdcTokenAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS as Address;
  
  // Contract writes
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: executeSwap, data: swapHash } = useWriteContract();
  
  // Transaction status
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isSwapping } = useWaitForTransactionReceipt({
    hash: swapHash,
  });
  
  // Read reserves and price
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: swapContractAddress,
    abi: SWAP_ABI,
    functionName: "getReserves",
  });
  
  const { data: price } = useReadContract({
    address: swapContractAddress,
    abi: SWAP_ABI,
    functionName: "getPrice",
  });
  
  /**
   * Get token address for swap token
   */
  const getTokenAddress = useCallback((token: SwapToken): Address => {
    return token === "VOID" ? voidTokenAddress : usdcTokenAddress;
  }, [voidTokenAddress, usdcTokenAddress]);
  
  /**
   * Get token decimals
   */
  const getDecimals = useCallback((token: SwapToken): number => {
    return token === "VOID" ? 18 : 6;
  }, []);
  
  /**
   * Fetch quote for swap
   */
  const fetchQuote = useCallback(
    async (tokenIn: SwapToken, amountIn: string) => {
      if (!swapContractAddress || !amountIn || parseFloat(amountIn) === 0) {
        setQuoteOut("0");
        setFee("0");
        setPriceImpact("0");
        return;
      }
      
      setIsQuoting(true);
      
      try {
        const decimals = getDecimals(tokenIn);
        const tokenInAddress = getTokenAddress(tokenIn);
        const amountInWei = parseUnits(amountIn, decimals);
        
        // This would call the contract's getQuote function
        // For now, we'll simulate it based on reserves
        if (reserves) {
          const [reserveVoid, reserveUsdc] = reserves as [bigint, bigint];
          
          const isVoidIn = tokenIn === "VOID";
          const reserveIn = isVoidIn ? reserveVoid : reserveUsdc;
          const reserveOut = isVoidIn ? reserveUsdc : reserveVoid;
          const decimalsOut = getDecimals(tokenIn === "VOID" ? "USDC" : "VOID");
          
          // Calculate fee (0.3%)
          const feeAmount = (amountInWei * BigInt(30)) / BigInt(10000);
          const amountInAfterFee = amountInWei - feeAmount;
          
          // Calculate output using constant product formula
          const numerator = reserveOut * amountInAfterFee;
          const denominator = reserveIn + amountInAfterFee;
          const amountOutWei = numerator / denominator;
          
          // Calculate price impact
          const priceBeforeSwap = isVoidIn
            ? Number(reserveVoid) / Number(reserveUsdc)
            : Number(reserveUsdc) / Number(reserveVoid);
          
          const reserveInAfter = reserveIn + amountInAfterFee;
          const reserveOutAfter = reserveOut - amountOutWei;
          
          const priceAfterSwap = isVoidIn
            ? Number(reserveInAfter) / Number(reserveOutAfter)
            : Number(reserveOutAfter) / Number(reserveInAfter);
          
          const impact = Math.abs((priceAfterSwap - priceBeforeSwap) / priceBeforeSwap) * 100;
          
          setQuoteOut(formatUnits(amountOutWei, decimalsOut));
          setFee(formatUnits(feeAmount, decimals));
          setPriceImpact(impact.toFixed(2));
        }
      } catch (error) {
        console.error("Quote error:", error);
        setQuoteOut("0");
        setFee("0");
      } finally {
        setIsQuoting(false);
      }
    },
    [swapContractAddress, reserves, getDecimals, getTokenAddress]
  );
  
  /**
   * Execute swap
   */
  const swap = useCallback(
    async ({ tokenIn, tokenOut, amountIn, slippage = 0.5 }: SwapParams) => {
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }
      
      if (!swapContractAddress || !amountIn || parseFloat(amountIn) === 0) {
        toast.error("Invalid swap parameters");
        return;
      }
      
      try {
        const tokenInAddress = getTokenAddress(tokenIn);
        const decimalsIn = getDecimals(tokenIn);
        const decimalsOut = getDecimals(tokenOut);
        const amountInWei = parseUnits(amountIn, decimalsIn);
        
        // Calculate minimum output with slippage
        const quoteOutWei = parseUnits(quoteOut, decimalsOut);
        const minAmountOut = (quoteOutWei * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);
        
        // Check allowance
        const { data: allowanceData } = await useReadContract({
          address: tokenInAddress,
          abi: TOKEN_ABI,
          functionName: "allowance",
          args: [address, swapContractAddress],
        });
        
        const currentAllowance = (allowanceData as bigint) || BigInt(0);
        
        // Step 1: Approve if needed
        if (currentAllowance < amountInWei) {
          toast.info(`Approving ${tokenIn}...`);
          
          await approve(
            {
              address: tokenInAddress,
              abi: TOKEN_ABI,
              functionName: "approve",
              args: [swapContractAddress, amountInWei],
            },
            {
              onSuccess: () => {
                toast.success(`${tokenIn} approved!`);
                
                // Step 2: Execute swap
                toast.info("Executing swap...");
                
                executeSwap(
                  {
                    address: swapContractAddress,
                    abi: SWAP_ABI,
                    functionName: "swapExactIn",
                    args: [tokenInAddress, amountInWei, minAmountOut],
                  },
                  {
                    onSuccess: () => {
                      toast.success(`Swapped ${amountIn} ${tokenIn} for ${quoteOut} ${tokenOut}! 🎉`);
                      refetchReserves();
                    },
                    onError: (error) => {
                      console.error("Swap error:", error);
                      toast.error("Swap failed");
                    },
                  }
                );
              },
              onError: (error) => {
                console.error("Approval error:", error);
                toast.error("Approval failed");
              },
            }
          );
        } else {
          // Already approved, execute swap
          toast.info("Executing swap...");
          
          executeSwap(
            {
              address: swapContractAddress,
              abi: SWAP_ABI,
              functionName: "swapExactIn",
              args: [tokenInAddress, amountInWei, minAmountOut],
            },
            {
              onSuccess: () => {
                toast.success(`Swapped ${amountIn} ${tokenIn} for ${quoteOut} ${tokenOut}! 🎉`);
                refetchReserves();
              },
              onError: (error) => {
                console.error("Swap error:", error);
                toast.error("Swap failed");
              },
            }
          );
        }
      } catch (error) {
        console.error("Swap execution error:", error);
        toast.error("Swap failed");
      }
    },
    [address, swapContractAddress, quoteOut, getTokenAddress, getDecimals, approve, executeSwap, refetchReserves]
  );
  
  /**
   * Get current VOID/USDC price
   */
  const currentPrice = price ? Number(formatUnits(price as bigint, 18)) : 0;
  
  return {
    swap,
    fetchQuote,
    quoteOut,
    fee,
    priceImpact,
    currentPrice,
    isQuoting,
    isApproving,
    isSwapping,
    isLoading: isApproving || isSwapping,
  };
}
