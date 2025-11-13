# VOID HUD SYSTEM - COMPLETE TECHNICAL REFERENCE V4.7

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Desktop HUD Components](#desktop-hud-components)
3. [Mobile HUD Components](#mobile-hud-components)
4. [VoidRuntime Integration](#voidruntime-integration)
5. [MiniApp System](#miniapp-system)
6. [Data Flow & State Management](#data-flow--state-management)
7. [Integration Points](#integration-points)
8. [Code Review Checklist](#code-review-checklist)

---

## Architecture Overview

### HUD System Hierarchy

```
VoidGameShell (Root)
├─── WalletGate (Auth Guard)
├─── VoidRuntimeProvider (State)
├─── MiniAppManagerProvider (MiniApps)
└─── HUD Layer
     ├─── Desktop: VoidHudApp
     │    ├─── Header (Top Bar)
     │    ├─── LeftPanel (Navigation)
     │    ├─── RightPanel (Activity Feed)
     │    ├─── BottomDock (Quick Actions)
     │    └─── Panels (Modals)
     │
     └─── Mobile: MobileHudShell
          ├─── MobileLiteHUD (Portrait)
          └─── MobileRoamHUD (Landscape)
```

### File Structure

```
components/
├─── game/
│    └─── VoidGameShell.tsx           # Main game container
├─── auth/
│    └─── WalletGate.tsx              # Wallet authentication guard
└─── providers/
     └─── root-providers.tsx          # App-level providers

src/
├─── runtime/
│    └─── VoidRuntimeProvider.tsx    # Runtime state aggregator
├─── net/
│    ├─── types.ts                   # Net Protocol types + ABI
│    └─── NetProtocolClient.ts       # On-chain profile client
└─── miniapps/
     ├─── types.ts                   # MiniApp types
     ├─── miniapps.registry.ts       # App registry
     ├─── MiniAppManager.tsx         # Context provider
     ├─── MiniAppContainer.tsx       # Renderer
     ├─── MiniAppDock.tsx            # Launcher UI
     └─── apps/                      # Internal apps
          ├─── VoidDexApp.tsx
          ├─── SocialHubApp.tsx
          ├─── LandManagerApp.tsx
          └─── ProfileManagerApp.tsx

hud/
├─── VoidHudApp.tsx                  # Desktop HUD root
├─── header/
│    ├─── HUDHeader.tsx              # Top bar
│    ├─── PlayerChipV2.tsx           # Profile chip
│    └─── TickerFeed.tsx             # News ticker
├─── left/
│    ├─── LeftPanel.tsx              # Navigation sidebar
│    └─── NavButton.tsx              # Nav items
├─── right/
│    ├─── RightPanel.tsx             # Activity feed
│    └─── ActivityCard.tsx           # Feed items
├─── bottom/
│    └─── BottomDock.tsx             # Quick actions
├─── panels/
│    ├─── WalletPanel.tsx            # Wallet modal
│    ├─── QuestsPanel.tsx            # Missions modal
│    ├─── LeaderboardPanel.tsx       # Rankings modal
│    └─── SettingsPanel.tsx          # Settings modal
└─── mobile/
     ├─── MobileHudShell.tsx         # Orientation detector
     ├─── MobileLiteHUD_v2.tsx       # Portrait mode
     └─── MobileRoamHUD_v2.tsx       # Landscape mode
```

---

## Desktop HUD Components

### 1. VoidHudApp (Desktop Root)

**File:** `hud/VoidHudApp.tsx`

**Layout:**
```
┌─────────────────────────────────────────────┐
│ HEADER (Top Bar)                            │
├────┬───────────────────────────────────┬────┤
│    │                                   │    │
│ L  │        3D WORLD                   │ R  │
│ E  │        (Transparent Pass-Through) │ I  │
│ F  │                                   │ G  │
│ T  │                                   │ H  │
│    │                                   │ T  │
│ P  │                                   │    │
│ A  │                                   │ P  │
│ N  │                                   │ A  │
│ E  │                                   │ N  │
│ L  │                                   │ E  │
│    │                                   │ L  │
├────┴───────────────────────────────────┴────┤
│ BOTTOM DOCK (Quick Actions + MiniApps)      │
└─────────────────────────────────────────────┘
```

**Key Code:**

```tsx
// hud/VoidHudApp.tsx
export default function VoidHudApp({
  snapshot,
  playerState,
  fxState,
  triggerFX,
  onSendMessage,
}: VoidHudAppProps) {
  const runtime = useVoidRuntime(); // V4.7 Integration
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [chatState, setChatState] = useState({
    messages: [],
    activeChannel: 'global' as const,
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Header - Always visible */}
      <div className="pointer-events-auto">
        <HUDHeader
          runtime={runtime}
          snapshot={snapshot}
          playerState={playerState}
          onOpenPanel={setActivePanel}
        />
      </div>

      {/* Left Panel - Navigation */}
      <div className="pointer-events-auto absolute left-0 top-16 bottom-16">
        <LeftPanel
          activePanel={activePanel}
          onSelectPanel={setActivePanel}
        />
      </div>

      {/* Right Panel - Activity Feed */}
      <div className="pointer-events-auto absolute right-0 top-16 bottom-16">
        <RightPanel
          chatState={chatState}
          onSendMessage={onSendMessage}
        />
      </div>

      {/* Bottom Dock - Quick Actions + MiniApps */}
      <div className="pointer-events-auto absolute bottom-0 inset-x-0">
        <BottomDock
          onDockAction={(action) => {
            if (action === 'miniapps') {
              // MiniApp dock handles its own state
            } else {
              setActivePanel(action);
            }
          }}
        />
      </div>

      {/* Modal Panels (overlay) */}
      {activePanel && (
        <div className="pointer-events-auto fixed inset-0 z-[100]">
          <PanelRenderer
            panelId={activePanel}
            onClose={() => setActivePanel(null)}
            runtime={runtime}
          />
        </div>
      )}
    </div>
  );
}
```

---

### 2. HUDHeader (Top Bar)

**File:** `hud/header/HUDHeader.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Profile Chip] [Balance] [XP Bar] [Ticker] [Network] [Time] │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **PlayerChipV2**: Avatar + username + wallet + level
- **Balance Display**: Token balances (PSX, VOID, etc.)
- **XP Progress Bar**: Level progress with tier indicator
- **Ticker Feed**: Scrolling news/events
- **Network Status**: Chain + connection indicator
- **Time Display**: Current time

**Key Code:**

```tsx
// hud/header/HUDHeader.tsx
export function HUDHeader({ runtime, snapshot, playerState, onOpenPanel }: HUDHeaderProps) {
  return (
    <div className="w-full h-16 bg-void-gradient border-b border-bio-silver/20 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left: Profile */}
        <PlayerChipV2
          runtime={runtime}
          playerState={playerState}
          onClick={() => onOpenPanel('profile')}
        />

        {/* Center: XP Bar + Ticker */}
        <div className="flex-1 flex items-center gap-4">
          <XPProgressBar
            level={runtime.level}
            xp={runtime.xp}
            tier={runtime.tier}
          />
          <TickerFeed events={snapshot.ticker} />
        </div>

        {/* Right: Balances + Network */}
        <div className="flex items-center gap-3">
          <TokenBalance label="PSX" value={snapshot.defi.psxBalance} />
          <TokenBalance label="VOID" value={snapshot.defi.voidBalance} />
          <NetworkIndicator chainId={runtime.chainId} />
        </div>
      </div>
    </div>
  );
}
```

---

### 3. PlayerChipV2 (Profile Button)

**File:** `hud/header/PlayerChipV2.tsx`

**Visual:**
```
┌────────────────────────────┐
│ [Avatar] Username          │
│          0x1234…5678       │
│          Level 7 · SILVER  │
└────────────────────────────┘
```

**Key Code:**

```tsx
// hud/header/PlayerChipV2.tsx
export function PlayerChipV2({ runtime, playerState, onClick }: PlayerChipV2Props) {
  const walletShort = runtime.wallet
    ? `${runtime.wallet.slice(0, 6)}…${runtime.wallet.slice(-4)}`
    : 'Not Connected';
  
  const username = playerState.username || walletShort;
  const level = runtime.level;
  const tier = runtime.tier;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-black/60 border border-bio-silver/40 hover:border-signal-green/60 transition-all"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-signal-green via-void-purple to-cyber-cyan flex items-center justify-center">
        <span className="text-lg font-bold text-void-black">
          {username[0]?.toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold text-bio-silver">
          {username}
        </span>
        <span className="text-xs text-bio-silver/60">
          {walletShort}
        </span>
        <span className="text-xs text-signal-green">
          Level {level} · {tier}
        </span>
      </div>
    </button>
  );
}
```

---

### 4. LeftPanel (Navigation Sidebar)

**File:** `hud/left/LeftPanel.tsx`

**Layout:**
```
┌──────┐
│ HOME │  ← Navigation buttons
│ DASH │
│ LAND │
│ DAO  │
│ DEFI │
│ LABS │
│ CHAT │
│ MORE │
└──────┘
```

**Navigation Items:**
- **HOME**: Main hub/dashboard
- **DASHBOARD**: Economy overview
- **LAND**: Land management
- **DAO**: Governance
- **DEFI**: Token trading
- **LABS**: Creator tools
- **CHAT**: Social/messaging
- **MORE**: Settings/help

**Key Code:**

```tsx
// hud/left/LeftPanel.tsx
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'land', label: 'Land', icon: Map },
  { id: 'dao', label: 'DAO', icon: Vote },
  { id: 'defi', label: 'DeFi', icon: TrendingUp },
  { id: 'labs', label: 'Labs', icon: Beaker },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export function LeftPanel({ activePanel, onSelectPanel }: LeftPanelProps) {
  return (
    <div className="h-full w-16 bg-void-gradient border-r border-bio-silver/20 backdrop-blur-xl flex flex-col gap-2 py-4">
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activePanel === item.id}
          onClick={() => onSelectPanel(item.id)}
        />
      ))}
    </div>
  );
}
```

---

### 5. RightPanel (Activity Feed)

**File:** `hud/right/RightPanel.tsx`

**Layout:**
```
┌────────────────┐
│ ACTIVITY FEED  │
├────────────────┤
│ [Chat Tab]     │
│ [Friends Tab]  │
│ [Events Tab]   │
├────────────────┤
│ Message 1      │
│ Message 2      │
│ Message 3      │
│ ...            │
└────────────────┘
```

**Tabs:**
- **CHAT**: Global/zone/party messages
- **FRIENDS**: Online friends + status
- **EVENTS**: System notifications

**Key Code:**

```tsx
// hud/right/RightPanel.tsx
export function RightPanel({ chatState, onSendMessage }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'friends' | 'events'>('chat');

  return (
    <div className="h-full w-80 bg-void-gradient border-l border-bio-silver/20 backdrop-blur-xl flex flex-col">
      {/* Tab Bar */}
      <div className="flex border-b border-bio-silver/20">
        <TabButton
          label="Chat"
          active={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
        />
        <TabButton
          label="Friends"
          active={activeTab === 'friends'}
          onClick={() => setActiveTab('friends')}
        />
        <TabButton
          label="Events"
          active={activeTab === 'events'}
          onClick={() => setActiveTab('events')}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'chat' && (
          <ChatFeed
            messages={chatState.messages}
            onSendMessage={onSendMessage}
          />
        )}
        {activeTab === 'friends' && <FriendsList />}
        {activeTab === 'events' && <EventsFeed />}
      </div>
    </div>
  );
}
```

---

### 6. BottomDock (Quick Actions)

**File:** `hud/bottom/BottomDock.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [Map] [Wallet] [Quests] [Leaderboard] [Apps] [Settings] │
└─────────────────────────────────────────────────────────┘
```

**Dock Actions:**
- **MAP**: Open world map
- **WALLET**: Open wallet panel
- **QUESTS**: View missions/tasks
- **LEADERBOARD**: Rankings
- **APPS**: MiniApp launcher (MiniAppDock)
- **SETTINGS**: User preferences

**Key Code:**

```tsx
// hud/bottom/BottomDock.tsx
export function BottomDock({ onDockAction }: BottomDockProps) {
  const { openMiniApp } = useMiniAppManager(); // V4.7 MiniApp integration

  const DOCK_ITEMS = [
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'quests', icon: Target, label: 'Quests' },
    { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
    { id: 'apps', icon: Grid, label: 'Apps', special: true }, // MiniApp dock
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-full h-16 bg-void-gradient border-t border-bio-silver/20 backdrop-blur-xl">
      <div className="h-full px-8 flex items-center justify-center gap-4">
        {DOCK_ITEMS.map((item) => (
          <DockButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => {
              if (item.id === 'apps') {
                // MiniAppDock handles its own modal
              } else {
                onDockAction(item.id);
              }
            }}
            special={item.special}
          />
        ))}

        {/* MiniApp Dock (integrated) */}
        <MiniAppDock />
      </div>
    </div>
  );
}
```

---

## Mobile HUD Components

### 1. MobileHudShell (Orientation Detector)

**File:** `hud/mobile/MobileHudShell.tsx`

**Logic:**
```typescript
// Detect orientation
const isLandscape = window.matchMedia('(orientation: landscape)').matches 
  && window.innerWidth > window.innerHeight;

// Auto-switch
if (isLandscape) {
  return <MobileRoamHUD {...props} />;
} else {
  return <MobileLiteHUD {...props} />;
}
```

**Key Code:**

```tsx
// hud/mobile/MobileHudShell.tsx
export default function MobileHudShell(props: MobileHudShellProps) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [forceLiteView, setForceLiteView] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = 
        window.matchMedia('(orientation: landscape)').matches &&
        window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode);
    };

    checkOrientation();

    const mediaQuery = window.matchMedia('(orientation: landscape)');
    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches && window.innerWidth > window.innerHeight);
      setForceLiteView(false);
    };

    mediaQuery.addEventListener('change', handleOrientationChange);
    window.addEventListener('resize', checkOrientation);

    return () => {
      mediaQuery.removeEventListener('change', handleOrientationChange);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  const showLite = !isLandscape || forceLiteView;

  return showLite ? (
    <MobileLiteHUD {...props} />
  ) : (
    <MobileRoamHUD {...props} onOpenLiteView={() => setForceLiteView(true)} />
  );
}
```

---

### 2. MobileLiteHUD (Portrait Mode)

**File:** `hud/mobile/MobileLiteHUD_v2.tsx`

**Layout:**
```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │   PROFILE CARD      │ │
│ │ [Avatar] Username   │ │
│ │ Wallet: 0x1234…     │ │
│ │ Zone: ZONE_0_0      │ │
│ │ Coords: (10, 5)     │ │
│ │ Level 7 ████░░░░    │ │
│ │ XP: 14,820/20,000   │ │
│ │ [PSX] [VOID] [...]  │ │
│ └─────────────────────┘ │
│                         │
│ ┌──────────┬──────────┐ │
│ │ Friends  │   PSX    │ │
│ │    12    │  50,000  │ │
│ ├──────────┼──────────┤ │
│ │  VOID    │ Mini Map │ │
│ │ 10,500   │  [Map]   │ │
│ └──────────┴──────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ PROXIMITY CHAT      │ │
│ │ [GLOBAL] [NEAR] [P] │ │
│ │ ───────────────────┘│ │
│ │ User1: Hello!       │ │
│ │ User2: What's up?   │ │
│ │ System: Event...    │ │
│ │ [Input box...]      │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [Map][Wallet][Apps] │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Key Components:**
1. **Profile Card** (Top)
2. **Stats Grid 2x2** (Middle)
3. **Proximity Chat** (Scrollable)
4. **Icon Dock** (Bottom)

