# VOID Protocol – Phase 3 Build Tracker

**Phase:** Reward Distribution + Land Economy Loop  
**Start Date:** November 11, 2025  
**Target Completion:** TBD  
**Dependencies:** Phase 2 validation complete ✅

---

## 🎯 Phase 3 Objectives

### Core Goals
1. **Enable reward claiming** for stakers (xVOIDVault emissions)
2. **Launch land economy** with ownership yield, district taxes, resale marketplace
3. **Deliver Creator Launch Pad** for token deployment
4. **Add Governance UI** for PSX-based voting (read-only first)

### Success Metrics
- [ ] Users can claim VOID rewards from staking
- [ ] Land owners receive passive yield
- [ ] Land parcels can be listed/bought on secondary market
- [ ] Creators can deploy custom tokens via UI
- [ ] PSX holders can view and participate in governance proposals

---

## 🔴 Core Priority Tasks

### Task 1: Reward Distribution UI
**Status:** Not Started  
**Owner:** TBD  
**Estimated Effort:** 3-5 days

**Deliverables:**
- [ ] Create `hud/defi/RewardsPanel.tsx` component
  - Display pending VOID rewards
  - Show APR boost from vXP
  - Claim button with approval flow
- [ ] Create `hooks/useRewards.ts`
  - Read pending rewards from xVOIDVault
  - Call `claimRewards()` with transaction handling
  - Integrate with TokenExpansionOracle emissions
- [ ] Update `hud/hubs/DeFiHubV2.tsx`
  - Add RewardsPanel to staking tab
  - Wire to live contract data
- [ ] Test flow:
  - Stake VOID → wait 1 block → see pending rewards → claim → balance increases

**Files to Create:**
- `hud/defi/RewardsPanel.tsx`
- `hooks/useRewards.ts`

**Files to Modify:**
- `hud/hubs/DeFiHubV2.tsx`
- `services/defiService.ts` (if additional reward calculation logic needed)

**Contract Dependency:**
- xVOIDVault: `0xab10B2B5E1b07447409BCa889d14F046bEFd8192` (Base Sepolia)
- Ensure `claimRewards()` function is accessible

---

### Task 2: Land Economy Loop
**Status:** Not Started  
**Owner:** TBD  
**Estimated Effort:** 7-10 days

**Sub-tasks:**

#### 2A: Owner Yield System
- [ ] Extend `WorldLandTestnet` → `WorldLandV2.sol`
  - Add `parcelYieldRate` mapping (VOID/block per parcel)
  - Add `claimYield(uint256 parcelId)` function
  - Emit `YieldClaimed` event
- [ ] Create `hooks/useLandYield.ts`
  - Read pending yield for user's parcels
  - Call claim function
- [ ] Update `hud/world/LandGridWindow.tsx`
  - Show pending yield for owned parcels
  - Add "Claim Yield" button

#### 2B: District Taxation
- [ ] Add district tax rates to `WorldCoords.ts`
  ```typescript
  export const DISTRICT_TAX_RATES = {
    defi: 0.02,    // 2% on trades
    creator: 0.01, // 1% on mints
    dao: 0.015,    // 1.5% on votes
    ai: 0.01,      // 1% on agent calls
  }
  ```
- [ ] Route district taxes to parcel owners in that district
- [ ] Display tax revenue in LandGridWindow details panel

#### 2C: Land Marketplace
- [ ] Create `contracts/WorldLandMarketplace.sol`
  - `listParcel(uint256 parcelId, uint256 price)`
  - `buyListedParcel(uint256 parcelId)`
  - `cancelListing(uint256 parcelId)`
  - Fee: 2.5% to protocol (VoidHookRouterV4)
- [ ] Deploy marketplace contract
- [ ] Create `hud/world/LandMarketplace.tsx`
  - Browse listed parcels
  - List your parcels for sale
  - Buy from listings
- [ ] Update `hooks/useWorldLand.ts`
  - Add marketplace interaction functions

**Files to Create:**
- `contracts/WorldLandV2.sol`
- `contracts/WorldLandMarketplace.sol`
- `hud/world/LandMarketplace.tsx`
- `hud/world/YieldPanel.tsx`
- `hooks/useLandYield.ts`
- `hooks/useLandMarketplace.ts`

**Files to Modify:**
- `world/WorldCoords.ts` (add tax rates)
- `hud/world/LandGridWindow.tsx` (add yield + marketplace UI)
- `services/world/useParcels.ts` (fetch yield data)

