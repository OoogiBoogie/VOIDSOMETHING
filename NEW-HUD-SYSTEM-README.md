# 🎮 VOID HUD System v2.0 - Complete Rebuild

## Overview

The new HUD system is a complete rewrite of the user interface layer, providing a unified control surface for the entire PSX–VOID–AGENCY ecosystem across **WORLD**, **CREATORS**, **DEFI**, and **GOVERNANCE** hubs.

## 🏗️ Architecture

### Core Files

```
/hud
├── HUDRoot.tsx          # Main HUD container with layout detection
├── HUDContext.tsx       # Global HUD state management
├── HUDTypes.ts          # TypeScript definitions
├── useHUD.ts            # Custom hooks
│
├── /layout              # Responsive layouts
│   ├── PCLayout.tsx           # Desktop with dock + side panel
│   ├── MobileLiteLayout.tsx   # Mobile with bottom nav
│   └── MobileRoamLayout.tsx   # Mobile in-world minimal HUD
│
├── /components          # Shared HUD components
│   ├── HUDDock.tsx           # Bottom dock (4 hub icons)
│   ├── HUDPanel.tsx          # Side panel container
│   ├── HUDTabBar.tsx         # Mobile bottom navigation
│   ├── PinBar.tsx            # Pinned panel quick access
│   ├── ContextualHUD.tsx     # Location-aware prompts
│   ├── NotificationCenter.tsx # Global notifications
│   ├── RoleGate.tsx          # Permission-based rendering
│   ├── TutorialOverlay.tsx   # Onboarding system
│   └── CommandPalette.tsx    # Cmd+K search
│
└── /categories          # Hub implementations
    ├── /WorldHub
    │   └── WorldHubRoot.tsx
    ├── /CreatorHub
    │   └── CreatorHubRoot.tsx
    ├── /DeFiHub
    │   └── DeFiHubRoot.tsx
    └── /GovernanceHub
        └── GovernanceHubRoot.tsx
```

## 🎯 Features

### 1. Multi-Hub System

Four main hubs accessible via bottom dock (PC) or bottom nav (mobile):

- **WORLD** (W key) - Metaverse, social, events, land, inventory
- **CREATORS** (C key) - Directory, profiles, launchpad, jobs, incubator  
- **DEFI** (D key) - Swap, pools, staking, treasury, analytics
- **GOVERNANCE** (G key) - Proposals, voting, system health

### 2. Responsive Layouts

#### PC Mode
- Bottom dock with 4 hub icons
- Side panel (600px) slides in from right
- Hotkey support (W, C, D, G, ESC)
- Pinned panels in top-left
- 3D world always visible in background

#### Mobile LITE
- Full-screen hub views
- Bottom tab bar navigation  
- Optimized touch targets
- Auto-switches from ROAM for complex flows

#### Mobile ROAM
- Minimal overlay (map, quests, notifications)
- Floating HUD button → radial menu
- Full 3D world interaction
- Switches to LITE when opening hubs

### 3. Cross-Cutting Features

#### Pin System
- Pin any panel for quick access
- Appears in top-left corner
- One-click navigation
- Persists to localStorage

#### Contextual HUD
- Shows relevant actions based on world location
- "You're on Creator X's land" → View Profile / See Jobs
- "Nearby Event" → Join Event
- "Project Space" → Open Project

#### Notification Center
- Bell icon (top-right) with unread badge
- Categorized by type (quest, job, governance, defi, creator, social)
- Click-to-action routing
- Mark all read support

#### Tutorial System
- Guided onboarding sequences
- Step-by-step with rewards (Frame/XP)
- Visual progress tracking
- Skippable with completion tracking

#### Command Palette (Ctrl+K)
- Global search across ecosystem
- Find creators, tokens, jobs, land, proposals
- Keyboard navigation (↑↓ Enter Esc)
- Instant routing to results

### 4. Role-Based Access

Using `<RoleGate roles={['creator', 'partner']}>`  components can be hidden/shown based on user permissions:

- Guest
- User
- Creator
- Partner  
- DAO
- Admin

## 📱 Usage

### Integration

```tsx
import { HUDRoot } from '@/hud/HUDRoot';

export default function App() {
  return (
    <HUDRoot>
      {/* Your 3D world / main content */}
      <Canvas>
        <Scene3D />
      </Canvas>
    </HUDRoot>
  );
}
```

### Accessing HUD State

```tsx
import { useHUD } from '@/hud/HUDContext';

function MyComponent() {
  const { state, actions } = useHUD();

  return (
    <button onClick={() => actions.openHub('world')}>
      Open World Hub
    </button>
  );
}
```

