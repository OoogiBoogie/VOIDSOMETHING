# WORLD HUD V2 - VISUAL LAYOUT REFERENCE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  TOP BAND (8-10%)                               │
│ ┌──────────────┬──────────────────────────────────────────────┬──────────────┐ │
│ │ PlayerChip   │          TopTicker                           │   MiniMap    │ │
│ │ • Avatar     │ • VOID $0.0234 ↑2.5% | PSX $0.000045 ↓1.2%  │ • Player Dot │ │
│ │ • Username   │ • Announcements                              │ • Districts  │ │
│ │ • Level 12   │ • Network: ONLINE                            │ • Nearby     │ │
│ │ • 8,432 vXP  │                                              │ • (x, z)     │ │
│ └──────────────┴──────────────────────────────────────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌───────────────┬─────────────────────────────────────────────────┬───────────────┐
│               │                                                 │               │
│  LEFT RAIL    │          SAFE PLAY AREA (56%)                   │  RIGHT RAIL   │
│   (22%)       │                                                 │    (22%)      │
│               │                                                 │               │
│ ┌───────────┐ │  ╔═══════════════════════════════════════════╗ │ ┌───────────┐ │
│ │ OPERATOR  │ │  ║                                           ║ │ │ EMISSION  │ │
│ │ Level: 12 │ │  ║                                           ║ │ │ 23:59:42  │ │
│ │ Streak: 4 │ │  ║                                           ║ │ └───────────┘ │
│ └───────────┘ │  ║                                           ║ │               │
│               │  ║          NO HUD HERE                      ║ │ ┌───────────┐ │
│ ┌───────────┐ │  ║                                           ║ │ │   CHAT    │ │
│ │ MISSIONS  │ │  ║     Character Always Visible              ║ │ │ ┌───┬───┐ │ │
│ │ 1. Gaming │ │  ║                                           ║ │ │ │GLB│NRB│ │ │
│ │    [████] │ │  ║     Blue Safe Zone                        ║ │ │ └───┴───┘ │ │
│ │ 2. DeFi   │ │  ║                                           ║ │ │ Messages  │ │
│ │    [    ] │ │  ║     Pointer Events: NONE                  ║ │ │ Input...  │ │
│ │ 3. Creator│ │  ║                                           ║ │ └───────────┘ │
│ │    [████] │ │  ║                                           ║ │               │
│ └───────────┘ │  ║                                           ║ │ ┌───────────┐ │
│               │  ║                                           ║ │ │  AI FEED  │ │
│ ┌───────────┐ │  ║                                           ║ │ │ • Scanner │ │
│ │  SOCIAL   │ │  ║                                           ║ │ │ • Curator │ │
│ │ Online: 5 │ │  ║                                           ║ │ └───────────┘ │
│ │ Nearby: 2 │ │  ║                                           ║ │               │
│ └───────────┘ │  ║                                           ║ │ ┌───────────┐ │
│               │  ║                                           ║ │ │  REWARDS  │ │
│ ┌───────────┐ │  ║                                           ║ │ │ 12.5 VOID │ │
│ │ACHIEVEMNTS│ │  ║                                           ║ │ │ [CLAIM]   │ │
│ │    12     │ │  ║                                           ║ │ └───────────┘ │
│ └───────────┘ │  ╚═══════════════════════════════════════════╝ │               │
│               │                                                 │               │
└───────────────┴─────────────────────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                BOTTOM BAND (6-8%)                               │
│                                                                                 │
│                     ┌─────────────────────────────────────┐                     │
│                     │  [E] OPEN · [F] TALK · [Q] SCAN    │                     │
│                     │     (Context Action Bar)            │                     │
│                     └─────────────────────────────────────┘                     │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │ [📱][👥][🛡][📻][🎵][🎮][🗺][📅][🏆][💰][🔒] │ [⋯]               │    │
│  │  Phone Friends Guilds Voice Music Games Map Events Trophy Wallet Vault MORE │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Color Code Legend

### Screen Zones
- 🟨 **YELLOW GUTTERS** (22% left + 22% right): HUD allowed
- 🟦 **BLUE SAFE ZONE** (56% center): NO HUD, character visible

