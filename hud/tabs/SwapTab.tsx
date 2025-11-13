'use client';

/**
 * SWAP TAB - VOID ⇄ USDC token exchange
 * Shows: quote, liquidity, fees, route
 * Actions: approve, swap
 */

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { VOID_TOKEN_ABI } from '@/lib/contracts/abis';
import { 
  safeGetQuote, 
  doSwap, 
  calculateSwapFee, 
  calculateMinOut, 
  getDeadline,
  VOID_SWAP_ADDRESS 
} from '@/lib/swap/helpers';

const CONTRACTS = {
  VOID: '0x8de4043445939B0D0Cc7d6c752057707279D9893' as const,
  USDC: '0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9' as const,
  VoidSwap: VOID_SWAP_ADDRESS,
};

// Minimal USDC ABI
const USDC_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ type: 'address' }, { type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const;

interface SwapTabProps {
  onClose?: () => void;
}

export default function SwapTab({ onClose }: SwapTabProps) {
  const { authenticated } = usePrivy();
  const { address } = useAccount();

  const [fromToken, setFromToken] = useState<'VOID' | 'USDC'>('VOID');
  const [toToken, setToToken] = useState<'VOID' | 'USDC'>('USDC');
  const [amountIn, setAmountIn] = useState('');
  const [quote, setQuote] = useState<bigint | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [slippageBps, setSlippageBps] = useState(50); // 0.5%

  // Read balances
  const { data: voidBalance } = useReadContract({
    address: CONTRACTS.VOID,
    abi: VOID_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Check allowances
  const fromTokenAddress = fromToken === 'VOID' ? CONTRACTS.VOID : CONTRACTS.USDC;
  const fromTokenAbi = fromToken === 'VOID' ? VOID_TOKEN_ABI : USDC_ABI;

  const { data: allowance } = useReadContract({
    address: fromTokenAddress,
    abi: fromTokenAbi,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.VoidSwap] : undefined,
  });

  // Write operations
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: executeSwap, data: swapHash } = useWriteContract();

  const { isLoading: approveLoading } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: swapLoading } = useWaitForTransactionReceipt({ hash: swapHash });

  // Fetch quote when amount changes (debounced)
  useEffect(() => {
    if (!amountIn || parseFloat(amountIn) === 0) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const amount = parseUnits(amountIn, 18);
        const tokenIn = fromToken === 'VOID' ? CONTRACTS.VOID : CONTRACTS.USDC;
        const tokenOut = toToken === 'VOID' ? CONTRACTS.VOID : CONTRACTS.USDC;
        
        const quoteResult = await safeGetQuote({ amountIn: amount, tokenIn, tokenOut });
        setQuote(quoteResult);
      } catch (error) {
        console.error('Quote error:', error);
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [amountIn, fromToken, toToken]);

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmountIn('');
    setQuote(null);
  };

  const handleApprove = () => {
    if (!address) return;
    approve({
      address: fromTokenAddress,
      abi: fromTokenAbi,
      functionName: 'approve',
      args: [CONTRACTS.VoidSwap, maxUint256],
    });
  };

  const handleSwap = async () => {
    if (!address || !amountIn || !quote) return;
    
    try {
      const amount = parseUnits(amountIn, 18);
      const minOut = calculateMinOut(quote, slippageBps);
      const deadline = getDeadline(10); // 10 minutes
      const tokenIn = fromToken === 'VOID' ? CONTRACTS.VOID : CONTRACTS.USDC;
      const tokenOut = toToken === 'VOID' ? CONTRACTS.VOID : CONTRACTS.USDC;

      const txHash = await doSwap({ tokenIn, tokenOut, amountIn: amount, minOut, deadline });
      console.log('Swap tx:', txHash);
    } catch (error) {
      console.error('Swap error:', error);
    }
  };

  // Calculated values
  const voidBal = voidBalance ? parseFloat(formatUnits(voidBalance as bigint, 18)) : 0;
  const usdcBal = usdcBalance ? parseFloat(formatUnits(usdcBalance as bigint, 18)) : 0;
  const fromBalance = fromToken === 'VOID' ? voidBal : usdcBal;
  const quoteFormatted = quote ? parseFloat(formatUnits(quote, 18)).toFixed(4) : '0.00';
  const feeAmount = amountIn ? calculateSwapFee(parseUnits(amountIn, 18)) : 0n;
  const feeFormatted = formatUnits(feeAmount, 18);
  const isApproved = allowance ? (allowance as bigint) >= parseUnits(amountIn || '0', 18) : false;

  // Mock data for liquidity display
  const mockData = {
    voidPrice: 0.297,
    liquidity: { void: 1200000, usdc: 400000 },
    protocolFee: 0.3,
    volume24h: 78400,
  };

  if (!authenticated) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="text-4xl mb-2">💱</div>
        <div className="text-lg font-bold text-cyber-cyan uppercase tracking-wider">Token Exchange</div>
        <div className="text-sm text-bio-silver/60 max-w-md">
          Connect with Privy to swap VOID ⇄ USDC on VoidSwapTestnet.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          🔄 VOID : DEFI EXCHANGE
        </div>
        <div className="text-[0.7rem] space-y-1">
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Token Pair:</span>
            <span className="text-cyber-cyan">VOID ⇄ USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Current Quote:</span>
            <span className="text-signal-green">1 VOID = {mockData.voidPrice.toFixed(4)} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Liquidity Pool:</span>
            <span className="text-bio-silver">{(mockData.liquidity.void / 1000000).toFixed(1)}M VOID / {(mockData.liquidity.usdc / 1000).toFixed(0)}K USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Protocol Fee:</span>
            <span className="text-bio-silver">{mockData.protocolFee}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Router:</span>
            <span className="text-cyber-cyan">VoidSwapTestnet</span>
          </div>
        </div>
      </div>

      {/* Swap Interface */}
      <div className="space-y-3">
        {/* From Token */}
        <div className="p-4 bg-black/40 border border-bio-silver/30 rounded space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-bio-silver/60 uppercase tracking-wider">From</span>
            <span className="text-xs text-bio-silver/60">
              Balance: {fromBalance.toFixed(2)} {fromToken}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0.00"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="flex-1 px-3 py-2 bg-black/60 border border-bio-silver/30 rounded text-bio-silver text-lg focus:border-void-purple focus:outline-none"
            />
            <div className="px-4 py-2 bg-void-purple/20 border border-void-purple rounded text-void-purple font-bold">
              {fromToken}
            </div>
          </div>
          <button
            onClick={() => setAmountIn(fromBalance.toString())}
            className="text-xs text-cyber-cyan hover:text-cyber-cyan/80 transition-colors"
          >
            MAX
          </button>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center">
          <button
            onClick={handleFlip}
            className="p-2 bg-black/60 border border-bio-silver/30 rounded-full hover:border-cyber-cyan transition-all hover:rotate-180 duration-300"
          >
            <svg className="w-5 h-5 text-cyber-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Token */}
        <div className="p-4 bg-black/40 border border-bio-silver/30 rounded space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-bio-silver/60 uppercase tracking-wider">To</span>
            <span className="text-xs text-bio-silver/60">
              Balance: {toToken === 'VOID' ? voidBal.toFixed(2) : usdcBal.toFixed(2)} {toToken}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={quoteLoading ? "Fetching quote..." : "0.00"}
              value={quoteLoading ? "..." : (quote ? quoteFormatted : "")}
              readOnly
              className="flex-1 px-3 py-2 bg-black/60 border border-bio-silver/30 rounded text-signal-green text-lg cursor-not-allowed"
            />
            <div className="px-4 py-2 bg-cyber-cyan/20 border border-cyber-cyan rounded text-cyber-cyan font-bold">
              {toToken}
            </div>
          </div>
        </div>
      </div>

      {/* Route Info */}
      {amountIn && quote && (
        <div className="p-3 bg-black/40 border border-bio-silver/20 rounded text-[0.7rem] space-y-2">
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Expected Output:</span>
            <span className="text-signal-green">~{quoteFormatted} {toToken}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Fee (0.3%):</span>
            <span className="text-bio-silver">{parseFloat(feeFormatted).toFixed(4)} {fromToken}</span>
          </div>
          <div className="pt-2 border-t border-bio-silver/20">
            <div className="text-bio-silver/60 mb-1">Route Path:</div>
            <div className="text-cyber-cyan text-xs">
              {fromToken} → VoidSwapTestnet → {toToken}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Slippage Tolerance:</span>
            <span className="text-bio-silver">{(slippageBps / 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Min. Received:</span>
            <span className="text-signal-green">{parseFloat(formatUnits(calculateMinOut(quote, slippageBps), 18)).toFixed(4)} {toToken}</span>
          </div>
        </div>
      )}

      {/* Swap Action */}
      <div className="space-y-3">
        {!isApproved && amountIn && parseFloat(amountIn) > 0 ? (
          <button
            onClick={handleApprove}
            disabled={approveLoading || !address}
            className="w-full py-3 bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan/30 rounded text-cyber-cyan font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {approveLoading ? '[ Approving... ]' : `[ Approve ${fromToken} ]`}
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={swapLoading || !address || !amountIn || !quote || parseFloat(amountIn) === 0}
            className="w-full py-3 px-4 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {swapLoading ? '[ Swapping... ]' : '[ Execute Swap ]'}
          </button>
        )}

        {(approveHash || swapHash) && (
          <div className="text-xs text-center text-bio-silver/60">
            Tx: <a 
              href={`https://sepolia.basescan.org/tx/${approveHash || swapHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyber-cyan hover:underline"
            >
              {(approveHash || swapHash)?.slice(0, 10)}...{(approveHash || swapHash)?.slice(-8)}
            </a>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">🧠 Insights:</div>
        <div className="space-y-1 text-[0.7rem] text-bio-silver/80">
          <div>- Liquidity: {(mockData.liquidity.void / 1000000).toFixed(1)}M VOID / {(mockData.liquidity.usdc / 1000).toFixed(0)}K USDC</div>
          <div>- Fee routing → VoidHookRouterV4 (verified)</div>
          <div>- 24h Volume: {(mockData.volume24h / 1000).toFixed(1)}K VOID</div>
          <div>- Quote auto-updates (300ms debounce)</div>
        </div>
      </div>
    </div>
  );
}
