/**
 * @title AI Telemetry Aggregation Service
 * @notice Runs MissionAI, EmissionAI, and VaultAI telemetry on 60-second intervals
 * 
 * Week 3 Track 3: AI Telemetry v1
 * 
 * Generates:
 * - /logs/ai/telemetry/mission_telemetry.json
 * - /logs/ai/telemetry/emission_telemetry.json
 * - /logs/ai/telemetry/vault_telemetry.json
 * - /logs/ai/telemetry/aggregated_telemetry.json
 * 
 * Usage:
 * npx ts-node server/ai/telemetry-service.ts
 * 
 * Daemon mode (runs continuously):
 * npx ts-node server/ai/telemetry-service.ts --daemon
 */

import { writeMissionTelemetry, generateMissionTelemetry } from "./MissionAI.js";
import { writeEmissionTelemetry, generateEmissionTelemetry } from "./EmissionAI.js";
import { writeVaultTelemetry, generateVaultTelemetry } from "./VaultAI.js";
import * as fs from "fs";
import * as path from "path";

// ============ TYPES ============

interface AggregatedTelemetry {
  timestamp: string;
  uptime: number; // seconds since service started
  cycleCount: number;
  lastCycleTimestamp: string;
  services: {
    mission: {
      status: "ONLINE" | "OFFLINE" | "ERROR";
      lastUpdate: string;
      activeMissions: number;
      completionRate: number;
    };
    emission: {
      status: "ONLINE" | "OFFLINE" | "ERROR";
      lastUpdate: string;
      treasuryBalance: number;
      emissionRate: number;
      systemStatus: "HEALTHY" | "WARNING" | "CRITICAL";
    };
    vault: {
      status: "ONLINE" | "OFFLINE" | "ERROR";
      lastUpdate: string;
      totalVaults: number;
      criticalVaults: number;
      systemHealth: "HEALTHY" | "WARNING" | "CRITICAL";
    };
  };
  systemHealth: "ALL_HEALTHY" | "SOME_WARNINGS" | "CRITICAL_ISSUES" | "OFFLINE";
  errors: string[];
}

// ============ SERVICE CLASS ============

export class TelemetryAggregationService {
  private startTime: number;
  private cycleCount: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private errors: string[] = [];
  
  constructor() {
    this.startTime = Date.now();
  }
  
