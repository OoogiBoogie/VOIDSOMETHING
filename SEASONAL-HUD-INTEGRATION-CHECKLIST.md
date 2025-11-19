# SEASONAL BURN SYSTEM - HUD INTEGRATION CHECKLIST

**Integration Phase:** POST-VALIDATION  
**Target:** VoidHudApp.tsx + HUD Window System  
**Protection:** DO NOT modify permanent burn system

---

## ARCHITECTURE OVERVIEW

```
VoidHudApp.tsx
├── HUD Window Registry (windowConfig)
│   ├── Permanent Windows (Protected)
│   │   ├── Land Tab
│   │   ├── Cosmetics
│   │   ├── Economy
│   │   └── etc.
│   └── Seasonal Windows (NEW)
│       ├── Season Dashboard
│       ├── XP Progress
│       └── Seasonal Actions
│
├── Feature Flags
│   ├── ENABLE_SEASONAL_BURN_UI (controls seasonal windows)
│   └── Permanent flags (untouched)
│
└── State Management
    ├── Permanent burn state (Protected)
    └── Seasonal burn state (NEW)
```

---

## INTEGRATION STRATEGY

### 1. DUAL-SYSTEM ARCHITECTURE

The seasonal burn system runs **in parallel** with the permanent system:

```typescript
// PROTECTED - Do NOT modify
const permanentBurnContracts = {
  VoidBurnUtility: '0x...',        // Original
  DistrictAccessBurn: '0x...',     // Original
  // etc.
};

// NEW - Seasonal system
const seasonalBurnContracts = {
  VoidBurnUtilitySeasonal: '0x977087456Dc0f52d28c529216Bab573C2EF293f3',
  DistrictAccessBurnSeasonal: '0xbBa6f04577aE216A6FF5E536C310194711cE57Ae',
  // etc.
};

// Runtime selection
const activeBurnContracts = isSeasonalEnabled() 
  ? seasonalBurnContracts 
  : permanentBurnContracts;
```

### 2. NO CONFLICTS - NAMESPACE SEPARATION

- **Permanent system:** Uses existing hooks (`useBurnSystem`, `useDistricts`, etc.)
- **Seasonal system:** Uses NEW hooks (`useSeasonalBurn`, `useSeasonalDistricts`, etc.)
- **HUD components:** Conditionally render based on feature flag

---

## STEP 1: Feature Flag Setup

### 1.1 Add Feature Flag Check Utility

Create `utils/featureFlags.ts`:

```typescript
export function isSeasonalBurnEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI === 'true';
}

export function getCurrentSystemVersion(): 'permanent' | 'seasonal' {
  return isSeasonalBurnEnabled() ? 'seasonal' : 'permanent';
}

export function getBurnSystemContracts() {
  if (isSeasonalBurnEnabled()) {
    return import('@/config/burnContractsSeasonal');
  }
  return import('@/config/burnContracts'); // Original
}
```

### 1.2 Environment Variable

Already added in `.env.local`:
```bash
NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI=true
```

---

## STEP 2: HUD Window Registry Integration

### 2.1 Locate Window Registry

File: `hud/VoidHudApp.tsx` or `hud/windowConfig.ts`

**Pattern to find:**
```typescript
const windowConfig = {
  land: { id: 'land', title: 'Land', component: LandPanel, ... },
  cosmetics: { id: 'cosmetics', title: 'Cosmetics', ... },
  // etc.
};
```

### 2.2 Add Seasonal Windows (CONDITIONAL)

```typescript
import { isSeasonalBurnEnabled } from '@/utils/featureFlags';
import SeasonDashboard from '@/hud/windows/SeasonDashboard';
import SeasonalXPPanel from '@/hud/windows/SeasonalXPPanel';
import SeasonalActionsPanel from '@/hud/windows/SeasonalActionsPanel';

const windowConfig = {
  // ═══════════════════════════════════════════════════════════════════════
  // PERMANENT WINDOWS (Protected - DO NOT MODIFY)
  // ═══════════════════════════════════════════════════════════════════════
  land: { 
    id: 'land', 
    title: 'Land', 
    component: LandPanel,
    permanent: true, // Mark as permanent
  },
  cosmetics: { 
    id: 'cosmetics', 
    title: 'Cosmetics', 
    component: CosmeticsPanel,
    permanent: true,
  },
  // ... other permanent windows ...
  
  // ═══════════════════════════════════════════════════════════════════════
  // SEASONAL WINDOWS (NEW - Only show if enabled)
  // ═══════════════════════════════════════════════════════════════════════
  ...(isSeasonalBurnEnabled() && {
    seasonDashboard: {
      id: 'seasonDashboard',
      title: 'Season 0',
      component: SeasonDashboard,
      icon: '⏱️',
      category: 'seasonal',
    },
    seasonalXP: {
      id: 'seasonalXP',
      title: 'XP Progress',
      component: SeasonalXPPanel,
      icon: '⭐',
      category: 'seasonal',
    },
    seasonalActions: {
      id: 'seasonalActions',
      title: 'Seasonal Actions',
      component: SeasonalActionsPanel,
      icon: '🎯',
      category: 'seasonal',
    },
  }),
};
```

