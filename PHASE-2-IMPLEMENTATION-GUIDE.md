# 🎯 VOID METAVERSE - PHASE 2 IMPLEMENTATION GUIDE

**Network:** Base Sepolia (Chain ID 84532)  
**Status:** Contracts Deployed ✅ | UI Integration Pending ⏳  
**Goal:** Ship playable testnet metaverse with land + swap + world sync

---

## 📋 QUICK REFERENCE

### Deployed Contracts (DO NOT REDEPLOY)
```typescript
WorldLandTestnet:   "0xC4559144b784A8991924b1389a726d68C910A206"
VoidSwapTestnet:    "0x74bD32c493C9be6237733507b00592e6AB231e4F"
VoidHookRouterV4:   "0x687E678aB2152d9e0952d42B0F872604533D25a9"
VOID:               "0x8de4043445939B0D0Cc7d6c752057707279D9893"
USDC:               "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9"
```

### Existing Hooks (USE THESE - Don't Recreate)
- ✅ `services/world/useParcels()` - All 1600 parcels + ownership
- ✅ `hooks/useWorldLand().buyParcel(parcelId)` - Handle approve + purchase
- ✅ `hooks/useSwap().fetchQuote()` - Get live quote via `getQuote()`
- ✅ `hooks/useSwap().swap({...})` - Execute swap with approval handling

### Contract Function Names (IMPORTANT)
- ✅ VoidSwapTestnet uses `getQuote()` **NOT** `getAmountOut()`
- ✅ WorldLandTestnet has `buyParcel()`, `buyParcels()`, `getParcelsOwnedBy()`, `parcelIdToCoords()`, `isAvailable()`

---

## 🎯 IMPLEMENTATION PRIORITY

### 🔴 CRITICAL PATH (Do First - 4-6 hours)

1. **World Coordinate System** - Foundation for all sync
2. **Event Bus** - 3D ↔ HUD communication
3. **Player Controller Integration** - Publish movement events
4. **LandGridWindow Component** - 40×40 grid UI with buy flow
5. **SwapWindow Component** - VOID ↔ USDC swap UI

### 🟡 IMPORTANT (Do Next - 2-3 hours)

6. **WorldMapOverlay** - Full-screen map with player position
7. **Mini Map Sync** - Top-right zone map follows player
8. **Theme Consistency Pass** - Replace all hardcoded colors

### 🟢 POLISH (Optional - 1-2 hours)

9. **3D Parcel Highlight** - Ground markers for selected parcels
10. **Transaction Feedback** - Toast notifications + Basescan links

---

## 📁 SECTION 1: WORLD ↔ HUD SYNC (START HERE)

### 1.1 Coordinate System

**File:** `world/WorldCoords.ts`

```typescript
export const GRID_SIZE = 40;
export const WORLD_SIZE = 2000; // Three.js units
export const WORLD_MIN_X = -WORLD_SIZE / 2;
export const WORLD_MAX_X = WORLD_SIZE / 2;
export const WORLD_MIN_Z = -WORLD_SIZE / 2;
export const WORLD_MAX_Z = WORLD_SIZE / 2;

export interface WorldPosition {
  x: number; // Three.js world units
  z: number;
}

export interface ParcelAddress {
  parcelId: number; // 0..1599
  gx: number;       // grid x: 0..39
  gz: number;       // grid z: 0..39
}

export function worldToParcel(pos: WorldPosition): ParcelAddress {
  const nx = (pos.x - WORLD_MIN_X) / (WORLD_MAX_X - WORLD_MIN_X);
  const nz = (pos.z - WORLD_MIN_Z) / (WORLD_MAX_Z - WORLD_MIN_Z);
  
  const gx = Math.min(39, Math.max(0, Math.floor(nx * GRID_SIZE)));
  const gz = Math.min(39, Math.max(0, Math.floor(nz * GRID_SIZE)));
  
  return { gx, gz, parcelId: gz * GRID_SIZE + gx };
}

export function parcelToWorldCenter(parcelId: number): WorldPosition {
  const gx = parcelId % GRID_SIZE;
  const gz = Math.floor(parcelId / GRID_SIZE);
  
  const parcelWidth = (WORLD_MAX_X - WORLD_MIN_X) / GRID_SIZE;
  const parcelDepth = (WORLD_MAX_Z - WORLD_MIN_Z) / GRID_SIZE;
  
  return {
    x: WORLD_MIN_X + (gx + 0.5) * parcelWidth,
    z: WORLD_MIN_Z + (gz + 0.5) * parcelDepth,
  };
}

export function parcelIdToGridCoords(parcelId: number): { gx: number; gz: number } {
  return {
    gx: parcelId % GRID_SIZE,
    gz: Math.floor(parcelId / GRID_SIZE),
  };
}
```

