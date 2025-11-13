/**
 * @title VOID Deployment Orchestrator
 * @notice Automated deployment validation and execution coordinator
 * @dev Orchestrates Week 4 → Phase 2 deployment pipeline
 * 
 * Usage:
 *   node scripts/orchestrator/deployment-orchestrator.js check      # Pre-flight validation
 *   node scripts/orchestrator/deployment-orchestrator.js deploy     # Execute deployment
 *   node scripts/orchestrator/deployment-orchestrator.js validate   # Post-deployment validation
 *   node scripts/orchestrator/deployment-orchestrator.js phase2     # Phase 2 readiness check
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Environment validation
  requiredEnvVars: [
    'BASE_SEPOLIA_RPC_URL',
    'DEPLOYER_PRIVATE_KEY',
    'BASESCAN_API_KEY',
    'DATABASE_URL'
  ],
  
  // Deployment parameters
  minWalletBalance: '0.05', // ETH (reduced for testnet)
  expectedContractCount: 25,
  
  // Validation thresholds
  telemetryUptimeThreshold: 95, // %
  systemResponseTimeMax: 500, // ms
  expectedParcelCount: 1600,
  
  // Economic validation
  treasurySurplusMin: 10000, // USD/week
  feeDistribution: {
    creator: 40,
    xVoidStakers: 20,
    psxTreasury: 10,
    createTreasury: 10,
    agencyWallet: 10,
    creatorGrants: 5,
    securityReserve: 5
  },
  
  // Paths
  paths: {
    deployments: 'deployments/baseSepolia',
    logs: 'logs',
    scripts: 'scripts',
    contracts: 'contracts'
  }
};

// ============================================================================
// UTILITIES
// ============================================================================

class Logger {
  static info(msg) {
    console.log(`ℹ️  ${msg}`);
  }
  
  static success(msg) {
    console.log(`✅ ${msg}`);
  }
  
  static warn(msg) {
    console.log(`⚠️  ${msg}`);
  }
  
  static error(msg) {
    console.log(`❌ ${msg}`);
  }
  
  static section(title) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${title.toUpperCase()}`);
    console.log(`${'═'.repeat(60)}\n`);
  }
}

function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function readJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch (error) {
    return null;
  }
}

function writeJSON(filepath, data) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// ============================================================================
// VALIDATION CHECKS
// ============================================================================

class ValidationChecks {
  /**
   * Check 1: Environment variables
   */
  static checkEnvironment() {
    Logger.section('1. Environment Setup Validation');
    
    const missing = [];
    const present = [];
    
    CONFIG.requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        present.push(varName);
        Logger.success(`${varName}: Present`);
      } else {
        missing.push(varName);
        Logger.error(`${varName}: Missing`);
      }
    });
    
    if (missing.length > 0) {
      Logger.error(`Missing ${missing.length} required environment variable(s)`);
      Logger.info('Create .env file with: cp .env.example .env');
      return { passed: false, missing };
    }
    
    Logger.success('All environment variables present');
    return { passed: true, present };
  }
  
  /**
   * Check 2: RPC connectivity
   */
  static async checkRPCConnection() {
    Logger.section('2. RPC Connection Test');
    
    try {
      const testScript = `
        const { ethers } = require('ethers');
        const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
        provider.getNetwork().then(network => {
          console.log(JSON.stringify({ 
            name: network.name, 
            chainId: network.chainId.toString() 
          }));
        }).catch(err => {
          console.error('RPC_ERROR:', err.message);
          process.exit(1);
        });
      `;
      
      const result = runCommand(`node -e "${testScript.replace(/\n/g, ' ')}"`, { silent: true });
      
      if (result.success) {
        const network = JSON.parse(result.output.trim());
        Logger.success(`Connected to ${network.name} (Chain ID: ${network.chainId})`);
        
        if (network.chainId !== '84532') {
          Logger.warn('Chain ID is not 84532 (Base Sepolia). Verify RPC URL.');
        }
        
        return { passed: true, network };
      } else {
        Logger.error('Failed to connect to RPC');
        Logger.info('Check BASE_SEPOLIA_RPC_URL in .env file');
        return { passed: false, error: result.error };
      }
    } catch (error) {
      Logger.error(`RPC connection error: ${error.message}`);
      return { passed: false, error: error.message };
    }
  }
  
  /**
   * Check 3: Wallet balance
   */
  static async checkWalletBalance() {
    Logger.section('3. Deployer Wallet Balance');
    
    try {
      const testScript = `
        const { ethers } = require('ethers');
        const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        Promise.all([
          wallet.address,
          provider.getBalance(wallet.address)
        ]).then(([address, balance]) => {
          console.log(JSON.stringify({
            address,
            balance: ethers.formatEther(balance)
          }));
        }).catch(err => {
          console.error('WALLET_ERROR:', err.message);
          process.exit(1);
        });
      `;
      
      const result = runCommand(`node -e "${testScript.replace(/\n/g, ' ')}"`, { silent: true });
      
      if (result.success) {
        const wallet = JSON.parse(result.output.trim());
        Logger.info(`Address: ${wallet.address}`);
        Logger.info(`Balance: ${wallet.balance} ETH`);
        
        const balance = parseFloat(wallet.balance);
        const minBalance = parseFloat(CONFIG.minWalletBalance);
        
        if (balance >= minBalance) {
          Logger.success(`Wallet has sufficient balance (≥${minBalance} ETH)`);
          return { passed: true, wallet };
        } else {
          Logger.error(`Insufficient balance. Need ≥${minBalance} ETH, have ${balance} ETH`);
          Logger.info('Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
          return { passed: false, wallet, reason: 'insufficient_balance' };
        }
      } else {
        Logger.error('Failed to check wallet balance');
        Logger.info('Verify DEPLOYER_PRIVATE_KEY in .env (NO 0x prefix)');
        return { passed: false, error: result.error };
      }
    } catch (error) {
      Logger.error(`Wallet check error: ${error.message}`);
      return { passed: false, error: error.message };
    }
  }
  
  /**
   * Check 4: Database connection
   */
  static checkDatabaseConnection() {
    Logger.section('4. Database Connection Test');
    
    try {
      const result = runCommand(
        `psql "${process.env.DATABASE_URL}" -c "SELECT version();"`,
        { silent: true }
      );
      
      if (result.success) {
        Logger.success('Database connection successful');
        return { passed: true };
      } else {
        Logger.error('Database connection failed');
        Logger.info('Verify DATABASE_URL in .env file');
        return { passed: false, error: result.error };
      }
    } catch (error) {
      Logger.warn('Database connection check skipped (psql not found or connection failed)');
      Logger.info('You can manually test with: psql $DATABASE_URL -c "SELECT version();"');
      return { passed: true, skipped: true }; // Non-critical for initial checks
    }
  }
  
  /**
   * Check 5: Hardhat installation
   */
  static checkHardhatInstalled() {
    Logger.section('5. Hardhat Installation Check');
    
    const result = runCommand('npx hardhat --version', { silent: true });
    
    if (result.success) {
      const version = result.output.trim();
      Logger.success(`Hardhat installed: ${version}`);
      return { passed: true, version };
    } else {
      Logger.error('Hardhat not installed');
      Logger.info('Install with: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox');
      return { passed: false };
    }
  }
  
  /**
   * Check 6: Contract deployment status
   */
  static checkContractsDeployed() {
    Logger.section('6. Contract Deployment Status');
    
    const deploymentFile = path.join(CONFIG.paths.deployments, 'deployed_addresses.json');
    
    if (!fileExists(deploymentFile)) {
      Logger.warn('No deployment found');
      Logger.info('Contracts not yet deployed to Base Sepolia');
      return { passed: false, deployed: false };
    }
    
    const deployment = readJSON(deploymentFile);
    
    if (!deployment) {
      Logger.error('Deployment file exists but is invalid JSON');
      return { passed: false, error: 'invalid_json' };
    }
    
    // Count deployed contracts
    let contractCount = 0;
    const contracts = {};
    
    ['tokens', 'week1', 'week2', 'multisigs'].forEach(category => {
      if (deployment[category]) {
        Object.keys(deployment[category]).forEach(name => {
          contractCount++;
          contracts[name] = deployment[category][name];
        });
      }
    });
    
    Logger.info(`Found ${contractCount} deployed contracts`);
    
    if (contractCount >= CONFIG.expectedContractCount) {
      Logger.success(`All ${CONFIG.expectedContractCount} contracts deployed`);
      return { passed: true, deployed: true, contractCount, contracts };
    } else {
      Logger.warn(`Only ${contractCount}/${CONFIG.expectedContractCount} contracts deployed`);
      return { passed: false, deployed: true, contractCount, contracts };
    }
  }
  
  /**
   * Check 7: AI Telemetry status
   */
  static checkAITelemetry() {
    Logger.section('7. AI Telemetry Status');
    
    const telemetryFile = path.join(CONFIG.paths.logs, 'ai/telemetry/aggregated_telemetry.json');
    
    if (!fileExists(telemetryFile)) {
      Logger.warn('AI telemetry not running');
      Logger.info('Start with: node scripts/ai-telemetry.js daemon');
      return { passed: false, running: false };
    }
    
    const telemetry = readJSON(telemetryFile);
    
    if (!telemetry) {
      Logger.error('Telemetry file exists but is invalid JSON');
      return { passed: false, error: 'invalid_json' };
    }
    
    // Check staleness
    const now = Date.now();
    const age = now - telemetry.timestamp;
    const ageSeconds = Math.floor(age / 1000);
    
    Logger.info(`Last update: ${ageSeconds}s ago`);
    Logger.info(`Cycle count: ${telemetry.cycleCount}`);
    Logger.info(`System health: ${telemetry.systemHealth}`);
    
    if (ageSeconds < 120) {
      Logger.success('AI telemetry is actively running');
      
      // Check uptime if available
      if (telemetry.cycleCount >= 1440) { // 24 hours
        const uptime = ((telemetry.cycleCount - telemetry.errors.length) / telemetry.cycleCount) * 100;
        Logger.info(`24h uptime: ${uptime.toFixed(2)}%`);
        
        if (uptime >= CONFIG.telemetryUptimeThreshold) {
          Logger.success(`Uptime meets threshold (≥${CONFIG.telemetryUptimeThreshold}%)`);
        } else {
          Logger.warn(`Uptime below threshold (<${CONFIG.telemetryUptimeThreshold}%)`);
        }
      }
      
      return { passed: true, running: true, telemetry };
    } else {
      Logger.warn(`Telemetry stale (${ageSeconds}s old, max 120s)`);
      Logger.info('Restart daemon: pm2 restart void-telemetry');
      return { passed: false, running: false, stale: true };
    }
  }
  
  /**
   * Check 8: Land grid status
   */
  static checkLandGrid() {
    Logger.section('8. Land Grid Status');
    
    try {
      const result = runCommand(
        `psql "${process.env.DATABASE_URL}" -t -c "SELECT COUNT(*) FROM land_parcels;"`,
        { silent: true }
      );
      
      if (result.success) {
        const count = parseInt(result.output.trim());
        Logger.info(`Land parcels: ${count}`);
        
        if (count === CONFIG.expectedParcelCount) {
          Logger.success(`Land grid complete (${CONFIG.expectedParcelCount} parcels)`);
          return { passed: true, parcelCount: count };
        } else if (count === 0) {
          Logger.warn('Land grid not migrated');
          Logger.info('Run: psql $DATABASE_URL -f migrations/001_land_grid_setup.sql');
          return { passed: false, parcelCount: 0 };
        } else {
          Logger.warn(`Unexpected parcel count (expected ${CONFIG.expectedParcelCount}, got ${count})`);
          return { passed: false, parcelCount: count };
        }
      } else {
        Logger.warn('Could not check land grid (table may not exist)');
        return { passed: false, error: result.error };
      }
    } catch (error) {
      Logger.warn('Land grid check skipped (database connection failed)');
      return { passed: true, skipped: true };
    }
  }
  
  /**
   * Check 9: Cosmetics lock status
   */
  static checkCosmeticsLock() {
    Logger.section('9. Cosmetics Lock Status');
    
    // Check if CosmeticContext exists
    const contextFile = 'contexts/CosmeticContext.tsx';
    
    if (!fileExists(contextFile)) {
      Logger.warn('CosmeticContext not yet created');
      Logger.info('Will be created in Phase 2 Day 1');
      return { passed: true, exists: false };
    }
    
    // Read context file and check for isLocked
    const content = fs.readFileSync(contextFile, 'utf-8');
    
    if (content.includes('isLocked') && content.includes('true')) {
      Logger.success('CosmeticContext exists and cosmetics are LOCKED');
      return { passed: true, exists: true, locked: true };
    } else if (content.includes('isLocked') && content.includes('false')) {
      Logger.error('CosmeticContext exists but cosmetics are UNLOCKED');
      Logger.warn('Phase 2 should not be unlocked yet!');
      return { passed: false, exists: true, locked: false };
    } else {
      Logger.warn('CosmeticContext exists but lock status unclear');
      return { passed: false, exists: true, locked: null };
    }
  }
}