**Key Code:**

```tsx
// hud/mobile/MobileLiteHUD_v2.tsx
export default function MobileLiteHUD({
  snapshot,
  playerState,
  chatState,
  onSendMessage,
  onDockAction,
}: MobileLiteHUDProps) {
  const runtime = useVoidRuntime(); // V4.7 Integration

  return (
    <div className="relative w-full h-full bg-void-gradient overflow-hidden">
      <div className="absolute inset-0 flex flex-col">
        {/* TOP: Profile Card */}
        <div className="px-3 pt-4">
          <PlayerSummaryCardMobile
            runtime={runtime}
            playerState={playerState}
          />
        </div>

        {/* MIDDLE: Stats Grid + Chat */}
        <div className="flex-1 flex flex-col gap-3 px-3 pt-3 pb-2">
          <StatsGrid2x2Mobile
            runtime={runtime}
            world={snapshot.world}
            defi={snapshot.defi}
            onCardTap={onDockAction}
          />

          <div className="flex-1 min-h-[40vh]">
            <ChatPanelMobile
              chatState={chatState}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>

        {/* BOTTOM: Dock */}
        <div className="px-3 pb-4">
          <BottomDockMobile onDockAction={onDockAction} />
        </div>
      </div>
    </div>
  );
}

// Profile Card Component
function PlayerSummaryCardMobile({ runtime, playerState }) {
  const walletShort = runtime.wallet 
    ? `${runtime.wallet.slice(0, 6)}…${runtime.wallet.slice(-4)}`
    : '0x????…????';
  
  const zone = runtime.netProfile 
    ? `ZONE_${runtime.netProfile.zoneX}_${runtime.netProfile.zoneY}`
    : 'VOID_CORE';
  
  const coords = runtime.netProfile
    ? { x: Math.floor(runtime.netProfile.posX), z: Math.floor(runtime.netProfile.posZ) }
    : { x: 0, z: 0 };
  
  const level = runtime.level ?? 1;
  const xp = runtime.xp ?? 0;
  const xpNext = level * 5000;
  const xpPct = Math.min(100, Math.round((xp / xpNext) * 100));

  return (
    <div className="rounded-3xl bg-black/85 backdrop-blur-2xl border border-bio-silver/50 shadow-[0_0_35px_rgba(0,255,157,0.35)] px-4 py-3">
      {/* Avatar + ID */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyber-cyan via-bio-silver to-void-purple flex items-center justify-center">
            <span className="text-xl font-bold text-void-black">
              {playerState.username?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-bio-silver">
              {playerState.username || 'agent'}
            </span>
            <span className="text-xs text-bio-silver/60">
              {walletShort}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs uppercase text-bio-silver/50">Zone</div>
          <div className="text-xs text-signal-green font-mono">{zone}</div>
          <div className="text-xs text-bio-silver/60">
            ({coords.x}, {coords.z})
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs uppercase text-bio-silver/70">
            Level {level}
          </span>
          <span className="text-xs text-bio-silver/60 font-mono">
            {xp.toLocaleString()} / {xpNext.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-void-deep/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-signal-green via-cyber-cyan to-void-purple"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      {/* Token Chips */}
      <div className="mt-3 flex gap-2">
        <TokenChip label="VOID" value={snapshot.defi.voidBalance} accent="void" />
        <TokenChip label="PSX" value={snapshot.defi.psxBalance} accent="psx" />
      </div>
    </div>
  );
}

// Stats Grid 2x2
function StatsGrid2x2Mobile({ runtime, world, defi, onCardTap }) {
  const onlineFriends = world.onlineFriends ?? 0;
  const psxBal = defi.psxBalance ?? 0;
  const voidBal = defi.voidBalance ?? 0;
  const posX = runtime.netProfile?.posX ?? 0;
  const posZ = runtime.netProfile?.posZ ?? 0;

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Online Friends */}
      <button
        onClick={() => onCardTap?.('friends')}
        className="rounded-2xl bg-black/75 border border-signal-green/40 px-3 py-3 flex flex-col items-start"
      >
        <div className="text-xs uppercase text-bio-silver/60">Online Friends</div>
        <div className="mt-2 text-2xl font-mono text-signal-green">{onlineFriends}</div>
        <div className="text-xs text-bio-silver/50 mt-1">Active Now</div>
      </button>

      {/* PSX Balance */}
      <button
        onClick={() => onCardTap?.('wallet')}
        className="rounded-2xl bg-black/75 border border-psx-blue/40 px-3 py-3 flex flex-col items-start"
      >
        <div className="text-xs uppercase text-bio-silver/60">PSX Balance</div>
        <div className="mt-2 text-xl font-mono text-psx-blue">{psxBal.toLocaleString()}</div>
        <div className="text-xs text-bio-silver/50 mt-1">Tokens</div>
      </button>

      {/* VOID Balance */}
      <button
        onClick={() => onCardTap?.('wallet')}
        className="rounded-2xl bg-black/75 border border-void-purple/40 px-3 py-3 flex flex-col items-start"
      >
        <div className="text-xs uppercase text-bio-silver/60">VOID Balance</div>
        <div className="mt-2 text-xl font-mono text-void-purple">{voidBal.toLocaleString()}</div>
        <div className="text-xs text-bio-silver/50 mt-1">Tokens</div>
      </button>

      {/* Mini Map */}
      <button
        onClick={() => onCardTap?.('map')}
        className="rounded-2xl bg-black/75 border border-cyber-cyan/40 px-3 py-3 flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="text-xs uppercase text-bio-silver/60">Position</div>
        <div className="mt-1 text-sm font-mono text-cyber-cyan">
          ({Math.floor(posX)}, {Math.floor(posZ)})
        </div>
        {/* Animated player blip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-signal-green shadow-[0_0_8px_rgba(0,255,157,0.9)] animate-pulse" />
      </button>
    </div>
  );
}
```

