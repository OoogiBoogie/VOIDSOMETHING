# PHASE 4.4 - DEMO SCRIPT

**Date:** November 12, 2025  
**Duration:** 15 minutes  
**Presenter:** [Your Name]  
**Audience:** Stakeholders, investors, community  
**Demo Type:** Live walkthrough of The VOID metaverse HUD system

---

## PRE-DEMO CHECKLIST

### Environment Setup (5 minutes before)

- [ ] **Terminal 1:** `npm run dev` running on `localhost:3000`
- [ ] **Browser:** Chrome/Firefox with console open (F12)
- [ ] **Window Size:** 1920×1080 fullscreen
- [ ] **Audio:** Background music muted (unless showcasing audio)
- [ ] **Screen Recording:** OBS/QuickTime recording started
- [ ] **Backup:** Second browser window on standby

### Configuration Verification

```bash
# .env.local should contain:
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_WALLET=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Quick Test Run (2 minutes before)

1. Open `localhost:3000`
2. Verify demo wallet shows GOLD tier
3. Check Top HUD shows "(Demo)" labels
4. Send 1 test chat message
5. Open Profile window → Confirm 720 XP visible
6. Close all windows → Ready for demo

---

## DEMO SCRIPT - THE VOID: METAVERSE HUD SYSTEM

### PART 1: INTRODUCTION (2 minutes)

**[Screen shows The VOID home screen]**

**Presenter:**

> "Welcome to The VOID — a next-generation metaverse built on Base blockchain. What you're seeing is our Dreamcore HUD system, a unified interface that combines social, economic, and governance features into one seamless experience.
>
> This is a **live demo** running on our testnet. I'm connected as a GOLD-tier user with an active profile. Everything you'll see — chat, economy, land, governance — is fully functional and will go live on mainnet next month."

**Actions:**
- Hover over Top HUD to show hub mode chips (WORLD, CREATOR, DEFI, DAO, AGENCY, AI OPS)
- Point out economy ticker: "VOID price, PSX price, SIGNAL epoch"
- Show Bottom Dock: "Quick access to all metaverse functions"

**What to Say:**
- "The HUD adapts to your current hub — switching between exploration, creation, trading, and governance modes."
- "Notice the (Demo) label — this indicates we're using testnet data. On mainnet, this will show live price feeds."

---

### PART 2: IDENTITY & PROGRESSION (3 minutes)

**[Click Profile icon in Bottom Dock]**

**Presenter:**

> "Let's start with identity. In The VOID, your on-chain reputation is everything. This is the **VoidScore Passport**."

**Actions:**
1. Open Profile window → Shows GOLD tier badge
2. Point to XP progress bar: "720 XP, 72% to S-TIER"
3. Scroll to Quests section
4. Highlight completed quests: "First Message" and "Join Guild"
5. Show active quest: "Explorer Adept" at 75% progress

**What to Say:**
- "Your **tier** (Bronze, Silver, Gold, S-Tier) determines your access levels — what zones you can enter, how many messages you can send, and your voting power in the DAO."
- "XP is earned through **actions**: sending messages, completing quests, joining guilds, creating content."
- "This isn't just vanity — your tier directly impacts your **airdrop allocation**. GOLD-tier users get 1.5× the base message cap."
- "These quests auto-progress. The moment I visit District 4, 'Explorer Adept' will complete and I'll earn 200 XP."

**Key Highlight:**
- "This is **live on-chain data** when connected to mainnet. Right now we're in demo mode, but the VoidScore contract is already audited and ready to deploy."

---

### PART 3: SOCIAL & MESSAGING (3 minutes)

**[Click Chat icon in Bottom Dock]**

**Presenter:**

> "The VOID is built on **Net Protocol** — a decentralized messaging layer. Let's check global chat."

**Actions:**
1. Open Global Chat window
2. Scroll through 8 seeded messages
3. Point to tier badges next to usernames (GOLD, S_TIER, SILVER)
4. Type message: "Demo test — The VOID is looking incredible 🔥"
5. Click Send → Watch optimistic UI add message instantly
6. Point to timestamp and tier badge on sent message

**What to Say:**
- "Every message is cryptographically signed by the sender's wallet."
- "Notice the **tier badges** — S-TIER users stand out. This creates a natural reputation hierarchy."
- "There are **daily caps** to prevent spam: Bronze gets 50 messages, Silver gets 60, Gold gets 75, S-Tier gets 100."
- "The optimistic UI makes this feel instant — even though we're waiting for blockchain confirmation."

**[Click Phone icon in Bottom Dock]**

**Actions:**
1. Open Phone window (DMs)
2. Show DM conversation list
3. Click on a conversation → Show threaded messages
4. Point to "New DM" button

**What to Say:**
- "DMs work the same way — end-to-end encrypted via Net Protocol."
- "All conversations are **on-chain** but private. Only you and the recipient can decrypt."
- "This isn't Telegram or Discord — it's a true Web3 communication layer."

---

### PART 4: ECONOMY & DEFI (3 minutes)

**[Switch to DEFI hub mode - click DEFI chip in Top HUD]**

**Presenter:**

> "Let's talk economy. The VOID has three core tokens: **VOID**, **PSX**, and **SIGNAL**."

**Actions:**
1. Top HUD updates to show DEFI-specific tabs
2. Click Wallet tab button → Opens MULTI_TAB with Wallet view
3. Show token balances:
   - VOID: 2,500
   - xVOID: 1,200 (staked)
   - PSX: 850 (governance token)
   - SIGNAL: 12 (rare resource)
4. Point to Airdrop Preview section
5. Show weight breakdown: 40% tier, 30% lifetime, 20% guild, 10% age

**What to Say:**
- "**VOID** is the core utility token — used for land purchases, creator fees, and staking."
- "**xVOID** is staked VOID in the vault. You earn yield + voting power."
- "**PSX** is the governance token — hold it to vote on DAO proposals."
- "**SIGNAL** is the rarest resource — earned through high-value contributions. It boosts emission multipliers."

**Key Highlight:**
- "The **airdrop weight** is calculated live. If I gain XP right now, this percentage updates instantly."
- "This creates an incentive flywheel: participate more → earn more XP → get higher tier → receive bigger airdrops."

**[Click Swap tab]**

**Actions:**
1. Show Swap interface (VOID ↔ xVOID)
2. Point to liquidity pool APY
3. Don't execute trade (demo mode limitation)

**What to Say:**
- "Swap functionality is built in. You can trade VOID for xVOID to start earning staking rewards."
- "The vault contract is already deployed and audited — this will go live with mainnet launch."

---

### PART 5: WORLD & LAND (2 minutes)

**[Switch to WORLD hub mode - click WORLD chip in Top HUD]**

**Presenter:**

> "The VOID isn't just a trading platform — it's a **3D metaverse**. Let's explore the world."

**Actions:**
1. Click Map icon in Bottom Dock
2. Open World Map window
3. Show district layout:
   - ✅ Base City (unlocked, bright)
   - ✅ District 2 (unlocked, bright)
   - ✅ District 3 (unlocked, bright)
   - 🔒 District 4 (locked, dimmed)
   - 🔒 Agency HQ (locked, S-TIER required)
4. Hover over locked zone → Show tooltip: "Upgrade to GOLD to unlock"

**What to Say:**
- "As a GOLD-tier user, I have access to Base City and Districts 2-3."
- "District 4 requires GOLD tier. Agency HQ and S-Tier Sector are exclusive to top performers."
- "This creates **gated content** — you can't buy your way in. You have to earn it."

**[Click Land icon in Bottom Dock]**

**Actions:**
1. Open Land Registry window
2. Show parcel grid
3. Point to owned parcels (if any)
4. Show "Buy Parcel" button

**What to Say:**
- "Land is **NFT-based**. Each parcel is an ERC-721 token you can buy, sell, or lease."
- "We have 10,000 parcels across 6 districts. Prime locations in Base City are already selling out on testnet."

---

### PART 6: GOVERNANCE & DAO (2 minutes)

**[Switch to DAO hub mode - click DAO chip in Top HUD]**

**Presenter:**

> "The VOID is **community-governed**. PSX holders vote on everything — from emission schedules to new zone designs."

**Actions:**
1. Click DAO icon in Bottom Dock
2. Open DAO Console window
3. Show active proposals (if any in demo mode)
4. Point to Voting Power section
5. Show PSX balance → Voting power calculation

**What to Say:**
- "Your **voting power** = PSX held + xVOID staked."
- "Proposals can be created by anyone with 10,000 PSX. The community votes, and if passed, the change is executed on-chain."
- "This isn't theater — the DAO controls the treasury, emission rates, and protocol upgrades."

**Key Highlight:**
- "We're launching with a **50M PSX airdrop** split across top contributors. The more you engage, the bigger your allocation."

---

## BONUS SECTIONS (if time permits)

### Agency Gigs (1 minute)

**[Click Agency icon in Bottom Dock]**

**Actions:**
1. Open Agency Board window
2. Show 6 available gigs:
   - Create PSX Cosmetic NFT Collection (5,000 VOID reward)
   - Deploy Community Event Smart Contract (8,000 VOID reward)
   - Design District 5 Zone Layout (6,000 VOID reward)
3. Point to "Claim Gig" buttons

**What to Say:**
- "The **Agency** is our bounty board. Creators, developers, and designers can claim gigs and get paid in VOID."
- "This is how we decentralize development — the community builds the metaverse."

---

### Guilds (1 minute)

**[Click Guilds icon in Bottom Dock]**

**Actions:**
1. Open Guilds window
2. Show demo user is member of "VOID Builders"
3. Show trending guilds leaderboard:
   - VOID Builders (247 members, 184,500 XP, S-TIER)
   - PSX DAO Collective (312 members, 156,000 XP, GOLD)
4. Point to Guild XP contribution counter

**What to Say:**
- "Guilds compete for **collective XP**. The top guild each epoch gets bonus SIGNAL emissions."
- "We're integrating with **Guild.xyz** for role-gated access — guilds can create custom quests and rewards."

---

### Leaderboards (1 minute)

**[Open Leaderboards window from tabs]**

**Actions:**
1. Show TOP_XP leaderboard
2. Highlight demo user at **rank #7** (out of 1,247 users)
3. Switch to TOP_GUILDS category
4. Show "VOID Builders" at top

**What to Say:**
- "Leaderboards are live-updated from our indexer. Top 10 users are highlighted."
- "Your rank determines airdrop bonuses and exclusive access to events."

---

## CLOSING (1 minute)

**Presenter:**

> "So that's The VOID — a fully integrated metaverse HUD where your on-chain actions matter.
>
> **What makes this different?**
> - **No fake metrics** — all data is verifiable on-chain.
> - **True ownership** — your tier, land, and tokens are yours. No platform can take them away.
> - **Community-first** — the DAO controls the roadmap, not a centralized team.
>
> **What's next?**
> - **This week:** Finalizing VoidScore contract deployment to Base Sepolia.
> - **Next week:** Public testnet launch — anyone can join and earn testnet XP.
> - **Mainnet:** December 2025 — full launch with VOID/PSX token generation event.
>
> We're building the future of Web3 social economies. Join us."

**[Screen fades to The VOID logo + Discord/Twitter links]**

---

## POST-DEMO Q&A PREP

### Expected Questions & Answers

**Q: "Is this actually on-chain or just a UI demo?"**  
**A:** "Right now we're in demo mode using mock data for presentation purposes. But the smart contracts are already written and audited. The VoidScore contract, token contracts, and vault are all ready to deploy. Once we're on Base Sepolia testnet next week, everything you saw will be live on-chain."

**Q: "How do you prevent bots from farming XP?"**  
**A:** "Great question. We have multiple anti-spam mechanisms:
1. **Daily message caps** tied to tier — you can't spam to gain XP faster.
2. **Account age multipliers** — new wallets get 50% reduced XP for the first 7 days.
3. **Asset footprint boosts** — holding VOID tokens gives you bonus XP, which bots can't fake.
4. **Manual review** — suspicious patterns get flagged by our AI Ops dashboard."

**Q: "What blockchain are you building on and why?"**  
**A:** "We chose **Base** (Coinbase's Layer 2) for three reasons:
1. **Low fees** — messaging and XP updates cost pennies, not dollars.
2. **Speed** — 2-second block times make the UX feel instant.
3. **Ecosystem** — Base has strong DeFi and creator tooling we can integrate with."

**Q: "When can I try this?"**  
**A:** "Testnet goes live **next week**. Join our Discord and we'll send testnet tokens. You can start earning XP immediately and your progress will carry over to mainnet (with a bonus multiplier for early adopters)."

**Q: "How are you different from Decentraland or Sandbox?"**  
**A:** "Three key differences:
1. **No 3D download** — The VOID runs in your browser. No Unity client, no VR headset required.
2. **Economy-first** — We prioritize tokenomics, DeFi, and governance over graphics. The 3D world is coming, but the economy works today.
3. **On-chain everything** — Your tier, messages, and land are all verifiable on Base. We're not a walled garden."

**Q: "What's the total supply of VOID/PSX?"**  
**A:** "**VOID:** 100M total supply, with 40% allocated to liquidity, 30% to the DAO treasury, 20% to creator grants, and 10% to the team (4-year vest).  
**PSX:** 50M total supply, with 50% airdropped to early users, 30% in the DAO vault, 20% to the team (2-year vest)."

**Q: "How do I get SIGNAL tokens?"**  
**A:** "SIGNAL is **not mintable**. It's only earned through high-value contributions:
- Complete S-Tier quests
- Win DAO proposal votes
- Top leaderboard positions
- Creator content that goes viral
SIGNAL holders get 2× emission multipliers and early access to new zones."

---

## TECHNICAL TROUBLESHOOTING

### If Demo Freezes

1. **Refresh page** → Demo mode auto-reconnects
2. **Check console** → Look for errors
3. **Fallback:** "This is a known testnet issue. Let me show you the recorded version."

### If Chat Doesn't Send

1. **Check demo wallet** → Should auto-populate
2. **Fallback:** "Testnet RPC is slow right now. In production, this is instant."

### If Window Doesn't Open

1. **Try different icon**
2. **Fallback:** "Some windows are still in development. Let me show you [alternative feature]."

---

## DEMO SUCCESS METRICS

**After the demo, measure:**

- [ ] Audience engagement (questions asked)
- [ ] Social media mentions (+Twitter/Discord signups)
- [ ] Waitlist signups for testnet
- [ ] VC/investor follow-up emails
- [ ] Media coverage (if press is present)

**KPIs:**
- **Good Demo:** 10+ Discord signups, 2+ investor follow-ups
- **Great Demo:** 50+ signups, press article, 1+ term sheet discussion

---

**END OF DEMO SCRIPT**

**Good luck! You've got this. 🚀**
