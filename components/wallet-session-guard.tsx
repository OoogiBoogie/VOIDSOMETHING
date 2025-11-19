"use client";

import { useEffect } from "react";

/**
 * WalletSessionGuard - Ensures fresh wallet selection every session
 * 
 * Clears all wallet-related localStorage once per session.
 * Does NOT block rendering - clears cache in parallel.
 */
export function WalletSessionGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const hasCleared = sessionStorage.getItem('void_wallet_cache_cleared');
    
    if (!hasCleared) {
      console.log('[WalletSessionGuard] Clearing wallet cache - fresh session');
      
      // Clear ALL wallet-related localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('wagmi.') ||
          key.startsWith('rainbowkit.') ||
          key.includes('walletconnect') ||
          key.includes('recentConnector')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`[WalletSessionGuard] Cleared ${keysToRemove.length} wallet cache keys`);
      
      // Mark as cleared for this session
      sessionStorage.setItem('void_wallet_cache_cleared', '1');
    }
  }, []);

  return <>{children}</>;
}