---

### 3. MobileRoamHUD (Landscape Mode)

**File:** `hud/mobile/MobileRoamHUD_v2.tsx`

**Layout:**
```
┌────────────────────────────────────────────────┐
│ [Avatar] User | Lv7 | SILVER | (10,5) | Near  │
├───────────────────────────────────────────┬────┤
│                                           │ F  │
│                                           │ 12 │
│         3D WORLD (Camera Dominates)       │    │
│                                           │ 💬 │
│                                           │    │
├───────────────────────────────────────────┴────┤
│      [Map] [Wallet] [Apps] [...More]          │
└────────────────────────────────────────────────┘
```

**Key Components:**
1. **Top Row** (Horizontal bar with profile + stats)
2. **Friends/Chat Strip** (Right edge, vertical)
3. **Icon Dock** (Bottom)

**Key Code:**

```tsx
// hud/mobile/MobileRoamHUD_v2.tsx
export default function MobileRoamHUD({
  snapshot,
  playerState,
  chatState,
  onOpenLiteView,
  onDockAction,
}: MobileRoamHUDProps) {
  const runtime = useVoidRuntime();
  const [showFullChat, setShowFullChat] = useState(false);

  return (
    <div className="relative w-full h-full bg-void-gradient overflow-hidden">
      <div className="absolute inset-0">
        {/* TOP: Profile + Stats Row */}
        <div className="px-3 pt-3">
          <RoamTopRow
            runtime={runtime}
            playerState={playerState}
            nearbyCount={snapshot.world.nearbyPlayers?.length ?? 0}
            onTap={onOpenLiteView}
          />
        </div>

        {/* RIGHT EDGE: Friends/Chat Strip */}
        <div className="absolute right-3 top-20 bottom-20">
          <FriendsChatStrip
            onlineFriends={snapshot.world.onlineFriends ?? 0}
            lastMessage={chatState.messages[0]}
            onOpenChat={() => setShowFullChat(true)}
          />
        </div>

        {/* BOTTOM: Icon Dock */}
        <div className="absolute inset-x-0 bottom-0 px-3 pb-4">
          <MiniDockMobile
            onDockAction={onDockAction}
            onMoreTap={onOpenLiteView}
          />
        </div>
      </div>
    </div>
  );
}

// Top Row Component (Landscape)
function RoamTopRow({ runtime, playerState, nearbyCount, onTap }) {
  const walletShort = runtime.wallet 
    ? `${runtime.wallet.slice(0,4)}…${runtime.wallet.slice(-3)}`
    : '????';
  const level = runtime.level ?? 1;
  const tier = runtime.tier ?? 'BRONZE';
  const zone = runtime.netProfile 
    ? `ZONE_${runtime.netProfile.zoneX}_${runtime.netProfile.zoneY}`
    : 'VOID';
  const posX = runtime.netProfile?.posX ?? 0;
  const posZ = runtime.netProfile?.posZ ?? 0;

  return (
    <button
      onClick={onTap}
      className="w-full rounded-2xl bg-black/80 border border-bio-silver/50 px-4 py-2 flex items-center justify-between"
    >
      {/* Left: Profile */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-signal-green via-void-purple to-cyber-cyan flex items-center justify-center">
          <span className="text-lg font-bold text-void-black">
            {playerState.username?.[0]?.toUpperCase() || 'A'}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-bio-silver">
            {playerState.username || walletShort}
          </span>
          <span className="text-xs text-bio-silver/60">{zone}</span>
        </div>
      </div>

      {/* Center: Stats */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-xs uppercase text-bio-silver/50">Level</div>
          <div className="text-sm font-mono text-signal-green">{level}</div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase text-bio-silver/50">Tier</div>
          <div className="text-xs font-mono text-void-purple">{tier}</div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase text-bio-silver/50">Position</div>
          <div className="text-xs font-mono text-cyber-cyan">
            ({Math.floor(posX)}, {Math.floor(posZ)})
          </div>
        </div>
      </div>

      {/* Right: Nearby */}
      <div className="flex items-center gap-2">
        {nearbyCount > 0 && (
          <>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-400 font-mono">{nearbyCount}</span>
          </>
        )}
      </div>
    </button>
  );
}

// Friends/Chat Strip (Right Edge)
function FriendsChatStrip({ onlineFriends, lastMessage, onOpenChat }) {
  return (
    <div className="flex flex-col gap-2 h-full justify-center">
      {/* Online friends pill */}
      <button
        onClick={onOpenChat}
        className="rounded-xl bg-black/75 border border-signal-green/40 p-2"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs uppercase text-bio-silver/60">Online</div>
          <div className="text-lg font-mono text-signal-green">{onlineFriends}</div>
        </div>
      </button>

      {/* Chat pill */}
      {lastMessage && (
        <button
          onClick={onOpenChat}
          className="rounded-xl bg-black/75 border border-cyber-cyan/40 p-2"
        >
          <MessageCircle className="w-5 h-5 text-cyber-cyan" />
        </button>
      )}
    </div>
  );
}
```

