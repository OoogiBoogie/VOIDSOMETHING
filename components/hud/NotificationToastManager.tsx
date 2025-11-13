"use client";

/**
 * @title Notification Toast Manager
 * @notice Displays toast notifications from HUD event bus
 * 
 * Features:
 * - Auto-dismiss after duration
 * - Stacking notifications (max 5 visible)
 * - PSX-style alert colors
 * - Click to dismiss
 */

import React from "react";
import { useHUD, type ToastNotification } from "@/contexts/HUDContext";

// ============ TOAST COLORS ============

const TOAST_COLORS = {
  success: { bg: "rgba(0, 255, 0, 0.9)", border: "#00ff00", icon: "✓" },
  error: { bg: "rgba(255, 0, 0, 0.9)", border: "#ff0000", icon: "✕" },
  warning: { bg: "rgba(255, 255, 0, 0.9)", border: "#ffff00", icon: "⚠" },
  info: { bg: "rgba(0, 255, 255, 0.9)", border: "#00ffff", icon: "ℹ" },
};

// ============ SINGLE TOAST ============

function Toast({ notification }: { notification: ToastNotification }) {
  const { removeNotification } = useHUD();
  const colors = TOAST_COLORS[notification.type];
  
  return (
    <div
      className="toast"
      onClick={() => removeNotification(notification.id)}
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="toast-icon" style={{ color: colors.border }}>
        {colors.icon}
      </div>
      
      <div className="toast-content">
        <div className="toast-title">{notification.title}</div>
        <div className="toast-message">{notification.message}</div>
      </div>
      
      <style jsx>{`
        .toast {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(0, 255, 0, 0.9);
          border: 2px solid #00ff00;
          min-width: 300px;
          max-width: 400px;
          cursor: pointer;
          animation: slideIn 0.3s ease-out;
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        
        .toast:hover {
          opacity: 0.8;
          transform: translateX(-4px);
        }
        
        .toast-icon {
          font-size: 20px;
          font-weight: bold;
          flex-shrink: 0;
          filter: drop-shadow(0 0 4px currentColor);
        }
        
        .toast-content {
          flex: 1;
          color: #000;
        }
        
        .toast-title {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        
        .toast-message {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// ============ TOAST MANAGER ============

export function NotificationToastManager() {
  const { notifications } = useHUD();
  
  // Show max 5 most recent notifications
  const visibleNotifications = notifications.slice(-5);
  
  if (visibleNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className="toast-manager">
      {visibleNotifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
      
      <style jsx>{`
        .toast-manager {
          position: fixed;
          bottom: 20px;
          right: 20px;
          display: flex;
          flex-direction: column-reverse;
          align-items: flex-end;
          z-index: 2000;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