// ============================================================================
// DEPLOYMENT ORCHESTRATOR
// ============================================================================

class DeploymentOrchestrator {
  /**
   * Run pre-flight validation checks
   */
  static async runPreFlightChecks() {
    Logger.section('DEPLOYMENT READINESS PRE-FLIGHT');
    
    const results = {
      timestamp: new Date().toISOString(),
      checks: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };
    
    // Run all checks
    const checks = [
      { name: 'environment', fn: () => ValidationChecks.checkEnvironment() },
      { name: 'rpc', fn: () => ValidationChecks.checkRPCConnection() },
      { name: 'wallet', fn: () => ValidationChecks.checkWalletBalance() },
      { name: 'database', fn: () => ValidationChecks.checkDatabaseConnection() },
      { name: 'hardhat', fn: () => ValidationChecks.checkHardhatInstalled() },
      { name: 'contracts', fn: () => ValidationChecks.checkContractsDeployed() },
      { name: 'telemetry', fn: () => ValidationChecks.checkAITelemetry() },
      { name: 'landGrid', fn: () => ValidationChecks.checkLandGrid() },
      { name: 'cosmeticsLock', fn: () => ValidationChecks.checkCosmeticsLock() }
    ];
    
    for (const check of checks) {
      const result = await check.fn();
      results.checks[check.name] = result;
      results.summary.total++;
      
      if (result.passed) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
    }
    
    // Generate summary
    Logger.section('Validation Summary');
    Logger.info(`Checks passed: ${results.summary.passed}/${results.summary.total}`);
    Logger.info(`Checks failed: ${results.summary.failed}/${results.summary.total}`);
    
    // Determine readiness
    const criticalChecks = ['environment', 'rpc', 'wallet', 'hardhat'];
    const criticalFailed = criticalChecks.filter(name => !results.checks[name].passed);
    
    if (criticalFailed.length === 0) {
      Logger.success('✅ READY FOR DEPLOYMENT');
      Logger.info('Run: node scripts/orchestrator/deployment-orchestrator.js deploy');
      results.ready = true;
    } else {
      Logger.error('⏸️  NOT READY FOR DEPLOYMENT');
      Logger.info(`Fix these critical issues: ${criticalFailed.join(', ')}`);
      results.ready = false;
    }
    
    // Save results
    const reportFile = path.join(CONFIG.paths.logs, 'deployment/pre-flight-check.json');
    writeJSON(reportFile, results);
    Logger.info(`Full report saved: ${reportFile}`);
    
    return results;
  }
  
