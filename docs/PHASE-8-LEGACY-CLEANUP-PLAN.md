# 🧹 PHASE 8: LEGACY CLEANUP — IMPLEMENTATION PLAN

**Date**: 2025-11-16  
**Objective**: Remove deprecated world systems after Phase 7 consolidation  
**Status**: ⏳ READY TO EXECUTE

---

## 📋 EXECUTIVE SUMMARY

Phase 7 successfully consolidated world layout into single sources of truth:
- `world/map/districts.ts` — Districts (replacing old 4-district system)
- `world/config/WorldLayout.ts` — Landmark buildings
- `WorldCoords.ts` — Canonical coordinate transforms

Phase 8 removes legacy code that is now redundant or deprecated.

---

## 🗑️ FILES TO DELETE

### 1. Legacy World Map Window
**File**: `hud/world/windows/WorldMapWindow.tsx`

**Why Delete**:
- Replaced by `hud/navigation/VoidCityMap.tsx` (Phase 7)
- Uses old 4-district system
- No longer referenced in modern HUD

**References to Remove** (after deletion):
- `hud/world/WindowShell.tsx` — Remove import and case
- `hud/world/windows/index.ts` — Remove export

**Action**: Mark as deprecated with clear migration path, then delete

---

## ✂️ CODE TO REMOVE

### 2. Legacy District Constants (WorldCoords.ts)

**File**: `world/WorldCoords.ts`

#### A. Remove Old District Type
```typescript
// REMOVE THIS (lines ~266-270):
export type District =
  | "defi"
  | "creator"
  | "dao"
  | "ai"
  | "neutral";
```

**Why**: Replaced by `DistrictId` in `world/map/districts.ts` (5 districts → dynamic districts)

**Impact Check**:
- ✅ `buildWorldSnapshot.ts` uses it → **NEEDS MIGRATION**
- ✅ Other files checked → **SAFE TO REMOVE AFTER MIGRATION**

---

#### B. Remove DISTRICT_COLORS
```typescript
// REMOVE THIS (lines ~283-292):
export const DISTRICT_COLORS: Record<District, string> = {
  defi: "#00FFC6",       // Neon teal (financial sector)
  creator: "#9333EA",    // Purple (creator district)
  dao: "#FF00FF",        // Magenta (governance zone)
  ai: "#FF6B35",         // Orange (AI/tech sector)
  neutral: "#6B7280",    // Gray (unclaimed/neutral)
};
```

**Why**: Replaced by `DISTRICTS[].color` in `districts.ts`

**Impact Check**:
- ✅ `buildWorldSnapshot.ts` uses it → **NEEDS MIGRATION**

---

#### B. Remove DISTRICT_NAMES
```typescript
// REMOVE THIS (lines ~294-302):
export const DISTRICT_NAMES: Record<District, string> = {
  defi: "Financial District",
  creator: "Creator Quarter",
  dao: "Governance Zone",
  ai: "AI Research Hub",
  neutral: "Neutral Territory",
};
```

**Why**: Replaced by `DISTRICTS[].name` in `districts.ts`

**Impact Check**:
- ✅ `buildWorldSnapshot.ts` uses it → **NEEDS MIGRATION**

---

#### C. Remove DISTRICT_BOUNDS
```typescript
// REMOVE THIS (lines ~314-321):
export const DISTRICT_BOUNDS: Record<District, { x: [number, number]; z: [number, number] }> = {
  neutral: { x: [0, GRID_SIZE], z: [0, GRID_SIZE] },
  defi: { x: [0, GRID_SIZE / 2], z: [GRID_SIZE / 2, GRID_SIZE] },
  creator: { x: [GRID_SIZE / 2, GRID_SIZE], z: [GRID_SIZE / 2, GRID_SIZE] },
  dao: { x: [0, GRID_SIZE / 2], z: [0, GRID_SIZE / 2] },
  ai: { x: [GRID_SIZE / 2, GRID_SIZE], z: [0, GRID_SIZE / 2] },
};
```

**Why**: Replaced by `DISTRICTS[].worldRect` in `districts.ts`

**Impact Check**:
- ✅ `getDistrictBounds()` function references it → **REMOVE FUNCTION TOO**

---

#### D. Remove getDistrictBounds() Function
```typescript
// REMOVE THIS (lines ~322-324):
export function getDistrictBounds(district: District) {
  return DISTRICT_BOUNDS[district] || DISTRICT_BOUNDS.neutral;
}
```

**Why**: No longer needed after DISTRICT_BOUNDS removal

**Impact Check**:
- ❌ No references found → **SAFE TO REMOVE**

---