---

## VoidRuntime Integration

### VoidRuntimeProvider

**File:** `src/runtime/VoidRuntimeProvider.tsx`

**Purpose:** Aggregates all runtime state for the metaverse

**State Schema:**
```typescript
interface VoidRuntimeState {
  // Wallet
  wallet: `0x${string}` | null;
  chainId: number | null;
  isConnected: boolean;
  isReady: boolean; // Privy + wallet both ready
  
  // Net Protocol Profile (on-chain)
  netProfile: NetProfileCore | null;
  isLoadingProfile: boolean;
  
  // XP / Tier (derived from profile)
  xp: number;
  level: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER';
  
  // Land ownership (optional)
  ownedLandCount: number;
  
  // Actions
  refreshProfile: () => Promise<void>;
  updatePosition: (x: number, y: number, z: number) => Promise<void>;
  updateZone: (zoneX: number, zoneY: number) => Promise<void>;
  updateXP: (newXP: bigint) => Promise<void>;
}
```

**Key Code:**

```tsx
// src/runtime/VoidRuntimeProvider.tsx
export function VoidRuntimeProvider({ children }: { children: React.ReactNode }) {
  const { address, chainId, isConnected: walletConnected } = useAccount();
  const { ready: privyReady, authenticated } = usePrivy();
  
  const [netProfile, setNetProfile] = useState<NetProfileCore | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  const isReady = privyReady && authenticated && walletConnected;
  const wallet = address || null;
  
  // Derived state
  const xp = netProfile ? Number(netProfile.xp) : 0;
  const level = netProfile?.level || 1;
  const tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER' = 
    level >= 10 ? 'S_TIER' :
    level >= 7 ? 'GOLD' :
    level >= 4 ? 'SILVER' :
    'BRONZE';

  // Load profile on wallet connect
  useEffect(() => {
    if (!isReady || !wallet) {
      setNetProfile(null);
      return;
    }
    
    async function loadProfile() {
      setIsLoadingProfile(true);
      try {
        const profile = await getNetProfile(wallet as `0x${string}`);
        setNetProfile(profile);
      } catch (error) {
        console.error(`[VoidRuntime] Error loading profile:`, error);
        setNetProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    
    loadProfile();
  }, [isReady, wallet]);

  // Actions
  const updatePosition = async (x: number, y: number, z: number) => {
    if (!wallet) return;
    
    await upsertNetProfile(wallet as `0x${string}`, {
      posX: x,
      posY: y,
      posZ: z,
    });
    
    if (netProfile) {
      setNetProfile({
        ...netProfile,
        posX: x,
        posY: y,
        posZ: z,
        updatedAt: Math.floor(Date.now() / 1000),
      });
    }
  };

  const updateZone = async (zoneX: number, zoneY: number) => {
    if (!wallet) return;
    
    await upsertNetProfile(wallet as `0x${string}`, {
      zoneX,
      zoneY,
    });
    
    if (netProfile) {
      setNetProfile({
        ...netProfile,
        zoneX,
        zoneY,
        updatedAt: Math.floor(Date.now() / 1000),
      });
    }
  };

  const updateXP = async (newXP: bigint) => {
    if (!wallet) return;
    
    await upsertNetProfile(wallet as `0x${string}`, {
      xp: newXP,
    });
    
    if (netProfile) {
      setNetProfile({
        ...netProfile,
        xp: newXP,
        updatedAt: Math.floor(Date.now() / 1000),
      });
    }
  };

  const refreshProfile = async () => {
    if (!wallet) return;
    setIsLoadingProfile(true);
    try {
      const profile = await getNetProfile(wallet as `0x${string}`);
      setNetProfile(profile);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const value: VoidRuntimeState = {
    wallet,
    chainId: chainId || null,
    isConnected: walletConnected,
    isReady,
    netProfile,
    isLoadingProfile,
    xp,
    level,
    tier,
    ownedLandCount: 0,
    refreshProfile,
    updatePosition,
    updateZone,
    updateXP,
  };

  return (
    <VoidRuntimeContext.Provider value={value}>
      {children}
    </VoidRuntimeContext.Provider>
  );
}

export function useVoidRuntime(): VoidRuntimeState {
  const context = useContext(VoidRuntimeContext);
  if (!context) {
    throw new Error('useVoidRuntime must be used within VoidRuntimeProvider');
  }
  return context;
}
```

