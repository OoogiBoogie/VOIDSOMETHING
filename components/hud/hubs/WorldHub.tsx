"use client";

/**
 * @title World Hub - Mission & District Activity
 * @notice Phase 1 MVP: Mission browser + parcel info + activity feed
 * 
 * NO COSMETICS INTEGRATION
 */

import React from "react";

export function WorldHub() {
  return (
    <div className="world-hub hub-container">
      <div className="hub-grid">
        {/* Mission Browser Window */}
        <div className="hub-window mission-browser">
          <div className="window-header">
            <span className="window-title">🎯 ACTIVE MISSIONS</span>
          </div>
          <div className="window-content">
            <div className="mission-list">
              <div className="mission-item easy">
                <div className="mission-title">Explore Plaza District</div>
                <div className="mission-reward">+50 XP, +25 SIGNAL</div>
              </div>
              <div className="mission-item medium">
                <div className="mission-title">Complete 3 Vault Deposits</div>
                <div className="mission-reward">+150 XP, +100 SIGNAL</div>
              </div>
              <div className="mission-item hard">
                <div className="mission-title">Achieve ARCHITECT Rank</div>
                <div className="mission-reward">+500 XP, +300 SIGNAL</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Parcel Info Panel */}
        <div className="hub-window parcel-info">
          <div className="window-header">
            <span className="window-title">📍 CURRENT PARCEL</span>
          </div>
          <div className="window-content">
            <div className="parcel-details">
              <div className="detail-row">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">X: 20, Y: 15</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">District:</span>
                <span className="detail-value">PLAZA</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Owner:</span>
                <span className="detail-value">DAO_TREASURY</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Activity:</span>
                <span className="detail-value activity-high">HIGH</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Activity Feed */}
        <div className="hub-window activity-feed">
          <div className="window-header">
            <span className="window-title">📡 DISTRICT ACTIVITY</span>
          </div>
          <div className="window-content">
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-time">2m ago</span>
                <span className="activity-text">Player joined PLAZA district</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">5m ago</span>
                <span className="activity-text">Mission completed: Explore Plaza</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">8m ago</span>
                <span className="activity-text">Vault created in DEFI district</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .world-hub {
          padding: 20px;
          height: 100%;
          overflow-y: auto;
        }
        
        .hub-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 16px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .hub-window {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #00ff00;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        
        .window-header {
          padding: 12px 16px;
          background: rgba(0, 255, 0, 0.1);
          border-bottom: 2px solid #00ff00;
        }
        
        .window-title {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          color: #00ff00;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .window-content {
          padding: 16px;
        }
        
        .mission-browser {
          grid-column: 1 / 2;
          grid-row: 1 / 3;
        }
        
        .mission-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .mission-item {
          padding: 12px;
          background: rgba(0, 255, 0, 0.05);
          border-left: 4px solid;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .mission-item.easy { border-color: #00ff00; }
        .mission-item.medium { border-color: #ffff00; }
        .mission-item.hard { border-color: #ff00ff; }
        
        .mission-item:hover {
          background: rgba(0, 255, 0, 0.1);
          transform: translateX(4px);
        }
        
        .mission-title {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #00ff00;
          margin-bottom: 6px;
        }
        
        .mission-reward {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #888;
        }
        
        .parcel-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }
        
        .detail-label {
          color: #888;
        }
        
        .detail-value {
          color: #00ff00;
          font-weight: bold;
        }
        
        .activity-high {
          color: #ff00ff !important;
          text-shadow: 0 0 4px #ff00ff;
        }
        
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .activity-item {
          display: flex;
          gap: 12px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          padding: 8px;
          background: rgba(0, 255, 0, 0.03);
          border-bottom: 1px solid rgba(0, 255, 0, 0.2);
        }
        
        .activity-time {
          color: #666;
          min-width: 60px;
        }
        
        .activity-text {
          color: #00ff00;
        }
      `}</style>
    </div>
  );
}
