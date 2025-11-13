/**
 * @title Contract Verification Script
 * @notice Verifies deployed contracts on Base Sepolia and generates VERIFIED_ADDRESSES.json
 * 
 * Week 3 Track 1: Contract Verification
 * 
 * Verifies:
 * - All Week 1 contracts (XPOracle, MissionRegistry, EscrowVault, TokenExpansionOracle)
 * - All Week 2 contracts (VoidHookRouterV4, VoidRegistry, PolicyManager, etc.)
 * - All ERC20 test tokens
 * 
 * Usage:
 * npx hardhat run scripts/verify/verify-contracts.ts --network baseSepolia
 */

import { ethers, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// ============ TYPES ============
interface DeployedAddresses {
  network: string;
  chainId: number;
  deployedAt: number;
  deployer: string;
  tokens: {
    PSX: string;
    CREATE: string;
    VOID: string;
    SIGNAL: string;
    AGENCY: string;
    USDC_Test: string;
    WETH_Test: string;
  };
  week1: {
    XPOracle: string;
    MissionRegistry: string;
    EscrowVault: string;
    TokenExpansionOracle: string;
  };
  week2: {
    VoidHookRouterV4: string;
    VoidRegistry: string;
    PolicyManager: string;
    VoidEmitter: string;
    VoidTreasury: string;
    VoidVaultFactory: string;
  };
  multisigs: {
    xVoidStakingPool: string;
    psxTreasury: string;
    createTreasury: string;
    agencyWallet: string;
    creatorGrantsVault: string;
    securityReserve: string;
  };
}

interface VerificationResult {
  contract: string;
  address: string;
  verified: boolean;
  explorerUrl: string;
  error?: string;
  timestamp: number;
}

// ============ MAIN VERIFICATION ============
async function main() {
  console.log("🔍 VOID CONTRACT VERIFICATION (Week 3)\n");
  console.log("=" . repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log(`Network: ${network.name} (chainId: ${network.chainId})`);
  console.log(`Verifier: ${deployer.address}\n`);
  
  // ============ STEP 1: LOAD DEPLOYMENT ADDRESSES ============
  console.log("📋 Step 1: Loading deployment addresses...\n");
  
  const deploymentPath = path.join(
    __dirname,
    "..",
    "..",
    "deployments",
    "baseSepolia",
    "deployed_addresses.json"
  );
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ ERROR: No deployment file found at:", deploymentPath);
    console.error("\n⚠️  Contracts must be deployed before verification.");
    console.error("   Run: npx hardhat run scripts/deploy/deploy-week2-testnet.ts --network baseSepolia\n");
    process.exit(1);
  }
  
  const deployedAddresses: DeployedAddresses = JSON.parse(
    fs.readFileSync(deploymentPath, "utf-8")
  );
  
  console.log("✅ Loaded deployment addresses from:", deploymentPath);
  console.log(`   Deployed at: ${new Date(deployedAddresses.deployedAt * 1000).toISOString()}\n`);
  
  // ============ STEP 2: VERIFY ALL CONTRACTS ============
  console.log("🔐 Step 2: Verifying contracts on Basescan...\n");
  
  const verificationResults: VerificationResult[] = [];
  const explorerUrl = "https://sepolia.basescan.org";
  
  // Helper function to verify a contract
  async function verifyContract(
    name: string,
    address: string,
    constructorArgs: any[] = []
  ): Promise<VerificationResult> {
    console.log(`Verifying ${name}...`);
    
    try {
      await run("verify:verify", {
        address,
        constructorArguments: constructorArgs,
      });
      
      console.log(`✅ ${name} verified: ${explorerUrl}/address/${address}#code\n`);
      
      return {
        contract: name,
        address,
        verified: true,
        explorerUrl: `${explorerUrl}/address/${address}#code`,
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch (error: any) {
      if (error.message.includes("already verified")) {
        console.log(`✅ ${name} already verified: ${explorerUrl}/address/${address}#code\n`);
        return {
          contract: name,
          address,
          verified: true,
          explorerUrl: `${explorerUrl}/address/${address}#code`,
          timestamp: Math.floor(Date.now() / 1000),
        };
      } else {
        console.error(`❌ ${name} verification failed:`, error.message, "\n");
        return {
          contract: name,
          address,
          verified: false,
          explorerUrl: `${explorerUrl}/address/${address}`,
          error: error.message,
          timestamp: Math.floor(Date.now() / 1000),
        };
      }
    }
  }
  
  // ============ VERIFY ERC20 TOKENS ============
  console.log("🪙 Verifying ERC20 test tokens...\n");
  
  verificationResults.push(
    await verifyContract("PSX", deployedAddresses.tokens.PSX, [
      "PSX Token",
      "PSX",
      ethers.parseEther("10000000"),
      deployer.address,
    ])
  );
  
  verificationResults.push(
    await verifyContract("CREATE", deployedAddresses.tokens.CREATE, [
      "CREATE Token",
      "CREATE",
      ethers.parseEther("5000000"),
      deployer.address,
    ])
  );
  
  verificationResults.push(
    await verifyContract("VOID", deployedAddresses.tokens.VOID, [
      "VOID Token",
      "VOID",
      ethers.parseEther("20000000"),
      deployer.address,
    ])
  );
  
  verificationResults.push(
    await verifyContract("SIGNAL", deployedAddresses.tokens.SIGNAL, [
      "SIGNAL Token",
      "SIGNAL",
      ethers.parseEther("1000000"),
      deployer.address,
    ])
  );
  
  verificationResults.push(
    await verifyContract("AGENCY", deployedAddresses.tokens.AGENCY, [
      "AGENCY Token",
      "AGENCY",
      ethers.parseEther("500000"),
      deployer.address,
    ])
  );
  
  verificationResults.push(
    await verifyContract("USDC_Test", deployedAddresses.tokens.USDC_Test, [
      "Test USDC",
      "USDC",
      ethers.parseUnits("1000000", 6),
      deployer.address,
      6,
    ])
  );
  
  verificationResults.push(
    await verifyContract("WETH_Test", deployedAddresses.tokens.WETH_Test, [
      "Test WETH",
      "WETH",
      ethers.parseEther("1000"),
      deployer.address,
    ])
  );
  
  // ============ VERIFY WEEK 1 CONTRACTS ============
  console.log("🏗️  Verifying Week 1 core contracts...\n");
  
  verificationResults.push(
    await verifyContract("XPOracle", deployedAddresses.week1.XPOracle, [
      7200,  // stalenessThreshold
      2000,  // maxAPRBoostBPS (+20%)
    ])
  );
  
  verificationResults.push(
    await verifyContract("MissionRegistry", deployedAddresses.week1.MissionRegistry, [
      deployer.address, // voidEmitter placeholder (will be updated)
    ])
  );
  
  verificationResults.push(
    await verifyContract("EscrowVault", deployedAddresses.week1.EscrowVault, [])
  );
  
  verificationResults.push(
    await verifyContract("TokenExpansionOracle", deployedAddresses.week1.TokenExpansionOracle, [
      ethers.parseEther("500000"), // minVolume7d
      100,                          // minHolders
      ethers.parseEther("1000"),   // minFeesPaid
    ])
  );
  
  // ============ VERIFY WEEK 2 CONTRACTS ============
  console.log("💰 Verifying Week 2 infrastructure contracts...\n");
  
  verificationResults.push(
    await verifyContract("VoidHookRouterV4", deployedAddresses.week2.VoidHookRouterV4, [
      deployedAddresses.multisigs.xVoidStakingPool,
      deployedAddresses.multisigs.psxTreasury,
      deployedAddresses.multisigs.createTreasury,
      deployedAddresses.multisigs.agencyWallet,
      deployedAddresses.multisigs.creatorGrantsVault,
      deployedAddresses.multisigs.securityReserve,
    ])
  );
  
  verificationResults.push(
    await verifyContract("VoidRegistry", deployedAddresses.week2.VoidRegistry, [])
  );
  
  verificationResults.push(
    await verifyContract("PolicyManager", deployedAddresses.week2.PolicyManager, [])
  );
  
  verificationResults.push(
    await verifyContract("VoidEmitter", deployedAddresses.week2.VoidEmitter, [
      deployedAddresses.week2.VoidTreasury,
      deployedAddresses.week1.XPOracle,
    ])
  );
  
  verificationResults.push(
    await verifyContract("VoidTreasury", deployedAddresses.week2.VoidTreasury, [])
  );
  
  verificationResults.push(
    await verifyContract("VoidVaultFactory", deployedAddresses.week2.VoidVaultFactory, [])
  );
  
  // ============ STEP 3: GENERATE VERIFICATION REPORT ============
  console.log("=" . repeat(60));
  console.log("📊 Generating verification report...\n");
  
  const report = {
    network: network.name,
    chainId: Number(network.chainId),
    verifiedAt: Math.floor(Date.now() / 1000),
    verifier: deployer.address,
    explorerBaseUrl: explorerUrl,
    results: verificationResults,
    summary: {
      totalContracts: verificationResults.length,
      verified: verificationResults.filter(r => r.verified).length,
      failed: verificationResults.filter(r => !r.verified).length,
      successRate: (verificationResults.filter(r => r.verified).length / verificationResults.length * 100).toFixed(2) + "%",
    },
  };
  
  // ============ STEP 4: SAVE VERIFIED ADDRESSES ============
  const outputDir = path.join(__dirname, "..", "..", "deployments", "baseSepolia");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, "VERIFIED_ADDRESSES.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log("✅ Verification report saved to:", outputPath, "\n");
  
  // ============ FINAL SUMMARY ============
  console.log("=" . repeat(60));
  console.log("📋 VERIFICATION SUMMARY\n");
  console.log(`Total Contracts: ${report.summary.totalContracts}`);
  console.log(`✅ Verified: ${report.summary.verified}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`Success Rate: ${report.summary.successRate}\n`);
  
  console.log("🔗 Verified Contract URLs:\n");
  verificationResults
    .filter(r => r.verified)
    .forEach(r => {
      console.log(`   ${r.contract}: ${r.explorerUrl}`);
    });
  
  if (report.summary.failed > 0) {
    console.log("\n⚠️  Failed Verifications:\n");
    verificationResults
      .filter(r => !r.verified)
      .forEach(r => {
        console.log(`   ${r.contract} (${r.address})`);
        console.log(`      Error: ${r.error}\n`);
      });
  }
  
  console.log("\n" + "=" . repeat(60));
  console.log("🎯 Next Steps:\n");
  console.log("1. Review verification report: deployments/baseSepolia/VERIFIED_ADDRESSES.json");
  console.log("2. Update frontend .env.local with verified addresses");
  console.log("3. Run fee distribution validation:");
  console.log("   npx hardhat run scripts/validate/test-fee-distribution.ts --network baseSepolia");
  console.log("4. Generate treasury snapshot:");
  console.log("   npx ts-node server/ai/EmissionAI.ts --snapshot\n");
  
  if (report.summary.verified === report.summary.totalContracts) {
    console.log("🎉 All contracts successfully verified! ✅\n");
  } else {
    console.log("⚠️  Some contracts failed verification - review errors above\n");
    process.exit(1);
  }
}

// ============ EXECUTE ============
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
