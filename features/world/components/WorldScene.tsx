/**
 * World Scene - Main 3D environment
 * Uses React Three Fiber (no Babylon.js)
 */

"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { GlowingLetters } from "./GlowingLetters";

export function WorldScene() {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, 3, 0]} intensity={2.5} color="#5cf0ff" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={1.5}
        castShadow
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#050509" 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>

      {/* Glowing logo/letters */}
      <GlowingLetters 
        text="VOID" 
        position={[0, 1.5, 0]}
        color="#ff0032"
        emissiveColor="#ff0032"
        size={1.2}
      />

      <GlowingLetters 
        text="PSX" 
        position={[0, 0.5, 2]}
        color="#5cf0ff"
        emissiveColor="#5cf0ff"
        size={0.8}
      />

      {/* Bloom post-processing for glow */}
      <EffectComposer>
        <Bloom
          intensity={1.5}       
          luminanceThreshold={0.2}
          luminanceSmoothing={0.1}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
