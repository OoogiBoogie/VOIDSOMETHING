"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useParcelsPage } from "@/lib/land/hooks"
import { Parcel, ParcelStatus, LicenseType } from "@/lib/land/types"
import { landRegistryAPI } from "@/lib/land/registry-api"
import { isFounderPlot } from "@/lib/land/tier-calculator"
import { Text } from "@react-three/drei"
import { BuildingDetailPanel } from "@/components/land/building-detail-panel"
import { useSelectionState } from "@/state/selection/useSelectionState"
import { getDistrictFromWorld } from "@/world/map/mapUtils"
import { parcelToCityWorld } from "@/lib/city-assets"

const PARCEL_SIZE = 40; // 40 world units per parcel
const PARCEL_SPACING = 16; // 16 unit spacing between parcels

export function CybercityWorld({ selectedParcelId }: { selectedParcelId?: string }) {
  const [clickedParcel, setClickedParcel] = useState<Parcel | null>(null)
  const setActiveBuilding = useSelectionState((s) => s.setActiveBuilding)
  
  // Load parcels from new land system (500 at a time)
  const { parcels, isLoading } = useParcelsPage(1, 500);

  const handleParcelClick = (parcel: Parcel) => {
    // Keep existing behavior
    setClickedParcel(parcel)
    
    // Wire to selection store
    const worldPos = landRegistryAPI.getWorldPosition(parcel.parcelId);
    const districtDef = getDistrictFromWorld(worldPos.x, worldPos.z);
    const districtId = districtDef?.id ?? null;
    
    // Set active building (using parcel ID as building ID for now)
    setActiveBuilding(
      `parcel-${parcel.parcelId}`,
      parcel.parcelId,
      districtId
    );
    
    console.log(`[CybercityWorld] Selected parcel ${parcel.parcelId} in district ${districtId}`);
  };

  if (isLoading) {
    return (
      <group>
        <Text position={[0, 10, 0]} fontSize={5} color="#00ffff">
          Loading Parcels...
        </Text>
      </group>
    );
  }

  return (
    <>
      <group>
        {/* Dusk HDRI Sky */}
        <DuskSky />

        {/* Render all parcels */}
        {parcels.map((parcel) => {
          const isSelected = selectedParcelId === `parcel-${parcel.parcelId}`;
          return (
            <ParcelBuilding 
              key={parcel.parcelId} 
              parcel={parcel} 
              isSelected={isSelected} 
              onClick={() => handleParcelClick(parcel)}
            />
          )
        })}

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[5000, 5000]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
        </mesh>

        {/* Street Grid - Simple grid aligned with 40x40 parcels */}
        <StreetGrid />
      </group>
      
      {/* Building Detail Panel (2D UI Overlay) */}
      <BuildingDetailPanel 
        parcel={clickedParcel} 
        onClose={() => setClickedParcel(null)} 
      />
    </>
  )
}

