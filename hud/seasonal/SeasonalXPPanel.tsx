'use client';

import React from 'react';
import { useSeasonalBurn } from '@/hooks/useSeasonalBurn';
import { useAccount } from 'wagmi';
import styles from './SeasonalXPPanel.module.css';

interface SeasonalXPPanelProps {
  onClose: () => void;
}

export function SeasonalXPPanel({ onClose }: SeasonalXPPanelProps) {
  const { address } = useAccount();
  const {
    currentSeasonId,
    userSeasonState,
    userLifetimeState,
    isLoading,
    error,
  } = useSeasonalBurn();

  if (!address) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>⚠️ Connect wallet to view XP stats</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading XP data...</p>
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

  const lifetimeXP = userLifetimeState?.totalXPEarned || 0;
  const lifetimeLevel = userLifetimeState?.currentLevel || 1;
  const seasonalXP = userSeasonState?.xpEarned || 0;
  const airdropWeight = userSeasonState?.airdropWeight || 0;

  // Calculate level progress (assuming 1000 XP per level)
  const xpPerLevel = 1000;
  const currentLevelXP = lifetimeXP % xpPerLevel;
  const levelProgress = (currentLevelXP / xpPerLevel) * 100;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>XP & REWARDS</h2>
        <p className={styles.address}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>

      {/* Lifetime Stats */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>LIFETIME STATS</h3>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total XP Earned</span>
            <span className={styles.statValue}>{lifetimeXP.toLocaleString()}</span>
          </div>
          <div className={styles.statDescription}>
            All-time XP from burning VOID across all seasons
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Current Level</span>
            <span className={styles.statValue}>Level {lifetimeLevel}</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${Math.min(100, levelProgress)}%` }}
            />
          </div>
          <div className={styles.levelProgress}>
            <span>{currentLevelXP.toLocaleString()} / {xpPerLevel.toLocaleString()} XP</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
        </div>
      </div>

      {/* Season Stats */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>SEASON {currentSeasonId} STATS</h3>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Season XP</span>
            <span className={styles.statValue}>{seasonalXP.toLocaleString()}</span>
          </div>
          <div className={styles.statDescription}>
            XP earned this season (resets at season end)
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Airdrop Weight</span>
            <span className={styles.statValue}>{airdropWeight.toLocaleString()}</span>
          </div>
          <div className={styles.statDescription}>
            Your share of seasonal airdrops (based on burn activity & multipliers)
          </div>
        </div>
      </div>

      {/* Multipliers */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>ACTIVE MULTIPLIERS</h3>
        
        <div className={styles.multipliersList}>
          <div className={styles.multiplierCard}>
            <div className={styles.multiplierIcon}>🏆</div>
            <div className={styles.multiplierInfo}>
              <span className={styles.multiplierName}>Prestige</span>
              <span className={styles.multiplierValue}>1.0x</span>
            </div>
            <div className={styles.multiplierDescription}>
              Rank 0 • Unlock higher ranks by burning
            </div>
          </div>

          <div className={styles.multiplierCard}>
            <div className={styles.multiplierIcon}>🎨</div>
            <div className={styles.multiplierInfo}>
              <span className={styles.multiplierName}>Creator Tier</span>
              <span className={styles.multiplierValue}>1.0x</span>
            </div>
            <div className={styles.multiplierDescription}>
              Tier 0 • Unlock creator tools to boost
            </div>
          </div>

          <div className={styles.multiplierCard}>
            <div className={styles.multiplierIcon}>🏙️</div>
            <div className={styles.multiplierInfo}>
              <span className={styles.multiplierName}>Districts</span>
              <span className={styles.multiplierValue}>1.0x</span>
            </div>
            <div className={styles.multiplierDescription}>
              1 unlocked • Unlock more for higher multiplier
            </div>
          </div>

          <div className={styles.multiplierCard}>
            <div className={styles.multiplierIcon}>⚡</div>
            <div className={styles.multiplierInfo}>
              <span className={styles.multiplierName}>Mini-Apps</span>
              <span className={styles.multiplierValue}>1.0x</span>
            </div>
            <div className={styles.multiplierDescription}>
              0 unlocked • +0.02x per app (max 1.5x)
            </div>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className={styles.notice}>
        <p className={styles.noticeTitle}>ℹ️ HOW MULTIPLIERS WORK</p>
        <p className={styles.noticeText}>
          All multipliers stack multiplicatively. For example: Prestige 2.0x × Creator 1.5x × Districts 1.2x = 3.6x total XP boost!
        </p>
      </div>
    </div>
  );
}
