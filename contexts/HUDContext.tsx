"use client";

/**
 * @title HUD Context - Global State for VOID HUD System
 * @notice Manages hub navigation, notifications, event bus, player stats
 * 
 * Phase 1 Scope:
 * - Hub switching (WORLD / CREATOR / DEFI)
 * - Toast notification system
 * - Event bus for contract + WebSocket events
 * - Player stats aggregation (XP / SIGNAL / rank)
 * 
 * Phase 2 (LOCKED):
 * - Cosmetic loadouts
 * - Inventory integration
 * - SKU ownership
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ============ TYPES ============

export type HubType = "WORLD" | "CREATOR" | "DEFI";

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number; // milliseconds, default 5000
}

export interface PlayerStats {
  xp: number;
  signal: number;
  rank: string;
  level: number;
}

export interface HUDEvent {
  type: string;
  payload: any;
  timestamp: number;
}

interface HUDContextValue {
  // Hub state
  activeHub: HubType;
  setActiveHub: (hub: HubType) => void;
  
  // Notifications
  notifications: ToastNotification[];
  addNotification: (notification: Omit<ToastNotification, "id">) => void;
  removeNotification: (id: string) => void;
  
  // Event bus
  events: HUDEvent[];
  publishEvent: (type: string, payload: any) => void;
  
  // Player stats
  playerStats: PlayerStats;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  
  // HUD visibility
  isHUDVisible: boolean;
  toggleHUD: () => void;
}

// ============ CONTEXT ============

const HUDContext = createContext<HUDContextValue | undefined>(undefined);

// ============ PROVIDER ============

interface HUDProviderProps {
  children: ReactNode;
  initialHub?: HubType;
}

export function HUDProvider({ children, initialHub = "WORLD" }: HUDProviderProps) {
  // Hub state
  const [activeHub, setActiveHub] = useState<HubType>(initialHub);
  
  // Notifications state
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  
  // Event bus state (keep last 100 events)
  const [events, setEvents] = useState<HUDEvent[]>([]);
  
  // Player stats state
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    xp: 0,
    signal: 0,
    rank: "INITIATE",
    level: 1,
  });
  
  // HUD visibility
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  
  // Add notification
  const addNotification = useCallback((notification: Omit<ToastNotification, "id">) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: ToastNotification = {
      id,
      ...notification,
      duration: notification.duration || 5000,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }, []);
  
  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Publish event to event bus
  const publishEvent = useCallback((type: string, payload: any) => {
    const event: HUDEvent = {
      type,
      payload,
      timestamp: Date.now(),
    };
    
    setEvents(prev => {
      const updated = [...prev, event];
      // Keep last 100 events
      return updated.slice(-100);
    });
  }, []);
  
  // Update player stats
  const updatePlayerStats = useCallback((stats: Partial<PlayerStats>) => {
    setPlayerStats(prev => ({ ...prev, ...stats }));
  }, []);
  
  // Toggle HUD visibility
  const toggleHUD = useCallback(() => {
    setIsHUDVisible(prev => !prev);
  }, []);
  
  const value: HUDContextValue = {
    activeHub,
    setActiveHub,
    notifications,
    addNotification,
    removeNotification,
    events,
    publishEvent,
    playerStats,
    updatePlayerStats,
    isHUDVisible,
    toggleHUD,
  };
  
  return <HUDContext.Provider value={value}>{children}</HUDContext.Provider>;
}

// ============ HOOK ============

export function useHUD() {
  const context = useContext(HUDContext);
  if (!context) {
    throw new Error("useHUD must be used within HUDProvider");
  }
  return context;
}

// ============ HELPER HOOKS ============

/**
 * Subscribe to specific event type
 */
export function useHUDEvent(eventType: string, callback: (payload: any) => void) {
  const { events } = useHUD();
  
  React.useEffect(() => {
    const latestEvent = events.find(e => e.type === eventType);
    if (latestEvent) {
      callback(latestEvent.payload);
    }
  }, [events, eventType, callback]);
}

/**
 * Quick notification helpers
 */
export function useNotifications() {
  const { addNotification } = useHUD();
  
  return {
    success: (title: string, message: string) => 
      addNotification({ type: "success", title, message }),
    
    error: (title: string, message: string) => 
      addNotification({ type: "error", title, message }),
    
    warning: (title: string, message: string) => 
      addNotification({ type: "warning", title, message }),
    
    info: (title: string, message: string) => 
      addNotification({ type: "info", title, message }),
  };
}
