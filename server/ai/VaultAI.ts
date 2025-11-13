/**
 * @title Vault AI v0 - Vault Health Monitoring
 * @notice Monitors VoidVaultFactory vaults and flags health issues
 * 
 * Phase 1 Scope:
 * - Static threshold monitoring (>120% = healthy, <110% = critical)
 * - Health alerts array output
 * - No automated liquidations (manual governance action)
 * - JSON telemetry output (Week 3)
 * 
 * Phase 2 (Future):
 * - Dynamic threshold calculation based on volatility
 * - Automated liquidation proposals
 * - ML-based risk prediction
 */

import * as fs from "fs";
import * as path from "path";

export interface VaultHealthStatus {
  vaultId: string;
  owner: string;
  collateralToken: string;
  collateralizationRatio: number; // percentage (e.g., 150 = 150%)
  deposited: number;
  borrowed: number;
  healthStatus: "HEALTHY" | "WARNING" | "CRITICAL";
  recommendedAction?: string;
  timestamp: number;
}

export interface VaultHealthAlert {
  vaultId: string;
  severity: "WARN" | "CRITICAL";
  collateralizationRatio: number;
  message: string;
  recommendedAction: string;
  timestamp: number;
}

export interface VaultTelemetry {
  timestamp: string;
  totalVaults: number;
  healthyVaults: number;
  warningVaults: number;
  criticalVaults: number;
  averageCollateralization: number;
  totalDeposited: number;
  totalBorrowed: number;
  systemHealth: "HEALTHY" | "WARNING" | "CRITICAL";
  alerts: VaultHealthAlert[];
}

// ============ VAULT AI CLASS ============

export class VaultAI {
  // Threshold constants (Phase 1 static values)
  private readonly HEALTHY_THRESHOLD = 150;   // 150%+
  private readonly WARNING_THRESHOLD = 120;   // 120%-149%
  private readonly CRITICAL_THRESHOLD = 110;  // <110%
  