### Component Colors
- **PlayerChip**: Signal green (#00FF9D)
- **TopTicker**: Void purple (#7C00FF)
- **MiniMap**: Cyber cyan (#00D4FF)
- **LeftRail**: Gradient (signal green → cyber cyan → void purple)
- **RightRail**: Gradient (signal green → cyber cyan → psx blue)
- **ContextActionBar**: Dynamic based on action type
- **BottomAppDock**: Chrome backing (#C7D8FF)

---

## Grid Structure

```css
/* Main Grid */
.world-hub-v2 {
  display: grid;
  grid-template-columns: minmax(0, 22%) minmax(0, 56%) minmax(0, 22%);
  grid-template-rows: auto 1fr auto;
}

/* Top Band */
.top-band {
  height: 8-10vh;
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
}

/* Middle Area */
.left-gutter {
  grid-column: 1;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}

.safe-zone {
  grid-column: 2;
  pointer-events: none; /* ⚠️ CRITICAL */
}

.right-gutter {
  grid-column: 3;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}

/* Bottom Band */
.bottom-band {
  height: 6-8vh;
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
```

---

## Component Hierarchy

```
WorldHubV2
├── Chrome Dreamcore Background
│   └── Radial gradients (signal-green, void-purple)
│
├── TOP BAND
│   ├── PlayerChip (left)
│   │   ├── Avatar
│   │   ├── Username + Wallet
│   │   ├── Level + XP Progress
│   │   └── [Expandable] Location + Balances
│   │
│   ├── TopTicker (center)
│   │   ├── VOID Price + 24h Change
│   │   ├── PSX Price + 24h Change
│   │   ├── Announcements (scrolling)
│   │   └── Network Status
│   │
│   └── MiniMap (right)
│       ├── Player Position Dot
│       ├── District Boundaries
│       ├── Nearby Players
│       └── Coordinates
│
├── MIDDLE (3-column grid)
│   ├── LeftRail (22% left gutter)
│   │   ├── Operator Panel (Level, Streak)
│   │   ├── Quick Missions (3 active with progress)
│   │   ├── Social Snapshot (Friends, Nearby)
│   │   └── Achievements (Total count)
│   │
│   ├── Safe Zone (56% center) ⚠️ EMPTY
│   │   └── Optional: subtle chrome grid (opacity 5%)
│   │
│   └── RightRail (22% right gutter)
│       ├── Emission Countdown
│       ├── Chat (Global/Nearby tabs)
│       ├── AI Activity Feed
│       └── Rewards Summary (Claimable + Staked)
│
└── BOTTOM BAND
    ├── ContextActionBar (dynamic prompts)
    │   └── [E] OPEN · [F] TALK · [Q] SCAN (+5 SIGNAL)
    │
    └── BottomAppDock
        ├── Main Apps (11 icons)
        └── MORE button (expands 8 more apps)
```

---

## Interaction Zones

### Click Targets
- ✅ **PlayerChip**: Hover to expand, click to open profile
- ✅ **TopTicker**: Click announcements to view details
- ✅ **MiniMap**: Click to open full map view
- ✅ **Mission Items**: Click to view quest details
- ✅ **Chat Tabs**: Switch between Global/Nearby
- ✅ **Chat Input**: Type and send messages
- ✅ **AI Feed Items**: Click to view AI action details
- ✅ **Claim Button**: Click to claim VOID rewards
- ✅ **App Icons**: Click to open app (Phone, Map, Wallet, etc.)
- ✅ **MORE Button**: Click to expand additional apps

### Scroll Zones
- ⬆️⬇️ **LeftRail**: Vertical scroll when missions overflow
- ⬆️⬇️ **RightRail**: Vertical scroll when chat/feed overflows
- ⬆️⬇️ **Chat Messages**: Vertical scroll within chat panel

### No Interaction
- ❌ **Safe Zone**: Pointer-events-none (character interaction only)
- ❌ **Background**: Cosmetic only (radial gradients)
- ❌ **Chrome Grid**: Cosmetic only (subtle overlay)

---

## Responsive Breakpoints

### Desktop (1920x1080)
- Left Gutter: 422px
- Safe Zone: 1075px
- Right Gutter: 422px

### Laptop (1366x768)
- Left Gutter: 300px
- Safe Zone: 765px
- Right Gutter: 300px

### Tablet (1024x768) ⚠️ TODO
- Collapse gutters to 18%
- Expand safe zone to 64%

### Mobile (<768px) ⚠️ TODO
- Switch to mobile layout (MobileLiteHUD or MobileRoamHUD)
- Full-width overlay mode

---

## Performance Notes

### Optimizations
- ✅ **Chrome Gradients**: CSS only (no SVG)
- ✅ **Animations**: GPU-accelerated (transform, opacity)
- ✅ **Scrolling**: Native browser scroll (smooth)
- ✅ **React Rendering**: Memoized components where possible

### Potential Bottlenecks
- ⚠️ **Chat Messages**: Limit to 50 messages, auto-prune
- ⚠️ **AI Activity**: Limit to 10 items, auto-prune
- ⚠️ **MiniMap**: Limit nearby players to 20
- ⚠️ **Announcements**: Cycle 5-10 max

---

**END OF VISUAL REFERENCE**
