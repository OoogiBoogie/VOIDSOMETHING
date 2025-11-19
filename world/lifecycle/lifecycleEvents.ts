/**
 * PHASE 5.0 — PLAYER LIFECYCLE EVENTS
 * 
 * Defines all lifecycle stages a player goes through in The Void.
 * These events track the complete player journey from wallet connection to session end.
 */

import { WorldEventType } from "../events/eventTypes";

/**
 * Additional lifecycle event types (extend WorldEventType enum)
 */
export enum LifecycleEventType {
  ON_WALLET_CONNECT = "ON_WALLET_CONNECT",
  ON_PROFILE_READY = "ON_PROFILE_READY",
  ON_WORLD_LOADED = "ON_WORLD_LOADED",
  ON_PLAYER_SPAWN = "ON_PLAYER_SPAWN",
  ON_GAMEPLAY_START = "ON_GAMEPLAY_START",
  ON_GAMEPLAY_TICK = "ON_GAMEPLAY_TICK",
  ON_SESSION_ENDED = "ON_SESSION_ENDED",
}

/**
 * Lifecycle event payloads
 */

export interface OnWalletConnectEvent {
  type: LifecycleEventType.ON_WALLET_CONNECT;
  timestamp: number;
  walletAddress: string;
  loginMethod: "wallet" | "bypass";
  chainId?: number;
}

export interface OnProfileReadyEvent {
  type: LifecycleEventType.ON_PROFILE_READY;
  timestamp: number;
  walletAddress: string | null;
  sessionId: string;
  profile?: {
    level: number;
    xp: bigint | number;
    posX: number;
    posY: number;
    posZ: number;
    zoneX: number;
    zoneY: number;
  };
  bypassMode: boolean;
}

export interface OnWorldLoadedEvent {
  type: LifecycleEventType.ON_WORLD_LOADED;
  timestamp: number;
  sessionId: string;
  loadDuration: number; // milliseconds
  renderMode: "desktop" | "mobile";
  worldVersion: string;
}

export interface OnPlayerSpawnEvent {
  type: LifecycleEventType.ON_PLAYER_SPAWN;
  timestamp: number;
  sessionId: string;
  walletAddress: string | null;
  spawnPosition: { x: number; y: number; z: number };
  spawnParcelId: string;
  spawnDistrictId: string;
  isResume: boolean; // true if resuming from saved position
}

export interface OnGameplayStartEvent {
  type: LifecycleEventType.ON_GAMEPLAY_START;
  timestamp: number;
  sessionId: string;
  walletAddress: string | null;
  currentParcelId: string;
  currentDistrictId: string;
}

export interface OnGameplayTickEvent {
  type: LifecycleEventType.ON_GAMEPLAY_TICK;
  timestamp: number;
  sessionId: string;
  walletAddress: string | null;
  currentParcelId: string | null;
  currentDistrictId: string | null;
  sessionDuration: number; // milliseconds since gameplay start
  totalParcelsVisited: number;
  totalDistrictsVisited: number;
}

export interface OnSessionEndedEvent {
  type: LifecycleEventType.ON_SESSION_ENDED;
  timestamp: number;
  sessionId: string;
  walletAddress: string | null;
  sessionDuration: number;
  totalParcelsVisited: number;
  totalDistrictsVisited: number;
  endReason: "manual" | "tab_close" | "timeout" | "error";
}

/**
 * Union type of all lifecycle events
 */
export type LifecycleEvent =
  | OnWalletConnectEvent
  | OnProfileReadyEvent
  | OnWorldLoadedEvent
  | OnPlayerSpawnEvent
  | OnGameplayStartEvent
  | OnGameplayTickEvent
  | OnSessionEndedEvent;

/**
 * Type guards
 */
export function isLifecycleEvent(event: any): event is LifecycleEvent {
  return Object.values(LifecycleEventType).includes(event.type);
}
