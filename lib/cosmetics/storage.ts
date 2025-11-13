/**
 * @title Phase 2 Cosmetic Storage
 * @notice Local storage wrapper for cosmetic loadouts
 * @dev TEMPLATE - DO NOT USE UNTIL PHASE 2 UNLOCK (Day 1)
 * 
 * Status: LOCKED 🔒
 * Unlock: After Phase 1 validated stable (24h)
 * 
 * Phase 1 (MVP): Local storage only
 * Phase 2 (Later): Migrate to on-chain CosmeticLoadout contract
 */

import { CosmeticLoadout, CosmeticSlot, CosmeticItem } from './types';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  LOADOUT: 'void_cosmetic_loadout',
  VERSION: 'void_cosmetic_version',
  LAST_SYNC: 'void_cosmetic_last_sync'
} as const;

// Current storage version (for migration compatibility)
const CURRENT_VERSION = 1;

// ============================================================================
// COSMETIC LOADOUT STORAGE
// ============================================================================

export class CosmeticLoadoutStorage {
  /**
   * Save user's cosmetic loadout to local storage
   */
  static save(loadout: CosmeticLoadout): void {
    try {
      const data = {
        version: CURRENT_VERSION,
        loadout,
        savedAt: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.LOADOUT, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
      
      console.log('✅ Cosmetic loadout saved', {
        userId: loadout.userId,
        slotCount: Object.keys(loadout.slots).length,
        timestamp: new Date(loadout.lastUpdated).toISOString()
      });
    } catch (error) {
      console.error('❌ Failed to save cosmetic loadout', error);
      throw new Error('Could not save cosmetic loadout to local storage');
    }
  }
  
  /**
   * Load user's cosmetic loadout from local storage
   */
  static load(userId: string): CosmeticLoadout | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOADOUT);
      
      if (!raw) {
        console.log('ℹ️  No saved cosmetic loadout found');
        return null;
      }
      
      const data = JSON.parse(raw);
      
      // Version check
      if (data.version !== CURRENT_VERSION) {
        console.warn('⚠️  Cosmetic loadout version mismatch, migrating...', {
          saved: data.version,
          current: CURRENT_VERSION
        });
        return this.migrate(data, userId);
      }
      
      // User ID check
      if (data.loadout.userId !== userId) {
        console.warn('⚠️  Cosmetic loadout user mismatch', {
          saved: data.loadout.userId,
          current: userId
        });
        return null;
      }
      
      console.log('✅ Cosmetic loadout loaded', {
        userId: data.loadout.userId,
        slotCount: Object.keys(data.loadout.slots).length,
        age: Math.floor((Date.now() - data.savedAt) / 1000 / 60) + ' minutes'
      });
      
