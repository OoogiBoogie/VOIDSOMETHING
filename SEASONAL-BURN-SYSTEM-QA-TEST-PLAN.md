# SEASONAL BURN SYSTEM — QA TEST PLAN
**Canonical Spec Compliance Testing**

**Version:** 1.0 (Seasonal)  
**Date:** November 16, 2025  
**Guardian Mode:** 🛡️ ACTIVE

---

## EXECUTIVE SUMMARY

This QA plan validates the **Seasonal Burn System** against all 10 sections of the canonical specification. All tests verify that **caps NEVER block utility**, only affect XP/rewards.

**Critical Validation:**
- ✅ Section 1: Core Philosophy (utility always works)
- ✅ Section 2-3: Seasonal state tracking
- ✅ Section 4: Time window handling
- ✅ Section 5: Canonical burn pipeline
- ✅ Section 6: All 5 modules (District/Land/Creator/Prestige/MiniApp)
- ✅ Section 7: XP/caps separation
- ✅ Section 8: Pause system
- ✅ Section 10: All 6 invariants

---

## TEST SUITE STRUCTURE

### T1: SEASON MANAGEMENT TESTS
**Purpose:** Validate Season 0 initialization and future season transitions

#### T1.1: Season 0 Initialization
```typescript
describe("Season 0 Initialization", () => {
  it("Should initialize Season 0 with correct config", async () => {
    const season0 = await burnUtility.getSeasonConfig(0);
    
    expect(season0.id).to.equal(0);
    expect(season0.active).to.be.true;
    expect(season0.dailyCreditCap).to.equal(ethers.parseEther("6000"));
    expect(season0.seasonCreditCap).to.equal(ethers.parseEther("100000"));
    expect(season0.endTime - season0.startTime).to.equal(90 * 24 * 60 * 60); // 90 days
  });
  
  it("Should have correct XP config for Season 0", async () => {
    const season0 = await burnUtility.getSeasonConfig(0);
    const xpConfig = season0.xpConfig;
    
    expect(xpConfig.dailySoftCap1).to.equal(ethers.parseEther("3000"));
    expect(xpConfig.dailySoftCap2).to.equal(ethers.parseEther("6000"));
    expect(xpConfig.dailyMult1).to.equal(ethers.parseEther("1"));   // 1.0x
    expect(xpConfig.dailyMult2).to.equal(ethers.parseEther("0.5")); // 0.5x
    expect(xpConfig.dailyMult3).to.equal(0);                        // 0x
  });
});
```

#### T1.2: Season Transitions
```typescript
describe("Season Transitions", () => {
  it("Should allow creating Season 1 (admin only)", async () => {
    const season1Config = {
      id: 1,
      startTime: Math.floor(Date.now() / 1000) + (91 * 24 * 60 * 60),
      endTime: Math.floor(Date.now() / 1000) + (181 * 24 * 60 * 60),
      dailyCreditCap: ethers.parseEther("8000"),
      seasonCreditCap: ethers.parseEther("150000"),
      xpConfig: { /* ... */ }
    };
    
    await burnUtility.createSeason(
      1,
      season1Config.startTime,
      season1Config.endTime,
      season1Config.dailyCreditCap,
      season1Config.seasonCreditCap,
      season1Config.xpConfig
    );
    
    const season1 = await burnUtility.getSeasonConfig(1);
    expect(season1.id).to.equal(1);
    expect(season1.active).to.be.false; // Not active yet
  });
  
  it("Should transition from Season 0 to Season 1", async () => {
    // Fast-forward to end of Season 0
    await time.increaseTo(season0.endTime + 1);
    
    await burnUtility.endCurrentSeason(1);
    
    expect(await burnUtility.getCurrentSeasonId()).to.equal(1);
    
    const season0After = await burnUtility.getSeasonConfig(0);
    const season1After = await burnUtility.getSeasonConfig(1);
    
    expect(season0After.active).to.be.false;
    expect(season1After.active).to.be.true;
  });
  
  it("Should preserve Season 0 user data after transition", async () => {
    const userSeason0State = await burnUtility.getUserSeasonState(user.address, 0);
    
    // Transition to Season 1
    await burnUtility.endCurrentSeason(1);
    
    // Season 0 data should be preserved
    const userSeason0StateAfter = await burnUtility.getUserSeasonState(user.address, 0);
    expect(userSeason0StateAfter.burnedThisSeason).to.equal(userSeason0State.burnedThisSeason);
    expect(userSeason0StateAfter.xp).to.equal(userSeason0State.xp);
    
    // Season 1 should start fresh
    const userSeason1State = await burnUtility.getUserSeasonState(user.address, 1);
    expect(userSeason1State.burnedThisSeason).to.equal(0);
    expect(userSeason1State.xp).to.equal(0);
  });
});
```

