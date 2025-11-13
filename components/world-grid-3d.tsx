"use client"

import { Suspense, useMemo } from "react"
import * as THREE from "three"
import { BUILDINGS, ROADS } from "@/lib/city-assets"
import { ALL_DISTRICTS } from "@/lib/parcels"
import { ModelBuilding } from "./model-building"
import { DistrictBoundaries } from "./district-boundaries"
import { PSXHQBuilding } from "./psx-hq-building"
import { GlizzyWorldCasino } from "./glizzy-world-casino"
import { CreatorHubBuilding } from "./creator-hub-building"
import { SignalsPlaza } from "./signals-plaza"
import { DeFiDistrictTower } from "./defi-district-tower"
import { SocialDistrictPlaza } from "./social-district-plaza"

interface WorldGrid3DProps {
  zones: any[]
}

function ConcreteGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[4000, 4000]} />
      <meshStandardMaterial color="#0f0f1a" roughness={0.8} metalness={0.3} />
    </mesh>
  )
}

function GrassPatch({ x, z, width, depth }: { x: number; z: number; width: number; depth: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[x, 0.01, z]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#0d3d2d" roughness={0.9} metalness={0.2} />
    </mesh>
  )
}

function RoadWithSidewalk({
  from,
  to,
  width,
}: { from: [number, number, number]; to: [number, number, number]; width: number }) {
  const a = new THREE.Vector3(...from)
  const b = new THREE.Vector3(...to)
  const length = a.distanceTo(b)
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const angle = Math.atan2(b.x - a.x, b.z - a.z)

  return (
    <group position={[mid.x, 0, mid.z]} rotation={[0, angle, 0]}>
      {/* Chrome metallic sidewalks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.02, -(width / 2 + 1.5)]}>
        <planeGeometry args={[length, 3]} />
        <meshStandardMaterial color="#5a6d7a" roughness={0.7} metalness={0.5} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.02, width / 2 + 1.5]}>
        <planeGeometry args={[length, 3]} />
        <meshStandardMaterial color="#5a6d7a" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Asphalt road with metallic finish */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.03, 0]}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Neon center line with glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[length, 0.2]} />
        <meshStandardMaterial color="#06FFA5" emissive="#06FFA5" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

