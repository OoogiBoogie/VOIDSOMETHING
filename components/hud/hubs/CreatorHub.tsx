"use client";

/**
 * @title Creator Hub - Dashboard & Featured SKUs
 * @notice Phase 1 MVP: Creator stats + featured cosmetics (DISPLAY ONLY)
 * 
 * NO COSMETICS INTEGRATION (display only, no purchasing)
 */

import React from "react";

export function CreatorHub() {
  return (
    <div className="creator-hub hub-container">
      <div className="hub-grid">
        {/* Creator Dashboard Window */}
        <div className="hub-window creator-dashboard">
          <div className="window-header">
            <span className="window-title">🎨 CREATOR DASHBOARD</span>
          </div>
          <div className="window-content">
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-label">Total Earnings</div>
                <div className="stat-value">$2,400</div>
                <div className="stat-subtitle">Last 7 days</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Royalties Earned</div>
                <div className="stat-value">$960</div>
                <div className="stat-subtitle">40% of sales</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Active SKUs</div>
                <div className="stat-value">12</div>
                <div className="stat-subtitle">3 trending</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Total Sales</div>
                <div className="stat-value">240</div>
                <div className="stat-subtitle">+15% this week</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured SKUs Window (DISPLAY ONLY - NO PURCHASE) */}
        <div className="hub-window featured-skus">
          <div className="window-header">
            <span className="window-title">✨ FEATURED COSMETICS</span>
            <span className="window-subtitle">(Display Only - Phase 2 Integration)</span>
          </div>
          <div className="window-content">
            <div className="sku-grid">
              <div className="sku-card">
                <div className="sku-preview">🎭</div>
                <div className="sku-name">Void Mask</div>
                <div className="sku-creator">by @voidlord</div>
                <div className="sku-price">50 USDC</div>
                <div className="sku-badge locked">LOCKED</div>
              </div>
              
              <div className="sku-card">
                <div className="sku-preview">👕</div>
                <div className="sku-name">Cyber Jacket</div>
                <div className="sku-creator">by @neonwave</div>
                <div className="sku-price">100 USDC</div>
                <div className="sku-badge locked">LOCKED</div>
              </div>
              
              <div className="sku-card">
                <div className="sku-preview">✨</div>
                <div className="sku-name">Holo Aura</div>
                <div className="sku-creator">by @pixelmage</div>
                <div className="sku-price">75 USDC</div>
                <div className="sku-badge locked">LOCKED</div>
              </div>
            </div>
            
            <div className="phase2-notice">
              <div className="notice-icon">🔒</div>
              <div className="notice-text">
                <div className="notice-title">Cosmetics System Locked</div>
                <div className="notice-subtitle">
                  Unlock conditions: HUD_CORE=stable · CONTRACTS=verified · AI_SERVICES=responsive
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Creator Royalty Breakdown */}
        <div className="hub-window royalty-breakdown">
          <div className="window-header">
            <span className="window-title">💰 ROYALTY BREAKDOWN</span>
          </div>
          <div className="window-content">
            <div className="royalty-chart">
              <div className="royalty-row">
                <span className="royalty-label">Your Royalties:</span>
                <span className="royalty-value">40%</span>
                <span className="royalty-amount">$960</span>
              </div>
              <div className="royalty-row">
                <span className="royalty-label">xVOID Stakers:</span>
                <span className="royalty-value">20%</span>
                <span className="royalty-amount">$480</span>
              </div>
              <div className="royalty-row">
                <span className="royalty-label">PSX Treasury:</span>
                <span className="royalty-value">10%</span>
                <span className="royalty-amount">$240</span>
              </div>
              <div className="royalty-row">
                <span className="royalty-label">CREATE Treasury:</span>
                <span className="royalty-value">10%</span>
                <span className="royalty-amount">$240</span>
              </div>
              <div className="royalty-row">
                <span className="royalty-label">Agency Ops:</span>
                <span className="royalty-value">10%</span>
                <span className="royalty-amount">$240</span>
              </div>
              <div className="royalty-row">
                <span className="royalty-label">Creator Grants:</span>
                <span className="royalty-value">5%</span>
                <span className="royalty-amount">$120</span>
              </div>
              <div className="royalty-row">
                <span className="royalty-label">Security:</span>
                <span className="royalty-value">5%</span>
                <span className="royalty-amount">$120</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .creator-hub {
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
          border: 2px solid #ff00ff;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
        }
        
        .window-header {
          padding: 12px 16px;
          background: rgba(255, 0, 255, 0.1);
          border-bottom: 2px solid #ff00ff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .window-title {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          color: #ff00ff;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .window-subtitle {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: #888;
        }
        
        .window-content {
          padding: 16px;
        }
        
        .dashboard-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .stat-card {
          padding: 16px;
          background: rgba(255, 0, 255, 0.05);
          border: 1px solid rgba(255, 0, 255, 0.3);
          text-align: center;
        }
        
        .stat-label {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-family: 'Courier New', monospace;
          font-size: 24px;
          color: #ff00ff;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .stat-subtitle {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: #666;
        }
        
        .sku-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .sku-card {
          padding: 12px;
          background: rgba(255, 0, 255, 0.05);
          border: 1px solid rgba(255, 0, 255, 0.3);
          text-align: center;
          position: relative;
          opacity: 0.5;
        }
        
        .sku-preview {
          font-size: 40px;
          margin-bottom: 8px;
          filter: grayscale(1);
        }
        
        .sku-name {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #ff00ff;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .sku-creator {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .sku-price {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #888;
        }
        
        .sku-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #ff0000;
          color: #ff0000;
          font-family: 'Courier New', monospace;
          font-size: 9px;
          font-weight: bold;
        }
        
        .phase2-notice {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 0, 0, 0.1);
          border: 2px solid #ff0000;
        }
        
        .notice-icon {
          font-size: 32px;
        }
        
        .notice-title {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #ff0000;
          font-weight: bold;
          margin-bottom: 6px;
        }
        
        .notice-subtitle {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #888;
        }
        
        .royalty-chart {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .royalty-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: rgba(255, 0, 255, 0.05);
          border-left: 3px solid #ff00ff;
          font-family: 'Courier New', monospace;
          font-size: 11px;
        }
        
        .royalty-label {
          color: #888;
          flex: 1;
        }
        
        .royalty-value {
          color: #ff00ff;
          font-weight: bold;
          min-width: 60px;
          text-align: center;
        }
        
        .royalty-amount {
          color: #00ff00;
          font-weight: bold;
          min-width: 80px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
