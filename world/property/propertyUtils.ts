/**
 * Property Utilities
 * Phase 6.3 - Helper functions for property system
 */

import type { PropertyMetadata } from './propertyTypes';

/**
 * Calculate estimated property value based on various factors
 */
export function calculatePropertyValue(
  baseValue: number,
  factors: {
    districtBonus?: number;
    landmarkBonus?: number;
    ownershipDiscount?: number;
  } = {}
): number {
  let value = baseValue;

  if (factors.districtBonus) {
    value += factors.districtBonus;
  }

  if (factors.landmarkBonus) {
    value *= 1 + factors.landmarkBonus;
  }

  if (factors.ownershipDiscount) {
    value *= 1 - factors.ownershipDiscount;
  }

  return Math.floor(value);
}

/**
 * Format property ID
 */
export function formatPropertyId(x: number, z: number): string {
  return `${x},${z}`;
}

/**
 * Parse property ID
 */
export function parsePropertyId(parcelId: string): { x: number; z: number } | null {
  const parts = parcelId.split(',');
  if (parts.length !== 2) return null;

  const x = parseInt(parts[0], 10);
  const z = parseInt(parts[1], 10);

  if (isNaN(x) || isNaN(z)) return null;

  return { x, z };
}

/**
 * Check if property is a landmark
 */
export function isLandmark(property: PropertyMetadata): boolean {
  return property.type === 'LANDMARK' || (property.landmarks?.length || 0) > 0;
}
