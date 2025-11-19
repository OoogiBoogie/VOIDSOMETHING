# PHASE 6 — QUICK START INTEGRATION

**TL;DR**: Add 3 lines to your main component to enable all Phase 6 features.

---

## MINIMAL INTEGRATION (Copy-Paste Ready)

### 1. In `VoidGameShell.tsx` or `app/page.tsx`:

```typescript
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { xpEngine } from '@/world/xp';
import { achievementEngine } from '@/world/achievements';
import { airdropEngine } from '@/world/airdrop';
import { creatorTerminalHandler } from '@/world/creator';
import { profileAdapter } from '@/world/social';

export function VoidGameShell() {
  const { address } = useAccount();
  const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ENV === 'mainnet';

  useEffect(() => {
    if (!address) return;

    // Phase 6 Setup (3 lines!)
    xpEngine.start(address);
    achievementEngine.start(address, isMainnet);
    airdropEngine.start(address, false, false); // TODO: Check hasProfile, isBeta

    // Optional: Creator Terminal tracking
    creatorTerminalHandler.start(address);

    return () => {
      xpEngine.stop();
      achievementEngine.stop();
      airdropEngine.stop();
      creatorTerminalHandler.stop();
    };
  }, [address, isMainnet]);

  // ... rest of your component
}
```

---

## 2. Display Player Stats (HUD Component)

```typescript
import { useXPHUD, useAchievementHUD, useAirdropHUD } from '@/hud/surfaces';

export function PlayerStatsHUD() {
  const xp = useXPHUD();
  const achievements = useAchievementHUD();
  const airdrop = useAirdropHUD();

  return (
    <div className="player-stats">
      {/* XP & Level */}
      <div>
        Level {xp.currentLevel} • {xp.display.xp} XP
        <progress value={xp.progressToNextLevel} max={1} />
      </div>

      {/* Achievements */}
      <div>
        🏆 {achievements.display.count} Achievements
        {achievements.newCount > 0 && <span className="badge">{achievements.newCount} new!</span>}
      </div>

      {/* Airdrop Score */}
      <div>
        💰 Airdrop Score: {airdrop.display.score}
      </div>
    </div>
  );
}
```

---

## 3. Show Toast Notifications

```typescript
import { useXPHUD, useAchievementHUD } from '@/hud/surfaces';

export function NotificationToasts() {
  const { notifications: xpNotifs } = useXPHUD();
  const { notifications: achievementNotifs } = useAchievementHUD();

  return (
    <div className="toasts">
      {/* XP Notifications */}
      {xpNotifs.map(notif => (
        <div key={notif.id} className="toast xp-toast">
          +{notif.amount} XP • {notif.source}
        </div>
      ))}

      {/* Achievement Notifications */}
      {achievementNotifs.map(notif => (
        <div key={notif.id} className="toast achievement-toast">
          🏆 {notif.title}
          <span>+{notif.xpBonus} XP</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Environment Variables (`.env.local`)

```bash
# Already have these from Phase 5
NEXT_PUBLIC_CHAIN_ENV=sepolia  # or mainnet
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# No new env vars needed for Phase 6!
```

---

## 5. Database Migration

```bash
# Run the Phase 6 migration
psql -U postgres -d void_db -f db/migrations/002_phase_6_schema.sql

# Refresh materialized view (optional, auto-updates)
psql -U postgres -d void_db -c "SELECT refresh_player_activity_summary();"
```

---

## THAT'S IT!

Phase 6 is now active. Test by:
1. Connect wallet
2. Walk to new parcels → see XP toasts
3. Visit 10 parcels → unlock PIONEER_I achievement
4. Check airdrop score in HUD

---

## ADVANCED: Profile Integration (Mainnet Only)

```typescript
import { profileAdapter } from '@/world/social';

// After wallet connect
if (isMainnet) {
  const profile = await profileAdapter.resolveProfile(address);
  if (profile) {
    console.log('Profile:', profile.displayName);
    
    // Restart airdrop with profile multiplier
    airdropEngine.stop();
    airdropEngine.start(address, true, false); // hasProfile=true
  }
}
```

---

## FILES YOU NEED TO TOUCH

**Required Changes**:
1. `VoidGameShell.tsx` or main app component (add useEffect hook)
2. Create HUD component using `useXPHUD()`, `useAchievementHUD()`, `useAirdropHUD()`

**Optional**:
3. Add toast notifications for XP/achievements
4. Add profile adapter for mainnet

**No changes needed**:
- Event system (already wired)
- Player state (already has XP/achievement fields)
- Analytics (Phase 6 events auto-batch to `/api/world-events`)

---

**Full docs**: See `PHASE-6-IMPLEMENTATION-COMPLETE.md`