function MountainRange() {
  const mountains = useMemo(() => {
    const positions: { x: number; z: number; height: number; width: number }[] = []
    // North mountains
    for (let i = -8; i <= 8; i++) {
      positions.push({
        x: i * 40 + (Math.random() - 0.5) * 15,
        z: -200,
        height: 45 + Math.random() * 30,
        width: 35 + Math.random() * 15,
      })
    }
    // South mountains
    for (let i = -8; i <= 8; i++) {
      positions.push({
        x: i * 40 + (Math.random() - 0.5) * 15,
        z: 200,
        height: 40 + Math.random() * 35,
        width: 32 + Math.random() * 18,
      })
    }
    // East mountains
    for (let i = -3; i <= 3; i++) {
      positions.push({
        x: 240,
        z: i * 50 + (Math.random() - 0.5) * 20,
        height: 38 + Math.random() * 28,
        width: 30 + Math.random() * 12,
      })
    }
    // West mountains
    for (let i = -3; i <= 3; i++) {
      positions.push({
        x: -240,
        z: i * 50 + (Math.random() - 0.5) * 20,
        height: 38 + Math.random() * 28,
        width: 30 + Math.random() * 12,
      })
    }
    return positions
  }, [])

  return (
    <>
      {mountains.map((mountain, i) => (
        <mesh key={i} position={[mountain.x, mountain.height / 2, mountain.z]}>
          <coneGeometry args={[mountain.width, mountain.height, 6]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0.85}
            metalness={0.3}
            emissive="#2a2a4e"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </>
  )
}

function FillerBuildings() {
  const buildings = useMemo(() => {
    const positions: { x: number; z: number; height: number; width: number; depth: number }[] = []
    // Create denser grid of distant buildings
    for (let x = -160; x <= 160; x += 20) {
      for (let z = -120; z <= 120; z += 20) {
        // Skip center area where main buildings and player areas are
        if (Math.abs(x) < 90 && Math.abs(z) < 60) continue
        positions.push({
          x: x + (Math.random() - 0.5) * 8,
          z: z + (Math.random() - 0.5) * 8,
          height: 6 + Math.random() * 18,
          width: 6 + Math.random() * 6,
          depth: 6 + Math.random() * 6,
        })
      }
    }
    return positions
  }, [])

  return (
    <>
      {buildings.map((building, i) => (
        <mesh key={i} position={[building.x, building.height / 2, building.z]}>
          <boxGeometry args={[building.width, building.height, building.depth]} />
          <meshStandardMaterial
            color="#0f0f1a"
            roughness={0.7}
            metalness={0.4}
            emissive="#2a3a5a"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </>
  )
}

function BuildingBox({
  x,
  z,
  width,
  depth,
  height,
}: {
  x: number
  z: number
  width: number
  depth: number
  height: number
}) {
  return (
    <mesh position={[x, height / 2, z]} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color="#020617"
        roughness={0.7}
        metalness={0.25}
        emissive="#22D3EE"
        emissiveIntensity={0.4}
      />
    </mesh>
  )
}

export function WorldGrid3D({ zones }: WorldGrid3DProps) {
  const grassPatches = useMemo(
    () => [
      { x: -45, z: -35, width: 25, depth: 20 },
      { x: 48, z: -28, width: 22, depth: 18 },
      { x: -52, z: 40, width: 20, depth: 25 },
      { x: 55, z: 45, width: 18, depth: 22 },
      { x: -70, z: 10, width: 15, depth: 18 },
      { x: 70, z: -45, width: 20, depth: 16 },
      { x: -30, z: -60, width: 18, depth: 20 },
      { x: 35, z: 55, width: 22, depth: 19 },
      { x: 0, z: 70, width: 16, depth: 15 },
      { x: -60, z: -70, width: 17, depth: 21 },
    ],
    [],
  )

  return (
    <group>
      <ConcreteGround />

      <DistrictBoundaries />

      <PSXHQBuilding />
      <GlizzyWorldCasino />
      <CreatorHubBuilding />
      <SignalsPlaza />
      <DeFiDistrictTower />
      <SocialDistrictPlaza />

      {grassPatches.map((patch, i) => (
        <GrassPatch key={i} {...patch} />
      ))}

      {ROADS.map((r) => (
        <RoadWithSidewalk key={r.id} from={r.from} to={r.to} width={r.width} />
      ))}

      <MountainRange />

      <FillerBuildings />

      {/* Main buildings */}
      {BUILDINGS.map((b) =>
        b.modelPath ? (
          <Suspense key={b.id} fallback={<BuildingBox {...b} />}>
            <ModelBuilding modelPath={b.modelPath} x={b.x} z={b.z} height={b.height} />
          </Suspense>
        ) : (
          <BuildingBox key={b.id} {...b} />
        ),
      )}

      {/* Zone markers */}
      {zones.map((zone) => (
        <group key={zone.id} position={[zone.position.x, 0.05, zone.position.z]}>
          {/* Main neon pad base */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[zone.radius, 32]} />
            <meshStandardMaterial
              color="#020617"
              emissive={zone.color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.35} // Reduced opacity from 0.4 to 0.35 for subtler base
            />
          </mesh>

          {/* Inner glow ring - made thinner and brighter */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[zone.radius * 0.65, zone.radius * 0.85, 32]} />
            <meshStandardMaterial
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={1.2}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Outer ring pulse - adjusted proportions for smaller pads */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[zone.radius * 0.88, zone.radius * 0.98, 32]} />
            <meshStandardMaterial
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
