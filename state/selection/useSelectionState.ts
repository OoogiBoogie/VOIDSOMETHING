/**
 * SELECTION STATE STORE
 * 
 * Single source of truth for active parcel/building selection.
 * Shared between 3D world, HUD panels, and maps.
 * 
 * Used to wire building clicks → RealEstatePanel → map highlights.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DistrictId } from '@/world/map/districts';

export interface ActiveSelection {
  parcelId: number | null;
  buildingId: string | null;
  districtId: DistrictId | null;
}

export interface SelectionState {
  active: ActiveSelection;
  setActiveParcel: (parcelId: number, districtId: DistrictId | null) => void;
  setActiveDistrict: (districtId: DistrictId | null) => void;
  setActiveBuilding: (buildingId: string, parcelId: number, districtId: DistrictId | null) => void;
  clearSelection: () => void;
}

const initialState: ActiveSelection = {
  parcelId: null,
  buildingId: null,
  districtId: null,
};

export const useSelectionState = create<SelectionState>()(
  devtools(
    (set) => ({
      active: initialState,

      setActiveParcel: (parcelId, districtId) => {
        set({
          active: {
            parcelId,
            buildingId: null, // Clear building when selecting parcel directly
            districtId,
          },
        }, false, 'setActiveParcel');
      },

      setActiveDistrict: (districtId) => {
        set((state) => ({
          active: {
            ...state.active,
            districtId,
          },
        }), false, 'setActiveDistrict');
      },

      setActiveBuilding: (buildingId, parcelId, districtId) => {
        set({
          active: {
            parcelId,
            buildingId,
            districtId,
          },
        }, false, 'setActiveBuilding');
      },

      clearSelection: () => {
        set({
          active: initialState,
        }, false, 'clearSelection');
      },
    }),
    { name: 'SelectionState' }
  )
);
