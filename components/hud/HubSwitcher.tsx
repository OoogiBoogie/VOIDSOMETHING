"use client";

/**
 * @title Hub Switcher - Navigation between WORLD / CREATOR / DEFI hubs
 * @notice PSX-style tab navigation with glitch effects
 * 
 * Phase 1: 3 core hubs
 * Phase 2: Unlock MARKET hub (cosmetics)
 */

import React from "react";
import { useHUD, type HubType } from "@/contexts/HUDContext";

// ============ HUB CONFIG ============

const HUBS: { id: HubType; label: string; icon: string; color: string }[] = [
  { id: "WORLD", label: "WORLD", icon: "🌐", color: "#00ff00" },
  { id: "CREATOR", label: "CREATOR", icon: "🎨", color: "#ff00ff" },
  { id: "DEFI", label: "DEFI", icon: "💰", color: "#00ffff" },
];

// ============ COMPONENT ============

export function HubSwitcher() {
  const { activeHub, setActiveHub } = useHUD();
  
  return (
    <div className="hub-switcher">
      {HUBS.map((hub) => (
        <button
          key={hub.id}
          className={`hub-tab ${activeHub === hub.id ? "active" : ""}`}
          onClick={() => setActiveHub(hub.id)}
          style={{
            borderColor: activeHub === hub.id ? hub.color : "#333",
            color: activeHub === hub.id ? hub.color : "#666",
          }}
        >
          <span className="hub-icon">{hub.icon}</span>
          <span className="hub-label">{hub.label}</span>
        </button>
      ))}
      
      <style jsx>{`
        .hub-switcher {
          display: flex;
          gap: 8px;
        }
        
        .hub-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid;
          border-radius: 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }
        
        .hub-tab:hover {
          background: rgba(0, 255, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .hub-tab.active {
          background: rgba(0, 255, 0, 0.15);
          box-shadow: 
            0 0 10px currentColor,
            inset 0 0 10px rgba(0, 255, 0, 0.2);
        }
        
        .hub-tab.active::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: currentColor;
          opacity: 0.1;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .hub-icon {
          font-size: 16px;
          filter: drop-shadow(0 0 4px currentColor);
        }
        
        .hub-label {
          letter-spacing: 1px;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        /* PSX glitch on active tab */
        .hub-tab.active:hover .hub-label {
          animation: glitch 0.3s infinite;
        }
        
        @keyframes glitch {
          0%, 100% {
            text-shadow: none;
          }
          25% {
            text-shadow: 
              2px 0 0 rgba(255, 0, 0, 0.5),
              -2px 0 0 rgba(0, 255, 255, 0.5);
          }
          50% {
            text-shadow: 
              -2px 0 0 rgba(255, 0, 0, 0.5),
              2px 0 0 rgba(0, 255, 255, 0.5);
          }
          75% {
            text-shadow: 
              0 2px 0 rgba(255, 0, 0, 0.5),
              0 -2px 0 rgba(0, 255, 255, 0.5);
          }
        }
      `}</style>
    </div>
  );
}