### 2.3 Filter Windows by Feature Flag

```typescript
// In HUD rendering logic
const availableWindows = Object.entries(windowConfig).filter(([key, config]) => {
  // Always show permanent windows
  if (config.permanent) return true;
  
  // Show seasonal windows only if enabled
  if (config.category === 'seasonal') {
    return isSeasonalBurnEnabled();
  }
  
  return true;
});
```

---

## STEP 3: Create Seasonal HUD Components

### 3.1 Season Dashboard Component

File: `hud/windows/SeasonDashboard.tsx`

```typescript
import { useSeasonalBurn } from '@/hooks/useSeasonalBurn';
import { formatTimeRemaining } from '@/utils/seasonalBurnUtils';

export default function SeasonDashboard() {
  const { currentSeasonId, currentSeason, loading } = useSeasonalBurn();
  
  if (loading) return <div>Loading Season Data...</div>;
  if (!currentSeason) return <div>No active season</div>;
  
  const timeRemaining = formatTimeRemaining(currentSeason.endTime);
  
  return (
    <div className="season-dashboard">
      <h2>Season {currentSeasonId?.toString()}</h2>
      <div className="season-time">
        <span>⏱️ {timeRemaining.formatted} remaining</span>
      </div>
      <div className="season-caps">
        <div>Daily Cap: {formatEther(currentSeason.dailyCreditCap)} VOID</div>
        <div>Season Cap: {formatEther(currentSeason.seasonCreditCap)} VOID</div>
      </div>
    </div>
  );
}
```

### 3.2 Seasonal XP Panel

File: `hud/windows/SeasonalXPPanel.tsx`

```typescript
import { useSeasonalBurn } from '@/hooks/useSeasonalBurn';
import { SeasonalBurnDisplay } from '@/components/SeasonalBurnDisplay';

export default function SeasonalXPPanel() {
  return (
    <div className="seasonal-xp-panel">
      <SeasonalBurnDisplay />
    </div>
  );
}
```

### 3.3 Seasonal Actions Panel

File: `hud/windows/SeasonalActionsPanel.tsx`

```typescript
import { useSeasonalDistricts } from '@/hooks/useSeasonalDistricts'; // Create this
import { useSeasonalLand } from '@/hooks/useSeasonalLand'; // Create this

export default function SeasonalActionsPanel() {
  const { unlockDistrict, isLoading: districtLoading } = useSeasonalDistricts();
  const { upgradeLand, isLoading: landLoading } = useSeasonalLand();
  
  return (
    <div className="seasonal-actions">
      <h3>Seasonal Actions</h3>
      
      <div className="action-section">
        <h4>Districts</h4>
        <button 
          onClick={() => unlockDistrict(2, parseEther('1000'))}
          disabled={districtLoading}
        >
          Unlock District 2 (1000 VOID)
        </button>
      </div>
      
      <div className="action-section">
        <h4>Land Upgrades</h4>
        <button 
          onClick={() => upgradeLand(tokenId, parseEther('500'))}
          disabled={landLoading}
        >
          Upgrade Land (500 VOID)
        </button>
      </div>
    </div>
  );
}
```

---

## STEP 4: HUD Shell Logic Updates

### 4.1 Add Seasonal Indicator to HUD Header

```typescript
// In HUD header/toolbar
import { isSeasonalBurnEnabled, getCurrentSystemVersion } from '@/utils/featureFlags';

function HUDHeader() {
  const systemVersion = getCurrentSystemVersion();
  
  return (
    <div className="hud-header">
      {/* Existing header content */}
      
      {isSeasonalBurnEnabled() && (
        <div className="season-badge">
          <span className="season-icon">⏱️</span>
          <span className="season-text">Season 0</span>
        </div>
      )}
      
      <div className="system-version">
        {systemVersion === 'seasonal' ? 'Seasonal' : 'Permanent'}
      </div>
    </div>
  );
}
```

### 4.2 Update HUD State Management