  /**
   * Analyze single vault health
   */
  analyzeVaultHealth(
    vaultId: string,
    owner: string,
    collateralToken: string,
    deposited: number,
    borrowed: number
  ): VaultHealthStatus {
    const collateralizationRatio = (deposited / borrowed) * 100;
    
    let healthStatus: "HEALTHY" | "WARNING" | "CRITICAL";
    let recommendedAction: string | undefined;
    
    if (collateralizationRatio >= this.HEALTHY_THRESHOLD) {
      healthStatus = "HEALTHY";
      recommendedAction = undefined; // No action needed
    } else if (collateralizationRatio >= this.WARNING_THRESHOLD) {
      healthStatus = "WARNING";
      recommendedAction = `Add ${((this.HEALTHY_THRESHOLD / 100 * borrowed) - deposited).toFixed(2)} ${collateralToken} to restore healthy ratio`;
    } else {
      healthStatus = "CRITICAL";
      recommendedAction = `URGENT: Add ${((this.HEALTHY_THRESHOLD / 100 * borrowed) - deposited).toFixed(2)} ${collateralToken} or risk liquidation`;
    }
    
    return {
      vaultId,
      owner,
      collateralToken,
      collateralizationRatio,
      deposited,
      borrowed,
      healthStatus,
      recommendedAction,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Generate health alerts for vaults below warning threshold
   */
  generateHealthAlerts(vaults: VaultHealthStatus[]): VaultHealthAlert[] {
    const alerts: VaultHealthAlert[] = [];
    
    for (const vault of vaults) {
      if (vault.collateralizationRatio < this.CRITICAL_THRESHOLD) {
        alerts.push({
          vaultId: vault.vaultId,
          severity: "CRITICAL",
          collateralizationRatio: vault.collateralizationRatio,
          message: `Vault ${vault.vaultId} critically undercollateralized at ${vault.collateralizationRatio.toFixed(1)}%`,
          recommendedAction: vault.recommendedAction || "Add collateral immediately",
          timestamp: Date.now(),
        });
      } else if (vault.collateralizationRatio < this.WARNING_THRESHOLD) {
        alerts.push({
          vaultId: vault.vaultId,
          severity: "WARN",
          collateralizationRatio: vault.collateralizationRatio,
          message: `Vault ${vault.vaultId} below warning threshold at ${vault.collateralizationRatio.toFixed(1)}%`,
          recommendedAction: vault.recommendedAction || "Consider adding collateral",
          timestamp: Date.now(),
        });
      }
    }
    
    return alerts;
  }
  
  /**
   * Calculate aggregate vault health statistics
   */
  calculateAggregateStats(vaults: VaultHealthStatus[]): {
    totalVaults: number;
    healthyVaults: number;
    warningVaults: number;
    criticalVaults: number;
    averageCollateralization: number;
    totalDeposited: number;
    totalBorrowed: number;
  } {
    const stats = {
      totalVaults: vaults.length,
      healthyVaults: 0,
      warningVaults: 0,
      criticalVaults: 0,
      averageCollateralization: 0,
      totalDeposited: 0,
      totalBorrowed: 0,
    };
    
    for (const vault of vaults) {
      if (vault.healthStatus === "HEALTHY") stats.healthyVaults++;
      else if (vault.healthStatus === "WARNING") stats.warningVaults++;
      else if (vault.healthStatus === "CRITICAL") stats.criticalVaults++;
      
      stats.averageCollateralization += vault.collateralizationRatio;
      stats.totalDeposited += vault.deposited;
      stats.totalBorrowed += vault.borrowed;
    }
    
    stats.averageCollateralization = stats.totalVaults > 0 
      ? stats.averageCollateralization / stats.totalVaults 
      : 0;
    
    return stats;
  }
  
  /**
   * Generate telemetry report
   */
  generateTelemetryReport(vaults: VaultHealthStatus[], alerts: VaultHealthAlert[]): string {
    const stats = this.calculateAggregateStats(vaults);
    
    const report = `
═════════════════════════════════════════════
🏦 VAULT AI v0 TELEMETRY REPORT
═════════════════════════════════════════════

Aggregate Statistics:
  Total Vaults:      ${stats.totalVaults}
  Healthy (≥150%):   ${stats.healthyVaults} (${((stats.healthyVaults / stats.totalVaults) * 100).toFixed(1)}%)
  Warning (120-149%): ${stats.warningVaults} (${((stats.warningVaults / stats.totalVaults) * 100).toFixed(1)}%)
  Critical (<110%):   ${stats.criticalVaults} (${((stats.criticalVaults / stats.totalVaults) * 100).toFixed(1)}%)
  
  Avg Collateral:    ${stats.averageCollateralization.toFixed(1)}%
  Total Deposited:   $${stats.totalDeposited.toLocaleString()}
  Total Borrowed:    $${stats.totalBorrowed.toLocaleString()}

Health Alerts (${alerts.length}):
${alerts.length > 0 
  ? alerts.map(a => `  ${a.severity === "CRITICAL" ? "🚨" : "⚠️"} [${a.severity}] ${a.message}\n     Action: ${a.recommendedAction}`).join('\n')
  : '  ✅ No alerts - all vaults healthy'}

Vault Details:
${vaults.map(v => `  ${v.healthStatus === "HEALTHY" ? "✅" : v.healthStatus === "WARNING" ? "⚠️" : "🚨"} ${v.vaultId}: ${v.collateralizationRatio.toFixed(1)}% (${v.deposited.toLocaleString()} ${v.collateralToken})`).join('\n')}

═════════════════════════════════════════════
Timestamp: ${new Date().toISOString()}
═════════════════════════════════════════════
`;
    
    return report;
  }
}

// ============ SINGLETON INSTANCE ============

export const vaultAI = new VaultAI();

// ============ TELEMETRY GENERATION (Week 3) ============

/**
 * Generates JSON telemetry for AI Console v1 (Week 4)
 */
export function generateVaultTelemetry(vaults?: VaultHealthStatus[]): VaultTelemetry {
  // Use provided vaults or create mock ones (Phase 1)
  const currentVaults = vaults || [
    vaultAI.analyzeVaultHealth("vault-1", "0xOwner1", "USDC", 1500, 1000), // 150% healthy
    vaultAI.analyzeVaultHealth("vault-2", "0xOwner2", "USDC", 575, 500),   // 115% warning
    vaultAI.analyzeVaultHealth("vault-3", "0xOwner3", "WETH", 525, 500),   // 105% critical
    vaultAI.analyzeVaultHealth("vault-4", "0xOwner4", "USDC", 2000, 1000), // 200% healthy
  ];
  
  const stats = vaultAI.calculateAggregateStats(currentVaults);
  const alerts = vaultAI.generateHealthAlerts(currentVaults);
  
  const totalDeposited = currentVaults.reduce((sum, v) => sum + v.deposited, 0);
  const totalBorrowed = currentVaults.reduce((sum, v) => sum + v.borrowed, 0);
  
  let systemHealth: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  if (stats.criticalVaults > 0) {
    systemHealth = "CRITICAL";
  } else if (stats.warningVaults > currentVaults.length * 0.25) {
    // More than 25% of vaults in warning state
    systemHealth = "WARNING";
  }
  
  const telemetry: VaultTelemetry = {
    timestamp: new Date().toISOString(),
    totalVaults: stats.totalVaults,
    healthyVaults: stats.healthyVaults,
    warningVaults: stats.warningVaults,
    criticalVaults: stats.criticalVaults,
    averageCollateralization: stats.averageCollateralization,
    totalDeposited,
    totalBorrowed,
    systemHealth,
    alerts,
  };
  
  return telemetry;
}

/**
 * Writes telemetry to JSON file
 */
export function writeVaultTelemetry(vaults?: VaultHealthStatus[]) {
  const telemetry = generateVaultTelemetry(vaults);
  
  const logsDir = path.join(process.cwd(), "logs", "ai", "telemetry");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const outputPath = path.join(logsDir, "vault_telemetry.json");
  fs.writeFileSync(outputPath, JSON.stringify(telemetry, null, 2));
  
  console.log(`📊 Vault telemetry written to: ${outputPath}`);
  return telemetry;
}

// ============ REACT HOOK (for frontend) ============

/**
 * Hook to access VaultAI in React components
 */
export function useVaultAI() {
  return {
    analyzeVaultHealth: (
      vaultId: string,
      owner: string,
      collateralToken: string,
      deposited: number,
      borrowed: number
    ) => vaultAI.analyzeVaultHealth(vaultId, owner, collateralToken, deposited, borrowed),
    
    generateHealthAlerts: (vaults: VaultHealthStatus[]) => 
      vaultAI.generateHealthAlerts(vaults),
    
    calculateAggregateStats: (vaults: VaultHealthStatus[]) => 
      vaultAI.calculateAggregateStats(vaults),
    
    generateTelemetry: (vaults?: VaultHealthStatus[]) =>
      generateVaultTelemetry(vaults),
  };
}

// ============ EXAMPLE USAGE ============

export function runVaultAIExample() {
  // Example vaults
  const vaults: VaultHealthStatus[] = [
    vaultAI.analyzeVaultHealth("vault-1", "0xOwner1", "USDC", 1500, 1000), // 150% healthy
    vaultAI.analyzeVaultHealth("vault-2", "0xOwner2", "USDC", 575, 500),   // 115% warning
    vaultAI.analyzeVaultHealth("vault-3", "0xOwner3", "WETH", 525, 500),   // 105% critical
    vaultAI.analyzeVaultHealth("vault-4", "0xOwner4", "USDC", 2000, 1000), // 200% healthy
  ];
  
  const alerts = vaultAI.generateHealthAlerts(vaults);
  const report = vaultAI.generateTelemetryReport(vaults, alerts);
  
  console.log(report);
  
  return { vaults, alerts };
}

// ============ TELEMETRY ============

/**
 * Logs VaultAI telemetry to console (for debugging)
 */
export function logVaultAITelemetry() {
  const telemetry = generateVaultTelemetry();
  
  console.log("\n═════════════════════════════════════════════");
  console.log("🏦 VAULT AI v0 TELEMETRY");
  console.log("═════════════════════════════════════════════");
  console.log(`System Health: ${telemetry.systemHealth}`);
  console.log(`Total Vaults: ${telemetry.totalVaults}`);
  console.log(`Healthy: ${telemetry.healthyVaults}`);
  console.log(`Warning: ${telemetry.warningVaults}`);
  console.log(`Critical: ${telemetry.criticalVaults}`);
  console.log(`Avg Collateralization: ${telemetry.averageCollateralization.toFixed(1)}%`);
  
  if (telemetry.alerts.length > 0) {
    console.log(`\n⚠️  Active Alerts: ${telemetry.alerts.length}`);
    telemetry.alerts.forEach(alert => {
      console.log(`   ${alert.severity} - ${alert.vaultId}: ${alert.message}`);
    });
  }
  
  console.log("═════════════════════════════════════════════\n");
}