---

### T2: CANONICAL BURN PIPELINE TESTS
**Purpose:** Validate Section 5 - performUtilityBurn pattern

#### T2.1: Burn Execution (NO BLOCKING)
```typescript
describe("Canonical Burn Pipeline", () => {
  it("CRITICAL: Burns NEVER blocked by daily cap", async () => {
    const season0 = await burnUtility.getSeasonConfig(0);
    const dailyCap = season0.dailyCreditCap;
    
    // Burn exactly dailyCap
    await voidToken.approve(burnUtility.address, dailyCap);
    await burnUtility.performUtilityBurn(
      user.address,
      dailyCap,
      BurnModule.DISTRICT,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
    );
    
    // Try to burn MORE (should succeed!)
    const extraBurn = ethers.parseEther("1000");
    await voidToken.approve(burnUtility.address, extraBurn);
    
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        extraBurn,
        BurnModule.DISTRICT,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [3])
      )
    ).to.not.be.reverted; // ✅ MUST NOT REVERT
  });
  
  it("CRITICAL: Burns NEVER blocked by seasonal cap", async () => {
    const season0 = await burnUtility.getSeasonConfig(0);
    const seasonCap = season0.seasonCreditCap;
    
    // Burn exactly seasonCap over multiple transactions
    const burnPerTx = ethers.parseEther("10000");
    const numTxs = 10; // 10 × 10k = 100k (season cap)
    
    for (let i = 0; i < numTxs; i++) {
      await voidToken.approve(burnUtility.address, burnPerTx);
      await burnUtility.performUtilityBurn(
        user.address,
        burnPerTx,
        BurnModule.LAND,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8"], [1, i])
      );
      
      // Advance time to avoid daily cap
      await time.increase(24 * 60 * 60);
    }
    
    // Try to burn MORE (should succeed!)
    const extraBurn = ethers.parseEther("5000");
    await voidToken.approve(burnUtility.address, extraBurn);
    
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        extraBurn,
        BurnModule.LAND,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8"], [1, 99])
      )
    ).to.not.be.reverted; // ✅ MUST NOT REVERT
  });
  
  it("Should emit UtilityBurn event with seasonId", async () => {
    const burnAmount = ethers.parseEther("1000");
    const seasonId = await burnUtility.getCurrentSeasonId();
    
    await voidToken.approve(burnUtility.address, burnAmount);
    
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        burnAmount,
        BurnModule.CREATOR,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [1])
      )
    ).to.emit(burnUtility, "UtilityBurn")
      .withArgs(
        user.address,
        seasonId,
        BurnModule.CREATOR,
        burnAmount,
        anyValue, // moduleData
        anyValue  // timestamp
      );
  });
});
```

#### T2.2: State Updates
```typescript
describe("State Updates After Burns", () => {
  it("Should update lifetime state correctly", async () => {
    const burnAmount = ethers.parseEther("5000");
    
    const lifetimeBefore = await burnUtility.lifetimeState(user.address);
    
    await voidToken.approve(burnUtility.address, burnAmount);
    await burnUtility.performUtilityBurn(
      user.address,
      burnAmount,
      BurnModule.PRESTIGE,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [1])
    );
    
    const lifetimeAfter = await burnUtility.lifetimeState(user.address);
    
    expect(lifetimeAfter.totalBurnedAllTime).to.equal(
      lifetimeBefore.totalBurnedAllTime + burnAmount
    );
  });
  
  it("Should update seasonal state correctly", async () => {
    const burnAmount = ethers.parseEther("2000");
    const seasonId = await burnUtility.getCurrentSeasonId();
    
    const seasonBefore = await burnUtility.getUserSeasonState(user.address, seasonId);
    
    await voidToken.approve(burnUtility.address, burnAmount);
    await burnUtility.performUtilityBurn(
      user.address,
      burnAmount,
      BurnModule.MINIAPP,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [1])
    );
    
    const seasonAfter = await burnUtility.getUserSeasonState(user.address, seasonId);
    
    expect(seasonAfter.burnedToday).to.equal(seasonBefore.burnedToday + burnAmount);
    expect(seasonAfter.burnedThisSeason).to.equal(seasonBefore.burnedThisSeason + burnAmount);
  });
});
```