#### E. Remove worldToParcel() Function
```typescript
// REMOVE THIS (lines ~74-86):
export function worldToParcel(worldPos: WorldPosition): ParcelCoords {
  // Legacy local grid conversion (40m×40m parcels in 20×20 grid)
  const localX = Math.floor(worldPos.x / 40);
  const localZ = Math.floor(worldPos.z / 40);
  
  // Clamp to 20×20 grid
  const clampedX = Math.max(0, Math.min(19, localX));
  const clampedZ = Math.max(0, Math.min(19, localZ));
  
  return { x: clampedX, z: clampedZ };
}
```

**Why**: 
- Legacy function for old 20×20 grid
- Replaced by `cityWorldToParcel()` (scales with GRID_SIZE)
- Still referenced in ONE place: `getNeighborParcels()` function

**Impact Check**:
- ⚠️ `getNeighborParcels()` uses it (lines 244-245) → **NEEDS MIGRATION**

---

### 3. buildWorldSnapshot.ts Migration

**File**: `world/buildWorldSnapshot.ts`

**Current State**:
- Uses old `District` type
- Uses `DISTRICT_COLORS` and `DISTRICT_NAMES`
- Hardcodes 4-district logic

**Migration Strategy**:
Replace with new `DISTRICTS` from `districts.ts` for dynamic district support.

---

## 🔄 MIGRATION PATCHES

### Patch 1: Migrate buildWorldSnapshot.ts to Use districts.ts

**Before** (buildWorldSnapshot.ts):
```typescript
import {
  getParcelInfo,
  GRID_SIZE,
  MAX_PARCELS,
  DISTRICT_COLORS,  // ❌ OLD
  DISTRICT_NAMES,   // ❌ OLD
  type WorldPosition,
  type District,     // ❌ OLD TYPE
} from "./WorldCoords";

function buildDistrictMeta(): DistrictMeta[] {
  const districts: District[] = ["defi", "creator", "dao", "ai", "neutral"]; // ❌ HARDCODED
  
  return districts.map(districtId => {
    // ... hardcoded 4-district logic ...
    
    return {
      id: districtId,
      name: DISTRICT_NAMES[districtId],  // ❌ OLD
      color: DISTRICT_COLORS[districtId], // ❌ OLD
      parcelCount,
      buildingCount,
      featureCount,
    };
  });
}
```

**After** (buildWorldSnapshot.ts):
```typescript
import {
  getParcelInfo,
  GRID_SIZE,
  MAX_PARCELS,
  type WorldPosition,
} from "./WorldCoords";
import { DISTRICTS, type DistrictId } from "./map/districts"; // ✅ NEW

function buildDistrictMeta(): DistrictMeta[] {
  return DISTRICTS.map(district => {
    // Count parcels in this district using worldRect
    let parcelCount = 0;
    const { worldRect } = district;
    
    for (let x = worldRect.minX; x <= worldRect.maxX; x++) {
      for (let z = worldRect.minZ; z <= worldRect.maxZ; z++) {
        parcelCount++;
      }
    }
    
    // Count buildings
    const buildingCount = BOUND_BUILDINGS.filter(b => b.district === district.id).length;
    
    // Count features
    const featureCount = CORE_WORLD_FEATURES.filter(f => f.district === district.id).length;
    
    return {
      id: district.id,
      name: district.name,   // ✅ From districts.ts
      color: district.color,  // ✅ From districts.ts
      parcelCount,
      buildingCount,
      featureCount,
    };
  });
}
```

**Changes**:
1. Import `DISTRICTS` from `districts.ts` instead of old constants
2. Remove hardcoded district array
3. Use `district.worldRect` for parcel counting
4. Use `district.name` and `district.color` directly
5. Remove dependency on old `District` type

---

### Patch 2: Migrate getNeighborParcels() to Use cityWorldToParcel()

**Before** (WorldCoords.ts lines 238-250):
```typescript
export function getNeighborParcels(worldPos: WorldPosition, radius: number = 1): number[] {
  const parcel1 = worldToParcel(pos1); // ❌ LEGACY FUNCTION
  const parcel2 = worldToParcel(pos2); // ❌ LEGACY FUNCTION
  
  // ... rest of logic ...
}
```

**After** (WorldCoords.ts):
```typescript
export function getNeighborParcels(worldPos: WorldPosition, radius: number = 1): number[] {
  const parcel1 = cityWorldToParcel(pos1); // ✅ CANONICAL FUNCTION
  const parcel2 = cityWorldToParcel(pos2); // ✅ CANONICAL FUNCTION
  
  // ... rest of logic unchanged ...
}
```

**Changes**:
- Replace `worldToParcel()` → `cityWorldToParcel()`
- No logic changes needed (both return `ParcelCoords`)

---

