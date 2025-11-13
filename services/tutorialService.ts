/**
 * Tutorial Service
 * Handles tutorial sequence management, step tracking, and reward distribution
 */

export interface TutorialStep {
  id: string;
  sequenceId: string;
  stepNumber: number;
  title: string;
  description: string;
  type: TutorialStepType;
  config: TutorialStepConfig;
  xpReward?: number;
  frameReward?: number;
  completed: boolean;
}

export type TutorialStepType = 
  | 'tooltip' 
  | 'highlight' 
  | 'modal' 
  | 'navigation' 
  | 'action' 
  | 'wait';

export interface TutorialStepConfig {
  // For tooltip/highlight
  targetElement?: string; // CSS selector or element ID
  position?: 'top' | 'bottom' | 'left' | 'right';
  
  // For modal
  modalContent?: string;
  modalActions?: {
    label: string;
    action: 'next' | 'skip' | 'close';
  }[];
  
  // For navigation
  targetHub?: string;
  targetTab?: string;
  
  // For action
  requiredAction?: {
    type: 'click' | 'input' | 'custom';
    target?: string;
    validator?: string; // Function name to validate action
  };
  
  // For wait
  waitCondition?: {
    type: 'timer' | 'event' | 'state';
    value: any;
  };
  
  // General
  skippable?: boolean;
  dismissible?: boolean;
  autoAdvance?: boolean;
  delayMs?: number;
}

export interface TutorialSequence {
  id: string;
  name: string;
  description: string;
  category: TutorialCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: TutorialStep[];
  requirements?: {
    level?: number;
    completedSequences?: string[];
    roles?: string[];
  };
  rewards: {
    xp: number;
    frame?: number;
    achievement?: string;
  };
  status: TutorialStatus;
  progress: number; // Percentage 0-100
  startedAt?: Date;
  completedAt?: Date;
}

export type TutorialCategory = 
  | 'onboarding'
  | 'world-navigation'
  | 'creator-tools'
  | 'defi-basics'
  | 'governance'
  | 'advanced';

export type TutorialStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

export interface TutorialProgress {
  userId: string;
  sequenceId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: Date;
  lastActiveAt: Date;
}

export interface OnboardingChecklist {
  userId: string;
  items: OnboardingItem[];
  completedCount: number;
  totalCount: number;
  percentComplete: number;
}

export interface OnboardingItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  optional: boolean;
  xpReward?: number;
  linkedSequence?: string; // Tutorial sequence ID
}

class TutorialService {
  private sequences: Map<string, TutorialSequence> = new Map();
  private progress: Map<string, TutorialProgress[]> = new Map();
  private activeSequence: string | null = null;

  constructor() {
    this.initializeDefaultSequences();
  }

  /**
   * Initialize default tutorial sequences
   */
  private initializeDefaultSequences(): void {
    // Onboarding sequence
    const onboarding: TutorialSequence = {
      id: 'onboarding-basic',
      name: 'Welcome to PSX-VOID',
      description: 'Learn the basics of navigating the world',
      category: 'onboarding',
      difficulty: 'beginner',
      estimatedTime: 5,
      steps: [
        {
          id: 'step-1',
          sequenceId: 'onboarding-basic',
          stepNumber: 1,
          title: 'Welcome!',
          description: 'Welcome to PSX-VOID, a creator-owned metaverse',
          type: 'modal',
          config: {
            modalContent: 'Welcome! Let\'s get you started.',
            modalActions: [
              { label: 'Let\'s Go!', action: 'next' },
              { label: 'Skip Tutorial', action: 'skip' },
            ],
          },
          completed: false,
        },
        {
          id: 'step-2',
          sequenceId: 'onboarding-basic',
          stepNumber: 2,
          title: 'The HUD',
          description: 'Learn about the HUD interface',
          type: 'highlight',
          config: {
            targetElement: '#hud-dock',
            position: 'top',
            dismissible: false,
          },
          xpReward: 25,
          completed: false,
        },
        {
          id: 'step-3',
          sequenceId: 'onboarding-basic',
          stepNumber: 3,
          title: 'Navigation',
          description: 'Use WASD to move around',
          type: 'action',
          config: {
            requiredAction: {
              type: 'custom',
              validator: 'hasMovedPlayer',
            },
          },
          xpReward: 25,
          completed: false,
        },
      ],
      rewards: {
        xp: 100,
        frame: 50,
        achievement: 'first-steps',
      },
      status: 'not-started',
      progress: 0,
    };

    this.sequences.set(onboarding.id, onboarding);
  }

  /**
   * Get all tutorial sequences
   */
  async getSequences(filter?: {
    category?: TutorialCategory;
    status?: TutorialStatus;
    userId?: string;
  }): Promise<TutorialSequence[]> {
    // TODO: Replace with actual API call

    let sequences = Array.from(this.sequences.values());

    if (filter) {
      if (filter.category) {
        sequences = sequences.filter(s => s.category === filter.category);
      }
      if (filter.status) {
        sequences = sequences.filter(s => s.status === filter.status);
      }
    }

    return sequences;
  }

  /**
   * Get specific sequence by ID
   */
  async getSequence(sequenceId: string): Promise<TutorialSequence | null> {
    // TODO: Replace with actual API call
    return this.sequences.get(sequenceId) || null;
  }

  /**
   * Start tutorial sequence
   */
  async startSequence(userId: string, sequenceId: string): Promise<TutorialProgress> {
    // TODO: Replace with actual API call

    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      throw new Error('Tutorial sequence not found');
    }

