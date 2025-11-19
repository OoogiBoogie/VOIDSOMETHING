# Phase 6 In-App Manual Test Checklist

## Setup

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: (Optional) Watch database if configured
psql $DATABASE_URL -c "SELECT event_type, COUNT(*) FROM world_events GROUP BY event_type;"
```

## Browser Setup
1. Open http://localhost:3000
2. Open DevTools (F12)
3. Switch to **Console** tab
4. Keep **Network** → **Fetch/XHR** filter open

---

## Test 1: Engine Initialization ✅

### Action:
Connect wallet (or use bypass)

### Expected Console Logs:
```
[VoidGameShell] Starting Phase 6 engines...
[XPEngine] Started for wallet: 0x...
[AchievementEngine] Started for wallet: 0x... Mainnet: false
[AirdropEngine] Started for wallet: 0x...
[EventStateBridge] Started - syncing events to state
```

### Validation:
- [ ] All 4 engines log "Started"
- [ ] Wallet address matches your connected wallet
- [ ] `Mainnet: true` only if on Base mainnet (chainId 8453)

---

## Test 2: First Session Achievement ✅

### Action:
Wait 2 seconds after wallet connects

### Expected Console Logs:
```
[AchievementEngine] 🏆 Unlocked: Welcome to The Void
```

### Expected Network Activity:
- [ ] POST to `/api/world-events` with `SESSION_STARTED` event
- [ ] POST to `/api/world-events` with `ACHIEVEMENT_UNLOCKED` event

### Validation:
- [ ] Achievement unlocked immediately
- [ ] Console shows trophy emoji 🏆
- [ ] Network sends 2 events (session start + achievement)

---

## Test 3: First Parcel Entry (XP Gain) ✅

### Action:
Walk forward into a new parcel (wait ~2 seconds for parcel boundary)

### Expected Console Logs:
```
[XPEngine] +1 XP from PARCEL_FIRST_VISIT (Total: 1) - Parcel (x, z)
```

### Expected Network Activity:
- [ ] POST to `/api/world-events` with `PARCEL_ENTERED` event
- [ ] POST to `/api/world-events` with `XP_GAINED` event

### Validation:
- [ ] Console shows "+1 XP"
- [ ] Parcel coordinates logged
- [ ] Total XP increments
- [ ] Network sends parcel event

---

## Test 4: First District Entry (Bigger XP + Achievement) ✅

### Action:
Walk into a new district (different colored zone)

### Expected Console Logs:
```
[XPEngine] +5 XP from DISTRICT_FIRST_VISIT (Total: 6) - District: DISTRICT_NAME
[AchievementEngine] 🏆 Unlocked: First Steps
```

### Expected Network Activity:
- [ ] POST to `/api/world-events` with `DISTRICT_ENTERED` event
- [ ] POST to `/api/world-events` with `XP_GAINED` event
- [ ] POST to `/api/world-events` with `ACHIEVEMENT_UNLOCKED` event

### Validation:
- [ ] Console shows "+5 XP" (not +1)
- [ ] District name logged in CAPS
- [ ] "First Steps" achievement unlocked
- [ ] Total XP includes district bonus

---

## Test 5: 10 Parcel Explorer Achievement ✅

### Action:
Walk to 10 unique parcels (can be in same district)

### Progress Tracking:
Watch console for each parcel:
```
[XPEngine] +1 XP from PARCEL_FIRST_VISIT (Total: X)
```

### Expected After 10th Parcel:
```
[AchievementEngine] 🏆 Unlocked: Pioneer I
[XPEngine] +10 XP from ACHIEVEMENT_BONUS (Total: X+10)
```

### Validation:
- [ ] XP increases +1 per unique parcel
- [ ] "Pioneer I" unlocks at exactly 10 parcels
- [ ] Achievement awards +10 XP bonus immediately
- [ ] Network sends achievement unlock event

---

## Test 6: Creator Terminal Interaction ✅

### Action:
1. Find a creator terminal (look for glowing terminal objects)
2. Walk close to it
3. Press **E** to interact

### Expected Console Logs:
```
[XPEngine] +3 XP from CREATOR_TERMINAL (Total: X+3)
[AchievementEngine] 🏆 Unlocked: First Interaction
[AchievementEngine] 🏆 Unlocked: Social Creator
```

### Expected Network Activity:
- [ ] POST to `/api/world-events` with `INTERACTION_COMPLETED` event
- [ ] POST to `/api/world-events` with `XP_GAINED` event
- [ ] POST to `/api/world-events` with 2× `ACHIEVEMENT_UNLOCKED` events

### Validation:
- [ ] Creator terminal gives +3 XP (not +1)
- [ ] 2 achievements unlock (First Interaction + Social Creator)
- [ ] Network sends interaction event

---

## Test 7: Session Time XP (10 Minutes) ⏱️

### Action:
Stay active in the world for 10+ minutes (move around occasionally)

### Expected Console Logs (Every ~60 seconds):
```
[XPEngine] +2 XP from SESSION_ACTIVE (Total: X+2)
```

### Expected After 10 Minutes:
```
[AchievementEngine] 🏆 Unlocked: Dedicated Explorer
[XPEngine] +15 XP from ACHIEVEMENT_BONUS (Total: X+15)
```

### Validation:
- [ ] Periodic XP gains every minute
- [ ] "Dedicated Explorer" unlocks at 10 minutes
- [ ] Session time tracked correctly
- [ ] Network sends heartbeat events

---

## Test 8: Airdrop Score Calculation 🎁

### Action:
After completing tests 1-6, open Console and run:

```javascript
// Get current airdrop score
const score = window.__PHASE6_DEBUG__?.airdropEngine?.getCurrentScore();
console.log('Airdrop Score:', score);
```

### Expected Output:
```javascript
{
  walletAddress: "0x...",
  totalScore: 200+,  // Should be >100
  breakdown: {
    xpPoints: 50+,     // Your total XP × 1
    achievementPoints: 125+,  // 5 achievements × 25
    explorationPoints: 15+,   // Parcels × 0.5 + Districts × 10
    sessionPoints: 0-2,       // Session minutes × 0.2
    creatorTerminalPoints: 5  // 1 terminal × 5
  },
  multipliers: {
    baseScore: 200+,
    profileMultiplier: 1.0,   // 1.1 if mainnet profile
    betaMultiplier: 1.0       // 1.2 if beta user
  },
  lastUpdated: Date
}
```

### Validation:
- [ ] `totalScore` > 0
- [ ] All breakdown values > 0
- [ ] Score matches formula: (XP×1 + achievements×25 + parcels×0.5 + districts×10 + session×0.2 + terminals×5)
- [ ] Multipliers applied if on mainnet with profile

---

## Test 9: Rate Limiting (XP Cap) 🚫

### Action:
Try to farm XP by rapidly entering/exiting same parcel

### Expected Console Logs (After ~30 seconds of farming):
```
[XPEngine] XP cap reached for wallet: 0x...
```

### Validation:
- [ ] XP stops increasing after cap (50 XP/min)
- [ ] Console warns about rate limit
- [ ] Network sends `XP_CAP_REACHED` event

---

## Test 10: Database Verification (If DB Configured) 💾

### Action:
After completing tests, check database:

```sql
-- Check XP events
SELECT wallet_address, SUM(amount) as total_xp, COUNT(*) as events
FROM xp_events
GROUP BY wallet_address;

