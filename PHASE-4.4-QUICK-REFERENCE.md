# PHASE 4.4 - QUICK REFERENCE CARD

**Last Updated:** November 12, 2025  
**Status:** ✅ DEMO-READY

---

## 🚀 QUICK START

### Enable Demo Mode

```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_WALLET=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Run Demo

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📋 DEMO MODE FEATURES

### What's Active

- ✅ **GOLD Tier** wallet (720 XP, 72% progress)
- ✅ **Rich Data**: 8 chat messages, 6 gigs, 6 guilds, 2 quests
- ✅ **Token Balances**: 2,500 VOID, 1,200 xVOID, 850 PSX, 12 SIGNAL
- ✅ **Unlocked Zones**: Base City, District 2, District 3
- ✅ **Leaderboard**: Rank #7 of 1,247 users
- ✅ **Guild**: VOID Builders (420 XP contributed)

### What's Hidden (Demo Mode Only)

- ❌ Friends icon
- ❌ Voice Chat icon
- ❌ Music icon
- ❌ Minigames icon

### What Shows "(Demo)" Label

- Economy ticker: VOID $0.0024 **(Demo)**
- Economy ticker: PSX $0.0018 **(Demo)**

---

## 🎯 DEMO SCRIPT OUTLINE

**Total Duration:** 15 minutes

1. **Introduction** (2 min) → Show HUD overview, hub switching
2. **Identity & Progression** (3 min) → Profile (GOLD tier), quests, XP
3. **Social & Messaging** (3 min) → Global chat, DMs, tier badges
4. **Economy & DeFi** (3 min) → Wallet balances, airdrop preview, swap
5. **World & Land** (2 min) → Map zones, unlock logic, land registry
6. **Governance & DAO** (2 min) → Voting power, proposals, PSX

**Bonus:** Agency (1 min), Guilds (1 min), Leaderboards (1 min)

**Full Script:** See `PHASE-4.4-DEMO-SCRIPT.md`

---

## 🔍 VALIDATION CHECKLIST

### Before Demo

- [ ] `npm run build` → No errors
- [ ] `npm run dev` → Server starts on :3000
- [ ] Open browser → Demo wallet shows GOLD tier
- [ ] Check ticker → "(Demo)" labels visible
- [ ] Send chat message → Message appears instantly
- [ ] Open Profile → 720 XP, 72% progress
- [ ] Check Bottom Dock → 13 icons visible

### After Demo

- [ ] Gather stakeholder feedback
- [ ] Record demo video for social media
- [ ] Update waitlist with sign-ups
- [ ] Track metrics (Discord joins, investor follow-ups)

---

## 📊 QUERY CAPS (Performance)

| Feature | Cap | Enforced In |
|---------|-----|-------------|
| Global Chat Messages | 100 max in view | `useGlobalChatMessages.ts` |
| DM Thread Messages | 50 max | `useDMThread.ts` |
| DM Conversations | 50 max | `useDMConversations.ts` |
| Leaderboard Entries | 10 max | `useVoidLeaderboards.ts` |
| Messages Per Load | 50 | `QUERY_LIMITS.messagesPerLoad` |

---

## 🛠️ TROUBLESHOOTING

### Demo Wallet Not Showing GOLD Tier

**Check:** `.env.local` has `NEXT_PUBLIC_DEMO_MODE=true`  
**Fix:** Restart dev server after env change

### "(Demo)" Labels Not Showing

**Check:** `isDemoMode()` returns true  
**Fix:** Verify env variable spelling

### Bottom Dock Shows Wrong Icons

**Check:** Demo mode enabled  
**Fix:** In demo mode, Friends/Voice/Music/Games should be hidden

### Chat Message Not Sending

**Check:** Console for errors  
**Fix:** Mock mode should work always (check `shouldUseMockData()`)

---

## 📝 FILE INDEX

### Core Config

- `config/voidConfig.ts` - Demo config, feature flags, query limits

### Demo Data

- `hooks/useDemoData.ts` - Rich demo data provider (passport, balances, quests, gigs, guilds)

### UI Components

- `hud/VoidHudApp.tsx` - Main HUD app (demo data integration)
- `hud/header/HubEconomyStrip.tsx` - Top ticker (dynamic labels)
- `hud/footer/BottomDock.tsx` - Bottom icon dock (demo filtering)

### Hooks

- `hooks/useGlobalChatMessages.ts` - Global chat (100 msg cap)
- `hooks/useDMThread.ts` - DMs (50 msg cap)
- `hooks/useVoidLeaderboards.ts` - Leaderboards (top 10 cap)

### Documentation

- `PHASE-4.4-COMPLETE.md` - Full completion report
- `PHASE-4.4-DEMO-SCRIPT.md` - 15-minute demo walkthrough
- `PHASE-4.4-LOGIC-VALIDATION.md` - 6-part validation suite

---

## 🎯 SUCCESS METRICS

### Demo Quality

- ✅ Zero critical bugs
- ✅ All flows functional
- ✅ No empty screens
- ✅ Smooth performance
- ✅ Professional appearance

### Stakeholder Goals

- **Good Demo:** 10+ Discord signups, 2+ investor follow-ups
- **Great Demo:** 50+ signups, press article, 1+ term sheet

---

## ⚡ NEXT STEPS

### This Week

1. **Rehearse demo** (use PHASE-4.4-DEMO-SCRIPT.md)
2. **Schedule stakeholder presentation**
3. **Record demo video**

### Next 2 Weeks

4. **Deploy VoidScore contract** to Base Sepolia
5. **Install Net Protocol SDK** (6-8 hours)
6. **Add message validation** (500 char max, HTML sanitization)

### Pre-Mainnet

7. **Automated testing** (Jest + React Testing Library)
8. **Price oracle integration** (CoinGecko/Uniswap TWAP)
9. **Complete missing windows** (Friends, Voice, Music, Games)
10. **Security audit** (contracts + frontend)

---

## 🔑 KEY COMMANDS

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Production build
npm run start              # Production server

# Testing (when implemented)
npm run test               # Run Jest tests
npm run test:coverage      # Coverage report

# Deployment (future)
npm run deploy:testnet     # Deploy to Base Sepolia
npm run deploy:mainnet     # Deploy to Base mainnet
```

---

## 📞 SUPPORT

**Issues?** Check:
1. Terminal for errors
2. Browser console (F12)
3. PHASE-4.4-LOGIC-VALIDATION.md for known issues

**Still stuck?** Review PHASE-4.4-COMPLETE.md troubleshooting section.

---

**🎉 Phase 4.4 Complete — Ready to Demo! 🎉**
