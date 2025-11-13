# PHASE 0 — INTEGRATION AUDIT

## Current State Analysis

### ✅ REUSE AS-IS
1. **Core Systems** (lib/xp-system/*)
   - xp-utils.ts - Progressive formula, task generator
   - xp-store.ts - Zustand store with event-driven updates
   - **Status**: Perfect, keep 100%

2. **Shared Components** (components/ui/unified-hud/shared/)
   - PlayerChip.tsx - Top-left identity card
   - TokenTicker.tsx - VOID/PSX prices
   - MapWidget.tsx - Mini-map
   - CommsBubble.tsx - Chat access
   - ContextAction.tsx - Interaction button
   - **Status**: Good foundation, minor positioning tweaks

3. **Core Engine** (DO NOT TOUCH)
   - Character controller
   - Multiplayer/netcode
   - Level streaming
   - Wallet auth pipeline
   - Land registry

4. **State Management**
   - lib/hud-state.ts - HUD state enum (needs cleanup)
   - lib/app-folders.ts - Folder definitions
   - lib/input-mode.ts - LOGIN vs WORLD

### 🔧 EXTEND/MODIFY
1. **XPWidget**
   - Current: Separate widget on left side
   - **New**: Integrate into bottom folder row
   - Keep component, change positioning

2. **AppHub**
   - Current: Full-screen overlay with folder grid
   - **Problem**: Takes over entire screen
   - **New**: Bottom row of compact tiles, panels slide UP above row
   - Major redesign needed

3. **MapWidget**
   - Current: Basic mini-map
   - **Extend**: Add DEX icons, districts, roads, portals
   - Keep component, add data integration

4. **HUD State Manager**
   - Current: 9 states (too many)
   - **New**: 4 base states + 3 overlay states
   - Simplify enum

### 🗑️ REMOVE COMPLETELY
1. **Old HUD Systems** (CRITICAL - These are causing overlaps)
   - components/hud-v2/* - Old glassmorphism test (7 files)
   - components/mobile-hud-controller.tsx - Old mobile HUD
   - components/mobile-hud-lite.tsx - Old lite HUD
   - **Action**: Delete all, remove imports from page.tsx

2. **page.tsx State Variables**
   - `hudV2Enabled` - Remove
   - `hudMode` ("lite" | "full") - Remove
   - `showLiteHUD` - Remove
   - Multiple HUD toggle handlers

3. **Desktop HUD Current Implementation**
   - components/ui/unified-hud/desktop/DesktopHUD.tsx
   - **Problem**: XPWidget positioned separately, AppWheel replaced but wrong pattern
   - **Action**: Complete redesign to bottom-row folder tiles

### 🔁 MERGE/CONSOLIDATE
1. **Four HUD Layouts Only**
   - **HUD_PC** - Desktop (redesign DesktopHUD.tsx)
   - **HUD_Mobile_Roam** - Mobile full 3D
   - **HUD_Mobile_LitePortrait** - Phone portrait
   - **HUD_Mobile_LiteLandscape** - Tablet landscape

2. **Single HUD Manager**
   - One component controls which of 4 HUDs renders
   - Based on: device type + orientation
   - No manual toggles

3. **Bottom Row Folder System**
   - 7 folders as compact tiles (30-40px height)
   - Each shows 3-4 mini-icons inside
   - Click → panel slides UP 200-300px above row
   - Panel shows folder's apps in grid
   - Click outside or other folder → closes current

---

## Critical Issues Found

### 🚨 OVERLAP PROBLEM
**Root Cause**: Multiple HUD systems rendering simultaneously
- Line 1178-1204: HUDv2 rendering (when `hudV2Enabled`)
- Line 1207-1262: DesktopHUD rendering (when `unifiedHUDEnabled`)
- Line 1149-1176: MobileHUDController rendering (mobile)
- Line 1103-1148: MobileHUDLite rendering (showLiteHUD)

**Solution**: Delete ALL old HUDs, keep only 4 new ones

### 🚨 HORIZONTAL MENU PROBLEM
**Current**: AppHub opens as full-screen overlay
**Issue**: Disrupts gameplay, hides world
**Fix**: Folders as persistent bottom row, panels slide up inline

### 🚨 XP WIDGET POSITIONING
**Current**: Positioned on left edge separately
**Issue**: Doesn't feel integrated with folder system
**Fix**: XP becomes part of bottom row (end position)

---

## Implementation Strategy

### Step 1: CLEANUP (Immediate)
1. Delete `components/hud-v2/` directory
2. Delete `components/mobile-hud-controller.tsx`
3. Delete `components/mobile-hud-lite.tsx`
4. Remove all imports from page.tsx
5. Remove `hudV2Enabled`, `hudMode`, `showLiteHUD` state
6. Remove Blade menu HUD toggles

### Step 2: REDESIGN BOTTOM ROW (Core Fix)
1. Create `BottomFolderRow.tsx` component
   - 7 folder tiles horizontally
   - Each tile: 30-40px height, shows 3-4 mini-icons
   - XPWidget at end of row
   - Hover → highlight
   - Click → `setActiveFolder(folderId)`

2. Create `FolderPanel.tsx` component
   - Slides up from bottom (200-300px height)
   - Shows selected folder's apps in grid
   - Glass background
   - Click outside → close

3. Integrate into HUD_PC
   - Top: PlayerChip, TokenTicker, MapWidget (keep)
   - Left: ChatPanel (keep)
   - Bottom: BottomFolderRow + FolderPanel above it
   - Center: ContextAction (keep)

### Step 3: BUILD 4 HUD LAYOUTS
1. **HUD_PC.tsx**
   - Uses BottomFolderRow
   - Full shared components

2. **HUD_Mobile_Roam.tsx**
   - Compact versions
   - Bottom: 3-4 folder tiles (scroll horizontal)
   - Swipe gestures

3. **HUD_Mobile_LitePortrait.tsx**
   - Minimal UI
   - Bottom: 3 critical folders only
   - Scrollable feed above

4. **HUD_Mobile_LiteLandscape.tsx**
   - Horizontal layout
   - Folder row at bottom

### Step 4: HUD MANAGER
```tsx
function HUDManager() {
  const isMobile = useIsMobile()
  const orientation = useOrientation()
  
  if (!isMobile) return <HUD_PC />
  if (orientation === 'portrait') return <HUD_Mobile_LitePortrait />
  if (orientation === 'landscape') return <HUD_Mobile_LiteLandscape />
  return <HUD_Mobile_Roam />
}
```

### Step 5: STATE CLEANUP
```tsx
enum HUDState {
  // Base states (only one active)
  PCView,
  MobileRoam,
  MobileLitePortrait,
  MobileLiteLandscape,
  
  // Overlay states (additive)
  MapOpen,
  PopupActive,
  NotificationTray,
}
```

---

## File Structure (After Cleanup)

```
components/ui/hud/
├── Shared/
│   ├── PlayerChip.tsx          ✅ Keep
│   ├── TokenTicker.tsx         ✅ Keep
│   ├── MapWidget.tsx           🔧 Extend (DEX data)
│   ├── ChatPanel.tsx           ✅ Keep
│   ├── ContextAction.tsx       ✅ Keep
│   ├── XPWidget.tsx            🔧 Modify (position)
│   ├── BottomFolderRow.tsx     🆕 New
│   └── FolderPanel.tsx         🆕 New
├── PC/
│   └── HUD_PC.tsx              🔧 Redesign
├── Mobile/
│   ├── HUD_Mobile_Roam.tsx     🆕 New
│   ├── HUD_Mobile_LitePortrait.tsx  🆕 New
│   └── HUD_Mobile_LiteLandscape.tsx 🆕 New
└── HUDManager.tsx              🆕 New

lib/
├── hud-state.ts                🔧 Simplify enum
├── app-folders.ts              ✅ Keep
└── xp-system/                  ✅ Keep all

🗑️ DELETE:
├── components/hud-v2/          ❌ Remove entire folder
├── components/mobile-hud-controller.tsx  ❌ Remove
├── components/mobile-hud-lite.tsx        ❌ Remove
└── components/ui/unified-hud/desktop/DesktopHUD.tsx  🔧 Replace
```

---

## Next Actions (In Order)

1. ✅ Delete old HUD files
2. ✅ Clean page.tsx imports and state
3. ✅ Build BottomFolderRow component
4. ✅ Build FolderPanel component
5. ✅ Redesign HUD_PC with bottom row
6. ✅ Build HUDManager
7. ✅ Test PC layout (no overlaps)
8. Build mobile HUDs
9. Extend MapWidget with DEX data
10. Final QA

---

**Ready to proceed with cleanup?**
