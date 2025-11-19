/**
 * HOME PARCEL STATE (PHASE 5)
 * 
 * Allows players to set a "home" parcel for custom spawn location.
 * Persisted to localStorage per wallet.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

export interface HomeParcelState {
  /** Currently set home parcel ID (null if not set) */
  homeParcelId: number | null;
  
  /** District ID of the home parcel */
  homeDistrictId: string | null;
  
  /** Whether to use home spawn (can be disabled without clearing home) */
  enabled: boolean;
  
  /** Set a parcel as home */
  setHome: (parcelId: number, districtId: string) => void;
  
  /** Clear home parcel */
  clearHome: () => void;
  
  /** Toggle home spawn on/off */
  setEnabled: (enabled: boolean) => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useHomeParcelState = create<HomeParcelState>()(
  persist(
    (set) => ({
      homeParcelId: null,
      homeDistrictId: null,
      enabled: true,
      
      setHome: (parcelId, districtId) => {
        console.log(`[HomeParcel] Setting home to parcel ${parcelId} in district ${districtId}`);
        set({
          homeParcelId: parcelId,
          homeDistrictId: districtId,
          enabled: true, // Auto-enable when setting home
        });
      },
      
      clearHome: () => {
        console.log('[HomeParcel] Clearing home parcel');
        set({
          homeParcelId: null,
          homeDistrictId: null,
        });
      },
      
      setEnabled: (enabled) => {
        console.log(`[HomeParcel] ${enabled ? 'Enabling' : 'Disabling'} home spawn`);
        set({ enabled });
      },
    }),
    {
      name: 'void-home-parcel-state',
      // TODO: In production, key by wallet address for multi-wallet support
      // For now, single-client level persistence
    }
  )
);
