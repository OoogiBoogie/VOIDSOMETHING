/**
 * Deploy VoidBurnUtilitySeasonal
 * Core seasonal burn engine with Season 0 initialization
 */

import hre from "hardhat";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const VOID_TOKEN_ADDRESS = process.env.VOID_TOKEN_ADDRESS || "0x8de4043445939B0D0Cc7d6c752057707279D9893";
const DEPLOYMENT_FILE = join(__dirname, "../../deployments/seasonal-contracts.json");

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("DEPLOYING: VoidBurnUtilitySeasonal");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy VoidBurnUtilitySeasonal
  console.log("Deploying VoidBurnUtilitySeasonal...");
  const VoidBurnUtilitySeasonal = await hre.ethers.getContractFactory("VoidBurnUtilitySeasonal");
  const burnUtility = await VoidBurnUtilitySeasonal.deploy(VOID_TOKEN_ADDRESS);
  await burnUtility.waitForDeployment();
  const burnUtilityAddress = await burnUtility.getAddress();

  console.log("✅ VoidBurnUtilitySeasonal deployed to:", burnUtilityAddress);

  // Season 0 is auto-initialized in constructor
  console.log("\n📊 Season 0 Configuration:");
  const season0 = await burnUtility.getSeasonConfig(0);
  console.log("  - Season ID:", season0.id.toString());
  console.log("  - Duration:", Number(season0.endTime - season0.startTime) / 86400, "days");
  console.log("  - Daily Cap:", hre.ethers.formatEther(season0.dailyCreditCap), "VOID");
  console.log("  - Season Cap:", hre.ethers.formatEther(season0.seasonCreditCap), "VOID");
  console.log("  - Active:", season0.active);

  // Save deployment info
  let deployments: any = {};
  if (existsSync(DEPLOYMENT_FILE)) {
    deployments = JSON.parse(readFileSync(DEPLOYMENT_FILE, "utf-8"));
  }

  deployments.VoidBurnUtilitySeasonal = {
    address: burnUtilityAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    network: (await hre.ethers.provider.getNetwork()).name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
  };

  writeFileSync(DEPLOYMENT_FILE, JSON.stringify(deployments, null, 2));
  console.log("\n💾 Deployment saved to:", DEPLOYMENT_FILE);

  console.log("\n✅ Step 1 Complete: VoidBurnUtilitySeasonal deployed");
  console.log("═══════════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
