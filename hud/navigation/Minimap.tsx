// hud/navigation/Minimap.tsx
/**
 * Minimap Component
 * 2D top-down view showing player position, districts, and exploration
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePlayerState } from '@/state/player/usePlayerState';
import { worldToPixel, DISTRICTS, getDistrictFromCoords, DEFAULT_MINIMAP_CONFIG } from './minimapUtils';

const MINIMAP_SIZE = 200; // px
const UPDATE_THROTTLE = 100; // ms (10 fps)

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastUpdateRef = useRef<number>(0);
  
  const position = usePlayerState(state => state.position);
  const currentDistrict = usePlayerState(state => state.currentDistrict);
  const districtsVisited = usePlayerState(state => state.stats.totalDistrictsVisited);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !position) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < UPDATE_THROTTLE) return;
    lastUpdateRef.current = now;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw district boundaries
    DISTRICTS.forEach((district) => {
      const topLeft = worldToPixel(
        { x: district.minX, z: district.minZ },
        MINIMAP_SIZE,
        MINIMAP_SIZE,
        DEFAULT_MINIMAP_CONFIG
      );
      const bottomRight = worldToPixel(
        { x: district.maxX, z: district.maxZ },
        MINIMAP_SIZE,
        MINIMAP_SIZE,
        DEFAULT_MINIMAP_CONFIG
      );

      const width = bottomRight.x - topLeft.x;
      const height = bottomRight.y - topLeft.y;

      // Fill district with color (dimmed if not current)
      const isCurrent = currentDistrict === district.id || currentDistrict === district.name;
      ctx.fillStyle = isCurrent ? `${district.color}40` : `${district.color}10`;
      ctx.fillRect(topLeft.x, topLeft.y, width, height);

      // Draw district border
      ctx.strokeStyle = isCurrent ? district.color : `${district.color}50`;
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.strokeRect(topLeft.x, topLeft.y, width, height);
    });

    // Draw center origin cross
    const origin = worldToPixel({ x: 0, z: 0 }, MINIMAP_SIZE, MINIMAP_SIZE);
    ctx.strokeStyle = '#ffffff30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origin.x - 5, origin.y);
    ctx.lineTo(origin.x + 5, origin.y);
    ctx.moveTo(origin.x, origin.y - 5);
    ctx.lineTo(origin.x, origin.y + 5);
    ctx.stroke();

    // Draw player position
    const playerPixel = worldToPixel(
      { x: position.x, z: position.z },
      MINIMAP_SIZE,
      MINIMAP_SIZE
    );

    // Player dot
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(playerPixel.x, playerPixel.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Player heading indicator (arrow)
    if (position.rotation !== undefined) {
      const arrowLength = 8;
      const angle = position.rotation;
      const endX = playerPixel.x + Math.sin(angle) * arrowLength;
      const endY = playerPixel.y + Math.cos(angle) * arrowLength;

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerPixel.x, playerPixel.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Player glow
    ctx.fillStyle = '#06b6d420';
    ctx.beginPath();
    ctx.arc(playerPixel.x, playerPixel.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }, [position, currentDistrict, districtsVisited]);

  return (
    <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
      <div className="bg-black/90 border border-cyan-500/50 p-2 rounded shadow-lg shadow-cyan-500/20">
        {/* Header */}
        <div className="text-cyan-400 font-mono text-xs font-bold mb-2 text-center">
          MINIMAP
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={MINIMAP_SIZE}
          height={MINIMAP_SIZE}
          className="border border-cyan-500/30 rounded"
        />

        {/* Stats */}
        <div className="mt-2 text-center">
          <div className="text-gray-400 font-mono text-xs">
            <span className="text-cyan-400">{districtsVisited}</span> Districts Explored
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 pt-2 border-t border-cyan-500/20">
          <div className="flex items-center justify-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span className="text-gray-400">You</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-white/30 rounded-sm border border-white/50" />
              <span className="text-gray-400">Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