---

## MiniApp System

### MiniApp Types

**File:** `src/miniapps/types.ts`

```typescript
export type MiniAppType = 'internal' | 'external';

export interface MiniAppMetadata {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  type: MiniAppType;
  category: 'defi' | 'social' | 'gaming' | 'utility' | 'nft';
  author: string;
  version: string;
  permissions?: string[];
}

export interface InternalMiniApp extends MiniAppMetadata {
  type: 'internal';
  component: React.ComponentType<MiniAppProps>;
}

export interface ExternalMiniApp extends MiniAppMetadata {
  type: 'external';
  url: string;
}

export type MiniApp = InternalMiniApp | ExternalMiniApp;

export interface MiniAppProps {
  voidRuntime: VoidRuntimeState;
  onClose: () => void;
  onMinimize: () => void;
}

export interface VoidRuntimeAPI {
  wallet: string | null;
  chainId: number | null;
  profile: NetProfileCore | null;
  level: number;
  xp: number;
  tier: string;
  updatePosition: (x: number, y: number, z: number) => Promise<void>;
  updateXP: (xp: bigint) => Promise<void>;
}
```

### MiniApp Registry

**File:** `src/miniapps/miniapps.registry.ts`

```typescript
import { VoidDexApp } from './apps/VoidDexApp';
import { SocialHubApp } from './apps/SocialHubApp';
import { LandManagerApp } from './apps/LandManagerApp';
import { ProfileManagerApp } from './apps/ProfileManagerApp';
import type { MiniApp } from './types';

export const MINIAPP_REGISTRY: MiniApp[] = [
  // Internal Apps (React components)
  {
    id: 'void-dex',
    name: 'VOID DEX',
    description: 'Trade PSX, VOID, and other tokens',
    icon: '💱',
    type: 'internal',
    category: 'defi',
    author: 'VOID Labs',
    version: '1.0.0',
    component: VoidDexApp,
  },
  {
    id: 'social-hub',
    name: 'Social Hub',
    description: 'Friends, chat, and social features',
    icon: '👥',
    type: 'internal',
    category: 'social',
    author: 'VOID Labs',
    version: '1.0.0',
    component: SocialHubApp,
  },
  {
    id: 'land-manager',
    name: 'Land Manager',
    description: 'Manage your land parcels',
    icon: '🏗️',
    type: 'internal',
    category: 'utility',
    author: 'VOID Labs',
    version: '1.0.0',
    component: LandManagerApp,
  },
  {
    id: 'profile-manager',
    name: 'Profile Manager',
    description: 'Customize your VOID profile',
    icon: '👤',
    type: 'internal',
    category: 'utility',
    author: 'VOID Labs',
    version: '1.0.0',
    component: ProfileManagerApp,
  },
  
  // External Apps (iframe embeds)
  // Add external MiniKit apps here as they're approved
];

export function getMiniApp(id: string): MiniApp | undefined {
  return MINIAPP_REGISTRY.find((app) => app.id === id);
}

export function getMiniAppsByCategory(category: string): MiniApp[] {
  return MINIAPP_REGISTRY.filter((app) => app.category === category);
}
```

