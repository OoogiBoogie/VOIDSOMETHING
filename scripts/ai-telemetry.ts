#!/usr/bin/env node

/**
 * @title AI Telemetry CLI
 * @notice Command-line interface for running AI telemetry generation
 * 
 * Usage:
 * npm run ai:telemetry             - Run all AI telemetry (single cycle)
 * npm run ai:telemetry:daemon      - Run telemetry daemon (60s intervals)
 * npm run ai:mission               - Run MissionAI telemetry only
 * npm run ai:emission              - Run EmissionAI telemetry only
 * npm run ai:vault                 - Run VaultAI telemetry only
 */

import { writeMissionTelemetry } from "../server/ai/MissionAI.ts";
import { writeEmissionTelemetry, writeTreasurySnapshot } from "../server/ai/EmissionAI.ts";
import { writeVaultTelemetry } from "../server/ai/VaultAI.ts";
import { telemetryService } from "../server/ai/telemetry-service.ts";

const command = process.argv[2] || "help";

switch (command) {
  case "mission":
    console.log("🤖 MissionAI - Generating telemetry...\n");
    try {
      const missionTelemetry = writeMissionTelemetry();
      console.log("\n✅ Telemetry Summary:");
      console.log(`   Active Missions: ${missionTelemetry.activeMissions}`);
      console.log(`   Completion Rate: ${(missionTelemetry.completionRate * 100).toFixed(1)}%`);
      console.log(`   Total XP Rewards: ${missionTelemetry.totalXPRewards}`);
      console.log(`   Total SIGNAL Rewards: ${missionTelemetry.totalSIGNALRewards}\n`);
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
    break;
    
  case "emission":
    console.log("💰 EmissionAI - Generating telemetry...\n");
    try {
      const emissionTelemetry = writeEmissionTelemetry();
      console.log("\n✅ Telemetry Summary:");
      console.log(`   Status: ${emissionTelemetry.status}`);
      console.log(`   Treasury Balance: $${emissionTelemetry.treasuryBalance.toLocaleString()}`);
      console.log(`   Emission Rate: ${(emissionTelemetry.emissionRate * 100).toFixed(0)}%`);
      console.log(`   Runway: ${emissionTelemetry.runway} weeks\n`);
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
    break;
    
  case "vault":
    console.log("🏦 VaultAI - Generating telemetry...\n");
    try {
      const vaultTelemetry = writeVaultTelemetry();
      console.log("\n✅ Telemetry Summary:");
      console.log(`   System Health: ${vaultTelemetry.systemHealth}`);
      console.log(`   Total Vaults: ${vaultTelemetry.totalVaults}`);
      console.log(`   Critical: ${vaultTelemetry.criticalVaults}`);
      console.log(`   Avg Collateralization: ${vaultTelemetry.averageCollateralization.toFixed(1)}%\n`);
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
    break;
    
  case "snapshot":
    console.log("📸 EmissionAI - Generating treasury snapshot...\n");
    try {
      const snapshot = writeTreasurySnapshot();
      console.log("\n✅ Snapshot Summary:");
      console.log(`   Balance: $${snapshot.balance.toLocaleString()}`);
      console.log(`   Weekly Inflow: $${snapshot.weeklyInflow.toLocaleString()}`);
      console.log(`   Runway: ${snapshot.runway} weeks\n`);
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
    break;
    
  case "all":
    console.log("🤖 Running all AI telemetry (single cycle)...\n");
    try {
      telemetryService.runCycle()
        .then(() => {
          console.log("✅ All telemetry generated successfully\n");
          process.exit(0);
        })
        .catch((error) => {
          console.error("❌ Error:", error);
          process.exit(1);
        });
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
    break;
    
  case "daemon":
    console.log("🤖 Starting AI Telemetry Daemon...\n");
    telemetryService.startDaemon();
    
    // Graceful shutdown
    process.on("SIGINT", () => {
      telemetryService.stopDaemon();
      process.exit(0);
    });
    break;
    
  case "help":
  default:
    console.log("🤖 AI Telemetry CLI\n");
    console.log("Available commands:");
    console.log("  mission     - Generate MissionAI telemetry");
    console.log("  emission    - Generate EmissionAI telemetry");
    console.log("  vault       - Generate VaultAI telemetry");
    console.log("  snapshot    - Generate treasury snapshot");
    console.log("  all         - Generate all AI telemetry (single cycle)");
    console.log("  daemon      - Run telemetry daemon (60s intervals)\n");
    console.log("Examples:");
    console.log("  node scripts/ai-telemetry.js mission");
    console.log("  node scripts/ai-telemetry.js all");
    console.log("  node scripts/ai-telemetry.js daemon\n");
    break;
}