  /**
   * Run single telemetry cycle (all 3 AI services)
   */
  async runCycle(): Promise<AggregatedTelemetry> {
    this.cycleCount++;
    const cycleStartTime = Date.now();
    const cycleTimestamp = new Date().toISOString();
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🤖 AI Telemetry Cycle #${this.cycleCount}`);
    console.log(`   Timestamp: ${cycleTimestamp}`);
    console.log(`${"=".repeat(60)}\n`);
    
    this.errors = []; // Reset errors each cycle
    
    // ============ RUN MISSION AI ============
    let missionTelemetry;
    let missionStatus: "ONLINE" | "OFFLINE" | "ERROR" = "OFFLINE";
    
    try {
      console.log("📋 Running MissionAI telemetry...");
      missionTelemetry = writeMissionTelemetry();
      missionStatus = "ONLINE";
      console.log(`   ✅ MissionAI: ${missionTelemetry.activeMissions} missions, ${(missionTelemetry.completionRate * 100).toFixed(1)}% completion\n`);
    } catch (error: any) {
      missionStatus = "ERROR";
      this.errors.push(`MissionAI: ${error.message}`);
      console.error(`   ❌ MissionAI error: ${error.message}\n`);
    }
    
    // ============ RUN EMISSION AI ============
    let emissionTelemetry;
    let emissionStatus: "ONLINE" | "OFFLINE" | "ERROR" = "OFFLINE";
    
    try {
      console.log("💰 Running EmissionAI telemetry...");
      emissionTelemetry = writeEmissionTelemetry();
      emissionStatus = "ONLINE";
      console.log(`   ✅ EmissionAI: $${emissionTelemetry.treasuryBalance.toLocaleString()} balance, ${emissionTelemetry.status} status\n`);
    } catch (error: any) {
      emissionStatus = "ERROR";
      this.errors.push(`EmissionAI: ${error.message}`);
      console.error(`   ❌ EmissionAI error: ${error.message}\n`);
    }
    
    // ============ RUN VAULT AI ============
    let vaultTelemetry;
    let vaultStatus: "ONLINE" | "OFFLINE" | "ERROR" = "OFFLINE";
    
    try {
      console.log("🏦 Running VaultAI telemetry...");
      vaultTelemetry = writeVaultTelemetry();
      vaultStatus = "ONLINE";
      console.log(`   ✅ VaultAI: ${vaultTelemetry.totalVaults} vaults, ${vaultTelemetry.systemHealth} health\n`);
    } catch (error: any) {
      vaultStatus = "ERROR";
      this.errors.push(`VaultAI: ${error.message}`);
      console.error(`   ❌ VaultAI error: ${error.message}\n`);
    }
    
    // ============ AGGREGATE RESULTS ============
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Determine overall system health
    let systemHealth: "ALL_HEALTHY" | "SOME_WARNINGS" | "CRITICAL_ISSUES" | "OFFLINE" = "ALL_HEALTHY";
    
    if (missionStatus === "ERROR" || emissionStatus === "ERROR" || vaultStatus === "ERROR") {
      systemHealth = "OFFLINE";
    } else if (
      emissionTelemetry?.status === "CRITICAL" ||
      vaultTelemetry?.systemHealth === "CRITICAL"
    ) {
      systemHealth = "CRITICAL_ISSUES";
    } else if (
      emissionTelemetry?.status === "WARNING" ||
      vaultTelemetry?.systemHealth === "WARNING"
    ) {
      systemHealth = "SOME_WARNINGS";
    }
    
    const aggregated: AggregatedTelemetry = {
      timestamp: cycleTimestamp,
      uptime,
      cycleCount: this.cycleCount,
      lastCycleTimestamp: cycleTimestamp,
      services: {
        mission: {
          status: missionStatus,
          lastUpdate: missionTelemetry?.timestamp || "",
          activeMissions: missionTelemetry?.activeMissions || 0,
          completionRate: missionTelemetry?.completionRate || 0,
        },
        emission: {
          status: emissionStatus,
          lastUpdate: emissionTelemetry?.timestamp || "",
          treasuryBalance: emissionTelemetry?.treasuryBalance || 0,
          emissionRate: emissionTelemetry?.emissionRate || 0,
          systemStatus: emissionTelemetry?.status || "CRITICAL",
        },
        vault: {
          status: vaultStatus,
          lastUpdate: vaultTelemetry?.timestamp || "",
          totalVaults: vaultTelemetry?.totalVaults || 0,
          criticalVaults: vaultTelemetry?.criticalVaults || 0,
          systemHealth: vaultTelemetry?.systemHealth || "CRITICAL",
        },
      },
      systemHealth,
      errors: this.errors,
    };
    
    // ============ SAVE AGGREGATED TELEMETRY ============
    const logsDir = path.join(process.cwd(), "logs", "ai", "telemetry");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const outputPath = path.join(logsDir, "aggregated_telemetry.json");
    fs.writeFileSync(outputPath, JSON.stringify(aggregated, null, 2));
    
    console.log(`📊 Aggregated telemetry written to: ${outputPath}`);
    
    // ============ CYCLE SUMMARY ============
    const cycleTime = Date.now() - cycleStartTime;
    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ Cycle #${this.cycleCount} Complete`);
    console.log(`   System Health: ${systemHealth}`);
    console.log(`   Cycle Time: ${cycleTime}ms`);
    console.log(`   Uptime: ${Math.floor(uptime / 60)}m ${uptime % 60}s`);
    
    if (this.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${this.errors.length}`);
      this.errors.forEach(err => console.log(`      - ${err}`));
    }
    
    console.log(`${"=".repeat(60)}\n`);
    
    return aggregated;
  }
  
  /**
   * Start daemon mode (60-second interval)
   */
  startDaemon() {
    console.log("🚀 Starting AI Telemetry Aggregation Service (Daemon Mode)\n");
    console.log("   Interval: 60 seconds");
    console.log("   Press Ctrl+C to stop\n");
    
    // Run first cycle immediately
    this.runCycle();
    
    // Then run every 60 seconds
    this.intervalId = setInterval(() => {
      this.runCycle();
    }, 60 * 1000); // 60 seconds
  }
  
  /**
   * Stop daemon mode
   */
  stopDaemon() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("\n🛑 AI Telemetry Service stopped");
      console.log(`   Total cycles: ${this.cycleCount}`);
      console.log(`   Total uptime: ${Math.floor((Date.now() - this.startTime) / 1000)}s\n`);
    }
  }
}

// ============ SINGLETON INSTANCE ============

export const telemetryService = new TelemetryAggregationService();