### MiniApp Manager

**File:** `src/miniapps/MiniAppManager.tsx`

```typescript
interface MiniAppManagerState {
  openApps: Map<string, MiniAppInstance>;
  activeAppId: string | null;
  openMiniApp: (appId: string) => void;
  closeMiniApp: (appId: string) => void;
  minimizeMiniApp: (appId: string) => void;
  focusMiniApp: (appId: string) => void;
}

export function MiniAppManagerProvider({ children }: { children: React.ReactNode }) {
  const [openApps, setOpenApps] = useState<Map<string, MiniAppInstance>>(new Map());
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const runtime = useVoidRuntime();

  const openMiniApp = useCallback((appId: string) => {
    const app = getMiniApp(appId);
    if (!app) {
      console.error(`[MiniAppManager] App not found: ${appId}`);
      return;
    }

    const instance: MiniAppInstance = {
      id: appId,
      app,
      minimized: false,
      position: { x: 100, y: 100 }, // Default position
      size: { width: 800, height: 600 }, // Default size
    };

    setOpenApps((prev) => new Map(prev).set(appId, instance));
    setActiveAppId(appId);
  }, []);

  const closeMiniApp = useCallback((appId: string) => {
    setOpenApps((prev) => {
      const next = new Map(prev);
      next.delete(appId);
      return next;
    });
    if (activeAppId === appId) {
      setActiveAppId(null);
    }
  }, [activeAppId]);

  const minimizeMiniApp = useCallback((appId: string) => {
    setOpenApps((prev) => {
      const next = new Map(prev);
      const instance = next.get(appId);
      if (instance) {
        next.set(appId, { ...instance, minimized: true });
      }
      return next;
    });
  }, []);

  const focusMiniApp = useCallback((appId: string) => {
    setActiveAppId(appId);
  }, []);

  const value: MiniAppManagerState = {
    openApps,
    activeAppId,
    openMiniApp,
    closeMiniApp,
    minimizeMiniApp,
    focusMiniApp,
  };

  return (
    <MiniAppManagerContext.Provider value={value}>
      {children}
      {/* Render open apps */}
      {Array.from(openApps.values()).map((instance) => (
        <MiniAppContainer
          key={instance.id}
          instance={instance}
          runtime={runtime}
          active={activeAppId === instance.id}
          onClose={() => closeMiniApp(instance.id)}
          onMinimize={() => minimizeMiniApp(instance.id)}
          onFocus={() => focusMiniApp(instance.id)}
        />
      ))}
    </MiniAppManagerContext.Provider>
  );
}
```

