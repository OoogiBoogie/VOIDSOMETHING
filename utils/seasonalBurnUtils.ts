/**
 * seasonalBurnUtils.ts
 * 
 * Utility functions for seasonal burn system
 * - XP calculations
 * - Zone determination
 * - Cap formatting
 * - Season time utilities
 */

import { formatEther, parseEther } from 'viem';

// ═════════════════════════════════════════════════════════════════════════
// XP CALCULATIONS
// ═════════════════════════════════════════════════════════════════════════

interface XPConfig {
  baseXPPerVOID: bigint;
  dailySoftCap1: bigint;
  dailySoftCap2: bigint;
  dailyMult1: bigint;
  dailyMult2: bigint;
  dailyMult3: bigint;
}

/**
 * Calculate XP from a VOID burn amount
 * Implements 3-zone curve from canonical spec
 */
export function calculateXPFromBurn(
  voidAmount: bigint,
  alreadyBurnedToday: bigint,
  xpConfig: XPConfig
): {
  xpEarned: bigint;
  zone1XP: bigint;
  zone2XP: bigint;
  zone3XP: bigint;
  finalZone: 1 | 2 | 3;
} {
  const { baseXPPerVOID, dailySoftCap1, dailySoftCap2, dailyMult1, dailyMult2, dailyMult3 } = xpConfig;

  let remaining = voidAmount;
  let zone1XP = 0n;
  let zone2XP = 0n;
  let zone3XP = 0n;
  let currentBurned = alreadyBurnedToday;
  let finalZone: 1 | 2 | 3 = 1;

  // Zone 1: 0 → dailySoftCap1 (100% multiplier)
  if (currentBurned < dailySoftCap1 && remaining > 0n) {
    const cap1Remaining = dailySoftCap1 - currentBurned;
    const consumed = remaining < cap1Remaining ? remaining : cap1Remaining;
    zone1XP = (consumed * baseXPPerVOID * dailyMult1) / 100n;
    currentBurned += consumed;
    remaining -= consumed;
    finalZone = 1;
  }

  // Zone 2: dailySoftCap1 → dailySoftCap2 (50% multiplier)
  if (currentBurned >= dailySoftCap1 && currentBurned < dailySoftCap2 && remaining > 0n) {
    const cap2Remaining = dailySoftCap2 - currentBurned;
    const consumed = remaining < cap2Remaining ? remaining : cap2Remaining;
    zone2XP = (consumed * baseXPPerVOID * dailyMult2) / 100n;
    currentBurned += consumed;
    remaining -= consumed;
    finalZone = 2;
  }

  // Zone 3: dailySoftCap2+ (0% multiplier)
  if (currentBurned >= dailySoftCap2 && remaining > 0n) {
    zone3XP = (remaining * baseXPPerVOID * dailyMult3) / 100n;
    finalZone = 3;
  }

  return {
    xpEarned: zone1XP + zone2XP + zone3XP,
    zone1XP,
    zone2XP,
    zone3XP,
    finalZone,
  };
}

/**
 * Determine which XP zone a user is in based on daily burn
 */
export function getXPZone(burnedToday: bigint, xpConfig: XPConfig): {
  zone: 1 | 2 | 3;
  multiplier: number;
  nextZoneAt: bigint | null;
} {
  const { dailySoftCap1, dailySoftCap2 } = xpConfig;

  if (burnedToday >= dailySoftCap2) {
    return { zone: 3, multiplier: 0, nextZoneAt: null };
  } else if (burnedToday >= dailySoftCap1) {
    return { zone: 2, multiplier: 50, nextZoneAt: dailySoftCap2 };
  } else {
    return { zone: 1, multiplier: 100, nextZoneAt: dailySoftCap1 };
  }
}

// ═════════════════════════════════════════════════════════════════════════
// CAP UTILITIES
// ═════════════════════════════════════════════════════════════════════════

/**
 * Format cap status for display
 */
export function formatCapStatus(
  used: bigint,
  cap: bigint,
  decimals: number = 2
): {
  usedFormatted: string;
  capFormatted: string;
  percentUsed: number;
  remaining: string;
  isCapped: boolean;
} {
  const usedEther = parseFloat(formatEther(used));
  const capEther = parseFloat(formatEther(cap));
  const percentUsed = capEther > 0 ? (usedEther / capEther) * 100 : 0;
  const remaining = capEther - usedEther;

  return {
    usedFormatted: usedEther.toFixed(decimals),
    capFormatted: capEther.toFixed(decimals),
    percentUsed: Math.min(percentUsed, 100),
    remaining: remaining.toFixed(decimals),
    isCapped: used >= cap,
  };
}

