"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { 
  HUDState, 
  HUDActions, 
  HubKey, 
  TabKey, 
  PinnedPanel, 
  Notification, 
  LayoutMode,
  ContextualData,
  WorldTabKey,
  CreatorTabKey,
  DeFiTabKey,
  GovernanceTabKey
} from './HUDTypes';

// Action types
type HUDAction =
  | { type: 'OPEN_HUB'; hub: HubKey }
  | { type: 'CLOSE_HUB' }
  | { type: 'SET_ACTIVE_TAB'; hub: HubKey; tab: TabKey }
  | { type: 'PIN_PANEL'; panel: PinnedPanel }
  | { type: 'UNPIN_PANEL'; panelId: string }
  | { type: 'PUSH_NOTIFICATION'; notification: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; notificationId: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'SET_LAYOUT_MODE'; mode: LayoutMode }
  | { type: 'SET_CONTEXTUAL_DATA'; data: ContextualData | undefined }
  | { type: 'NAVIGATE_TO'; hub: HubKey; tab: TabKey; params?: Record<string, any> };

// Initial state
const initialState: HUDState = {
  activeHub: null,
  activeTabs: {
    world: 'overview',
    creator: 'directory',
    defi: 'swap',
    governance: 'overview',
  },
  pinnedPanels: [],
  notifications: [],
  unreadCount: 0,
  layoutMode: 'pc', // Will be detected on mount
  contextualData: undefined,
};

// Reducer
function hudReducer(state: HUDState, action: HUDAction): HUDState {
  switch (action.type) {
    case 'OPEN_HUB':
      return { ...state, activeHub: action.hub };
    
    case 'CLOSE_HUB':
      return { ...state, activeHub: null };
    
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTabs: {
          ...state.activeTabs,
          [action.hub]: action.tab,
        },
      };
    
    case 'PIN_PANEL': {
      // Check if already pinned
      if (state.pinnedPanels.some(p => p.id === action.panel.id)) {
        return state;
      }
      return {
        ...state,
        pinnedPanels: [...state.pinnedPanels, action.panel],
      };
    }
    
    case 'UNPIN_PANEL':
      return {
        ...state,
        pinnedPanels: state.pinnedPanels.filter(p => p.id !== action.panelId),
      };
    
    case 'PUSH_NOTIFICATION': {
      const unreadCount = state.unreadCount + 1;
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
        unreadCount,
      };
    }
    
    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.notificationId ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter(n => !n.read).length;
      return { ...state, notifications, unreadCount };
    }
    
    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications, unreadCount: 0 };
    }
    
    case 'SET_LAYOUT_MODE':
      return { ...state, layoutMode: action.mode };
    
    case 'SET_CONTEXTUAL_DATA':
      return { ...state, contextualData: action.data };
    
    case 'NAVIGATE_TO':
      return {
        ...state,
        activeHub: action.hub,
        activeTabs: {
          ...state.activeTabs,
          [action.hub]: action.tab,
        },
      };
    
    default:
      return state;
  }
}

// Context
const HUDStateContext = createContext<HUDState | undefined>(undefined);
const HUDActionsContext = createContext<HUDActions | undefined>(undefined);

// Provider
interface HUDProviderProps {
  children: React.ReactNode;
  initialLayoutMode?: LayoutMode;
}

export function HUDProvider({ children, initialLayoutMode }: HUDProviderProps) {
  const [state, dispatch] = useReducer(hudReducer, {
    ...initialState,
    layoutMode: initialLayoutMode || initialState.layoutMode,
  });

  // Actions
  const openHub = useCallback((hub: HubKey) => {
    dispatch({ type: 'OPEN_HUB', hub });
  }, []);

  const closeHub = useCallback(() => {
    dispatch({ type: 'CLOSE_HUB' });
  }, []);

  const setActiveTab = useCallback((hub: HubKey, tab: TabKey) => {
    dispatch({ type: 'SET_ACTIVE_TAB', hub, tab });
  }, []);

  const pinPanel = useCallback((panel: Omit<PinnedPanel, 'id'>) => {
    const pinnedPanel: PinnedPanel = {
      ...panel,
      id: `${panel.hub}-${panel.tab}-${panel.panelId || 'default'}-${Date.now()}`,
    };
    dispatch({ type: 'PIN_PANEL', panel: pinnedPanel });
  }, []);

  const unpinPanel = useCallback((panelId: string) => {
    dispatch({ type: 'UNPIN_PANEL', panelId });
  }, []);

  const pushNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const fullNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      read: false,
    };
    dispatch({ type: 'PUSH_NOTIFICATION', notification: fullNotification });
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    dispatch({ type: 'SET_LAYOUT_MODE', mode });
  }, []);

  const setContextualData = useCallback((data: ContextualData | undefined) => {
    dispatch({ type: 'SET_CONTEXTUAL_DATA', data });
  }, []);

  const navigateTo = useCallback((hub: HubKey, tab: TabKey, params?: Record<string, any>) => {
    dispatch({ type: 'NAVIGATE_TO', hub, tab, params });
  }, []);

  const actions: HUDActions = {
    openHub,
    closeHub,
    setActiveTab,
    pinPanel,
    unpinPanel,
    pushNotification,
    markNotificationRead,
    markAllNotificationsRead,
    setLayoutMode,
    setContextualData,
    navigateTo,
  };

  // Persist pinned panels to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hud-pinned-panels', JSON.stringify(state.pinnedPanels));
    }
  }, [state.pinnedPanels]);

  // Load pinned panels from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hud-pinned-panels');
      if (saved) {
        try {
          const panels = JSON.parse(saved);
          panels.forEach((panel: PinnedPanel) => {
            dispatch({ type: 'PIN_PANEL', panel });
          });
        } catch (e) {
          console.error('Failed to load pinned panels', e);
        }
      }
    }
  }, []);

  return (
    <HUDStateContext.Provider value={state}>
      <HUDActionsContext.Provider value={actions}>
        {children}
      </HUDActionsContext.Provider>
    </HUDStateContext.Provider>
  );
}

// Hooks
export function useHUDState() {
  const context = useContext(HUDStateContext);
  if (context === undefined) {
    throw new Error('useHUDState must be used within HUDProvider');
  }
  return context;
}

export function useHUDActions() {
  const context = useContext(HUDActionsContext);
  if (context === undefined) {
    throw new Error('useHUDActions must be used within HUDProvider');
  }
  return context;
}

export function useHUD() {
  return {
    state: useHUDState(),
    actions: useHUDActions(),
  };
}