**Test This:**
```typescript
// In browser console after importing:
worldToParcel({ x: 0, z: 0 }) // Should return parcel near center (around 800)
parcelToWorldCenter(0)         // Should return bottom-left corner
parcelToWorldCenter(1599)      // Should return top-right corner
```

---

### 1.2 Event Bus

**File:** `services/events/worldEvents.ts`

```typescript
import type { WorldPosition, ParcelAddress } from "@/world/WorldCoords";

export type WorldEvent =
  | { type: "PLAYER_MOVED"; pos: WorldPosition; parcel: ParcelAddress }
  | { type: "PARCEL_ENTERED"; parcel: ParcelAddress }
  | { type: "PARCEL_EXITED"; parcel: ParcelAddress }
  | { type: "HUB_CHANGED"; hub: "WORLD" | "DEFI" | "CREATOR" | "DAO" | "AI_OPS" };

type Listener = (event: WorldEvent) => void;
const listeners: Listener[] = [];

export function subscribeWorldEvents(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

export function publishWorldEvent(event: WorldEvent): void {
  listeners.forEach((listener) => listener(event));
}

// Helper hook for React components
export function useWorldLocation() {
  const [currentParcel, setCurrentParcel] = React.useState<ParcelAddress | null>(null);
  
  React.useEffect(() => {
    return subscribeWorldEvents((event) => {
      if (event.type === "PLAYER_MOVED") {
        setCurrentParcel(event.parcel);
      }
    });
  }, []);
  
  return { currentParcel };
}
```

---

### 1.3 Player Controller Integration

**Find existing file:** `components/player-character-3d.tsx` or similar Three.js controller

**Add this logic to movement update:**

```typescript
import { worldToParcel } from "@/world/WorldCoords";
import { publishWorldEvent } from "@/services/events/worldEvents";

// At top of component/class
let lastParcelId = -1;

// In your movement update loop (throttle to ~10 FPS):
function onPlayerMove(position: { x: number; z: number }) {
  const parcel = worldToParcel(position);
  
  // Always publish movement
  publishWorldEvent({
    type: "PLAYER_MOVED",
    pos: position,
    parcel,
  });
  
  // Only publish enter/exit when crossing parcel boundaries
  if (parcel.parcelId !== lastParcelId) {
    if (lastParcelId !== -1) {
      publishWorldEvent({
        type: "PARCEL_EXITED",
        parcel: { ...parcel, parcelId: lastParcelId, gx: 0, gz: 0 },
      });
    }
    publishWorldEvent({
      type: "PARCEL_ENTERED",
      parcel,
    });
    lastParcelId = parcel.parcelId;
  }
}

// Call from your existing movement code:
// onPlayerMove({ x: character.position.x, z: character.position.z });
```

**Testing:**
1. Walk around in 3D world
2. Open browser console
3. Subscribe to events: 
```typescript
import { subscribeWorldEvents } from "@/services/events/worldEvents";
const unsub = subscribeWorldEvents((e) => console.log(e));
```
4. You should see `PLAYER_MOVED` events ~10 times per second
5. Walking across parcel boundaries should trigger `PARCEL_EXITED` + `PARCEL_ENTERED`

---

## 📁 SECTION 2: UI COMPONENTS

### 2.1 LandGridWindow

**File:** `hud/world/LandGridWindow.tsx`

