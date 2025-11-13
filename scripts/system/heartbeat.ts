/**
 * @title VOID System Heartbeat Monitor
 * @notice Checks health of all deployed contracts and services
 * 
 * Usage: npx ts-node scripts/system/heartbeat.ts
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface ServiceHealth {
  name: string;
  endpoint: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTime: number;
  lastCheck: string;
  error?: string;
}

interface HeartbeatReport {
  timestamp: string;
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  services: ServiceHealth[];
  uptime24h: number;
  details: {
    contractsChecked: number;
    contractsUp: number;
    averageResponseTime: number;
  };
}

async function checkContractCall(
  contractName: string,
  address: string,
  abi: string[],
  functionName: string,
  args: any[],
  provider: ethers.Provider
): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const contract = new ethers.Contract(address, abi, provider);
    await contract[functionName](...args);
    const responseTime = Date.now() - startTime;
    
    return {
      name: contractName,
      endpoint: address,
      status: responseTime < 500 ? 'UP' : 'DEGRADED',
      responseTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      name: contractName,
      endpoint: address,
      status: 'DOWN',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error.message || error.toString(),
    };
  }
}

async function runHeartbeat(): Promise<HeartbeatReport> {
  console.log('\n🩺 VOID SYSTEM HEARTBEAT CHECK\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Load deployed addresses
  const deployedPath = path.join(__dirname, '../../deployments/baseSepolia/deployed_addresses.json');
  
  if (!fs.existsSync(deployedPath)) {
    console.error('❌ Error: deployed_addresses.json not found');
    console.error('   Contracts may not be deployed yet.\n');
    
    return {
      timestamp: new Date().toISOString(),
      overallHealth: 'DOWN',
      services: [],
      uptime24h: 0,
      details: {
        contractsChecked: 0,
        contractsUp: 0,
        averageResponseTime: 0,
      },
    };
  }
  
  const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
  const provider = new ethers.JsonRpcProvider(
    process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
  );
  
  const services: ServiceHealth[] = [];
  
  console.log('Checking contracts on Base Sepolia...\n');
  
  // Check XPOracle
  console.log('📊 Checking XPOracle...');
  services.push(await checkContractCall(
    'XPOracle.getXP()',
    deployed.week1.XPOracle,
    ['function getXP(address) view returns (uint256)'],
    'getXP',
    [deployed.deployer], // Use deployer address as test
    provider
  ));
  
  // Check MissionRegistry
  console.log('📋 Checking MissionRegistry...');
  services.push(await checkContractCall(
    'MissionRegistry.getActiveMissions()',
    deployed.week1.MissionRegistry,
    ['function getActiveMissions(uint8) view returns (uint256[])'],
    'getActiveMissions',
    [0], // HubType.WORLD
    provider
  ));
  
  // Check EscrowVault
  console.log('💰 Checking EscrowVault...');
  services.push(await checkContractCall(
    'EscrowVault.getBalance()',
    deployed.week1.EscrowVault,
    ['function getBalance(address) view returns (uint256)'],
    'getBalance',
    [deployed.deployer],
    provider
  ));
  
  // Check VoidHookRouterV4
  console.log('🔀 Checking VoidHookRouterV4...');
  services.push(await checkContractCall(
    'VoidHookRouterV4.getFeeProfile()',
    deployed.week2.VoidHookRouterV4,
    ['function getFeeProfile(address) view returns (tuple(uint16,uint16,uint16,uint16,uint16,uint16,uint16))'],
    'getFeeProfile',
    [deployed.deployer],
    provider
  ));
  
  // Check SKUFactory
  console.log('🏭 Checking SKUFactory...');
  services.push(await checkContractCall(
    'SKUFactory.balanceOf()',
    deployed.week2.SKUFactory,
    ['function balanceOf(address, uint256) view returns (uint256)'],
    'balanceOf',
    [deployed.deployer, 1],
    provider
  ));
  
  // Check LandRegistry
  console.log('🗺️  Checking LandRegistry...');
  services.push(await checkContractCall(
    'LandRegistry.getParcelInfo()',
    deployed.week2.LandRegistry,
    ['function getParcelInfo(uint256) view returns (tuple(address,uint8,uint256,bool))'],
    'getParcelInfo',
    [0], // Parcel #0
    provider
  ));
  
  // Check VoidEmitter
  console.log('📡 Checking VoidEmitter...');
  services.push(await checkContractCall(
    'VoidEmitter.getActionCount()',
    deployed.week2.VoidEmitter,
    ['function getActionCount(address) view returns (uint256)'],
    'getActionCount',
    [deployed.deployer],
    provider
  ));
  
  // Check VaultFactory
  console.log('🏦 Checking VaultFactory...');
  services.push(await checkContractCall(
    'VaultFactory.getVaultCount()',
    deployed.week2.VoidVaultFactory,
    ['function getVaultCount() view returns (uint256)'],
    'getVaultCount',
    [],
    provider
  ));
  
  // Check AI Telemetry
  console.log('🤖 Checking AI Telemetry...');
  const telemetryPath = path.join(__dirname, '../../logs/ai/telemetry/aggregated_telemetry.json');
  if (fs.existsSync(telemetryPath)) {
    try {
      const telemetry = JSON.parse(fs.readFileSync(telemetryPath, 'utf-8'));
      const age = Date.now() - new Date(telemetry.timestamp).getTime();
      const ageMinutes = Math.floor(age / 60000);
      
      services.push({
        name: 'AI Telemetry Aggregator',
        endpoint: telemetryPath,
        status: age < 120000 ? 'UP' : 'DEGRADED', // 2 minutes max staleness
        responseTime: age,
        lastCheck: new Date().toISOString(),
        error: age >= 120000 ? `Telemetry stale (${ageMinutes} minutes old)` : undefined,
      });
    } catch (error: any) {
      services.push({
        name: 'AI Telemetry Aggregator',
        endpoint: telemetryPath,
        status: 'DOWN',
        responseTime: 0,
        lastCheck: new Date().toISOString(),
        error: `Failed to read telemetry: ${error.message}`,
      });
    }
  } else {
    services.push({
      name: 'AI Telemetry Aggregator',
      endpoint: telemetryPath,
      status: 'DOWN',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
      error: 'Telemetry file not found (daemon not running?)',
    });
  }
  
  console.log('\n');
  
  // Calculate health metrics
  const upServices = services.filter(s => s.status === 'UP').length;
  const degradedServices = services.filter(s => s.status === 'DEGRADED').length;
  const downServices = services.filter(s => s.status === 'DOWN').length;
  
  let overallHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  if (downServices > 0) {
    overallHealth = 'DOWN';
  } else if (degradedServices > 0) {
    overallHealth = 'DEGRADED';
  } else {
    overallHealth = 'HEALTHY';
  }
  
  const averageResponseTime = services
    .filter(s => s.status !== 'DOWN')
    .reduce((sum, s) => sum + s.responseTime, 0) / (services.length - downServices || 1);
  
  const uptime24h = (upServices / services.length) * 100;
  
  const report: HeartbeatReport = {
    timestamp: new Date().toISOString(),
    overallHealth,
    services,
    uptime24h,
    details: {
      contractsChecked: services.length,
      contractsUp: upServices,
      averageResponseTime: Math.round(averageResponseTime),
    },
  };
  
  // Display results
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📊 System Health: ${getHealthIcon(overallHealth)} ${overallHealth}`);
  console.log(`⏱️  Average Response Time: ${report.details.averageResponseTime}ms`);
  console.log(`📈 Uptime: ${uptime24h.toFixed(2)}%`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('Service Status:\n');
  services.forEach(service => {
    const icon = getStatusIcon(service.status);
    console.log(`${icon} ${service.name.padEnd(40)} ${service.responseTime}ms`);
    if (service.error) {
      console.log(`   ⚠️  ${service.error}`);
    }
  });
  
  console.log('\n');
  
  // Save report
  const logsDir = path.join(__dirname, '../../logs/system');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const reportPath = path.join(logsDir, `heartbeat_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Report saved: ${reportPath}\n`);
  
  // Recommendations
  if (overallHealth !== 'HEALTHY') {
    console.log('⚠️  RECOMMENDATIONS:\n');
    
    if (downServices > 0) {
      console.log('   - Check RPC connection (BASE_SEPOLIA_RPC_URL)');
      console.log('   - Verify contracts deployed correctly');
      console.log('   - Review contract addresses in deployed_addresses.json');
    }
    
    if (degradedServices > 0) {
      console.log('   - Slow response times detected (>500ms)');
      console.log('   - Consider using a faster RPC provider (Alchemy, Infura)');
      console.log('   - Check network congestion on Base Sepolia');
    }
    
    const telemetryDown = services.find(s => s.name.includes('Telemetry') && s.status === 'DOWN');
    if (telemetryDown) {
      console.log('   - AI telemetry daemon not running');
      console.log('   - Start with: node scripts/ai-telemetry.js daemon');
    }
    
    console.log('');
  } else {
    console.log('✅ All systems operational!\n');
  }
  
  return report;
}

function getHealthIcon(health: 'HEALTHY' | 'DEGRADED' | 'DOWN'): string {
  switch (health) {
    case 'HEALTHY': return '✅';
    case 'DEGRADED': return '⚠️';
    case 'DOWN': return '❌';
  }
}

function getStatusIcon(status: 'UP' | 'DOWN' | 'DEGRADED'): string {
  switch (status) {
    case 'UP': return '✅';
    case 'DEGRADED': return '⚠️';
    case 'DOWN': return '❌';
  }
}

async function main() {
  try {
    const report = await runHeartbeat();
    
    // Exit with error code if system unhealthy
    if (report.overallHealth === 'DOWN') {
      process.exit(1);
    } else if (report.overallHealth === 'DEGRADED') {
      process.exit(2);
    } else {
      process.exit(0);
    }
  } catch (error: any) {
    console.error('❌ Fatal error during heartbeat check:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
