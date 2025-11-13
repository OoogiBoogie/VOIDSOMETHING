"use client";

/**
 * @title DEFI Hub - Vault Management & Staking
 * @notice Phase 1 MVP: Vault positions + APR breakdown + staking panel
 * 
 * NO COSMETICS INTEGRATION
 */

import React from "react";

export function DefiHub() {
  return (
    <div className="defi-hub hub-container">
      <div className="hub-grid">
        {/* Vault Positions Window */}
        <div className="hub-window vault-positions">
          <div className="window-header">
            <span className="window-title">💎 YOUR VAULTS</span>
          </div>
          <div className="window-content">
            <div className="vault-list">
              <div className="vault-item healthy">
                <div className="vault-header">
                  <span className="vault-id">Vault #1</span>
                  <span className="vault-status">HEALTHY</span>
                </div>
                <div className="vault-stats">
                  <div className="stat">
                    <span className="stat-label">Collateral:</span>
                    <span className="stat-value">150%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Deposited:</span>
                    <span className="stat-value">1,000 USDC</span>
                  </div>
                </div>
              </div>
              
              <div className="vault-item warning">
                <div className="vault-header">
                  <span className="vault-id">Vault #2</span>
                  <span className="vault-status">WARNING</span>
                </div>
                <div className="vault-stats">
                  <div className="stat">
                    <span className="stat-label">Collateral:</span>
                    <span className="stat-value">115%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Deposited:</span>
                    <span className="stat-value">500 USDC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* APR Breakdown Card */}
        <div className="hub-window apr-breakdown">
          <div className="window-header">
            <span className="window-title">📈 APR BREAKDOWN</span>
          </div>
          <div className="window-content">
            <div className="apr-details">
              <div className="apr-row total">
                <span className="apr-label">Total APR:</span>
                <span className="apr-value">208%</span>
              </div>
              <div className="apr-divider" />
              <div className="apr-row">
                <span className="apr-label">Base Yield:</span>
                <span className="apr-value">188%</span>
              </div>
              <div className="apr-row">
                <span className="apr-label">XP Boost:</span>
                <span className="apr-value">+20%</span>
              </div>
              <div className="apr-divider" />
              <div className="apr-info">
                <div className="info-text">Boost unlocked at VOYAGER rank</div>
                <div className="info-text">Next boost tier: ARCHITECT (+30%)</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Staking Panel */}
        <div className="hub-window staking-panel">
          <div className="window-header">
            <span className="window-title">🔒 xVOID STAKING</span>
          </div>
          <div className="window-content">
            <div className="staking-info">
              <div className="staking-stat">
                <span className="stat-label">Your Stake:</span>
                <span className="stat-value">10,000 xVOID</span>
              </div>
              <div className="staking-stat">
                <span className="stat-label">Pending Rewards:</span>
                <span className="stat-value">125 USDC</span>
              </div>
              <div className="staking-stat">
                <span className="stat-label">Current APR:</span>
                <span className="stat-value apr-highlight">208%</span>
              </div>
              <div className="staking-actions">
                <button className="action-button deposit">DEPOSIT</button>
                <button className="action-button withdraw">WITHDRAW</button>
                <button className="action-button claim">CLAIM REWARDS</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .defi-hub {
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
          border: 2px solid #00ffff;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }
        
        .window-header {
          padding: 12px 16px;
          background: rgba(0, 255, 255, 0.1);
          border-bottom: 2px solid #00ffff;
        }
        
        .window-title {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          color: #00ffff;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .window-content {
          padding: 16px;
        }
        
        .vault-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .vault-item {
          padding: 12px;
          background: rgba(0, 255, 255, 0.05);
          border-left: 4px solid;
          transition: all 0.2s ease;
        }
        
        .vault-item.healthy { border-color: #00ff00; }
        .vault-item.warning { border-color: #ffff00; }
        .vault-item.critical { border-color: #ff0000; }
        
        .vault-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .vault-id {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #00ffff;
          font-weight: bold;
        }
        
        .vault-status {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          padding: 2px 8px;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .vault-item.healthy .vault-status { color: #00ff00; }
        .vault-item.warning .vault-status { color: #ffff00; }
        
        .vault-stats {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .stat {
          display: flex;
          justify-content: space-between;
          font-family: 'Courier New', monospace;
          font-size: 11px;
        }
        
        .stat-label {
          color: #888;
        }
        
        .stat-value {
          color: #00ffff;
          font-weight: bold;
        }
        
        .apr-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .apr-row {
          display: flex;
          justify-content: space-between;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }
        
        .apr-row.total {
          font-size: 16px;
          font-weight: bold;
        }
        
        .apr-row.total .apr-value {
          color: #ffff00;
          text-shadow: 0 0 8px #ffff00;
        }
        
        .apr-label {
          color: #888;
        }
        
        .apr-value {
          color: #00ffff;
        }
        
        .apr-divider {
          height: 1px;
          background: rgba(0, 255, 255, 0.3);
        }
        
        .apr-info {
          padding: 12px;
          background: rgba(0, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
        }
        
        .info-text {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #888;
          margin-bottom: 6px;
        }
        
        .staking-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .staking-stat {
          display: flex;
          justify-content: space-between;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }
        
        .apr-highlight {
          color: #ffff00 !important;
          text-shadow: 0 0 8px #ffff00;
          font-size: 14px !important;
        }
        
        .staking-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        
        .action-button {
          flex: 1;
          padding: 10px;
          background: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          color: #00ffff;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          background: rgba(0, 255, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .action-button.claim {
          border-color: #00ff00;
          color: #00ff00;
          background: rgba(0, 255, 0, 0.1);
        }
        
        .action-button.claim:hover {
          background: rgba(0, 255, 0, 0.2);
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