```typescript
// In main HUD state (VoidHudApp.tsx or similar)
import { useSeasonalBurn } from '@/hooks/useSeasonalBurn';
import { useBurnSystem } from '@/hooks/useBurnSystem'; // Original

function VoidHudApp() {
  // PROTECTED - Permanent system (keep existing)
  const permanentBurnSystem = useBurnSystem();
  
  // NEW - Seasonal system (only if enabled)
  const seasonalBurnSystem = useSeasonalBurn();
  
  // Select active system based on feature flag
  const activeBurnSystem = isSeasonalBurnEnabled() 
    ? seasonalBurnSystem 
    : permanentBurnSystem;
  
  return (
    <HUDContext.Provider value={{ burnSystem: activeBurnSystem }}>
      {/* HUD content */}
    </HUDContext.Provider>
  );
}
```

---

## STEP 5: Conflict Prevention

### 5.1 Namespace Separation Rules

**PROTECTED NAMESPACES (Do NOT modify):**
- `useBurnSystem` → Permanent
- `useDistricts` → Permanent
- `useLandUpgrade` → Permanent
- `burnContracts.ts` → Permanent
- Original HUD windows → Permanent

**NEW SEASONAL NAMESPACES:**
- `useSeasonalBurn` → Seasonal
- `useSeasonalDistricts` → Seasonal
- `useSeasonalLand` → Seasonal
- `burnContractsSeasonal.ts` → Seasonal
- Seasonal HUD windows → Seasonal

### 5.2 Component Naming Convention

```
PERMANENT (Protected):
- LandPanel.tsx
- DistrictPanel.tsx
- BurnActionButton.tsx

SEASONAL (New):
- SeasonalLandPanel.tsx
- SeasonalDistrictPanel.tsx
- SeasonalBurnActionButton.tsx
```

### 5.3 Runtime Isolation

```typescript
// Each component checks its own flag
function SeasonalLandPanel() {
  if (!isSeasonalBurnEnabled()) {
    return null; // Don't render if seasonal disabled
  }
  
  return <div>Seasonal land content</div>;
}

function LandPanel() {
  if (isSeasonalBurnEnabled()) {
    return <SeasonalLandPanel />; // Delegate to seasonal version
  }
  
  return <div>Permanent land content</div>;
}
```

---

## STEP 6: Integration Testing Checklist

### Before Integration
- [ ] Feature flag (`NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI`) is set
- [ ] All 7 seasonal contracts validated
- [ ] ABIs loaded correctly
- [ ] `useSeasonalBurn` hook tested in isolation

### During Integration
- [ ] Seasonal windows appear in HUD registry
- [ ] Seasonal windows only show when flag is `true`
- [ ] Permanent windows still work with flag `true`
- [ ] Permanent windows still work with flag `false`
- [ ] No console errors about undefined contracts
- [ ] Season badge appears in HUD header

### After Integration
- [ ] Can toggle between permanent/seasonal with flag
- [ ] No state conflicts between systems
- [ ] Both systems coexist peacefully
- [ ] HUD performance not degraded
- [ ] Mobile HUD works correctly

---

## STEP 7: Feature Flag Toggle Protocol

### To ENABLE Seasonal System
1. Set `.env.local`: `NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI=true`
2. Restart Next.js dev server
3. Verify seasonal windows appear in HUD
4. Verify season badge shows in header
5. Verify `useSeasonalBurn` returns data

### To DISABLE Seasonal System
1. Set `.env.local`: `NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI=false`
2. Restart Next.js dev server
3. Verify seasonal windows removed from HUD
4. Verify permanent system still works
5. Verify no seasonal console logs

---

## PROTECTION CHECKLIST

### ❌ DO NOT MODIFY

- [ ] VoidBurnUtility.sol (original contract)
- [ ] Any permanent burn module contracts
- [ ] District system (Phase 8/9)
- [ ] World engine coordinates
- [ ] Permanent burn hooks (`useBurnSystem`, etc.)
- [ ] Original HUD window components
- [ ] Tokenomics or fee distribution

### ✅ SAFE TO MODIFY

- [ ] `burnContractsSeasonal.ts` (new file)
- [ ] `useSeasonalBurn.ts` (new hook)
- [ ] Seasonal HUD components (new files)
- [ ] Feature flag checks
- [ ] HUD window registry (additive only)
- [ ] Seasonal utility functions

---

## SUCCESS CRITERIA

✅ **Seasonal windows appear in HUD (when flag is true)**  
✅ **Permanent windows still work (with or without flag)**  
✅ **No console errors or warnings**  
✅ **Feature flag toggles system correctly**  
✅ **Both systems never conflict**  
✅ **Season badge shows in HUD header**  
✅ **Mobile HUD supports seasonal windows**

---

## NEXT PHASE

After integration checklist passes → **PRE-QA VALIDATION** → **Begin T1 Test Cases**

---

**Integration Target:** VoidHudApp.tsx + Window Registry  
**Protection Level:** MAXIMUM (permanent system)  
**Isolation Strategy:** Dual-system with feature flag gating
