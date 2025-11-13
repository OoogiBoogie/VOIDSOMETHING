/**
 * @title VOID Testnet Deployment Script
 * @notice Deploys all contracts to Base Sepolia testnet
 * 
 * Required ENV variables:
 * - BASE_SEPOLIA_RPC_URL: RPC endpoint for Base Sepolia
 * - DEPLOYER_PRIVATE_KEY: Private key of funded deployer wallet
 * 
 * Usage:
 * npx hardhat run scripts/deploy/deploy-testnet.ts --network baseSepolia
 */

import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

// Deployment config
const DEPLOYMENT_CONFIG = {
  // Mock token initial supplies (testnet only)
  PSX_SUPPLY: ethers.parseEther("10000000"), // 10M PSX
  CREATE_SUPPLY: ethers.parseEther("5000000"), // 5M CREATE
  VOID_SUPPLY: ethers.parseEther("20000000"), // 20M VOID
  SIGNAL_SUPPLY: ethers.parseEther("1000000"), // 1M SIGNAL
  AGENCY_SUPPLY: ethers.parseEther("500000"), // 500k AGENCY
  
  // XPOracle config
  XP_STALENESS_THRESHOLD: 7200, // 2 hours
  
  // TokenExpansionOracle criteria
  MIN_VOLUME_7D: ethers.parseEther("500000"), // $500k volume
  MIN_HOLDERS: 100,
  MIN_FEES_PAID: ethers.parseEther("1000"), // $1k fees
  
  // Grid config (matches TypeScript GRID_SIZE)
  GRID_SIZE: 40,
  TOTAL_PARCELS: 1600,
};

interface DeployedContracts {
  // Mock tokens
  PSX: string;
  CREATE: string;
  VOID: string;
  SIGNAL: string;
  AGENCY: string;
  USDC_Test: string;
  WETH_Test: string;
  
  // Core oracles
  XPOracle: string;
  MissionRegistry: string;
  EscrowVault: string;
  TokenExpansionOracle: string;
  
  // (To be added in Week 2)
  // VoidEmitter: string;
  // VoidVault: string;
  // VoidDAO: string;
  // WorldLand: string;
  // etc.
}

