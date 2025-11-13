"use client";

/**
 * @title Cosmetics Context - LOCKED UNTIL PHASE 2
 * @notice Placeholder context for cosmetic system
 * 
 * Phase 1 Status: 🔒 LOCKED
 * 
 * Unlock Conditions:
 * - HUD_CORE_STATUS = 'stable' (all 3 hubs rendering)
 * - CONTRACT_DEPLOYMENT = 'verified' (Basescan verified)
 * - AI_SERVICES = 'responsive' (EmissionAI, VaultAI, MissionAI producing telemetry)
 * 
 * Current Functionality:
 * - Returns empty/null state only
 * - Logs warning on any cosmetic function calls
 * - NO ERC-1155 mints, IPFS uploads, or rendering
 * 
 * Phase 2 Activation:
 * - User AI approval required
 * - ERC-1155 integration (SKUFactory)
 * - IPFS asset storage
 * - Cosmetic rendering in 3D scene
 * - Loadout management
 */

import React, { createContext, useContext, ReactNode } from "react";

// ============ TYPES (Placeholder) ============

export interface CosmeticItem {
  id: string;
  name: string;
  category: "HEAD" | "BODY" | "ACCESSORY" | "EFFECT";
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  creator: string;
  price: number;
  ipfsHash: string;
}

export interface PlayerLoadout {
  head: CosmeticItem | null;
  body: CosmeticItem | null;
  accessory: CosmeticItem | null;
  effect: CosmeticItem | null;
}

interface CosmeticContextValue {
  // Inventory (LOCKED)
  ownedCosmetics: CosmeticItem[];
  
  // Loadout (LOCKED)
  currentLoadout: PlayerLoadout;
  
  // Actions (LOCKED)
  equipCosmetic: (itemId: string, slot: keyof PlayerLoadout) => void;
  unequipCosmetic: (slot: keyof PlayerLoadout) => void;
  purchaseCosmetic: (itemId: string) => Promise<void>;
  
  // Lock status
  isLocked: true;
  unlockConditions: {
    hudCoreStatus: "pending" | "stable";
    contractDeployment: "pending" | "verified";
    aiServices: "pending" | "responsive";
  };
}

// ============ CONTEXT ============

const CosmeticContext = createContext<CosmeticContextValue | undefined>(undefined);

// ============ PROVIDER (LOCKED STATE) ============

interface CosmeticProviderProps {
  children: ReactNode;
}

export function CosmeticProvider({ children }: CosmeticProviderProps) {
  const LOCK_WARNING = "🔒 Cosmetics system locked until Phase 2. Unlock conditions: HUD_CORE=stable, CONTRACT_DEPLOYMENT=verified, AI_SERVICES=responsive";
  
  // Empty loadout
  const currentLoadout: PlayerLoadout = {
    head: null,
    body: null,
    accessory: null,
    effect: null,
  };
  
  // Locked functions (log warning)
  const equipCosmetic = () => {
    console.warn(LOCK_WARNING);
  };
  
  const unequipCosmetic = () => {
    console.warn(LOCK_WARNING);
  };
  
  const purchaseCosmetic = async () => {
    console.warn(LOCK_WARNING);
    throw new Error("Cosmetics purchasing locked until Phase 2");
  };
  
  const value: CosmeticContextValue = {
    ownedCosmetics: [], // Empty inventory
    currentLoadout,
    equipCosmetic,
    unequipCosmetic,
    purchaseCosmetic,
    isLocked: true,
    unlockConditions: {
      hudCoreStatus: "pending",      // Set to "stable" after HUD Phase 1 complete
      contractDeployment: "pending",  // Set to "verified" after Basescan verification
      aiServices: "pending",          // Set to "responsive" after AI Services v0 complete
    },
  };
  
  return <CosmeticContext.Provider value={value}>{children}</CosmeticContext.Provider>;
}

// ============ HOOK ============

export function useCosmetics() {
  const context = useContext(CosmeticContext);
  
  if (!context) {
    throw new Error("useCosmetics must be used within CosmeticProvider");
  }
  
  // Log warning on every hook call
  if (context.isLocked) {
    console.warn(
      "🔒 Cosmetics system accessed but locked. Unlock after: " +
      `HUD=${context.unlockConditions.hudCoreStatus}, ` +
      `Contracts=${context.unlockConditions.contractDeployment}, ` +
      `AI=${context.unlockConditions.aiServices}`
    );
  }
  
  return context;
}

// ============ LOCK STATUS CHECKER ============

export function getCosmeticLockStatus(): {
  isLocked: boolean;
  conditions: {
    hudCoreStatus: "pending" | "stable";
    contractDeployment: "pending" | "verified";
    aiServices: "pending" | "responsive";
  };
  canUnlock: boolean;
} {
  // Phase 1: All conditions pending
  const conditions = {
    hudCoreStatus: "pending" as const,
    contractDeployment: "pending" as const,
    aiServices: "pending" as const,
  };
  
  const canUnlock = 
    conditions.hudCoreStatus === "stable" &&
    conditions.contractDeployment === "verified" &&
    conditions.aiServices === "responsive";
  
  return {
    isLocked: !canUnlock,
    conditions,
    canUnlock,
  };
}
