/**
 * @title Update Environment File with Deployed Contract Addresses
 * @notice Reads deployed_addresses.json and updates .env file
 * 
 * Usage: node scripts/utils/update-env-addresses.js
 */

const fs = require('fs');
const path = require('path');

const DEPLOYED_ADDRESSES_PATH = path.join(__dirname, '../../deployments/baseSepolia/deployed_addresses.json');
const ENV_PATH = path.join(__dirname, '../../.env');

function updateEnvFile() {
  console.log('\n📝 Updating .env with deployed contract addresses...\n');
  
  // Check if deployment file exists
  if (!fs.existsSync(DEPLOYED_ADDRESSES_PATH)) {
    console.error('❌ Error: deployed_addresses.json not found');
    console.error('   Run deployment first: npx hardhat run scripts/deploy/deploy-week2-testnet.ts --network baseSepolia\n');
    process.exit(1);
  }
  
  // Read deployed addresses
  const deployed = JSON.parse(fs.readFileSync(DEPLOYED_ADDRESSES_PATH, 'utf-8'));
  
  // Read current .env (or create if doesn't exist)
  let envContent = '';
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  } else {
    console.log('⚠️  .env not found, creating from .env.example...');
    const examplePath = path.join(__dirname, '../../.env.example');
    if (fs.existsSync(examplePath)) {
      envContent = fs.readFileSync(examplePath, 'utf-8');
    }
  }
  
  // Update or add contract addresses
  const updates = [
    // Week 1 Contracts
    { key: 'NEXT_PUBLIC_XP_ORACLE_ADDRESS', value: deployed.week1.XPOracle },
    { key: 'NEXT_PUBLIC_MISSION_REGISTRY_ADDRESS', value: deployed.week1.MissionRegistry },
    { key: 'NEXT_PUBLIC_ESCROW_VAULT_ADDRESS', value: deployed.week1.EscrowVault },
    { key: 'NEXT_PUBLIC_TOKEN_EXPANSION_ORACLE_ADDRESS', value: deployed.week1.TokenExpansionOracle },
    
    // Week 2 Contracts
    { key: 'NEXT_PUBLIC_VOID_HOOK_ROUTER_V4_ADDRESS', value: deployed.week2.VoidHookRouterV4 },
    { key: 'NEXT_PUBLIC_VOID_REGISTRY_ADDRESS', value: deployed.week2.VoidRegistry },
    { key: 'NEXT_PUBLIC_POLICY_MANAGER_ADDRESS', value: deployed.week2.PolicyManager },
    { key: 'NEXT_PUBLIC_VOID_EMITTER_ADDRESS', value: deployed.week2.VoidEmitter },
    { key: 'NEXT_PUBLIC_VOID_TREASURY_ADDRESS', value: deployed.week2.VoidTreasury },
    { key: 'NEXT_PUBLIC_VOID_VAULT_FACTORY_ADDRESS', value: deployed.week2.VoidVaultFactory },
    { key: 'NEXT_PUBLIC_SKU_FACTORY_ADDRESS', value: deployed.week2.SKUFactory },
    { key: 'NEXT_PUBLIC_LAND_REGISTRY_ADDRESS', value: deployed.week2.LandRegistry },
    
    // Tokens
    { key: 'NEXT_PUBLIC_PSX_TOKEN_ADDRESS', value: deployed.tokens.PSX },
    { key: 'NEXT_PUBLIC_CREATE_TOKEN_ADDRESS', value: deployed.tokens.CREATE },
    { key: 'NEXT_PUBLIC_VOID_TOKEN_ADDRESS', value: deployed.tokens.VOID },
    { key: 'NEXT_PUBLIC_SIGNAL_TOKEN_ADDRESS', value: deployed.tokens.SIGNAL },
    { key: 'NEXT_PUBLIC_AGENCY_TOKEN_ADDRESS', value: deployed.tokens.AGENCY },
    { key: 'NEXT_PUBLIC_USDC_TEST_ADDRESS', value: deployed.tokens.USDC_Test },
    { key: 'NEXT_PUBLIC_WETH_TEST_ADDRESS', value: deployed.tokens.WETH_Test },
    
    // Multi-sigs
    { key: 'NEXT_PUBLIC_XVOID_STAKING_POOL_ADDRESS', value: deployed.multisigs.xVoidStakingPool },
    { key: 'NEXT_PUBLIC_PSX_TREASURY_ADDRESS', value: deployed.multisigs.psxTreasury },
    { key: 'NEXT_PUBLIC_CREATE_TREASURY_ADDRESS', value: deployed.multisigs.createTreasury },
    { key: 'NEXT_PUBLIC_AGENCY_WALLET_ADDRESS', value: deployed.multisigs.agencyWallet },
    { key: 'NEXT_PUBLIC_CREATOR_GRANTS_VAULT_ADDRESS', value: deployed.multisigs.creatorGrantsVault },
    { key: 'NEXT_PUBLIC_SECURITY_RESERVE_ADDRESS', value: deployed.multisigs.securityReserve },
  ];
  
  let updatedCount = 0;
  let addedCount = 0;
  
  updates.forEach(({ key, value }) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(envContent)) {
      // Update existing line
      envContent = envContent.replace(regex, `${key}=${value}`);
      updatedCount++;
    } else {
      // Add new line
      envContent += `\n${key}=${value}`;
      addedCount++;
    }
  });
  
  // Write updated .env
  fs.writeFileSync(ENV_PATH, envContent);
  
  console.log(`✅ Updated ${updatedCount} existing addresses`);
  console.log(`✅ Added ${addedCount} new addresses`);
  console.log(`\n📄 .env file updated successfully\n`);
  
  // Display summary
  console.log('Contract Address Summary:');
  console.log('─────────────────────────────────────────────────');
  console.log(`Network: ${deployed.network}`);
  console.log(`Chain ID: ${deployed.chainId}`);
  console.log(`Deployer: ${deployed.deployer}`);
  console.log(`Deployed At: ${deployed.deployedAt}`);
  console.log('─────────────────────────────────────────────────\n');
  
  console.log('Week 1 Contracts:');
  Object.entries(deployed.week1).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });
  
  console.log('\nWeek 2 Contracts:');
  Object.entries(deployed.week2).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });
  
  console.log('\nTest Tokens:');
  Object.entries(deployed.tokens).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });
  
  console.log('\n✅ Ready for HUD integration\n');
}

// Run
updateEnvFile();