    // Check requirements
    if (sequence.requirements) {
      // TODO: Validate requirements
    }

    const progress: TutorialProgress = {
      userId,
      sequenceId,
      currentStep: 1,
      completedSteps: [],
      startedAt: new Date(),
      lastActiveAt: new Date(),
    };

    if (!this.progress.has(userId)) {
      this.progress.set(userId, []);
    }
    this.progress.get(userId)!.push(progress);

    sequence.status = 'in-progress';
    sequence.startedAt = new Date();
    this.activeSequence = sequenceId;

    return progress;
  }

  /**
   * Get user's tutorial progress
   */
  async getProgress(userId: string, sequenceId?: string): Promise<TutorialProgress[]> {
    // TODO: Replace with actual API call

    const userProgress = this.progress.get(userId) || [];

    if (sequenceId) {
      return userProgress.filter(p => p.sequenceId === sequenceId);
    }

    return userProgress;
  }

  /**
   * Complete tutorial step
   */
  async completeStep(
    userId: string,
    sequenceId: string,
    stepId: string
  ): Promise<TutorialStep> {
    // TODO: Replace with actual API call

    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      throw new Error('Sequence not found');
    }

    const step = sequence.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    step.completed = true;

    // Update progress
    const userProgress = this.progress.get(userId)?.find(p => p.sequenceId === sequenceId);
    if (userProgress) {
      userProgress.completedSteps.push(stepId);
      userProgress.currentStep = step.stepNumber + 1;
      userProgress.lastActiveAt = new Date();
    }

    // Award rewards
    if (step.xpReward) {
      // TODO: Call gamificationService.awardXP
    }
    if (step.frameReward) {
      // TODO: Call gamificationService.awardFrame
    }

    // Check if sequence is complete
    const allComplete = sequence.steps.every(s => s.completed);
    if (allComplete) {
      await this.completeSequence(userId, sequenceId);
    }

    return step;
  }

  /**
   * Complete entire sequence
   */
  async completeSequence(userId: string, sequenceId: string): Promise<void> {
    // TODO: Replace with actual API call

    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      throw new Error('Sequence not found');
    }

    sequence.status = 'completed';
    sequence.completedAt = new Date();
    sequence.progress = 100;

    // Award sequence rewards
    // TODO: Call gamificationService for xp/frame/achievement

    this.activeSequence = null;
  }

  /**
   * Skip tutorial sequence
   */
  async skipSequence(userId: string, sequenceId: string): Promise<void> {
    // TODO: Replace with actual API call

    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      throw new Error('Sequence not found');
    }

    sequence.status = 'skipped';
    this.activeSequence = null;
  }

  /**
   * Get active tutorial for user
   */
  async getActiveSequence(userId: string): Promise<TutorialSequence | null> {
    // TODO: Replace with actual API call

    if (!this.activeSequence) {
      return null;
    }

    return this.sequences.get(this.activeSequence) || null;
  }

  /**
   * Get onboarding checklist
   */
  async getOnboardingChecklist(userId: string): Promise<OnboardingChecklist> {
    // TODO: Replace with actual API call

    const items: OnboardingItem[] = [
      {
        id: 'connect-wallet',
        label: 'Connect Wallet',
        description: 'Connect your wallet to get started',
        completed: false,
        optional: false,
        xpReward: 50,
      },
      {
        id: 'complete-tutorial',
        label: 'Complete Tutorial',
        description: 'Finish the welcome tutorial',
        completed: false,
        optional: false,
        xpReward: 100,
        linkedSequence: 'onboarding-basic',
      },
      {
        id: 'visit-parcel',
        label: 'Visit a Parcel',
        description: 'Explore a creator\'s land',
        completed: false,
        optional: false,
        xpReward: 25,
      },
      {
        id: 'join-chat',
        label: 'Send a Message',
        description: 'Say hello in global chat',
        completed: false,
        optional: false,
        xpReward: 25,
      },
      {
        id: 'claim-daily',
        label: 'Claim Daily Reward',
        description: 'Get your first daily bonus',
        completed: false,
        optional: true,
        xpReward: 50,
      },
    ];

    const completedCount = items.filter(i => i.completed).length;

    return {
      userId,
      items,
      completedCount,
      totalCount: items.length,
      percentComplete: Math.floor((completedCount / items.length) * 100),
    };
  }

  /**
   * Update onboarding checklist item
   */
  async updateChecklistItem(userId: string, itemId: string, completed: boolean): Promise<void> {
    // TODO: Replace with actual API call
    console.log(`[Tutorial] Checklist item ${itemId} for ${userId}: ${completed}`);
  }

  /**
   * Reset tutorial progress (for testing)
   */
  async resetProgress(userId: string, sequenceId?: string): Promise<void> {
    // TODO: Replace with actual API call

    if (sequenceId) {
      const userProgress = this.progress.get(userId);
      if (userProgress) {
        const index = userProgress.findIndex(p => p.sequenceId === sequenceId);
        if (index > -1) {
          userProgress.splice(index, 1);
        }
      }

      const sequence = this.sequences.get(sequenceId);
      if (sequence) {
        sequence.status = 'not-started';
        sequence.progress = 0;
        sequence.startedAt = undefined;
        sequence.completedAt = undefined;
        sequence.steps.forEach(s => s.completed = false);
      }
    } else {
      this.progress.delete(userId);
    }
  }
}

// Export singleton instance
export const tutorialService = new TutorialService();
