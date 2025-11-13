/**
 * @title Mission AI v0 - Static Mission Generator
 * @notice Generates 3 missions per hub (WORLD / CREATOR / DEFI)
 * 
 * Phase 1 Scope:
 * - Static mission templates (easy / medium / hard)
 * - No personalization or dynamic generation
 * - Returns mission objects for HUD display
 * - JSON telemetry output (Week 3)
 * 
 * Phase 2 (Future):
 * - Personalized missions based on player history
 * - Dynamic difficulty scaling
 * - Integration with MissionRegistry contract
 */

import * as fs from "fs";
import * as path from "path";

export interface Mission {
  id: string;
  hubType: "WORLD" | "CREATOR" | "DEFI";
  difficulty: "easy" | "medium" | "hard";
  title: string;
  description: string;
  rewardXP: number;
  rewardSIGNAL: number;
  estimatedTime: string;
  requirements?: string[];
}

export interface MissionTelemetry {
  timestamp: string;
  hub: string;
  activeMissions: number;
  completionRate: number;
  totalXPRewards: number;
  totalSIGNALRewards: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  averageEstimatedTime: string;
}

// ============ MISSION TEMPLATES ============

const WORLD_MISSIONS: Mission[] = [
  {
    id: "world-easy-1",
    hubType: "WORLD",
    difficulty: "easy",
    title: "Explore Plaza District",
    description: "Visit the central Plaza district and interact with 3 parcels",
    rewardXP: 50,
    rewardSIGNAL: 25,
    estimatedTime: "5 minutes",
    requirements: ["Visit Plaza district", "Interact with 3 parcels"],
  },
  {
    id: "world-medium-1",
    hubType: "WORLD",
    difficulty: "medium",
    title: "Complete 5 District Interactions",
    description: "Explore VOID and interact with parcels across 3 different districts",
    rewardXP: 150,
    rewardSIGNAL: 100,
    estimatedTime: "15 minutes",
    requirements: ["Visit 3 districts", "Complete 5 interactions"],
  },
  {
    id: "world-hard-1",
    hubType: "WORLD",
    difficulty: "hard",
    title: "Discover All Districts",
    description: "Unlock and visit all 4 districts (PLAZA / DEFI / CREATOR / WILDLANDS)",
    rewardXP: 500,
    rewardSIGNAL: 300,
    estimatedTime: "30 minutes",
    requirements: ["Visit PLAZA", "Visit DEFI", "Visit CREATOR", "Visit WILDLANDS"],
  },
];

const CREATOR_MISSIONS: Mission[] = [
  {
    id: "creator-easy-1",
    hubType: "CREATOR",
    difficulty: "easy",
    title: "Claim Creator Status",
    description: "Register as a creator and set up your profile",
    rewardXP: 75,
    rewardSIGNAL: 50,
    estimatedTime: "10 minutes",
    requirements: ["Register creator account", "Complete profile"],
  },
  {
    id: "creator-medium-1",
    hubType: "CREATOR",
    difficulty: "medium",
    title: "Earn First Royalties",
    description: "Create and sell your first cosmetic SKU",
    rewardXP: 200,
    rewardSIGNAL: 150,
    estimatedTime: "45 minutes",
    requirements: ["Create SKU", "Make 1 sale", "LOCKED: Phase 2"],
  },
  {
    id: "creator-hard-1",
    hubType: "CREATOR",
    difficulty: "hard",
    title: "Achieve Top 10% Creator Status",
    description: "Earn $1,000+ in royalties to enter top creator tier",
    rewardXP: 1000,
    rewardSIGNAL: 500,
    estimatedTime: "7 days",
    requirements: ["Earn $1,000 royalties", "Maintain 4.5+ rating", "LOCKED: Phase 2"],
  },
];

const DEFI_MISSIONS: Mission[] = [
  {
    id: "defi-easy-1",
    hubType: "DEFI",
    difficulty: "easy",
    title: "Create Your First Vault",
    description: "Deploy a vault and deposit collateral",
    rewardXP: 100,
    rewardSIGNAL: 75,
    estimatedTime: "10 minutes",
    requirements: ["Deploy vault", "Deposit collateral"],
  },
  {
    id: "defi-medium-1",
    hubType: "DEFI",
    difficulty: "medium",
    title: "Complete 3 Vault Deposits",
    description: "Make 3 successful vault deposits maintaining >150% collateralization",
    rewardXP: 250,
    rewardSIGNAL: 200,
    estimatedTime: "1 hour",
    requirements: ["3 vault deposits", "Maintain >150% collateral"],
  },
  {
    id: "defi-hard-1",
    hubType: "DEFI",
    difficulty: "hard",
    title: "Achieve ARCHITECT Rank",
    description: "Reach 500 XP to unlock ARCHITECT rank and +30% APR boost",
    rewardXP: 500,
    rewardSIGNAL: 400,
    estimatedTime: "3 days",
    requirements: ["Reach 500 XP", "Unlock ARCHITECT rank"],
  },
];

// ============ TELEMETRY GENERATION (Week 3) ============

/**
 * Generates JSON telemetry for AI Console v1 (Week 4)
 */
function generateMissionTelemetrySnapshot(): MissionTelemetry {
  const allMissions = [...WORLD_MISSIONS, ...CREATOR_MISSIONS, ...DEFI_MISSIONS];
  
  // Calculate metrics
  const totalXPRewards = allMissions.reduce((sum, m) => sum + m.rewardXP, 0);
  const totalSIGNALRewards = allMissions.reduce((sum, m) => sum + m.rewardSIGNAL, 0);
  
  const difficultyDistribution = {
    easy: allMissions.filter(m => m.difficulty === "easy").length,
    medium: allMissions.filter(m => m.difficulty === "medium").length,
    hard: allMissions.filter(m => m.difficulty === "hard").length,
  };
  
  // Mock completion rate (Phase 1 - static)
  const completionRate = 0.42; // 42% completion rate (simulation)
  
  const telemetry: MissionTelemetry = {
    timestamp: new Date().toISOString(),
    hub: "ALL",
    activeMissions: allMissions.length,
    completionRate,
    totalXPRewards,
    totalSIGNALRewards,
    difficultyDistribution,
    averageEstimatedTime: "12 minutes",
  };
  
  return telemetry;
}