---

## Data Flow & State Management

### State Flow Diagram

```
User Action (e.g., move in world)
    ↓
VoidGameShell.handlePlayerMove(pos)
    ↓
runtime.updatePosition(pos.x, pos.y, pos.z)
    ↓
NetProtocolClient.upsertNetProfile(wallet, { posX, posY, posZ })
    ↓
writeContract(config, { address: NET_PROTOCOL_ADDRESS, ... })
    ↓
On-chain transaction → Base Sepolia blockchain
    ↓
Transaction confirmed → Profile updated
    ↓
VoidRuntimeProvider updates local state
    ↓
All HUD components re-render with new position
```

### Key Integration Points

**1. App Root → VoidRuntimeProvider**
```tsx
// app/layout.tsx → components/providers/root-providers.tsx
<PrivyProviderWrapper>
  <Web3Provider>
    <OnchainKitProvider chain={baseSepolia}>
      <VoidRuntimeProvider>  {/* ← Runtime state injected here */}
        {children}
      </VoidRuntimeProvider>
    </OnchainKitProvider>
  </Web3Provider>
</PrivyProviderWrapper>
```

**2. VoidGameShell → Resume Logic**
```tsx
// components/game/VoidGameShell.tsx
const runtime = useVoidRuntime();

// Resume from saved position on wallet connect
useEffect(() => {
  if (runtime.netProfile) {
    const resumePos = {
      x: runtime.netProfile.posX,
      y: runtime.netProfile.posY,
      z: runtime.netProfile.posZ,
    };
    setPlayerPosition(resumePos);
  }
}, [runtime.netProfile]);

// Save position on movement
const handlePlayerMove = (pos) => {
  setPlayerPosition(pos);
  runtime.updatePosition(pos.x, pos.y, pos.z);
};
```

**3. HUD Components → Runtime Data**
```tsx
// Any HUD component
const runtime = useVoidRuntime();

// Access real-time data
const wallet = runtime.wallet;
const level = runtime.level;
const xp = runtime.xp;
const tier = runtime.tier;
const position = runtime.netProfile ? {
  x: runtime.netProfile.posX,
  z: runtime.netProfile.posZ,
} : null;
```

**4. MiniApps → VoidRuntime API**
```tsx
// src/miniapps/apps/VoidDexApp.tsx
export function VoidDexApp({ voidRuntime, onClose }: MiniAppProps) {
  const { wallet, level, tier, profile } = voidRuntime;
  
  return (
    <div>
      <h1>VOID DEX</h1>
      <p>Wallet: {wallet}</p>
      <p>Level: {level} | Tier: {tier}</p>
      {/* DEX functionality here */}
    </div>
  );
}
```

---

## Code Review Checklist

### For Cosmetics AI Integration

**Profile/Avatar System:**
- [ ] `PlayerChipV2` displays avatar (currently first letter of username)
- [ ] Avatar rendering location: `hud/header/PlayerChipV2.tsx` line 20-28
- [ ] Avatar also appears in mobile profile cards
- [ ] **Integration Point:** Replace avatar div with cosmetics avatar component

**Current Avatar Code:**
```tsx
// hud/header/PlayerChipV2.tsx (line 20-28)
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-signal-green via-void-purple to-cyber-cyan flex items-center justify-center">
  <span className="text-lg font-bold text-void-black">
    {username[0]?.toUpperCase()}
  </span>
</div>
```

**Needed for Cosmetics:**
```tsx
// Replace with:
<CosmeticsAvatar
  wallet={runtime.wallet}
  equippedCosmetics={runtime.netProfile?.equippedCosmetics}
  size="medium"
/>
```

**Files to Modify:**
1. `hud/header/PlayerChipV2.tsx` - Desktop avatar
2. `hud/mobile/MobileLiteHUD_v2.tsx` - Mobile portrait avatar (line 213)
3. `hud/mobile/MobileRoamHUD_v2.tsx` - Mobile landscape avatar (line 186)

