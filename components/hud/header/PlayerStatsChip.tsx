"use client";

/**
 * @title Player Stats Chip - HUD Header Display
 * @notice Shows XP, SIGNAL, and rank in PSX-style compact format
 * 
 * Phase 1: Read from context (simulated values)
 * Phase 2: Wire to XPOracle contract + SIGNAL token balance
 * 
 * NO COSMETICS INTEGRATION
 */

import React, { useEffect } from "react";
import { useHUD } from "@/contexts/HUDContext";

// ============ RANK THRESHOLDS ============

const RANK_THRESHOLDS = [
  { rank: "INITIATE", minXP: 0, color: "#888" },
  { rank: "VOYAGER", minXP: 100, color: "#00ff00" },
  { rank: "ARCHITECT", minXP: 500, color: "#00ffff" },
  { rank: "ORACLE", minXP: 2000, color: "#ff00ff" },
  { rank: "VOID_WALKER", minXP: 10000, color: "#ffff00" },
];

function getRankFromXP(xp: number) {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RANK_THRESHOLDS[i].minXP) {
      return RANK_THRESHOLDS[i];
    }
  }
  return RANK_THRESHOLDS[0];
}

// ============ COMPONENT ============

export function PlayerStatsChip() {
  const { playerStats, updatePlayerStats } = useHUD();
  
  // Simulate XP/SIGNAL updates for Phase 1 testing
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Initialize with test values
      updatePlayerStats({
        xp: 250,
        signal: 1500,
        rank: "VOYAGER",
        level: 3,
      });
    }
  }, [updatePlayerStats]);
  
  const rankInfo = getRankFromXP(playerStats.xp);
  const nextRank = RANK_THRESHOLDS.find(r => r.minXP > playerStats.xp);
  const progress = nextRank 
    ? ((playerStats.xp - rankInfo.minXP) / (nextRank.minXP - rankInfo.minXP)) * 100
    : 100;
  
  return (
    <div className="player-stats-chip">
      {/* Rank Badge */}
      <div className="stat-badge rank-badge" style={{ borderColor: rankInfo.color, color: rankInfo.color }}>
        <div className="stat-label">RANK</div>
        <div className="stat-value">{rankInfo.rank}</div>
      </div>
      
      {/* XP Display */}
      <div className="stat-badge xp-badge">
        <div className="stat-label">XP</div>
        <div className="stat-value">{playerStats.xp.toLocaleString()}</div>
        {nextRank && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      
      {/* SIGNAL Display */}
      <div className="stat-badge signal-badge">
        <div className="stat-label">SIGNAL</div>
        <div className="stat-value">{playerStats.signal.toLocaleString()}</div>
      </div>
      
      <style jsx>{`
        .player-stats-chip {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .stat-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #00ff00;
          position: relative;
          min-width: 80px;
        }
        
        .stat-label {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        
        .stat-value {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: bold;
          color: #00ff00;
          letter-spacing: 1px;
        }
        
        .rank-badge .stat-value {
          font-size: 12px;
        }
        
        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(0, 255, 0, 0.2);
        }
        
        .progress-fill {
          height: 100%;
          background: #00ff00;
          transition: width 0.3s ease;
          box-shadow: 0 0 6px #00ff00;
        }
        
        /* Glowing effect on badges */
        .stat-badge {
          box-shadow: 
            0 0 10px rgba(0, 255, 0, 0.3),
            inset 0 0 10px rgba(0, 255, 0, 0.1);
        }
        
        .rank-badge {
          box-shadow: 
            0 0 10px currentColor,
            inset 0 0 10px rgba(255, 255, 255, 0.1);
        }
        
        /* Pulse animation on XP badge */
        .xp-badge:hover {
          animation: pulse 1s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 
              0 0 10px rgba(0, 255, 0, 0.3),
              inset 0 0 10px rgba(0, 255, 0, 0.1);
          }
          50% {
            box-shadow: 
              0 0 20px rgba(0, 255, 0, 0.5),
              inset 0 0 20px rgba(0, 255, 0, 0.2);
          }
        }
      `}</style>
    </div>
  );
}
