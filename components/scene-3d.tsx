"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { CybercityWorld } from "./3d/CybercityWorld"
import { PlayerCharacter3D } from "./player-character-3d"
import { GridOverlay } from "./grid-overlay"
import { DistrictBoundaries } from "./district-boundaries"
import { getDistrictAt } from "@/lib/districts"
import { ZONES, type GameZone } from "@/lib/zones"

interface Scene3DProps {
  playerPosition: { x: number; y: number; z: number }
  onPlayerMove: (pos: { x: number; y: number; z: number }) => void
  onZoneEnter: (zone: any) => void
  onZoneExit: () => void
  onZoneInteract?: (zone: any) => void
  controlsEnabled?: boolean
  onCameraAngleChange?: (angle: "close" | "medium" | "far") => void
  mobileMovement?: { x: number; z: number } // Fixed type from boolean to object
  mobileSprinting?: boolean
  isMobile?: boolean // Added device type flag
}

export function Scene3D({
  playerPosition,
  onPlayerMove,
  onZoneEnter,
  onZoneExit,
  onZoneInteract,
  controlsEnabled = true,
  onCameraAngleChange,
  mobileMovement,
  mobileSprinting,
  isMobile = false, // Added with default false
}: Scene3DProps) {
  const { camera, scene } = useThree()
  const lastZoneId = useRef<string | null>(null)
  const currentZoneRef = useRef<any | null>(null)

  const [currentDistrictId, setCurrentDistrictId] = useState<string | null>(null)
  const rotationYRef = useRef(0)

  useEffect(() => {
    camera.near = 0.1
    camera.far = 500
    camera.fov = 65
    camera.updateProjectionMatrix()

    scene.background = new THREE.Color(0x030712)
  }, [camera, scene])

  useEffect(() => {
    if (isMobile) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === "e" && currentZoneRef.current && onZoneInteract) {
        onZoneInteract(currentZoneRef.current)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobile, onZoneInteract]) // Added isMobile dependency

  useFrame(() => {
    // District detection
    const district = getDistrictAt(playerPosition.x, playerPosition.z)

    if (district) {
      if (district.id !== currentDistrictId) {
        setCurrentDistrictId(district.id)
      }
    } else {
      if (currentDistrictId) {
        setCurrentDistrictId(null)
      }
    }

    // Zone detection
    let activeZone: GameZone | null = null
    for (const zone of ZONES) {
      const dx = playerPosition.x - zone.position.x
      const dz = playerPosition.z - zone.position.z
      const distSq = dx * dx + dz * dz

      const detectionRadius = zone.radius + 2
      if (distSq <= detectionRadius * detectionRadius) {
        activeZone = zone
        break
      }
    }

    if (activeZone && activeZone.id !== lastZoneId.current) {
      lastZoneId.current = activeZone.id
      currentZoneRef.current = activeZone
      onZoneEnter(activeZone)
    } else if (!activeZone && lastZoneId.current) {
      lastZoneId.current = null
      currentZoneRef.current = null
      onZoneExit()
    }
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[24, 26, 14]} intensity={1.8} color="#7FA7FF" castShadow={false} />

      <GridOverlay size={200} divisions={40} />

      <DistrictBoundaries highlightedDistrictId={currentDistrictId} />

      <CybercityWorld selectedParcelId={null} />

      <PlayerCharacter3D
        position={playerPosition}
        onMove={onPlayerMove}
        onRotationChange={(ry) => {
          rotationYRef.current = ry
        }}
        onCameraAngleChange={onCameraAngleChange}
        controlsEnabled={controlsEnabled}
        mobileMovement={mobileMovement} // Now passing object correctly
        mobileSprinting={mobileSprinting}
        isMobile={isMobile} // Pass device type to character
      />

      <fog attach="fog" args={["#030712", 16, 90]} />
    </>
  )
}