  /**
   * Execute deployment
   */
  static async executeDeploy() {
    Logger.section('EXECUTING WEEK 4 DEPLOYMENT');
    
    // Pre-flight check
    Logger.info('Running pre-flight validation...');
    const preFlightResults = await this.runPreFlightChecks();
    
    if (!preFlightResults.ready) {
      Logger.error('Pre-flight checks failed. Aborting deployment.');
      process.exit(1);
    }
    
    Logger.success('Pre-flight checks passed. Proceeding with deployment...\n');
    
    // Step 1: Deploy contracts
    Logger.section('Step 1: Deploying Contracts');
    Logger.info('This will take ~5 minutes...');
    
    const deployResult = runCommand(
      'npx hardhat run scripts/deploy/deploy-week2-testnet.ts --network baseSepolia'
    );
    
    if (!deployResult.success) {
      Logger.error('Contract deployment failed');
      return { success: false, step: 'deploy', error: deployResult.error };
    }
    
    Logger.success('Contracts deployed successfully\n');
    
    // Step 2: Verify contracts
    Logger.section('Step 2: Verifying Contracts on Basescan');
    Logger.info('This will take ~3 minutes...');
    
    const verifyResult = runCommand(
      'npx hardhat run scripts/verify/verify-contracts.ts --network baseSepolia'
    );
    
    if (!verifyResult.success) {
      Logger.warn('Contract verification had issues (non-critical)');
    } else {
      Logger.success('Contracts verified on Basescan\n');
    }
    
    // Step 3: Update .env
    Logger.section('Step 3: Updating Environment Variables');
    
    const updateEnvResult = runCommand('node scripts/utils/update-env-addresses.js');
    
    if (!updateEnvResult.success) {
      Logger.error('Failed to update .env file');
      return { success: false, step: 'update-env', error: updateEnvResult.error };
    }
    
    Logger.success('.env file updated with contract addresses\n');
    
    // Step 4: Validate fee distribution
    Logger.section('Step 4: Validating Fee Distribution');
    
    const feeValidationResult = runCommand(
      'npx hardhat run scripts/validate/test-fee-distribution.ts --network baseSepolia'
    );
    
    if (!feeValidationResult.success) {
      Logger.error('Fee distribution validation failed');
      return { success: false, step: 'fee-validation', error: feeValidationResult.error };
    }
    
    Logger.success('Fee distribution validated (40/20/10/10/10/5/5)\n');
    
    // Success
    Logger.section('✅ DEPLOYMENT COMPLETE');
    Logger.success('All contracts deployed and verified');
    Logger.info('\nNext steps:');
    Logger.info('1. Start AI telemetry: node scripts/ai-telemetry.js daemon');
    Logger.info('2. Migrate land grid: psql $DATABASE_URL -f migrations/001_land_grid_setup.sql');
    Logger.info('3. Run validation: node scripts/orchestrator/deployment-orchestrator.js validate');
    
    return { success: true };
  }
  
