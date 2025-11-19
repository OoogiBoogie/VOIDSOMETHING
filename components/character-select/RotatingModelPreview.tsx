/**
 * Rotating Model Preview
 * 3D character model preview with rotation, glitch effects, and loading states
 */

'use client';

import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useCharacterSelectState, CHARACTERS, type CharacterId } from '@/state/characterSelect/useCharacterSelectState';

interface ModelProps {
  modelPath: string;
  accentColor: string;
  isGlitching: boolean;
  glitchIntensity: number;
}

function CharacterModel({ modelPath, accentColor, isGlitching, glitchIntensity }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  const setModelLoaded = useCharacterSelectState((s) => s.setModelLoaded);
  const setModelError = useCharacterSelectState((s) => s.setModelError);
  
  useEffect(() => {
    try {
      setModelLoaded(true);
      setModelError(null);
    } catch (error) {
      setModelError('Failed to load model');
      console.error('[ModelPreview] Load error:', error);
    }
  }, [modelPath, setModelLoaded, setModelError]);
  
  // Slow rotation
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Base rotation
      groupRef.current.rotation.y = t * 0.2;
      
      // Glitch effect
      if (isGlitching) {
        const glitch = Math.sin(t * 50) * glitchIntensity * 0.1;
        groupRef.current.position.x = glitch;
        groupRef.current.position.z = glitch * 0.5;
        groupRef.current.rotation.y += glitch;
      } else {
        // Smooth return to center
        groupRef.current.position.x *= 0.9;
        groupRef.current.position.z *= 0.9;
      }
    }
  });
  
  // Apply accent color to materials
  useEffect(() => {
    const color = new THREE.Color(accentColor);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // Clone material to avoid modifying original
          const material = child.material.clone();
          material.emissive = color;
          material.emissiveIntensity = 0.3;
          child.material = material;
        }
      }
    });
  }, [scene, accentColor]);
  
  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.5} />
    </group>
  );
}

function PlaceholderModel({ accentColor, isGlitching, glitchIntensity }: Omit<ModelProps, 'modelPath'>) {
  const meshRef = useRef<THREE.Mesh>(null);
  const setModelLoaded = useCharacterSelectState((s) => s.setModelLoaded);
  
  useEffect(() => {
    setModelLoaded(true);
  }, [setModelLoaded]);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.2;
      
      if (isGlitching) {
        const glitch = Math.sin(t * 50) * glitchIntensity * 0.1;
        meshRef.current.position.x = glitch;
        meshRef.current.scale.setScalar(1 + glitch * 0.2);
      } else {
        meshRef.current.position.x *= 0.9;
        meshRef.current.scale.setScalar(meshRef.current.scale.x * 0.95 + 1 * 0.05);
      }
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial
        color={accentColor}
        emissive={accentColor}
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

function ModelScene({ characterId }: { characterId: CharacterId }) {
  const character = CHARACTERS[characterId];
  const { isGlitching, glitchIntensity } = useCharacterSelectState();
  
  // Use placeholder for Miggles (no model yet)
  const usePlaceholder = characterId === 'miggles';
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        autoRotate={false}
      />
      
      <ambientLight intensity={0.3} />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
        color={character.accentColor}
      />
      <spotLight
        position={[-5, 3, -5]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#ffffff"
      />
      
      {usePlaceholder ? (
        <PlaceholderModel
          accentColor={character.accentColor}
          isGlitching={isGlitching}
          glitchIntensity={glitchIntensity}
        />
      ) : (
        <CharacterModel
          modelPath={character.modelPath}
          accentColor={character.accentColor}
          isGlitching={isGlitching}
          glitchIntensity={glitchIntensity}
        />
      )}
      
      <Environment preset="city" />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-[#00FF9A] font-mono text-sm animate-pulse">
        [LOADING MODEL...]
      </div>
    </div>
  );
}

interface RotatingModelPreviewProps {
  characterId: CharacterId;
  className?: string;
}

export default function RotatingModelPreview({ characterId, className = '' }: RotatingModelPreviewProps) {
  const { modelError, isLoadingModel } = useCharacterSelectState();
  
  return (
    <div className={`relative ${className}`}>
      {/* CRT scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)]" />
      
      {/* Glitch overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-[scan_8s_linear_infinite]" />
      
      {/* Canvas */}
      <div className="w-full h-full bg-black/50 rounded-lg border border-cyan-500/30">
        {modelError ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-red-500 font-mono text-sm">
              [ERROR: {modelError}]
            </div>
          </div>
        ) : (
          <Canvas shadows>
            <Suspense fallback={<LoadingFallback />}>
              <ModelScene characterId={characterId} />
            </Suspense>
          </Canvas>
        )}
      </div>
      
      {/* Loading indicator */}
      {isLoadingModel && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black/80 border border-[#00FF9A] px-4 py-2 rounded font-mono text-xs text-[#00FF9A] animate-pulse">
            INITIALIZING...
          </div>
        </div>
      )}
    </div>
  );
}

// Preload models
useGLTF.preload('/models/psxModel.glb');
useGLTF.preload('/models/migglesPlaceholder.glb');
