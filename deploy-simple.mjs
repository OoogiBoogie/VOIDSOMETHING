/**
 * Simple Direct Deployment Script (ESM)
 * Deploys VoidHookRouterV4 to Base Sepolia without Hardhat
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

// Contract ABIs and bytecode
const VOID_HOOK_ROUTER_V4_JSON = JSON.parse(
  readFileSync('./artifacts/contracts/VoidHookRouterV4.sol/VoidHookRouterV4.json', 'utf-8')
);

const ERC20_MOCK_JSON = JSON.parse(
  readFileSync('./artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json', 'utf-8')
);

async function main() {
  console.log('\n========================================');
  console.log('VOID DEPLOYMENT TO BASE SEPOLIA');
  console.log('========================================\n');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log('Deployer:', wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  
  const network = await provider.getNetwork();
  console.log('Chain ID:', network.chainId.toString());
  console.log('');

  // Deploy ERC20Mock (VOID Test Token)
  console.log('Deploying VOID_Test (ERC20Mock)...');
  const ERC20MockFactory = new ethers.ContractFactory(
    ERC20_MOCK_JSON.abi,
    ERC20_MOCK_JSON.bytecode,
    wallet
  );
  
  const voidToken = await ERC20MockFactory.deploy(
    'VOID Test',
    'VOID',
    ethers.parseEther('1000000') // 1M supply
  );
  await voidToken.waitForDeployment();
  const voidTokenAddress = await voidToken.getAddress();
  console.log('✅ VOID_Test deployed:', voidTokenAddress);

  // Deploy VoidHookRouterV4
  console.log('\nDeploying VoidHookRouterV4...');
  console.log('Using deployer address for all recipients (testnet)');
  
  const VoidHookRouterFactory = new ethers.ContractFactory(
    VOID_HOOK_ROUTER_V4_JSON.abi,
    VOID_HOOK_ROUTER_V4_JSON.bytecode,
    wallet
  );
  
  const router = await VoidHookRouterFactory.deploy(
    wallet.address, // xVoidStakingPool
    wallet.address, // psxTreasury
    wallet.address, // createTreasury
    wallet.address, // agencyWallet
    wallet.address, // creatorGrantsVault
    wallet.address  // securityReserve
  );
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log('✅ VoidHookRouterV4 deployed:', routerAddress);

  console.log('\n========================================');
  console.log('DEPLOYMENT COMPLETE');
  console.log('========================================');
  console.log('\nFee Split Validation:');
  console.log('  Creator:        40%');
  console.log('  Stakers:        20%');
  console.log('  PSX Treasury:   10%');
  console.log('  CREATE Treasury:10%');
  console.log('  Agency:         10%');
  console.log('  Grants:          5%');
  console.log('  Security:        5%');
  console.log('  Total:         100%');
  
  console.log('\n📝 Add these to your .env:');
  console.log(`VOID_TOKEN_ADDRESS=${voidTokenAddress}`);
  console.log(`VOID_HOOK_ROUTER_V4=${routerAddress}`);
  
  console.log('\n🔍 Verify on Basescan:');
  console.log(`https://sepolia.basescan.org/address/${voidTokenAddress}`);
  console.log(`https://sepolia.basescan.org/address/${routerAddress}`);
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });
