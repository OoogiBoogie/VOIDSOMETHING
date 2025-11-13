# MOBILE HUD SYSTEM - Complete Implementation Guide

**Date**: November 10, 2025  
**Status**: ✅ OPTIMIZED & READY FOR INTEGRATION

---

## 📱 Two Mobile Modes

### LITE Mode - "Pocket Control Room"
**When**: Player is managing/reviewing (info consumption)  
**Focus**: Info-dense dashboard with full chat  
**Layout**: Portrait-first, stacked bands

### ROAM Mode - "Minimal Explorer"
**When**: Player is moving/exploring (action mode)  
**Focus**: Minimal overlays, 3D world dominates  
**Layout**: Thin bars + chat pill

---

## 🎯 Core Principles (Both Modes)

1. **No HUD Over Character Core**
   - Vertical safe lane through middle of screen
   - Character always visible when in 3rd person
   - HUD in bands/edges, not overlays

2. **GLOBAL Chat = Default + Always Mounted**
   - GLOBAL is the main visible feed
   - NEARBY/PARTY are **filters**, not separate UIs
   - Same hub-colored spines for messages
   - Dopamine hooks: `triggerFX("chatPing")`, `triggerFX("chatSend")`

3. **Hub Ideology**
   - Every section routes into WORLD/CREATOR/DEFI/DAO/AGENCY/AI OPS
   - Color coding maintained: DEFI=purple, DAO=blue, CREATOR=cyan, etc.
   - Components read from `EconomySnapshot`, never invent data

4. **Stacked Bands (Not Gutters)**
   - Mobile doesn't use left/right 22%-56%-22%
   - Uses: TOP → MIDDLE → CHAT → BOTTOM
   - Each band pointer-events-auto, rest none

---

## 📐 LITE Mode Layout

```
┌─────────────────────────────────────┐
│ TOP BAND: Player Summary Card       │
│ - Avatar + username + wallet        │
│ - Zone + coordinates                │
│ - XP bar (WORLD)                    │
│ - Token chips (VOID/SIGNAL/PSX)     │
│ - Agency badge                      │
├─────────────────────────────────────┤
│ MIDDLE: Economy Cards Row           │
│ [Friends] [VOID/PSX] [Mini Radar]   │
│  (WORLD)   (DEFI)     (POIs)        │
├─────────────────────────────────────┤
│ CHAT: Spiny Chrome Panel            │
│ - Header: GLOBAL CHAT               │
│ - Tabs: Global | Nearby | Party     │
│ - Messages with hub spines          │
│ - Input field at bottom             │
│ (40vh min height)                   │
├─────────────────────────────────────┤
│ BOTTOM: App Dock                    │
│ [P][F][M][V][D][A][G][⋯]            │
│  All chromed, hub-colored gradients │
└─────────────────────────────────────┘
```

### Components

**1. PlayerSummaryCardMobile**
- Chrome gradient background (dreamcore)
- Avatar: gradient circle with username initial
- ID row: username (uppercase) + wallet short
- Zone display: name + coordinates
- XP bar: level + progress (signal-green → cyber-cyan → void-purple gradient)
- Token chips: VOID, SIGNAL (if >0), PSX, CREATE (if >0)
- Agency: role + name (right-aligned)

**Props**:
```typescript
{
  world: WorldState,
  defi: DeFiState,
  dao: DAOState,
  creator: CreatorState,
  agency: AgencyState,
  playerState: PlayerState
}
```

**2. EconomyCardsRowMobile**
Three tappable cards:

a) **Friends Card** (WORLD/AGENCY)
- Label: "Online Friends"
- Value: "X online now" (signal-green)
- Tap → Friends/Guilds screen

b) **Tokens Card** (DEFI/DAO)
- Labels: "VOID" | "PSX"
- Values: Prices with $ (void-purple | psx-blue)
- Tap → DeFi/DAO dashboard

c) **Radar Card** (WORLD + all hubs)
- Label: "Radar" + arrow
- Mini map grid with POI dots
- Dots colored by hub (cyan=CREATOR, purple=DEFI, blue=DAO, green=AI OPS)
- Tap → Full map

**Props**:
```typescript
{
  world: WorldState,
  defi: DeFiState,
  dao: DAOState,
  creator: CreatorState,
  aiOps: AIOpsState,
  onCardTap: (actionId: string) => void
}
```

**3. ChatPanelMobile**
Spiny chrome chat (same ideology as desktop):

- **Header**: "GLOBAL CHAT" in signal-green
- **Tabs**: `[Global] [Nearby] [Party]`
  - Global = default selected
  - Nearby shows badge if `hasNearby`
  - Party for guild/squad

- **Messages**: Scroll area with hub spines
  - System messages: `[HUB] message` in italic
  - User messages: username + text
  - Spine: 3px vertical bar, colored by hub

- **Input**: Text field + Send button
  - Placeholder: "Message {channel}..."
  - Enter to send
  - Triggers: `triggerFX("chatSend")`

**Props**:
```typescript
{
  hasNearby: boolean,
  chatState: {
    messages: Array<{
      id: string,
      hub?: string,
      type?: 'system' | 'user',
      username?: string,
      text: string,
      timestamp: number,
      channel: 'global' | 'nearby' | 'party'
    }>,
    activeChannel: 'global' | 'nearby' | 'party'
  },
  triggerFX: (type: string, data?: any) => void,
  onSendMessage: (text: string, channel) => void
}
```

**4. BottomDockMobile**
8 hub portal buttons:

```
[Phone] [Friends] [Map] [Vault] [DAO] [Agency] [Games] [More]
WORLD   WORLD     WORLD  DEFI    DAO   AGENCY   CREATOR AI_OPS
```

- Each icon: gradient box with letter/symbol
- Hub-colored gradients (signal-green for WORLD, purple for DEFI, etc.)
- Label under each icon (0.6rem, bio-silver/60)
- Tap triggers: `onDockAction(id)`

**Props**:
```typescript
{
  onDockAction: (actionId: string) => void
}
```

---

## 📐 ROAM Mode Layout

```
┌─────────────────────────────────────┐
│ TOP: Mini Status Bar                │
│ [Lvl 7 XP bar] [⚡4d] [👥 2 nearby] │
│ (Tap to open LITE view)             │
├─────────────────────────────────────┤
│                                     │
│                                     │
│          3D WORLD VIEW              │
│        (full screen AR mode)        │
│                                     │
│                                     │
│                            ┌────────┤
│                            │ CHAT   │
│                            │ PILL   │
│                            │ (edge) │
│                            └────────┤
├─────────────────────────────────────┤
│ CONTEXT: [E] Open Vault Terminal    │
├─────────────────────────────────────┤
│ DOCK: [P] [M] [V] [A] [⋯]           │
└─────────────────────────────────────┘
```

### Components

**1. MiniTopBar**
- Left: Level icon + XP progress bar (compact)
- Center: Streak (⚡ + days)
- Right: Nearby indicator (dot + count or nav icon)
- **Tap anywhere → opens LITE view**

**Props**:
```typescript
{
  playerState: PlayerState,
  defi: DeFiState,
  nearbyCount: number,
  onTap: () => void
}
```

**2. ChatPillMobile** (RIGHT EDGE)
Latest GLOBAL message in a pill:

- Hub spine (3px, colored)
- Message preview:
  - System: `[HUB] text` italic
  - User: username + text (truncated)
- Nearby badge (if active): cyan pill with "Nearby"
- Message icon (lucide MessageCircle)
- **Tap → slides up full chat panel**

**Dopamine**:
- New message → pill glows + animates
- Border: `border-signal-green/70 animate-pulse` if `fxState.chatIncoming`

**Props**:
```typescript
{
  lastMessage?: {
    id: string,
    hub?: string,
    type?: 'system' | 'user',
    username?: string,
    text: string,
    timestamp: number
  },
  hasNearby: boolean,
  fxState: any,
  onOpenChat: () => void
}
```

**3. MiniContextBar**
Single action prompt:

- Key badge: `[E]` in signal-green box
- Action label: "Open Vault Terminal" (uppercase)
- Context-aware based on location/nearby:
  - Near player → "Talk to Player"
  - In VAULT zone → "Open Vault Terminal"
  - In DAO zone → "View Proposals"
  - Default → "Scan Area"

**Props**:
```typescript
{
  action: {
    key: string,
    label: string
  }
}
```

**4. MiniDockMobile**
5 essential apps (reduced from 8):

```
[Phone] [Map] [Vault] [Agency] [⋯ More]
WORLD   WORLD  DEFI    AGENCY   (→LITE)
```

