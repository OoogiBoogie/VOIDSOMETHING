'use client';

/**
 * REAL ESTATE PANEL
 * 
 * Shows player's property portfolio with economy stats:
 * - Total properties owned (placeholder until land registry)
 * - Estimated market value
 * - P&L tracking
 * - Active parcel/building details (when clicked)
 * 
 * Uses usePlayerPortfolio hook for ownership data
 * Uses useParcelEconomy hook for active parcel details
 */

import React, { memo, useState } from 'react';
import { usePlayerPortfolio, useParcelEconomy } from '@/world/economy';
import { useSelectionState } from '@/state/selection/useSelectionState';
import { useParcelOwnership, useParcelListing } from '@/world/economy/ownershipHooks';
import { useParcelMarketState } from '@/state/parcelMarket/useParcelMarketState';
import { useRealEstateToasts } from '@/world/economy/useRealEstateToasts';
import { useRealEstateAirdropScore } from '@/world/economy/realEstateAirdropScoring';
import { useHomeParcelState } from '@/state/realEstate/useHomeParcelState';
import { useRealEstatePerks, getNextTierInfo } from '@/world/economy/realEstateUtility';
import { getBuildingForParcel } from '@/world/config/WorldLayout';
import { formatEther, parseEther } from 'viem';
import { ENABLE_BURN_UI } from '@/config/voidConfig';

// Conditional burn imports (only if burn UI enabled)
let useLandBurn: any;
let BurnConfirmationModal: any;
let BurnCategory: any;

if (ENABLE_BURN_UI) {
  const landBurnModule = require('@/hooks/burn/useLandBurn');
  const burnModalModule = require('@/hud/utility/BurnConfirmationModal');
  useLandBurn = landBurnModule.useLandBurn;
  BurnConfirmationModal = burnModalModule.BurnConfirmationModal;
  BurnCategory = burnModalModule.BurnCategory;
}

interface RealEstatePanelProps {
  onClose?: () => void;
}

