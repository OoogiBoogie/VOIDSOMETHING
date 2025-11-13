# VOID HUD V2 - CHROME DREAMCORE HUB SYSTEM

## 🎯 Implementation Status

### ✅ Core Architecture Created

1. **Hub Theme System** (`hud/theme.ts`)
   - 6 hub modes: WORLD, CREATOR, DEFI, DAO, AGENCY, AI_OPS
   - Each hub has unique colors, chrome glow, accents
   - Spiky silver chrome + dreamcore Y2K aesthetic
   - Helper functions for hub color coding

2. **Window Type Registry** (`hud/windowTypes.ts`)
   - 17 window types for all pop-outs
   - Centralized window labeling
   - Type-safe window system

3. **VoidHudApp Root** (`hud/VoidHudApp.tsx`)
   - Hub mode state management
   - Window management (open/close)
   - FX system for dopamine feedback
   - Economy snapshot building
   - No-scroll viewport (h-screen + overflow-hidden)

4. **VoidHudLayout** (`hud/VoidHudLayout.tsx`)
   - 3-column grid (24%-52%-24%)
   - Header/Footer fixed, body flex-1
   - Center safe play area (empty, for 3D character)
   - Overflow on rails only, not main page

### 🔧 Components Needed (Per Spec)

**Header Components:**
- [ ] VoidHudHeader (wrapper)
- [ ] PlayerChip (expanded with wallet/agency/level clickables)
- [ ] HubEconomyStrip (ticker + hub mode chips)
- [ ] MiniMapPanel (BIG map with landmarks and POIs)

**Rail Components:**
- [ ] VoidLeftRail (missions, social, achievements)
- [ ] VoidRightRail (emission status, AI feed, chat)

**Footer Components:**
- [ ] VoidHudFooter (wrapper)
- [ ] ContextActionBar (dynamic prompts)
- [ ] BottomDock (14 app icons, all reactive)

**Window Components:**
- [x] WindowShellV2 (chrome frame with hub theming)
- [x] DefiOverviewWindow
- [x] CreatorHubWindow
- [x] DaoConsoleWindow
- [x] WorldMapWindow
- [x] AgencyBoardWindow
- [x] AIOpsConsoleWindow
- [ ] Updated with hub mode awareness

### 📋 Key Spec Requirements

✅ **No Page Scrolling** - h-screen + overflow-hidden on root
✅ **Safe Play Area** - Center column empty (52% width)
✅ **Pop-out Bay** - top-[90px] bottom-[90px], 70vw × 70vh windows
✅ **Hub Mode System** - 6 modes with theme switching
✅ **Chrome Dreamcore Style** - Spiky silver, neon gradients, bone-like chrome
⏳ **Full Reactivity** - All clickables need onClick handlers
⏳ **Hub-Filtered Data** - Missions/logs/POIs filter by hub mode
⏳ **FX System** - Dopamine pulses, chrome glows, animations
❌ **Big Minimap** - Needs landmarks, district grid, clickable POIs
❌ **Bottom Dock** - 14 apps (Phone, Friends, Guilds, Voice, Music, Games, Map, Zones, Vault, Wallet, DAO, Agency, AI Ops, Hub)
❌ **Hub Economy Strip** - Clickable ticker + hub mode chips
❌ **Spiny Chat** - Chrome spine, hub-colored messages
❌ **Remove "HUD is RENDERING"** - Replace with "ONLINE" pill

### 🎨 Hub Mode Transformations

**Each hub mode changes:**
1. Root background gradient
2. Accent colors throughout
3. Chrome glow colors
4. Filtered missions (e.g. DEFI mode shows vault/staking missions)
5. Filtered AI logs (e.g. CREATOR mode shows creator-related logs)
6. Default pop-out window (e.g. DEFI mode defaults to vault matrix)
7. Map emphasis (e.g. AGENCY mode highlights job board POIs)

**Hub Color Codes:**
- WORLD: signal-green (#00FF9D)
- CREATOR: cyber-cyan (#00D4FF)
- DEFI: void-purple (#7C00FF)
- DAO: psx-blue (#3B82F6)
- AGENCY: red (#FF6B6B)
- AI_OPS: lime (#BEFF00)

### 🚀 Integration Steps

1. **Update HUDRoot.tsx** to use `VoidHudApp` instead of `WorldHubV2` for PC mode
2. **Create layout components** (Header, LeftRail, RightRail, Footer)
3. **Implement hub-aware components**:
   - PlayerChip with clickable wallet/level/agency
   - HubEconomyStrip with ticker + mode chips
   - BIG MiniMap with landmarks
   - BottomDock with 14 app icons
4. **Update existing windows** to be hub-aware
5. **Implement FX system**:
   - Mission complete → chrome pulse
   - Token gain → floating numbers
   - Chat message → spine glow
   - Hub switch → sweep animation

### 📁 File Structure

```
hud/
  theme.ts ✅
  windowTypes.ts ✅
  VoidHudApp.tsx ✅
  VoidHudLayout.tsx ✅
  VoidWindowShell.tsx (to create)
  layout/
    VoidHudHeader.tsx
    VoidLeftRail.tsx
    VoidRightRail.tsx
    VoidHudFooter.tsx
  header/
    PlayerChip.tsx
    HubEconomyStrip.tsx
    MiniMapPanel.tsx
  rails/
    MissionList.tsx
    SocialSnapshot.tsx
    EmissionPanel.tsx
    AiFeedPanel.tsx
    ChatPanelSpiny.tsx
  footer/
    ContextActionBar.tsx
    BottomDock.tsx
  windows/ (existing, update for hub awareness)
```

### 🎮 Testing Checklist

- [ ] No vertical/horizontal scrollbars on main page
- [ ] Hub mode chips change entire HUD theme
- [ ] All dock icons open correct windows
- [ ] Minimap POIs are clickable and open correct windows
- [ ] Ticker prices are clickable
- [ ] Player chip elements (wallet, level, agency) are clickable
- [ ] Windows fit in center bay (70vw × 70vh)
- [ ] Windows don't touch header/footer
- [ ] Chat messages have hub-colored spines
- [ ] Missions filter by hub mode
- [ ] AI logs filter by hub mode
- [ ] FX triggers on hub switch, mission complete, token gain

### ⚡ Next Actions

1. Create `VoidWindowShell.tsx` with chrome frame + hub theming
2. Create header components (PlayerChip, HubEconomyStrip, MiniMapPanel)
3. Create rail components (LeftRail, RightRail with all panels)
4. Create footer components (ContextActionBar, BottomDock)
5. Update `HUDRoot.tsx` to route to `VoidHudApp` for PC
6. Test hub switching and window opening
7. Implement FX animations
8. Wire all clickables

**Current Status: Foundation complete, components in progress**
