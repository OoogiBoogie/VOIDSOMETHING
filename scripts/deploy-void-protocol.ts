import hre from "hardhat";

/**
 * Deploy complete Void Protocol to Ethereum Sepolia
 * Includes: VoidMessaging, VoidStorage, VoidScore
 * 
 * Usage:
 * npx hardhat run scripts/deploy-void-protocol.ts --network sepolia
 */
async function main() {
  console.log("🚀 Deploying Complete Void Protocol...\n");

  // Net Protocol addresses on Sepolia
  const NET_PROTOCOL = "0x00000000B24D62781dB359b07880a105cD0b64e6";
  const NET_STORAGE = "0x00000000DB40fcB9f4466330982372e27Fd7Bbf5";

  console.log("📍 Using Net Protocol:", NET_PROTOCOL);
  console.log("📍 Using Net Storage:", NET_STORAGE);
  console.log("");

  // Deploy VoidMessaging
  console.log("📝 Deploying VoidMessaging...");
  const VoidMessaging = await hre.ethers.getContractFactory("VoidMessaging");
  const messaging = await VoidMessaging.deploy(NET_PROTOCOL, NET_STORAGE);
  await messaging.waitForDeployment();
  const messagingAddress = await messaging.getAddress();
  console.log("✅ VoidMessaging deployed to:", messagingAddress);
  console.log("");

  // Deploy VoidStorage
  console.log("📝 Deploying VoidStorage...");
  const VoidStorage = await hre.ethers.getContractFactory("VoidStorage");
  const storage = await VoidStorage.deploy(NET_STORAGE);
  await storage.waitForDeployment();
  const storageAddress = await storage.getAddress();
  console.log("✅ VoidStorage deployed to:", storageAddress);
  console.log("");

  // Deploy VoidScore
  console.log("📝 Deploying VoidScore...");
  const VoidScore = await hre.ethers.getContractFactory("VoidScore");
  const voidScore = await VoidScore.deploy(messagingAddress, storageAddress);
  await voidScore.waitForDeployment();
  const scoreAddress = await voidScore.getAddress();
  console.log("✅ VoidScore deployed to:", scoreAddress);
  console.log("");

  // Summary
  console.log("=" .repeat(70));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(70));
  console.log("VoidMessaging:", messagingAddress);
  console.log("VoidStorage:  ", storageAddress);
  console.log("VoidScore:    ", scoreAddress);
  console.log("");
  console.log("Next steps:");
  console.log("1. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${messagingAddress} ${NET_PROTOCOL} ${NET_STORAGE}`);
  console.log(`   npx hardhat verify --network sepolia ${storageAddress} ${NET_STORAGE}`);
  console.log(`   npx hardhat verify --network sepolia ${scoreAddress} ${messagingAddress} ${storageAddress}`);
  console.log("");
  console.log("2. Update frontend config:");
  console.log(`   export const VOID_PROTOCOL = {`);
  console.log(`     messaging: "${messagingAddress}",`);
  console.log(`     storage: "${storageAddress}",`);
  console.log(`     score: "${scoreAddress}"`);
  console.log(`   };`);
  console.log("");
  console.log("3. Test basic operations:");
  console.log("   - Send a global message");
  console.log("   - Set a user profile");
  console.log("   - Claim profile bonus");
  console.log("   - Check user score and tier");
  console.log("   - Query message history");
  console.log("");
  console.log("4. Set up subgraph:");
  console.log("   - Index VoidMessageSent, ScoreUpdated, ProfileUpdated events");
  console.log("   - Deploy to The Graph Network");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