-- Check achievements
SELECT wallet_address, achievement_id
FROM achievement_unlocks
ORDER BY unlocked_at DESC
LIMIT 10;

-- Check airdrop scores
SELECT wallet_address, total_score, breakdown
FROM airdrop_scores
ORDER BY total_score DESC
LIMIT 10;

-- Check materialized view
SELECT wallet_address, total_xp, level, achievements_count, airdrop_score
FROM player_activity_summary
ORDER BY airdrop_score DESC
LIMIT 10;
```

### Validation:
- [ ] `xp_events` has entries for your wallet
- [ ] `achievement_unlocks` shows your achievements
- [ ] `airdrop_scores` has your calculated score
- [ ] `player_activity_summary` aggregates correctly

---

## Common Issues & Fixes

### Issue: Engines don't start
**Fix:** Check wallet connection. Engines only start after `address` is set.

### Issue: XP not increasing
**Fix:** 
1. Check console for errors
2. Verify `eventStateBridge` started
3. Check Network tab for event POSTs

### Issue: Achievements not unlocking
**Fix:**
1. Check player state: `usePlayerState.getState()`
2. Verify stats.totalParcelsVisited increments
3. Check achievement conditions match

### Issue: Airdrop score is 0
**Fix:**
1. Force update: `airdropEngine.forceUpdate(address, false, false)`
2. Wait 30s (throttle delay)
3. Check player state has XP/achievements

### Issue: Network requests fail
**Fix:**
1. Check `/api/world-events/route.ts` is running
2. Verify no CORS errors
3. Check database connection (if configured)

---

## Success Criteria ✅

All tests pass if:

- [x] Engines start automatically on wallet connect
- [x] XP awarded for parcels (+1), districts (+5), terminals (+3)
- [x] Achievements unlock at thresholds (1st session, 1st district, 10 parcels, 1st interaction, 10 min)
- [x] Airdrop score calculates from all stats
- [x] Rate limiting prevents XP farming
- [x] Network sends events to `/api/world-events`
- [x] Database stores events (if configured)

---

## Next: HUD Integration

After manual testing passes, create HUD components:

1. **PlayerStatsPanel.tsx** - Show XP, level, achievements count
2. **AchievementToast.tsx** - Pop-up when achievement unlocks
3. **XPGainIndicator.tsx** - Floating "+X XP" text
4. **AirdropScoreCard.tsx** - Show total score + breakdown

See `PHASE-6-IMPLEMENTATION-COMPLETE.md` for HUD integration code examples.