  /**
   * Run post-deployment validation
   */
  static async validateDeployment() {
    Logger.section('POST-DEPLOYMENT VALIDATION');
    
    const results = {
      timestamp: new Date().toISOString(),
      phase: 'post-deployment',
      checks: {},
      ready: false
    };
    
    // Check contracts deployed
    const contractsCheck = ValidationChecks.checkContractsDeployed();
    results.checks.contracts = contractsCheck;
    
    if (!contractsCheck.passed) {
      Logger.error('Contracts not fully deployed');
      return results;
    }
    
    // Check telemetry
    const telemetryCheck = ValidationChecks.checkAITelemetry();
    results.checks.telemetry = telemetryCheck;
    
    // Check land grid
    const landGridCheck = ValidationChecks.checkLandGrid();
    results.checks.landGrid = landGridCheck;
    
    // Check cosmetics lock
    const cosmeticsCheck = ValidationChecks.checkCosmeticsLock();
    results.checks.cosmetics = cosmeticsCheck;
    
    // Summary
    const allPassed = Object.values(results.checks).every(c => c.passed);
    results.ready = allPassed;
    
    if (allPassed) {
      Logger.success('✅ PHASE 1 COMPLETE - READY FOR PHASE 2');
      Logger.info('Review: PHASE_2_COSMETICS_UNLOCK_GUIDE.md');
    } else {
      Logger.warn('⏸️  PHASE 1 INCOMPLETE');
      Logger.info('Complete remaining steps from WEEK_4_DEPLOYMENT_GUIDE.md');
    }
    
    // Save results
    const reportFile = path.join(CONFIG.paths.logs, 'deployment/post-deployment-validation.json');
    writeJSON(reportFile, results);
    
    return results;
  }
  
