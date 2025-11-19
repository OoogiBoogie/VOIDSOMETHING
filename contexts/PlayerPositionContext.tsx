'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import { parcelIdToWorldCoords } from '@/world/WorldCoords';

export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
}

type PositionSource = 'world' | 'ui';

interface PlayerPositionState {
  position: PlayerPosition;
  source: PositionSource;
  timestamp: number;
}

interface PlayerPositionContextValue {
  position: PlayerPosition;
  source: PositionSource;
  syncFromWorld: (pos: PlayerPosition) => void;
  requestTeleport: (pos: PlayerPosition) => void;
}

const DEFAULT_POSITION: PlayerPosition = { x: 0, y: 1, z: 5 };

/**
 * Calculate spawn position from home parcel
 * PHASE 5: Home Parcel system integration
 * PHASE 5.1: Actual world coordinate conversion
 */
function getInitialPosition(): PlayerPosition {
  // Check if home parcel spawn is enabled
  if (typeof window === 'undefined') return DEFAULT_POSITION;
  
  try {
    const homeParcelData = localStorage.getItem('void-home-parcel-state');
    if (!homeParcelData) return DEFAULT_POSITION;
    
    const parsed = JSON.parse(homeParcelData);
    const state = parsed?.state;
    
    if (!state || !state.enabled || state.homeParcelId == null) {
      return DEFAULT_POSITION;
    }
    
    console.log(`[Spawn] Home parcel spawn requested: Parcel ${state.homeParcelId} in district ${state.homeDistrictId || 'UNKNOWN'}`);
    
    // Convert homeParcelId to world coords using canonical transform
    const worldPos = parcelIdToWorldCoords(state.homeParcelId, state.homeDistrictId);
    
    if (!worldPos) {
      console.warn('[Spawn] Could not resolve parcel to world coords, falling back to default.');
      return DEFAULT_POSITION;
    }
    
    console.log(`[Spawn] ✅ Spawning at home parcel ${state.homeParcelId}: (${worldPos.x.toFixed(1)}, ${worldPos.y}, ${worldPos.z.toFixed(1)})`);
    
    return {
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
    };
    
  } catch (err) {
    console.warn('[Spawn] Failed to parse home parcel state:', err);
    return DEFAULT_POSITION;
  }
}

const PlayerPositionContext = createContext<PlayerPositionContextValue | null>(null);

export function PlayerPositionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerPositionState>(() => ({
    position: getInitialPosition(),
    source: 'world',
    timestamp: Date.now(),
  }));

  const syncFromWorld = useCallback((pos: PlayerPosition) => {
    setState({ position: pos, source: 'world', timestamp: Date.now() });
  }, []);

  const requestTeleport = useCallback((pos: PlayerPosition) => {
    setState({ position: pos, source: 'ui', timestamp: Date.now() });
  }, []);

  const value = useMemo<PlayerPositionContextValue>(() => ({
    position: state.position,
    source: state.source,
    syncFromWorld,
    requestTeleport,
  }), [state.position, state.source, syncFromWorld, requestTeleport]);

  return (
    <PlayerPositionContext.Provider value={value}>
      {children}
    </PlayerPositionContext.Provider>
  );
}

export function usePlayerPosition() {
  const context = useContext(PlayerPositionContext);
  if (!context) {
    throw new Error('usePlayerPosition must be used within PlayerPositionProvider');
  }
  return context;
}
