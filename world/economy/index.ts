/**
 * WORLD ECONOMY SYSTEM
 * 
 * Central export for all economy modules
 */

export * from './districtEconomy';
export * from './parcelEconomy';
export * from './buildingEconomy';
export * from './hooks';

// Re-export key functions for convenience
export { calculateAllDistrictEconomies, getDistrictEconomy } from './districtEconomy';
export { calculateParcelEconomy } from './parcelEconomy';
export { calculateBuildingEconomy, getBuildingsForSale } from './buildingEconomy';

// Re-export hooks
export {
  useDistrictEconomy,
  useParcelEconomy,
  usePlayerPortfolio,
  useDistrictRewardStats,
  useDistrictEconomyMap,
} from './hooks';