// ============ MISSION AI CLASS ============

export class MissionAI {
  /**
   * Get all missions for a specific hub
   */
  getMissionsForHub(hubType: "WORLD" | "CREATOR" | "DEFI"): Mission[] {
    switch (hubType) {
      case "WORLD":
        return WORLD_MISSIONS;
      case "CREATOR":
        return CREATOR_MISSIONS;
      case "DEFI":
        return DEFI_MISSIONS;
      default:
        return [];
    }
  }
  
  /**
   * Get missions by difficulty
   */
  getMissionsByDifficulty(difficulty: "easy" | "medium" | "hard"): Mission[] {
    return [...WORLD_MISSIONS, ...CREATOR_MISSIONS, ...DEFI_MISSIONS]
      .filter(m => m.difficulty === difficulty);
  }
  
  /**
   * Get all available missions
   */
  getAllMissions(): Mission[] {
    return [...WORLD_MISSIONS, ...CREATOR_MISSIONS, ...DEFI_MISSIONS];
  }
  
  /**
   * Get recommended missions for player (Phase 1: static selection)
   */
  getRecommendedMissions(playerXP: number = 0): Mission[] {
    // Phase 1: Return one of each difficulty regardless of player XP
    // Phase 2: Personalize based on player history, XP, completion rate
    
    return [
      WORLD_MISSIONS[0],   // Easy: Explore Plaza
      CREATOR_MISSIONS[0], // Easy: Claim Creator Status
      DEFI_MISSIONS[1],    // Medium: 3 Vault Deposits
    ];
  }
  
  /**
   * Calculate total rewards for missions
   */
  calculateTotalRewards(missions: Mission[]): { xp: number; signal: number } {
    return missions.reduce(
      (total, mission) => ({
        xp: total.xp + mission.rewardXP,
        signal: total.signal + mission.rewardSIGNAL,
      }),
      { xp: 0, signal: 0 }
    );
  }
  
  /**
   * Generate telemetry snapshot (Week 3)
   */
  generateTelemetry(): MissionTelemetry {
    return generateMissionTelemetrySnapshot();
  }
}

// ============ SINGLETON INSTANCE ============

export const missionAI = new MissionAI();

// ============ TELEMETRY FILE WRITER ============

/**
 * Generates JSON telemetry for AI Console v1 (Week 4)
 */
export function generateMissionTelemetry(): MissionTelemetry {
  return missionAI.generateTelemetry();
}

/**
 * Writes telemetry to JSON file
 */
export function writeMissionTelemetry() {
  const telemetry = generateMissionTelemetry();
  
  const logsDir = path.join(process.cwd(), "logs", "ai", "telemetry");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const outputPath = path.join(logsDir, "mission_telemetry.json");
  fs.writeFileSync(outputPath, JSON.stringify(telemetry, null, 2));
  
  console.log(`📊 Mission telemetry written to: ${outputPath}`);
  return telemetry;
}

// ============ REACT HOOK (for frontend) ============

/**
 * Hook to access MissionAI in React components
 */
export function useMissionAI() {
  return {
    getMissionsForHub: (hubType: "WORLD" | "CREATOR" | "DEFI") => 
      missionAI.getMissionsForHub(hubType),
    
    getAllMissions: () => 
      missionAI.getAllMissions(),
    
    getRecommendedMissions: (playerXP?: number) => 
      missionAI.getRecommendedMissions(playerXP),
    
    calculateTotalRewards: (missions: Mission[]) => 
      missionAI.calculateTotalRewards(missions),
    
    generateTelemetry: () => 
      missionAI.generateTelemetry(),
  };
}

// ============ API ROUTE EXAMPLE ============

/**
 * Example Next.js API route handler
 * File: app/api/missions/route.ts
 */
export async function GET_MISSIONS_HANDLER(request: Request) {
  const { searchParams } = new URL(request.url);
  const hubType = searchParams.get("hub") as "WORLD" | "CREATOR" | "DEFI" | null;
  
  if (hubType) {
    const missions = missionAI.getMissionsForHub(hubType);
    return Response.json({ success: true, missions });
  } else {
    const missions = missionAI.getAllMissions();
    return Response.json({ success: true, missions });
  }
}

// ============ TELEMETRY ============

/**
 * Logs MissionAI telemetry to console (for debugging)
 */
export function logMissionAITelemetry() {
  const allMissions = missionAI.getAllMissions();
  const totalRewards = missionAI.calculateTotalRewards(allMissions);
  
  console.log("\n═════════════════════════════════════════════");
  console.log("📊 MISSION AI v0 TELEMETRY");
  console.log("═════════════════════════════════════════════");
  console.log(`Total Missions: ${allMissions.length}`);
  console.log(`WORLD Missions: ${WORLD_MISSIONS.length}`);
  console.log(`CREATOR Missions: ${CREATOR_MISSIONS.length}`);
  console.log(`DEFI Missions: ${DEFI_MISSIONS.length}`);
  console.log(`\nTotal Potential Rewards:`);
  console.log(`  XP: ${totalRewards.xp.toLocaleString()}`);
  console.log(`  SIGNAL: ${totalRewards.signal.toLocaleString()}`);
  console.log("═════════════════════════════════════════════\n");
}