```typescript
"use client";

import React from "react";
import { useParcels } from "@/services/world/useParcels";
import { useWorldLand } from "@/hooks/useWorldLand";
import { useWorldLocation } from "@/services/events/worldEvents";
import { cn } from "@/lib/utils";

export const LandGridWindow: React.FC = () => {
  const { parcels, isLoading } = useParcels();
  const { buyParcel, isLoading: isBuying } = useWorldLand();
  const { currentParcel } = useWorldLocation();
  
  const [selectedParcelId, setSelectedParcelId] = React.useState<number | null>(null);
  
  const selectedParcel = React.useMemo(() => {
    if (selectedParcelId === null) return null;
    return parcels.find((p) => p.parcel.id === selectedParcelId);
  }, [selectedParcelId, parcels]);
  
  // Auto-select current parcel when player moves
  React.useEffect(() => {
    if (currentParcel) {
      setSelectedParcelId(currentParcel.parcelId);
    }
  }, [currentParcel]);
  
  const handleBuyParcel = async () => {
    if (!selectedParcelId) return;
    await buyParcel(selectedParcelId);
    // Parcels will auto-refresh via hook
  };
  
  return (
    <div className="land-grid-window" style={{
      background: "var(--void-panel-bg)",
      border: "1px solid var(--void-panel-border)",
      borderRadius: "14px",
      padding: "1.5rem",
      maxHeight: "80vh",
      overflow: "auto",
    }}>
      <h2 style={{ color: "var(--void-text-primary)", marginBottom: "1rem" }}>
        WORLD LAND · 40×40 GRID
      </h2>
      
      {/* Grid */}
      <div
        className="parcel-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(40, 1fr)",
          gap: "1px",
          aspectRatio: "1",
          maxWidth: "600px",
          marginBottom: "1rem",
        }}
      >
        {parcels.map((p) => (
          <button
            key={p.parcel.id}
            onClick={() => setSelectedParcelId(p.parcel.id)}
            className={cn(
              "parcel-cell",
              p.isOwnedByUser && "parcel-owned-by-user",
              p.owner && !p.isOwnedByUser && "parcel-owned-by-other",
              currentParcel?.parcelId === p.parcel.id && "parcel-current",
              selectedParcelId === p.parcel.id && "parcel-selected"
            )}
            style={{
              aspectRatio: "1",
              border: "none",
              cursor: "pointer",
              background: p.isOwnedByUser
                ? "rgba(9, 240, 200, 0.32)"
                : p.owner
                ? "rgba(143, 59, 255, 0.18)"
                : "rgba(143, 59, 255, 0.08)",
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>
      
      {/* Parcel Details */}
      {selectedParcel && (
        <div
          className="parcel-details"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid var(--void-panel-border)",
          }}
        >
          <div style={{ color: "var(--void-text-primary)" }}>
            <p><strong>Parcel #{selectedParcel.parcel.id}</strong></p>
            <p>District: {selectedParcel.parcel.district}</p>
            <p>Coordinates: ({selectedParcel.parcel.x}, {selectedParcel.parcel.z})</p>
            <p>Owner: {selectedParcel.owner || "Available"}</p>
            <p>Price: 100 VOID</p>
          </div>
          
          {!selectedParcel.owner && (
            <button
              onClick={handleBuyParcel}
              disabled={isBuying}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, rgba(143,59,255,1), rgba(9,240,200,1))",
                border: "none",
                borderRadius: "999px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                opacity: isBuying ? 0.5 : 1,
              }}
            >
              {isBuying ? "Buying..." : "Buy Parcel (100 VOID)"}
            </button>
          )}
        </div>
      )}
      
      <style jsx>{`
        .parcel-current {
          box-shadow: 0 0 24px rgba(143, 59, 255, 0.8) !important;
        }
        .parcel-selected {
          outline: 2px solid var(--void-neon-teal);
          outline-offset: -2px;
        }
        .parcel-cell:hover {
          transform: scale(1.05);
          box-shadow: 0 0 12px rgba(9, 240, 200, 0.5);
        }
      `}</style>
    </div>
  );
};
```

---

### 2.2 SwapWindow

**File:** `hud/defi/SwapWindow.tsx`