// Simple Street Grid Component
function StreetGrid() {
  const GRID_SIZE = 40; // 40x40 parcels
  const STREET_WIDTH = 8; // 8 unit wide streets
  const STREET_SPACING = 5; // Street every 5 parcels (creates 5x5 blocks)
  
  const streets = [];
  
  // Create horizontal streets (running along X axis)
  for (let z = -GRID_SIZE / 2; z <= GRID_SIZE / 2; z += STREET_SPACING) {
    const worldZ = z * PARCEL_SIZE;
    streets.push(
      <mesh 
        key={`street-h-${z}`} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, worldZ]}
        receiveShadow
      >
        <planeGeometry args={[GRID_SIZE * PARCEL_SIZE, STREET_WIDTH]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          roughness={0.4} 
          metalness={0.3} 
        />
      </mesh>
    );
    
    // Add subtle center line
    streets.push(
      <mesh 
        key={`line-h-${z}`} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, worldZ]}
      >
        <planeGeometry args={[GRID_SIZE * PARCEL_SIZE, 0.3]} />
        <meshStandardMaterial 
          color="#ffeb3b" 
          emissive="#ffeb3b" 
          emissiveIntensity={0.5} 
        />
      </mesh>
    );
  }
  
  // Create vertical streets (running along Z axis)
  for (let x = -GRID_SIZE / 2; x <= GRID_SIZE / 2; x += STREET_SPACING) {
    const worldX = x * PARCEL_SIZE;
    streets.push(
      <mesh 
        key={`street-v-${x}`} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[worldX, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[STREET_WIDTH, GRID_SIZE * PARCEL_SIZE]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          roughness={0.4} 
          metalness={0.3} 
        />
      </mesh>
    );
    
    // Add subtle center line
    streets.push(
      <mesh 
        key={`line-v-${x}`} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[worldX, 0.01, 0]}
      >
        <planeGeometry args={[0.3, GRID_SIZE * PARCEL_SIZE]} />
        <meshStandardMaterial 
          color="#ffeb3b" 
          emissive="#ffeb3b" 
          emissiveIntensity={0.5} 
        />
      </mesh>
    );
  }
  
  return <>{streets}</>;
}