      return data.loadout;
    } catch (error) {
      console.error('❌ Failed to load cosmetic loadout', error);
      return null;
    }
  }
  
  /**
   * Clear user's cosmetic loadout (unequip all)
   */
  static clear(userId: string): void {
    try {
      const emptyLoadout: CosmeticLoadout = {
        userId,
        slots: {},
        lastUpdated: Date.now(),
        version: 1
      };
      
      this.save(emptyLoadout);
      console.log('✅ Cosmetic loadout cleared');
    } catch (error) {
      console.error('❌ Failed to clear cosmetic loadout', error);
    }
  }
  
  /**
   * Equip cosmetic to slot
   */
  static equip(userId: string, slot: CosmeticSlot, cosmetic: CosmeticItem): void {
    try {
      let loadout = this.load(userId);
      
      if (!loadout) {
        // Create new loadout
        loadout = {
          userId,
          slots: {},
          lastUpdated: Date.now(),
          version: 1
        };
      }
      
      // Equip cosmetic
      loadout.slots[slot] = cosmetic;
      loadout.lastUpdated = Date.now();
      loadout.version++;
      
      this.save(loadout);
      
      console.log('✅ Cosmetic equipped', {
        slot,
        skuId: cosmetic.skuId,
        name: cosmetic.name
      });
    } catch (error) {
      console.error('❌ Failed to equip cosmetic', error);
      throw error;
    }
  }
  
  /**
   * Unequip cosmetic from slot
   */
  static unequip(userId: string, slot: CosmeticSlot): void {
    try {
      const loadout = this.load(userId);
      
      if (!loadout) {
        console.warn('⚠️  No loadout to unequip from');
        return;
      }
      
      // Remove cosmetic from slot
      delete loadout.slots[slot];
      loadout.lastUpdated = Date.now();
      loadout.version++;
      
      this.save(loadout);
      
      console.log('✅ Cosmetic unequipped', { slot });
    } catch (error) {
      console.error('❌ Failed to unequip cosmetic', error);
      throw error;
    }
  }
  
  /**
   * Get specific equipped cosmetic
   */
  static getEquipped(userId: string, slot: CosmeticSlot): CosmeticItem | null {
    const loadout = this.load(userId);
    return loadout?.slots[slot] || null;
  }
  
  /**
   * Get all equipped cosmetics
   */
  static getAllEquipped(userId: string): Partial<Record<CosmeticSlot, CosmeticItem | null>> {
    const loadout = this.load(userId);
    return loadout?.slots || {};
  }
  
  /**
   * Check if slot has cosmetic equipped
   */
  static isSlotEquipped(userId: string, slot: CosmeticSlot): boolean {
    const loadout = this.load(userId);
    return !!loadout?.slots[slot];
  }
  
  /**
   * Get last sync timestamp
   */
  static getLastSync(): number | null {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return raw ? parseInt(raw, 10) : null;
  }
  
  /**
   * Migrate loadout from old version
   */
  private static migrate(data: any, userId: string): CosmeticLoadout | null {
    console.log('🔄 Migrating cosmetic loadout...');
    
    try {
      // For now, just reset to empty loadout
      // In future, add version-specific migration logic
      const newLoadout: CosmeticLoadout = {
        userId,
        slots: {},
        lastUpdated: Date.now(),
        version: 1
      };
      
      this.save(newLoadout);
      console.log('✅ Migration complete');
      
      return newLoadout;
    } catch (error) {
      console.error('❌ Migration failed', error);
      return null;
    }
  }
  
  /**
   * Export loadout as JSON (for backup)
   */
  static export(userId: string): string | null {
    const loadout = this.load(userId);
    
    if (!loadout) {
      return null;
    }
    
    return JSON.stringify({
      version: CURRENT_VERSION,
      loadout,
      exportedAt: Date.now()
    }, null, 2);
  }
  
  /**
   * Import loadout from JSON (restore from backup)
   */
  static import(userId: string, json: string): boolean {
    try {
      const data = JSON.parse(json);
      
      if (!data.loadout || data.loadout.userId !== userId) {
        console.error('❌ Import failed: User ID mismatch');
        return false;
      }
      
      // Update timestamp and version
      data.loadout.lastUpdated = Date.now();
      data.loadout.version++;
      
      this.save(data.loadout);
      console.log('✅ Cosmetic loadout imported');
      
      return true;
    } catch (error) {
      console.error('❌ Import failed', error);
      return false;
    }
  }
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Check if local storage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage stats
 */
export function getStorageStats(): {
  used: number;
  available: number;
  percentage: number;
} | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Most browsers: 5-10MB limit
    const available = 10 * 1024 * 1024; // 10MB estimate
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  } catch {
    return null;
  }
}

/**
 * Clear all VOID cosmetic data (dangerous!)
 */
export function clearAllCosmeticData(): void {
  console.warn('⚠️  Clearing ALL cosmetic data...');
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ All cosmetic data cleared');
}

// ============================================================================
// Default export and constants already exported inline above
// ============================================================================

export default CosmeticLoadoutStorage;
