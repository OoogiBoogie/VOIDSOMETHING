/**
 * burnContractsSeasonal.ts
 * 
 * Seasonal Burn System Contract Configuration
 * Base Sepolia Deployment - November 17, 2025
 * 
 * CANONICAL SPEC COMPLIANT - Season 0 Active
 */

import { Address } from 'viem';

// ═════════════════════════════════════════════════════════════════════════
// ABI IMPORTS - Synchronous for immediate availability
// ═════════════════════════════════════════════════════════════════════════

import VoidBurnUtilitySeasonalABI from '@/contracts/abis/VoidBurnUtilitySeasonal.json';
import XPRewardSystemSeasonalABI from '@/contracts/abis/XPRewardSystemSeasonal.json';
import DistrictAccessBurnSeasonalABI from '@/contracts/abis/DistrictAccessBurnSeasonal.json';
import LandUpgradeBurnSeasonalABI from '@/contracts/abis/LandUpgradeBurnSeasonal.json';
import CreatorToolsBurnSeasonalABI from '@/contracts/abis/CreatorToolsBurnSeasonal.json';
import PrestigeBurnSeasonalABI from '@/contracts/abis/PrestigeBurnSeasonal.json';
import MiniAppBurnAccessSeasonalABI from '@/contracts/abis/MiniAppBurnAccessSeasonal.json';

// ═════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════════

export interface SeasonalBurnContract {
  address: Address;
  abi: any;
  name: string;
  deploymentBlock: number;
  verified: boolean;
}

export interface SeasonalBurnContracts {
  VoidBurnUtilitySeasonal: SeasonalBurnContract;
  XPRewardSystemSeasonal: SeasonalBurnContract;
  DistrictAccessBurnSeasonal: SeasonalBurnContract;
  LandUpgradeBurnSeasonal: SeasonalBurnContract;
  CreatorToolsBurnSeasonal: SeasonalBurnContract;
  PrestigeBurnSeasonal: SeasonalBurnContract;
  MiniAppBurnAccessSeasonal: SeasonalBurnContract;
}

// ═════════════════════════════════════════════════════════════════════════
// CONTRACT ADDRESSES (BASE SEPOLIA - CHAIN ID 84532)
// ═════════════════════════════════════════════════════════════════════════

const DEPLOYMENT_BLOCK = 33790701;

export const SEASONAL_BURN_CONTRACTS: SeasonalBurnContracts = {
  VoidBurnUtilitySeasonal: {
    address: (process.env.NEXT_PUBLIC_VOID_BURN_UTILITY_SEASONAL || 
              '0x977087456Dc0f52d28c529216Bab573C2EF293f3') as Address,
    abi: VoidBurnUtilitySeasonalABI,
    name: 'VoidBurnUtilitySeasonal',
    deploymentBlock: DEPLOYMENT_BLOCK,
    verified: false, // Update after Basescan verification
  },
  
  XPRewardSystemSeasonal: {
    address: (process.env.NEXT_PUBLIC_XP_REWARD_SYSTEM_SEASONAL || 
              '0x187008E91C7C0C0e8089a68099204A8afa41C90B') as Address,
    abi: XPRewardSystemSeasonalABI,
    name: 'XPRewardSystemSeasonal',
    deploymentBlock: DEPLOYMENT_BLOCK,
    verified: false,
  },
  
  DistrictAccessBurnSeasonal: {
    address: (process.env.NEXT_PUBLIC_DISTRICT_ACCESS_BURN_SEASONAL || 
              '0xbBa6f04577aE216A6FF5E536C310194711cE57Ae') as Address,
    abi: DistrictAccessBurnSeasonalABI,
    name: 'DistrictAccessBurnSeasonal',
    deploymentBlock: DEPLOYMENT_BLOCK,
    verified: false,
  },
  
  LandUpgradeBurnSeasonal: {
    address: (process.env.NEXT_PUBLIC_LAND_UPGRADE_BURN_SEASONAL || 
              '0xdA7b1b105835ebaA5e20DB4b8818977618D08716') as Address,
    abi: LandUpgradeBurnSeasonalABI,
    name: 'LandUpgradeBurnSeasonal',
    deploymentBlock: DEPLOYMENT_BLOCK,
    verified: false,
  },
  
  CreatorToolsBurnSeasonal: {
    address: (process.env.NEXT_PUBLIC_CREATOR_TOOLS_BURN_SEASONAL || 
              '0x6DCDb3d400afAc09535D7B7A34dAa812e7ccE18a') as Address,
    abi: CreatorToolsBurnSeasonalABI,
    name: 'CreatorToolsBurnSeasonal',
    deploymentBlock: DEPLOYMENT_BLOCK,
    verified: false,
  },
  
  PrestigeBurnSeasonal: {
    address: (process.env.NEXT_PUBLIC_PRESTIGE_BURN_SEASONAL || 
              '0xDd23059f8A33782275487b3AAE72851Cf539111B') as Address,
    abi: PrestigeBurnSeasonalABI,
    name: 'PrestigeBurnSeasonal',
    deploymentBlock: DEPLOYMENT_BLOCK,
    verified: false,
  },
  
  MiniAppBurnAccessSeasonal: {
    address: (process.env.NEXT_PUBLIC_MINIAPP_BURN_ACCESS_SEASONAL || 
              '0x6187BE555990D62E519d998001f0dF10a8055fd3') as Address,
    abi: MiniAppBurnAccessSeasonalABI,
    name: 'MiniAppBurnAccessSeasonal',
    deploymentBlock: DEPLOYMENT_BLOCK,
    verified: false,
  },
};

