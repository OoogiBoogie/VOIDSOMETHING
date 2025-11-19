/**
 * REAL ESTATE REWARDS ADAPTER
 * 
 * Thin integration layer that triggers XP + airdrop events when real estate actions occur.
 * V1: Simple event listeners, easy to remove/replace later.
 * 
 * PHASE 5.1: Integrated xpGlobalMultiplier from real estate utility system
 * 
 * Usage:
 *   import { initRealEstateRewards } from '@/world/economy/realEstateRewards';
 *   initRealEstateRewards(); // Call once on app init
 */

import { useParcelMarketState } from '@/state/parcelMarket/useParcelMarketState';
import { usePlayerState } from '@/state/player/usePlayerState';
import { applyRealEstateEventToScores } from '@/world/economy/realEstateAirdropScoring';
import { computeRealEstatePerks } from '@/world/economy/realEstateUtility';
import { REAL_ESTATE_XP_REWARDS } from '@/world/economy/realEstateEconomyConfig';

/** XP rewards for real estate actions */
const XP_REWARDS = {
  CLAIM_PARCEL: 10,
  PURCHASE_PARCEL: 25,
  LIST_PARCEL: 5,
  SELL_PARCEL: 25,
};

/** Airdrop score multipliers */
const AIRDROP_MULTIPLIERS = {
  PARCEL_SOLD: 1.5, // 1.5x score when you sell a parcel
  HIGH_VALUE_SALE: 2.0, // 2.0x score for sales over 1000 VOID
};

/**
 * Award XP to a specific wallet address with real estate multiplier applied
 * 
 * PHASE 5.1: Applies xpGlobalMultiplier from real estate utility system
 * 
 * @param walletAddress - The wallet address to award XP to
 * @param baseXP - Base XP amount before multipliers
 * @param reason - Human-readable reason for XP award
 */
function awardXPWithMultiplier(walletAddress: string, baseXP: number, reason: string) {
  // Get real estate perks for this wallet
  const perks = computeRealEstatePerks(walletAddress);
  const multiplier = perks?.xpGlobalMultiplier ?? 1.0;
  
  // Apply multiplier
  const finalXP = Math.round(baseXP * multiplier);
  
  // Award to player (if this is the active player)
  const { address: currentPlayerAddress, addXP } = usePlayerState.getState() as any;
  
  if (currentPlayerAddress?.toLowerCase() === walletAddress.toLowerCase() && typeof addXP === 'function') {
    addXP(finalXP);
    
    if (multiplier > 1.0) {
      console.log(`[RealEstateRewards] ✅ +${finalXP} XP: ${reason} (${baseXP} × ${multiplier.toFixed(2)}x real estate multiplier)`);
    } else {
      console.log(`[RealEstateRewards] ✅ +${finalXP} XP: ${reason}`);
    }
  } else {
    // Different wallet - just log
    console.log(`[RealEstateRewards] 📝 Would award +${finalXP} XP to ${walletAddress.slice(0, 6)}...: ${reason}`);
  }
}

/**
 * Award XP to the current player (legacy function for backwards compatibility)
 * 
 * NOTE: This is a placeholder implementation.
 * In production, replace with actual XP engine integration.
 */
function awardXP(amount: number, reason: string) {
  const { addXP } = usePlayerState.getState() as any;
  
  if (typeof addXP === 'function') {
    addXP(amount);
    console.log(`[RealEstateRewards] ✅ +${amount} XP: ${reason}`);
  } else {
    // Fallback: just log
    console.log(`[RealEstateRewards] 📝 Would award +${amount} XP: ${reason}`);
  }
}

/**
 * Boost airdrop score
 * 
 * NOTE: This is a placeholder implementation.
 * In production, replace with actual airdrop engine integration.
 */
function boostAirdropScore(multiplier: number, reason: string) {
  // Placeholder - actual implementation would call airdrop engine
  console.log(`[RealEstateRewards] 🎁 Airdrop score ${multiplier}x: ${reason}`);
  
  // Example future integration:
  // const { multiplyScore } = useAirdropState.getState();
  // multiplyScore(multiplier);
}

/**
 * Monitor parcel market events and trigger rewards
 * 
 * V2: Uses event log for canonical tracking (replaces state diffing)
 * Subscribes to the events array and triggers rewards for new events.
 * 
 * PHASE 5.1: Client-side only (SSR guard)
 */
export function initRealEstateRewards() {
  // SSR Guard: Only run in browser context
  if (typeof window === 'undefined') {
    console.warn('[RealEstateRewards] Skipping init in SSR context');
    return;
  }
  
  // Track last processed event ID to avoid duplicates
  let lastProcessedEventId: string | null = null;
  
  // Subscribe to store changes
  useParcelMarketState.subscribe((state: any) => {
    const events = state.events;
    
    // Process only new events
    const newEvents = lastProcessedEventId
      ? events.slice(0, events.findIndex((e: any) => e.id === lastProcessedEventId))
      : events;
    
    // Process events in chronological order (reverse since events are newest-first)
    newEvents.reverse().forEach((event: any) => {
      // Apply to airdrop scoring FIRST (before XP)
      applyRealEstateEventToScores(event);
      
      // Then award XP with multipliers
      switch (event.type) {
        case 'CLAIMED':
          awardXPWithMultiplier(
            event.actorAddress, 
            REAL_ESTATE_XP_REWARDS.CLAIM_PARCEL, 
            `Claimed parcel #${event.parcelId}`
          );
          break;
          
        case 'LISTED':
          awardXPWithMultiplier(
            event.actorAddress,
            REAL_ESTATE_XP_REWARDS.LIST_PARCEL, 
            `Listed parcel #${event.parcelId} for ${event.price} VOID`
          );
          break;
          
        case 'SOLD':
          // Seller gets XP with multiplier
          awardXPWithMultiplier(
            event.actorAddress,
            REAL_ESTATE_XP_REWARDS.SELL_PARCEL_SELLER, 
            `Sold parcel #${event.parcelId} for ${event.price} VOID`
          );
          
          // Buyer gets XP with multiplier (if tracked)
          if (event.counterpartyAddress) {
            awardXPWithMultiplier(
              event.counterpartyAddress,
              REAL_ESTATE_XP_REWARDS.SELL_PARCEL_BUYER, 
              `Purchased parcel #${event.parcelId}`
            );
          }
          break;
          
        case 'CANCELED':
          awardXPWithMultiplier(
            event.actorAddress,
            REAL_ESTATE_XP_REWARDS.CANCEL_LISTING, 
            `Canceled listing for parcel #${event.parcelId}`
          );
          break;
      }
    });
    
    // Update last processed event ID
    if (events.length > 0) {
      lastProcessedEventId = events[0].id;
    }
  });
  
  console.log('[RealEstateRewards] 🎯 Initialized real estate rewards system (event-driven)');
}

/**
 * Manual XP award for specific actions (use if auto-detection fails)
 */
export function awardRealEstateXP(action: keyof typeof XP_REWARDS, details: string) {
  const amount = XP_REWARDS[action];
  awardXP(amount, `${action}: ${details}`);
}

/**
 * Manual airdrop boost for specific actions
 */
export function boostRealEstateAirdrop(parcelId: number, salePrice: number) {
  const multiplier = salePrice >= 1000 
    ? AIRDROP_MULTIPLIERS.HIGH_VALUE_SALE 
    : AIRDROP_MULTIPLIERS.PARCEL_SOLD;
  
  boostAirdropScore(multiplier, `Parcel #${parcelId} sold for ${salePrice} VOID`);
}