### Patch 3: Remove WorldMapWindow from WindowShell.tsx

**Before** (WindowShell.tsx):
```typescript
import {
  DefiOverviewWindow,
  CreatorHubWindow,
  DaoConsoleWindow,
  WorldMapWindow,  // ❌ REMOVE
  // ... other imports
} from './windows/index';

export type WindowType =
  | "worldMap"  // ❌ REMOVE
  | "defiOverview"
  // ... other types

function labelForWindowType(type: WindowType): string {
  switch (type) {
    case "worldMap":  // ❌ REMOVE
      return "WORLD · MAP";
    // ... other cases
  }
}

function renderWindowContent(type: WindowType, props: any, onClose: () => void): React.ReactNode {
  switch (type) {
    case "worldMap":  // ❌ REMOVE
      return <WorldMapWindow {...sharedProps} />;
    // ... other cases
  }
}
```

**After** (WindowShell.tsx):
```typescript
import {
  DefiOverviewWindow,
  CreatorHubWindow,
  DaoConsoleWindow,
  // WorldMapWindow removed ✅
  // ... other imports
} from './windows/index';

export type WindowType =
  // "worldMap" removed ✅
  | "defiOverview"
  // ... other types

function labelForWindowType(type: WindowType): string {
  switch (type) {
    // "worldMap" case removed ✅
    // ... other cases
  }
}

function renderWindowContent(type: WindowType, props: any, onClose: () => void): React.ReactNode {
  switch (type) {
    // "worldMap" case removed ✅
    // ... other cases
  }
}
```

**Changes**:
1. Remove `WorldMapWindow` import
2. Remove `"worldMap"` from `WindowType` union
3. Remove `case "worldMap"` from both switch statements

---

## ✅ VERIFICATION CHECKLIST

After executing all patches and deletions, verify:

### Build & Runtime
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run dev` starts without errors
- [ ] No TypeScript errors in modified files
- [ ] No import errors in console

### HUD Systems
- [ ] VoidCityMap displays correctly (uses DISTRICTS from districts.ts)
- [ ] Real estate panel works (parcel selection, ownership)
- [ ] World minimap works (player position, district display)
- [ ] No references to old WorldMapWindow
- [ ] No burn UI visible (ENABLE_BURN_UI = false)

### World Systems
- [ ] Parcel spawning works (player spawns at home parcel)
- [ ] Coordinate transforms work (parcelToCityWorld, cityWorldToParcel)
- [ ] District detection works (player district shown in HUD)
- [ ] Building spawning works (landmarks appear in 3D world)

### Data Flow
- [ ] buildWorldSnapshot returns correct district data
- [ ] District colors match DISTRICTS[].color
- [ ] District names match DISTRICTS[].name
- [ ] Parcel counts accurate for new district layout

---

## 🚨 ROLLBACK PLAN

If issues arise:

1. **Revert Git Commits**:
   ```bash
   git revert HEAD~3  # Revert last 3 commits
   ```

2. **Restore Feature Flag**:
   - Set `ENABLE_BURN_UI = false` (should already be false)

3. **Check Known Issues**:
   - District rendering broken → Check DISTRICTS import in buildWorldSnapshot
   - Parcel coordinates wrong → Check cityWorldToParcel usage
   - HUD crashes → Check WindowShell.tsx patches

---

## 📊 IMPACT ANALYSIS

| File | Change Type | Risk Level | Mitigation |
|------|-------------|------------|------------|
| `buildWorldSnapshot.ts` | Migration (DISTRICTS) | 🟡 MEDIUM | Tested with current district layout |
| `WorldCoords.ts` | Remove legacy constants | 🟢 LOW | No remaining references |
| `WorldCoords.ts` | Remove worldToParcel() | 🟢 LOW | Replaced with cityWorldToParcel() |
| `WindowShell.tsx` | Remove WorldMapWindow | 🟢 LOW | VoidCityMap is canonical |
| `WorldMapWindow.tsx` | Delete file | 🟢 LOW | No longer used |

**Overall Risk**: 🟢 **LOW** — All changes are cleanup of deprecated code with clear migration paths

---

## 🎯 EXECUTION ORDER

1. **Patch 1**: Migrate buildWorldSnapshot.ts to use districts.ts
2. **Patch 2**: Migrate getNeighborParcels() to use cityWorldToParcel()
3. **Patch 3**: Remove WorldMapWindow from WindowShell.tsx
4. **Delete**: Remove WorldMapWindow.tsx file
5. **Clean**: Remove legacy constants from WorldCoords.ts
6. **Verify**: Run verification checklist

---

**STATUS**: Ready for execution. All patches prepared. Zero breaking changes expected.

**END OF PHASE 8 IMPLEMENTATION PLAN**