---

### T3: TIME WINDOW & DAILY RESET TESTS
**Purpose:** Validate Section 4 - Time & Season Window Handling

#### T3.1: Daily Reset
```typescript
describe("Daily Reset Behavior", () => {
  it("Should reset burnedToday after 24 hours", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    const burnDay1 = ethers.parseEther("3000");
    
    // Burn on Day 1
    await voidToken.approve(burnUtility.address, burnDay1);
    await burnUtility.performUtilityBurn(
      user.address,
      burnDay1,
      BurnModule.DISTRICT,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
    );
    
    const stateDay1 = await burnUtility.getUserSeasonState(user.address, seasonId);
    expect(stateDay1.burnedToday).to.equal(burnDay1);
    
    // Advance 24 hours
    await time.increase(24 * 60 * 60);
    
    // Burn on Day 2
    const burnDay2 = ethers.parseEther("1000");
    await voidToken.approve(burnUtility.address, burnDay2);
    await burnUtility.performUtilityBurn(
      user.address,
      burnDay2,
      BurnModule.LAND,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8"], [1, 1])
    );
    
    const stateDay2 = await burnUtility.getUserSeasonState(user.address, seasonId);
    
    // burnedToday should be reset
    expect(stateDay2.burnedToday).to.equal(burnDay2); // NOT burnDay1 + burnDay2
    
    // burnedThisSeason should accumulate
    expect(stateDay2.burnedThisSeason).to.equal(burnDay1 + burnDay2);
  });
});
```

---

### T4: XP CALCULATION & CAPS TESTS
**Purpose:** Validate Section 7 - XP & Caps Logic

#### T4.1: XP Soft Curve (3 Zones)
```typescript
describe("XP Soft Curve", () => {
  it("Zone 1: 0-3k VOID → 100% XP", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    const burnAmount = ethers.parseEther("2000"); // In Zone 1
    
    const xpEarned = await burnUtility.computeXPFromBurn(user.address, seasonId, burnAmount);
    
    // baseXPPerVOID = 1, multiplier = 1.0x
    const expectedXP = 2000; // 2000 VOID × 1 XP/VOID × 1.0x
    expect(xpEarned).to.equal(expectedXP);
  });
  
  it("Zone 2: 3k-6k VOID → 50% XP", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    
    // First burn 3k to fill Zone 1
    await voidToken.approve(burnUtility.address, ethers.parseEther("3000"));
    await burnUtility.performUtilityBurn(
      user.address,
      ethers.parseEther("3000"),
      BurnModule.DISTRICT,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
    );
    
    // Now burn in Zone 2
    const burnAmount = ethers.parseEther("2000"); // 3k + 2k = 5k (in Zone 2)
    const xpEarned = await burnUtility.computeXPFromBurn(user.address, seasonId, burnAmount);
    
    // 2000 VOID × 1 XP/VOID × 0.5x = 1000 XP
    const expectedXP = 1000;
    expect(xpEarned).to.equal(expectedXP);
  });
  
  it("Zone 3: 6k+ VOID → 0% XP", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    
    // First burn 6k to fill Zones 1 & 2
    await voidToken.approve(burnUtility.address, ethers.parseEther("6000"));
    await burnUtility.performUtilityBurn(
      user.address,
      ethers.parseEther("6000"),
      BurnModule.CREATOR,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [1])
    );
    
    // Now burn in Zone 3
    const burnAmount = ethers.parseEther("5000"); // 6k + 5k = 11k (in Zone 3)
    const xpEarned = await burnUtility.computeXPFromBurn(user.address, seasonId, burnAmount);
    
    // 5000 VOID × 1 XP/VOID × 0x = 0 XP
    expect(xpEarned).to.equal(0);
  });
});
```

