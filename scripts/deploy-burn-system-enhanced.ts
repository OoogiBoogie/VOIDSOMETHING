/**
 * VOID BURN SYSTEM - ENHANCED DEPLOYMENT SCRIPT
 * Deploys all 7 burn contracts to Base Sepolia with safety checks
 * 
 * Usage:
 * npx hardhat run scripts/deploy-burn-system-enhanced.ts --network baseSepolia
 * 
 * Prerequisites:
 * - DEPLOYER_PRIVATE_KEY set in .env
 * - BASE_SEPOLIA_RPC_URL set in .env (optional, defaults to public RPC)
 * - BASESCAN_API_KEY set in .env for verification
 * - Deployer wallet must have ETH for gas
 * 
 * Safety Features:
 * - Pre-deployment balance check
 * - Post-deployment verification
 * - Role grant confirmation
 * - Automatic deployment summary export
 * 
 * Note: TypeScript may show errors for hre.ethers.* calls due to .cts config file,
 * but the script will execute correctly at runtime with Hardhat's runtime environment.
 */

import hre from "hardhat";
import fs from "fs";
import path from "path";

// Minimum ETH balance required for deployment (0.01 ETH)
const MIN_BALANCE = hre.ethers.parseEther("0.01");

// VOID token address on Base Sepolia (existing deployment)
const VOID_TOKEN = "0x8de4043445939B0D0Cc7d6c752057707279D9893";

interface DeployedContracts {
  VoidBurnUtility: string;
  DistrictAccessBurn: string;
  LandUpgradeBurn: string;
  CreatorToolsBurn: string;
  PrestigeBurn: string;
  MiniAppBurnAccess: string;
  AIUtilityGovernor: string;
}

/**
 * Pre-deployment checks
 */
