/**
 * MINIAPP TYPES & DEFINITIONS
 * 
 * Type definitions for the VOID MiniApp platform.
 * Supports both internal (React) and external (iframe/MiniKit) apps.
 */

import { ReactNode, ComponentType } from 'react';

// ================================
// CORE TYPES
// ================================

export type MiniAppType = 'internal' | 'external';

export type MiniAppCategory = 'social' | 'finance' | 'system' | 'creator' | 'game';

export type MiniAppPermission =
  | 'wallet.read'    // Read wallet address, balance
  | 'wallet.write'   // Request transactions
  | 'xp.read'        // Read XP, level, tier
  | 'xp.write'       // Award XP (admin only)
  | 'land.read'      // Read owned land
  | 'land.write'     // Transfer land
  | 'tx.write'       // Execute arbitrary transactions
  | 'profile.read'   // Read user profile
  | 'profile.write'; // Update user profile

// ================================
// MINIAPP DEFINITION
// ================================

export interface MiniAppDefinition {
  /** Unique identifier (e.g. 'void-dex', 'social-hub') */
  id: string;
  
  /** Display name shown in UI */
  name: string;
  
  /** Short description (1-2 sentences) */
  description?: string;
  
  /** Icon path or emoji */
  icon?: string;
  
  /** App type */
  type: MiniAppType;
  
  /** Category for grouping/filtering */
  category?: MiniAppCategory;
  
  /** Required permissions */
  permissions: MiniAppPermission[];
  
  /** Whether this app is enabled */
  enabled?: boolean;
  
  /** For internal apps: Dynamic import loader */
  loader?: () => Promise<{ default: ComponentType<any> }>;
  
  /** For external apps: MiniKit app URL */
  url?: string;
  
  /** Optional metadata */
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
  };
}

// ================================
// MINIAPP CONTEXT DATA
// ================================

/**
 * Data exposed to miniapps via useVoidRuntime
 */
export interface VoidRuntimeContext {
  // Wallet
  walletAddress: string | null;
  chainId: number | null;
  isConnected: boolean;
  
  // Net Protocol Profile
  netProfile: {
    agentId: string;
    xp: string;
    level: number;
    lastSceneId: string;
    lastPosition?: { x: number; y: number; z: number };
    displayName?: string;
  } | null;
  
  // XP System (from existing hooks)
  xp?: {
    current: bigint;
    level: number;
    tier: string;
  };
  
  // Land Summary
  landSummary?: {
    ownedCount: number;
    totalValue: string;
    parcels: Array<{ id: string; district: string }>;
  };
  
  // Additional context
  hubMode?: string;
  currentScene?: string;
}

// ================================
// MINIAPP MANAGER STATE
// ================================

export interface MiniAppManagerState {
  /** Currently active miniapp ID */
  activeMiniAppId: string | null;
  
  /** History of opened miniapps (for back navigation) */
  history: string[];
  
  /** Runtime context for miniapps */
  runtime: VoidRuntimeContext;
}

export interface MiniAppManagerActions {
  /** Open a miniapp by ID */
  openMiniApp: (id: string) => void;
  
  /** Close the active miniapp */
  closeMiniApp: () => void;
  
  /** Get miniapp definition by ID */
  getMiniApp: (id: string) => MiniAppDefinition | undefined;
  
  /** Get all miniapps */
  getAllMiniApps: () => MiniAppDefinition[];
  
  /** Get miniapps by category */
  getMiniAppsByCategory: (category: MiniAppCategory) => MiniAppDefinition[];
}

// ================================
// POSTMESSAGE PROTOCOL (External MiniKit)
// ================================

/**
 * Message types for postMessage communication with external miniapps
 */
export type VoidMessageType = 
  | 'void:init'       // Parent → Child: Initialize with runtime data
  | 'void:ready'      // Child → Parent: Miniapp is ready
  | 'void:txRequest'  // Child → Parent: Request transaction
  | 'void:txResult'   // Parent → Child: Transaction result
  | 'void:error';     // Parent ↔ Child: Error occurred

export interface VoidInitMessage {
  type: 'void:init';
  payload: {
    walletAddress: string;
    chainId: number;
    xp: string;
    level: number;
    tier: string;
    agentId: string;
    netProfile: VoidRuntimeContext['netProfile'];
  };
}

export interface VoidReadyMessage {
  type: 'void:ready';
}

export interface VoidTxRequestMessage {
  type: 'void:txRequest';
  requestId: string;
  payload: {
    to: string;
    value?: string;
    data?: string;
    // Or function call syntax
    contract?: string;
    function?: string;
    args?: any[];
  };
}

export interface VoidTxResultMessage {
  type: 'void:txResult';
  requestId: string;
  payload: {
    success: boolean;
    txHash?: string;
    error?: string;
  };
}

export interface VoidErrorMessage {
  type: 'void:error';
  error: string;
}

export type VoidMessage = 
  | VoidInitMessage 
  | VoidReadyMessage 
  | VoidTxRequestMessage 
  | VoidTxResultMessage 
  | VoidErrorMessage;