#### T4.2: Seasonal Cap Enforcement
```typescript
describe("Seasonal XP Cap", () => {
  it("Should stop earning XP after seasonal cap", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    const season0 = await burnUtility.getSeasonConfig(0);
    const seasonCap = season0.seasonCreditCap; // 100k VOID
    
    // Burn exactly seasonCap over multiple days
    const burnPerDay = ethers.parseEther("6000");
    const numDays = Math.ceil(Number(seasonCap) / Number(burnPerDay));
    
    for (let i = 0; i < numDays; i++) {
      await voidToken.approve(burnUtility.address, burnPerDay);
      await burnUtility.performUtilityBurn(
        user.address,
        burnPerDay,
        BurnModule.LAND,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8"], [i, 1])
      );
      
      await time.increase(24 * 60 * 60); // Next day
    }
    
    // User should have hit seasonal cap
    const stateFull = await burnUtility.getUserSeasonState(user.address, seasonId);
    expect(stateFull.burnedThisSeason).to.be.gte(seasonCap);
    
    // Try to earn more XP
    const extraBurn = ethers.parseEther("5000");
    const xpEarned = await burnUtility.computeXPFromBurn(user.address, seasonId, extraBurn);
    
    expect(xpEarned).to.equal(0); // No XP beyond seasonal cap
    
    // BUT BURN STILL SUCCEEDS
    await voidToken.approve(burnUtility.address, extraBurn);
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        extraBurn,
        BurnModule.PRESTIGE,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [1])
      )
    ).to.not.be.reverted; // ✅ UTILITY STILL WORKS
  });
});
```

---

### T5: MODULE COMPLIANCE TESTS
**Purpose:** Validate Section 6 - All 5 Modules

#### T5.1: District Module (Sequential)
```typescript
describe("District Module", () => {
  it("Should unlock District 1 for free", async () => {
    await districtBurn.unlockDistrict(1);
    
    expect(await districtBurn.isDistrictUnlocked(user.address, 1)).to.be.true;
    expect(await districtBurn.getUnlockedCount(user.address)).to.equal(1);
  });
  
  it("Should enforce sequential unlock when enabled", async () => {
    await districtBurn.setSequentialMode(true);
    
    // Try to unlock District 3 without District 2
    await expect(
      districtBurn.unlockDistrict(3)
    ).to.be.revertedWith("Must unlock previous district first");
    
    // Unlock District 2 first
    const price2 = await districtBurn.districtUnlockPrice(2);
    await voidToken.approve(districtBurn.address, price2);
    await districtBurn.unlockDistrict(2);
    
    // Now unlock District 3
    const price3 = await districtBurn.districtUnlockPrice(3);
    await voidToken.approve(districtBurn.address, price3);
    await districtBurn.unlockDistrict(3);
    
    expect(await districtBurn.getUnlockedCount(user.address)).to.equal(3);
  });
  
  it("Should emit event with seasonId", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    const price = await districtBurn.districtUnlockPrice(4);
    
    await voidToken.approve(districtBurn.address, price);
    
    await expect(districtBurn.unlockDistrict(4))
      .to.emit(districtBurn, "DistrictUnlocked")
      .withArgs(user.address, 4, seasonId, price, anyValue);
  });
});
```

#### T5.2: Land Module (Owner-Only)
```typescript
describe("Land Module", () => {
  it("Should require parcel ownership", async () => {
    await expect(
      landBurn.upgradeParcel(1)
    ).to.be.revertedWith("Not parcel owner");
    
    // Grant ownership
    await landBurn.setParcelOwnership(user.address, 1, true);
    
    // Now upgrade should work
    const cost = await landBurn.getNextUpgradeCost(user.address, 1);
    await voidToken.approve(landBurn.address, cost);
    await landBurn.upgradeParcel(1);
    
    expect(await landBurn.getParcelLevel(user.address, 1)).to.equal(1);
  });
  
  it("Should enforce sequential levels (0→1→2→3→4→5)", async () => {
    await landBurn.setParcelOwnership(user.address, 2, true);
    
    // Upgrade from 0→5 in sequence
    for (let level = 1; level <= 5; level++) {
      const cost = await landBurn.getNextUpgradeCost(user.address, 2);
      await voidToken.approve(landBurn.address, cost);
      await landBurn.upgradeParcel(2);
      
      expect(await landBurn.getParcelLevel(user.address, 2)).to.equal(level);
    }
    
    // Try to upgrade beyond max
    await expect(
      landBurn.upgradeParcel(2)
    ).to.be.revertedWith("Max level reached");
  });
});
```

