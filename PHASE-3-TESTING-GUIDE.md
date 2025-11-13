# 🧪 PHASE-3 WINDOW TESTING GUIDE

**Purpose:** Quick reference for testing all newly implemented Priority 1 windows.

---

## 🚀 HOW TO TEST

### Start Dev Server
```bash
npm run dev
# Navigate to http://localhost:3000
```

---

## 1️⃣ PROFILE PASSPORT (PLAYER_PROFILE)

### How to Open:
**Option A - Via Code (Quick Test):**
```typescript
// In VoidHudApp or any component with access to openWindow:
openWindow('PLAYER_PROFILE', { address: '0xYourAddress' });
```

**Option B - Via Bottom Icon Bar:**
- Look for **User icon** (should be in bottom dock)
- Click to open Profile Passport
- If not wired yet: Manually trigger via console

**Option C - Via Profile Link (Future):**
- Click username in chat messages
- Click guild member in guilds list
- Click squad member in agency board

### What to Verify:
- ✅ Avatar displays (User icon placeholder)
- ✅ Username shows "void_user_42" (mock)
- ✅ Tier badge shows "GOLD" with yellow gradient
- ✅ Current Score: 327 (large number)
- ✅ Lifetime Score: 8,942 (stats row)
- ✅ XP progress bar: 78% fill (visual)
- ✅ "273 XP to next tier" text displays
- ✅ Badges section: 4 badges (OG, ALPHA, BUILDER, WHALE)
- ✅ Achievements grid: 12/50 unlocked (8 grayscale)
- ✅ Guilds section: 2 guilds with Shield icons
- ✅ Recent activity: 5 items with timestamps
- ✅ Tabs: Overview, Achievements, Activity (clickable)
- ✅ Action buttons: Edit Profile, Customize Avatar, View All Achievements
- ✅ Linked socials: Twitter, Discord, Farcaster (with verify icons)

### Expected Behavior:
- Clicking guild name → Opens GUILDS window
- Clicking "View All Achievements" → Opens ACHIEVEMENTS window (placeholder)
- Clicking "Edit Profile" → Opens profile edit modal (TODO)
- Clicking "Customize Avatar" → Opens avatar editor (TODO)
- Close button (X) → Closes window

---

## 2️⃣ GLOBAL CHAT (GLOBAL_CHAT)

### How to Open:
**Option A - Via Code:**
```typescript
openWindow('GLOBAL_CHAT');
```

**Option B - Via Bottom Icon Bar:**
- Look for **MessageCircle icon** (chat icon)
- Click to open Global Chat
- If not wired yet: Manually trigger

### What to Verify:
- ✅ Header shows "GLOBAL CHAT"
- ✅ Daily cap indicator: "12/50 today" (cyan border, normal state)
- ✅ 5 mock messages display (alice, bob, charlie, dave, eve)
- ✅ Each message shows:
  - Avatar (2-letter initials, tier-colored background)
  - Username (e.g., "alice.void")
  - Tier badge (Star icon, color-coded)
  - Message text
  - Timestamp ("Just now", "5m ago", etc.)
- ✅ Message input field (280 char limit)
- ✅ Send button (enabled, cyan background)
- ✅ Character counter: "0/280" updates as you type

### Test Anti-Spam:
1. **Type a message** (e.g., "Hello world!")
   - ✅ Counter updates: "13/280"
   - ✅ Send button enabled
2. **Click Send**
   - ✅ Message appears with "Sending..." indicator
   - ✅ Counter updates: "13/50 today"
   - ✅ After 1s: "Sending..." disappears
3. **Send 37 more messages** (manually increment `messagesSentToday` in state to 49)
   - ✅ Cap indicator: "49/50 today" (still cyan)
4. **Send 1 more message** (now at 50/50)
   - ✅ Cap indicator: "50/50 today" (turns AMBER, shows warning)
   - ✅ Warning text: "0 left" (amber AlertCircle icon)
   - ✅ Send button disabled
   - ✅ Toast appears: "Daily message cap reached..."
   - ✅ Input field disabled

### Expected Behavior:
- Auto-scroll to bottom when new message arrives
- Enter key sends message
- Shift+Enter adds newline
- Close button (X) closes window

---

## 3️⃣ PHONE (DM SYSTEM)

### How to Open:
**Option A - Via Code:**
```typescript
openWindow('PHONE');
```

**Option B - Via Bottom Icon Bar:**
- Look for **Phone icon** (should be in bottom dock)
- Click to open Phone window

