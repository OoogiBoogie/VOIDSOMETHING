/**
 * Net Protocol Character Storage
 * Handles saving/loading character selection to Net Protocol
 */

import type { CharacterId } from '@/state/characterSelect/useCharacterSelectState';

const STORAGE_KEY = 'void.characterSelected';
const DEFAULT_CHARACTER: CharacterId = 'psx';

interface NetProtocol {
  storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    remove(key: string): Promise<void>;
  };
}

/**
 * Get Net Protocol instance (browser or server)
 */
function getNetProtocol(): NetProtocol | undefined {
  if (typeof window !== 'undefined') {
    return (window as any).np;
  }
  return undefined;
}

/**
 * Save character selection to Net Protocol Storage
 */
export async function saveCharacterSelection(characterId: CharacterId): Promise<void> {
  try {
    const netProtocol = getNetProtocol();
    if (netProtocol?.storage) {
      await netProtocol.storage.set(STORAGE_KEY, characterId);
      console.log('[CharacterStorage] Saved character:', characterId);
    } else {
      // Fallback to localStorage for development
      localStorage.setItem(STORAGE_KEY, characterId);
      console.warn('[CharacterStorage] Net Protocol unavailable, using localStorage');
    }
  } catch (error) {
    console.error('[CharacterStorage] Failed to save character:', error);
    // Fallback to localStorage
    localStorage.setItem(STORAGE_KEY, characterId);
  }
}

/**
 * Load character selection from Net Protocol Storage
 */
export async function loadCharacterSelection(): Promise<CharacterId> {
  try {
    const netProtocol = getNetProtocol();
    if (netProtocol?.storage) {
      const stored = await netProtocol.storage.get(STORAGE_KEY);
      if (stored === 'psx' || stored === 'miggles') {
        console.log('[CharacterStorage] Loaded character:', stored);
        return stored;
      }
    } else {
      // Fallback to localStorage for development
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'psx' || stored === 'miggles') {
        console.warn('[CharacterStorage] Net Protocol unavailable, using localStorage');
        return stored as CharacterId;
      }
    }
  } catch (error) {
    console.error('[CharacterStorage] Failed to load character:', error);
    // Try localStorage fallback
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'psx' || stored === 'miggles') {
      return stored as CharacterId;
    }
  }
  
  // Return default if nothing stored or error
  console.log('[CharacterStorage] Using default character:', DEFAULT_CHARACTER);
  return DEFAULT_CHARACTER;
}

/**
 * Clear character selection (for testing/reset)
 */
export async function clearCharacterSelection(): Promise<void> {
  try {
    const netProtocol = getNetProtocol();
    if (netProtocol?.storage) {
      await netProtocol.storage.remove(STORAGE_KEY);
    }
    localStorage.removeItem(STORAGE_KEY);
    console.log('[CharacterStorage] Cleared character selection');
  } catch (error) {
    console.error('[CharacterStorage] Failed to clear character:', error);
  }
}

/**
 * Check if character has been selected before
 */
export async function hasSelectedCharacter(): Promise<boolean> {
  try {
    const netProtocol = getNetProtocol();
    if (netProtocol?.storage) {
      const stored = await netProtocol.storage.get(STORAGE_KEY);
      return stored === 'psx' || stored === 'miggles';
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'psx' || stored === 'miggles';
  } catch (error) {
    return false;
  }
}