#### T5.3: Creator Module (Sequential Tiers)
```typescript
describe("Creator Module", () => {
  it("Should enforce sequential tier unlocking (0→1→2→3)", async () => {
    // Try to unlock Tier 2 directly
    await expect(
      creatorBurn.unlockCreatorTier(2)
    ).to.be.revertedWith("Must unlock sequentially");
    
    // Unlock Tier 1
    const cost1 = await creatorBurn.tierCosts(1);
    await voidToken.approve(creatorBurn.address, cost1);
    await creatorBurn.unlockCreatorTier(1);
    
    expect(await creatorBurn.getCreatorTier(user.address)).to.equal(1);
    
    // Now unlock Tier 2
    const cost2 = await creatorBurn.tierCosts(2);
    await voidToken.approve(creatorBurn.address, cost2);
    await creatorBurn.unlockCreatorTier(2);
    
    expect(await creatorBurn.getCreatorTier(user.address)).to.equal(2);
  });
});
```

#### T5.4: Prestige Module (Lifetime)
```typescript
describe("Prestige Module", () => {
  it("Should track prestige as lifetime progression", async () => {
    const seasonId0 = await burnUtility.getCurrentSeasonId();
    
    // Prestige in Season 0
    const cost1 = await prestigeBurn.rankCosts(1);
    await voidToken.approve(prestigeBurn.address, cost1);
    await prestigeBurn.prestige();
    
    expect(await prestigeBurn.getPrestigeRank(user.address)).to.equal(1);
    
    // Transition to Season 1
    await time.increaseTo((await burnUtility.getSeasonConfig(0)).endTime + 1);
    await burnUtility.endCurrentSeason(1);
    
    // Prestige rank should persist
    expect(await prestigeBurn.getPrestigeRank(user.address)).to.equal(1);
    
    // Continue prestige in Season 1
    const cost2 = await prestigeBurn.rankCosts(2);
    await voidToken.approve(prestigeBurn.address, cost2);
    await prestigeBurn.prestige();
    
    expect(await prestigeBurn.getPrestigeRank(user.address)).to.equal(2);
  });
});
```

#### T5.5: MiniApp Module (Permanent Unlocks)
```typescript
describe("MiniApp Module", () => {
  it("Should unlock mini-app permanently", async () => {
    await miniAppBurn.registerMiniApp(
      1,
      "Test App",
      "Test Description",
      ethers.parseEther("10000")
    );
    
    const price = await miniAppBurn.miniAppPrice(1);
    await voidToken.approve(miniAppBurn.address, price);
    await miniAppBurn.unlockMiniApp(1);
    
    expect(await miniAppBurn.isMiniAppUnlocked(user.address, 1)).to.be.true;
    
    // Try to unlock again
    await expect(
      miniAppBurn.unlockMiniApp(1)
    ).to.be.revertedWith("Already unlocked");
  });
});
```

---

### T6: PAUSE SYSTEM TESTS
**Purpose:** Validate Section 8 - Emergency Pause

#### T6.1: System-Wide Pause
```typescript
describe("System Pause", () => {
  it("Should block ALL burns when paused", async () => {
    await burnUtility.pauseBurns();
    
    const burnAmount = ethers.parseEther("1000");
    await voidToken.approve(burnUtility.address, burnAmount);
    
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        burnAmount,
        BurnModule.DISTRICT,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
      )
    ).to.be.revertedWith("Pausable: paused");
  });
  
  it("Should resume burns when unpaused", async () => {
    await burnUtility.pauseBurns();
    await burnUtility.unpauseBurns();
    
    const burnAmount = ethers.parseEther("1000");
    await voidToken.approve(burnUtility.address, burnAmount);
    
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        burnAmount,
        BurnModule.LAND,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8"], [1, 1])
      )
    ).to.not.be.reverted;
  });
});
```

