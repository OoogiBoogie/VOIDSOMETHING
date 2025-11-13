/**
 * HOOK: useScoreEvents
 * XP event engine - triggers score increases for all user actions
 * Integrates with useVoidScore for live/mock mode
 */

import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useVoidScore } from '@/hooks/useVoidScore';
import { SCORE_EVENTS, type ScoreEventType } from '@/lib/score/scoreEvents';
import { shouldUseMockData } from '@/config/voidConfig';
import { emitVoidEvent } from '@/lib/events/voidEvents';

export function useScoreEvents() {
  const { address } = useAccount();
  const { voidScore, refresh } = useVoidScore();

  /**
   * Grant XP for any event type
   */
  const grantXP = useCallback(
    async (eventType: ScoreEventType, metadata?: any) => {
      if (!address) {
        console.warn('[useScoreEvents] No address connected');
        return;
      }

      const event = SCORE_EVENTS[eventType];
      if (!event) {
        console.error('[useScoreEvents] Unknown event type:', eventType);
        return;
      }

      console.log(
        `[useScoreEvents] Granting ${event.xpReward} XP for ${event.description}`,
        { address, eventType, metadata }
      );

      // Emit event for tracking/analytics
      emitVoidEvent({
        type: 'SCORE_EVENT',
        address,
        payload: {
          eventType,
          xpReward: event.xpReward,
          description: event.description,
          metadata,
        },
      });

      if (shouldUseMockData()) {
        // Mock mode: Local state update happens via event emission
        // The voidScore hook will pick up changes on next render
        console.log('[useScoreEvents] Mock mode: XP event emitted');
        
        // TODO: In mock mode, we could update localStorage here
        // For now, just emit the event
        
        // Refresh score to show changes
        setTimeout(() => refresh(), 100);
      } else {
        // Live mode: Call VoidScore contract
        try {
          // TODO: Replace with actual contract call when deployed
          // const voidScoreContract = new ethers.Contract(CONTRACTS.VoidScore, ABI, signer);
          // const tx = await voidScoreContract.addScore(address, event.xpReward);
          // await tx.wait();
          
          console.log('[useScoreEvents] Live mode: Contract call would happen here');
          
          // Refresh after contract update
          refresh();
        } catch (error) {
          console.error('[useScoreEvents] Failed to grant XP:', error);
        }
      }
    },
    [address, refresh]
  );

  // ================================
  // CONVENIENCE FUNCTIONS
  // ================================

  const sendMessageXP = useCallback(() => {
    return grantXP('MESSAGE_GLOBAL');
  }, [grantXP]);

  const sendDMXP = useCallback(() => {
    return grantXP('MESSAGE_DM');
  }, [grantXP]);

  const firstDailyMessageXP = useCallback(() => {
    return grantXP('MESSAGE_FIRST_DAILY');
  }, [grantXP]);

  const joinGuildXP = useCallback((guildId: string) => {
    return grantXP('GUILD_JOINED', { guildId });
  }, [grantXP]);

  const inviteAcceptedXP = useCallback((invitedAddress: string) => {
    return grantXP('INVITE_ACCEPTED', { invitedAddress });
  }, [grantXP]);

  const applyGigXP = useCallback((gigId: string) => {
    return grantXP('GIG_APPLIED', { gigId });
  }, [grantXP]);

  const completeGigXP = useCallback((gigId: string) => {
    return grantXP('GIG_COMPLETED', { gigId });
  }, [grantXP]);

  const stakeVOIDXP = useCallback((amount: string) => {
    return grantXP('STAKE_VOID', { amount });
  }, [grantXP]);

  const xvoid7DayHoldXP = useCallback(() => {
    return grantXP('XVOID_7DAY_HOLD');
  }, [grantXP]);

  const stakingWeeklyBonusXP = useCallback(() => {
    return grantXP('STAKING_WEEKLY_BONUS');
  }, [grantXP]);

  const zoneVisitXP = useCallback((zoneId: string) => {
    return grantXP('ZONE_VISITED', { zoneId });
  }, [grantXP]);

  const districtUnlockedXP = useCallback((districtId: string) => {
    return grantXP('DISTRICT_UNLOCKED', { districtId });
  }, [grantXP]);

  const contentPostedXP = useCallback((contentId: string) => {
    return grantXP('CONTENT_POSTED', { contentId });
  }, [grantXP]);

  const creatorQuestCompletedXP = useCallback((questId: string) => {
    return grantXP('CREATOR_QUEST_COMPLETED', { questId });
  }, [grantXP]);

  const onboardingCompletedXP = useCallback(() => {
    return grantXP('ONBOARDING_COMPLETED');
  }, [grantXP]);

  return {
    // Core function
    grantXP,
    
    // Messaging
    sendMessageXP,
    sendDMXP,
    firstDailyMessageXP,
    
    // Social
    joinGuildXP,
    inviteAcceptedXP,
    
    // Agency
    applyGigXP,
    completeGigXP,
    
    // Economy
    stakeVOIDXP,
    xvoid7DayHoldXP,
    stakingWeeklyBonusXP,
    
    // Exploration
    zoneVisitXP,
    districtUnlockedXP,
    
    // Creator
    contentPostedXP,
    creatorQuestCompletedXP,
    
    // Identity
    onboardingCompletedXP,
  };
}