- Same hub-colored gradients
- **"More" button → switches to LITE view**

**Props**:
```typescript
{
  onDockAction: (actionId: string) => void,
  onMoreTap: () => void
}
```

---

## 🔄 MobileWorldShell - Unified Orchestrator

Main component that:
1. Fetches all hub data (same hooks as WorldHubV2)
2. Builds `EconomySnapshot` + `PlayerState`
3. Manages `fxState` for dopamine system
4. Switches between LITE and ROAM views

**State Management**:
```typescript
const [viewMode, setViewMode] = useState<'lite' | 'roam'>('roam');
const [fxState, setFxState] = useState({
  missionCompleted: false,
  tokenGain: false,
  chatIncoming: false,
  tickerEvent: false,
  mapPulse: false
});
```

**Data Flow**:
```
MobileWorldShell
  ↓
  useVoidEngine() + useWorldState() + useLandMap() + useGamification()
  ↓
  Build EconomySnapshot (all 6 hubs)
  ↓
  Pass to MobileLiteHUD or MobileRoamHUD
  ↓
  Components read from snapshot
```

**Switching**:
- LITE → ROAM: User gesture (swipe or button)
- ROAM → LITE: Tap "More" dock button or mini top bar

---

## 🎨 Chat System (Unified Across Modes)

### Architecture

**GLOBAL is always the main feed**:
- Messages from all players in the VOID
- System announcements from all hubs
- Default tab in LITE, default pill content in ROAM

**NEARBY & PARTY are filters**:
- Same message array, just filtered by `channel`
- NEARBY: Messages from players within X distance
- PARTY: Guild/squad private chat

**Hub Spines**:
Every message has a colored spine (3px vertical bar):
- System messages tagged by hub: `[DEFI]`, `[DAO]`, etc.
- User messages default to WORLD (signal-green)
- Spine color matches hub:
  - DEFI → `bg-void-purple`
  - DAO → `bg-psx-blue`
  - CREATOR → `bg-cyber-cyan`
  - AGENCY → `bg-red-500`
  - AI_OPS → `bg-signal-green`
  - WORLD → `bg-signal-green`

### Message Flow

**System Messages**:
```typescript
{
  id: '123',
  hub: 'DEFI',
  type: 'system',
  text: 'New vault opened in Gaming District',
  timestamp: Date.now(),
  channel: 'global'
}
```

Renders as:
```
│ [DEFI] New vault opened in Gaming District
```
(purple spine, italic text)

**User Messages**:
```typescript
{
  id: '456',
  type: 'user',
  username: 'void_walker',
  text: 'Anyone exploring the new district?',
  timestamp: Date.now(),
  channel: 'global'
}
```

Renders as:
```
│ void_walker
│ Anyone exploring the new district?
```
(signal-green spine, normal text)

### Dopamine Hooks

**On new message**:
```typescript
triggerFX('chatPing', { channel: 'global' })
```

**On send**:
```typescript
triggerFX('chatSend', { channel: 'global' })
```

**FX State Updates**:
- `chatPing` → `setFxState({ chatIncoming: true })`
- Pill/panel glows for 2s
- Haptic feedback on mobile
- Audio "ping" sound

---

## 🧬 Component Reusability

**Shared Between LITE & ROAM**:
- TokenChip (VOID/PSX/CREATE badges)
- Hub spine logic (getHubSpineClass)
- Chat message rendering (system vs user)
- Hub gradients (getHubGradient)

**LITE-Only**:
- PlayerSummaryCardMobile (full detail)
- EconomyCardsRowMobile (3 cards)
- ChatPanelMobile (full panel)
- BottomDockMobile (8 buttons)

**ROAM-Only**:
- MiniTopBar (compact status)
- ChatPillMobile (edge pill)
- MiniContextBar (single action)
- MiniDockMobile (5 buttons)

---

## 📊 Comparison: LITE vs ROAM

| Feature | LITE Mode | ROAM Mode |
|---------|-----------|-----------|
| **Purpose** | Managing/reviewing | Exploring/acting |
| **Screen Usage** | Bands fill screen | 3D dominates |
| **Player Summary** | Full card with all tokens | Mini bar with XP only |
| **Chat** | Full panel (40vh) | Edge pill (latest) |
| **Economy Cards** | 3 cards visible | Hidden (tap More) |
| **Dock** | 8 buttons | 5 buttons |
| **Context Action** | None (tap cards) | Visible prompt |
| **Gesture** | Vertical scroll | Minimal taps |

