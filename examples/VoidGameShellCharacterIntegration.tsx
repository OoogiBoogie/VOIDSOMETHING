/**
 * EXAMPLE: VoidGameShell Integration with Character Select
 * Shows how to integrate character spawning with the new character select system
 */

'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { spawnPlayerInWorld } from '@/lib/world/spawnPlayer';
import PlayerCharacter from '@/components/3d/PlayerCharacter';
import type { CharacterId } from '@/state/characterSelect/useCharacterSelectState';

export default function VoidGameShellExample() {
  const [spawnConfig, setSpawnConfig] = useState<{
    characterId: CharacterId;
    position: [number, number, number];
  } | null>(null);
  
  useEffect(() => {
    // Initialize world and spawn player
    async function initWorld() {
      console.log('[VoidGameShell] Initializing world...');
      
      // Get spawn configuration from character selection
      const config = await spawnPlayerInWorld(null); // Pass your world scene
      
      setSpawnConfig({
        characterId: config.characterId,
        position: config.position,
      });
      
      console.log('[VoidGameShell] Spawned character:', config.characterId);
      console.log('[VoidGameShell] Using accent:', config.accentColor);
    }
    
    initWorld();
  }, []);
  
  if (!spawnConfig) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-[#00FF9A] font-mono text-xl animate-pulse">
          [LOADING VOID...]
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0">
      <Canvas>
        {/* Spawn the selected character model */}
        <PlayerCharacter
          position={spawnConfig.position}
          rotation={[0, 0, 0]}
          scale={1}
        />
        
        {/* Rest of your world */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </Canvas>
      
      {/* HUD will use the accent color via CSS variables */}
      <div 
        className="absolute top-4 left-4 p-4 rounded border"
        style={{
          borderColor: 'var(--hud-accent-color, #00FF9A)',
          boxShadow: `0 0 20px var(--hud-glow-color, rgba(0,255,154,0.3))`,
        }}
      >
        <div className="text-white font-mono text-sm">
          Character: {spawnConfig.characterId.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