async function preDeploymentChecks(deployer: any): Promise<void> {
  console.log("\n🔍 Pre-Deployment Checks");
  console.log("========================\n");

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceEth = hre.ethers.formatEther(balance);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${balanceEth} ETH`);

  if (balance < MIN_BALANCE) {
    throw new Error(`❌ Insufficient balance! Need at least ${hre.ethers.formatEther(MIN_BALANCE)} ETH, have ${balanceEth} ETH`);
  }
  console.log("✅ Balance check passed\n");

  // Verify network
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  if (network.chainId !== 84532n) {
    console.warn("⚠️  Warning: Not deploying to Base Sepolia (expected chain ID: 84532)");
    console.warn(`   Current chain ID: ${network.chainId}`);
    console.warn("   Proceeding anyway...\n");
  } else {
    console.log("✅ Network check passed\n");
  }

  // Verify VOID token exists
  console.log(`Verifying VOID token at ${VOID_TOKEN}...`);
  const code = await hre.ethers.provider.getCode(VOID_TOKEN);
  if (code === "0x") {
    throw new Error(`❌ VOID token contract not found at ${VOID_TOKEN}`);
  }
  console.log("✅ VOID token verified\n");
}

/**
 * Deploy a single contract with error handling
 */
async function deployContract(
  name: string,
  factory: any,
  args: any[],
  step: string
): Promise<string> {
  console.log(`${step} Deploying ${name}...`);
  try {
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log(`✅ ${name} deployed to: ${address}\n`);
    return address;
  } catch (error: any) {
    console.error(`❌ Failed to deploy ${name}:`, error.message);
    throw error;
  }
}

/**
 * Grant role with error handling and confirmation
 */
async function grantRole(
  contract: any,
  roleName: string,
  roleHash: string,
  recipient: string,
  recipientName: string
): Promise<void> {
  console.log(`Granting ${roleName} to ${recipientName}...`);
  try {
    const tx = await contract.grantRole(roleHash, recipient);
    await tx.wait();
    
    // Verify role was granted
    const hasRole = await contract.hasRole(roleHash, recipient);
    if (!hasRole) {
      throw new Error(`Role grant failed verification`);
    }
    
    console.log(`✅ Role granted and verified\n`);
  } catch (error: any) {
    console.error(`❌ Failed to grant ${roleName}:`, error.message);
    throw error;
  }
}

/**
 * Save deployment summary to file
 */
function saveDeploymentSummary(contracts: DeployedContracts, network: string): void {
  const timestamp = new Date().toISOString();
  const summary = {
    network,
    timestamp,
    voidToken: VOID_TOKEN,
    contracts,
    envTemplate: {
      NEXT_PUBLIC_VOID_BURN_UTILITY: contracts.VoidBurnUtility,
      NEXT_PUBLIC_DISTRICT_ACCESS_BURN: contracts.DistrictAccessBurn,
      NEXT_PUBLIC_LAND_UPGRADE_BURN: contracts.LandUpgradeBurn,
      NEXT_PUBLIC_CREATOR_TOOLS_BURN: contracts.CreatorToolsBurn,
      NEXT_PUBLIC_PRESTIGE_BURN: contracts.PrestigeBurn,
      NEXT_PUBLIC_MINIAPP_BURN_ACCESS: contracts.MiniAppBurnAccess,
      NEXT_PUBLIC_AI_UTILITY_GOVERNOR: contracts.AIUtilityGovernor,
    },
  };

  const filename = `burn-deployment-${network}-${Date.now()}.json`;
  const filepath = path.join(process.cwd(), "deployments", filename);
  
  // Ensure deployments directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));
  console.log(`\n💾 Deployment summary saved to: ${filepath}\n`);
}

async function main() {
  console.log("\n🔥 VOID BURN SYSTEM - ENHANCED DEPLOYMENT");
  console.log("=========================================\n");

  const [deployer] = await hre.ethers.getSigners();

  // Pre-deployment checks
  await preDeploymentChecks(deployer);

  const deployedContracts: DeployedContracts = {} as DeployedContracts;

  try {
    // 1. Deploy VoidBurnUtility (Core)
    const VoidBurnUtility = await hre.ethers.getContractFactory("VoidBurnUtility");
    const voidBurnUtility = await VoidBurnUtility.deploy(VOID_TOKEN);
    await voidBurnUtility.waitForDeployment();
    deployedContracts.VoidBurnUtility = await voidBurnUtility.getAddress();
    console.log(`1️⃣  ✅ VoidBurnUtility: ${deployedContracts.VoidBurnUtility}\n`);

    // 2. Deploy DistrictAccessBurn
    const DistrictAccessBurn = await hre.ethers.getContractFactory("DistrictAccessBurn");
    deployedContracts.DistrictAccessBurn = await deployContract(
      "DistrictAccessBurn",
      DistrictAccessBurn,
      [deployedContracts.VoidBurnUtility],
      "2️⃣ "
    );
    const districtAccessBurn = DistrictAccessBurn.attach(deployedContracts.DistrictAccessBurn);

    // 3. Deploy LandUpgradeBurn
    const LandUpgradeBurn = await hre.ethers.getContractFactory("LandUpgradeBurn");
    deployedContracts.LandUpgradeBurn = await deployContract(
      "LandUpgradeBurn",
      LandUpgradeBurn,
      [deployedContracts.VoidBurnUtility],
      "3️⃣ "
    );
    const landUpgradeBurn = LandUpgradeBurn.attach(deployedContracts.LandUpgradeBurn);

    // 4. Deploy CreatorToolsBurn
    const CreatorToolsBurn = await hre.ethers.getContractFactory("CreatorToolsBurn");
    deployedContracts.CreatorToolsBurn = await deployContract(
      "CreatorToolsBurn",
      CreatorToolsBurn,
      [deployedContracts.VoidBurnUtility],
      "4️⃣ "
    );
    const creatorToolsBurn = CreatorToolsBurn.attach(deployedContracts.CreatorToolsBurn);

    // 5. Deploy PrestigeBurn
    const PrestigeBurn = await hre.ethers.getContractFactory("PrestigeBurn");
    deployedContracts.PrestigeBurn = await deployContract(
      "PrestigeBurn",
      PrestigeBurn,
      [deployedContracts.VoidBurnUtility],
      "5️⃣ "
    );
    const prestigeBurn = PrestigeBurn.attach(deployedContracts.PrestigeBurn);

    // 6. Deploy MiniAppBurnAccess
    const MiniAppBurnAccess = await hre.ethers.getContractFactory("MiniAppBurnAccess");
    deployedContracts.MiniAppBurnAccess = await deployContract(
      "MiniAppBurnAccess",
      MiniAppBurnAccess,
      [deployedContracts.VoidBurnUtility],
      "6️⃣ "
    );

    // 7. Deploy AIUtilityGovernor
    const AIUtilityGovernor = await hre.ethers.getContractFactory("AIUtilityGovernor");
    deployedContracts.AIUtilityGovernor = await deployContract(
      "AIUtilityGovernor",
      AIUtilityGovernor,
      [
        deployedContracts.VoidBurnUtility,
        deployedContracts.DistrictAccessBurn,
        deployedContracts.LandUpgradeBurn,
        deployedContracts.CreatorToolsBurn,
        deployedContracts.PrestigeBurn,
      ],
      "7️⃣ "
    );

    // Grant roles
    console.log("\n🔐 Granting Roles");
    console.log("=================\n");

    const BURN_MANAGER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BURN_MANAGER_ROLE"));
    const GOVERNOR_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("GOVERNOR_ROLE"));

    // Grant BURN_MANAGER_ROLE to all modules
    await grantRole(voidBurnUtility, "BURN_MANAGER_ROLE", BURN_MANAGER_ROLE, deployedContracts.DistrictAccessBurn, "DistrictAccessBurn");
    await grantRole(voidBurnUtility, "BURN_MANAGER_ROLE", BURN_MANAGER_ROLE, deployedContracts.LandUpgradeBurn, "LandUpgradeBurn");
    await grantRole(voidBurnUtility, "BURN_MANAGER_ROLE", BURN_MANAGER_ROLE, deployedContracts.CreatorToolsBurn, "CreatorToolsBurn");
    await grantRole(voidBurnUtility, "BURN_MANAGER_ROLE", BURN_MANAGER_ROLE, deployedContracts.PrestigeBurn, "PrestigeBurn");
    await grantRole(voidBurnUtility, "BURN_MANAGER_ROLE", BURN_MANAGER_ROLE, deployedContracts.MiniAppBurnAccess, "MiniAppBurnAccess");

    // Grant GOVERNOR_ROLE to AI Governor in all modules
    await grantRole(districtAccessBurn, "GOVERNOR_ROLE", GOVERNOR_ROLE, deployedContracts.AIUtilityGovernor, "AIUtilityGovernor");
    await grantRole(landUpgradeBurn, "GOVERNOR_ROLE", GOVERNOR_ROLE, deployedContracts.AIUtilityGovernor, "AIUtilityGovernor");
    await grantRole(creatorToolsBurn, "GOVERNOR_ROLE", GOVERNOR_ROLE, deployedContracts.AIUtilityGovernor, "AIUtilityGovernor");
    await grantRole(prestigeBurn, "GOVERNOR_ROLE", GOVERNOR_ROLE, deployedContracts.AIUtilityGovernor, "AIUtilityGovernor");

    // Print summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("========================\n");
    console.log("📝 Contract Addresses:\n");
    console.log(`VOID Token:             ${VOID_TOKEN}`);
    console.log(`VoidBurnUtility:        ${deployedContracts.VoidBurnUtility}`);
    console.log(`DistrictAccessBurn:     ${deployedContracts.DistrictAccessBurn}`);
    console.log(`LandUpgradeBurn:        ${deployedContracts.LandUpgradeBurn}`);
    console.log(`CreatorToolsBurn:       ${deployedContracts.CreatorToolsBurn}`);
    console.log(`PrestigeBurn:           ${deployedContracts.PrestigeBurn}`);
    console.log(`MiniAppBurnAccess:      ${deployedContracts.MiniAppBurnAccess}`);
    console.log(`AIUtilityGovernor:      ${deployedContracts.AIUtilityGovernor}`);

    // Print .env template
    console.log("\n📋 Add to .env.local:\n");
    console.log(`NEXT_PUBLIC_VOID_BURN_UTILITY=${deployedContracts.VoidBurnUtility}`);
    console.log(`NEXT_PUBLIC_DISTRICT_ACCESS_BURN=${deployedContracts.DistrictAccessBurn}`);
    console.log(`NEXT_PUBLIC_LAND_UPGRADE_BURN=${deployedContracts.LandUpgradeBurn}`);
    console.log(`NEXT_PUBLIC_CREATOR_TOOLS_BURN=${deployedContracts.CreatorToolsBurn}`);
    console.log(`NEXT_PUBLIC_PRESTIGE_BURN=${deployedContracts.PrestigeBurn}`);
    console.log(`NEXT_PUBLIC_MINIAPP_BURN_ACCESS=${deployedContracts.MiniAppBurnAccess}`);
    console.log(`NEXT_PUBLIC_AI_UTILITY_GOVERNOR=${deployedContracts.AIUtilityGovernor}`);

    // Print verification commands
    console.log("\n🔍 Basescan Verification Commands:\n");
    console.log(`npx hardhat verify --network baseSepolia ${deployedContracts.VoidBurnUtility} ${VOID_TOKEN}`);
    console.log(`npx hardhat verify --network baseSepolia ${deployedContracts.DistrictAccessBurn} ${deployedContracts.VoidBurnUtility}`);
    console.log(`npx hardhat verify --network baseSepolia ${deployedContracts.LandUpgradeBurn} ${deployedContracts.VoidBurnUtility}`);
    console.log(`npx hardhat verify --network baseSepolia ${deployedContracts.CreatorToolsBurn} ${deployedContracts.VoidBurnUtility}`);
    console.log(`npx hardhat verify --network baseSepolia ${deployedContracts.PrestigeBurn} ${deployedContracts.VoidBurnUtility}`);
    console.log(`npx hardhat verify --network baseSepolia ${deployedContracts.MiniAppBurnAccess} ${deployedContracts.VoidBurnUtility}`);
    console.log(`npx hardhat verify --network baseSepolia ${deployedContracts.AIUtilityGovernor} ${deployedContracts.VoidBurnUtility} ${deployedContracts.DistrictAccessBurn} ${deployedContracts.LandUpgradeBurn} ${deployedContracts.CreatorToolsBurn} ${deployedContracts.PrestigeBurn}`);

    // Save deployment summary
    const network = await hre.ethers.provider.getNetwork();
    saveDeploymentSummary(deployedContracts, network.name);

    console.log("\n✅ All roles granted and verified!");
    console.log("🚀 Ready for frontend integration!\n");

  } catch (error: any) {
    console.error("\n❌ DEPLOYMENT FAILED:", error.message);
    console.error("\nPartially deployed contracts:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      if (address) console.log(`  ${name}: ${address}`);
    });
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
