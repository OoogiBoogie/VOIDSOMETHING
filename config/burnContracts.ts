/**
 * VOID BURN SYSTEM - CONTRACT ADDRESSES & ABIS
 * 
 * Centralized configuration for all burn-related contracts.
 * Loads addresses from environment variables and provides type-safe access.
 * 
 * ENVIRONMENT VARIABLES (set in .env.local):
 * - NEXT_PUBLIC_VOID_BURN_UTILITY
 * - NEXT_PUBLIC_DISTRICT_ACCESS_BURN
 * - NEXT_PUBLIC_LAND_UPGRADE_BURN
 * - NEXT_PUBLIC_CREATOR_TOOLS_BURN
 * - NEXT_PUBLIC_PRESTIGE_BURN
 * - NEXT_PUBLIC_MINIAPP_BURN_ACCESS
 * - NEXT_PUBLIC_AI_UTILITY_GOVERNOR
 * 
 * Usage in hooks:
 * ```typescript
 * import { BURN_CONTRACTS } from '@/config/burnContracts';
 * 
 * const { data } = useReadContract({
 *   address: BURN_CONTRACTS.districtAccess.address,
 *   abi: BURN_CONTRACTS.districtAccess.abi,
 *   functionName: 'isDistrictUnlocked',
 *   args: [address, districtId],
 * });
 * ```
 */

import { type Address } from 'viem';

// Import contract ABIs (generated from Hardhat compilation)
// TODO: After running `npx hardhat compile`, copy ABIs from artifacts/ to contracts/abis/
// If ABIs don't exist yet, deployment script will still work but frontend integration will fail
// Expected files:
// - contracts/abis/VoidBurnUtility.json
// - contracts/abis/DistrictAccessBurn.json
// - contracts/abis/LandUpgradeBurn.json
// - contracts/abis/CreatorToolsBurn.json
// - contracts/abis/PrestigeBurn.json
// - contracts/abis/MiniAppBurnAccess.json
// - contracts/abis/AIUtilityGovernor.json
import VoidBurnUtilityABI from '@/contracts/abis/VoidBurnUtility.json';
import DistrictAccessBurnABI from '@/contracts/abis/DistrictAccessBurn.json';
import LandUpgradeBurnABI from '@/contracts/abis/LandUpgradeBurn.json';
import CreatorToolsBurnABI from '@/contracts/abis/CreatorToolsBurn.json';
import PrestigeBurnABI from '@/contracts/abis/PrestigeBurn.json';
import MiniAppBurnAccessABI from '@/contracts/abis/MiniAppBurnAccess.json';
import AIUtilityGovernorABI from '@/contracts/abis/AIUtilityGovernor.json';

/**
 * Contract configuration type
 */
export interface BurnContractConfig {
  address: Address | undefined;
  abi: any;
  name: string;
}

/**
 * All burn system contracts
 */
export interface BurnContracts {
  core: BurnContractConfig;
  districtAccess: BurnContractConfig;
  landUpgrade: BurnContractConfig;
  creatorTools: BurnContractConfig;
  prestige: BurnContractConfig;
  miniAppAccess: BurnContractConfig;
  aiGovernor: BurnContractConfig;
}

/**
 * Get contract address from environment variable
 * Returns undefined if not set (allows graceful degradation)
 */
function getContractAddress(envVar: string): Address | undefined {
  const address = process.env[envVar];
  if (!address) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  Burn contract address not set: ${envVar}`);
    }
    return undefined;
  }
  return address as Address;
}

/**
 * BURN SYSTEM CONTRACT CONFIGURATION
 * 
 * All addresses are loaded from environment variables.
 * If ENABLE_BURN_UI is false, these may be undefined without breaking the app.
 */
export const BURN_CONTRACTS: BurnContracts = {
  core: {
    address: getContractAddress('NEXT_PUBLIC_VOID_BURN_UTILITY'),
    abi: VoidBurnUtilityABI,
    name: 'VoidBurnUtility',
  },
  districtAccess: {
    address: getContractAddress('NEXT_PUBLIC_DISTRICT_ACCESS_BURN'),
    abi: DistrictAccessBurnABI,
    name: 'DistrictAccessBurn',
  },
  landUpgrade: {
    address: getContractAddress('NEXT_PUBLIC_LAND_UPGRADE_BURN'),
    abi: LandUpgradeBurnABI,
    name: 'LandUpgradeBurn',
  },
  creatorTools: {
    address: getContractAddress('NEXT_PUBLIC_CREATOR_TOOLS_BURN'),
    abi: CreatorToolsBurnABI,
    name: 'CreatorToolsBurn',
  },
  prestige: {
    address: getContractAddress('NEXT_PUBLIC_PRESTIGE_BURN'),
    abi: PrestigeBurnABI,
    name: 'PrestigeBurn',
  },
  miniAppAccess: {
    address: getContractAddress('NEXT_PUBLIC_MINIAPP_BURN_ACCESS'),
    abi: MiniAppBurnAccessABI,
    name: 'MiniAppBurnAccess',
  },
  aiGovernor: {
    address: getContractAddress('NEXT_PUBLIC_AI_UTILITY_GOVERNOR'),
    abi: AIUtilityGovernorABI,
    name: 'AIUtilityGovernor',
  },
};

/**
 * Verify all burn contracts are deployed
 * Returns true if all addresses are set
 */
export function areBurnContractsDeployed(): boolean {
  return Object.values(BURN_CONTRACTS).every(contract => !!contract.address);
}

/**
 * Get missing contract addresses
 * Useful for deployment validation
 */
export function getMissingContracts(): string[] {
  return Object.entries(BURN_CONTRACTS)
    .filter(([_, config]) => !config.address)
    .map(([key, config]) => config.name);
}

/**
 * Log burn contract deployment status
 * Useful for debugging
 */
export function logBurnContractStatus(): void {
  console.group('🔥 VOID Burn System - Contract Status');
  Object.entries(BURN_CONTRACTS).forEach(([key, config]) => {
    const status = config.address ? '✅' : '❌';
    const addr = config.address || 'NOT DEPLOYED';
    console.log(`${status} ${config.name}: ${addr}`);
  });
  console.groupEnd();
}
