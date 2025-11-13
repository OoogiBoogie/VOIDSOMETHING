"use client";

import React, { useState } from 'react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';
import { Map, Grid3x3, Eye, Filter } from 'lucide-react';
import { CybercityWorld } from '@/components/3d/CybercityWorld';
import { Minimap } from '@/components/minimap';
import { PS1MemoryCardView } from '@/components/land/ps1-memory-card-view';

/**
 * LAND & MAP SCREEN
 * Dedicated full-screen land browser with 3D view, minimap, and PS1 grid
 */

type ViewMode = '3d' | 'minimap' | 'ps1-grid';

export function LandMapScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between p-4 border-b border-[#00f0ff]/20 bg-black/40">
        <div className="flex gap-2">
          <ChromeButton
            variant={viewMode === '3d' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('3d')}
          >
            <Eye className="w-4 h-4 mr-2" />
            3D View
          </ChromeButton>
          <ChromeButton
            variant={viewMode === 'minimap' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('minimap')}
          >
            <Map className="w-4 h-4 mr-2" />
            Map
          </ChromeButton>
          <ChromeButton
            variant={viewMode === 'ps1-grid' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('ps1-grid')}
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            PS1 Grid
          </ChromeButton>
        </div>

        <ChromeButton variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </ChromeButton>
      </div>

      {/* View Content */}
      <div className="flex-1 relative">
        {viewMode === '3d' && (
          <div className="w-full h-full">
            <CybercityWorld
              selectedParcelId={selectedParcelId || undefined}
            />
          </div>
        )}

        {viewMode === 'minimap' && (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="max-w-4xl w-full aspect-square">
              <Minimap
                playerPosition={{ x: 0, y: 0, z: 0 }}
                currentZone={null}
              />
            </div>
          </div>
        )}

        {viewMode === 'ps1-grid' && (
          <div className="w-full h-full overflow-auto p-6">
            <PS1MemoryCardView
              parcels={[]}
              onSelectParcel={(parcel) => setSelectedParcelId(parcel.parcelId)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