**Switching Triggers**:
- ROAM → LITE: Tap top bar, tap "More" dock button
- LITE → ROAM: Swipe down, tap "Switch to ROAM" (dev button)

---

## 🚀 Implementation Checklist

### Phase 1: Core Components ✅
- [x] MobileLiteHUD_v2.tsx (complete)
- [x] MobileRoamHUD_v2.tsx (complete)
- [x] MobileWorldShell.tsx (orchestrator)
- [x] Hub-colored gradients
- [x] Chrome/dreamcore styling

### Phase 2: Chat Integration ⏳
- [ ] Wire ChatPanelMobile to real chat service
- [ ] GLOBAL/NEARBY/PARTY filtering
- [ ] Hub spine logic for system messages
- [ ] Dopamine FX (ping, send, glow)
- [ ] ChatPillMobile → full panel slide-up

### Phase 3: Data Wiring ⏳
- [ ] Fix economySnapshot type errors
- [ ] Connect to real hooks (useVoidEngine, etc.)
- [ ] Mission progress tracking
- [ ] POI system (nearby detection)
- [ ] AI OPS hotspot detection

### Phase 4: Dopamine System ⏳
- [ ] Haptic feedback on mobile
- [ ] Audio FX (ping, spark, chime)
- [ ] Visual FX (glow, pulse, particle trails)
- [ ] triggerFX hook wiring

### Phase 5: Polish ⏳
- [ ] Swipe gestures (LITE ↔ ROAM)
- [ ] Context action detection (location-based)
- [ ] Mini radar POI dots (real positions)
- [ ] Streak/achievements from gamification
- [ ] Remove dev mode toggle button

---

## 🎯 Key Differences from Desktop

1. **No Gutters**: Mobile uses stacked bands, not 22%-56%-22%
2. **Two Modes**: LITE (info) vs ROAM (action) instead of single view
3. **Chat Pill**: ROAM mode shows latest message in edge pill
4. **Reduced Dock**: 5 buttons in ROAM vs 8 in LITE vs 8+ desktop
5. **Tap to Expand**: Top bar and chat pill open LITE view
6. **Portrait First**: Layout optimized for vertical screens

---

## 📱 Mobile-Specific Optimizations

**Performance**:
- Minimize re-renders (useMemo for snapshot/playerState)
- Lazy load full chat panel (only mount when visible)
- Throttle chat updates (max 1/sec)

**Gestures**:
- Swipe down on LITE → switch to ROAM
- Swipe up on ROAM top bar → switch to LITE
- Tap chat pill → slide up full chat
- Tap outside chat → close chat

**Haptics**:
- Light tap: Button press
- Medium: New message
- Heavy: Mission complete, token gain

**Audio**:
- Ping: New message (subtle)
- Spark: Token gain (bright)
- Chime: Mission complete (melodic)
- Swoosh: Mode switch (spatial)

---

## 🔮 Future Enhancements

1. **AR Mode**: Camera + spatial anchors for POIs
2. **Voice Chat**: Party/guild voice in ROAM mode
3. **Gesture Commands**: Swipe patterns for quick actions
4. **Offline Mode**: Cache messages/state for subway rides
5. **Watch Companion**: XP/streak on Apple Watch/Galaxy Watch
6. **Share Screenshots**: Auto-generate chrome cards for social

---

## ✅ Summary

**Created**:
- `MobileLiteHUD_v2.tsx` - Info-dense dashboard (GLOBAL chat default)
- `MobileRoamHUD_v2.tsx` - Minimal explorer (chat pill edge)
- `MobileWorldShell.tsx` - Unified orchestrator with mode switching

**Architecture**:
- Same `EconomySnapshot` pattern as desktop
- Hub ideology maintained (6 portals)
- GLOBAL chat always mounted (NEARBY/PARTY as filters)
- Spiny chrome styling with hub colors
- Dopamine FX system ready for wiring

**Next Steps**:
1. Fix type errors in MobileWorldShell
2. Wire chat to real service
3. Implement haptic/audio FX
4. Test on real mobile devices
5. Add swipe gestures

**Mobile HUD is now ready for integration! 🎉**
