/**
 * Ultra-Simple Direct Deployment
 * No compilation needed - uses already compiled artifacts
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

async function deploy() {
  console.log('\n🚀 VOID Deployment to Base Sepolia\n');

  //  Setup
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error('❌ Missing BASE_SEPOLIA_RPC_URL or DEPLOYER_PRIVATE_KEY in .env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('Deployer:', wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH\n');

  // Load compiled artifacts
  const artifactsPath = join(__dirname, '../artifacts/contracts');
  
  const routerPath = join(artifactsPath, 'VoidHookRouterV4.sol/VoidHookRouterV4.json');
  const mockPath = join(artifactsPath, 'mocks/ERC20Mock.sol/ERC20Mock.json');

  if (!existsSync(routerPath) || !existsSync(mockPath)) {
    console.error('❌ Compiled artifacts not found!');
    console.error('  VoidHookRouterV4:', existsSync(routerPath) ? '✅' : '❌');
    console.error('  ERC20Mock:', existsSync(mockPath) ? '✅' : '❌');
    console.error('\nPlease compile contracts first or deploy via Remix IDE');
    process.exit(1);
  }

  const routerArtifact = JSON.parse(readFileSync(routerPath, 'utf-8'));
  const mockArtifact = JSON.parse(readFileSync(mockPath, 'utf-8'));

  // Deploy VOID Test Token
  console.log('Deploying VOID_Test...');
  const MockFactory = new ethers.ContractFactory(
    mockArtifact.abi,
    mockArtifact.bytecode,
    wallet
  );

  const voidToken = await MockFactory.deploy(
    'VOID Test',
    'VOID',
    ethers.parseEther('1000000')
  );
  await voidToken.waitForDeployment();
  const voidAddr = await voidToken.getAddress();
  console.log('✅ VOID_Test:', voidAddr);

  // Deploy VoidHookRouterV4
  console.log('\nDeploying VoidHookRouterV4...');
  const RouterFactory = new ethers.ContractFactory(
    routerArtifact.abi,
    routerArtifact.bytecode,
    wallet
  );

  const router = await RouterFactory.deploy(
    wallet.address,
    wallet.address,
    wallet.address,
    wallet.address,
    wallet.address,
    wallet.address
  );
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log('✅ VoidHookRouterV4:', routerAddr);

  console.log('\n========================================');
  console.log('✅ DEPLOYMENT COMPLETE');
  console.log('========================================');
  console.log('\n📝 Add to .env:');
  console.log(`VOID_TOKEN_ADDRESS=${voidAddr}`);
  console.log(`VOID_HOOK_ROUTER_V4=${routerAddr}`);
  console.log('\n🔍 Verify on Basescan:');
  console.log(`https://sepolia.basescan.org/address/${voidAddr}`);
  console.log(`https://sepolia.basescan.org/address/${routerAddr}\n`);
}

deploy().catch(console.error);