  /**
   * Check Phase 2 readiness
   */
  static async checkPhase2Readiness() {
    Logger.section('PHASE 2 READINESS CHECK');
    
    const results = {
      timestamp: new Date().toISOString(),
      phase: 'phase2-pre-unlock',
      checks: {},
      ready: false
    };
    
    // 1. Check 24h telemetry uptime
    Logger.info('Checking AI telemetry 24h uptime...');
    const telemetryCheck = ValidationChecks.checkAITelemetry();
    results.checks.telemetry = telemetryCheck;
    
    if (telemetryCheck.passed && telemetryCheck.telemetry) {
      const cycleCount = telemetryCheck.telemetry.cycleCount;
      const errors = telemetryCheck.telemetry.errors?.length || 0;
      
      if (cycleCount >= 1440) { // 24 hours
        const uptime = ((cycleCount - errors) / cycleCount) * 100;
        Logger.info(`24h uptime: ${uptime.toFixed(2)}%`);
        
        if (uptime >= CONFIG.telemetryUptimeThreshold) {
          Logger.success(`Telemetry uptime ≥${CONFIG.telemetryUptimeThreshold}% ✅`);
        } else {
          Logger.error(`Telemetry uptime <${CONFIG.telemetryUptimeThreshold}% ❌`);
          results.checks.telemetry.passed = false;
        }
      } else {
        Logger.warn(`Telemetry only running ${cycleCount} minutes (need 1440 for 24h)`);
        results.checks.telemetry.passed = false;
      }
    }
    
    // 2. Check contracts responding
    Logger.info('Checking contract health...');
    const contractsCheck = ValidationChecks.checkContractsDeployed();
    results.checks.contracts = contractsCheck;
    
    // 3. Check cosmetics locked
    Logger.info('Checking cosmetics lock status...');
    const cosmeticsCheck = ValidationChecks.checkCosmeticsLock();
    results.checks.cosmetics = cosmeticsCheck;
    
    // Summary
    const allPassed = Object.values(results.checks).every(c => c.passed);
    results.ready = allPassed;
    
    if (allPassed) {
      Logger.success('✅ READY FOR PHASE 2 COSMETICS UNLOCK');
      Logger.info('Proceed with: PHASE_2_COSMETICS_UNLOCK_GUIDE.md → Day 1');
    } else {
      Logger.warn('⏸️  NOT READY FOR PHASE 2');
      Logger.info('Address failed checks before unlocking cosmetics');
    }
    
    // Save results
    const reportFile = path.join(CONFIG.paths.logs, 'deployment/phase2-readiness-check.json');
    writeJSON(reportFile, results);
    
    return results;
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
    case 'preflight':
      await DeploymentOrchestrator.runPreFlightChecks();
      break;
      
    case 'deploy':
      await DeploymentOrchestrator.executeDeploy();
      break;
      
    case 'validate':
    case 'postdeploy':
      await DeploymentOrchestrator.validateDeployment();
      break;
      
    case 'phase2':
      await DeploymentOrchestrator.checkPhase2Readiness();
      break;
      
    default:
      console.log(`
VOID Deployment Orchestrator
═══════════════════════════════════════════════════════════

Usage:
  node scripts/orchestrator/deployment-orchestrator.js <command>

Commands:
  check      Pre-flight validation (run before deployment)
  deploy     Execute Week 4 deployment (contracts + verification)
  validate   Post-deployment validation (check Phase 1 complete)
  phase2     Phase 2 readiness check (check unlock requirements)

Examples:
  node scripts/orchestrator/deployment-orchestrator.js check
  node scripts/orchestrator/deployment-orchestrator.js deploy
  node scripts/orchestrator/deployment-orchestrator.js validate
  node scripts/orchestrator/deployment-orchestrator.js phase2
      `);
      process.exit(1);
  }
}

// Run CLI
if (require.main === module) {
  main().catch(error => {
    Logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { DeploymentOrchestrator, ValidationChecks, Logger };
