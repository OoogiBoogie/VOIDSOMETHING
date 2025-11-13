/**
 * MOBILE HUD SHELL - V4.7
 * 
 * Automatically switches between LITE (portrait) and ROAM (landscape) modes
 * based on device orientation.
 * 
 * - LITE (Portrait): Info-dense dashboard with profile card, stats grid, chat, dock
 * - ROAM (Landscape): Minimal explorer HUD with top bar, side strip, bottom dock
 * 
 * Uses window.matchMedia and orientation events for smooth transitions.
 */

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { EconomySnapshot, PlayerState } from '@/hud/types/economySnapshot';

// Dynamically import HUD modes (avoid SSR issues)
const MobileLiteHUD = dynamic(
  () => import('./MobileLiteHUD_v2'),
  { ssr: false }
);

const MobileRoamHUD = dynamic(
  () => import('./MobileRoamHUD_v2'),
  { ssr: false }
);

interface MobileHudShellProps {
  snapshot: EconomySnapshot;
  playerState: PlayerState;
  chatState: {
    messages: Array<{
      id: string;
      hub?: string;
      type?: 'system' | 'user';
      username?: string;
      text: string;
      timestamp: number;
      channel: 'global' | 'nearby' | 'party';
    }>;
    activeChannel: 'global' | 'nearby' | 'party';
  };
  fxState: {
    missionCompleted: boolean;
    tokenGain: boolean;
    chatIncoming: boolean;
    tickerEvent: boolean;
    mapPulse: boolean;
  };
  triggerFX: (type: string, data?: any) => void;
  onSendMessage: (text: string, channel: 'global' | 'nearby' | 'party') => void;
  onDockAction: (actionId: string) => void;
}

export default function MobileHudShell(props: MobileHudShellProps) {
  // Detect orientation (portrait = LITE, landscape = ROAM)
  const [isLandscape, setIsLandscape] = useState(false);
  const [forceLiteView, setForceLiteView] = useState(false);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    // Initial orientation check
    const checkOrientation = () => {
      const isLandscapeMode = 
        window.matchMedia('(orientation: landscape)').matches &&
        window.innerWidth > window.innerHeight;
      
      setIsLandscape(isLandscapeMode);
      console.log(`[MobileHudShell] Orientation: ${isLandscapeMode ? 'LANDSCAPE (ROAM)' : 'PORTRAIT (LITE)'}`);
    };

    checkOrientation();

    // Listen for orientation changes
    const mediaQuery = window.matchMedia('(orientation: landscape)');
    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches && window.innerWidth > window.innerHeight);
      setForceLiteView(false); // Reset force when orientation changes
    };

    // Add listener (modern API)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleOrientationChange);
    }

    // Also listen for resize events
    const handleResize = () => {
      checkOrientation();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleOrientationChange);
      } else {
        mediaQuery.removeListener(handleOrientationChange);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handler to manually switch to LITE view from ROAM
  const handleOpenLiteView = () => {
    setForceLiteView(true);
  };

  // Handler to close forced LITE view
  const handleCloseLiteView = () => {
    setForceLiteView(false);
  };

  // Determine which HUD to show
  const showLite = !isLandscape || forceLiteView;

  return (
    <>
      {showLite ? (
        <MobileLiteHUD
          {...props}
          onDockAction={(actionId) => {
            if (actionId === 'back-to-roam' && isLandscape) {
              handleCloseLiteView();
            } else {
              props.onDockAction(actionId);
            }
          }}
        />
      ) : (
        <MobileRoamHUD
          {...props}
          onOpenLiteView={handleOpenLiteView}
          onDockAction={props.onDockAction}
        />
      )}

      {/* Orientation indicator (dev mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 left-2 z-[9999] px-2 py-1 rounded bg-black/80 border border-signal-green/50 text-[0.6rem] text-signal-green font-mono pointer-events-none">
          {showLite ? 'LITE (Portrait)' : 'ROAM (Landscape)'}
          {forceLiteView && ' [FORCED]'}
        </div>
      )}
    </>
  );
}
