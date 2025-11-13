/**
 * MINIAPP REGISTRY
 * 
 * Central registry of all miniapps available in VOID.
 * Single source of truth for app discovery and loading.
 * 
 * CRITICAL: All miniapps must be registered here to appear in the system.
 */

import type { MiniAppDefinition } from './types';

// ================================
// INTERNAL MINIAPPS
// ================================

/**
 * Internal miniapps are React components bundled with VOID.
 * They load via dynamic imports for code splitting.
 */
const INTERNAL_APPS: MiniAppDefinition[] = [
  {
    id: 'void-dex',
    name: 'VOID DEX',
    description: 'Swap tokens and manage liquidity on the VOID decentralized exchange',
    icon: '💱',
    type: 'internal',
    category: 'finance',
    permissions: ['wallet.read', 'wallet.write', 'tx.write'],
    enabled: true,
    loader: () => import('./internal/VoidDexApp'),
    metadata: {
      author: 'VOID Protocol',
      version: '1.0.0',
      tags: ['defi', 'swap', 'dex'],
    },
  },
  {
    id: 'social-hub',
    name: 'Social Hub',
    description: 'Global chat, DMs, and social features',
    icon: '💬',
    type: 'internal',
    category: 'social',
    permissions: ['wallet.read', 'profile.read'],
    enabled: true,
    loader: () => import('./internal/SocialHubApp'),
    metadata: {
      author: 'VOID Protocol',
      version: '1.0.0',
      tags: ['chat', 'social', 'messaging'],
    },
  },
  {
    id: 'land-manager',
    name: 'Land Manager',
    description: 'View and manage your land parcels and districts',
    icon: '🏙️',
    type: 'internal',
    category: 'game',
    permissions: ['wallet.read', 'land.read'],
    enabled: true,
    loader: () => import('./internal/LandManagerApp'),
    metadata: {
      author: 'VOID Protocol',
      version: '1.0.0',
      tags: ['land', 'property', 'metaverse'],
    },
  },
  {
    id: 'profile-manager',
    name: 'Profile Manager',
    description: 'Edit your on-chain profile and preferences',
    icon: '👤',
    type: 'internal',
    category: 'system',
    permissions: ['wallet.read', 'profile.read', 'profile.write'],
    enabled: true,
    loader: () => import('./internal/ProfileManagerApp'),
    metadata: {
      author: 'VOID Protocol',
      version: '1.0.0',
      tags: ['profile', 'settings', 'identity'],
    },
  },
];

// ================================
// EXTERNAL MINIKIT APPS
// ================================

/**
 * External miniapps are MiniKit-compatible web apps hosted elsewhere.
 * They load in iframes and communicate via postMessage.
 * 
 * TODO: Add production MiniKit app URLs here.
 */
const EXTERNAL_APPS: MiniAppDefinition[] = [
  // Example external app (currently disabled - uncomment and add real URL to enable)
  // {
  //   id: 'example-minikit-app',
  //   name: 'Example MiniKit',
  //   description: 'Example external MiniKit application',
  //   icon: '🎮',
  //   type: 'external',
  //   category: 'game',
  //   permissions: ['wallet.read', 'tx.write'],
  //   enabled: false, // Set to true when URL is ready
  //   url: 'https://example-minikit.com',
  //   metadata: {
  //     author: 'Third Party',
  //     version: '1.0.0',
  //   },
  // },
];

// ================================
// REGISTRY EXPORTS
// ================================

/**
 * Complete registry of all miniapps
 */
export const MINIAPP_REGISTRY: MiniAppDefinition[] = [
  ...INTERNAL_APPS,
  ...EXTERNAL_APPS,
];

/**
 * Get miniapp by ID
 */
export function getMiniAppById(id: string): MiniAppDefinition | undefined {
  return MINIAPP_REGISTRY.find(app => app.id === id);
}

/**
 * Get all enabled miniapps
 */
export function getEnabledMiniApps(): MiniAppDefinition[] {
  return MINIAPP_REGISTRY.filter(app => app.enabled !== false);
}

/**
 * Get miniapps by category
 */
export function getMiniAppsByCategory(category: string): MiniAppDefinition[] {
  return MINIAPP_REGISTRY.filter(app => app.category === category && app.enabled !== false);
}

/**
 * Get all categories with app counts
 */
export function getMiniAppCategories(): Array<{ category: string; count: number }> {
  const categoryCounts = new Map<string, number>();
  
  MINIAPP_REGISTRY.forEach(app => {
    if (app.enabled !== false && app.category) {
      categoryCounts.set(app.category, (categoryCounts.get(app.category) || 0) + 1);
    }
  });
  
  return Array.from(categoryCounts.entries()).map(([category, count]) => ({
    category,
    count,
  }));
}

// ================================
// VALIDATION
// ================================

/**
 * Validate registry on load (development only)
 */
if (process.env.NODE_ENV === 'development') {
  const ids = new Set<string>();
  let duplicateFound = false;
  
  MINIAPP_REGISTRY.forEach(app => {
    // Check for duplicate IDs
    if (ids.has(app.id)) {
      console.error(`[MiniApp Registry] Duplicate app ID: ${app.id}`);
      duplicateFound = true;
    }
    ids.add(app.id);
    
    // Validate internal apps have loaders
    if (app.type === 'internal' && !app.loader) {
      console.error(`[MiniApp Registry] Internal app ${app.id} missing loader`);
    }
    
    // Validate external apps have URLs
    if (app.type === 'external' && !app.url) {
      console.error(`[MiniApp Registry] External app ${app.id} missing URL`);
    }
  });
  
  if (!duplicateFound) {
    console.log(`[MiniApp Registry] Loaded ${MINIAPP_REGISTRY.length} miniapps (${getEnabledMiniApps().length} enabled)`);
  }
}
