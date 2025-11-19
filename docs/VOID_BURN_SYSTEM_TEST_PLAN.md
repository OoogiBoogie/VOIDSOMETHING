# 🔥 VOID BURN SYSTEM — END-TO-END TEST PLAN

**Version**: 1.0  
**Network**: Base Sepolia (Testnet)  
**Last Updated**: 2025-11-16

---

## 📋 OVERVIEW

The VOID Utility Burn System enables users to permanently burn VOID tokens to unlock features and upgrades. This test plan covers all 7 contracts and 5 UI windows across all burn flows.

### System Components

**Smart Contracts** (7):
- `VoidBurnUtility.sol` — Core burn engine with safety limits
- `DistrictAccessBurn.sol` — Unlock Districts 2-5
- `LandUpgradeBurn.sol` — Upgrade parcels L0→L5
- `CreatorToolsBurn.sol` — Unlock creator tiers 1-3
- `PrestigeBurn.sol` — Prestige ranks 0-10
- `MiniAppBurnAccess.sol` — Unlock mini-app features
- `AIUtilityGovernor.sol` — AI-powered price adjustments (safe mode)

**UI Components** (5):
- `BurnConfirmationModal.tsx` — Reusable approve → burn flow
- `DistrictUnlockWindow.tsx` — District unlock interface
- `CreatorToolsWindow.tsx` — Creator tier interface
- `PrestigeSystemWindow.tsx` — Prestige rank interface
- `MiniAppBurnAccessWindow.tsx` — Mini-app feature interface

**Integration Points** (3):
- `RealEstatePanel.tsx` — Land upgrade section
- `PlayerChipV2.tsx` — Prestige badge display
- `VoidHudApp.tsx` — Burn window registry

---

## ✅ PRECONDITIONS

Before starting tests, ensure the following are in place:

### 1. Contracts Deployed to Base Sepolia

Run deployment script:
```bash
npx hardhat run scripts/deploy-burn-system.ts --network baseSepolia
```

All 7 contracts should be deployed and roles granted:
- ✅ `VoidBurnUtility` deployed
- ✅ `DistrictAccessBurn` deployed + `BURN_MANAGER_ROLE` granted
- ✅ `LandUpgradeBurn` deployed + `BURN_MANAGER_ROLE` granted
- ✅ `CreatorToolsBurn` deployed + `BURN_MANAGER_ROLE` granted
- ✅ `PrestigeBurn` deployed + `BURN_MANAGER_ROLE` granted
- ✅ `MiniAppBurnAccess` deployed + `BURN_MANAGER_ROLE` granted
- ✅ `AIUtilityGovernor` deployed + `GOVERNOR_ROLE` granted to all burn modules

### 2. Environment Variables Configured

Update `.env.local` with deployed addresses (from deployment output):

```env
NEXT_PUBLIC_VOID_BURN_UTILITY=0x...
NEXT_PUBLIC_DISTRICT_ACCESS_BURN=0x...
NEXT_PUBLIC_LAND_UPGRADE_BURN=0x...
NEXT_PUBLIC_CREATOR_TOOLS_BURN=0x...
NEXT_PUBLIC_PRESTIGE_BURN=0x...
NEXT_PUBLIC_MINIAPP_BURN_ACCESS=0x...
NEXT_PUBLIC_AI_UTILITY_GOVERNOR=0x...
```

### 3. Frontend Running Against Base Sepolia

```bash
npm run dev
```

Verify network in app:
- Chain ID: 84532 (Base Sepolia)
- RPC URL: `https://sepolia.base.org`

### 4. Test Wallet Setup