### Making Panels Pinable

```tsx
import { usePinablePanel } from '@/hud/useHUD';

function MyPanel() {
  const { pin, unpin, isPinned } = usePinablePanel({
    hub: 'creator',
    tab: 'profile',
    panelId: creatorId,
    label: 'Creator XYZ',
    icon: '🎨',
  });

  return (
    <button onClick={pin}>
      {isPinned ? 'Unpin' : 'Pin'} Panel
    </button>
  );
}
```

### Sending Notifications

```tsx
import { useHUD } from '@/hud/HUDContext';

function SomeService() {
  const { actions } = useHUD();

  const notifyQuestComplete = () => {
    actions.pushNotification({
      type: 'quest',
      title: 'Quest Complete!',
      body: 'You earned 50 Frame tokens',
      cta: {
        label: 'Claim Reward',
        hub: 'world',
        tab: 'overview',
        params: { questId: '123' },
      },
    });
  };
}
```

### Role Gating

```tsx
import { RoleGate } from '@/hud/components/RoleGate';

function AdminPanel() {
  return (
    <RoleGate roles={['admin', 'dao']} fallback={<p>Access denied</p>}>
      <AdminDashboard />
    </RoleGate>
  );
}
```

## 🎨 Design System

### Colors
- Primary: `#00FFA6` (neon mint)
- Secondary: `#442366` (deep purple)
- Background: `rgba(10, 10, 25, 0.75-0.95)`
- Borders: `rgba(0, 255, 166, 0.2-0.3)`

### Typography
- Titles: `Orbitron`
- Body: `Inter`
- Numbers/Code: `Mono`

### Components
- Glass morphism: `backdrop-blur-lg` + `bg-[rgba(10,10,25,0.95)]`
- Borders: 1-2px with glow effect
- Transitions: 150-200ms smooth
- Rounded corners: 8-16px

## 🚀 Next Steps

### Phase 1: Core Hubs ✅
- [x] HUD architecture
- [x] Layout system  
- [x] Shared components
- [x] Hub placeholders

### Phase 2: Service Layer
- [ ] Auth service
- [ ] World/Land service
- [ ] Creator service  
- [ ] Jobs service
- [ ] DeFi service
- [ ] Governance service
- [ ] Analytics service

### Phase 3: Data Hooks
- [ ] `useWorldState`
- [ ] `useLandData`
- [ ] `useCreatorData`
- [ ] `useJobsData`
- [ ] `useDeFiData`
- [ ] `useGovernanceData`

### Phase 4: Hub Implementation
- [ ] World Hub (tabs + panels)
- [ ] Creator Hub (tabs + panels)
- [ ] DeFi Hub (tabs + panels)
- [ ] Governance Hub (tabs + panels)

### Phase 5: Polish
- [ ] Command palette search integration
- [ ] Theme system (dark/light/high contrast)
- [ ] Accessibility (keyboard nav, screen readers)
- [ ] Performance optimization
- [ ] Mobile gestures

## 🔌 Service Integration Points

The HUD will connect to these backend services (to be implemented):

```
/services
├── authService.ts        # Wallet, roles, permissions
├── worldService.ts       # Player state, chat, parties
├── landService.ts        # Parcels, ownership, marketplace
├── creatorService.ts     # Registry, profiles, tokens
├── byotService.ts        # BYOT mapping, world uses
├── jobsService.ts        # Jobs, projects, applications
├── defiService.ts        # Swap, pools, staking
├── governanceService.ts  # Proposals, voting
├── gamificationService.ts # XP, quests, achievements
├── analyticsService.ts   # KPIs, metrics
├── partnerService.ts     # Partner registry, stats
└── notificationService.ts # Push notifications
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `W` | Open World Hub |
| `C` | Open Creator Hub |
| `D` | Open DeFi Hub |
| `G` | Open Governance Hub |
| `Esc` | Close active hub |
| `Ctrl+K` / `Cmd+K` | Command palette |

## 🐛 Known Issues

- TypeScript may show import errors on first build (restart TS server to fix)
- Mobile ROAM ↔ LITE transitions need refinement
- Command palette search needs backend integration
- Tutorial system needs gamification service connection

## 📝 Notes

- **Do NOT modify 3D world mechanics** - This HUD is purely UI layer
- Mobile ROAM mode preserves existing mobile controls
- All hub content is placeholder - needs real data integration
- Pin system persists to localStorage only (consider user profile later)
- Notification system is client-side only (needs WebSocket for real-time)

---

**Version**: 2.0.0  
**Status**: Core architecture complete, ready for hub implementation  
**Last Updated**: 2025-11-10