#### T6.2: Module-Specific Pause
```typescript
describe("Module Pause", () => {
  it("Should block only specific module when paused", async () => {
    await burnUtility.pauseModule(BurnModule.CREATOR);
    
    // Creator burns should fail
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        ethers.parseEther("1000"),
        BurnModule.CREATOR,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [1])
      )
    ).to.be.revertedWith("Module paused");
    
    // Other modules should still work
    await voidToken.approve(burnUtility.address, ethers.parseEther("1000"));
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        ethers.parseEther("1000"),
        BurnModule.DISTRICT,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
      )
    ).to.not.be.reverted;
  });
});
```

---

### T7: INVARIANT VALIDATION TESTS
**Purpose:** Validate Section 10 - All 6 Invariants

#### INV-1: Utility Allowed Invariant
```typescript
describe("INV-1: Utility Allowed", () => {
  it("Burns MUST succeed if: not paused, has VOID, meets prereqs", async () => {
    // Conditions:
    // ✅ System not paused
    // ✅ Module not paused
    // ✅ User has sufficient VOID
    // ✅ Meets prerequisites (none for district 1)
    
    const burnAmount = ethers.parseEther("100000"); // Way above all caps
    await voidToken.approve(burnUtility.address, burnAmount);
    
    // This MUST succeed
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        burnAmount,
        BurnModule.DISTRICT,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
      )
    ).to.not.be.reverted;
  });
});
```

#### INV-2: Monotonicity Invariant
```typescript
describe("INV-2: Monotonicity", () => {
  it("Lifetime burns MUST strictly increase", async () => {
    const before = (await burnUtility.lifetimeState(user.address)).totalBurnedAllTime;
    
    const burnAmount = ethers.parseEther("1000");
    await voidToken.approve(burnUtility.address, burnAmount);
    await burnUtility.performUtilityBurn(
      user.address,
      burnAmount,
      BurnModule.LAND,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8"], [1, 1])
    );
    
    const after = (await burnUtility.lifetimeState(user.address)).totalBurnedAllTime;
    
    expect(after).to.be.gt(before);
    expect(after - before).to.equal(burnAmount);
  });
  
  it("Seasonal burns MUST be non-decreasing within season", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    const before = (await burnUtility.getUserSeasonState(user.address, seasonId)).burnedThisSeason;
    
    const burnAmount = ethers.parseEther("500");
    await voidToken.approve(burnUtility.address, burnAmount);
    await burnUtility.performUtilityBurn(
      user.address,
      burnAmount,
      BurnModule.CREATOR,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [1])
    );
    
    const after = (await burnUtility.getUserSeasonState(user.address, seasonId)).burnedThisSeason;
    
    expect(after).to.be.gte(before);
  });
});
```

#### INV-3: Idempotent Unlocks Invariant
```typescript
describe("INV-3: Idempotent Unlocks", () => {
  it("District unlocks MUST be one-way (false → true)", async () => {
    expect(await districtBurn.isDistrictUnlocked(user.address, 2)).to.be.false;
    
    const price = await districtBurn.districtUnlockPrice(2);
    await voidToken.approve(districtBurn.address, price);
    await districtBurn.unlockDistrict(2);
    
    expect(await districtBurn.isDistrictUnlocked(user.address, 2)).to.be.true;
    
    // Try to unlock again
    await expect(
      districtBurn.unlockDistrict(2)
    ).to.be.revertedWith("Already unlocked");
  });
  
  it("Land levels MUST NOT exceed MAX_LAND_LEVEL", async () => {
    await landBurn.setParcelOwnership(user.address, 99, true);
    
    // Upgrade to max
    for (let level = 1; level <= 5; level++) {
      const cost = await landBurn.getNextUpgradeCost(user.address, 99);
      await voidToken.approve(landBurn.address, cost);
      await landBurn.upgradeParcel(99);
    }
    
    expect(await landBurn.getParcelLevel(user.address, 99)).to.equal(5);
    
    // Try to go beyond max
    await expect(
      landBurn.upgradeParcel(99)
    ).to.be.revertedWith("Max level reached");
  });
});
```

