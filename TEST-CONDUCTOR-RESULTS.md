# Test Conductor - Quick Results Template

**Test Session ID:** `qa-YYYYMMDD-HHMMSS`  
**Tester:** _____________  
**Date:** 2025-11-__  
**Duration:** _____ minutes  

---

## ✅ Automated Checks

- [ ] Node.js v18+ ✓
- [ ] Foundry (cast) ✓
- [ ] RPC Primary reachable ✓
- [ ] RPC Fallback reachable ✓
- [ ] Chain ID = 0x14ad (84532) ✓
- [ ] UI responding (localhost:3000) ✓
- [ ] Coordinate validator passed ✓

---

## 💰 Fee Routing Proof

**Swap executed:**
- Input: __________ VOID
- Output: __________ USDC
- TX Hash: `0x...`

**Router Balance:**
- Pre-swap: ______________ VOID
- Post-swap: ______________ VOID
- **Delta: ______________ VOID**
- Expected: ______________ VOID (0.3%)
- Variance: ______%

**Result:** ⬜ PASS / ⬜ FAIL

---

## 📊 Staking APR

**Displayed in WalletTab:**
- Base APR: ______% (expected: 12%)
- XP Boost: +______%

**Result:** ⬜ PASS / ⬜ FAIL

---

## 🗺️ World Sync

**Test:**
- Clicked parcel: (_____, _____)
- HUD updated: ⬜ Yes / ⬜ No
- Sync time: _______ ms (expected: ≤3000ms)

**Result:** ⬜ PASS / ⬜ FAIL

---

## 🎮 FPS Performance

**Measured FPS:** ______ FPS

- ✅ ≥60 FPS: Excellent
- ⚠️ 55-59 FPS: Acceptable  
- ⚠️ 30-54 FPS: Warning
- ❌ <30 FPS: Fail

**Result:** ⬜ PASS / ⬜ FAIL

---

## 📝 Issues Found

**Issue #1:**
```
[Description]
```

**Issue #2:**
```
[Description]
```

---

## 🎯 Final Result

⬜ **ALL PASS** - Ready for next phase  
⬜ **PASS WITH WARNINGS** - Minor issues  
⬜ **FAIL** - Critical issues found

**Total Score:** ___ / 5 tests passed

---

**QA Log:** `qa-reports/qa-YYYYMMDD-HHMMSS.jsonl`  
**Next Action:** ________________
