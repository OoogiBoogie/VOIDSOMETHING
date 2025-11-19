/**
 * BYPASS MODE — GUEST SESSION HANDLER
 * 
 * Implements ?bypass=true URL parameter for guest access.
 * Creates temporary session without wallet connection.
 * All events tracked with bypass flag for analytics.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { usePlayerState } from '@/state/player';
import { playerLifecycleManager } from '@/world/lifecycle';
import { worldEventBus } from '@/world/events/eventBus';
import { WorldEventType } from '@/world/events/eventTypes';

const BYPASS_WALLET_PREFIX = '0xBYPASS';
const BYPASS_SESSION_KEY = 'void_bypass_session';

export interface BypassSession {
  id: string;
  walletAddress: string;
  createdAt: number;
  expiresAt: number;
  isGuest: true;
}

/**
 * Check if bypass mode is enabled in environment
 */
export function isBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_BYPASS_MODE === 'true';
}

/**
 * Generate guest wallet address
 */
function generateGuestWallet(): string {
  const randomPart = uuidv4().replace(/-/g, '').slice(0, 32);
  return `${BYPASS_WALLET_PREFIX}${randomPart}`;
}

/**
 * Create bypass session
 */
export function createBypassSession(): BypassSession {
  const session: BypassSession = {
    id: `bypass-${uuidv4()}`,
    walletAddress: generateGuestWallet(),
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    isGuest: true,
  };

  // Store in sessionStorage (cleared on browser close)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(BYPASS_SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

/**
 * Get existing bypass session
 */
export function getBypassSession(): BypassSession | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem(BYPASS_SESSION_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as BypassSession;
    
    // Check if expired
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(BYPASS_SESSION_KEY);
      return null;
    }

    return session;
  } catch (error) {
    console.error('[BypassMode] Failed to parse session:', error);
    sessionStorage.removeItem(BYPASS_SESSION_KEY);
    return null;
  }
}

/**
 * Clear bypass session
 */
export function clearBypassSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(BYPASS_SESSION_KEY);
  }
}

/**
 * Check if wallet address is a guest/bypass address
 */
export function isGuestWallet(walletAddress: string): boolean {
  return walletAddress.startsWith(BYPASS_WALLET_PREFIX);
}

/**
 * Initialize bypass mode session
 */
export function initializeBypassSession(): BypassSession {
  // Check for existing session
  let session = getBypassSession();
  
  if (!session) {
    // Create new session
    session = createBypassSession();
    console.log('[BypassMode] Created guest session:', session.id);
  } else {
    console.log('[BypassMode] Resumed guest session:', session.id);
  }

  // Emit analytics event
  worldEventBus.emit({
    type: WorldEventType.USER_LOGGED_IN,
    walletAddress: session.walletAddress,
    loginMethod: 'bypass',
    timestamp: Date.now(),
  });

  // Initialize player state
  const playerState = usePlayerState.getState();
  playerState.connect(session.walletAddress);
  playerState.startSession(session.walletAddress);

  // Initialize lifecycle
  playerLifecycleManager.onWalletConnect(session.walletAddress, 'bypass');
  playerLifecycleManager.onProfileReady(undefined, true); // bypassMode = true

  return session;
}

/**
 * React hook for bypass mode detection and initialization
 */
export function useBypassMode() {
  const searchParams = useSearchParams();
  const [bypassSession, setBypassSession] = useState<BypassSession | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isBypassEnabled()) {
      console.log('[BypassMode] Disabled in environment');
      return;
    }

    // Check URL parameter
    const bypassParam = searchParams?.get('bypass');
    const shouldBypass = bypassParam === 'true' || bypassParam === '1';

    if (shouldBypass) {
      console.log('[BypassMode] Detected bypass parameter');
      const session = initializeBypassSession();
      setBypassSession(session);
      setIsActive(true);
    } else {
      // Check for existing session
      const existingSession = getBypassSession();
      if (existingSession) {
        setBypassSession(existingSession);
        setIsActive(true);
      }
    }
  }, [searchParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive && bypassSession) {
        // Emit session end event
        worldEventBus.emit({
          type: WorldEventType.SESSION_ENDED,
          walletAddress: bypassSession.walletAddress,
          duration: Date.now() - bypassSession.createdAt,
          parcelsVisited: 0,
          districtsVisited: 0,
          timestamp: Date.now(),
        });
      }
    };
  }, [isActive, bypassSession]);

  return {
    isActive,
    session: bypassSession,
    isGuest: isActive && bypassSession !== null,
    guestWallet: bypassSession?.walletAddress,
  };
}

/**
 * React component to display bypass mode indicator
 */
export function BypassModeIndicator() {
  const { isActive, session } = useBypassMode();

  if (!isActive || !session) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-500/20 border border-yellow-500 rounded px-3 py-1.5 text-yellow-200 text-sm font-mono">
      <span className="font-bold">GUEST MODE</span>
      <span className="ml-2 opacity-70">
        Session expires in {Math.floor((session.expiresAt - Date.now()) / (60 * 60 * 1000))}h
      </span>
    </div>
  );
}

/**
 * Get display name for guest users
 */
export function getGuestDisplayName(walletAddress: string): string {
  if (!isGuestWallet(walletAddress)) {
    return walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
  }

  // Extract unique part from guest wallet
  const uniquePart = walletAddress.replace(BYPASS_WALLET_PREFIX, '').slice(0, 6);
  return `Guest-${uniquePart}`;
}
