/**
 * Social Layer - Profile Adapter
 * Phase 6.4 - Mainnet-only Net Protocol profile integration
 */

import { usePlayerState } from '../../state/player/usePlayerState';

// TODO: Import when net client is available
// import { getProfileSafe, hasProfilesEnabled } from '@/lib/net/netClient';

// Temporary placeholders
const hasProfilesEnabled = () => false;
const getProfileSafe = async (_: string) => null;

export interface PlayerProfile {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  walletAddress: string;
  isVerified: boolean;
}

export class ProfileAdapter {
  private isMainnet = false;
  private cachedProfile: PlayerProfile | null = null;

  /**
   * Initialize profile adapter
   */
  init(isMainnet: boolean): void {
    this.isMainnet = isMainnet;
    console.log('[ProfileAdapter] Initialized. Mainnet:', isMainnet, 'Profiles enabled:', hasProfilesEnabled());
  }

  /**
   * Resolve profile for wallet (mainnet-only)
   */
  async resolveProfile(walletAddress: string): Promise<PlayerProfile | null> {
    // Profiles only on mainnet
    if (!this.isMainnet || !hasProfilesEnabled()) {
      console.log('[ProfileAdapter] Profiles disabled on testnet');
      return null;
    }

    try {
      const netProfile = await getProfileSafe(walletAddress) as any;
      
      if (!netProfile) {
        console.log('[ProfileAdapter] No profile found for:', walletAddress);
        return null;
      }

      // Map Net Protocol profile to PlayerProfile
      const profile: PlayerProfile = {
        id: netProfile.id || walletAddress,
        displayName: netProfile.displayName,
        avatarUrl: netProfile.avatarUrl,
        walletAddress,
        isVerified: netProfile.isVerified || false,
      };

      this.cachedProfile = profile;
      
      // Update player state with profile info
      // TODO: Add profile fields to player state
      // usePlayerState.getState().setProfile(profile);

      console.log('[ProfileAdapter] Profile resolved:', profile.displayName);
      return profile;
    } catch (error) {
      console.error('[ProfileAdapter] Failed to resolve profile:', error);
      return null;
    }
  }

  /**
   * Get cached profile
   */
  getCachedProfile(): PlayerProfile | null {
    return this.cachedProfile;
  }

  /**
   * Clear cached profile
   */
  clearCache(): void {
    this.cachedProfile = null;
  }

  /**
   * Check if profiles are enabled
   */
  areProfilesEnabled(): boolean {
    return this.isMainnet && hasProfilesEnabled();
  }
}

// Singleton instance
export const profileAdapter = new ProfileAdapter();
