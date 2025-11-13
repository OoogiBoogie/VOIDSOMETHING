# WORLD EVENTS - PHASE 5 SCOPE

## Overview

World event system integration is **deferred to Phase 5** to maintain Phase 4 stability. The world coordinate system and parcel tracking are already in place—this document specifies the event layer to be added later.

---

## 📋 PARCEL_ENTERED Event Spec

### Purpose
Track player movement between parcels in real-time for analytics, HUD updates, and gameplay triggers.

### Event Payload
```typescript
interface ParcelEnteredEvent {
  type: 'PARCEL_ENTERED';
  timestamp: number;
  player: {
    wallet: string;
    username?: string;
  };
  parcel: {
    oldParcelId: number | null;  // null on first spawn
    newParcelId: number;
    coords: { x: number; z: number };
    district: District;
  };
  worldPos: {
    x: number;
    z: number;
  };
}
```

### Emission Points
```typescript
// In VoidGameShell.tsx or Scene3D movement handler
useEffect(() => {
  const currentParcel = worldToParcel({ x: player.x, z: player.z });
  const currentParcelId = coordsToParcelId(currentParcel);
  
  if (currentParcelId !== lastParcelId) {
    emitWorldEvent('PARCEL_ENTERED', {
      timestamp: Date.now(),
      player: { wallet: address, username: profile?.displayName },
      parcel: {
        oldParcelId: lastParcelId,
        newParcelId: currentParcelId,
        coords: currentParcel,
        district: getDistrict(currentParcel)
      },
      worldPos: { x: player.x, z: player.z }
    });
    
    setLastParcelId(currentParcelId);
  }
}, [player.x, player.z]);
```

### HUD Listeners (Phase 5)
```typescript
// In HUD components
useWorldEvent('PARCEL_ENTERED', (data) => {
  // Update mini-map highlight
  setCurrentParcel(data.parcel.newParcelId);
  
  // Show district transition toast
  if (getDistrict(data.parcel.oldParcelId) !== data.parcel.district) {
    toast.info(`Entered ${DISTRICT_NAMES[data.parcel.district]}`);
  }
  
  // Trigger XP for exploration
  if (firstVisit(data.parcel.newParcelId)) {
    grantXP('ZONE_EXPLORED');
  }
});
```

---

## 🎯 Other World Events (Phase 5)

### DISTRICT_ENTERED
```typescript
interface DistrictEnteredEvent {
  type: 'DISTRICT_ENTERED';
  timestamp: number;
  wallet: string;
  oldDistrict: District | null;
  newDistrict: District;
  parcelId: number;
}
```

**Use Cases:**
- District-specific quest progress
- Zone unlock verification
- District analytics (traffic heat maps)

---

### PROPERTY_VIEWED
```typescript
interface PropertyViewedEvent {
  type: 'PROPERTY_VIEWED';
  timestamp: number;
  wallet: string;
  propertyId: string;
  parcelId: number;
  district: District;
  listingPrice: number;
}
```

**Use Cases:**
- Property interest analytics
- Real estate recommendations
- Hot property notifications

---

### PARCEL_PURCHASED
```typescript
interface ParcelPurchasedEvent {
  type: 'PARCEL_PURCHASED';
  timestamp: number;
  buyer: string;
  parcelId: number;
  district: District;
  price: number;
  txHash: string;
}
```

**Use Cases:**
- Land sales analytics
- District price tracking
- Portfolio notifications

---

## 📊 Analytics Integration (Phase 5)

### Event Aggregation
All world events will be logged to:
1. **Local Analytics** - `logs/world/events_YYYY-MM-DD.json`
2. **Subgraph** - Indexed on-chain events (parcel purchases, transfers)
3. **Telemetry** - Player movement heat maps, district traffic

### Metrics Tracked
- Parcels visited per session
- District crossing frequency
- Property view → purchase conversion rate
- Average time spent per district
- First-time explorer quests completion

---

## 🔗 Integration Points

### Current State (Phase 4)
✅ World coordinate system complete (`WorldCoords.ts`)  
✅ Parcel tracking infrastructure (`getParcelInfo()`)  
✅ District assignment (`getDistrict()`)  
✅ Building bindings (`bindBuildingToParcel()`)  
✅ Property registry (`getPropertiesOnParcel()`)

### Phase 5 Additions
🔄 Event emitter wiring (`emitWorldEvent()`)  
🔄 HUD event listeners (`useWorldEvent()`)  
🔄 Analytics logging pipeline  
🔄 Quest system integration (zone exploration)  
🔄 Real-time parcel highlighting

---

## 🚧 Implementation Plan (Phase 5)

### Step 1: Event Emitter Setup
- Extend `worldEvents.ts` with world event types
- Add `emitWorldEvent()` helper
- Create `useWorldEvent()` hook for HUD components

### Step 2: Movement Detection
- Add parcel change detection in `VoidGameShell.tsx`
- Emit `PARCEL_ENTERED` on every parcel boundary cross
- Store `lastParcelId` in component state

### Step 3: HUD Integration
- Wire `MiniMapPanel` to highlight current parcel
- Wire `LandGridWindow` to show "you are here" indicator
- Add district transition toasts

### Step 4: Analytics Logging
- Log all events to `logs/world/parcel_events_YYYY-MM-DD.json`
- Create daily analytics aggregation script
- Generate heat maps for district traffic

### Step 5: Quest Integration
- Add "Explorer" milestone quest (visit N parcels)
- Grant XP for first-time district entries
- Track unique parcels visited per wallet

---

## 📝 Notes

**Why Deferred to Phase 5:**
- Phase 4 focused on core world system stability
- Event system adds complexity without immediate user value
- Analytics infrastructure needs proper planning
- Quest system integration requires careful design

**Current Workaround:**
- HUD components query world state directly via `getParcelInfo()`
- Real-time updates not required for Phase 4 demo
- Parcel highlighting works without events (component polls position)

**Phase 5 Benefits:**
- True real-time HUD updates
- Quest auto-progression
- Analytics-driven feature decisions
- Player behavior insights

---

## ✅ Acceptance Criteria (Phase 5)

- [ ] `PARCEL_ENTERED` event emitted on every parcel boundary cross
- [ ] All HUD components listen to world events
- [ ] District transition toasts appear
- [ ] Explorer quests auto-complete on parcel visits
- [ ] Analytics dashboard shows parcel traffic heat map
- [ ] Event logs exported to JSON daily
- [ ] Zero performance impact (events throttled to 1/sec max)

---

**Status:** 📋 **PLANNED FOR PHASE 5**  
**Dependencies:** Phase 4 world system complete ✅  
**Estimated Effort:** 4-6 hours  
**Priority:** Medium (analytics value, not critical path)
