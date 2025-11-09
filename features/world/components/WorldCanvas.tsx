/**
 * World Canvas - 3D scene container
 * Uses React Three Fiber (no Babylon.js)
 */

"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { WorldScene } from "./WorldScene";

export function WorldCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 3, 8], fov: 50 }}
      gl={{ 
        antialias: true,
        alpha: true,
      }}
      shadows
      className="w-full h-full"
    >
      <Suspense fallback={null}>
        <WorldScene />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={3}
          maxDistance={20}
        />
      </Suspense>
    </Canvas>
  );
}
