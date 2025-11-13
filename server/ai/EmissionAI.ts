/**
 * @title Emission AI v0 - Treasury Monitoring & Emission Suggestions
 * @notice Monitors VoidTreasury balance and suggests emission rate adjustments
 * 
 * Phase 1 Scope:
 * - Read-only monitoring (no contract writes)
 * - Static threshold logic (>$100k reduce, <$50k increase)
 * - Emission range: 0.6-1.0× weekly fees
 * - Governance executes suggestions manually
 * - JSON telemetry output (Week 3)
 * 
 * Phase 2 (Future):
 * - Dynamic threshold calculation
 * - Automated proposal creation
 * - ML-based emission prediction
 */

import * as fs from "fs";
import * as path from "path";

export interface EmissionSuggestion {
  currentBalance: number;
  weeklyFees: number;
  suggestedEmissionRate: number; // multiplier (0.6 - 1.0)
  suggestedEmissionAmount: number;
  reasoning: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  timestamp: number;
}

export interface TreasurySnapshot {
  balance: number;
  weeklyFees: number;
  weeklyInflow: number;
  weeklyOutflow: number;
  netChange: number;
  runway: number; // weeks at current burn rate
  timestamp: number;
}

export interface EmissionTelemetry {
  timestamp: string;
  feeIntake: number;
  treasuryBalance: number;
  emissionRate: number;
  emissionAmount: number;
  weeklyInflow: number;
  weeklyOutflow: number;
  netChange: number;
  runway: number;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  reasoning: string;
}

// ============ EMISSION AI CLASS ============

export class EmissionAI {
  // Threshold constants (Phase 1 static values)
  private readonly REDUCE_THRESHOLD = 100000; // $100k
  private readonly INCREASE_THRESHOLD = 50000; // $50k
  private readonly MIN_EMISSION_RATE = 0.6;
  private readonly MAX_EMISSION_RATE = 1.0;
  private readonly TARGET_RUNWAY_WEEKS = 12;
  