function RealEstatePanelComponent({ onClose }: RealEstatePanelProps) {
  // Use selection store to get active parcel
  const { active } = useSelectionState();
  const activeParcelId = active.parcelId;
  
  const { loading: portfolioLoading, summary: portfolio } = usePlayerPortfolio();
  const { stats: activeParcelStats, loading: parcelLoading } = useParcelEconomy(activeParcelId);
  
  // Ownership & listing hooks for active parcel
  const { isOwnedByCurrentPlayer, isUnowned } = useParcelOwnership(activeParcelId);
  const { activeListing, canList, canCancelList, listParcel, cancelList } = useParcelListing(activeParcelId);
  const { claimParcel } = useParcelMarketState();
  const { notifyClaimed, notifyListed, notifyCanceled } = useRealEstateToasts();
  
  // Get building metadata for active parcel (if it has a landmark building)
  const activeBuilding = activeParcelId ? getBuildingForParcel(activeParcelId) : undefined;
  
  // DEBUG: Log render with state snapshot
  console.log('[HUD] RealEstatePanel render', {
    activeParcelId,
    isOwnedByCurrentPlayer,
    isUnowned,
    portfolioLoading,
    parcelLoading,
    hasActiveListing: !!activeListing,
    buildingName: activeBuilding?.name,
  });
  
  // UI state for listing form
  const [showListingForm, setShowListingForm] = useState(false);
  const [listPrice, setListPrice] = useState('');
  
  // Land upgrade state (only if burn UI enabled)
  const landBurnHook = ENABLE_BURN_UI && useLandBurn ? useLandBurn() : null;
  const currentLevel = landBurnHook?.useUpgradeLevel?.(activeParcelId ? BigInt(activeParcelId) : BigInt(0)) || 0;
  const nextLevel = (currentLevel || 0) + 1;
  const upgradeCost = landBurnHook?.useUpgradeCost?.(nextLevel) || '0';
  const isUpgradePending = landBurnHook?.isPending || false;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Upgrade cost data (matches LandUpgradeBurn.sol)
  const UPGRADE_COSTS = ['0', '50,000', '150,000', '400,000', '1,000,000', '2,500,000'];
  
  // Get player wallet for claim action
  const [playerWallet, setPlayerWallet] = useState<string | null>(null);
  const airdropScore = useRealEstateAirdropScore(playerWallet || undefined);
  const perks = useRealEstatePerks(playerWallet || undefined);
  
  // Home parcel state
  const { homeParcelId, enabled: homeSpawnEnabled, setHome, clearHome, setEnabled: setHomeSpawnEnabled } = useHomeParcelState();
  
  React.useEffect(() => {
    // Simple mock - in prod, get from wallet connection
    const mockWallet = '0x' + Math.random().toString(16).slice(2, 42);
    setPlayerWallet(mockWallet);
  }, []);
  
  const handleClaimParcel = () => {
    if (!activeParcelId || !playerWallet) return;
    // District ID will be passed by future integration; for now undefined
    claimParcel(activeParcelId, playerWallet, active.districtId || undefined);
    notifyClaimed(String(activeParcelId));
  };
  
  const handleListParcel = () => {
    const price = parseFloat(listPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    listParcel(price);
    notifyListed(activeParcelId ? String(activeParcelId) : 'N/A', listPrice);
    setShowListingForm(false);
    setListPrice('');
  };

  const handleCancelListing = () => {
    cancelList();
    notifyCanceled(activeParcelId ? String(activeParcelId) : 'N/A');
  };
  
  const handleUpgradeParcel = () => {
    if (!activeParcelId || !landBurnHook?.upgradeParcel) return;
    landBurnHook.upgradeParcel(BigInt(activeParcelId));
  };

  return (
    <div className="w-full max-w-md bg-black/90 backdrop-blur-xl border-2 border-cyan-500/40 rounded-xl sm:rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3 border-b-2 border-cyan-500/30 bg-gradient-to-r from-black/60 to-cyan-950/20">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan-400 font-bold truncate">
              REAL ESTATE
            </h2>
            <p className="text-[10px] sm:text-xs text-cyan-400/60 mt-0.5 truncate">Property Portfolio</p>
          </div>
          <span className="px-1.5 py-0.5 sm:px-2 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider flex-shrink-0">
            TESTNET
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-lg sm:text-xl px-2 flex-shrink-0"
            aria-label="Close panel"
          >
            ✕
          </button>
        )}
      </header>

      {/* Portfolio Summary */}
      <section className="p-3 sm:p-5 border-b border-cyan-500/20 bg-black/40">
        <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-cyan-400/80 mb-2 sm:mb-3 font-semibold">
          Your Portfolio
        </h3>

        {portfolioLoading ? (
          <div className="text-center text-cyan-400/60 text-xs sm:text-sm py-3 sm:py-4">
            Loading portfolio...
          </div>
        ) : portfolio ? (
          <div className="space-y-2 sm:space-y-3">
            {/* Properties Owned */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-cyan-400/70">Properties Owned</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-cyan-400">
                {portfolio.totalParcelsOwned}
              </span>
            </div>

            {/* Market Value */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-cyan-400/70">Market Value</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-green-400">
                {portfolio.totalMarketValue.toLocaleString()} VOID
              </span>
            </div>

            {/* P&L */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-cyan-400/70">Total P&L</span>
              <span className={`text-xs sm:text-sm font-mono font-bold ${portfolio.totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolio.totalUnrealizedPnl >= 0 ? '+' : ''}{portfolio.totalUnrealizedPnl.toLocaleString()} VOID
              </span>
            </div>

            {/* Cost Basis */}
            <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
              <span className="text-[10px] sm:text-xs text-cyan-400/70">Cost Basis</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-purple-400">
                {portfolio.totalCostBasis.toLocaleString()} VOID
              </span>
            </div>
            
            {/* Top Districts */}
            {portfolio.districtsOwned.length > 0 && (
              <div className="pt-2 border-t border-cyan-500/20">
                <div className="text-xs text-cyan-400/60 mb-2">Top Districts</div>
                {portfolio.districtsOwned.slice(0, 3).map((district) => (
                  <div key={district.districtId} className="flex justify-between text-xs mb-1">
                    <span className="text-cyan-400/70">{district.districtId}:</span>
                    <span className="text-cyan-400 font-mono">{district.parcelCount} parcels</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Creator Pad Access (Phase 5) */}
            {perks && (
              <div className="pt-3 border-t border-orange-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-orange-400/80 uppercase tracking-wider">Creator Pad Access</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    perks.hasCreatorPadAccess
                      ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                      : 'bg-gray-500/20 border border-gray-500/40 text-gray-400'
                  }`}>
                    {perks.hasCreatorPadAccess ? 'ENABLED' : 'LOCKED'}
                  </span>
                </div>
                {perks.hasCreatorPadAccess ? (
                  <div className="text-[10px] text-orange-400/60">
                    Future: build + showcase your own Void pad here.
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-400/60">
                    Own land in CREATOR or HQ district to unlock.
                  </div>
                )}
              </div>
            )}
            
            {/* Airdrop Influence (Beta) */}
            {airdropScore && perks && (
              <div className="pt-3 border-t border-amber-500/20 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-amber-400/80 uppercase tracking-wider">Real Estate Airdrop Influence</span>
                  <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-400 text-[9px] font-bold uppercase">
                    BETA
                  </span>
                </div>
                
                <div className="space-y-2">
                  {/* Score + Tier */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400/70">Total Score</span>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      {Math.round(airdropScore.score)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400/70">Tier</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      perks.tier === 'DIAMOND' ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40' :
                      perks.tier === 'GOLD' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40' :
                      perks.tier === 'SILVER' ? 'bg-gray-300/20 text-gray-300 border border-gray-300/40' :
                      perks.tier === 'BRONZE' ? 'bg-orange-400/20 text-orange-400 border border-orange-400/40' :
                      'bg-gray-500/20 text-gray-500 border border-gray-500/40'
                    }`}>
                      {perks.tier}
                    </span>
                  </div>
                  
                  {/* Tier Progress */}
                  {(() => {
                    const nextTier = getNextTierInfo(airdropScore.score);
                    return nextTier.nextTier && (
                      <div className="text-[10px] text-amber-400/50">
                        Next tier ({nextTier.nextTier}) at {Math.round(airdropScore.score + nextTier.pointsNeeded)} score 
                        <span className="text-amber-400/40"> (+{Math.round(nextTier.pointsNeeded)})</span>
                      </div>
                    );
                  })()}
                  
                  {/* Activity Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-amber-400/60">Claims:</span>{' '}
                      <span className="text-amber-400 font-mono">{airdropScore.claims}</span>
                    </div>
                    <div>
                      <span className="text-amber-400/60">Sales:</span>{' '}
                      <span className="text-amber-400 font-mono">{airdropScore.salesAsSeller}</span>
                    </div>
                    <div>
                      <span className="text-amber-400/60">Listings:</span>{' '}
                      <span className="text-amber-400 font-mono">{airdropScore.listings}</span>
                    </div>
                    <div>
                      <span className="text-amber-400/60">Purchases:</span>{' '}
                      <span className="text-amber-400 font-mono">{airdropScore.purchasesAsBuyer}</span>
                    </div>
                  </div>
                  
                  {/* Volume */}
                  {(airdropScore.totalVolumeSold > 0 || airdropScore.totalVolumeBought > 0) && (
                    <div className="pt-1 border-t border-amber-500/10">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-amber-400/60">Volume Sold:</span>
                        <span className="text-green-400 font-mono">{airdropScore.totalVolumeSold.toLocaleString()} VOID</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-amber-400/60">Volume Bought:</span>
                        <span className="text-blue-400 font-mono">{airdropScore.totalVolumeBought.toLocaleString()} VOID</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-[9px] text-amber-400/50 italic mt-2 space-y-1">
                    <div>⚠ Experimental · Part of airdrop formula, not the full picture</div>
                    <div className="text-amber-400/40">
                      Land activity is one track in the overall Void airdrop. Chat, exploration, missions, and mini-app usage will also contribute.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-cyan-400/60 text-sm py-4">
            <div className="mb-2">🏗️</div>
            <div>No properties yet</div>
            <div className="text-xs text-cyan-400/40 mt-1">
              Land registry coming soon
            </div>
          </div>
        )}
      </section>

      {/* Active Parcel Details */}
      {activeParcelId ? (
        <section className="p-5 bg-black/30">
          <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 mb-3 font-semibold">
            Active Parcel
          </h3>

          {parcelLoading ? (
            <div className="text-center text-cyan-400/60 text-sm py-4">
              Loading parcel data...
            </div>
          ) : activeParcelStats ? (
            <div className="space-y-3">
              {/* Building Name (if landmark) */}
              {activeBuilding && (
                <div className="mb-3 pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-cyan-400">
                      {activeBuilding.name}
                    </span>
                    {activeBuilding.landmark && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-400 text-[9px] font-bold uppercase">
                        LANDMARK
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-cyan-400/60 mt-0.5">
                    {activeBuilding.districtId} · {activeBuilding.type}
                  </div>
                </div>
              )}
              
              {/* Parcel ID */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400/70">Parcel ID</span>
                <span className="text-sm font-mono text-cyan-400">
                  {activeParcelId}
                </span>
              </div>

              {/* Ownership */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400/70">Owner</span>
                <span className="text-xs font-mono text-cyan-400">
                  {activeParcelStats.owner 
                    ? `${activeParcelStats.owner.slice(0, 6)}...${activeParcelStats.owner.slice(-4)}`
                    : 'Unowned'
                  }
                </span>
              </div>

              {/* Market Value */}
              {activeParcelStats.currentValue && activeParcelStats.currentValue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan-400/70">Market Value</span>
                  <span className="text-sm font-mono text-green-400">
                    ${activeParcelStats.currentValue.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Visits */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400/70">Visits</span>
                <span className="text-sm font-mono text-purple-400">
                  {activeParcelStats.visitCount}
                </span>
              </div>
              
              {/* Buildings */}
              {activeParcelStats.buildingCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan-400/70">Buildings</span>
                  <span className="text-sm font-mono text-cyan-400">
                    {activeParcelStats.buildingCount}
                  </span>
                </div>
              )}
              
              {/* LAND UPGRADE SECTION (Phase 9 - VOID Burn System - Feature Flag Protected) */}
              {ENABLE_BURN_UI && isOwnedByCurrentPlayer && (
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-purple-400/80 uppercase tracking-wider">Land Upgrade</span>
                    <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded text-purple-400 text-[9px] font-bold uppercase">
                      BURN
                    </span>
                  </div>
                  
                  {/* Current Level */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-purple-400/70">Current Level</span>
                    <span className="text-sm font-mono font-bold text-purple-400">
                      Level {currentLevel || 0}
                    </span>
                  </div>
                  
                  {/* Level Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-purple-400/60 mb-1">
                      <span>L0</span>
                      <span>L1</span>
                      <span>L2</span>
                      <span>L3</span>
                      <span>L4</span>
                      <span>L5</span>
                    </div>
                    <div className="h-1.5 bg-purple-900/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                        style={{ width: `${((currentLevel || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Next Upgrade */}
                  {(currentLevel || 0) < 5 ? (
                    <>
                      <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-purple-400/70">Next Level</span>
                          <span className="text-sm font-bold text-purple-400">
                            Level {nextLevel}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-400/70">Burn Cost</span>
                          <span className="text-sm font-bold text-purple-400">
                            {UPGRADE_COSTS[nextLevel]} VOID
                          </span>
                        </div>
                        {upgradeCost && upgradeCost !== '0' && (
                          <div className="text-[10px] text-purple-400/50 mt-1">
                            On-chain: {Number(upgradeCost).toLocaleString()} VOID
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setShowUpgradeModal(true)}
                        disabled={isUpgradePending}
                        className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-500/40 hover:border-purple-500/70 transition-all text-white font-semibold text-xs uppercase tracking-wide flex items-center justify-center gap-2"
                      >
                        {isUpgradePending ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Upgrading...
                          </>
                        ) : (
                          <>
                            🔥 Upgrade to Level {nextLevel}
                          </>
                        )}
                      </button>
                      
                      <div className="mt-2 text-[9px] text-purple-400/50 italic">
                        ⚠ VOID will be permanently burned to upgrade this parcel
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-yellow-900/30 to-purple-900/30 border-2 border-yellow-500/50 rounded-lg text-center">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-xs font-bold text-yellow-400 mb-1">MAX LEVEL REACHED</div>
                      <div className="text-[10px] text-yellow-400/60">
                        This parcel is fully upgraded
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* OWNERSHIP ACTIONS */}
              <div className="mt-4 pt-4 border-t border-cyan-500/20 space-y-2">
                {/* HOME PARCEL CONTROLS (Phase 5) */}
                {isOwnedByCurrentPlayer && perks && perks.canSetCustomSpawn && (
                  <div className="p-3 bg-purple-400/5 rounded-lg border border-purple-400/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400/80 uppercase tracking-wider">Home Parcel</span>
                      <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded text-purple-400 text-[9px] font-bold uppercase">
                        BETA
                      </span>
                    </div>
                    
                    {homeParcelId === activeParcelId ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] sm:text-xs text-purple-400 font-semibold">🏠 Current Home</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => clearHome()}
                          className="w-full px-3 py-2 h-8 sm:h-auto rounded bg-red-400/10 border border-red-400/40 hover:border-red-400/70 transition-all text-red-400 text-[10px] sm:text-xs font-semibold flex items-center justify-center"
                        >
                          Clear Home
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setHome(activeParcelId, active.districtId || 'UNKNOWN')}
                        className="w-full px-3 py-2 h-8 sm:h-auto rounded bg-purple-400/10 border border-purple-400/40 hover:border-purple-400/70 transition-all text-purple-400 text-[10px] sm:text-xs font-semibold flex items-center justify-center"
                      >
                        🏠 Set as Home Parcel
                      </button>
                    )}
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={homeSpawnEnabled}
                        onChange={(e) => setHomeSpawnEnabled(e.target.checked)}
                        className="w-3 h-3 rounded border-purple-400/40 bg-black/60 text-purple-400 focus:ring-purple-400/50"
                      />
                      <span className="text-[10px] text-purple-400/70">Use Home Spawn (Beta)</span>
                    </label>
                  </div>
                )}
                
                {/* Unowned: Claim Button */}
                {isUnowned && (
                  <button
                    type="button"
                    onClick={handleClaimParcel}
                    className="w-full px-3 sm:px-4 py-2 h-10 sm:h-auto rounded-lg bg-amber-400/10 border-2 border-amber-400/40 hover:border-amber-400/70 transition-all text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center"
                  >
                    🎉 Claim Parcel (Testnet)
                  </button>
                )}
                
                {/* Owned by player: List/Cancel buttons */}
                {isOwnedByCurrentPlayer && !activeListing && !showListingForm && (
                  <button
                    type="button"
                    onClick={() => setShowListingForm(true)}
                    className="w-full px-3 sm:px-4 py-2 h-10 sm:h-auto rounded-lg bg-green-400/10 border-2 border-green-400/40 hover:border-green-400/70 transition-all text-green-400 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center"
                  >
                    💰 List for Sale
                  </button>
                )}
                
                {/* Listing form */}
                {showListingForm && (
                  <div className="p-3 bg-black/50 rounded-lg border border-green-400/30">
                    <div className="text-[10px] sm:text-xs text-green-400/70 mb-2">Set Listing Price (VOID)</div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="number"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                        placeholder="1000"
                        className="flex-1 px-3 py-2 h-8 sm:h-auto bg-black/60 border border-green-400/30 rounded text-green-400 text-xs sm:text-sm font-mono focus:outline-none focus:border-green-400/60"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleListParcel}
                          className="flex-1 sm:flex-none px-3 py-2 h-8 sm:h-auto bg-green-400/20 border border-green-400/50 hover:bg-green-400/30 rounded text-green-400 text-[10px] sm:text-xs font-semibold transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowListingForm(false);
                            setListPrice('');
                          }}
                          className="flex-1 sm:flex-none px-3 py-2 h-8 sm:h-auto bg-red-400/20 border border-red-400/50 hover:bg-red-400/30 rounded text-red-400 text-[10px] sm:text-xs font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Active listing: show price + cancel button */}
                {activeListing && canCancelList && (
                  <div className="space-y-2">
                    <div className="p-2 sm:p-3 bg-green-400/5 rounded-lg border border-green-400/30">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs text-green-400/70">Listed Price:</span>
                        <span className="text-xs sm:text-sm font-mono text-green-400 font-semibold">
                          {activeListing.price} VOID
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelListing}
                      className="w-full px-3 sm:px-4 py-2 h-10 sm:h-auto rounded-lg bg-red-400/10 border-2 border-red-400/40 hover:border-red-400/70 transition-all text-red-400 font-semibold text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center"
                    >
                      ❌ Cancel Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-cyan-400/60 text-sm py-4">
              No data for this parcel
            </div>
          )}
        </section>
      ) : (
        <section className="p-5 bg-black/30 border-t border-cyan-500/20">
          <div className="text-center text-cyan-400/60 text-sm py-6">
            <div className="mb-2 text-2xl">🏢</div>
            <div className="text-cyan-400/80 font-semibold mb-1">No parcel selected</div>
            <div className="text-xs text-cyan-400/40">
              Click a building in the world to inspect its parcel
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-5 py-3 border-t border-cyan-500/20 bg-gradient-to-r from-black/60 to-cyan-950/20">
        <div className="text-xs text-cyan-400/50 text-center font-mono">
          Real estate data refreshes every 30s
        </div>
      </footer>
      
      {/* Land Upgrade Burn Confirmation Modal (Feature Flag Protected) */}
      {ENABLE_BURN_UI && showUpgradeModal && activeParcelId && BurnConfirmationModal && (
        <BurnConfirmationModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          burnAmount={UPGRADE_COSTS[nextLevel].replace(/,/g, '')}
          category={BurnCategory?.LAND_UPGRADE}
          actionName={`Upgrade Parcel ${activeParcelId} to Level ${nextLevel}`}
          spenderContract={process.env.NEXT_PUBLIC_LAND_UPGRADE_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`}
          onBurnExecute={handleUpgradeParcel}
          onSuccess={() => setShowUpgradeModal(false)}
          metadata={`parcel-${activeParcelId}-level-${nextLevel}`}
        />
      )}
    </div>
  );
}

export const RealEstatePanel = memo(RealEstatePanelComponent);
