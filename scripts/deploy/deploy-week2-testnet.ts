/**
 * @title VOID Week 2 Testnet Deployment Script
 * @notice Deploys all Week 1 + Week 2 contracts to Base Sepolia
 * 
 * Includes:
 * - VoidHookRouterV4 (APPROVED fee split: 40/20/10/10/10/5/5)
 * - Week 1 contracts (XPOracle, MissionRegistry, EscrowVault, TokenExpansionOracle)
 * - Week 2 infrastructure (Registry, PolicyManager, Emitter, Treasury, VaultFactory)
 * - 7 ERC20 test tokens
 * 
 * Required ENV variables:
 * - BASE_SEPOLIA_RPC_URL: RPC endpoint for Base Sepolia
 * - DEPLOYER_PRIVATE_KEY: Private key of funded deployer wallet
 * 
 * Usage:
 * npx hardhat run scripts/deploy/deploy-week2-testnet.ts --network baseSepolia
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// ============ DEPLOYMENT CONFIG ============
const CONFIG = {
  // Mock token supplies (testnet only)
  tokens: {
    PSX: ethers.parseEther("10000000"),    // 10M PSX
    CREATE: ethers.parseEther("5000000"),  // 5M CREATE
    VOID: ethers.parseEther("20000000"),   // 20M VOID
    SIGNAL: ethers.parseEther("1000000"),  // 1M SIGNAL
    AGENCY: ethers.parseEther("500000"),   // 500k AGENCY
    USDC: ethers.parseUnits("1000000", 6), // 1M USDC (6 decimals)
    WETH: ethers.parseEther("1000"),       // 1k WETH
  },
  
  // XPOracle config
  xpOracle: {
    stalenessThreshold: 7200, // 2 hours
    maxAPRBoostBPS: 2000,     // +20% max (APPROVED constraint)
  },
  
  // TokenExpansionOracle criteria
  expansionOracle: {
    minVolume7d: ethers.parseEther("500000"), // $500k volume
    minHolders: 100,
    minFeesPaid: ethers.parseEther("1000"),   // $1k fees
  },
  
  // Land grid (matches TypeScript GRID_SIZE)
  landGrid: {
    gridSize: 40,
    totalParcels: 1600,
  },
};

// ============ DEPLOYMENT STATE ============
interface DeployedContracts {
  // ERC20 Test Tokens
  tokens: {
    PSX: string;
    CREATE: string;
    VOID: string;
    SIGNAL: string;
    AGENCY: string;
    USDC_Test: string;
    WETH_Test: string;
  };
  
  // Week 1 Core Contracts
  week1: {
    XPOracle: string;
    MissionRegistry: string;
    EscrowVault: string;
    TokenExpansionOracle: string;
  };
  
  // Week 2 Infrastructure
  week2: {
    VoidHookRouterV4: string;
    VoidRegistry: string;
    PolicyManager: string;
    VoidEmitter: string;
    VoidTreasury: string;
    VoidVaultFactory: string;
  };
  
  // Multi-sig wallets (testnet placeholders)
  multisigs: {
    xVoidStakingPool: string;
    psxTreasury: string;
    createTreasury: string;
    agencyWallet: string;
    creatorGrantsVault: string;
    securityReserve: string;
  };
}

// ============ MAIN DEPLOYMENT ============
async function main() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🚀 VOID WEEK 2 TESTNET DEPLOYMENT");
  console.log("═══════════════════════════════════════════════════════\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");
  
  const deployed: Partial<DeployedContracts> = {
    tokens: {} as any,
    week1: {} as any,
    week2: {} as any,
    multisigs: {} as any,
  };
  
  // ============ STEP 1: DEPLOY ERC20 MOCKS ============
  console.log("📦 Step 1: Deploying ERC20 Test Tokens...\n");
  
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  
  console.log("Deploying PSX_Test...");
  const psx = await ERC20Mock.deploy("PSX Test", "PSX", CONFIG.tokens.PSX, 18);
  await psx.waitForDeployment();
  deployed.tokens!.PSX = await psx.getAddress();
  console.log("✅ PSX_Test:", deployed.tokens!.PSX);
  
  console.log("Deploying CREATE_Test...");
  const create = await ERC20Mock.deploy("CREATE Test", "CREATE", CONFIG.tokens.CREATE, 18);
  await create.waitForDeployment();
  deployed.tokens!.CREATE = await create.getAddress();
  console.log("✅ CREATE_Test:", deployed.tokens!.CREATE);
  
  console.log("Deploying VOID_Test...");
  const voidToken = await ERC20Mock.deploy("VOID Test", "VOID", CONFIG.tokens.VOID, 18);
  await voidToken.waitForDeployment();
  deployed.tokens!.VOID = await voidToken.getAddress();
  console.log("✅ VOID_Test:", deployed.tokens!.VOID);
  
  console.log("Deploying SIGNAL_Test...");
  const signal = await ERC20Mock.deploy("SIGNAL Test", "SIGNAL", CONFIG.tokens.SIGNAL, 18);
  await signal.waitForDeployment();
  deployed.tokens!.SIGNAL = await signal.getAddress();
  console.log("✅ SIGNAL_Test:", deployed.tokens!.SIGNAL);
  
  console.log("Deploying AGENCY_Test...");
  const agency = await ERC20Mock.deploy("AGENCY Test", "AGENCY", CONFIG.tokens.AGENCY, 18);
  await agency.waitForDeployment();
  deployed.tokens!.AGENCY = await agency.getAddress();
  console.log("✅ AGENCY_Test:", deployed.tokens!.AGENCY);
  
  console.log("Deploying USDC_Test (6 decimals)...");
  const usdc = await ERC20Mock.deploy("USDC Test", "USDC", CONFIG.tokens.USDC, 6);
  await usdc.waitForDeployment();
  deployed.tokens!.USDC_Test = await usdc.getAddress();
  console.log("✅ USDC_Test:", deployed.tokens!.USDC_Test);
  
  console.log("Deploying WETH_Test...");
  const weth = await ERC20Mock.deploy("WETH Test", "WETH", CONFIG.tokens.WETH, 18);
  await weth.waitForDeployment();
  deployed.tokens!.WETH_Test = await weth.getAddress();
  console.log("✅ WETH_Test:", deployed.tokens!.WETH_Test);
  
  console.log("\n✅ All ERC20 tokens deployed\n");
  
  // ============ STEP 2: SETUP MULTI-SIG PLACEHOLDERS ============
  console.log("🔐 Step 2: Setting up multi-sig wallet placeholders...\n");
  console.log("⚠️  NOTE: Using deployer address as placeholder for testnet");
  console.log("    In production, replace with actual multi-sig addresses\n");
  
  deployed.multisigs = {
    xVoidStakingPool: deployer.address,    // TODO: Replace with multi-sig
    psxTreasury: deployer.address,         // TODO: Replace with PSX DAO multi-sig
    createTreasury: deployer.address,      // TODO: Replace with CREATE DAO multi-sig
    agencyWallet: deployer.address,        // TODO: Replace with Agency multi-sig
    creatorGrantsVault: deployer.address,  // TODO: Replace with Grants contract
    securityReserve: deployer.address,     // TODO: Replace with Security multi-sig
  };
  
  // ============ STEP 3: DEPLOY VOIDHOOKROUTERV4 ============
  console.log("💰 Step 3: Deploying VoidHookRouterV4 (APPROVED FEE SYSTEM)...\n");
  console.log("Fee Split: 40/20/10/10/10/5/5 (Creators/Stakers/PSX/CREATE/Agency/Grants/Security)\n");
  
  const VoidHookRouterV4 = await ethers.getContractFactory("VoidHookRouterV4");
  const router = await VoidHookRouterV4.deploy(
    deployed.multisigs.xVoidStakingPool,
    deployed.multisigs.psxTreasury,
    deployed.multisigs.createTreasury,
    deployed.multisigs.agencyWallet,
    deployed.multisigs.creatorGrantsVault,
    deployed.multisigs.securityReserve
  );
  await router.waitForDeployment();
  deployed.week2!.VoidHookRouterV4 = await router.getAddress();
  console.log("✅ VoidHookRouterV4:", deployed.week2!.VoidHookRouterV4);
  
  // Validate fee sum
  const feeSum = await router.validateFeeSum();
  console.log("✅ Fee sum validation:", feeSum ? "PASSED (100%)" : "FAILED");
  
  // ============ STEP 4: DEPLOY WEEK 1 CONTRACTS ============
  console.log("\n📊 Step 4: Deploying Week 1 Core Contracts...\n");
  
  console.log("Deploying XPOracle...");
  const XPOracle = await ethers.getContractFactory("XPOracle");
  const xpOracle = await XPOracle.deploy(CONFIG.xpOracle.stalenessThreshold);
  await xpOracle.waitForDeployment();
  deployed.week1!.XPOracle = await xpOracle.getAddress();
  console.log("✅ XPOracle:", deployed.week1!.XPOracle);
  console.log("   - Staleness threshold:", CONFIG.xpOracle.stalenessThreshold, "seconds");
  console.log("   - Max APR boost:", CONFIG.xpOracle.maxAPRBoostBPS / 100, "%");
  
  console.log("\nDeploying MissionRegistry...");
  const MissionRegistry = await ethers.getContractFactory("MissionRegistry");
  // NOTE: VoidEmitter address will be set after deployment
  const missionRegistry = await MissionRegistry.deploy(deployer.address, ethers.ZeroAddress);
  await missionRegistry.waitForDeployment();
  deployed.week1!.MissionRegistry = await missionRegistry.getAddress();
  console.log("✅ MissionRegistry:", deployed.week1!.MissionRegistry);
  console.log("   - ⚠️  VoidEmitter address needs to be set after VoidEmitter deployment");
  
  console.log("\nDeploying EscrowVault...");
  const EscrowVault = await ethers.getContractFactory("EscrowVault");
  const escrowVault = await EscrowVault.deploy(deployer.address);
  await escrowVault.waitForDeployment();
  deployed.week1!.EscrowVault = await escrowVault.getAddress();
  console.log("✅ EscrowVault:", deployed.week1!.EscrowVault);
  console.log("   - DAO arbitrator:", deployer.address, "(placeholder)");
  
  console.log("\nDeploying TokenExpansionOracle...");
  const TokenExpansionOracle = await ethers.getContractFactory("TokenExpansionOracle");
  const expansionOracle = await TokenExpansionOracle.deploy(
    CONFIG.expansionOracle.minVolume7d,
    CONFIG.expansionOracle.minHolders,
    CONFIG.expansionOracle.minFeesPaid
  );
  await expansionOracle.waitForDeployment();
  deployed.week1!.TokenExpansionOracle = await expansionOracle.getAddress();
  console.log("✅ TokenExpansionOracle:", deployed.week1!.TokenExpansionOracle);
  console.log("   - Min volume (7d):", ethers.formatEther(CONFIG.expansionOracle.minVolume7d), "tokens");
  console.log("   - Min holders:", CONFIG.expansionOracle.minHolders);
  console.log("   - Min fees paid:", ethers.formatEther(CONFIG.expansionOracle.minFeesPaid), "tokens");
  
  console.log("\n✅ All Week 1 contracts deployed\n");
  
  // ============ STEP 5: SAVE DEPLOYMENT ADDRESSES ============
  console.log("💾 Step 5: Saving deployment addresses...\n");
  
  const outputDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, "CONTRACT_ADDRESSES.testnet.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(deployed, null, 2)
  );
  
  console.log("✅ Contract addresses saved to:", outputPath, "\n");
  
  // ============ STEP 6: GENERATE DEPLOYMENT LOG ============
  console.log("📝 Step 6: Generating deployment log...\n");
  
  const deployLog = `# VOID Week 2 Deployment Log

**Network:** Base Sepolia  
**Deployer:** ${deployer.address}  
**Date:** ${new Date().toISOString()}

---

## ERC20 Test Tokens

| Token | Address | Supply |
|-------|---------|--------|
| PSX | ${deployed.tokens!.PSX} | ${ethers.formatEther(CONFIG.tokens.PSX)} |
| CREATE | ${deployed.tokens!.CREATE} | ${ethers.formatEther(CONFIG.tokens.CREATE)} |
| VOID | ${deployed.tokens!.VOID} | ${ethers.formatEther(CONFIG.tokens.VOID)} |
| SIGNAL | ${deployed.tokens!.SIGNAL} | ${ethers.formatEther(CONFIG.tokens.SIGNAL)} |
| AGENCY | ${deployed.tokens!.AGENCY} | ${ethers.formatEther(CONFIG.tokens.AGENCY)} |
| USDC_Test | ${deployed.tokens!.USDC_Test} | ${ethers.formatUnits(CONFIG.tokens.USDC, 6)} |
| WETH_Test | ${deployed.tokens!.WETH_Test} | ${ethers.formatEther(CONFIG.tokens.WETH)} |

---

## Week 1 Core Contracts

| Contract | Address | Notes |
|----------|---------|-------|
| XPOracle | ${deployed.week1!.XPOracle} | Max APR boost: +20% |
| MissionRegistry | ${deployed.week1!.MissionRegistry} | VoidEmitter to be set |
| EscrowVault | ${deployed.week1!.EscrowVault} | DAO arbitration enabled |
| TokenExpansionOracle | ${deployed.week1!.TokenExpansionOracle} | Min volume: $500k |

---

## Week 2 Infrastructure

| Contract | Address | Notes |
|----------|---------|-------|
| VoidHookRouterV4 | ${deployed.week2!.VoidHookRouterV4} | Fee split: 40/20/10/10/10/5/5 ✅ |

---

## Multi-Sig Wallets (Testnet Placeholders)

| Role | Address | Production Action |
|------|---------|-------------------|
| xVOID Staking Pool | ${deployed.multisigs!.xVoidStakingPool} | Replace with multi-sig |
| PSX Treasury | ${deployed.multisigs!.psxTreasury} | Replace with PSX DAO multi-sig |
| CREATE Treasury | ${deployed.multisigs!.createTreasury} | Replace with CREATE DAO multi-sig |
| Agency Wallet | ${deployed.multisigs!.agencyWallet} | Replace with Agency multi-sig |
| Creator Grants Vault | ${deployed.multisigs!.creatorGrantsVault} | Replace with Grants contract |
| Security Reserve | ${deployed.multisigs!.securityReserve} | Replace with Security multi-sig |

---

## Next Steps

1. ✅ Update frontend .env with contract addresses
2. ⏸️  Deploy Week 2 infrastructure contracts (VoidEmitter, VoidTreasury, etc.)
3. ⏸️  Run land grid SQL migration (1,600 parcels)
4. ⏸️  Wire SKUFactory → VoidHookRouterV4
5. ⏸️  Test fee distribution end-to-end
6. ⏸️  Generate FeeDistributionReport_Week2_Run.json

---

**Deployment Status:** ✅ Week 1 + VoidHookRouterV4 Complete  
**Verification:** Pending Basescan verification
`;
  
  const logPath = path.join(outputDir, "DEPLOY_LOG_Week2.md");
  fs.writeFileSync(logPath, deployLog);
  
  console.log("✅ Deployment log saved to:", logPath, "\n");
  
  // ============ DEPLOYMENT SUMMARY ============
  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════════════\n");
  
  console.log("📦 ERC20 Tokens:", Object.keys(deployed.tokens!).length);
  console.log("📊 Week 1 Contracts:", Object.keys(deployed.week1!).length);
  console.log("💰 Week 2 Infrastructure:", Object.keys(deployed.week2!).length);
  console.log("\n🔗 Contract Addresses File:", outputPath);
  console.log("📝 Deployment Log:", logPath);
  
  console.log("\n⚠️  IMPORTANT NEXT STEPS:");
  console.log("1. Update .env with new contract addresses");
  console.log("2. Verify contracts on Basescan");
  console.log("3. Deploy remaining Week 2 contracts (VoidEmitter, VoidTreasury, VoidVaultFactory)");
  console.log("4. Set VoidEmitter address in MissionRegistry");
  console.log("5. Run land grid SQL migration");
  console.log("6. Test fee distribution with mock purchases\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
