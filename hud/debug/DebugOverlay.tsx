// hud/debug/DebugOverlay.tsx
/**
 * Debug Overlay Component
 * Shows real-time player stats for development
 * Toggle with F3 key
 */

'use client';

import { useDebugToggle } from './useDebugToggle';
import { usePlayerState } from '@/state/player/usePlayerState';
import { getParcelInfo } from '@/world/WorldCoords';

export function DebugOverlay() {
  const { isVisible } = useDebugToggle();
  const position = usePlayerState(state => state.position);
  const stats = usePlayerState(state => state.stats);
  const achievements = usePlayerState(state => state.achievements);
  const walletAddress = usePlayerState(state => state.walletAddress);
  const currentParcel = usePlayerState(state => state.currentParcel);
  const currentDistrict = usePlayerState(state => state.currentDistrict);

  if (!isVisible) return null;

  // Get parcel info from world coordinates
  const parcelInfo = position ? getParcelInfo({ x: position.x, z: position.z }) : null;
  const achievementIds = Array.from(achievements.keys());

  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-auto">
      <div className="bg-black/90 border border-cyan-500/50 p-4 font-mono text-xs text-cyan-400 space-y-1 shadow-lg shadow-cyan-500/20 min-w-[300px]">
        {/* Header */}
        <div className="text-cyan-300 font-bold mb-2 pb-2 border-b border-cyan-500/30">
          🔧 DEBUG OVERLAY <span className="text-gray-500">(F3 to toggle)</span>
        </div>

        {/* Wallet */}
        <div>
          <span className="text-gray-400">Wallet:</span>{' '}
          <span className="text-white">
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Guest'}
          </span>
        </div>

        {/* Position */}
        <div className="pt-2 border-t border-cyan-500/20">
          <div className="text-cyan-300 font-bold">Position</div>
          <div className="ml-2 space-y-0.5">
            <div>
              <span className="text-gray-400">X:</span>{' '}
              <span className="text-white">{position?.x.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <span className="text-gray-400">Y:</span>{' '}
              <span className="text-white">{position?.y.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <span className="text-gray-400">Z:</span>{' '}
              <span className="text-white">{position?.z.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <span className="text-gray-400">Rotation:</span>{' '}
              <span className="text-white">{position?.rotation.toFixed(0) || '0'}°</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="pt-2 border-t border-cyan-500/20">
          <div className="text-cyan-300 font-bold">Location</div>
          <div className="ml-2 space-y-0.5">
            <div>
              <span className="text-gray-400">Parcel:</span>{' '}
              <span className="text-white">
                {typeof currentParcel === 'string' 
                  ? currentParcel 
                  : parcelInfo 
                    ? `(${parcelInfo.coords.x}, ${parcelInfo.coords.z})` 
                    : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">District:</span>{' '}
              <span className="text-white">{currentDistrict || parcelInfo?.district || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pt-2 border-t border-cyan-500/20">
          <div className="text-cyan-300 font-bold">Stats</div>
          <div className="ml-2 space-y-0.5">
            <div>
              <span className="text-gray-400">XP:</span>{' '}
              <span className="text-yellow-400 font-bold">{stats.totalXP}</span>
              <span className="text-gray-500 ml-2">Lv.{stats.level}</span>
            </div>
            <div>
              <span className="text-gray-400">Parcels:</span>{' '}
              <span className="text-white">{stats.totalParcelsVisited}</span>
            </div>
            <div>
              <span className="text-gray-400">Districts:</span>{' '}
              <span className="text-white">{stats.totalDistrictsVisited}</span>
            </div>
            <div>
              <span className="text-gray-400">Session:</span>{' '}
              <span className="text-white">{Math.floor(stats.totalSessionTime / 60000)}m</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="pt-2 border-t border-cyan-500/20">
          <div className="text-cyan-300 font-bold">
            Achievements <span className="text-gray-500">({achievementIds.length})</span>
          </div>
          {achievementIds.length > 0 ? (
            <div className="ml-2 space-y-0.5 max-h-32 overflow-y-auto">
              {achievementIds.map(id => (
                <div key={id} className="text-xs">
                  🏆 <span className="text-yellow-400">{id}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-2 text-gray-500 text-xs">None unlocked yet</div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 mt-2 border-t border-cyan-500/20 text-gray-500 text-[10px]">
          Press F3 to hide • Dev mode only
        </div>
      </div>
    </div>
  );
}
