/**
 * useTutorial Hook
 * Manages tutorial sequences and onboarding progress
 */

import { useState, useEffect, useCallback } from 'react';
import { tutorialService } from '@/services/tutorialService';
import type { TutorialSequence, TutorialStep } from '@/services/tutorialService';

export interface UseTutorialReturn {
  activeSequence: TutorialSequence | null;
  currentStep: TutorialStep | null;
  loading: boolean;
  startSequence: (sequenceId: string) => Promise<void>;
  completeStep: (stepId: string) => Promise<void>;
  skipSequence: () => Promise<void>;
}

export function useTutorial(userId: string | null): UseTutorialReturn {
  const [activeSequence, setActiveSequence] = useState<TutorialSequence | null>(null);
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setActiveSequence(null);
      setCurrentStep(null);
      return;
    }

    const loadActive = async () => {
      const active = await tutorialService.getActiveSequence(userId);
      setActiveSequence(active);
      if (active) {
        const progress = await tutorialService.getProgress(userId, active.id);
        if (progress.length > 0) {
          const currentStepNum = progress[0].currentStep;
          const step = active.steps.find(s => s.stepNumber === currentStepNum);
          setCurrentStep(step || null);
        }
      }
    };

    loadActive();
  }, [userId]);

  const startSequence = useCallback(async (sequenceId: string) => {
    if (!userId) return;
    setLoading(true);
    try {
      await tutorialService.startSequence(userId, sequenceId);
      const sequence = await tutorialService.getSequence(sequenceId);
      setActiveSequence(sequence);
      setCurrentStep(sequence?.steps[0] || null);
    } catch (error) {
      console.error('[useTutorial] Start error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const completeStep = useCallback(async (stepId: string) => {
    if (!userId || !activeSequence) return;
    setLoading(true);
    try {
      await tutorialService.completeStep(userId, activeSequence.id, stepId);
      
      // Refresh sequence state
      const updated = await tutorialService.getSequence(activeSequence.id);
      setActiveSequence(updated);
      
      if (updated) {
        const nextStep = updated.steps.find(s => !s.completed);
        setCurrentStep(nextStep || null);
      }
    } catch (error) {
      console.error('[useTutorial] Complete step error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, activeSequence]);

  const skipSequence = useCallback(async () => {
    if (!userId || !activeSequence) return;
    await tutorialService.skipSequence(userId, activeSequence.id);
    setActiveSequence(null);
    setCurrentStep(null);
  }, [userId, activeSequence]);

  return {
    activeSequence,
    currentStep,
    loading,
    startSequence,
    completeStep,
    skipSequence,
  };
}
