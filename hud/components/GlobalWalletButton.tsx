'use client';

/**
 * GLOBAL WALLET BUTTON
 * Floating button that appears when wallet is not connected
 * Always accessible from any screen
 */

import React from 'react';
import { Wallet } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

export default function GlobalWalletButton() {
  const { authenticated, login } = usePrivy();
  const { address, isConnected } = useAccount();

  // Only show if NOT connected
  if (authenticated && isConnected && address) {
    return null;
  }

  return (
    <button
      onClick={() => login()}
      className="fixed bottom-6 right-6 z-[9999] px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-3 group"
      style={{
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(6, 255, 165, 0.3)',
      }}
    >
      <Wallet className="w-5 h-5 text-white group-hover:animate-pulse" />
      <span className="text-white font-bold">Connect Wallet</span>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
    </button>
  );
}

