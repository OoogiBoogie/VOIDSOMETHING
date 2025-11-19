// hud/navigation/useCompass.ts
/**
 * Compass Hook
 * Provides heading information based on player rotation
 */

import { usePlayerState } from '@/state/player/usePlayerState';

export type CardinalDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface CompassData {
  headingDegrees: number;
  primaryDirection: CardinalDirection;
  directionLabel: string;
}

/**
 * Convert rotation (radians) to heading degrees (0-360)
 * 0° = North, 90° = East, 180° = South, 270° = West
 */
function rotationToHeading(rotation: number): number {
  // Convert radians to degrees
  let degrees = (rotation * 180) / Math.PI;
  
  // Normalize to 0-360
  degrees = ((degrees % 360) + 360) % 360;
  
  return degrees;
}

/**
 * Get cardinal direction from heading degrees
 */
function getCardinalDirection(degrees: number): CardinalDirection {
  // Normalize to 0-360
  const normalized = ((degrees % 360) + 360) % 360;
  
  // 8-direction compass
  if (normalized >= 337.5 || normalized < 22.5) return 'N';
  if (normalized >= 22.5 && normalized < 67.5) return 'NE';
  if (normalized >= 67.5 && normalized < 112.5) return 'E';
  if (normalized >= 112.5 && normalized < 157.5) return 'SE';
  if (normalized >= 157.5 && normalized < 202.5) return 'S';
  if (normalized >= 202.5 && normalized < 247.5) return 'SW';
  if (normalized >= 247.5 && normalized < 292.5) return 'W';
  if (normalized >= 292.5 && normalized < 337.5) return 'NW';
  
  return 'N'; // Fallback
}

/**
 * Get full direction label (e.g., "North", "Northeast")
 */
function getDirectionLabel(direction: CardinalDirection): string {
  const labels: Record<CardinalDirection, string> = {
    N: 'North',
    NE: 'Northeast',
    E: 'East',
    SE: 'Southeast',
    S: 'South',
    SW: 'Southwest',
    W: 'West',
    NW: 'Northwest',
  };
  return labels[direction];
}

export function useCompass(): CompassData {
  const rotation = usePlayerState(state => state.position?.rotation ?? 0);
  
  const headingDegrees = rotationToHeading(rotation);
  const primaryDirection = getCardinalDirection(headingDegrees);
  const directionLabel = getDirectionLabel(primaryDirection);
  
  return {
    headingDegrees,
    primaryDirection,
    directionLabel,
  };
}