// ═════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

/**
 * Check if all seasonal burn contracts are properly deployed
 */
export function areBurnContractsDeployedSeasonal(): boolean {
  const contracts = Object.values(SEASONAL_BURN_CONTRACTS);
  
  for (const contract of contracts) {
    if (!contract.address || contract.address === '0x0') {
      console.error(`❌ ${contract.name} not deployed or address is zero`);
      return false;
    }
    
    if (!contract.abi || contract.abi.length === 0) {
      console.error(`❌ ${contract.name} ABI not loaded`);
      return false;
    }
  }
  
  console.log('✅ All 7 seasonal burn contracts are deployed and configured');
  return true;
}

/**
 * Get list of missing or misconfigured seasonal contracts
 */
export function getMissingSeasonalContracts(): string[] {
  const missing: string[] = [];
  const contracts = Object.entries(SEASONAL_BURN_CONTRACTS);
  
  for (const [key, contract] of contracts) {
    if (!contract.address || contract.address === '0x0') {
      missing.push(`${key} (missing address)`);
    } else if (!contract.abi || contract.abi.length === 0) {
      missing.push(`${key} (missing ABI)`);
    }
  }
  
  return missing;
}

/**
 * Log full seasonal contract status to console
 */
export function logSeasonalContractStatus(): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('SEASONAL BURN SYSTEM - CONTRACT STATUS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('Network: Base Sepolia (Chain ID: 84532)');
  console.log('Deployment Block:', DEPLOYMENT_BLOCK);
  console.log('Season 0: ACTIVE (90 days)');
  console.log('');
  
  const contracts = Object.entries(SEASONAL_BURN_CONTRACTS);
  
  contracts.forEach(([key, contract]) => {
    const hasAddress = contract.address && contract.address !== '0x0';
    const hasABI = contract.abi && contract.abi.length > 0;
    const status = hasAddress && hasABI ? '✅' : '❌';
    
    console.log(`${status} ${contract.name}`);
    console.log(`   Address: ${contract.address}`);
    console.log(`   ABI Functions: ${hasABI ? contract.abi.length : 0}`);
    console.log(`   Verified: ${contract.verified ? 'Yes' : 'Pending'}`);
    console.log('');
  });
  
  const missing = getMissingSeasonalContracts();
  if (missing.length > 0) {
    console.log('⚠️  ISSUES FOUND:');
    missing.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ All contracts validated successfully');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

/**
 * Validate ABI contains required functions
 */
export function validateSeasonalABIs(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Core contract required functions
  const burnUtilityRequiredFunctions = [
    'performUtilityBurn',
    'getCurrentSeasonId',
    'getSeasonConfig',
    'getUserSeasonState',
    'computeXPFromBurn',
  ];
  
  const xpSystemRequiredFunctions = [
    'awardXPForBurn',
    'getUserLifetimeProgress',
    'getUserSeasonXP',
    'getUserAirdropWeight',
  ];
  
  const moduleRequiredFunctions = [
    'unlockDistrict', // or equivalent for each module
  ];
  
  // Validate VoidBurnUtilitySeasonal
  const burnUtilityABI = SEASONAL_BURN_CONTRACTS.VoidBurnUtilitySeasonal.abi;
  if (burnUtilityABI) {
    const functionNames = burnUtilityABI.filter((item: any) => item.type === 'function')
                                       .map((item: any) => item.name);
    
    burnUtilityRequiredFunctions.forEach(requiredFn => {
      if (!functionNames.includes(requiredFn)) {
        errors.push(`VoidBurnUtilitySeasonal missing function: ${requiredFn}`);
      }
    });
  } else {
    errors.push('VoidBurnUtilitySeasonal ABI not loaded');
  }
  
  // Validate XPRewardSystemSeasonal
  const xpSystemABI = SEASONAL_BURN_CONTRACTS.XPRewardSystemSeasonal.abi;
  if (xpSystemABI) {
    const functionNames = xpSystemABI.filter((item: any) => item.type === 'function')
                                    .map((item: any) => item.name);
    
    xpSystemRequiredFunctions.forEach(requiredFn => {
      if (!functionNames.includes(requiredFn)) {
        errors.push(`XPRewardSystemSeasonal missing function: ${requiredFn}`);
      }
    });
  } else {
    errors.push('XPRewardSystemSeasonal ABI not loaded');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get seasonal contract by name
 */
export function getSeasonalContract(name: keyof SeasonalBurnContracts): SeasonalBurnContract {
  return SEASONAL_BURN_CONTRACTS[name];
}

/**
 * Check if seasonal system is enabled
 */
export function isSeasonalSystemEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI === 'true';
}

/**
 * Get current season ID from environment
 */
export function getCurrentSeasonId(): number {
  return parseInt(process.env.NEXT_PUBLIC_CURRENT_SEASON_ID || '0');
}

// ═════════════════════════════════════════════════════════════════════════
// AUTO-VALIDATION ON IMPORT
// ═════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  // Client-side only
  const isValid = areBurnContractsDeployedSeasonal();
  
  if (!isValid) {
    console.warn('⚠️  Seasonal burn contracts not fully configured');
    console.warn('Run getMissingSeasonalContracts() for details');
  }
  
  if (process.env.NODE_ENV === 'development') {
    // Auto-log in development
    logSeasonalContractStatus();
  }
}

// ═════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════════════

export default SEASONAL_BURN_CONTRACTS;
