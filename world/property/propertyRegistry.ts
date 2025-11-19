/**
 * Property Registry
 * Phase 6.3 - Property metadata and ownership lookup
 */

import type { PropertyMetadata, PropertyType, PropertyCategory } from './propertyTypes';

export class PropertyRegistry {
  private properties = new Map<string, PropertyMetadata>();

  /**
   * Get property key
   */
  private getKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  /**
   * Register a property
   */
  register(metadata: PropertyMetadata): void {
    const key = this.getKey(metadata.x, metadata.z);
    this.properties.set(key, metadata);
  }

  /**
   * Get property metadata
   */
  get(x: number, z: number): PropertyMetadata | undefined {
    return this.properties.get(this.getKey(x, z));
  }

  /**
   * Get property by parcel ID
   */
  getByParcelId(parcelId: string): PropertyMetadata | undefined {
    return Array.from(this.properties.values()).find(p => p.parcelId === parcelId);
  }

  /**
   * Get all properties in a district
   */
  getByDistrict(districtId: string): PropertyMetadata[] {
    return Array.from(this.properties.values()).filter(p => p.districtId === districtId);
  }

  /**
   * Check if property exists
   */
  has(x: number, z: number): boolean {
    return this.properties.has(this.getKey(x, z));
  }

  /**
   * Get all properties
   */
  getAll(): PropertyMetadata[] {
    return Array.from(this.properties.values());
  }
}

// Singleton instance
export const propertyRegistry = new PropertyRegistry();

// Initialize with some sample properties (can be loaded from config/API later)
propertyRegistry.register({
  parcelId: '0,0',
  x: 0,
  z: 0,
  districtId: 'CORE_NEXUS',
  name: 'Genesis Parcel',
  type: 'LANDMARK' as PropertyType,
  category: 'SPECIAL' as PropertyCategory,
  baseValue: 10000,
  isOwned: false,
  landmarks: ['Spawn Point'],
});