### What to Verify:
- ✅ Header shows "DIRECT MESSAGES"
- ✅ Daily DM cap: "14/20 DMs today" (cyan border, normal state)
- ✅ Left panel: 3 conversations (alice, bob, charlie)
- ✅ Each conversation shows:
  - Avatar (User icon, tier-colored gradient)
  - Online indicator (green dot for alice/charlie, none for bob)
  - Username (e.g., "alice.void")
  - Last message preview ("See you at Neon District!")
  - Timestamp ("5m ago", "2h ago", "1d ago")
  - Unread badge (cyan circle with count, e.g., "2" for alice)
  - Shield icon (red, for charlie - blocked)
- ✅ Right panel: "Select a conversation to start messaging" (empty state)

### Test Conversation:
1. **Click alice's conversation**
   - ✅ Right panel loads alice's messages (4 messages)
   - ✅ Conversation header: alice.void, "Online"
   - ✅ Messages display (2 from me, 2 from alice)
   - ✅ Message bubbles: cyan (me), gray (alice)
   - ✅ Timestamps: "30m ago", "20m ago", "10m ago", "5m ago"
   - ✅ Read receipts: CheckCheck icon on my messages
   - ✅ Message composer: enabled, placeholder "Type a message..."
2. **Type a message** (e.g., "Sounds good!")
   - ✅ Character counter updates: "12/280"
   - ✅ Send button enabled
3. **Click Send**
   - ✅ Message appears with "Sending..." indicator
   - ✅ DM counter: "15/20 DMs today"
   - ✅ After 1s: "Sending..." disappears, CheckCheck appears

### Test Blocked Conversation:
1. **Click charlie's conversation**
   - ✅ Red warning banner: "Requires mutual follow or Tier ≥ Silver"
   - ✅ Message composer disabled
   - ✅ Placeholder: "Cannot send messages..."
   - ✅ Send button disabled

### Test Anti-Spam:
1. **Manually increment `dmsSentToday` to 19**
   - ✅ Cap indicator: "19/20 DMs today" (still cyan)
2. **Increment to 20**
   - ✅ Cap indicator: "20/20 DMs today" (turns AMBER)
   - ✅ Warning: "0 left" (amber AlertCircle)
   - ✅ Send button disabled
   - ✅ Input disabled
   - ✅ Footer text: "Daily cap reached. Resets at midnight UTC."

### Expected Behavior:
- Enter sends message
- Shift+Enter adds newline
- Close button (X) closes window

---

## 4️⃣ GIG DETAIL (JOB_DETAIL)

### How to Open:
**Option A - Via Code:**
```typescript
openWindow('JOB_DETAIL', { jobId: 'gig_123' });
```

**Option B - Via Agency Board (FUTURE):**
- Open AGENCY_BOARD window
- Click "View Details" on any gig card
- (TODO: Wire AgencyBoardWindow to open JOB_DETAIL)

### What to Verify:
- ✅ Header shows "GIG DETAILS"
- ✅ Title: "Terminal Hack: Corporate Vault Breach"
- ✅ Difficulty badge: "HARD" (orange color)
- ✅ Agency: "REDLINE SYNDICATE" + verified checkmark
- ✅ District: "NEON DISTRICT"
- ✅ Status: "OPEN" (green badge)

**Quick Stats Row:**
- ✅ Est. Time: "2-4 hours" (Clock icon)
- ✅ Slots: "2/4" (Users icon)
- ✅ Min XP: "500" (Zap icon)

**Mission Briefing:**
- ✅ 4 paragraphs of description
- ✅ Text: "A high-stakes corporate espionage mission..."
- ✅ Text: "Your squad will need to breach..."
- ✅ Text: "This is a timed mission..."
- ✅ Text: "Failure will result in..."

**Requirements Section:**
- ✅ Minimum Tier: "SILVER" (Star icon, gray color)
- ✅ Minimum XP: "500" (TrendingUp icon)
- ✅ Required Skills: 4 tags (Hacking, Stealth, Network Security, Team Coordination)
- ✅ Other Requirements:
  - "Must have completed 'Terminal Basics' tutorial"
  - "No active security violations"

**Rewards Section:**
- ✅ Primary Reward Card (large, gradient background):
  - SIGNAL: 850 (large number)
  - Bonus: "+15% bonus for zero alarms triggered" (green, Star icon)
- ✅ Secondary Rewards (2 cards):
  - XP Earned: +1200
  - PSX Stake Required: 50 PSX (orange)

**Squad Info (Purple Card):**
- ✅ Header: "SQUAD MISSION" (Users icon, purple)
- ✅ Squad name: "GHOST_OPS"
- ✅ Current members: "2/4"

