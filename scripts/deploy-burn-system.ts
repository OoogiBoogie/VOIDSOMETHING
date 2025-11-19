/**
 * VOID BURN SYSTEM - DEPLOYMENT SCRIPT
 * Deploys all 7 burn contracts to Base Sepolia
 * 
 * Usage:
 * npx hardhat run scripts/deploy-burn-system.ts --network baseSepolia
 * 
 * Prerequisites:
 * - DEPLOYER_PRIVATE_KEY set in .env
 * - BASE_SEPOLIA_RPC_URL set in .env (optional, defaults to public RPC)
 * - BASESCAN_API_KEY set in .env for verification
 * 
 * Note: TypeScript may show errors for hre.ethers.* calls due to .cts config file,
 * but the script will execute correctly at runtime with Hardhat's runtime environment.
 */

import hre from "hardhat";

async function main() {
  console.log("\n🔥 VOID BURN SYSTEM DEPLOYMENT");
  console.log("================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // VOID token address (existing deployment on Base Sepolia)
  const VOID_TOKEN = "0x8de4043445939B0D0Cc7d6c752057707279D9893";
  console.log("VOID Token:", VOID_TOKEN, "\n");

  // Deploy contracts
  const deployedContracts: Record<string, string> = {};

  // 1. Deploy VoidBurnUtility (Core)
  console.log("1️⃣  Deploying VoidBurnUtility...");
  const VoidBurnUtility = await hre.ethers.getContractFactory("VoidBurnUtility");
  const voidBurnUtility = await VoidBurnUtility.deploy(VOID_TOKEN);
  await voidBurnUtility.waitForDeployment();
  const voidBurnUtilityAddress = await voidBurnUtility.getAddress();
  deployedContracts.VoidBurnUtility = voidBurnUtilityAddress;
  console.log("✅ VoidBurnUtility deployed to:", voidBurnUtilityAddress, "\n");

  // 2. Deploy DistrictAccessBurn
  console.log("2️⃣  Deploying DistrictAccessBurn...");
  const DistrictAccessBurn = await hre.ethers.getContractFactory("DistrictAccessBurn");
  const districtAccessBurn = await DistrictAccessBurn.deploy(voidBurnUtilityAddress);
  await districtAccessBurn.waitForDeployment();
  const districtAccessBurnAddress = await districtAccessBurn.getAddress();
  deployedContracts.DistrictAccessBurn = districtAccessBurnAddress;
  console.log("✅ DistrictAccessBurn deployed to:", districtAccessBurnAddress, "\n");

  // 3. Deploy LandUpgradeBurn
  console.log("3️⃣  Deploying LandUpgradeBurn...");
  const LandUpgradeBurn = await hre.ethers.getContractFactory("LandUpgradeBurn");
  const landUpgradeBurn = await LandUpgradeBurn.deploy(voidBurnUtilityAddress);
  await landUpgradeBurn.waitForDeployment();
  const landUpgradeBurnAddress = await landUpgradeBurn.getAddress();
  deployedContracts.LandUpgradeBurn = landUpgradeBurnAddress;
  console.log("✅ LandUpgradeBurn deployed to:", landUpgradeBurnAddress, "\n");

  // 4. Deploy CreatorToolsBurn
  console.log("4️⃣  Deploying CreatorToolsBurn...");
  const CreatorToolsBurn = await hre.ethers.getContractFactory("CreatorToolsBurn");
  const creatorToolsBurn = await CreatorToolsBurn.deploy(voidBurnUtilityAddress);
  await creatorToolsBurn.waitForDeployment();
  const creatorToolsBurnAddress = await creatorToolsBurn.getAddress();
  deployedContracts.CreatorToolsBurn = creatorToolsBurnAddress;
  console.log("✅ CreatorToolsBurn deployed to:", creatorToolsBurnAddress, "\n");

  // 5. Deploy PrestigeBurn
  console.log("5️⃣  Deploying PrestigeBurn...");
  const PrestigeBurn = await hre.ethers.getContractFactory("PrestigeBurn");
  const prestigeBurn = await PrestigeBurn.deploy(voidBurnUtilityAddress);
  await prestigeBurn.waitForDeployment();
  const prestigeBurnAddress = await prestigeBurn.getAddress();
  deployedContracts.PrestigeBurn = prestigeBurnAddress;
  console.log("✅ PrestigeBurn deployed to:", prestigeBurnAddress, "\n");

  // 6. Deploy MiniAppBurnAccess
  console.log("6️⃣  Deploying MiniAppBurnAccess...");
  const MiniAppBurnAccess = await hre.ethers.getContractFactory("MiniAppBurnAccess");
  const miniAppBurnAccess = await MiniAppBurnAccess.deploy(voidBurnUtilityAddress);
  await miniAppBurnAccess.waitForDeployment();
  const miniAppBurnAccessAddress = await miniAppBurnAccess.getAddress();
  deployedContracts.MiniAppBurnAccess = miniAppBurnAccessAddress;
  console.log("✅ MiniAppBurnAccess deployed to:", miniAppBurnAccessAddress, "\n");

  // 7. Deploy AIUtilityGovernor
  console.log("7️⃣  Deploying AIUtilityGovernor...");
  const AIUtilityGovernor = await hre.ethers.getContractFactory("AIUtilityGovernor");
  const aiUtilityGovernor = await AIUtilityGovernor.deploy(
    voidBurnUtilityAddress,
    districtAccessBurnAddress,
    landUpgradeBurnAddress,
    creatorToolsBurnAddress,
    prestigeBurnAddress
  );
  await aiUtilityGovernor.waitForDeployment();
  const aiUtilityGovernorAddress = await aiUtilityGovernor.getAddress();
  deployedContracts.AIUtilityGovernor = aiUtilityGovernorAddress;
  console.log("✅ AIUtilityGovernor deployed to:", aiUtilityGovernorAddress, "\n");

  // Grant roles
  console.log("🔐 Granting roles...\n");

  // Grant BURN_MANAGER_ROLE to all burn modules
  const BURN_MANAGER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BURN_MANAGER_ROLE"));
  
  console.log("Granting BURN_MANAGER_ROLE to DistrictAccessBurn...");
  await voidBurnUtility.grantRole(BURN_MANAGER_ROLE, districtAccessBurnAddress);
  console.log("✅ Role granted\n");

  console.log("Granting BURN_MANAGER_ROLE to LandUpgradeBurn...");
  await voidBurnUtility.grantRole(BURN_MANAGER_ROLE, landUpgradeBurnAddress);
  console.log("✅ Role granted\n");

  console.log("Granting BURN_MANAGER_ROLE to CreatorToolsBurn...");
  await voidBurnUtility.grantRole(BURN_MANAGER_ROLE, creatorToolsBurnAddress);
  console.log("✅ Role granted\n");

  console.log("Granting BURN_MANAGER_ROLE to PrestigeBurn...");
  await voidBurnUtility.grantRole(BURN_MANAGER_ROLE, prestigeBurnAddress);
  console.log("✅ Role granted\n");

  console.log("Granting BURN_MANAGER_ROLE to MiniAppBurnAccess...");
  await voidBurnUtility.grantRole(BURN_MANAGER_ROLE, miniAppBurnAccessAddress);
  console.log("✅ Role granted\n");

  // Grant GOVERNOR_ROLE to AIUtilityGovernor
  const GOVERNOR_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("GOVERNOR_ROLE"));
  
  console.log("Granting GOVERNOR_ROLE to AIUtilityGovernor in DistrictAccessBurn...");
  await districtAccessBurn.grantRole(GOVERNOR_ROLE, aiUtilityGovernorAddress);
  console.log("✅ Role granted\n");

  console.log("Granting GOVERNOR_ROLE to AIUtilityGovernor in LandUpgradeBurn...");
  await landUpgradeBurn.grantRole(GOVERNOR_ROLE, aiUtilityGovernorAddress);
  console.log("✅ Role granted\n");

  console.log("Granting GOVERNOR_ROLE to AIUtilityGovernor in CreatorToolsBurn...");
  await creatorToolsBurn.grantRole(GOVERNOR_ROLE, aiUtilityGovernorAddress);
  console.log("✅ Role granted\n");

  console.log("Granting GOVERNOR_ROLE to AIUtilityGovernor in PrestigeBurn...");
  await prestigeBurn.grantRole(GOVERNOR_ROLE, aiUtilityGovernorAddress);
  console.log("✅ Role granted\n");

  // Print summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=========================\n");
  console.log("📝 Contract Addresses:\n");
  console.log("VOID Token:            ", VOID_TOKEN);
  console.log("VoidBurnUtility:       ", deployedContracts.VoidBurnUtility);
  console.log("DistrictAccessBurn:    ", deployedContracts.DistrictAccessBurn);
  console.log("LandUpgradeBurn:       ", deployedContracts.LandUpgradeBurn);
  console.log("CreatorToolsBurn:      ", deployedContracts.CreatorToolsBurn);
  console.log("PrestigeBurn:          ", deployedContracts.PrestigeBurn);
  console.log("MiniAppBurnAccess:     ", deployedContracts.MiniAppBurnAccess);
  console.log("AIUtilityGovernor:     ", deployedContracts.AIUtilityGovernor);

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
  Object.entries(deployedContracts).forEach(([name, address]) => {
    if (name === "AIUtilityGovernor") {
      console.log(`npx hardhat verify --network baseSepolia ${address} ${deployedContracts.VoidBurnUtility} ${deployedContracts.DistrictAccessBurn} ${deployedContracts.LandUpgradeBurn} ${deployedContracts.CreatorToolsBurn} ${deployedContracts.PrestigeBurn}`);
    } else if (name === "VoidBurnUtility") {
      console.log(`npx hardhat verify --network baseSepolia ${address} ${VOID_TOKEN}`);
    } else {
      console.log(`npx hardhat verify --network baseSepolia ${address} ${deployedContracts.VoidBurnUtility}`);
    }
  });

  console.log("\n✅ All roles granted successfully!");
  console.log("\n🚀 Ready for frontend integration!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
