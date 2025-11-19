/**
 * Player Character Component
 * Dynamically loads the correct character model based on selection
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useCharacterModel } from '@/hooks/useCharacterModel';

interface PlayerCharacterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

function LoadedCharacterModel({ modelPath, accentColor, ...props }: PlayerCharacterProps & { modelPath: string; accentColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  
  // Apply accent color to materials
  useEffect(() => {
    const color = new THREE.Color(accentColor);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const material = child.material.clone();
          material.emissive = color;
          material.emissiveIntensity = 0.2;
          child.material = material;
        }
      }
    });
  }, [scene, accentColor]);
  
  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}

function PlaceholderCharacter({ accentColor, ...props }: PlayerCharacterProps & { accentColor: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Idle animation
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });
  
  return (
    <group {...props}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>
    </group>
  );
}

export default function PlayerCharacter(props: PlayerCharacterProps) {
  const { characterId, modelPath, accentColor, isLoading, error } = useCharacterModel();
  
  if (isLoading) {
    return (
      <PlaceholderCharacter
        accentColor="#00FF9A"
        {...props}
      />
    );
  }
  
  if (error) {
    console.error('[PlayerCharacter] Error:', error);
    return (
      <PlaceholderCharacter
        accentColor="#FF0000"
        {...props}
      />
    );
  }
  
  // Use placeholder for Miggles (no model yet)
  if (characterId === 'miggles') {
    return (
      <PlaceholderCharacter
        accentColor={accentColor}
        {...props}
      />
    );
  }
  
  return (
    <LoadedCharacterModel
      modelPath={modelPath}
      accentColor={accentColor}
      {...props}
    />
  );
}

// Preload models
useGLTF.preload('/models/psxModel.glb');
useGLTF.preload('/models/migglesPlaceholder.glb');
