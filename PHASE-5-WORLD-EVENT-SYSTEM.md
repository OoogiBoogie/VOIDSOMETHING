# PHASE 5 — WORLD EVENT SYSTEM

**Start Date:** TBD  
**Dependencies:** Phase 4 complete ✅ (v4-phase-exit)  
**Goal:** Turn the static MEGA WORLD SYSTEM into a live, event-driven fabric that HUD, analytics, and miniapps can subscribe to.

---

## 🎯 Core Objective

Transform the world from **static spatial data** → **real-time event stream** that powers:
- Live HUD updates (district labels, parcel highlights)
- Player notifications (toasts, system messages)
- Analytics tracking (movement patterns, hot zones)
- Quest progression (explorer milestones)
- MiniApp integrations (land manager, analytics dashboards)

---

## 📋 Core Events (Detailed Spec in WORLD-EVENTS-PHASE5.md)

### 1. PARCEL_ENTERED
**Trigger:** Player crosses parcel boundary  
**Payload:** `{ wallet, oldParcelId, newParcelId, coords, district, worldPos, timestamp }`  
**Use Cases:**
- Update mini-map current parcel highlight
- Show district transition toast
- Grant XP for first-time visits
- Track explorer quest progress

### 2. DISTRICT_ENTERED
**Trigger:** Player crosses district boundary  
**Payload:** `{ wallet, oldDistrict, newDistrict, parcelId, timestamp }`  
**Use Cases:**
- Show "Entering [DISTRICT NAME]" toast
- Verify zone unlock tier requirements
- Track district traffic analytics
- Update HUD district label

### 3. PROPERTY_VIEWED
**Trigger:** Player selects property in RealEstateScreen or LandGridWindow  
**Payload:** `{ wallet, propertyId, parcelId, district, listingPrice, timestamp }`  
**Use Cases:**
- Property interest analytics
- Hot property notifications
- Real estate recommendation engine

### 4. PARCEL_PURCHASED
**Trigger:** Successful land purchase transaction  
**Payload:** `{ buyer, parcelId, district, price, txHash, timestamp }`  
**Use Cases:**
- Land sales analytics
- District price tracking
- Portfolio update notifications
- Investor leaderboards

---

## 🚀 Delivery Slices (Recommended Order)

### **Phase 5.1 — Event Bus & PARCEL_ENTERED** (4-6 hours)
**Scope:** Minimal event system with single event type

#### Tasks:
1. **Event Bus Setup** (1 hour)
   - Extend `services/events/worldEvents.ts` with world event types
   - Add `emitWorldEvent(type, payload)` helper
   - Create `useWorldEvent(type, handler)` hook for HUD components

2. **Movement Detection** (1.5 hours)
   - Add parcel change detection in `VoidGameShell.tsx`
   - Emit `PARCEL_ENTERED` when player crosses boundary
   - Store `lastParcelId` in component state
   - Throttle to max 1 event/second

3. **HUD Reactions** (2 hours)
   - Wire `MiniMapPanel` to highlight current parcel
   - Wire `LandGridWindow` to show "you are here" indicator
   - Add district transition toast (via existing toast system)
   - Update mobile map card district label on event

4. **Testing** (0.5 hour)
   - Walk through all 5 districts
   - Verify parcel IDs update correctly
   - Check toast appears on district change
   - Confirm HUD updates in real-time

**Exit Criteria:**
- ✅ PARCEL_ENTERED fires reliably on boundary cross
- ✅ HUD components react to events
- ✅ Toasts show district transitions
- ✅ No duplicate events (proper throttling)

---

### **Phase 5.2 — Global Notification Layer** (2-3 hours)
**Scope:** Toast system for world events

