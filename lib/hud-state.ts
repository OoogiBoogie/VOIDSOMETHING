"use client"

import { create } from "zustand"

export type HUDState =
  | "RoamDesktop"
  | "RoamMobile"
  | "LitePortrait"
  | "LiteLandscape"
  | "MapOpen"
  | "PopupActive"
  | "NotificationTray"
  | "FolderOpen"
  | "XPHubOpen"

export type AppFolder =
  | "WORLD"
  | "FINANCE"
  | "SOCIAL"
  | "PLAY"
  | "DAO"
  | "PROGRESS"
  | "CREATOR"

interface HUDStateStore {
  currentState: HUDState
  previousState: HUDState | null
  activeFolder: AppFolder | null
  activePopup: string | null
  
  // Actions
  setState: (newState: HUDState) => void
  openFolder: (folder: AppFolder) => void
  closeFolder: () => void
  openPopup: (popupId: string) => void
  closeActive: () => void
  
  // Input control
  isInputBlocked: () => boolean
  canNavigate: () => boolean
}

export const useHUDState = create<HUDStateStore>((set, get) => ({
  currentState: "RoamDesktop",
  previousState: null,
  activeFolder: null,
  activePopup: null,

  setState: (newState: HUDState) => {
    const current = get().currentState
    set({
      currentState: newState,
      previousState: current,
    })
  },

  openFolder: (folder: AppFolder) => {
    const current = get().currentState
    set({
      currentState: "FolderOpen",
      previousState: current,
      activeFolder: folder,
    })
  },

  closeFolder: () => {
    const prev = get().previousState
    set({
      currentState: prev || "RoamDesktop",
      activeFolder: null,
    })
  },

  openPopup: (popupId: string) => {
    const current = get().currentState
    set({
      currentState: "PopupActive",
      previousState: current,
      activePopup: popupId,
    })
  },

  closeActive: () => {
    const state = get()
    
    // Close whatever is open and return to appropriate Roam state
    if (state.currentState === "FolderOpen") {
      state.closeFolder()
    } else if (state.currentState === "PopupActive") {
      const prev = state.previousState
      set({
        currentState: prev || "RoamDesktop",
        activePopup: null,
      })
    } else if (state.currentState === "MapOpen" || state.currentState === "XPHubOpen") {
      const prev = state.previousState
      set({
        currentState: prev || "RoamDesktop",
      })
    } else {
      // Already in Roam, do nothing
    }
  },

  isInputBlocked: () => {
    const state = get().currentState
    return state === "PopupActive" || state === "MapOpen" || state === "NotificationTray"
  },

  canNavigate: () => {
    const state = get().currentState
    return state === "RoamDesktop" || state === "RoamMobile"
  },
}))