/**
 * Get progress bar color based on cap usage
 */
export function getCapProgressColor(percentUsed: number): string {
  if (percentUsed >= 100) return '#ef4444'; // Red (capped)
  if (percentUsed >= 80) return '#f59e0b';  // Orange (warning)
  if (percentUsed >= 50) return '#eab308';  // Yellow (moderate)
  return '#22c55e';                         // Green (healthy)
}

// ═════════════════════════════════════════════════════════════════════════
// TIME UTILITIES
// ═════════════════════════════════════════════════════════════════════════

/**
 * Format season time remaining
 */
export function formatTimeRemaining(endTime: bigint): {
  days: number;
  hours: number;
  minutes: number;
  formatted: string;
} {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const remaining = endTime > now ? Number(endTime - now) : 0;

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  if (hours > 0 || days > 0) formatted += `${hours}h `;
  formatted += `${minutes}m`;

  return { days, hours, minutes, formatted: formatted.trim() };
}

/**
 * Check if daily reset is needed
 */
export function needsDailyReset(lastResetTime: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const lastResetDay = lastResetTime / 86400n;
  const currentDay = now / 86400n;
  return currentDay > lastResetDay;
}

/**
 * Get time until next daily reset
 */
export function getTimeUntilDailyReset(): {
  seconds: number;
  formatted: string;
} {
  const now = Math.floor(Date.now() / 1000);
  const currentDay = Math.floor(now / 86400);
  const nextResetTime = (currentDay + 1) * 86400;
  const seconds = nextResetTime - now;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return {
    seconds,
    formatted: `${hours}h ${minutes}m`,
  };
}

// ═════════════════════════════════════════════════════════════════════════
// SEASON UTILITIES
// ═════════════════════════════════════════════════════════════════════════

/**
 * Check if season is active
 */
export function isSeasonActive(startTime: bigint, endTime: bigint, active: boolean): boolean {
  if (!active) return false;
  const now = BigInt(Math.floor(Date.now() / 1000));
  return now >= startTime && now < endTime;
}

/**
 * Format season progress
 */
export function formatSeasonProgress(
  startTime: bigint,
  endTime: bigint
): {
  percentComplete: number;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
} {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const total = endTime - startTime;
  const elapsed = now >= startTime ? now - startTime : 0n;
  const remaining = endTime > now ? endTime - now : 0n;

  return {
    percentComplete: total > 0 ? Number((elapsed * 100n) / total) : 0,
    daysElapsed: Number(elapsed / 86400n),
    daysRemaining: Number(remaining / 86400n),
    totalDays: Number(total / 86400n),
  };
}

// ═════════════════════════════════════════════════════════════════════════
// MODULE UTILITIES
// ═════════════════════════════════════════════════════════════════════════

/**
 * Get module name from enum
 */
export function getModuleName(module: number): string {
  const names = ['District', 'Land', 'Creator', 'Prestige', 'MiniApp'];
  return names[module] || 'Unknown';
}

/**
 * Get module icon (for UI)
 */
export function getModuleIcon(module: number): string {
  const icons = ['🏛️', '🏡', '🎨', '⭐', '📱'];
  return icons[module] || '❓';
}

// ═════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═════════════════════════════════════════════════════════════════════════

/**
 * Validate burn amount (client-side check before transaction)
 */
export function validateBurnAmount(
  amount: string,
  userBalance: bigint
): {
  valid: boolean;
  error?: string;
  parsedAmount?: bigint;
} {
  try {
    if (!amount || amount.trim() === '') {
      return { valid: false, error: 'Amount required' };
    }

    const parsed = parseEther(amount);

    if (parsed <= 0n) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (parsed > userBalance) {
      return { valid: false, error: 'Insufficient balance' };
    }

    return { valid: true, parsedAmount: parsed };
  } catch (e) {
    return { valid: false, error: 'Invalid amount format' };
  }
}

/**
 * Format large numbers for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}
