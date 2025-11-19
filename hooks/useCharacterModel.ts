/**
 * Character Model Hook
 * Loads the correct character model in the 3D world based on selection
 */

import { useEffect, useState } from 'react';
import { loadCharacterSelection } from '@/lib/net/characterStorage';
import { CHARACTERS, type CharacterId } from '@/state/characterSelect/useCharacterSelectState';

export interface CharacterModelData {
  characterId: CharacterId;
  modelPath: string;
  accentColor: string;
  name: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Load character model based on Net Protocol selection
 */
export function useCharacterModel(): CharacterModelData {
  const [characterId, setCharacterId] = useState<CharacterId>('psx');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadCharacterSelection()
      .then((selected) => {
        setCharacterId(selected);
        setIsLoading(false);
        console.log('[useCharacterModel] Loaded character:', selected);
      })
      .catch((err) => {
        console.error('[useCharacterModel] Failed to load:', err);
        setError('Failed to load character');
        setCharacterId('psx'); // Fallback to default
        setIsLoading(false);
      });
  }, []);
  
  const character = CHARACTERS[characterId];
  
  return {
    characterId,
    modelPath: character.modelPath,
    accentColor: character.accentColor,
    name: character.name,
    isLoading,
    error,
  };
}

/**
 * Get HUD accent color based on character selection
 */
export function useHUDAccentColor(): string {
  const { accentColor, isLoading } = useCharacterModel();
  
  // Default to PSX green while loading
  return isLoading ? '#00FF9A' : accentColor;
}
