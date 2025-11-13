"use client";

/**
 * @title HUD Root - Main HUD Layout Container
 * @notice PSX-inspired HUD with 3 navigable hubs (WORLD / CREATOR / DEFI)
 * 
 * Architecture:
 * - Top rail: PlayerStatsChip + HubSwitcher
 * - Center: Active hub content (WorldHub / CreatorHub / DefiHub)
 * - Bottom rail: NotificationToastManager
 * - Side rail: Quick actions (minimal Phase 1)
 * 
 * Design Constraints:
 * - No scrollbars on main HUD
 * - Fixed viewport height (100vh)
 * - Hub content scrolls internally if needed
 * - CRT shader overlay compatible
 */

import React from "react";
import { HUDProvider, useHUD } from "@/contexts/HUDContext";
import { useHUDEventBus } from "@/hooks/useHUDEventBus";
import { HubSwitcher } from "@/components/hud/HubSwitcher";
import { NotificationToastManager } from "@/components/hud/NotificationToastManager";
import { PlayerStatsChip } from "@/components/hud/header/PlayerStatsChip";

// Hub components (created in Tasks 3-5)
import { WorldHub } from "@/components/hud/hubs/WorldHub";
import { CreatorHub } from "@/components/hud/hubs/CreatorHub";
import { DefiHub } from "@/components/hud/hubs/DefiHub";

// ============ HUD ROOT COMPONENT ============

function HUDRootInner() {
  const { activeHub, isHUDVisible } = useHUD();
  
  // Initialize event bus
  useHUDEventBus();
  
  if (!isHUDVisible) {
    return null;
  }
  
  return (
    <div className="hud-root">
      {/* Top Rail: Header */}
      <div className="hud-header">
        <PlayerStatsChip />
        <HubSwitcher />
        <div className="hud-header-spacer" />
      </div>
      
      {/* Center: Active Hub Content */}
      <div className="hud-content">
        {activeHub === "WORLD" && <WorldHub />}
        {activeHub === "CREATOR" && <CreatorHub />}
        {activeHub === "DEFI" && <DefiHub />}
      </div>
      
      {/* Bottom Rail: Notifications */}
      <NotificationToastManager />
      
      {/* PSX-style scanlines (optional, matches CRTOverlay) */}
      <div className="hud-scanlines" />
      
      <style jsx>{`
        .hud-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          font-family: 'Courier New', monospace;
          color: #00ff00;
        }
        
        .hud-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          background: rgba(0, 0, 0, 0.7);
          border-bottom: 2px solid #00ff00;
          pointer-events: auto;
          flex-shrink: 0;
        }
        
        .hud-header-spacer {
          flex: 1;
        }
        
        .hud-content {
          flex: 1;
          overflow: hidden;
          pointer-events: auto;
          position: relative;
        }
        
        .hud-scanlines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 255, 0, 0.03) 0px,
            rgba(0, 255, 0, 0.03) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          z-index: 10;
        }
        
        /* PSX-style glitch effect on hover */
        .hud-header:hover {
          text-shadow: 
            2px 0 0 rgba(255, 0, 0, 0.3),
            -2px 0 0 rgba(0, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

// ============ HUD ROOT WITH PROVIDER ============

export function HUDRoot() {
  return (
    <HUDProvider>
      <HUDRootInner />
    </HUDProvider>
  );
}
