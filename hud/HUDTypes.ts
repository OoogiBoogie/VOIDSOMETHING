// Core HUD Type Definitions

export type HubKey = 'world' | 'creator' | 'defi' | 'governance';
export type LayoutMode = 'pc' | 'mobile-lite' | 'mobile-roam';

// Tab keys for each hub
export type WorldTabKey = 'overview' | 'social' | 'events' | 'land' | 'inventory';
export type CreatorTabKey = 'directory' | 'profile' | 'launchpad' | 'incubator' | 'jobs-projects' | 'partners';
export type DeFiTabKey = 'swap' | 'pools' | 'staking' | 'treasury' | 'analytics' | 'partners';
export type GovernanceTabKey = 'overview' | 'proposals' | 'incubator-voting' | 'system-health' | 'delegations';

export type TabKey = WorldTabKey | CreatorTabKey | DeFiTabKey | GovernanceTabKey;

// Notification types
export type NotificationType = 'quest' | 'job' | 'governance' | 'defi' | 'creator' | 'social' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  cta?: {
    label: string;
    hub: HubKey;
    tab: TabKey;
    params?: Record<string, any>;
  };
  createdAt: Date;
  read: boolean;
}

// Pinned panel descriptor
export interface PinnedPanel {
  id: string;
  hub: HubKey;
  tab: TabKey;
  panelId?: string;
  label: string;
  icon?: string;
}

// User roles
export type UserRole = 'guest' | 'user' | 'creator' | 'partner' | 'dao' | 'admin';

// HUD State
export interface HUDState {
  activeHub: HubKey | null;
  activeTabs: {
    world?: WorldTabKey;
    creator?: CreatorTabKey;
    defi?: DeFiTabKey;
    governance?: GovernanceTabKey;
  };
  pinnedPanels: PinnedPanel[];
  notifications: Notification[];
  unreadCount: number;
  layoutMode: LayoutMode;
  contextualData?: ContextualData;
}

// Contextual HUD data (based on world position)
export interface ContextualData {
  parcelId?: string;
  creatorId?: string;
  projectSpaceId?: string;
  nearbyEvents?: string[];
  nearbyPlayers?: string[];
}

// HUD Actions
export interface HUDActions {
  openHub: (hub: HubKey) => void;
  closeHub: () => void;
  setActiveTab: (hub: HubKey, tab: TabKey) => void;
  pinPanel: (panel: Omit<PinnedPanel, 'id'>) => void;
  unpinPanel: (panelId: string) => void;
  pushNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setContextualData: (data: ContextualData | undefined) => void;
  navigateTo: (hub: HubKey, tab: TabKey, params?: Record<string, any>) => void;
}

// Tutorial system
export type TutorialSequence = 'onboarding' | 'creator-onboarding' | 'defi-intro' | 'governance-intro';

export interface TutorialStep {
  id: string;
  sequence: TutorialSequence;
  description: string;
  trigger: {
    type: 'hud-action' | 'world-action' | 'creator-action' | 'defi-action' | 'governance-action';
    action?: string;
    hub?: HubKey;
    tab?: TabKey;
  };
  reward?: {
    type: 'void' | 'signal' | 'xp' | 'psx' | 'create';
    amount: number;
  };
}

export interface TutorialState {
  activeSequence: TutorialSequence | null;
  currentStepIndex: number;
  completedSequences: TutorialSequence[];
  completedSteps: string[];
}

// Player XP & Gamification
export interface PlayerXp {
  totalXp: number;
  explorerXp: number;
  builderXp: number;
  operatorXp: number;
  level: number;
}

// Theme
export type ThemeMode = 'dark' | 'light';
export type FontSize = 'sm' | 'md' | 'lg';

export interface ThemeSettings {
  mode: ThemeMode;
  fontSize: FontSize;
  highContrast: boolean;
}