```typescript
"use client";

import React from "react";
import { useSwap } from "@/hooks/useSwap";
import { useAccount, useBalance } from "wagmi";
import { parseUnits, formatUnits } from "viem";

const VOID_ADDRESS = "0x8de4043445939B0D0Cc7d6c752057707279D9893";
const USDC_ADDRESS = "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9";

export const SwapWindow: React.FC = () => {
  const { address } = useAccount();
  const { swap, fetchQuote, isLoading } = useSwap();
  
  const [tokenIn, setTokenIn] = React.useState(VOID_ADDRESS);
  const [amountIn, setAmountIn] = React.useState("");
  const [quote, setQuote] = React.useState<bigint | null>(null);
  
  const tokenOut = tokenIn === VOID_ADDRESS ? USDC_ADDRESS : VOID_ADDRESS;
  const decimalsIn = tokenIn === VOID_ADDRESS ? 18 : 6;
  const decimalsOut = tokenOut === VOID_ADDRESS ? 18 : 6;
  
  const { data: balanceIn } = useBalance({
    address,
    token: tokenIn as `0x${string}`,
  });
  
  // Fetch quote when amount changes
  React.useEffect(() => {
    if (!amountIn || parseFloat(amountIn) === 0) {
      setQuote(null);
      return;
    }
    
    const fetchQuoteAsync = async () => {
      try {
        const amountInWei = parseUnits(amountIn, decimalsIn);
        const quoteResult = await fetchQuote(tokenIn as `0x${string}`, amountInWei);
        setQuote(quoteResult);
      } catch (error) {
        console.error("Quote error:", error);
        setQuote(null);
      }
    };
    
    const debounce = setTimeout(fetchQuoteAsync, 300);
    return () => clearTimeout(debounce);
  }, [amountIn, tokenIn, decimalsIn, fetchQuote]);
  
  const handleSwap = async () => {
    if (!amountIn || !quote) return;
    
    const amountInWei = parseUnits(amountIn, decimalsIn);
    const minOut = (quote * 995n) / 1000n; // 0.5% slippage
    
    await swap({
      tokenIn: tokenIn as `0x${string}`,
      tokenOut: tokenOut as `0x${string}`,
      amountIn: amountInWei,
      slippage: 0.5,
    });
    
    setAmountIn("");
    setQuote(null);
  };
  
  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setAmountIn("");
    setQuote(null);
  };
  
  return (
    <div
      className="swap-window"
      style={{
        background: "var(--void-panel-bg)",
        border: "1px solid var(--void-panel-border)",
        borderRadius: "14px",
        padding: "1.5rem",
        maxWidth: "480px",
      }}
    >
      <h2 style={{ color: "var(--void-text-primary)", marginBottom: "1rem" }}>
        SWAP · VOID ↔ USDC
      </h2>
      
      {/* Token In */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ color: "var(--void-text-secondary)", fontSize: "0.875rem" }}>
          From
        </label>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid var(--void-panel-border)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--void-text-primary)",
                fontSize: "1.5rem",
                outline: "none",
                width: "100%",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--void-text-primary)", fontWeight: "bold" }}>
              {tokenIn === VOID_ADDRESS ? "VOID" : "USDC"}
            </span>
            <span style={{ color: "var(--void-text-secondary)", fontSize: "0.875rem" }}>
              Balance: {balanceIn ? formatUnits(balanceIn.value, decimalsIn) : "0"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Flip Button */}
      <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
        <button
          onClick={handleFlipTokens}
          style={{
            background: "var(--void-panel-border)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            color: "var(--void-neon-teal)",
          }}
        >
          ⇅
        </button>
      </div>
      
      {/* Token Out */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ color: "var(--void-text-secondary)", fontSize: "0.875rem" }}>
          To (estimated)
        </label>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid var(--void-panel-border)",
          }}
        >
          <div style={{ fontSize: "1.5rem", color: "var(--void-text-primary)", marginBottom: "0.5rem" }}>
            {quote ? formatUnits(quote, decimalsOut) : "0.0"}
          </div>
          <div style={{ color: "var(--void-text-primary)", fontWeight: "bold" }}>
            {tokenOut === VOID_ADDRESS ? "VOID" : "USDC"}
          </div>
        </div>
      </div>
      
      {/* Fee Info */}
      {quote && (
        <div
          style={{
            background: "rgba(143, 59, 255, 0.1)",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            color: "var(--void-text-secondary)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span>Fee (0.3%)</span>
            <span>{formatUnits((parseUnits(amountIn || "0", decimalsIn) * 30n) / 10000n, decimalsIn)} {tokenIn === VOID_ADDRESS ? "VOID" : "USDC"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Min. received (0.5% slippage)</span>
            <span>{quote ? formatUnits((quote * 995n) / 1000n, decimalsOut) : "0"} {tokenOut === VOID_ADDRESS ? "VOID" : "USDC"}</span>
          </div>
        </div>
      )}
      
      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!amountIn || !quote || isLoading}
        style={{
          width: "100%",
          padding: "1rem",
          background: "linear-gradient(135deg, rgba(143,59,255,1), rgba(9,240,200,1))",
          border: "none",
          borderRadius: "999px",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.125rem",
          cursor: "pointer",
          opacity: (!amountIn || !quote || isLoading) ? 0.5 : 1,
        }}
      >
        {isLoading ? "Swapping..." : "Swap"}
      </button>
      
      <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--void-text-secondary)" }}>
        Fees routed to VoidHookRouterV4 (40/20/10/10/10/5/5 split)
      </div>
    </div>
  );
};
```

---

### 2.3 WorldMapOverlay

**File:** `hud/world/WorldMapOverlay.tsx`