#### INV-4: Caps Non-Blocking Invariant
```typescript
describe("INV-4: Caps Non-Blocking", () => {
  it("Burns MUST succeed even when daily cap exhausted", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    const season0 = await burnUtility.getSeasonConfig(0);
    
    // Exhaust daily cap
    await voidToken.approve(burnUtility.address, season0.dailyCreditCap);
    await burnUtility.performUtilityBurn(
      user.address,
      season0.dailyCreditCap,
      BurnModule.DISTRICT,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
    );
    
    // Verify cap is hit
    const state = await burnUtility.getUserSeasonState(user.address, seasonId);
    expect(state.burnedToday).to.be.gte(season0.dailyCreditCap);
    
    // Try to burn more (MUST succeed)
    const extraBurn = ethers.parseEther("5000");
    await voidToken.approve(burnUtility.address, extraBurn);
    
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        extraBurn,
        BurnModule.LAND,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8"], [1, 1])
      )
    ).to.not.be.reverted; // ✅ CRITICAL: MUST NOT REVERT
  });
});
```

#### INV-5: Pause-Only Blocking Invariant
```typescript
describe("INV-5: Pause-Only Blocking", () => {
  it("ONLY pause flags MUST block burns", async () => {
    // Test all non-pause conditions that MUST NOT block:
    
    // 1. Daily cap exhausted → should NOT block
    const dailyCap = (await burnUtility.getSeasonConfig(0)).dailyCreditCap;
    await voidToken.approve(burnUtility.address, dailyCap);
    await burnUtility.performUtilityBurn(
      user.address,
      dailyCap,
      BurnModule.DISTRICT,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
    );
    
    await voidToken.approve(burnUtility.address, ethers.parseEther("1000"));
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        ethers.parseEther("1000"),
        BurnModule.LAND,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint8"], [1, 1])
      )
    ).to.not.be.reverted;
    
    // 2. Now test pause DOES block
    await burnUtility.pauseBurns();
    
    await voidToken.approve(burnUtility.address, ethers.parseEther("1000"));
    await expect(
      burnUtility.performUtilityBurn(
        user.address,
        ethers.parseEther("1000"),
        BurnModule.CREATOR,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [1])
      )
    ).to.be.revertedWith("Pausable: paused");
  });
});
```

#### INV-6: XP Under Caps Invariant
```typescript
describe("INV-6: XP Under Caps", () => {
  it("XP MUST increase when credit remains", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    const burnAmount = ethers.parseEther("1000"); // Under daily cap
    
    const xpBefore = (await burnUtility.getUserSeasonState(user.address, seasonId)).xp;
    
    // Award XP
    await xpSystem.awardXPForBurn(user.address, seasonId, burnAmount);
    
    const xpAfter = (await burnUtility.getUserSeasonState(user.address, seasonId)).xp;
    
    expect(xpAfter).to.be.gt(xpBefore);
  });
  
  it("XP MUST be zero when caps exhausted", async () => {
    const seasonId = await burnUtility.getCurrentSeasonId();
    const season0 = await burnUtility.getSeasonConfig(0);
    
    // Exhaust daily cap
    await voidToken.approve(burnUtility.address, season0.dailyCreditCap);
    await burnUtility.performUtilityBurn(
      user.address,
      season0.dailyCreditCap,
      BurnModule.DISTRICT,
      ethers.AbiCoder.defaultAbiCoder().encode(["uint8"], [2])
    );
    
    // Try to earn more XP
    const extraBurn = ethers.parseEther("5000");
    const xpEarned = await burnUtility.computeXPFromBurn(user.address, seasonId, extraBurn);
    
    expect(xpEarned).to.equal(0);
  });
});
```

---

## TEST EXECUTION CHECKLIST

- [ ] T1: Season Management (initialization, transitions, data preservation)
- [ ] T2: Canonical Burn Pipeline (no blocking, events, state updates)
- [ ] T3: Time Windows (daily reset, seasonal tracking)
- [ ] T4: XP Calculation (3-zone curve, daily/seasonal caps)
- [ ] T5: Module Compliance (all 5 modules tested)
- [ ] T6: Pause System (global + module-specific)
- [ ] T7: Invariant Validation (all 6 invariants verified)

---

## GUARDIAN MODE ALERTS

🛡️ **Will flag if ANY test fails that violates:**
1. Caps blocking utility (INV-1, INV-4)
2. Missing seasonId in events (T2)
3. Incorrect state isolation between seasons (T1.2)
4. XP earned beyond caps (INV-6)
5. Lifetime state corruption (INV-2)
6. Non-pause blocking (INV-5)

---

**END OF QA TEST PLAN**

**Status:** Ready for execution  
**Next:** Run test suite with `npx hardhat test`