  /**
   * Analyze treasury and suggest emission rate
   */
  suggestEmissionRate(snapshot: TreasurySnapshot): EmissionSuggestion {
    const { balance, weeklyFees, weeklyInflow, weeklyOutflow, netChange, runway } = snapshot;
    
    let suggestedRate = 0.8; // Default: conservative 80% of fees
    let reasoning = "";
    let urgency: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    
    // High balance → reduce emissions
    if (balance > this.REDUCE_THRESHOLD) {
      suggestedRate = this.MIN_EMISSION_RATE; // 60% of fees
      reasoning = `Treasury balance ($${balance.toLocaleString()}) exceeds threshold ($${this.REDUCE_THRESHOLD.toLocaleString()}). Reduce emissions to 60% to prevent oversupply.`;
      urgency = "LOW";
    }
    
    // Low balance → increase emissions
    else if (balance < this.INCREASE_THRESHOLD) {
      suggestedRate = this.MAX_EMISSION_RATE; // 100% of fees
      reasoning = `Treasury balance ($${balance.toLocaleString()}) below threshold ($${this.INCREASE_THRESHOLD.toLocaleString()}). Increase emissions to 100% to support ecosystem.`;
      urgency = "HIGH";
    }
    
    // Runway concerns → adjust based on net change
    else if (runway < this.TARGET_RUNWAY_WEEKS) {
      if (netChange < 0) {
        suggestedRate = this.MAX_EMISSION_RATE;
        reasoning = `Treasury runway (${runway.toFixed(1)} weeks) below target (${this.TARGET_RUNWAY_WEEKS} weeks) with negative net change. Maximize emissions.`;
        urgency = "HIGH";
      } else {
        suggestedRate = 0.9;
        reasoning = `Treasury runway (${runway.toFixed(1)} weeks) below target but net change positive. Increase emissions to 90%.`;
        urgency = "MEDIUM";
      }
    }
    
    // Healthy state → maintain conservative rate
    else {
      suggestedRate = 0.8;
      reasoning = `Treasury balance ($${balance.toLocaleString()}) and runway (${runway.toFixed(1)} weeks) healthy. Maintain conservative 80% emission rate.`;
      urgency = "LOW";
    }
    
    const suggestedEmissionAmount = weeklyFees * suggestedRate;
    
    return {
      currentBalance: balance,
      weeklyFees,
      suggestedEmissionRate: suggestedRate,
      suggestedEmissionAmount,
      reasoning,
      urgency,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Calculate treasury runway (weeks until depletion)
   */
  calculateRunway(balance: number, weeklyOutflow: number): number {
    if (weeklyOutflow <= 0) return Infinity;
    return balance / weeklyOutflow;
  }
  
  /**
   * Simulate emission impact over N weeks
   */
  simulateEmissionImpact(
    initialBalance: number,
    weeklyFees: number,
    emissionRate: number,
    weeks: number
  ): { week: number; balance: number; emissions: number; netChange: number }[] {
    const simulation = [];
    let balance = initialBalance;
    
    for (let week = 1; week <= weeks; week++) {
      const emissions = weeklyFees * emissionRate;
      const netChange = weeklyFees - emissions;
      balance += netChange;
      
      simulation.push({
        week,
        balance,
        emissions,
        netChange,
      });
    }
    
    return simulation;
  }
  
  /**
   * Generate telemetry report
   */
  generateTelemetryReport(snapshot: TreasurySnapshot, suggestion: EmissionSuggestion): string {
    const report = `
═════════════════════════════════════════════
📊 EMISSION AI v0 TELEMETRY REPORT
═════════════════════════════════════════════

Treasury Snapshot:
  Current Balance: $${snapshot.balance.toLocaleString()}
  Weekly Inflow:   $${snapshot.weeklyInflow.toLocaleString()}
  Weekly Outflow:  $${snapshot.weeklyOutflow.toLocaleString()}
  Net Change:      ${snapshot.netChange >= 0 ? '+' : ''}$${snapshot.netChange.toLocaleString()}
  Runway:          ${snapshot.runway.toFixed(1)} weeks

Emission Suggestion:
  Suggested Rate:   ${(suggestion.suggestedEmissionRate * 100).toFixed(0)}% of fees
  Weekly Fees:      $${suggestion.weeklyFees.toLocaleString()}
  Suggested Amount: $${suggestion.suggestedEmissionAmount.toLocaleString()}
  Urgency:          ${suggestion.urgency}
  
Reasoning:
  ${suggestion.reasoning}

12-Week Projection (at suggested rate):
${this.simulateEmissionImpact(
  snapshot.balance,
  snapshot.weeklyInflow,
  suggestion.suggestedEmissionRate,
  12
).map(w => `  Week ${w.week}: Balance $${w.balance.toLocaleString()} (${w.netChange >= 0 ? '+' : ''}$${w.netChange.toLocaleString()})`)
  .join('\n')}

═════════════════════════════════════════════
Timestamp: ${new Date(suggestion.timestamp).toISOString()}
═════════════════════════════════════════════
`;
    
    return report;
  }
}

// ============ SINGLETON INSTANCE ============

export const emissionAI = new EmissionAI();

// ============ TELEMETRY GENERATION (Week 3) ============

/**
 * Generates JSON telemetry for AI Console v1 (Week 4)
 */
export function generateEmissionTelemetry(snapshot?: TreasurySnapshot): EmissionTelemetry {
  // Use provided snapshot or create mock one (Phase 1)
  const currentSnapshot = snapshot || {
    balance: 75000,
    weeklyFees: 10000,
    weeklyInflow: 10000,
    weeklyOutflow: 5000,
    netChange: 5000,
    runway: 15,
    timestamp: Date.now(),
  };
  
  const suggestion = emissionAI.suggestEmissionRate(currentSnapshot);
  
  let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  if (currentSnapshot.balance < 50000) {
    status = "CRITICAL";
  } else if (currentSnapshot.balance < 75000 || currentSnapshot.runway < 8) {
    status = "WARNING";
  }
  
  const telemetry: EmissionTelemetry = {
    timestamp: new Date().toISOString(),
    feeIntake: currentSnapshot.weeklyFees,
    treasuryBalance: currentSnapshot.balance,
    emissionRate: suggestion.suggestedEmissionRate,
    emissionAmount: suggestion.suggestedEmissionAmount,
    weeklyInflow: currentSnapshot.weeklyInflow,
    weeklyOutflow: currentSnapshot.weeklyOutflow,
    netChange: currentSnapshot.netChange,
    runway: currentSnapshot.runway,
    status,
    reasoning: suggestion.reasoning,
  };
  
  return telemetry;
}

/**
 * Writes telemetry to JSON file
 */
export function writeEmissionTelemetry(snapshot?: TreasurySnapshot) {
  const telemetry = generateEmissionTelemetry(snapshot);
  
  const logsDir = path.join(process.cwd(), "logs", "ai", "telemetry");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const outputPath = path.join(logsDir, "emission_telemetry.json");
  fs.writeFileSync(outputPath, JSON.stringify(telemetry, null, 2));
  
  console.log(`📊 Emission telemetry written to: ${outputPath}`);
  return telemetry;
}

/**
 * Generates treasury snapshot JSON
 */
export function writeTreasurySnapshot(snapshot?: TreasurySnapshot) {
  const currentSnapshot = snapshot || {
    balance: 75000,
    weeklyFees: 10000,
    weeklyInflow: 10000,
    weeklyOutflow: 5000,
    netChange: 5000,
    runway: 15,
    timestamp: Date.now(),
  };
  
  const logsDir = path.join(process.cwd(), "logs", "treasury");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const outputPath = path.join(logsDir, `snapshot_${dateStr}.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify(currentSnapshot, null, 2));
  
  console.log(`💰 Treasury snapshot written to: ${outputPath}`);
  return currentSnapshot;
}

// ============ REACT HOOK (for frontend) ============

/**
 * Hook to access EmissionAI in React components
 */
export function useEmissionAI() {
  return {
    suggestEmissionRate: (snapshot: TreasurySnapshot) => 
      emissionAI.suggestEmissionRate(snapshot),
    
    calculateRunway: (balance: number, weeklyOutflow: number) => 
      emissionAI.calculateRunway(balance, weeklyOutflow),
    
    simulateEmissionImpact: (
      initialBalance: number,
      weeklyFees: number,
      emissionRate: number,
      weeks: number
    ) => emissionAI.simulateEmissionImpact(initialBalance, weeklyFees, emissionRate, weeks),
    
    generateTelemetry: (snapshot?: TreasurySnapshot) =>
      generateEmissionTelemetry(snapshot),
  };
}

// ============ EXAMPLE USAGE ============

export function runEmissionAIExample() {
  // Example treasury snapshot
  const snapshot: TreasurySnapshot = {
    balance: 75000,
    weeklyFees: 10000,
    weeklyInflow: 10000,  // $10k/week fees
    weeklyOutflow: 5000,  // $5k/week opex
    netChange: 5000,
    runway: 15,
    timestamp: Date.now(),
  };
  
  const suggestion = emissionAI.suggestEmissionRate(snapshot);
  const report = emissionAI.generateTelemetryReport(snapshot, suggestion);
  
  console.log(report);
  
  return { snapshot, suggestion };
}

// ============ TELEMETRY ============

/**
 * Logs EmissionAI telemetry to console (for debugging)
 */
export function logEmissionAITelemetry() {
  const telemetry = generateEmissionTelemetry();
  
  console.log("\n═════════════════════════════════════════════");
  console.log("💰 EMISSION AI v0 TELEMETRY");
  console.log("═════════════════════════════════════════════");
  console.log(`Status: ${telemetry.status}`);
  console.log(`Treasury Balance: $${telemetry.treasuryBalance.toLocaleString()}`);
  console.log(`Emission Rate: ${(telemetry.emissionRate * 100).toFixed(0)}%`);
  console.log(`Weekly Inflow: $${telemetry.weeklyInflow.toLocaleString()}`);
  console.log(`Weekly Outflow: $${telemetry.weeklyOutflow.toLocaleString()}`);
  console.log(`Runway: ${telemetry.runway} weeks`);
  console.log("═════════════════════════════════════════════\n");
}