```typescript
"use client";

import React from "react";
import { useParcels } from "@/services/world/useParcels";
import { useWorldLocation } from "@/services/events/worldEvents";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

export const WorldMapOverlay: React.FC<Props> = ({ onClose }) => {
  const { parcels } = useParcels();
  const { currentParcel } = useWorldLocation();
  
  const [selectedParcelId, setSelectedParcelId] = React.useState<number | null>(null);
  
  const handleParcelClick = (parcelId: number) => {
    setSelectedParcelId(parcelId);
    // Optional: trigger parcel selection in LandGridWindow via global state
    onClose();
  };
  
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);
  
  return (
    <div
      className="world-map-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.92)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--void-panel-bg)",
          border: "2px solid var(--void-panel-border)",
          borderRadius: "14px",
          padding: "2rem",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ color: "var(--void-text-primary)", margin: 0 }}>
            WORLD MAP · 40×40
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--void-panel-border)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              color: "var(--void-text-primary)",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        
        <div
          className="world-map-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(40, 1fr)",
            gap: "2px",
            aspectRatio: "1",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {parcels.map((p) => (
            <button
              key={p.parcel.id}
              onClick={() => handleParcelClick(p.parcel.id)}
              className={cn(
                "world-map-cell",
                p.isOwnedByUser && "cell-owned-by-user",
                currentParcel?.parcelId === p.parcel.id && "cell-player"
              )}
              style={{
                aspectRatio: "1",
                border: "none",
                cursor: "pointer",
                background: p.isOwnedByUser
                  ? "rgba(9, 240, 200, 0.5)"
                  : p.owner
                  ? "rgba(143, 59, 255, 0.3)"
                  : "rgba(143, 59, 255, 0.1)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
        
        <style jsx>{`
          .cell-player {
            background: radial-gradient(circle, rgba(9, 240, 200, 1), rgba(9, 240, 200, 0.3)) !important;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
          }
          .world-map-cell:hover {
            transform: scale(1.1);
            box-shadow: 0 0 12px rgba(9, 240, 200, 0.8);
          }
        `}</style>
      </div>
    </div>
  );
};
```

---

## 📁 SECTION 3: THEME CONSISTENCY

### Update HUD Layout

**File:** `hud/layout/VoidHUDLayout.tsx` (or main layout file)

```typescript
import { voidTheme } from "@/ui/theme/voidTheme";

export const VoidHUDLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      className="void-hud-root"
      style={{
        "--void-bg": voidTheme.colors.bg,
        "--void-bg-alt": voidTheme.colors.bgAlt,
        "--void-panel-bg": voidTheme.colors.panelBg,
        "--void-panel-border": voidTheme.colors.panelBorder,
        "--void-neon-purple": voidTheme.colors.neonPurple,
        "--void-neon-teal": voidTheme.colors.neonTeal,
        "--void-neon-pink": voidTheme.colors.neonPink,
        "--void-text-primary": voidTheme.colors.textPrimary,
        "--void-text-secondary": voidTheme.colors.textSecondary,
        "--void-glow-purple": voidTheme.shadows.glowPurple,
        "--void-glow-teal": voidTheme.shadows.glowTeal,
        "--void-button-primary-gradient": voidTheme.gradients.buttonPrimary,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
```

### Search & Replace Pattern

**Find all hardcoded colors and replace with theme vars:**

```bash
# PowerShell command to find hardcoded hex colors:
Get-ChildItem -Path "hud" -Recurse -Filter "*.tsx" | Select-String -Pattern "#[0-9a-fA-F]{6}"
```

**Replace:**
- `#8f3bff` → `var(--void-neon-purple)`
- `#09f0c8` → `var(--void-neon-teal)`
- `#ff3bd4` → `var(--void-neon-pink)`
- `#02030A` → `var(--void-bg)`
- `#f5f7ff` → `var(--void-text-primary)`
- `#9ea3c7` → `var(--void-text-secondary)`

---

## 🧪 TESTING CHECKLIST

### ✅ Phase 1: Foundation (1 hour)

- [ ] Create `world/WorldCoords.ts` and test coordinate conversion
- [ ] Create `services/events/worldEvents.ts` and test pub/sub
- [ ] Integrate event publishing in player controller
- [ ] Walk around 3D world and verify events in console

### ✅ Phase 2: UI Components (3-4 hours)

- [ ] Build LandGridWindow component
  - [ ] Grid renders 40×40 cells
  - [ ] Clicking cell selects it
  - [ ] Current player parcel has glow effect
  - [ ] Buy button appears for available parcels
  - [ ] Purchase flow: approve → buy → refresh
  
