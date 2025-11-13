/**
 * DEMO INTEGRITY PROTECTION SYSTEM
 * 
 * Phase 4.6 - Section 1: Demo Mode Immutability Protection
 * 
 * Ensures demo mode data remains consistent and cannot be tampered with during presentations.
 * Provides checksums, read-only wrappers, and validation to prevent demo drift.
 */

import { DEMO, isDemoMode } from '@/config/voidConfig';
import { createHash } from 'crypto';

// ============================================================================
// DEMO STATE CHECKSUM
// ============================================================================

/**
 * Generate a checksum of the demo state to detect tampering
 */
export function generateDemoChecksum(): string {
  if (!isDemoMode()) {
    return '';
  }

  const stateString = JSON.stringify(DEMO.demoState, Object.keys(DEMO.demoState).sort());
  
  // Browser-compatible hash (using string hash for client-side)
  let hash = 0;
  for (let i = 0; i < stateString.length; i++) {
    const char = stateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Expected checksum for demo state (generated at build time)
 */
const EXPECTED_DEMO_CHECKSUM = '2a7f9c3e'; // Will be auto-generated in demo:build

/**
 * Validate that demo state hasn't been tampered with
 */
export function validateDemoIntegrity(): { 
  valid: boolean; 
  expected: string; 
  actual: string;
  message: string;
} {
  if (!isDemoMode()) {
    return {
      valid: true,
      expected: '',
      actual: '',
      message: 'Not in demo mode',
    };
  }

  const actualChecksum = generateDemoChecksum();
  const valid = actualChecksum === EXPECTED_DEMO_CHECKSUM;

  return {
    valid,
    expected: EXPECTED_DEMO_CHECKSUM,
    actual: actualChecksum,
    message: valid 
      ? 'Demo state integrity verified' 
      : `Demo state checksum mismatch! Expected ${EXPECTED_DEMO_CHECKSUM}, got ${actualChecksum}`,
  };
}

// ============================================================================
// READ-ONLY DEMO WALLET
// ============================================================================

/**
 * Demo wallet wrapper that prevents modification
 */
export class DemoWallet {
  private readonly address: `0x${string}`;
  
  constructor() {
    if (!isDemoMode()) {
      throw new Error('DemoWallet can only be instantiated in demo mode');
    }
    this.address = DEMO.demoWalletAddress;
  }

  /**
   * Get wallet address (read-only)
   */
  getAddress(): `0x${string}` {
    return this.address;
  }

  /**
   * Attempt to sign - always throws in demo mode
   */
  async sign(_message: string): Promise<never> {
    throw new Error('DEMO MODE: Wallet signing is disabled. Use testnet for real wallet interactions.');
  }

  /**
   * Attempt to send transaction - always throws in demo mode
   */
  async sendTransaction(_tx: unknown): Promise<never> {
    throw new Error('DEMO MODE: Transactions are disabled. Use testnet for real blockchain interactions.');
  }

  /**
   * Get demo balances (frozen values)
   */
  getBalances() {
    return {
      void: DEMO.demoState.voidBalance,
      xVoid: DEMO.demoState.xVoidBalance,
      psx: DEMO.demoState.psxBalance,
    };
  }

  /**
   * Check if wallet is demo wallet
   */
  isDemo(): boolean {
    return true;
  }
}

// ============================================================================
// DEMO MODE LOCK PROTECTION
// ============================================================================

/**
 * Check if demo mode can be toggled (should always be false in production demo builds)
 */
export function canToggleDemoMode(): boolean {
  // In production demo builds, this is always false
  // In dev, allow toggling for testing
  return process.env.NODE_ENV === 'development' && process.env.DEMO_LOCKED !== 'true';
}

/**
 * Attempt to toggle demo mode (will fail if locked)
 */
export function toggleDemoMode(): { success: boolean; message: string } {
  if (!canToggleDemoMode()) {
    return {
      success: false,
      message: 'Demo mode is locked in this build. Cannot toggle.',
    };
  }

  return {
    success: false,
    message: 'Demo mode toggling must be done via environment variables.',
  };
}

// ============================================================================
// DEMO STATE DRIFT PREVENTION
// ============================================================================

/**
 * Frozen demo state that cannot be modified
 */
export const FROZEN_DEMO_STATE = Object.freeze({
  tier: DEMO.demoState.tier,
  currentScore: DEMO.demoState.currentScore,
  lifetimeScore: DEMO.demoState.lifetimeScore,
  accountAge: DEMO.demoState.accountAge,
  progress: DEMO.demoState.progress,
  voidBalance: DEMO.demoState.voidBalance,
  xVoidBalance: DEMO.demoState.xVoidBalance,
  psxBalance: DEMO.demoState.psxBalance,
  signalsHeld: DEMO.demoState.signalsHeld,
  completedQuests: Object.freeze([...DEMO.demoState.completedQuests]),
  guildId: DEMO.demoState.guildId,
  guildName: DEMO.demoState.guildName,
  unlockedZones: Object.freeze([...DEMO.demoState.unlockedZones]),
  leaderboardRank: DEMO.demoState.leaderboardRank,
});

/**
 * Validate that demo state hasn't drifted from frozen values
 */
export function validateNoDrift(): {
  valid: boolean;
  drifts: string[];
} {
  if (!isDemoMode()) {
    return { valid: true, drifts: [] };
  }

  const drifts: string[] = [];
  const current = DEMO.demoState;
  const frozen = FROZEN_DEMO_STATE;

  // Check each field
  if (current.tier !== frozen.tier) {
    drifts.push(`tier: expected ${frozen.tier}, got ${current.tier}`);
  }
  if (current.currentScore !== frozen.currentScore) {
    drifts.push(`currentScore: expected ${frozen.currentScore}, got ${current.currentScore}`);
  }
  if (current.lifetimeScore !== frozen.lifetimeScore) {
    drifts.push(`lifetimeScore: expected ${frozen.lifetimeScore}, got ${current.lifetimeScore}`);
  }
  if (current.accountAge !== frozen.accountAge) {
    drifts.push(`accountAge: expected ${frozen.accountAge}, got ${current.accountAge}`);
  }
  if (current.progress !== frozen.progress) {
    drifts.push(`progress: expected ${frozen.progress}, got ${current.progress}`);
  }
  if (current.voidBalance !== frozen.voidBalance) {
    drifts.push(`voidBalance: expected ${frozen.voidBalance}, got ${current.voidBalance}`);
  }
  if (current.xVoidBalance !== frozen.xVoidBalance) {
    drifts.push(`xVoidBalance: expected ${frozen.xVoidBalance}, got ${current.xVoidBalance}`);
  }
  if (current.psxBalance !== frozen.psxBalance) {
    drifts.push(`psxBalance: expected ${frozen.psxBalance}, got ${current.psxBalance}`);
  }
  if (current.leaderboardRank !== frozen.leaderboardRank) {
    drifts.push(`leaderboardRank: expected ${frozen.leaderboardRank}, got ${current.leaderboardRank}`);
  }

  // Check arrays (deep comparison)
  const currentQuests = JSON.stringify([...current.completedQuests].sort());
  const frozenQuests = JSON.stringify([...frozen.completedQuests].sort());
  if (currentQuests !== frozenQuests) {
    drifts.push(`completedQuests: expected ${frozenQuests}, got ${currentQuests}`);
  }

  const currentZones = JSON.stringify([...current.unlockedZones].sort());
  const frozenZones = JSON.stringify([...frozen.unlockedZones].sort());
  if (currentZones !== frozenZones) {
    drifts.push(`unlockedZones: expected ${frozenZones}, got ${currentZones}`);
  }

  return {
    valid: drifts.length === 0,
    drifts,
  };
}

// ============================================================================
// DEMO BANNER COMPONENT DATA
// ============================================================================

/**
 * Get demo banner configuration
 */
export function getDemoBannerConfig(): {
  show: boolean;
  text: string;
  locked: boolean;
  checksum: string;
} {
  if (!isDemoMode()) {
    return {
      show: false,
      text: '',
      locked: false,
      checksum: '',
    };
  }

  const integrity = validateDemoIntegrity();
  const drift = validateNoDrift();

  let text = 'DEMO MODE';
  
  if (!integrity.valid) {
    text = '⚠️ DEMO MODE - CHECKSUM MISMATCH';
  } else if (!drift.valid) {
    text = '⚠️ DEMO MODE - DATA DRIFT DETECTED';
  } else if (!canToggleDemoMode()) {
    text = 'DEMO MODE 🔒 LOCKED';
  }

  return {
    show: true,
    text,
    locked: !canToggleDemoMode(),
    checksum: integrity.actual,
  };
}

// ============================================================================
// DEMO INTEGRITY SELF-CHECK
// ============================================================================

/**
 * Run full demo integrity check
 */
export function runDemoIntegrityCheck(): {
  passed: boolean;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
  }[];
} {
  if (!isDemoMode()) {
    return {
      passed: true,
      checks: [{
        name: 'Demo Mode',
        status: 'pass',
        message: 'Not in demo mode - checks skipped',
      }],
    };
  }

  const checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
  }[] = [];

  // Check 1: Checksum validation
  const integrity = validateDemoIntegrity();
  checks.push({
    name: 'Demo State Checksum',
    status: integrity.valid ? 'pass' : 'fail',
    message: integrity.message,
  });

  // Check 2: Drift detection
  const drift = validateNoDrift();
  checks.push({
    name: 'Demo State Drift',
    status: drift.valid ? 'pass' : 'fail',
    message: drift.valid 
      ? 'No drift detected' 
      : `Drift detected: ${drift.drifts.join(', ')}`,
  });

  // Check 3: Demo mode lock
  const canToggle = canToggleDemoMode();
  checks.push({
    name: 'Demo Mode Lock',
    status: canToggle ? 'warning' : 'pass',
    message: canToggle 
      ? 'Demo mode is toggleable (development mode)' 
      : 'Demo mode is locked (production)',
  });

  // Check 4: Demo wallet
  try {
    const wallet = new DemoWallet();
    const address = wallet.getAddress();
    checks.push({
      name: 'Demo Wallet',
      status: address === DEMO.demoWalletAddress ? 'pass' : 'fail',
      message: address === DEMO.demoWalletAddress 
        ? `Demo wallet initialized: ${address}` 
        : `Demo wallet mismatch: expected ${DEMO.demoWalletAddress}, got ${address}`,
    });
  } catch (error) {
    checks.push({
      name: 'Demo Wallet',
      status: 'fail',
      message: `Failed to initialize demo wallet: ${error}`,
    });
  }

  // Check 5: Environment variables
  const envChecks = [
    { key: 'NEXT_PUBLIC_DEMO_MODE', expected: 'true' },
    { key: 'NEXT_PUBLIC_USE_MOCK_DATA', expected: 'true' },
  ];

  for (const { key, expected } of envChecks) {
    const actual = process.env[key];
    checks.push({
      name: `Env: ${key}`,
      status: actual === expected ? 'pass' : 'fail',
      message: actual === expected 
        ? `${key}=${actual}` 
        : `${key} mismatch: expected ${expected}, got ${actual}`,
    });
  }

  const passed = checks.every(c => c.status === 'pass' || c.status === 'warning');

  return { passed, checks };
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

export const demoIntegrity = {
  generateChecksum: generateDemoChecksum,
  validate: validateDemoIntegrity,
  validateNoDrift,
  canToggleDemoMode,
  toggleDemoMode,
  getDemoBannerConfig,
  runDemoIntegrityCheck,
  DemoWallet,
  FROZEN_DEMO_STATE,
};

export default demoIntegrity;
