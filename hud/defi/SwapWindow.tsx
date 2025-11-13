/**
 * VOID PROTOCOL - SWAP WINDOW
 * Token swap interface for VOID <-> USDC
 */

"use client"

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'sonner'
import { useSwap, type SwapToken } from '@/hooks/useSwap'

export function SwapWindow() {
  const { address, isConnected } = useAccount()
  const { authenticated, login } = usePrivy()
  const { swap, fetchQuote, quoteOut, fee, isLoading, priceImpact } = useSwap()
  
  const [tokenIn, setTokenIn] = useState<SwapToken>('VOID')
  const [tokenOut, setTokenOut] = useState<SwapToken>('USDC')
  const [amountIn, setAmountIn] = useState('')
  const [slippage] = useState(0.5)
  
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      fetchQuote(tokenIn, amountIn)
    }
  }, [amountIn, tokenIn, fetchQuote])
  
  const handleSwap = async () => {
    if (!authenticated || !isConnected) {
      toast.error('Connect wallet first')
      return
    }
    
    if (!amountIn || parseFloat(amountIn) <= 0) {
      toast.error('Enter amount to swap')
      return
    }
    
    try {
      await swap({ tokenIn, tokenOut, amountIn, slippage })
      toast.success('Swap successful!')
      setAmountIn('')
    } catch (error: any) {
      if (error.message?.includes('user rejected')) {
        toast.error('Transaction cancelled')
      } else if (error.message?.includes('slippage')) {
        toast.error('Price moved too much, try again')
      } else {
        toast.error(error.message || 'Swap failed')
      }
    }
  }
  
  const handleFlip = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn('')
  }
  
  const feeAmount = amountIn ? (parseFloat(amountIn) * 0.3 / 100).toFixed(6) : '0'
  const highImpact = priceImpact && parseFloat(priceImpact) > 5
  
  if (!authenticated || !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <h3 className="text-xl font-bold text-purple-400">SWAP</h3>
        <p className="text-sm text-gray-400">Connect wallet to swap tokens</p>
        <button 
          onClick={() => login()} 
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between pb-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-purple-400">SWAP</h2>
        <div className="text-xs text-gray-400">Base Sepolia</div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-400">From</div>
        <div className="p-4 bg-black/30 border border-gray-700 rounded-lg">
          <select 
            value={tokenIn} 
            onChange={(e) => setTokenIn(e.target.value as SwapToken)} 
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm font-semibold mb-2" 
            disabled={isLoading}
          >
            <option value="VOID">VOID</option>
            <option value="USDC">USDC</option>
          </select>
          <input 
            type="number" 
            value={amountIn} 
            onChange={(e) => setAmountIn(e.target.value)} 
            placeholder="0.00" 
            className="w-full bg-transparent text-2xl font-mono font-bold outline-none" 
            disabled={isLoading} 
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleFlip} 
          disabled={isLoading} 
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          ↕
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-400">To (estimated)</div>
        <div className="p-4 bg-black/30 border border-gray-700 rounded-lg">
          <select 
            value={tokenOut} 
            onChange={(e) => setTokenOut(e.target.value as SwapToken)} 
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm font-semibold mb-2" 
            disabled={isLoading}
          >
            <option value="USDC">USDC</option>
            <option value="VOID">VOID</option>
          </select>
          <div className="text-2xl font-mono font-bold text-teal-400">{quoteOut || '0.00'}</div>
        </div>
      </div>

      <div className="p-4 bg-black/20 border border-gray-700 rounded-lg space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Fee (0.3%)</span>
          <span className="font-mono">{feeAmount} {tokenIn}</span>
        </div>
        {priceImpact && (
          <div className="flex justify-between">
            <span className="text-gray-400">Price Impact</span>
            <span className={`font-mono ${highImpact ? 'text-red-400' : 'text-green-400'}`}>{priceImpact}%</span>
          </div>
        )}
      </div>

      {highImpact && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-sm text-red-400">
          ⚠️ High price impact - try a smaller amount
        </div>
      )}

      <button 
        onClick={handleSwap} 
        disabled={isLoading || !amountIn || parseFloat(amountIn) <= 0} 
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Swapping...' : !amountIn || parseFloat(amountIn) <= 0 ? 'Enter Amount' : 'Swap'}
      </button>
    </div>
  )
}