// Windows component for new land system buildings
function WindowsNew({ buildingHeight }: { buildingHeight: number }) {
  const windowRows = Math.floor(buildingHeight / 5);
  const windows = [];

  for (let i = 0; i < windowRows; i++) {
    const y = (i * 5) + 2.5 - buildingHeight / 2;
    
    // Front windows
    windows.push(
      <mesh key={`front-${i}`} position={[0, y, PARCEL_SIZE * 0.46]}>
        <planeGeometry args={[PARCEL_SIZE * 0.8, 4]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
    );
    
    // Back windows
    windows.push(
      <mesh key={`back-${i}`} position={[0, y, -PARCEL_SIZE * 0.46]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[PARCEL_SIZE * 0.8, 4]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
    );
  }

  return <>{windows}</>;
}

function ParcelBuilding({ 
  parcel, 
  isSelected, 
  onClick 
}: { 
  parcel: Parcel; 
  isSelected: boolean;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Mesh>(null);

  // Calculate world position (string parcelId now supported)
  const worldPos = landRegistryAPI.getWorldPosition(parcel.parcelId);
  
  // Calculate building height based on TIER (not zone)
  // CORE tier: 60-120 floors (tallest)
  // RING tier: 30-60 floors
  // FRONTIER tier: 15-40 floors
  let buildingHeight = 20; // Default
  
  if (parcel.tier === 'CORE') {
    buildingHeight = 60 + Math.random() * 60; // 60-120 units
  } else if (parcel.tier === 'RING') {
    buildingHeight = 30 + Math.random() * 30; // 30-60 units
  } else { // FRONTIER
    buildingHeight = 15 + Math.random() * 25; // 15-40 units
  }

  // DAO Plaza gets special treatment (ultra tall)
  if (parcel.district === 'DAO') {
    buildingHeight = 80 + Math.random() * 40; // 80-120 units
  }

  // Animate FOR_SALE marker
  useFrame((state) => {
    if (markerRef.current && parcel.status === ParcelStatus.FOR_SALE) {
      markerRef.current.position.y = buildingHeight + 3 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  // Get building color based on DISTRICT (not zone)
  const getBuildingColor = (): string => {
    switch (parcel.district) {
      case 'GAMING': return "#ef4444";      // Red - Gaming District
      case 'BUSINESS': return "#3b82f6";    // Blue - Business District
      case 'SOCIAL': return "#ec4899";      // Pink - Social District
      case 'DEFI': return "#10b981";        // Green - DeFi District
      case 'RESIDENTIAL': return "#8b5cf6"; // Violet - Residential
      case 'DAO': return "#9333ea";         // Purple - DAO Plaza
      case 'PUBLIC': return "#6b7280";      // Gray - Public spaces
      default: return "#4a5568";
    }
  };

  // Get ownership outline color
  const getOwnershipColor = (): string | null => {
    if (parcel.status === ParcelStatus.FOR_SALE) return "#fbbf24"; // Amber
    if (parcel.status === ParcelStatus.OWNED) return "#00ff88"; // Cyan-green
    if (parcel.status === ParcelStatus.DAO_OWNED) return "#ff00ff"; // Magenta
    return null;
  };

  const buildingColor = getBuildingColor();
  const ownershipColor = getOwnershipColor();
  // Gaming, Business, and Social districts have neon
  const hasNeon = parcel.district === 'GAMING' || parcel.district === 'BUSINESS' || parcel.district === 'SOCIAL';
  
  // Chrome/metallic for CORE tier, concrete for FRONTIER
  const isChromeBuilding = parcel.tier === 'CORE' && (parcel.district === 'BUSINESS' || parcel.district === 'DEFI');
  const metalness = isChromeBuilding ? 0.9 : 0.3;
  const roughness = isChromeBuilding ? 0.1 : 0.7;
  // Tall buildings get rooftop features
  const hasTallBuilding = buildingHeight > 60;
  
  // Add architectural variety based on district and tier
  const hasSetback = parcel.tier === 'CORE' && Math.random() > 0.5; // 50% of CORE buildings
  const hasAntenna = buildingHeight > 40 && Math.random() > 0.6; // 40% of tall buildings

  // Check if this is a founder plot
  const gridCoords = landRegistryAPI.parcelIdToCoords(parcel.parcelId);
  const isFounder = isFounderPlot(gridCoords.x, gridCoords.y);

  // District-specific neon lights configuration
  const getDistrictLighting = () => {
    switch (parcel.district) {
      case 'GAMING':
        return { color: "#ef4444", intensity: 1.5, distance: 25 }; // Red arcade glow
      case 'DEFI':
        return { color: "#10b981", intensity: 1.2, distance: 30 }; // Green hologram
      case 'SOCIAL':
        return { color: "#ec4899", intensity: 1.3, distance: 28 }; // Pink nightlife
      case 'BUSINESS':
        return { color: "#3b82f6", intensity: 1.0, distance: 22 }; // Blue corporate
      case 'RESIDENTIAL':
        return { color: "#8b5cf6", intensity: 0.8, distance: 18 }; // Violet warm
      case 'DAO':
        return { color: "#9333ea", intensity: 1.8, distance: 35 }; // Purple mystical
      default:
        return null;
    }
  };

  const districtLight = getDistrictLighting();

  return (
    <group position={[worldPos.x, 0, worldPos.z]}>
      {/* Main Building Body */}
      <mesh 
        ref={meshRef} 
        position={[0, buildingHeight / 2, 0]} 
        castShadow 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'default'
        }}
      >
        <boxGeometry args={[PARCEL_SIZE * 0.9, buildingHeight, PARCEL_SIZE * 0.9]} />
        <meshStandardMaterial
          color={buildingColor}
          roughness={roughness}
          metalness={metalness}
          emissive={hasNeon ? buildingColor : "#000000"}
          emissiveIntensity={hasNeon ? 0.3 : 0}
        />
      </mesh>
      
      {/* District-Specific Neon Lighting */}
      {districtLight && (
        <>
          {/* Corner accent lights */}
          <pointLight 
            position={[PARCEL_SIZE * 0.45, buildingHeight * 0.7, PARCEL_SIZE * 0.45]} 
            color={districtLight.color} 
            intensity={districtLight.intensity} 
            distance={districtLight.distance} 
          />
          <pointLight 
            position={[-PARCEL_SIZE * 0.45, buildingHeight * 0.7, -PARCEL_SIZE * 0.45]} 
            color={districtLight.color} 
            intensity={districtLight.intensity} 
            distance={districtLight.distance} 
          />
          
          {/* Top edge glow for tall buildings */}
          {buildingHeight > 40 && (
            <pointLight 
              position={[0, buildingHeight + 2, 0]} 
              color={districtLight.color} 
              intensity={districtLight.intensity * 1.5} 
              distance={districtLight.distance * 1.2} 
            />
          )}
        </>
      )}
      
      {/* GAMING District: Arcade-style vertical neon strips */}
      {parcel.district === 'GAMING' && (
        <>
          <mesh position={[PARCEL_SIZE * 0.46, buildingHeight / 2, 0]}>
            <planeGeometry args={[1, buildingHeight * 0.8]} />
            <meshStandardMaterial 
              color="#ef4444" 
              emissive="#ef4444" 
              emissiveIntensity={0.9} 
              transparent 
              opacity={0.7} 
            />
          </mesh>
          <mesh position={[-PARCEL_SIZE * 0.46, buildingHeight / 2, 0]}>
            <planeGeometry args={[1, buildingHeight * 0.8]} />
            <meshStandardMaterial 
              color="#ef4444" 
              emissive="#ef4444" 
              emissiveIntensity={0.9} 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        </>
      )}
      
      {/* DEFI District: Holographic data rings */}
      {parcel.district === 'DEFI' && buildingHeight > 30 && (
        <group>
          <mesh position={[0, buildingHeight * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[PARCEL_SIZE * 0.5, 0.3, 16, 32]} />
            <meshStandardMaterial 
              color="#10b981" 
              emissive="#10b981" 
              emissiveIntensity={0.8} 
              transparent 
              opacity={0.5} 
              wireframe 
            />
          </mesh>
          <mesh position={[0, buildingHeight * 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[PARCEL_SIZE * 0.4, 0.2, 16, 32]} />
            <meshStandardMaterial 
              color="#10b981" 
              emissive="#10b981" 
              emissiveIntensity={0.8} 
              transparent 
              opacity={0.5} 
              wireframe 
            />
          </mesh>
        </group>
      )}
      
      {/* SOCIAL District: Pink neon signage */}
      {parcel.district === 'SOCIAL' && (
        <mesh position={[0, buildingHeight + 3, PARCEL_SIZE * 0.46]}>
          <planeGeometry args={[PARCEL_SIZE * 0.7, 4]} />
          <meshStandardMaterial 
            color="#ec4899" 
            emissive="#ec4899" 
            emissiveIntensity={1.2} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      )}
      
      {/* DAO District: Purple mystical aura */}
      {parcel.district === 'DAO' && (
        <>
          <mesh position={[0, buildingHeight / 2, 0]}>
            <cylinderGeometry args={[PARCEL_SIZE * 0.6, PARCEL_SIZE * 0.6, buildingHeight, 6, 1, true]} />
            <meshStandardMaterial 
              color="#9333ea" 
              emissive="#9333ea" 
              emissiveIntensity={0.5} 
              transparent 
              opacity={0.2} 
              side={THREE.DoubleSide} 
            />
          </mesh>
          {/* Floating purple particles effect at top */}
          <pointLight 
            position={[0, buildingHeight + 5, 0]} 
            color="#9333ea" 
            intensity={2.5} 
            distance={40} 
          />
        </>
      )}
      
      {/* FOUNDER PLOT: Premium gold chrome treatment */}
      {isFounder && (
        <>
          {/* Gold chrome outer shell */}
          <mesh position={[0, buildingHeight / 2, 0]}>
            <boxGeometry args={[PARCEL_SIZE * 0.95, buildingHeight + 2, PARCEL_SIZE * 0.95]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffd700" 
              emissiveIntensity={0.4} 
              metalness={1.0} 
              roughness={0.05} 
              transparent 
              opacity={0.3} 
            />
          </mesh>
          
          {/* Rotating gold ring at base */}
          <group rotation={[0, Date.now() * 0.0001, 0]}>
            <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[PARCEL_SIZE * 0.55, 0.5, 16, 48]} />
              <meshStandardMaterial 
                color="#ffd700" 
                emissive="#ffd700" 
                emissiveIntensity={0.9} 
                metalness={1.0} 
                roughness={0.1} 
              />
            </mesh>
          </group>
          
          {/* Corner gold pillars */}
          <mesh position={[PARCEL_SIZE * 0.42, buildingHeight / 2, PARCEL_SIZE * 0.42]}>
            <cylinderGeometry args={[0.8, 0.8, buildingHeight + 4, 8]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffd700" 
              emissiveIntensity={0.5} 
              metalness={1.0} 
              roughness={0.1} 
            />
          </mesh>
          <mesh position={[-PARCEL_SIZE * 0.42, buildingHeight / 2, -PARCEL_SIZE * 0.42]}>
            <cylinderGeometry args={[0.8, 0.8, buildingHeight + 4, 8]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffd700" 
              emissiveIntensity={0.5} 
              metalness={1.0} 
              roughness={0.1} 
            />
          </mesh>
          <mesh position={[PARCEL_SIZE * 0.42, buildingHeight / 2, -PARCEL_SIZE * 0.42]}>
            <cylinderGeometry args={[0.8, 0.8, buildingHeight + 4, 8]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffd700" 
              emissiveIntensity={0.5} 
              metalness={1.0} 
              roughness={0.1} 
            />
          </mesh>
          <mesh position={[-PARCEL_SIZE * 0.42, buildingHeight / 2, PARCEL_SIZE * 0.42]}>
            <cylinderGeometry args={[0.8, 0.8, buildingHeight + 4, 8]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffd700" 
              emissiveIntensity={0.5} 
              metalness={1.0} 
              roughness={0.1} 
            />
          </mesh>
          
          {/* Top crown spire */}
          <mesh position={[0, buildingHeight + 8, 0]}>
            <coneGeometry args={[4, 12, 6]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffd700" 
              emissiveIntensity={0.8} 
              metalness={1.0} 
              roughness={0.05} 
            />
          </mesh>
          
          {/* Intense golden point lights */}
          <pointLight position={[0, buildingHeight + 10, 0]} color="#ffd700" intensity={3.0} distance={50} />
          <pointLight position={[0, buildingHeight / 2, 0]} color="#ffd700" intensity={2.0} distance={40} />
          
          {/* FOUNDER badge hologram */}
          <group>
            <mesh position={[0, buildingHeight + 15, 0]} rotation={[0, Math.PI / 4, 0]}>
              <planeGeometry args={[8, 4]} />
              <meshBasicMaterial color="#ffd700" transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
            <Text
              position={[0, buildingHeight + 15, 0.01]}
              rotation={[0, Math.PI / 4, 0]}
              fontSize={1.2}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              font="/fonts/Orbitron-Bold.ttf"
            >
              ⭐ FOUNDER ⭐
            </Text>
          </group>
        </>
      )}
      
      {/* Top Setback Section (for variety) */}
      {hasSetback && (
        <mesh position={[0, buildingHeight + 8, 0]} castShadow>
          <boxGeometry args={[PARCEL_SIZE * 0.6, 16, PARCEL_SIZE * 0.6]} />
          <meshStandardMaterial
            color={buildingColor}
            roughness={roughness}
            metalness={metalness * 1.2}
            emissive={hasNeon ? buildingColor : "#000000"}
            emissiveIntensity={hasNeon ? 0.4 : 0}
          />
        </mesh>
      )}
      
      {/* Communication Antenna (for tall buildings) */}
      {hasAntenna && (
        <group position={[0, buildingHeight + (hasSetback ? 16 : 0), 0]}>
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 10, 8]} />
            <meshStandardMaterial color="#ff0032" emissive="#ff0032" emissiveIntensity={0.8} metalness={0.9} />
          </mesh>
          {/* Blinking antenna light */}
          <pointLight position={[0, 10, 0]} intensity={2} distance={20} color="#ff0032" />
        </group>
      )}
      
      {/* Rooftop Helipad (for tall CORE buildings) */}
      {hasTallBuilding && parcel.tier === 'CORE' && !hasSetback && (
        <mesh position={[0, buildingHeight + 1, 0]}>
          <cylinderGeometry args={[4, 4, 0.5, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {/* Windows */}
      <WindowsNew buildingHeight={buildingHeight} />

      {/* OWNERSHIP VISUALIZATION */}
      {ownershipColor && (
        <mesh position={[0, buildingHeight / 2, 0]}>
          <boxGeometry args={[PARCEL_SIZE * 0.95, buildingHeight + 0.5, PARCEL_SIZE * 0.95]} />
          <meshBasicMaterial 
            color={ownershipColor} 
            wireframe 
            transparent 
            opacity={0.5} 
          />
        </mesh>
      )}

      {/* FOR SALE Hologram */}
      {parcel.status === ParcelStatus.FOR_SALE && (
        <group>
          <mesh ref={markerRef} position={[0, buildingHeight + 3, 0]} rotation={[0, Math.PI / 4, 0]}>
            <planeGeometry args={[6, 3]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <Text
            position={[0, buildingHeight + 3, 0.01]}
            rotation={[0, Math.PI / 4, 0]}
            fontSize={0.8}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            FOR SALE
          </Text>
        </group>
      )}

      {/* OWNED Badge */}
      {parcel.status === ParcelStatus.OWNED && parcel.owner && (
        <group>
          {/* Top beam */}
          <mesh position={[0, buildingHeight + 2, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1} transparent opacity={0.6} />
          </mesh>
          {/* Owner badge */}
          <Text
            position={[0, buildingHeight + 5, 0]}
            fontSize={0.5}
            color="#00ff88"
            anchorX="center"
            anchorY="middle"
          >
            OWNED
          </Text>
        </group>
      )}

      {/* DAO Badge */}
      {parcel.status === ParcelStatus.DAO_OWNED && (
        <group>
          <mesh position={[0, buildingHeight + 5, 0]}>
            <cylinderGeometry args={[3, 3, 0.5, 32]} />
            <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1.5} />
          </mesh>
          <Text
            position={[0, buildingHeight + 5.5, 0]}
            fontSize={1.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            DAO
          </Text>
        </group>
      )}

      {/* Business License Badge */}
      {parcel.businessLicense !== LicenseType.NONE && (
        <mesh position={[PARCEL_SIZE * 0.4, buildingHeight * 0.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[4, 2]} />
          <meshBasicMaterial 
            color={getBusinessLicenseColor(parcel.businessLicense)} 
            transparent 
            opacity={0.8} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}

      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, buildingHeight / 2, 0]}>
          <boxGeometry args={[PARCEL_SIZE, buildingHeight + 1, PARCEL_SIZE]} />
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function getBusinessLicenseColor(license: LicenseType): string {
  switch (license) {
    case LicenseType.RETAIL: return "#10b981"; // Green
    case LicenseType.ENTERTAINMENT: return "#f59e0b"; // Amber
    case LicenseType.SERVICES: return "#3b82f6"; // Blue
    case LicenseType.GAMING: return "#ec4899"; // Pink
    default: return "#6b7280";
  }
}

// DuskSky component for atmospheric background  
function DuskSky() {
  const skyRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (skyRef.current) {
      skyRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <mesh ref={skyRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        side={THREE.BackSide}
        onBeforeCompile={(shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <color_fragment>",
            `
            vec3 topColor = vec3(0.02, 0.05, 0.15); // Deep emo blue-black at zenith
            vec3 horizonColor = vec3(0.35, 0.15, 0.5); // Purple emo horizon
            vec3 bottomColor = vec3(0.6, 0.2, 0.35); // Pink-purple near ground
            
            float h = normalize(vNormal.y);
            vec3 skyColor = mix(bottomColor, horizonColor, smoothstep(-0.2, 0.3, h));
            skyColor = mix(skyColor, topColor, smoothstep(0.3, 1.0, h));
            
            diffuseColor.rgb = skyColor;
            `,
          )
        }}
      />
    </mesh>
  )
}