#### Tasks:
1. **Notification Center** (1.5 hours)
   - Create `SystemNotificationCenter.tsx` (already exists, extend it)
   - Add world event listeners (PARCEL_ENTERED, DISTRICT_ENTERED)
   - Design toast variants (info, success, warning for events)
   - Position: bottom-right (don't conflict with existing toasts)

2. **Event Templates** (1 hour)
   - "Entering [District Name]" - District transitions
   - "Parcel #[ID] ([x], [z])" - Parcel changes (optional, might be noisy)
   - "Transaction Pending..." - On-chain actions
   - "Transaction Confirmed!" - Success notifications

3. **Settings Toggle** (0.5 hour)
   - Add "Show World Notifications" setting
   - Store in localStorage
   - Default: ON

**Exit Criteria:**
- ✅ District transitions show toast
- ✅ User can disable notifications
- ✅ Toasts auto-dismiss after 3s
- ✅ No UI jank (smooth animations)

---

### **Phase 5.3 — Analytics Logging** (Optional - 2 hours)
**Scope:** Event persistence for analytics

#### Tasks:
1. **Event Logger** (1 hour)
   - Create `lib/analytics/worldEventLogger.ts`
   - Write events to `logs/world/events_YYYY-MM-DD.json`
   - Batch writes (flush every 10 events or 30s)
   - Rotate logs daily

2. **Aggregation Script** (1 hour)
   - Create `scripts/analyze-world-traffic.ts`
   - Count parcels visited per day
   - Identify hot zones (most visited parcels)
   - District traffic heat map data

**Exit Criteria:**
- ✅ Events logged to JSON file
- ✅ Logs rotate daily
- ✅ Aggregation script generates insights
- ✅ No performance impact (<5ms per event)

---

### **Phase 5.4 — WORLD_MAP Window** (6-8 hours)
**Scope:** Full 40×40 grid window with marketplace integration

#### Tasks:
1. **Window Shell** (2 hours)
   - Create `hud/world/windows/WorldMapWindow.tsx`
   - Full-screen grid layout
   - District color coding
   - Zoom/pan controls
   - Player position marker

2. **Parcel Details Panel** (2 hours)
   - Click parcel → show details sidebar
   - Display: parcelId, coords, district, owner, price, buildings
   - Show properties on parcel (via `useParcelProperties()`)
   - "View in Land Grid" button

3. **Marketplace Integration** (2 hours)
   - "For Sale" filter toggle
   - Price range slider
   - District filter checkboxes
   - "Buy Now" button (wires to `useWorldLand.buyParcel()`)

4. **Feature Overlays** (1 hour)
   - Show `CORE_WORLD_FEATURES` as icons
   - Show buildings as dots (via `BOUND_BUILDINGS`)
   - Toggle layers: Features, Buildings, Owners

5. **Testing** (1 hour)
   - Click parcels → details load
   - Filter by district → grid updates
   - Buy flow works (mock mode)
   - Performance: smooth at 60fps

**Exit Criteria:**
- ✅ Full 40×40 grid renders
- ✅ Click parcel → details panel
- ✅ Marketplace filters work
- ✅ Feature/building overlays functional
- ✅ Buy flow integrated (mock or live)

---

## 📊 Phase 5 Milestones

### Milestone 1: Event System Live
- PARCEL_ENTERED fires on movement
- HUD reacts to events
- Toasts show district transitions

### Milestone 2: Notifications Polished
- Global notification center operational
- User can toggle notifications
- Event templates designed

### Milestone 3: Analytics Ready
- Events logged to JSON
- Aggregation script functional
- Heat map data available

### Milestone 4: WORLD_MAP Complete
- Full grid window operational
- Marketplace integration live
- Click-to-buy functional

---

## 🔗 Integration Points

### From Phase 4 (Already Complete)
✅ WorldCoords.ts coordinate system  
✅ getParcelInfo() for player position  
✅ getDistrict() for district assignment  
✅ BOUND_BUILDINGS for building overlays  
✅ useParcelProperties() for property queries  
✅ VoidWorldSnapshot data structure

### New in Phase 5
🔄 emitWorldEvent() event emitter  
🔄 useWorldEvent() React hook  
🔄 SystemNotificationCenter toast layer  
🔄 WorldMapWindow full grid UI  
🔄 worldEventLogger analytics pipeline

---

## 📝 Recommended Approach

### **TIGHT PATH (Recommended):**
**Focus:** Phase 5.1 + 5.2 only (event bus + notifications)

**Benefits:**
- Low risk, high value
- Builds on Phase 4 foundation
- Adds "live" feel without complexity
- Sets up analytics infrastructure

**Timeline:** 6-9 hours total

---

### **FULL PATH (Optional):**
**Focus:** All 4 phases (events + analytics + WORLD_MAP)

**Benefits:**
- Complete world feature set
- Marketplace integration
- Full analytics pipeline
- Visual wow factor (grid window)

**Timeline:** 14-18 hours total

---

## 🎯 Success Criteria

### Phase 5.1 Complete When:
- [ ] PARCEL_ENTERED fires on every boundary cross
- [ ] MiniMapPanel highlights current parcel
- [ ] District transitions show toast
- [ ] Mobile HUD updates district label
- [ ] Zero duplicate events (proper throttling)

### Phase 5.2 Complete When:
- [ ] Global notification center exists
- [ ] District toasts styled correctly
- [ ] User can disable notifications
- [ ] Toasts auto-dismiss smoothly

### Phase 5.3 Complete When:
- [ ] Events logged to JSON daily
- [ ] Aggregation script generates insights
- [ ] Heat map data structure defined

### Phase 5.4 Complete When:
- [ ] WORLD_MAP window renders full grid
- [ ] Click parcel → details panel works
- [ ] Marketplace filters functional
- [ ] Buy flow wired (mock or live)

---

## 📦 Deliverables

### Code Files (Estimated)
- `services/events/worldEvents.ts` (extend existing)
- `hooks/useWorldEvent.ts` (new)
- `lib/analytics/worldEventLogger.ts` (new)
- `scripts/analyze-world-traffic.ts` (new)
- `hud/world/windows/WorldMapWindow.tsx` (new)
- `components/game/VoidGameShell.tsx` (modify - add movement detection)

### Documentation
- `PHASE-5-IMPLEMENTATION-COMPLETE.md` (when done)
- Update `WORLD-EVENTS-PHASE5.md` with actual implementation notes

---

## 🚧 Out of Scope (Phase 6+)

The following are **NOT** part of Phase 5:
- On-chain event indexing (subgraph)
- Advanced analytics dashboards
- Predictive property recommendations
- Land auction system
- District governance events
- Social proximity events (nearby players)

These will be addressed in future phases when on-chain systems are live.

---

## ✅ Pre-Flight Check

Before starting Phase 5:
- [x] Phase 4 complete (v4-phase-exit tag exists)
- [x] Build passing (0 errors)
- [x] WORLD-EVENTS-PHASE5.md reviewed
- [x] Decision made: TIGHT PATH or FULL PATH
- [ ] Manual smoke test passed (optional)

---

**Recommendation:** Start with **Phase 5.1 (Event Bus)** for quick wins, then decide if 5.2-5.4 are needed based on demo/product priorities.

**Status:** 📋 **READY TO START**
