// hud/navigation/Compass.tsx
/**
 * Compass Component
 * Shows N/E/S/W heading indicator in HUD
 */

'use client';

import { useCompass, type CardinalDirection } from './useCompass';

export function Compass() {
  const { headingDegrees, primaryDirection, directionLabel } = useCompass();

  // Cardinal directions for display
  const directions: CardinalDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="bg-black/70 border border-cyan-500/30 rounded-full px-6 py-3 shadow-lg shadow-cyan-500/10">
        {/* Primary Direction Display */}
        <div className="text-center">
          <div className="text-cyan-400 font-mono text-2xl font-bold tracking-wider">
            {primaryDirection}
          </div>
          <div className="text-gray-400 text-xs font-mono mt-0.5">
            {directionLabel} • {Math.round(headingDegrees)}°
          </div>
        </div>

        {/* Direction Ring */}
        <div className="flex justify-center items-center gap-2 mt-3">
          {directions.map((dir) => (
            <div
              key={dir}
              className={`
                text-xs font-mono transition-all duration-200
                ${
                  dir === primaryDirection
                    ? 'text-cyan-400 font-bold scale-125'
                    : 'text-gray-600 scale-100'
                }
              `}
            >
              {dir}
            </div>
          ))}
        </div>

        {/* Heading Indicator Line */}
        <div className="relative mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute h-full w-1 bg-cyan-400 rounded-full transition-all duration-100"
            style={{
              left: `${(headingDegrees / 360) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
