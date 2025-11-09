/**
 * Glowing Letters - 3D text with emissive glow and pulsing animation
 * Uses React Three Fiber, no Babylon.js
 */

"use client";

import { Text3D, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { useAudio } from "../../audio/AudioProvider";
import { AudioEvents } from "../../audio/audioEvents";

interface GlowingLettersProps {
  text: string;
  position?: [number, number, number];
  color?: string;
  emissiveColor?: string;
  size?: number;
  pulseSpeed?: number;
  onClick?: () => void;
}

export function GlowingLetters({ 
  text,
  position = [0, 1.5, 0],
  color = "#5cf0ff",
  emissiveColor = "#5cf0ff",
  size = 1,
  pulseSpeed = 2.0,
  onClick,
}: GlowingLettersProps) {
  const materialRef = useRef<MeshStandardMaterial | null>(null);
  const { play } = useAudio();

  const materialProps = useMemo(
    () => ({
      color,
      emissive: emissiveColor,
      emissiveIntensity: 2.2,
      metalness: 0.5,
      roughness: 0.2,
    }),
    [color, emissiveColor]
  );

  // Pulsing animation
  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.getElapsedTime();
      const baseIntensity = 1.8;
      const pulse = 0.5 + Math.sin(t * pulseSpeed) * 0.4;
      materialRef.current.emissiveIntensity = baseIntensity + pulse * 0.5;
    }
  });

  const handlePointerDown = () => {
    play(AudioEvents.WORLD_LETTER_PULSE);
    onClick?.();
  };

  const handlePointerEnter = () => {
    play(AudioEvents.UI_HOVER);
    document.body.style.cursor = "pointer";
  };

  const handlePointerLeave = () => {
    document.body.style.cursor = "default";
  };

  return (
    <group 
      position={position}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Center>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={size}
          height={0.35}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.02}
          bevelSegments={5}
        >
          {text}
          <meshStandardMaterial
            ref={materialRef}
            {...materialProps}
          />
        </Text3D>
      </Center>
    </group>
  );
}
