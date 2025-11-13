import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🚀 VOID MINIMAL TESTNET DEPLOYMENT");
  console.log("═══════════════════════════════════════════════════════\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy a single ERC20Mock (VOID_Test) to keep it cheap
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  const initialSupply = ethers.parseEther("1000000"); // 1M VOID_Test
  console.log("Deploying VOID_Test (ERC20Mock)...");
  const voidToken = await ERC20Mock.deploy("VOID Test", "VOID", initialSupply, 18);
  await voidToken.waitForDeployment();
  const voidAddr = await voidToken.getAddress();
  console.log("✅ VOID_Test:", voidAddr);

  // Optionally deploy VoidHookRouterV4 if available
  let routerAddr: string | undefined;
  try {
    const VoidHookRouterV4 = await ethers.getContractFactory("VoidHookRouterV4");
    console.log("Deploying VoidHookRouterV4 (test placeholders)...");
    const r = await VoidHookRouterV4.deploy(
      deployer.address,
      deployer.address,
      deployer.address,
      deployer.address,
      deployer.address,
      deployer.address
    );
    await r.waitForDeployment();
    routerAddr = await r.getAddress();
    console.log("✅ VoidHookRouterV4:", routerAddr);
  } catch (e) {
    console.log("⚠️  Skipping VoidHookRouterV4 (factory not found):", (e as Error).message);
  }

  // Save addresses
  const outDir = path.resolve(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "testnet.json"),
    JSON.stringify({
      network: "baseSepolia",
      deployer: deployer.address,
      VOID_Test: voidAddr,
      VoidHookRouterV4: routerAddr
    }, null, 2)
  );

  console.log("\n✅ Minimal deployment complete. Addresses written to chain/deployments/testnet.json\n");
}

main().catch((err) => {
  console.error("\n❌ Deployment failed:", err);
  process.exit(1);
});