**Migration Path:**
- Deploy WorldLandV2 + Marketplace
- Add migration script to transfer ownership from V1 → V2
- Update `.env` addresses
- Test full flow on Base Sepolia

---

## 🟡 Medium Priority Tasks

### Task 3: Creator Launch Pad
**Status:** Not Started  
**Owner:** TBD  
**Estimated Effort:** 5-7 days

**Deliverables:**
- [ ] Create `contracts/TokenLaunchPadTestnet.sol`
  - `createToken(name, symbol, supply)` → deploys ERC20
  - `addLiquidity(token, voidAmount, tokenAmount)` → creates LP
  - Fee: 1% of initial supply to protocol
- [ ] Deploy contract to Base Sepolia
- [ ] Create `hud/creator/LaunchPadWindow.tsx`
  - Form: token name, symbol, supply, icon
  - Preview economics (supply, initial price)
  - Deploy button → transaction flow
- [ ] Create `hooks/useTokenLaunch.ts`
  - Call createToken + addLiquidity
  - Track deployed tokens per user
- [ ] Add LaunchPad window to CREATOR hub

**Files to Create:**
- `contracts/TokenLaunchPadTestnet.sol`
- `hud/creator/LaunchPadWindow.tsx`
- `hooks/useTokenLaunch.ts`

**Files to Modify:**
- `hud/hubs/CreatorHubV2.tsx`

---

### Task 4: Governance Shell
**Status:** Not Started  
**Owner:** TBD  
**Estimated Effort:** 4-6 days

**Deliverables:**
- [ ] Create `hud/dao/GovernancePanel.tsx`
  - Display active proposals (mock data initially)
  - Voting UI (disabled for Phase 3, read-only)
  - PSX balance display
- [ ] Create `services/governanceService.ts`
  - Mock proposal data structure
  - Future: integrate with on-chain governance contract
- [ ] Add Governance panel to DAO hub

**Files to Create:**
- `hud/dao/GovernancePanel.tsx`
- `services/governanceService.ts`

**Files to Modify:**
- `hud/hubs/DaoHubV2.tsx`

**Note:** Phase 3 is read-only display; Phase 4 will add on-chain voting.

---

## 🟢 Polish Tasks (Optional)

### Task 5: Social & Chat Persistence
- [ ] Add SQLite/PostgreSQL database
- [ ] Store chat messages with timestamps
- [ ] Friend list system
- [ ] DM functionality

### Task 6: Audio Pipeline
- [ ] Spatial audio for world zones
- [ ] District-specific ambient tracks
- [ ] UI click sounds
- [ ] Integration with `@react-three/fiber` audio

### Task 7: Achievement System
- [ ] Design badge NFT contract
- [ ] XP milestone unlocks
- [ ] Achievement HUD panel

---

## 📋 Task Checklist Template

For each task, track:
- [ ] Requirements finalized
- [ ] Smart contracts written (if applicable)
- [ ] Smart contracts tested locally
- [ ] Smart contracts deployed to Base Sepolia
- [ ] Frontend components created
- [ ] Hooks/services implemented
- [ ] Integration tested end-to-end
- [ ] Manual QA passed
- [ ] Automated tests added
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Merged to main

---

## 🚧 Blockers & Dependencies

| Task | Blocker | Status | Owner |
|------|---------|--------|-------|
| (None currently) | - | - | - |

---

## 📅 Timeline (Proposed)

| Week | Focus | Deliverable |
|------|-------|-------------|
| Week 1 | Rewards UI | RewardsPanel + claim flow functional |
| Week 2-3 | Land Economy | Yield + marketplace deployed + tested |
| Week 3-4 | Creator Launch Pad | Token deployment working on testnet |
| Week 4 | Governance Shell | Read-only proposal UI in DAO hub |
| Week 5 | Testing & Polish | E2E validation, bug fixes, UX refinements |

---

## ✅ Definition of Done

A Phase 3 task is complete when:
1. Smart contracts deployed and verified on Base Sepolia
2. Frontend UI functional and styled per theme
3. Manual test flows documented and passing
4. Code merged to `main` branch
5. Updated in this tracker with "✅ Complete"

---

## 📝 Notes

- All Phase 3 work builds on Phase 2 validation layer
- Use `VOID-E2E-VALIDATION.md` flows to verify integrations
- Run `npm run validate:coords` before each merge
- Update `.env` addresses after new contract deployments
- Keep `TESTING-NOW.md` current with new features

---

**Status Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Testing
- ✅ Complete