async function main() {
  console.log("🚀 Starting VOID Testnet Deployment (Week 1)...\n");
  
  // Verify env variables
  if (!process.env.BASE_SEPOLIA_RPC_URL) {
    throw new Error("❌ BASE_SEPOLIA_RPC_URL not set in .env");
  }
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error("❌ DEPLOYER_PRIVATE_KEY not set in .env");
  }
  
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying from:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");
  
  const deployed: Partial<DeployedContracts> = {};
  
  // ============================================================================
  // STEP 1: Deploy Mock Tokens (Testnet Only)
  // ============================================================================
  console.log("📦 Step 1: Deploying Mock Tokens...");
  
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  
  console.log("  Deploying PSX_Test...");
  const PSX = await ERC20Mock.deploy("PSX Test", "PSX", DEPLOYMENT_CONFIG.PSX_SUPPLY);
  await PSX.waitForDeployment();
  deployed.PSX = await PSX.getAddress();
  console.log("  ✅ PSX_Test:", deployed.PSX);
  
  console.log("  Deploying CREATE_Test...");
  const CREATE = await ERC20Mock.deploy("CREATE Test", "CREATE", DEPLOYMENT_CONFIG.CREATE_SUPPLY);
  await CREATE.waitForDeployment();
  deployed.CREATE = await CREATE.getAddress();
  console.log("  ✅ CREATE_Test:", deployed.CREATE);
  
  console.log("  Deploying VOID_Test...");
  const VOID = await ERC20Mock.deploy("VOID Test", "VOID", DEPLOYMENT_CONFIG.VOID_SUPPLY);
  await VOID.waitForDeployment();
  deployed.VOID = await VOID.getAddress();
  console.log("  ✅ VOID_Test:", deployed.VOID);
  
  console.log("  Deploying SIGNAL_Test...");
  const SIGNAL = await ERC20Mock.deploy("SIGNAL Test", "SIGNAL", DEPLOYMENT_CONFIG.SIGNAL_SUPPLY);
  await SIGNAL.waitForDeployment();
  deployed.SIGNAL = await SIGNAL.getAddress();
  console.log("  ✅ SIGNAL_Test:", deployed.SIGNAL);
  
  console.log("  Deploying AGENCY_Test...");
  const AGENCY = await ERC20Mock.deploy("AGENCY Test", "AGENCY", DEPLOYMENT_CONFIG.AGENCY_SUPPLY);
  await AGENCY.waitForDeployment();
  deployed.AGENCY = await AGENCY.getAddress();
  console.log("  ✅ AGENCY_Test:", deployed.AGENCY);
  
  console.log("  Deploying USDC_Test...");
  const USDC_Test = await ERC20Mock.deploy("USDC Test", "USDC", ethers.parseUnits("1000000", 6)); // 1M USDC (6 decimals)
  await USDC_Test.waitForDeployment();
  deployed.USDC_Test = await USDC_Test.getAddress();
  console.log("  ✅ USDC_Test:", deployed.USDC_Test);
  
  console.log("  Deploying WETH_Test...");
  const WETH_Test = await ERC20Mock.deploy("WETH Test", "WETH", ethers.parseEther("10000")); // 10k WETH
  await WETH_Test.waitForDeployment();
  deployed.WETH_Test = await WETH_Test.getAddress();
  console.log("  ✅ WETH_Test:", deployed.WETH_Test, "\n");
  
  // ============================================================================
  // STEP 2: Deploy XPOracle
  // ============================================================================
  console.log("📦 Step 2: Deploying XPOracle...");
  
  const XPOracle = await ethers.getContractFactory("XPOracle");
  const xpOracle = await XPOracle.deploy(
    deployer.address, // admin
    deployer.address  // updater (will be indexer service later)
  );
  await xpOracle.waitForDeployment();
  deployed.XPOracle = await xpOracle.getAddress();
  console.log("  ✅ XPOracle:", deployed.XPOracle, "\n");
  
  // ============================================================================
  // STEP 3: Deploy MissionRegistry
  // ============================================================================
  console.log("📦 Step 3: Deploying MissionRegistry...");
  
  // Note: VoidEmitter address will be updated in Week 2
  // For now, use deployer address as placeholder
  const MissionRegistry = await ethers.getContractFactory("MissionRegistry");
  const missionRegistry = await MissionRegistry.deploy(
    deployer.address, // admin
    deployer.address, // missionAI (will be AI service later)
    deployer.address, // verifier (will be backend service later)
    deployer.address  // voidEmitter placeholder (update in Week 2)
  );
  await missionRegistry.waitForDeployment();
  deployed.MissionRegistry = await missionRegistry.getAddress();
  console.log("  ✅ MissionRegistry:", deployed.MissionRegistry);
  console.log("  ⚠️  VoidEmitter placeholder set to deployer - update in Week 2\n");
  
  // ============================================================================
  // STEP 4: Deploy EscrowVault
  // ============================================================================
  console.log("📦 Step 4: Deploying EscrowVault...");
  
  const EscrowVault = await ethers.getContractFactory("EscrowVault");
  const escrowVault = await EscrowVault.deploy(
    deployer.address, // admin
    deployer.address, // agencyRole (will be Agency Hub later)
    deployer.address  // daoRole (will be VoidDAO later)
  );
  await escrowVault.waitForDeployment();
  deployed.EscrowVault = await escrowVault.getAddress();
  console.log("  ✅ EscrowVault:", deployed.EscrowVault, "\n");
  
  // ============================================================================
  // STEP 5: Deploy TokenExpansionOracle
  // ============================================================================
  console.log("📦 Step 5: Deploying TokenExpansionOracle...");
  
  const TokenExpansionOracle = await ethers.getContractFactory("TokenExpansionOracle");
  const tokenExpansionOracle = await TokenExpansionOracle.deploy(
    deployer.address, // admin
    deployer.address, // oracle (will be indexer service later)
    deployer.address, // governance (will be VoidDAO later)
    DEPLOYMENT_CONFIG.MIN_VOLUME_7D,
    DEPLOYMENT_CONFIG.MIN_HOLDERS,
    DEPLOYMENT_CONFIG.MIN_FEES_PAID
  );
  await tokenExpansionOracle.waitForDeployment();
  deployed.TokenExpansionOracle = await tokenExpansionOracle.getAddress();
  console.log("  ✅ TokenExpansionOracle:", deployed.TokenExpansionOracle, "\n");
  
  // ============================================================================
  // DEPLOYMENT SUMMARY
  // ============================================================================
  console.log("✨ Week 1 Deployment Complete!\n");
  console.log("============================================================================");
  console.log("DEPLOYED CONTRACTS (Base Sepolia)");
  console.log("============================================================================");
  console.log("\n📌 Mock Tokens:");
  console.log("  PSX_Test:    ", deployed.PSX);
  console.log("  CREATE_Test: ", deployed.CREATE);
  console.log("  VOID_Test:   ", deployed.VOID);
  console.log("  SIGNAL_Test: ", deployed.SIGNAL);
  console.log("  AGENCY_Test: ", deployed.AGENCY);
  console.log("  USDC_Test:   ", deployed.USDC_Test);
  console.log("  WETH_Test:   ", deployed.WETH_Test);
  
  console.log("\n📌 Week 1 Oracles:");
  console.log("  XPOracle:              ", deployed.XPOracle);
  console.log("  MissionRegistry:       ", deployed.MissionRegistry);
  console.log("  EscrowVault:           ", deployed.EscrowVault);
  console.log("  TokenExpansionOracle:  ", deployed.TokenExpansionOracle);
  
  console.log("\n============================================================================");
  console.log("⚠️  NEXT STEPS:");
  console.log("============================================================================");
  console.log("1. Run land grid migration SQL on testnet database:");
  console.log("   psql <connection_string> -f scripts/MIGRATION_001_fix_land_grid.sql");
  console.log("\n2. Update frontend .env with deployed addresses:");
  console.log("   NEXT_PUBLIC_XP_ORACLE_ADDRESS=" + deployed.XPOracle);
  console.log("   NEXT_PUBLIC_MISSION_REGISTRY_ADDRESS=" + deployed.MissionRegistry);
  console.log("   NEXT_PUBLIC_ESCROW_VAULT_ADDRESS=" + deployed.EscrowVault);
  console.log("   NEXT_PUBLIC_TOKEN_EXPANSION_ORACLE_ADDRESS=" + deployed.TokenExpansionOracle);
  console.log("\n3. Week 2: Deploy VoidEmitter, VoidVault, VoidDAO, WorldLand, etc.");
  console.log("   Then update MissionRegistry.setVoidEmitter() and role assignments");
  console.log("\n4. Week 2: Build AI services (EmissionAI, VaultAI, MissionAI) in TypeScript");
  console.log("   Configure services/ folder with deployed contract addresses");
  console.log("\n5. Week 2: Enhance indexer to track vXP, missions, token stats");
  console.log("============================================================================\n");
  
  // Save deployment addresses to file
  const fs = require("fs");
  const deploymentPath = "./deployments/base-sepolia-week1.json";
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deployed, null, 2)
  );
  console.log("💾 Deployment addresses saved to:", deploymentPath, "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
