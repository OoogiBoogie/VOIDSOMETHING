"use client"

import { useHUD } from './HUDContext';
import type { HubKey, TabKey, PinnedPanel } from './HUDTypes';

/**
 * Hook for making any panel "pinable"
 */
export function usePinablePanel(config: {
  hub: HubKey;
  tab: TabKey;
  panelId?: string;
  label: string;
  icon?: string;
}) {
  const { state, actions } = useHUD();

  const panelKey = `${config.hub}-${config.tab}-${config.panelId || 'default'}`;
  const isPinned = state.pinnedPanels.some(
    p => `${p.hub}-${p.tab}-${p.panelId || 'default'}` === panelKey
  );

  const pin = () => {
    if (!isPinned) {
      actions.pinPanel(config);
    }
  };

  const unpin = () => {
    const panel = state.pinnedPanels.find(
      p => `${p.hub}-${p.tab}-${p.panelId || 'default'}` === panelKey
    );
    if (panel) {
      actions.unpinPanel(panel.id);
    }
  };

  const toggle = () => {
    if (isPinned) {
      unpin();
    } else {
      pin();
    }
  };

  return { pin, unpin, toggle, isPinned };
}

/**
 * Hook for keyboard shortcuts
 */
export function useHUDKeyboard() {
  const { actions } = useHUD();

  // You can expand this with specific keyboard bindings
  const registerShortcut = (key: string, callback: () => void) => {
    // Implementation for keyboard shortcuts
  };

  return { registerShortcut };
}

/**
 * Hook to detect layout mode based on screen size
 */
export function useLayoutDetection() {
  const { state, actions } = useHUD();

  if (typeof window === 'undefined') return state.layoutMode;

  // Detect screen size
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  const detectMode = (): 'pc' | 'mobile-lite' | 'mobile-roam' => {
    if (isMobile) {
      // Could check for a flag to determine lite vs roam
      return 'mobile-lite';
    }
    return 'pc';
  };

  return detectMode();
}
