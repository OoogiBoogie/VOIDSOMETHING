'use client';

import React from 'react';
import { useSeasonalBurn } from '@/hooks/useSeasonalBurn';
import { formatTimeRemaining, getCapProgressColor } from '@/utils/seasonalBurnUtils';
import styles from './SeasonDashboard.module.css';

interface SeasonDashboardProps {
  onClose: () => void;
}

export function SeasonDashboard({ onClose }: SeasonDashboardProps) {
  const {
    currentSeasonId,
    currentSeason,
    userSeasonState,
    dailyXPCap,
    seasonalXPCap,
    isLoading,
    error,
  } = useSeasonalBurn();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading Season {currentSeasonId} data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!currentSeason) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>No active season found</p>
        </div>
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = currentSeason.endTime - now;
  const seasonProgress = ((now - currentSeason.startTime) / currentSeason.duration) * 100;

  const dailyProgress = userSeasonState 
    ? (userSeasonState.dailyCreditsUsed / dailyXPCap) * 100 
    : 0;
  const seasonalProgress = userSeasonState 
    ? (userSeasonState.seasonalCreditsUsed / seasonalXPCap) * 100 
    : 0;

  const dailyRemaining = userSeasonState 
    ? Math.max(0, dailyXPCap - userSeasonState.dailyCreditsUsed) 
    : dailyXPCap;
  const seasonalRemaining = userSeasonState 
    ? Math.max(0, seasonalXPCap - userSeasonState.seasonalCreditsUsed) 
    : seasonalXPCap;

  return (
    <div className={styles.container}>
      {/* Season Header */}
      <div className={styles.header}>
        <div className={styles.seasonBadge}>
          <span className={styles.seasonLabel}>SEASON</span>
          <span className={styles.seasonNumber}>{currentSeasonId}</span>
        </div>
        <div className={styles.timeRemaining}>
          <span className={styles.timeLabel}>TIME REMAINING</span>
          <span className={styles.timeValue}>{formatTimeRemaining(timeRemaining)}</span>
        </div>
      </div>

      {/* Season Progress Bar */}
      <div className={styles.seasonProgress}>
        <div className={styles.progressLabel}>
          <span>Season Progress</span>
          <span>{Math.round(seasonProgress)}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${Math.min(100, seasonProgress)}%` }}
          />
        </div>
      </div>

      {/* XP Zones Explanation */}
      <div className={styles.zonesSection}>
        <h3 className={styles.sectionTitle}>XP ZONES (Daily Credits)</h3>
        <div className={styles.zonesList}>
          <div className={`${styles.zone} ${styles.zone1}`}>
            <div className={styles.zoneHeader}>
              <span className={styles.zoneName}>ZONE 1</span>
              <span className={styles.zoneMultiplier}>100% XP</span>
            </div>
            <p className={styles.zoneRange}>0 - 3,000 VOID/day</p>
          </div>
          <div className={`${styles.zone} ${styles.zone2}`}>
            <div className={styles.zoneHeader}>
              <span className={styles.zoneName}>ZONE 2</span>
              <span className={styles.zoneMultiplier}>50% XP</span>
            </div>
            <p className={styles.zoneRange}>3,000 - 6,000 VOID/day</p>
          </div>
          <div className={`${styles.zone} ${styles.zone3}`}>
            <div className={styles.zoneHeader}>
              <span className={styles.zoneName}>ZONE 3</span>
              <span className={styles.zoneMultiplier}>0% XP</span>
            </div>
            <p className={styles.zoneRange}>6,000+ VOID/day</p>
          </div>
        </div>
      </div>

      {/* Cap Status */}
      <div className={styles.capsSection}>
        <h3 className={styles.sectionTitle}>YOUR CAP STATUS</h3>
        
        {/* Daily Cap */}
        <div className={styles.capCard}>
          <div className={styles.capHeader}>
            <span className={styles.capLabel}>Daily Credits</span>
            <span className={styles.capValues}>
              {userSeasonState?.dailyCreditsUsed.toLocaleString() || 0} / {dailyXPCap.toLocaleString()} VOID
            </span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${styles[getCapProgressColor(dailyProgress)]}`}
              style={{ width: `${Math.min(100, dailyProgress)}%` }}
            />
          </div>
          <p className={styles.capRemaining}>
            {dailyRemaining.toLocaleString()} VOID remaining today
          </p>
        </div>

        {/* Seasonal Cap */}
        <div className={styles.capCard}>
          <div className={styles.capHeader}>
            <span className={styles.capLabel}>Seasonal Credits</span>
            <span className={styles.capValues}>
              {userSeasonState?.seasonalCreditsUsed.toLocaleString() || 0} / {seasonalXPCap.toLocaleString()} VOID
            </span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${styles[getCapProgressColor(seasonalProgress)]}`}
              style={{ width: `${Math.min(100, seasonalProgress)}%` }}
            />
          </div>
          <p className={styles.capRemaining}>
            {seasonalRemaining.toLocaleString()} VOID remaining this season
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className={styles.notice}>
        <p className={styles.noticeTitle}>⚡ CANONICAL PRINCIPLE</p>
        <p className={styles.noticeText}>
          Caps <strong>NEVER</strong> block utility. You can always burn for district access, 
          land upgrades, creator tools, prestige, and mini-app features. Caps only affect XP rewards.
        </p>
      </div>
    </div>
  );
}