**Footer Buttons:**
- ✅ Back button (gray, ArrowLeft icon)
- ✅ Join Squad button (purple, Users icon)
- ✅ Apply to Gig button (cyan, Briefcase icon, primary)

### Test Actions:
1. **Click "Apply to Gig"**
   - ✅ Button shows "Applying..." with spinner
   - ✅ After 1s: Alert "Application submitted!"
   - ✅ Window closes
2. **Click "Join Squad"**
   - ✅ Alert "Joined squad: GHOST_OPS"
   - ✅ Window closes
3. **Click "Back"**
   - ✅ Window closes

### Expected Behavior:
- All text sections display correctly
- All colors match tier/difficulty/status
- Scrollable content (if window is short)
- Close button (X) closes window

---

## 🎨 COLOR VERIFICATION

### Tier Colors (All Windows):
- **S-Tier:** Amber/orange gradient (`from-amber-500 to-orange-500`)
- **Gold:** Yellow/amber gradient (`from-yellow-500 to-amber-500`)
- **Silver:** Gray gradient (`from-gray-300 to-gray-400`)
- **Bronze:** Orange-brown gradient (`from-orange-700 to-orange-800`)

### Difficulty Colors (Gig Detail):
- **EASY:** Green (`text-green-400`)
- **MEDIUM:** Yellow (`text-yellow-400`)
- **HARD:** Orange (`text-orange-400`)
- **EXPERT:** Red (`text-red-400`)

### Status Colors (Gig Detail):
- **OPEN:** Green (`text-green-400`)
- **IN_PROGRESS:** Blue (`text-blue-400`)
- **FILLED:** Gray (`text-gray-400`)

### Anti-Spam Warning States:
- **Normal:** Cyan border (`border-cyan-400/30`)
- **Low (≤10/5 left):** Amber border + warning (`border-amber-500/60`)
- **Capped (0 left):** Red border + error (`border-red-500/60`)

---

## 🐛 KNOWN ISSUES / TODO

### ProfilePassportWindow
- ❌ Avatar upload not implemented (shows User icon placeholder)
- ❌ Edit Profile button not wired
- ❌ Customize Avatar button not wired
- ❌ Guild links not opening GUILDS window yet (need to wire onOpenWindow)

### GlobalChatWindow
- ❌ messagesSentToday not persisted (resets on refresh)
- ❌ Messages not stored (localStorage or backend)
- ❌ User's tier not read from useVoidScore (shows mock GOLD)
- ❌ Net Protocol integration missing

### PhoneWindow
- ❌ dmsSentToday not persisted (resets on refresh)
- ❌ Mutual follow check not implemented (always shows mock canDM)
- ❌ Messages not stored
- ❌ Conversation list not updated when new DM arrives
- ❌ Online status not live (shows mock data)

### JobDetailWindow
- ❌ Application not sent to backend (shows alert only)
- ❌ Squad joining not wired to contracts
- ❌ User's tier/XP not checked against requirements
- ❌ Gig data not read from contracts (uses mock data)

---

## ✅ SUCCESS CRITERIA

**All 4 windows are considered COMPLETE if:**

1. ✅ All UI elements display correctly
2. ✅ All mock data renders without errors
3. ✅ All buttons are clickable (even if showing alerts)
4. ✅ All anti-spam UI states are visible
5. ✅ All color coding matches tier/difficulty/status
6. ✅ Build succeeds with 0 errors
7. ✅ No `{}` placeholders visible
8. ✅ Close button works on all windows
9. ✅ TODO markers documented for all integration points

**Backend integration is Phase 3C (next sprint).**

---

## 🚀 NEXT STEPS

After verifying all windows work:

1. **Wire Bottom Icon Bar:**
   - Add PLAYER_PROFILE icon
   - Add GLOBAL_CHAT icon
   - Add PHONE icon
   - Verify all icons open correct windows

2. **Update AgencyBoardWindow:**
   - Add "View Details" button to gig cards
   - Wire button to open JOB_DETAIL window
   - Pass jobId via props

3. **Test Integration:**
   - Click Profile icon → Opens PLAYER_PROFILE
   - Click Chat icon → Opens GLOBAL_CHAT
   - Click Phone icon → Opens PHONE
   - Click gig "View Details" → Opens JOB_DETAIL
   - All windows close properly

4. **Begin Phase 3B:**
   - Implement FriendsWindow
   - Implement DAOConsoleWindow + ProposalDetailWindow
   - Implement HubSelectorWindow

