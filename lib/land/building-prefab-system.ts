/**
 * Building Prefab System
 * Generates 3D buildings from parcel data with ownership visualization
 */

import * as BABYLON from '@babylonjs/core';
import { Parcel, Building, BuildingArchetype, HeightClass, ZoneType, ParcelStatus, LicenseType } from './types';
import { landRegistryAPI } from './registry-api';

export class BuildingPrefabSystem {
  private scene: BABYLON.Scene;
  private buildingMeshes: Map<number, BABYLON.Mesh> = new Map();
  private materialCache: Map<string, BABYLON.Material> = new Map();

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  /**
   * Generate building for a single parcel
   */
  generateBuildingForParcel(parcel: Parcel): Building {
    const archetype = this.selectArchetypeForZone(parcel.zone);
    const heightClass = this.determineHeightClass(parcel);
    const floors = this.calculateFloors(heightClass);
    const dimensions = this.calculateDimensions(archetype, heightClass);
    const colorScheme = this.getColorScheme(archetype, parcel.zone);
    const ownershipIndicator = this.createOwnershipIndicator(parcel);

    const building: Building = {
      buildingId: `building-${parcel.parcelId}`,
      parcelId: parcel.parcelId,
      meshId: `mesh-${parcel.parcelId}`,
      archetype,
      visualVariant: Math.floor(Math.random() * 3),
      heightClass,
      floors,
      baseWidth: dimensions.width,
      baseDepth: dimensions.depth,
      totalHeight: dimensions.height,
      hasBalconies: archetype === BuildingArchetype.RESIDENTIAL_HIVE,
      hasPaneling: true,
      hasVents: archetype === BuildingArchetype.INDUSTRIAL_COMPLEX,
      hasDataScreens: archetype === BuildingArchetype.DATA_CENTER,
      hasRooftopFeatures: true,
      verticalFeatures: [],
      colorScheme,
      lightingDensity: 0.6,
      decayLevel: archetype === BuildingArchetype.ABANDONED_SHELL ? 0.8 : 0.1,
      ownershipIndicator: ownershipIndicator ?? {
        enabled: false,
        type: 'outline',
        color: '#ffffff',
        animation: 'steady'
      },
      branding: parcel.businessLicense !== LicenseType.NONE ? {
        businessName: `Business #${parcel.parcelId}`,
        logoUrl: undefined,
        signColor: this.getLicenseColor(parcel.businessLicense),
        signPosition: 'facade'
      } : undefined,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    return building;
  }

  /**
   * Create 3D mesh for building
   */
  createBuildingMesh(building: Building, parcel: Parcel): BABYLON.Mesh {
    const worldPos = landRegistryAPI.getWorldPosition(parcel.parcelId);
    
    // Create building base mesh
    const buildingMesh = BABYLON.MeshBuilder.CreateBox(building.meshId || `mesh-${building.parcelId}`, {
      width: building.baseWidth,
      height: building.totalHeight,
      depth: building.baseDepth
    }, this.scene);

    buildingMesh.position = new BABYLON.Vector3(
      worldPos.x,
      building.totalHeight / 2, // Raise to sit on ground
      worldPos.z
    );

    // Apply material
    const material = this.getOrCreateMaterial({
      base: building.colorScheme.base,
      accent: building.colorScheme.accent,
      secondary: building.colorScheme.secondary || building.colorScheme.accent
    });
    buildingMesh.material = material;

    // Add ownership visualization
    this.addOwnershipVisualization(buildingMesh, building, parcel);

    // Add business branding
    if (building.branding) {
      this.addBusinessSign(buildingMesh, building);
    }

    // Store reference
    this.buildingMeshes.set(parcel.parcelId, buildingMesh);

    return buildingMesh;
  }

  /**
   * Select archetype based on zone
   */
  private selectArchetypeForZone(zone: ZoneType): BuildingArchetype {
    const zoneArchetypes: Record<ZoneType, BuildingArchetype[]> = {
      [ZoneType.PUBLIC]: [BuildingArchetype.MIXED_USE, BuildingArchetype.ABANDONED_SHELL],
      [ZoneType.RESIDENTIAL]: [BuildingArchetype.RESIDENTIAL_HIVE, BuildingArchetype.MIXED_USE],
      [ZoneType.COMMERCIAL]: [BuildingArchetype.CORPORATE_TOWER, BuildingArchetype.DATA_CENTER],
      [ZoneType.PREMIUM]: [BuildingArchetype.CORPORATE_TOWER, BuildingArchetype.DATA_CENTER],
      [ZoneType.GLIZZY_WORLD]: [BuildingArchetype.ENTERTAINMENT_HUB, BuildingArchetype.MIXED_USE]
    };

    const options = zoneArchetypes[zone];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Determine height class based on location
   */
  private determineHeightClass(parcel: Parcel): HeightClass {
    const distance = landRegistryAPI.getDistanceFromCenter(parcel.gridX, parcel.gridY);
    
    if (distance < 10) return HeightClass.ULTRA; // Center - skyscrapers
    if (distance < 25) return HeightClass.HIGH;   // Inner ring
    if (distance < 40) return HeightClass.MID;    // Middle ring
    return HeightClass.LOW;                        // Outer ring
  }

  /**
   * Calculate number of floors
   */
  private calculateFloors(heightClass: HeightClass): number {
    const ranges = {
      [HeightClass.LOW]: [10, 30],
      [HeightClass.MID]: [30, 60],
      [HeightClass.HIGH]: [60, 100],
      [HeightClass.ULTRA]: [100, 150]
    };

    const [min, max] = ranges[heightClass];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Calculate building dimensions
   */
  private calculateDimensions(archetype: BuildingArchetype, heightClass: HeightClass) {
    const baseHeight = {
      [HeightClass.LOW]: 30,
      [HeightClass.MID]: 60,
      [HeightClass.HIGH]: 120,
      [HeightClass.ULTRA]: 200
    }[heightClass];

    const baseWidth = archetype === BuildingArchetype.CORPORATE_TOWER ? 20 : 30;
    const baseDepth = archetype === BuildingArchetype.CORPORATE_TOWER ? 20 : 25;

    return {
      width: baseWidth * (0.8 + Math.random() * 0.4),
      height: baseHeight * (0.9 + Math.random() * 0.2),
      depth: baseDepth * (0.8 + Math.random() * 0.4)
    };
  }

  /**
   * Get color scheme for archetype
   */
  private getColorScheme(archetype: BuildingArchetype, zone: ZoneType) {
    const schemes: Record<BuildingArchetype, { base: string; accent: string; secondary: string }> = {
      [BuildingArchetype.CORPORATE_TOWER]: {
        base: '#1a3a52',
        accent: '#00d9ff',
        secondary: '#003d5c'
      },
      [BuildingArchetype.RESIDENTIAL_HIVE]: {
        base: '#2a2a3e',
        accent: '#ff6b9d',
        secondary: '#1a1a2e'
      },
      [BuildingArchetype.INDUSTRIAL_COMPLEX]: {
        base: '#3d3d3d',
        accent: '#ff9500',
        secondary: '#2a2a2a'
      },
      [BuildingArchetype.DATA_CENTER]: {
        base: '#0f1419',
        accent: '#00ff88',
        secondary: '#1a2332'
      },
      [BuildingArchetype.ABANDONED_SHELL]: {
        base: '#1a1a1a',
        accent: '#4a4a4a',
        secondary: '#0d0d0d'
      },
      [BuildingArchetype.MIXED_USE]: {
        base: '#2d3561',
        accent: '#c05c7e',
        secondary: '#1a2332'
      },
      [BuildingArchetype.ENTERTAINMENT_HUB]: {
        base: '#ff00ff',
        accent: '#00ffff',
        secondary: '#ff1493'
      }
    };

    return schemes[archetype];
  }

  /**
   * Create ownership indicator
   */
  private createOwnershipIndicator(parcel: Parcel) {
    if (parcel.status === ParcelStatus.FOR_SALE) {
      return {
        enabled: true,
        type: 'hologram' as const,
        color: '#00ffff',
        animation: 'pulse'
      };
    } else if (parcel.status === ParcelStatus.DAO_OWNED) {
      return {
        enabled: true,
        type: 'rooftop-beam' as const,
        color: '#9933ff',
        animation: 'rotate'
      };
    } else if (parcel.ownerAddress) {
      return {
        enabled: true,
        type: 'outline' as const,
        color: '#ffffff',
        animation: 'steady'
      };
    }
    return {
      enabled: false,
      type: 'outline' as const,
      color: '#ffffff',
      animation: 'steady'
    };
  }

  /**
   * Add ownership visualization to mesh
   */
  private addOwnershipVisualization(mesh: BABYLON.Mesh, building: Building, parcel: Parcel) {
    if (!building.ownershipIndicator || !building.ownershipIndicator.enabled) return;

    const indicator = building.ownershipIndicator;

    if (indicator.type === 'hologram') {
      // FOR SALE - Cyan hologram on rooftop
      const hologram = BABYLON.MeshBuilder.CreateCylinder('hologram', {
        height: 20,
        diameter: 10
      }, this.scene);

      hologram.position = new BABYLON.Vector3(
        0,
        building.totalHeight / 2 + 10,
        0
      );
      hologram.parent = mesh;

      const hologramMat = new BABYLON.StandardMaterial('hologramMat', this.scene);
      hologramMat.emissiveColor = BABYLON.Color3.FromHexString(indicator.color);
      hologramMat.alpha = 0.5;
      hologram.material = hologramMat;

      // Pulse animation
      this.scene.registerBeforeRender(() => {
        hologram.scaling.y = 1 + Math.sin(Date.now() / 500) * 0.2;
      });

    } else if (indicator.type === 'outline') {
      // OWNED - White outline glow
      const hl = new BABYLON.HighlightLayer('ownerHL', this.scene);
      hl.addMesh(mesh, BABYLON.Color3.FromHexString(indicator.color));

    } else if (indicator.type === 'rooftop-beam') {
      // DAO OWNED - Purple beam
      const beam = BABYLON.MeshBuilder.CreateCylinder('beam', {
        height: 500,
        diameter: 5
      }, this.scene);

      beam.position = new BABYLON.Vector3(
        0,
        building.totalHeight / 2 + 250,
        0
      );
      beam.parent = mesh;

      const beamMat = new BABYLON.StandardMaterial('beamMat', this.scene);
      beamMat.emissiveColor = BABYLON.Color3.FromHexString(indicator.color);
      beamMat.alpha = 0.7;
      beam.material = beamMat;

      // Rotate animation
      this.scene.registerBeforeRender(() => {
        beam.rotation.y += 0.01;
      });
    }
  }

  /**
   * Add business sign to building
   */
  private addBusinessSign(mesh: BABYLON.Mesh, building: Building) {
    if (!building.branding) return;

    // Calculate position based on sign placement
    let yPos = building.totalHeight * 0.3;
    let zPos = building.baseDepth / 2;
    
    if (building.branding.signPosition === 'rooftop') {
      yPos = building.totalHeight * 0.9;
      zPos = 0;
    } else if (building.branding.signPosition === 'entrance') {
      yPos = 5;
      zPos = building.baseDepth / 2 + 1;
    }

    const sign = BABYLON.MeshBuilder.CreatePlane('sign', {
      width: 15,
      height: 5
    }, this.scene);

    sign.position = new BABYLON.Vector3(
      0,
      yPos,
      zPos
    );
    sign.parent = mesh;

    const signMat = new BABYLON.StandardMaterial('signMat', this.scene);
    signMat.emissiveColor = BABYLON.Color3.FromHexString(building.branding.signColor);
    sign.material = signMat;
  }

  /**
   * Get or create material from cache
   */
  private getOrCreateMaterial(colorScheme: { base: string; accent: string; secondary: string }): BABYLON.Material {
    const key = `${colorScheme.base}-${colorScheme.accent}`;
    
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)!;
    }

    const material = new BABYLON.StandardMaterial(`material-${key}`, this.scene);
    material.diffuseColor = BABYLON.Color3.FromHexString(colorScheme.base);
    material.emissiveColor = BABYLON.Color3.FromHexString(colorScheme.accent).scale(0.2);
    material.specularColor = BABYLON.Color3.FromHexString(colorScheme.secondary);

    this.materialCache.set(key, material);
    return material;
  }

  /**
   * Get color for license type
   */
  private getLicenseColor(license: LicenseType): string {
    const colors = {
      [LicenseType.NONE]: '#666666',
      [LicenseType.RETAIL]: '#00ffff',
      [LicenseType.ENTERTAINMENT]: '#ff00ff',
      [LicenseType.SERVICES]: '#00ff00',
      [LicenseType.GAMING]: '#ffaa00'
    };
    return colors[license];
  }

  /**
   * Generate all buildings for parcels
   */
  generateBuildingsForParcels(parcels: Parcel[]): Building[] {
    const buildings: Building[] = [];
    
    for (const parcel of parcels) {
      const building = this.generateBuildingForParcel(parcel);
      buildings.push(building);
      this.createBuildingMesh(building, parcel);
    }

    return buildings;
  }

  /**
   * Update building ownership visualization
   */
  updateBuildingOwnership(parcelId: number, newParcel: Parcel) {
    const mesh = this.buildingMeshes.get(parcelId);
    if (!mesh) return;

    // Remove old mesh and create new one with updated visualization
    mesh.dispose();
    const building = this.generateBuildingForParcel(newParcel);
    this.createBuildingMesh(building, newParcel);
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.buildingMeshes.forEach(mesh => mesh.dispose());
    this.buildingMeshes.clear();
    this.materialCache.forEach(mat => mat.dispose());
    this.materialCache.clear();
  }
}
