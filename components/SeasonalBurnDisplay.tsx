/**
 * SeasonalBurnDisplay.tsx
 * 
 * Example HUD component showing seasonal burn system info
 * Canonical Spec Section 9 - Frontend Requirements
 * 
 * Displays:
 * - Current season info
 * - XP zone status
 * - Daily/seasonal cap progress
 * - Time remaining
 */

import React from 'react';
import { useSeasonalBurn } from '../hooks/useSeasonalBurn';
import {
  formatCapStatus,
  getCapProgressColor,
  formatTimeRemaining,
  getTimeUntilDailyReset,
  getXPZone,
} from '../utils/seasonalBurnUtils';
import { formatEther } from 'viem';

export const SeasonalBurnDisplay: React.FC = () => {
  const {
    currentSeasonId,
    currentSeason,
    userSeasonState,
    userLifetimeState,
    dailyXPCap,
    seasonalXPCap,
    loading,
  } = useSeasonalBurn();

  if (loading) {
    return (
      <div className="seasonal-burn-display loading">
        <div className="spinner" />
        <span>Loading season data...</span>
      </div>
    );
  }

  if (!currentSeason || !userSeasonState) {
    return (
      <div className="seasonal-burn-display error">
        <span>⚠️ Season data unavailable</span>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DERIVED DATA
  // ═══════════════════════════════════════════════════════════════════════

  const seasonTime = formatTimeRemaining(currentSeason.endTime);
  const dailyResetTime = getTimeUntilDailyReset();
  
  const xpZone = getXPZone(userSeasonState.burnedToday, currentSeason.xpConfig);
  
  const dailyCap = formatCapStatus(
    userSeasonState.burnedToday,
    currentSeason.dailyCreditCap
  );
  
  const seasonCap = formatCapStatus(
    userSeasonState.burnedThisSeason,
    currentSeason.seasonCreditCap
  );

  const dailyCapColor = getCapProgressColor(dailyCap.percentUsed);
  const seasonCapColor = getCapProgressColor(seasonCap.percentUsed);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="seasonal-burn-display">
      {/* SEASON HEADER */}
      <div className="season-header">
        <div className="season-badge">
          <span className="season-label">SEASON</span>
          <span className="season-number">{currentSeasonId?.toString() || '0'}</span>
        </div>
        <div className="season-time">
          <span className="time-icon">⏱️</span>
          <span className="time-text">{seasonTime.formatted} remaining</span>
        </div>
      </div>

      {/* USER XP */}
      <div className="xp-section">
        <div className="xp-header">
          <span className="xp-label">Season XP</span>
          <span className="xp-value">{formatEther(userSeasonState.xp)} XP</span>
        </div>
        
        {/* XP ZONE INDICATOR */}
        <div className={`xp-zone zone-${xpZone.zone}`}>
          <div className="zone-badge">
            Zone {xpZone.zone} • {xpZone.multiplier}% XP
          </div>
          {xpZone.nextZoneAt && (
            <div className="zone-next">
              Next zone at {formatEther(xpZone.nextZoneAt)} VOID daily
            </div>
          )}
        </div>
      </div>

      {/* DAILY CAP */}
      <div className="cap-section">
        <div className="cap-header">
          <span className="cap-label">Daily Cap</span>
          <span className="cap-reset">Resets in {dailyResetTime.formatted}</span>
        </div>
        
        <div className="cap-bar-container">
          <div 
            className="cap-bar-fill" 
            style={{ 
              width: `${Math.min(dailyCap.percentUsed, 100)}%`,
              backgroundColor: dailyCapColor,
            }}
          />
        </div>
        
        <div className="cap-stats">
          <span className="cap-used">{dailyCap.usedFormatted} VOID</span>
          <span className="cap-total">/ {dailyCap.capFormatted} VOID</span>
          <span className="cap-percent">({dailyCap.percentUsed.toFixed(1)}%)</span>
        </div>

        {dailyCap.isCapped && (
          <div className="cap-warning">
            ⚠️ Daily cap reached. Utility still works, but no more XP today.
          </div>
        )}
      </div>

      {/* SEASONAL CAP */}
      <div className="cap-section">
        <div className="cap-header">
          <span className="cap-label">Season Cap</span>
          <span className="cap-reset">{seasonTime.days}d remaining</span>
        </div>
        
        <div className="cap-bar-container">
          <div 
            className="cap-bar-fill" 
            style={{ 
              width: `${Math.min(seasonCap.percentUsed, 100)}%`,
              backgroundColor: seasonCapColor,
            }}
          />
        </div>
        
        <div className="cap-stats">
          <span className="cap-used">{seasonCap.usedFormatted} VOID</span>
          <span className="cap-total">/ {seasonCap.capFormatted} VOID</span>
          <span className="cap-percent">({seasonCap.percentUsed.toFixed(1)}%)</span>
        </div>

        {seasonCap.isCapped && (
          <div className="cap-warning">
            ⚠️ Season cap reached. Utility still works, but no more XP this season.
          </div>
        )}
      </div>

      {/* LIFETIME STATS */}
      {userLifetimeState && (
        <div className="lifetime-section">
          <div className="lifetime-header">Lifetime Progress</div>
          <div className="lifetime-stats">
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <span className="stat-label">Total Burned</span>
              <span className="stat-value">
                {formatEther(userLifetimeState.totalBurnedAllTime)} VOID
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-label">Prestige</span>
              <span className="stat-value">Rank {userLifetimeState.prestigeRank}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎨</span>
              <span className="stat-label">Creator Tier</span>
              <span className="stat-value">Tier {userLifetimeState.creatorTier}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏛️</span>
              <span className="stat-label">Districts</span>
              <span className="stat-value">{userLifetimeState.districtsUnlocked}/5</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📱</span>
              <span className="stat-label">Mini-Apps</span>
              <span className="stat-value">{userLifetimeState.miniAppsUnlocked}</span>
            </div>
          </div>
        </div>
      )}

      {/* CANONICAL SPEC COMPLIANCE NOTICE */}
      <div className="compliance-notice">
        ℹ️ Caps never block utility. You can always burn VOID for actions.
      </div>
    </div>
  );
};

export default SeasonalBurnDisplay;