**Data Storage:**
- Cosmetics inventory: Store in `runtime.netProfile.dataHash` (IPFS/Arweave)
- Equipped items: Store in NetProfileRich schema
- On-chain reference: `netProfile.dataHash` points to IPFS cosmetics manifest

---

### For Architect/Builder Integration

**3D World Rendering:**
- [ ] 3D scene: `components/scene-3d.tsx`
- [ ] Camera controls: Integrated in Scene3D component
- [ ] Player movement: `VoidGameShell` handles `handlePlayerMove`
- [ ] **Integration Point:** Scene3D receives player position, buildings, objects

**Current Scene Code:**
```tsx
// components/scene-3d.tsx
<Scene3D
  playerPosition={playerPosition}
  onPlayerMove={handlePlayerMove}
  onZoneEnter={handleZoneEnter}
  onZoneExit={handleZoneExit}
/>
```

**Needed for Building System:**
```tsx
<Scene3D
  playerPosition={playerPosition}
  onPlayerMove={handlePlayerMove}
  buildings={worldBuildings} // ← Add buildings prop
  landParcels={ownedLand}    // ← Add land parcels
  onPlaceObject={handlePlaceObject} // ← Add placement handler
/>
```

**Land/Building Data:**
- Land ownership: Query from LandRegistry contract
- Buildings: Store in Net Protocol `dataHash` (IPFS manifest)
- Real-time sync: Subscribe to contract events for land transfers
- Position validation: Check if player owns land at current coords

**Files to Review:**
1. `components/scene-3d.tsx` - 3D renderer
2. `src/miniapps/apps/LandManagerApp.tsx` - Land management UI
3. `hud/bottom/BottomDock.tsx` - "MAP" button opens world map

---

### Net Protocol Contract Integration

**Contract Schema:**
```solidity
// contracts/NetProtocolProfiles.sol
struct ProfileCore {
  uint32 createdAt;      // Profile creation timestamp
  uint32 updatedAt;      // Last update timestamp
  int16 zoneX;           // Grid zone X
  int16 zoneY;           // Grid zone Y
  int32 posX;            // World position X
  int32 posY;            // World position Y
  int32 posZ;            // World position Z
  uint8 sceneId;         // Scene/district ID
  uint16 level;          // Player level
  uint256 xp;            // Player XP
  bytes32 dataHash;      // IPFS/Arweave hash for rich data
}
```

**Rich Data Schema (Off-Chain):**
```typescript
// src/net/types.ts
interface NetProfileRich {
  // Identity
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  
  // Cosmetics (for cosmetics AI)
  cosmetics?: {
    equipped: string[];      // Array of equipped cosmetic IDs
    owned: string[];         // Array of owned cosmetic IDs
    inventory: {
      [cosmeticId: string]: {
        name: string;
        type: 'head' | 'body' | 'accessory';
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
        acquiredAt: number;
      };
    };
  };
  
  // Buildings (for architect/builder)
  buildings?: {
    [landParcelId: string]: {
      buildingType: string;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      customData: any; // Builder-specific data
    }[];
  };
  
  // Achievements
  achievements?: string[];
  
  // Preferences
  preferences?: {
    theme?: string;
    graphics?: 'low' | 'medium' | 'high';
    notifications?: boolean;
  };
}
```

**Storage Flow:**
1. User equips cosmetic → Update `NetProfileRich.cosmetics.equipped`
2. Upload rich data to IPFS → Get hash
3. Call `upsertProfile` with `dataHash = ipfsHash`
4. On load: Fetch `netProfile.dataHash` → Download from IPFS → Parse `NetProfileRich`

---

## Summary

### What's Connected ✅

1. **VoidRuntimeProvider** → All HUD components
2. **Net Protocol** → On-chain profile storage (posX/Y/Z, level, XP, dataHash)
3. **MiniApp System** → 4 internal apps + iframe support
4. **Mobile HUD** → Auto-switch between LITE/ROAM based on orientation
5. **Wallet Auth** → WalletGate blocks world until connected
6. **Resume Logic** → Spawns player at last saved position

### What Needs Integration 🔧

1. **Cosmetics System:**
   - Replace avatar placeholders with cosmetics renderer
   - Store inventory/equipped in `dataHash` (IPFS)
   - Add cosmetics selector UI (MiniApp or panel)

2. **Building System:**
   - Add buildings prop to Scene3D
   - Store building data in `dataHash` (IPFS)
   - Land ownership query from LandRegistry contract
   - Builder MiniApp for placing/editing buildings

3. **Contract Deployment:**
   - Deploy NetProtocolProfiles.sol to Base Sepolia
   - Add address to `.env.local`
   - Test end-to-end resume functionality

### Files to Review

**Critical Files (Core Architecture):**
- `src/runtime/VoidRuntimeProvider.tsx` - Runtime state
- `src/net/NetProtocolClient.ts` - On-chain client
- `components/game/VoidGameShell.tsx` - Game root
- `hud/VoidHudApp.tsx` - Desktop HUD root
- `hud/mobile/MobileHudShell.tsx` - Mobile HUD root

**Avatar/Cosmetics Integration:**
- `hud/header/PlayerChipV2.tsx`
- `hud/mobile/MobileLiteHUD_v2.tsx` (line 213)
- `hud/mobile/MobileRoamHUD_v2.tsx` (line 186)

**Building/Land Integration:**
- `components/scene-3d.tsx`
- `src/miniapps/apps/LandManagerApp.tsx`

**Contract Schema:**
- `contracts/NetProtocolProfiles.sol`
- `src/net/types.ts`

---

**Build Status:** ✅ Passing  
**Integration Ready:** ✅ VoidRuntime, MiniApps, Mobile HUD  
**Pending:** Contract deployment, cosmetics renderer, building system