**Requirements**:
- MetaMask or compatible wallet connected to Base Sepolia
- Testnet ETH for gas (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- VOID tokens (testnet version at `0x8de4043445939B0D0Cc7d6c752057707279D9893`)
  - If test VOID not available, mint/airdrop required

**Recommended Test Wallet Balances**:
- 0.1 ETH (Base Sepolia testnet)
- 10,000,000 VOID (for testing all burn flows)

---

## 🧪 TEST CASES

### T1: District Unlock Flow

**Objective**: Verify users can unlock Districts 2-5 by burning VOID tokens.

**Preconditions**:
- User owns at least 1 parcel in any district
- User has sufficient VOID balance (e.g., 500,000 VOID for District 2)
- District 2-5 are currently locked for user

**Steps**:

1. **Open District Unlock Window**
   - Navigate to HUD → WORLD menu
   - Click "BURN · DISTRICT ACCESS" window
   - Verify window opens with 4 district cards (Districts 2-5)

2. **Select District to Unlock**
   - Click on "District 2" card
   - Verify burn cost displays: **500,000 VOID**
   - Verify warning message: "This action is IRREVERSIBLE"
   - Verify "Unlock District" button is enabled

3. **Approve VOID Spending**
   - Click "Unlock District" button
   - `BurnConfirmationModal` should appear
   - Verify modal shows:
     - Burn amount: 500,000 VOID
     - Category: "District Unlock"
     - Action: "Unlock District 2"
     - Warning: "Tokens will be permanently burned"
   - Click "Approve VOID" button
   - MetaMask popup appears → Confirm approval transaction
   - Wait for approval confirmation

4. **Execute Burn**
   - After approval, "Burn Tokens" button should become enabled
   - Click "Burn Tokens" button
   - MetaMask popup appears → Confirm burn transaction
   - Wait for burn confirmation
   - Verify success toast: "District 2 Unlocked! 🎉"

5. **Verify District Access**
   - Check VoidCityMap: District 2 should now be accessible
   - Verify district card in unlock window now shows "UNLOCKED" status
   - Verify user cannot unlock District 2 again (already unlocked)

**Expected Results**:
- ✅ Approval transaction succeeds (ERC20 approve)
- ✅ Burn transaction succeeds (district unlock + VOID burn)
- ✅ `DistrictUnlocked` event emitted with correct district ID
- ✅ User's VOID balance decreased by 500,000
- ✅ District 2 is now accessible in world map
- ✅ UI reflects unlocked state

**Edge Cases to Test**:
- Attempt to unlock without sufficient VOID → Error: "Insufficient balance"
- Attempt to unlock already-unlocked district → Button disabled
- Cancel approval transaction → Modal remains open, can retry
- Network congestion → Transaction pending UX works correctly

---

### T2: Land Upgrade Flow (L0 → L1, etc.)

**Objective**: Verify users can upgrade parcel tiers by burning VOID tokens.

**Preconditions**:
- User owns at least 1 parcel (Level 0)
- User has sufficient VOID balance (e.g., 50,000 VOID for L0→L1)

**Steps**:

1. **Navigate to Real Estate Panel**
   - Open HUD → ECONOMY menu
   - Click on owned parcel in "Real Estate" tab
   - Scroll to "Land Upgrade" section
   - Verify current level: **Level 0**
   - Verify next level: **Level 1**
   - Verify upgrade cost: **50,000 VOID**

2. **Initiate Upgrade**
   - Click "Upgrade to Level 1" button (purple gradient with burn icon)
   - `BurnConfirmationModal` should appear
   - Verify modal shows:
     - Burn amount: 50,000 VOID
     - Category: "Land Upgrade"
     - Action: "Upgrade Parcel #123 to Level 1"
     - Metadata: `parcel-123-level-1`

3. **Approve + Execute Burn**
   - Follow same approve → burn flow as T1
   - Wait for both transactions to confirm

4. **Verify Parcel Upgraded**
   - Parcel level should update to **Level 1**
   - Progress bar should show 1/5 filled
   - Next upgrade section should now show:
     - Current level: Level 1
     - Next level: Level 2
     - Upgrade cost: 150,000 VOID
   - Verify parcel stats updated (if XP/perks wired)

**Expected Results**:
- ✅ Parcel level increased from 0 → 1
- ✅ `ParcelUpgraded` event emitted with correct parcel ID and level
- ✅ User's VOID balance decreased by 50,000
- ✅ UI reflects new level immediately
- ✅ Next upgrade cost displayed correctly (150,000 VOID for L1→L2)

**Sequential Upgrade Test**:
- Continue upgrading through all levels:
  - L0→L1: 50,000 VOID
  - L1→L2: 150,000 VOID
  - L2→L3: 400,000 VOID
  - L3→L4: 1,000,000 VOID
  - L4→L5: 2,500,000 VOID
- At Level 5, verify "MAX LEVEL REACHED 🏆" message displays
- Verify upgrade button disabled at max level

**Edge Cases**:
- Attempt to upgrade without sufficient VOID → Error
- Attempt to skip levels (L0→L2 directly) → Should not be possible (sequential only)
- Parcel not owned by user → Section should not appear

---

### T3: Creator Tools Unlock Flow

**Objective**: Verify users can unlock creator tiers (1-3) sequentially.

**Preconditions**:
- User is at Creator Tier 0 (none unlocked)
- User has sufficient VOID (150,000 for Tier 1)

**Steps**:

1. **Open Creator Tools Window**
   - Navigate to HUD → CREATOR menu
   - Click "BURN · CREATOR TOOLS" window
   - Verify 3 tier cards displayed:
     - Tier 1: LOCKED — 150,000 VOID
     - Tier 2: LOCKED (grayed out, requires Tier 1)
     - Tier 3: LOCKED (grayed out, requires Tier 2)

2. **Unlock Tier 1**
   - Click "Unlock Tier 1" button
   - `BurnConfirmationModal` appears
   - Verify burn amount: 150,000 VOID
   - Approve + Execute burn

3. **Verify Tier 1 Unlocked**
   - Tier 1 card should show "UNLOCKED ✓"
   - Tier 1 tools should be visible:
     - Basic Scene Editor
     - Asset Library Access
     - Single Publish Slot
   - Tier 2 should now be clickable (no longer grayed out)
   - Tier 3 still grayed out (requires Tier 2)

4. **Unlock Tier 2**
   - Click "Unlock Tier 2" button
   - Burn cost: 400,000 VOID
   - Complete approve → burn flow
   - Verify Tier 2 tools unlocked:
     - Advanced Scripting
     - 3 Publish Slots
     - Collaborative Editing

5. **Unlock Tier 3**
   - Click "Unlock Tier 3" button
   - Burn cost: 1,000,000 VOID
   - Complete approve → burn flow
   - Verify Tier 3 tools unlocked:
     - Full API Access
     - Unlimited Publish Slots
     - Revenue Sharing

**Expected Results**:
- ✅ Sequential unlocking enforced (cannot skip tiers)
- ✅ `CreatorTierUnlocked` events emitted for each tier
- ✅ Total VOID burned: 1,550,000 (150k + 400k + 1M)
- ✅ All tier-specific tools visible after unlock
- ✅ UI reflects current tier status

**Edge Cases**:
- Attempt to unlock Tier 2 before Tier 1 → Button disabled
- Attempt to unlock same tier twice → Already unlocked, button hidden

---

### T4: Prestige Rank Up Flow

**Objective**: Verify users can increase prestige rank (0→10) with exponential costs.

**Preconditions**:
- User is at Prestige Rank 0
- User has sufficient VOID (100,000 for Rank 1)

**Steps**:

1. **Open Prestige System Window**
   - Click prestige badge in `PlayerChipV2` (top-left of HUD)
   - OR navigate to HUD → BURN menu → "BURN · PRESTIGE"
   - Verify current rank: **Rank 0**
   - Verify next rank: **Rank 1**
   - Verify burn cost: **100,000 VOID**

2. **Rank Up to Rank 1**
   - Click "Burn to Rank 1" button
   - `BurnConfirmationModal` appears
   - Burn amount: 100,000 VOID
   - Complete approve → burn flow

3. **Verify Prestige Badge Updated**
   - Prestige badge in `PlayerChipV2` should now display:
     - Star icon: ⭐
     - Rank number: 1
     - Purple/pink gradient background
   - Badge should be clickable → opens prestige window
   - Prestige window should show:
     - Current rank: Rank 1
     - Next rank: Rank 2
     - Burn cost: 250,000 VOID (2.5x multiplier)

4. **Continue Ranking Up (Exponential Costs)**
   - Rank 1→2: 250,000 VOID
   - Rank 2→3: 625,000 VOID
   - Rank 3→4: 1,562,500 VOID
   - Rank 4→5: 3,906,250 VOID
   - ... (continue as VOID balance allows)

5. **Verify Rank 10 (Max)**
   - If reaching Rank 10, verify:
     - "MAX PRESTIGE RANK ACHIEVED 👑" message displays
     - No further rank-up button shown
     - Badge displays gold/rainbow gradient (if implemented)

**Expected Results**:
- ✅ `PrestigeRankUpdated` events emitted for each rank
- ✅ Costs increase exponentially (2.5x per rank)
- ✅ Badge updates immediately after each rank
- ✅ Badge visible in all HUD states (desktop + mobile)
- ✅ Cosmetic effects applied (if wired)

**Edge Cases**:
- Insufficient VOID for next rank → Button disabled with error message
- Rank 10 reached → No further rank-up possible

---

### T5: Mini-App Feature Unlock Flow

**Objective**: Verify users can unlock mini-app premium features.

**Preconditions**:
- User has not unlocked any mini-app features
- User has sufficient VOID (50,000+ per feature)

**Steps**:

1. **Open Mini-App Access Window**
   - Navigate to HUD → BURN menu → "BURN · MINIAPP FEATURES"
   - Verify feature list displays:
     - All features locked by default
     - Each feature shows burn cost (e.g., 50,000 VOID)
     - Features grouped by category (e.g., "Social", "Productivity", "Entertainment")

2. **Select Feature to Unlock**
   - Example: "Premium Chat Filters" (50,000 VOID)
   - Click "Unlock Permanently" button
   - `BurnConfirmationModal` appears
   - Verify burn amount: 50,000 VOID

3. **Execute Burn**
   - Approve + Burn flow
   - Wait for confirmation

4. **Verify Feature Unlocked**
   - Feature card should show "UNLOCKED ✓"
   - Feature should be immediately usable in mini-app
   - Verify gating logic: feature now accessible (e.g., chat filters appear in UI)

5. **Unlock Multiple Features**
   - Test unlocking 3-5 different features
   - Verify each unlock is independent (no sequential requirement)
   - Verify total VOID burned accumulates correctly

**Expected Results**:
- ✅ `FeatureUnlocked` events emitted for each feature
- ✅ Feature access granted immediately
- ✅ Features persist across sessions (stored onchain)
- ✅ UI reflects unlocked state in mini-app

**Edge Cases**:
- Feature already unlocked → Button hidden or disabled
- Invalid feature ID → Error handling

---

### T6: Caps & Safety Limits

**Objective**: Verify daily/yearly burn caps are enforced.

**Preconditions**:
- Fresh test wallet (no prior burns today)
- Sufficient VOID to hit caps

**Steps**:

1. **Test Per-User Daily Cap (100,000 VOID/day)**
   - Perform multiple small burns totaling 100,000 VOID:
     - Burn 1: 20,000 VOID (district unlock)
     - Burn 2: 30,000 VOID (land upgrade)
     - Burn 3: 50,000 VOID (prestige rank)
   - Total: 100,000 VOID burned
   - Attempt one more burn (e.g., 10,000 VOID)
   - **Expected**: Transaction reverts with error: "User daily cap exceeded"

2. **Test Global Daily Cap (10,000,000 VOID/day)**
   - Note: Requires coordinated testing across multiple wallets OR adjusting cap in test deployment
   - If testing with local testnet:
     - Deploy with lower global cap (e.g., 500,000 VOID)
     - Perform burns from multiple wallets until global cap hit
     - Verify all further burns revert: "Global daily cap exceeded"

3. **Test Cap Reset (Next Day)**
   - Fast-forward blockchain time by 24 hours (if local testnet)
   - OR wait for next day (if Base Sepolia)
   - Attempt burn again
   - **Expected**: Burn succeeds (caps reset)

4. **Test Yearly Cap (1,000,000,000 VOID/year)**
   - Note: Difficult to test in practice without time manipulation
   - Document expected behavior: After 1B VOID burned globally in a year, all burns revert until next year

**Expected Results**:
- ✅ Daily caps enforced correctly
- ✅ Caps reset after 24 hours
- ✅ Error messages clear and actionable
- ✅ UI displays cap status (e.g., "Daily limit: 80,000 / 100,000 VOID used")

**Edge Cases**:
- Burn exactly at cap (100,000 VOID) → Succeeds
- Burn 1 VOID over cap → Reverts
- Multiple users hitting caps simultaneously → All enforced independently

---

### T7: Emergency Pause

**Objective**: Verify admin can pause/unpause burn system.

**Preconditions**:
- Test wallet has `DEFAULT_ADMIN_ROLE` on `VoidBurnUtility`
- Burn system currently active (not paused)

**Steps**:

1. **Trigger Pause**
   - Call `VoidBurnUtility.pause()` from admin wallet
   - Transaction confirms
   - Verify `Paused` event emitted

2. **Attempt Burns While Paused**
   - Open any burn window (district, land, creator, prestige, miniapp)
   - Attempt to execute a burn
   - **Expected**: Transaction reverts with error: "Pausable: paused"

3. **Verify UI Handling**
   - All burn buttons should show error state:
     - "System paused by admin"
     - OR generic error toast: "Burn system temporarily unavailable"
   - BurnConfirmationModal should display pause notice

4. **Trigger Unpause**
   - Call `VoidBurnUtility.unpause()` from admin wallet
   - Transaction confirms
   - Verify `Unpaused` event emitted

5. **Resume Burns**
   - Attempt same burn from step 2
   - **Expected**: Burn succeeds normally

**Expected Results**:
- ✅ Pause prevents all burns across all modules
- ✅ Unpause restores full functionality
- ✅ UI communicates pause state clearly
- ✅ Only admin can pause/unpause (non-admin attempts revert)

**Edge Cases**:
- Double pause (already paused) → No-op, no error
- Double unpause (already unpaused) → No-op, no error

---

## 🔍 LOGGING & DEBUGGING

### Block Explorer Monitoring

**Base Sepolia Basescan**: https://sepolia.basescan.org

**Key Events to Watch**:
1. `TokensBurned(user, category, amount, metadata)` — Core burn event
2. `DistrictUnlocked(user, districtId, burnAmount)` — District unlock
3. `ParcelUpgraded(parcelId, fromLevel, toLevel, burnAmount)` — Land upgrade
4. `CreatorTierUnlocked(user, tier, burnAmount)` — Creator tier
5. `PrestigeRankUpdated(user, oldRank, newRank, burnAmount)` — Prestige rank
6. `FeatureUnlocked(user, featureId, burnAmount)` — Mini-app feature
7. `Paused()` / `Unpaused()` — Emergency pause events

### Example Event Filter Query (Basescan)

1. Go to contract address (e.g., `VoidBurnUtility`)
2. Click "Events" tab
3. Filter by event signature:
   - `TokensBurned`: `0x...` (topic 0)
   - Filter by user address (topic 1)
4. View decoded parameters

### Frontend Console Logs

Enable verbose logging in browser console:

```javascript
// In browser console
localStorage.setItem('DEBUG', 'void:burn:*');
```

Expected logs:
- `[useBurnHook] Fetching current state...`
- `[BurnConfirmationModal] Approval tx hash: 0x...`
- `[BurnConfirmationModal] Burn tx hash: 0x...`
- `[BurnConfirmationModal] Burn confirmed!`

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Insufficient balance" | Not enough VOID | Fund wallet with more VOID |
| "User daily cap exceeded" | Burned 100k VOID today | Wait 24 hours or use different wallet |
| "Global daily cap exceeded" | 10M VOID burned globally today | Wait until next day |
| "Pausable: paused" | System paused by admin | Wait for admin to unpause |
| "Sequential unlock required" | Trying to skip tiers/ranks | Unlock previous tier first |
| "Already unlocked" | Feature/district already unlocked | No action needed |

---

## ✅ SIGN-OFF CHECKLIST

Before marking burn system as "production-ready", ensure all tests pass:

### Core Burn Flows
- [ ] **T1: District unlock** tested and passing
- [ ] **T2: Land upgrade** tested and passing (all levels 0→5)
- [ ] **T3: Creator tools** tested and passing (all tiers 1→3)
- [ ] **T4: Prestige rank** tested and passing (at least Rank 0→3)
- [ ] **T5: Mini-app features** tested and passing (at least 3 features)

### Safety & Security
- [ ] **T6: Daily caps** tested and enforced correctly
- [ ] **T6: Yearly cap** logic verified (if possible)
- [ ] **T7: Emergency pause** tested and working
- [ ] **T7: Unpause** tested and working

### Integration & UX
- [ ] **Prestige badge** displays correctly in `PlayerChipV2`
- [ ] **Land upgrade section** appears in `RealEstatePanel`
- [ ] **All 4 burn windows** open correctly from HUD menu
- [ ] **BurnConfirmationModal** reusable across all flows
- [ ] **Error messages** clear and actionable
- [ ] **Loading states** work (pending transactions)
- [ ] **Success toasts** appear after burns

### Contract Verification
- [ ] All 7 contracts verified on Basescan
- [ ] Roles granted correctly (BURN_MANAGER_ROLE, GOVERNOR_ROLE)
- [ ] Events emitting with correct parameters
- [ ] No unexpected reverts (except expected caps/pauses)

### Documentation
- [ ] `.env.local` example provided
- [ ] Deployment addresses documented
- [ ] Test plan executed and results logged
- [ ] Known issues/edge cases documented

---

## 🚀 NEXT STEPS (Post-Testing)

Once all tests pass:

1. **Document Results**
   - Create `BURN_SYSTEM_TEST_RESULTS.md` with:
     - Test execution date
     - Contract addresses (Base Sepolia)
     - Transaction hashes for each test case
     - Screenshots of successful flows
     - Any edge cases discovered

2. **Mainnet Prep (Base - Chain ID: 8453)**
   - Deploy to Base mainnet
   - Update `.env.production` with mainnet addresses
   - Re-run all test cases on mainnet (with real VOID)
   - Monitor for 24-48 hours before public launch

3. **User Documentation**
   - Create user-facing guides:
     - "How to Unlock Districts"
     - "How to Upgrade Land"
     - "How to Earn Prestige Ranks"
   - Add to main docs site

4. **Monitoring & Analytics**
   - Set up event indexing (The Graph subgraph or similar)
   - Track daily burn volume
   - Monitor cap utilization
   - Alert if global cap > 80% in single day

---

**END OF TEST PLAN**
