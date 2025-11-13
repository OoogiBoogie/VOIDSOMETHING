"use client";

import React from 'react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';
import { Package, Grid3x3 } from 'lucide-react';
import { GlobalInventoryUI } from '@/components/GlobalInventoryUI';

/**
 * INVENTORY SCREEN
 * Global assets view: parcels, buildings, SKUs, collectibles
 */

export function InventoryScreen() {
  const handleSelectParcel = (parcelId: string) => {
    console.log('Selected parcel:', parcelId);
    // TODO: Implement parcel selection logic
  };

  return (
    <div className="h-full">
      <GlobalInventoryUI onSelectParcel={handleSelectParcel} />
    </div>
  );
}
