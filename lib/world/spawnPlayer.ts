/**
 * Player Spawn System
 * Integrates character selection with world spawning
 */

import { loadCharacterSelection } from '@/lib/net/characterStorage';
import type { CharacterId } from '@/state/characterSelect/useCharacterSelectState';

export interface SpawnConfig {
  characterId: CharacterId;
  modelPath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  accentColor: string;
}

/**
 * Get spawn configuration based on selected character
 */
export async function getPlayerSpawnConfig(): Promise<SpawnConfig> {
  const characterId = await loadCharacterSelection();
  
  const modelPaths: Record<CharacterId, string> = {
    psx: '/models/psxModel.glb',
    miggles: '/models/migglesPlaceholder.glb',
  };
  
  const accentColors: Record<CharacterId, string> = {
    psx: '#00FF9A',
    miggles: '#F79625',
  };
  
  return {
    characterId,
    modelPath: modelPaths[characterId],
    position: [0, 0, 0], // Default spawn position
    rotation: [0, 0, 0],
    accentColor: accentColors[characterId],
  };
}

/**
 * Spawn player in world
 * Call this from your VoidGameShell or world initialization
 */
export async function spawnPlayerInWorld(worldScene: any) {
  const config = await getPlayerSpawnConfig();
  
  console.log('[SpawnPlayer] Spawning character:', config.characterId);
  console.log('[SpawnPlayer] Model:', config.modelPath);
  console.log('[SpawnPlayer] Accent:', config.accentColor);
  
  // Your existing spawn logic here
  // Example:
  // await worldScene.spawnPlayer({
  //   model: config.modelPath,
  //   position: config.position,
  //   rotation: config.rotation,
  // });
  
  // Apply HUD theme based on character
  applyHUDTheme(config.accentColor);
  
  return config;
}

/**
 * Apply HUD cosmetic theme based on character selection
 */
function applyHUDTheme(accentColor: string) {
  // Set CSS variables for HUD theming
  document.documentElement.style.setProperty('--hud-accent-color', accentColor);
  document.documentElement.style.setProperty('--hud-glow-color', `${accentColor}40`);
  
  console.log('[SpawnPlayer] Applied HUD theme:', accentColor);
}
