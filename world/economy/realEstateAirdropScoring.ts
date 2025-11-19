/**
 * REAL ESTATE AIRDROP SCORING
 * 
 * Tracks per-wallet real estate activity for airdrop allocation.
 * Separate from global XP - this is real-estate-specific scoring.
 * 
 * Score factors:
 * - Claims (weighted by district)
 * - Listings (weighted by district)
 * - Sales as seller (weighted by volume + district)
 * - Purchases as buyer (weighted by volume + district)
 * 
 * Persisted to localStorage independently from market state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RealEstateEvent } from '@/world/economy/ownershipTypes';
import {
  calculateClaimScore,
  calculateListingScore,
  calculateSaleScore,
  calculatePurchaseScore,
} from '@/world/economy/realEstateEconomyConfig';

// ============================================================================
// TYPES
// ============================================================================

export interface RealEstateScore {
  wallet: string;
  
  // Activity counts
  claims: number;
  listings: number;
  salesAsSeller: number;
  purchasesAsBuyer: number;
  
  // Volume metrics
  totalVolumeSold: number;
  totalVolumeBought: number;
  
  // Derived airdrop score (sum of all weighted activities)
  score: number;
  
  // Last updated timestamp
  lastUpdated: number;
}

interface RealEstateAirdropScoreState {
  /** Map of wallet → score data */
  scores: Map<string, RealEstateScore>;
  
  /** Get score for a specific wallet */
  getScoreForWallet: (wallet: string) => RealEstateScore | null;
  
  /** Get top N wallets by score */
  getTopRealEstateScores: (limit: number) => RealEstateScore[];
  
  /** Apply an event to update scores */
  applyEvent: (event: RealEstateEvent) => void;
  
  /** Reset all scores (for testing) */
  resetAllScores: () => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useRealEstateAirdropScoreState = create<RealEstateAirdropScoreState>()(
  persist(
    (set, get) => ({
      scores: new Map(),
      
      getScoreForWallet: (wallet) => {
        return get().scores.get(wallet) || null;
      },
      
      getTopRealEstateScores: (limit) => {
        const allScores = Array.from(get().scores.values());
        return allScores
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      },
      
      applyEvent: (event) => {
        set((state) => {
          const newScores = new Map(state.scores);
          
          // Helper to get or create score entry
          const getOrCreate = (wallet: string): RealEstateScore => {
            const existing = newScores.get(wallet);
            if (existing) return existing;
            
            return {
              wallet,
              claims: 0,
              listings: 0,
              salesAsSeller: 0,
              purchasesAsBuyer: 0,
              totalVolumeSold: 0,
              totalVolumeBought: 0,
              score: 0,
              lastUpdated: Date.now(),
            };
          };
          
          // Process event by type
          switch (event.type) {
            case 'CLAIMED': {
              const score = getOrCreate(event.actorAddress);
              score.claims += 1;
              score.score += calculateClaimScore(event.districtId || undefined);
              score.lastUpdated = Date.now();
              newScores.set(event.actorAddress, score);
              console.log(`[AirdropScoring] ✅ ${event.actorAddress} claimed → score +${calculateClaimScore(event.districtId || undefined).toFixed(2)}`);
              break;
            }
            
            case 'LISTED': {
              const score = getOrCreate(event.actorAddress);
              score.listings += 1;
              score.score += calculateListingScore(event.districtId || undefined);
              score.lastUpdated = Date.now();
              newScores.set(event.actorAddress, score);
              console.log(`[AirdropScoring] 📝 ${event.actorAddress} listed → score +${calculateListingScore(event.districtId || undefined).toFixed(2)}`);
              break;
            }
            
            case 'CANCELED': {
              // Cancellations don't affect score (already counted the listing)
              console.log(`[AirdropScoring] ❌ ${event.actorAddress} canceled listing (no score change)`);
              break;
            }
            
            case 'SOLD': {
              const price = event.price || 0;
              
              // Award seller
              const sellerScore = getOrCreate(event.actorAddress);
              sellerScore.salesAsSeller += 1;
              sellerScore.totalVolumeSold += price;
              const sellerPoints = calculateSaleScore(price, event.districtId || undefined);
              sellerScore.score += sellerPoints;
              sellerScore.lastUpdated = Date.now();
              newScores.set(event.actorAddress, sellerScore);
              console.log(`[AirdropScoring] 💰 Seller ${event.actorAddress} sold for ${price} → score +${sellerPoints.toFixed(2)}`);
              
              // Award buyer (if present)
              if (event.counterpartyAddress) {
                const buyerScore = getOrCreate(event.counterpartyAddress);
                buyerScore.purchasesAsBuyer += 1;
                buyerScore.totalVolumeBought += price;
                const buyerPoints = calculatePurchaseScore(price, event.districtId || undefined);
                buyerScore.score += buyerPoints;
                buyerScore.lastUpdated = Date.now();
                newScores.set(event.counterpartyAddress, buyerScore);
                console.log(`[AirdropScoring] 🛒 Buyer ${event.counterpartyAddress} bought for ${price} → score +${buyerPoints.toFixed(2)}`);
              }
              break;
            }
          }
          
          return { scores: newScores };
        });
      },
      
      resetAllScores: () => {
        set({ scores: new Map() });
        console.log(`[AirdropScoring] 🔄 All scores reset`);
      },
    }),
    {
      name: 'void-real-estate-airdrop-scores',
      partialize: (state) => ({
        scores: Array.from(state.scores.entries()),
      }),
      merge: (persistedState: any, currentState) => {
        const scores = new Map<string, RealEstateScore>(persistedState?.scores || []);
        return {
          ...currentState,
          scores,
        };
      },
    }
  )
);

// ============================================================================
// HOOK FOR COMPONENTS
// ============================================================================

/**
 * Hook to get real estate airdrop score for a wallet
 */
export function useRealEstateAirdropScore(wallet?: string) {
  const getScoreForWallet = useRealEstateAirdropScoreState((s) => s.getScoreForWallet);
  
  if (!wallet) return null;
  return getScoreForWallet(wallet);
}

/**
 * Hook to get top scores (leaderboard)
 */
export function useRealEstateLeaderboard(limit: number = 10) {
  const getTopScores = useRealEstateAirdropScoreState((s) => s.getTopRealEstateScores);
  return getTopScores(limit);
}

// ============================================================================
// STANDALONE FUNCTION FOR REWARDS LISTENER
// ============================================================================

/**
 * Apply a real estate event to airdrop scores
 * Called by realEstateRewards.ts after XP is awarded
 */
export function applyRealEstateEventToScores(event: RealEstateEvent): void {
  useRealEstateAirdropScoreState.getState().applyEvent(event);
}
