/**
 * SEASONAL BURN SYSTEM - ALL-IN-ONE DEPLOYMENT
 * Deploys all 7 seasonal contracts to Base Sepolia
 * 
 * Usage:
 * npx hardhat run scripts/deploy-seasonal-burn-system.ts --network baseSepolia
 */

import hre from "hardhat";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const VOID_TOKEN_ADDRESS = process.env.VOID_TOKEN_ADDRESS || "0x8de4043445939B0D0Cc7d6c752057707279D9893";

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("VOID SEASONAL BURN SYSTEM - DEPLOYMENT");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", (await hre.ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("");

  const deployments: any = {};

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: Deploy VoidBurnUtilitySeasonal
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("Step 1: Deploying VoidBurnUtilitySeasonal...");
  console.log("  - Initializes Season 0 (90-day duration)");
  console.log("  - Daily credit cap: 6k VOID");
  console.log("  - Seasonal credit cap: 100k VOID\n");

  const VoidBurnUtilitySeasonal = await hre.ethers.getContractFactory("VoidBurnUtilitySeasonal");
  const burnUtility = await VoidBurnUtilitySeasonal.deploy(VOID_TOKEN_ADDRESS);
  await burnUtility.waitForDeployment();
  const burnUtilityAddress = await burnUtility.getAddress();

  console.log("✅ VoidBurnUtilitySeasonal deployed to:", burnUtilityAddress);

  // Verify Season 0 config
  const season0 = await burnUtility.getSeasonConfig(0);
  console.log("\n📊 Season 0 Configuration:");
  console.log("  - Season ID:", season0.id.toString());
  console.log("  - Duration:", Number(season0.endTime - season0.startTime) / 86400, "days");
  console.log("  - Daily Cap:", hre.ethers.formatEther(season0.dailyCreditCap), "VOID");
  console.log("  - Season Cap:", hre.ethers.formatEther(season0.seasonCreditCap), "VOID");
  console.log("  - Active:", season0.active);

  deployments.VoidBurnUtilitySeasonal = { address: burnUtilityAddress };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: Deploy XPRewardSystemSeasonal
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n\nStep 2: Deploying XPRewardSystemSeasonal...");
  console.log("  - Seasonal XP tracking");
  console.log("  - Lifetime level progression");
  console.log("  - Airdrop weight calculation\n");

  const XPRewardSystemSeasonal = await hre.ethers.getContractFactory("XPRewardSystemSeasonal");
  const xpSystem = await XPRewardSystemSeasonal.deploy(burnUtilityAddress);
  await xpSystem.waitForDeployment();
  const xpSystemAddress = await xpSystem.getAddress();

  console.log("✅ XPRewardSystemSeasonal deployed to:", xpSystemAddress);

  deployments.XPRewardSystemSeasonal = { address: xpSystemAddress };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: Deploy Module Contracts
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n\nStep 3: Deploying Module Contracts...\n");

  // 3a: DistrictAccessBurnSeasonal
  console.log("  3a: DistrictAccessBurnSeasonal...");
  const DistrictAccessBurnSeasonal = await hre.ethers.getContractFactory("DistrictAccessBurnSeasonal");
  const districtAccess = await DistrictAccessBurnSeasonal.deploy(burnUtilityAddress);
  await districtAccess.waitForDeployment();
  const districtAccessAddress = await districtAccess.getAddress();
  console.log("  ✅ Deployed to:", districtAccessAddress);
  deployments.DistrictAccessBurnSeasonal = { address: districtAccessAddress };

  // 3b: LandUpgradeBurnSeasonal
  console.log("\n  3b: LandUpgradeBurnSeasonal...");
  const LandUpgradeBurnSeasonal = await hre.ethers.getContractFactory("LandUpgradeBurnSeasonal");
  const landUpgrade = await LandUpgradeBurnSeasonal.deploy(burnUtilityAddress);
  await landUpgrade.waitForDeployment();
  const landUpgradeAddress = await landUpgrade.getAddress();
  console.log("  ✅ Deployed to:", landUpgradeAddress);
  deployments.LandUpgradeBurnSeasonal = { address: landUpgradeAddress };

  // 3c: CreatorToolsBurnSeasonal
  console.log("\n  3c: CreatorToolsBurnSeasonal...");
  const CreatorToolsBurnSeasonal = await hre.ethers.getContractFactory("CreatorToolsBurnSeasonal");
  const creatorTools = await CreatorToolsBurnSeasonal.deploy(burnUtilityAddress);
  await creatorTools.waitForDeployment();
  const creatorToolsAddress = await creatorTools.getAddress();
  console.log("  ✅ Deployed to:", creatorToolsAddress);
  deployments.CreatorToolsBurnSeasonal = { address: creatorToolsAddress };

  // 3d: PrestigeBurnSeasonal
  console.log("\n  3d: PrestigeBurnSeasonal...");
  const PrestigeBurnSeasonal = await hre.ethers.getContractFactory("PrestigeBurnSeasonal");
  const prestige = await PrestigeBurnSeasonal.deploy(burnUtilityAddress);
  await prestige.waitForDeployment();
  const prestigeAddress = await prestige.getAddress();
  console.log("  ✅ Deployed to:", prestigeAddress);
  deployments.PrestigeBurnSeasonal = { address: prestigeAddress };

  // 3e: MiniAppBurnAccessSeasonal
  console.log("\n  3e: MiniAppBurnAccessSeasonal...");
  const MiniAppBurnAccessSeasonal = await hre.ethers.getContractFactory("MiniAppBurnAccessSeasonal");
  const miniAppAccess = await MiniAppBurnAccessSeasonal.deploy(burnUtilityAddress);
  await miniAppAccess.waitForDeployment();
  const miniAppAccessAddress = await miniAppAccess.getAddress();
  console.log("  ✅ Deployed to:", miniAppAccessAddress);
  deployments.MiniAppBurnAccessSeasonal = { address: miniAppAccessAddress };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4: Configure Roles
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n\nStep 4: Configuring Roles...\n");

  // Grant MODULE_ROLE to all 5 modules
  const MODULE_ROLE = await burnUtility.MODULE_ROLE();

  console.log("  Granting MODULE_ROLE to DistrictAccessBurnSeasonal...");
  await burnUtility.grantRole(MODULE_ROLE, districtAccessAddress);

  console.log("  Granting MODULE_ROLE to LandUpgradeBurnSeasonal...");
  await burnUtility.grantRole(MODULE_ROLE, landUpgradeAddress);

  console.log("  Granting MODULE_ROLE to CreatorToolsBurnSeasonal...");
  await burnUtility.grantRole(MODULE_ROLE, creatorToolsAddress);

  console.log("  Granting MODULE_ROLE to PrestigeBurnSeasonal...");
  await burnUtility.grantRole(MODULE_ROLE, prestigeAddress);

  console.log("  Granting MODULE_ROLE to MiniAppBurnAccessSeasonal...");
  await burnUtility.grantRole(MODULE_ROLE, miniAppAccessAddress);

  console.log("\n  ✅ All modules granted MODULE_ROLE");

  // Set XP system in burn utility
  console.log("\n  Setting XP system in VoidBurnUtilitySeasonal...");
  await burnUtility.setXPRewardSystem(xpSystemAddress);
  console.log("  ✅ XP system configured");

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5: Save Deployment Info
  // ═══════════════════════════════════════════════════════════════════════════

  const deploymentsDir = join(__dirname, "../deployments");
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    network: (await hre.ethers.provider.getNetwork()).name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployments,
  };

  const deploymentFile = join(deploymentsDir, "seasonal-burn-system.json");
  writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

  console.log("\n\n💾 Deployment info saved to:", deploymentFile);

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPLOYMENT SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("✅ DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log("📋 Contract Addresses:\n");
  console.log("Core:");
  console.log("  VoidBurnUtilitySeasonal:    ", burnUtilityAddress);
  console.log("  XPRewardSystemSeasonal:     ", xpSystemAddress);
  console.log("\nModules:");
  console.log("  DistrictAccessBurnSeasonal: ", districtAccessAddress);
  console.log("  LandUpgradeBurnSeasonal:    ", landUpgradeAddress);
  console.log("  CreatorToolsBurnSeasonal:   ", creatorToolsAddress);
  console.log("  PrestigeBurnSeasonal:       ", prestigeAddress);
  console.log("  MiniAppBurnAccessSeasonal:  ", miniAppAccessAddress);

  console.log("\n\n📝 Next Steps:");
  console.log("  1. Update hooks/useSeasonalBurn.ts with deployed addresses");
  console.log("  2. Run QA test suite (48 test cases)");
  console.log("  3. Verify contracts on Basescan");
  console.log("  4. Test frontend integration");
  console.log("\n═══════════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
