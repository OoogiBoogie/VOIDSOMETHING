/**
 * WORLD EVENT TOASTER - Phase 5.1
 * 
 * Listens to world events and shows temporary toast notifications.
 * Currently handles:
 * - PARCEL_ENTERED: "Now entering: [District] — Parcel #[id]"
 * 
 * Future:
 * - DISTRICT_ENTERED: District transition announcements
 * - PROPERTY_VIEWED: Property viewing confirmations
 * - PARCEL_PURCHASED: Purchase success toasts
 */

'use client';

import { useEffect, useState } from 'react';
import { subscribeToWorldEvents, type ParcelEnteredEvent } from '@/world/worldEvents';
import type { DistrictId } from '@/world/map/districts';

/**
 * Get district display name from DistrictId
 */
const getDistrictName = (district: DistrictId | string): string => {
  const names: Record<DistrictId, string> = {
    HQ: 'PSX HQ',
    DEFI: 'DeFi District',
    CREATOR: 'Creator Quarter',
    DAO: 'DAO Plaza',
    AI: 'AI Nexus',
    SOCIAL: 'Social District',
    IDENTITY: 'Identity District',
    CENTRAL_EAST: 'Central East',
    CENTRAL_SOUTH: 'Central South',
  };
  return names[district as DistrictId] || district;
};

interface ActiveToast {
  id: number;
  message: string;
  districtColor?: string;
}

export function WorldEventToaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    let nextId = 1;

    const unsubscribe = subscribeToWorldEvents((event) => {
      if (event.type === 'PARCEL_ENTERED') {
        const e = event as ParcelEnteredEvent;
        
        // Get district display name
        const districtName = getDistrictName(e.districtId);
        
        // Build toast message
        const message = `Now entering: ${districtName} — Parcel #${e.parcelId}`;
        const id = nextId++;

        // Get district color for styling
        const districtColor = getDistrictColor(e.districtId);

        setToasts((prev) => [...prev, { id, message, districtColor }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[120] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-4 py-2 rounded-xl bg-black/90 border shadow-lg text-xs font-mono text-bio-silver animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            borderColor: toast.districtColor || 'rgba(0, 255, 157, 0.6)',
            boxShadow: `0 0 20px ${toast.districtColor || 'rgba(0, 255, 157, 0.6)'}`,
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

/**
 * Get district accent color for toast styling
 */
function getDistrictColor(districtId: string): string {
  const upperDistrictId = districtId.toUpperCase();
  switch (upperDistrictId) {
    case 'HQ':
      return 'rgba(0, 255, 157, 0.6)'; // Signal green
    case 'DEFI':
      return 'rgba(143, 59, 255, 0.6)'; // Neon purple
    case 'CREATOR':
      return 'rgba(9, 240, 200, 0.6)'; // Neon teal
    case 'DAO':
      return 'rgba(255, 59, 212, 0.6)'; // Neon pink
    case 'AI':
      return 'rgba(59, 143, 255, 0.6)'; // Neon blue
    case 'SOCIAL':
      return 'rgba(255, 157, 0, 0.6)'; // Orange
    case 'IDENTITY':
      return 'rgba(0, 255, 136, 0.6)'; // Green
    case 'CENTRAL_EAST':
    case 'CENTRAL_SOUTH':
      return 'rgba(128, 128, 128, 0.6)'; // Gray
    default:
      return 'rgba(0, 255, 157, 0.6)'; // Signal green (default)
  }
}