- [ ] Build SwapWindow component
  - [ ] Token selector toggles VOID ↔ USDC
  - [ ] Amount input with balance display
  - [ ] Quote updates on amount change (debounced)
  - [ ] Swap button: approve → swap → success
  - [ ] Fee info displays correctly (0.3%)
  
- [ ] Build WorldMapOverlay component
  - [ ] Full-screen overlay with ESC to close
  - [ ] Player position pulses
  - [ ] Clicking parcel selects it
  - [ ] District colors visible

### ✅ Phase 3: Integration (1-2 hours)

- [ ] Mini map syncs with player position
- [ ] LandGridWindow auto-selects current parcel
- [ ] Theme consistency across all HUD components
- [ ] Buy land → verify ownership in grid + map
- [ ] Execute swap → verify balances update
- [ ] Check VoidHookRouterV4 receives fees

---

## 🚀 DEPLOYMENT VERIFICATION

### Contract Calls to Test

```bash
$env:Path += ";C:\Users\rigof\.foundry\bin"
$RPC = "https://sepolia.base.org"

# 1. Verify WorldLandTestnet
cast call 0xC4559144b784A8991924b1389a726d68C910A206 "GRID_SIZE()(uint256)" --rpc-url $RPC
# Expected: 40

# 2. Verify VoidSwapTestnet reserves
cast call 0x74bD32c493C9be6237733507b00592e6AB231e4F "getReserves()(uint256,uint256)" --rpc-url $RPC
# Expected: ~10000e18 VOID, ~50000e6 USDC

# 3. Test quote function
cast call 0x74bD32c493C9be6237733507b00592e6AB231e4F \
  "getQuote(address,uint256)(uint256)" \
  "0x8de4043445939B0D0Cc7d6c752057707279D9893" \
  "100000000000000000000" \
  --rpc-url $RPC
# Expected: ~19940000 (19.94 USDC for 100 VOID)
```

---

## 📚 ARCHITECTURE SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│                     3D WORLD (Three.js)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Player Controller                                   │  │
│  │   - Movement updates                                  │  │
│  │   - worldToParcel(position)                           │  │
│  │   - publishWorldEvent("PLAYER_MOVED")                 │  │
│  └──────────────────────┬────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────┐
            │   EVENT BUS             │
            │   (worldEvents.ts)      │
            │   - PLAYER_MOVED        │
            │   - PARCEL_ENTERED      │
            │   - PARCEL_EXITED       │
            └─────────┬───────┬───────┘
                      │       │
        ┌─────────────┘       └─────────────┐
        ▼                                   ▼
┌───────────────────┐            ┌──────────────────────┐
│  Mini Map         │            │  LandGridWindow      │
│  - Highlight      │            │  - Auto-select       │
│    current parcel │            │    current parcel    │
└───────────────────┘            │  - Buy button        │
                                 └──────────────────────┘
                                            │
                                            ▼
                              ┌──────────────────────────────┐
                              │   Smart Contracts            │
                              │   - WorldLandTestnet         │
                              │   - VoidSwapTestnet          │
                              │   - VoidHookRouterV4         │
                              └──────────────────────────────┘
```

---

## 🎯 SUCCESS CRITERIA

When complete, users should be able to:

1. ✅ **Walk around 3D world** → Mini map + LandGridWindow follow player position
2. ✅ **Click parcel in HUD** → Selection syncs across all maps
3. ✅ **Buy land via UI** → Approve VOID → Purchase → Ownership updates everywhere
4. ✅ **Swap VOID ↔ USDC** → Get quote → Execute → Balances update
5. ✅ **See fee routing** → 0.3% of swaps go to VoidHookRouterV4
6. ✅ **Consistent theme** → All HUD uses neon purple/teal with no hardcoded colors

---

## 📝 OUT OF SCOPE (Future Phases)

- TokenLaunchPad contract + UI
- Staking rewards claiming UI
- Governance/DAO voting
- Social features (chat backend, friends, parties)
- Achievement badge NFTs
- Audio assets + UI sounds
- 3D building placement
- Advanced parcel features (revenue generation, buildings)

**Focus NOW:** Get land purchase + swap working with world sync. Everything else can wait.

---

**Ready to ship?** Follow this guide section by section. Start with Section 1 (foundation), then Section 2 (UI), then Section 3 (theme). Test each phase before moving to the next. You'll have a playable metaverse in 6-8 hours. 🚀
