/**
 * VOID E2E SMOKE TEST SUITE
 * Purpose: Validate demo readiness before live presentation
 * Coverage: HUD load, all windows, demo data, no runtime errors
 * Run: npm run test:e2e
 */

import { test, expect, Page } from '@playwright/test';

// ================================
// TEST CONFIGURATION
// ================================

const TEST_TIMEOUT = 30000; // 30 seconds per test

// Demo mode environment variables (should be set in .env.local)
const DEMO_ENV = {
  NEXT_PUBLIC_DEMO_MODE: 'true',
  NEXT_PUBLIC_USE_MOCK_DATA: 'true',
  NEXT_PUBLIC_ENABLE_NET_PROTOCOL: 'false',
};

// ================================
// HELPER FUNCTIONS
// ================================

async function waitForHUDLoad(page: Page) {
  // Wait for main HUD container to appear
  await page.waitForSelector('[data-testid="hud-container"]', { timeout: 10000 });
  
  // Wait for top economy strip
  await page.waitForSelector('text=/VOID.*\\$/', { timeout: 5000 });
  
  // Wait for bottom dock
  await page.waitForSelector('[data-testid="bottom-dock"]', { timeout: 5000 });
}

async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  return errors;
}

// ================================
// TEST SUITE
// ================================

test.describe('VOID HUD Smoke Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any previous state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  // ================================
  // TEST 1: HUD LOADS WITHOUT ERRORS
  // ================================
  
  test('HUD loads successfully', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    await page.goto('/');
    
    // Wait for HUD to fully load
    await waitForHUDLoad(page);
    
    // Check for critical elements
    const topHUD = await page.locator('[data-testid="top-hud"]');
    await expect(topHUD).toBeVisible();
    
    const bottomDock = await page.locator('[data-testid="bottom-dock"]');
    await expect(bottomDock).toBeVisible();
    
    // Verify no critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('[debug]') && 
      !e.includes('[info]')
    );
    expect(criticalErrors.length).toBe(0);
  });

  // ================================
  // TEST 2: DEMO MODE DATA VISIBLE
  // ================================
  
  test('Demo mode displays correct data', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Check for "(Demo)" label in economy strip
    const demoLabel = await page.locator('text=/(Demo)/');
    await expect(demoLabel).toBeVisible();
    
    // Check for VOID price (demo value)
    const voidPrice = await page.locator('text=/VOID.*0\\.0024/');
    await expect(voidPrice).toBeVisible();
    
    // Check for PSX price (demo value)
    const psxPrice = await page.locator('text=/PSX.*0\\.0018/');
    await expect(psxPrice).toBeVisible();
  });

  // ================================
  // TEST 3: PASSPORT WINDOW
  // ================================
  
  test('Passport window opens and displays demo data', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Click Passport icon in bottom dock
    const passportIcon = await page.locator('[data-window="PASSPORT"]');
    await passportIcon.click();
    
    // Wait for window to open
    await page.waitForSelector('[data-window-type="PASSPORT"]', { timeout: 5000 });
    
    // Check for GOLD tier (demo data)
    const goldTier = await page.locator('text=/GOLD/i');
    await expect(goldTier).toBeVisible();
    
    // Check for 720 XP (demo data)
    const xpValue = await page.locator('text=/720.*XP/i');
    await expect(xpValue).toBeVisible();
  });

  // ================================
  // TEST 4: WALLET TAB
  // ================================
  
  test('Wallet tab opens from header', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Click Wallet button in top header
    const walletButton = await page.locator('text=/WALLET/i').first();
    await walletButton.click();
    
    // Wait for MULTI_TAB window to open
    await page.waitForSelector('[data-window-type="MULTI_TAB"]', { timeout: 5000 });
    
    // Check for balance display
    const balance = await page.locator('text=/VOID.*Balance/i');
    await expect(balance).toBeVisible();
  });

  // ================================
  // TEST 5: GLOBAL CHAT WINDOW
  // ================================
  
  test('Global Chat window opens and displays messages', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Click Global Chat icon
    const chatIcon = await page.locator('[data-window="GLOBAL_CHAT"]');
    await chatIcon.click();
    
    // Wait for window to open
    await page.waitForSelector('[data-window-type="GLOBAL_CHAT"]', { timeout: 5000 });
    
    // Check for demo messages (8 expected)
    const messageList = await page.locator('[data-testid="chat-messages"]');
    const messages = await messageList.locator('[data-message]').count();
    
    expect(messages).toBeGreaterThan(0);
    expect(messages).toBeLessThanOrEqual(100); // Global cap
  });

  // ================================
  // TEST 6: DM WINDOW
  // ================================
  
  test('Phone/DM window opens', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Click Phone icon
    const phoneIcon = await page.locator('[data-window="PHONE"]');
    await phoneIcon.click();
    
    // Wait for window to open
    await page.waitForSelector('[data-window-type="PHONE"]', { timeout: 5000 });
    
    // Check for conversation list or empty state
    const windowContent = await page.locator('[data-window-type="PHONE"]');
    await expect(windowContent).toBeVisible();
  });

  // ================================
  // TEST 7: GUILDS WINDOW
  // ================================
  
  test('Guilds window opens and displays demo guild', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Click Guilds icon
    const guildsIcon = await page.locator('[data-window="GUILDS"]');
    await guildsIcon.click();
    
    // Wait for window to open
    await page.waitForSelector('[data-window-type="GUILDS"]', { timeout: 5000 });
    
    // Check for demo guild "VOID Builders"
    const demoGuild = await page.locator('text=/VOID.*Builders/i');
    await expect(demoGuild).toBeVisible();
  });

  // ================================
  // TEST 8: AGENCY BOARD WINDOW
  // ================================
  
  test('Agency Board window opens and displays gigs', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Click Agency icon
    const agencyIcon = await page.locator('[data-window="AGENCY_BOARD"]');
    await agencyIcon.click();
    
    // Wait for window to open
    await page.waitForSelector('[data-window-type="AGENCY_BOARD"]', { timeout: 5000 });
    
    // Check for gigs (6 expected in demo)
    const gigs = await page.locator('[data-gig]').count();
    expect(gigs).toBeGreaterThan(0);
    expect(gigs).toBeLessThanOrEqual(50); // Reasonable cap
  });

  // ================================
  // TEST 9: LEADERBOARDS WINDOW
  // ================================
  
  test('Leaderboards window opens and displays demo rank', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Click Leaderboards icon
    const leaderboardsIcon = await page.locator('[data-window="LEADERBOARDS"]');
    await leaderboardsIcon.click();
    
    // Wait for window to open
    await page.waitForSelector('[data-window-type="LEADERBOARDS"]', { timeout: 5000 });
    
    // Check for rank display (demo rank: #7)
    const rankDisplay = await page.locator('text=/Your Rank.*#7/i');
    await expect(rankDisplay).toBeVisible();
    
    // Check for top 10 entries
    const entries = await page.locator('[data-leaderboard-entry]').count();
    expect(entries).toBeGreaterThanOrEqual(1);
    expect(entries).toBeLessThanOrEqual(10); // LEADERBOARD_CAP
  });

  // ================================
  // TEST 10: WORLD MAP WINDOW
  // ================================
  
  test('World Map window opens', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Click World Map icon
    const mapIcon = await page.locator('[data-window="WORLD_MAP"]');
    await mapIcon.click();
    
    // Wait for window to open
    await page.waitForSelector('[data-window-type="WORLD_MAP"]', { timeout: 5000 });
    
    // Check for map container
    const mapContainer = await page.locator('[data-map-container]');
    await expect(mapContainer).toBeVisible();
  });

  // ================================
  // TEST 11: BOTTOM DOCK ICONS
  // ================================
  
  test('Bottom dock shows 13 icons in demo mode', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Count visible icons (should be 13 in demo mode)
    const visibleIcons = await page.locator('[data-testid="bottom-dock"] [data-window]').count();
    
    // In demo mode, 4 icons should be hidden (Friends, Voice, Music, Games)
    // So we expect 13 icons (17 total - 4 hidden)
    expect(visibleIcons).toBe(13);
  });

  // ================================
  // TEST 12: NO BLANK WINDOWS
  // ================================
  
  test('All windows have content (not blank)', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    const windowIcons = [
      'PASSPORT',
      'GLOBAL_CHAT',
      'PHONE',
      'GUILDS',
      'AGENCY_BOARD',
      'LEADERBOARDS',
      'WORLD_MAP'
    ];
    
    for (const windowType of windowIcons) {
      // Click icon
      const icon = await page.locator(`[data-window="${windowType}"]`);
      await icon.click();
      
      // Wait for window to open
      await page.waitForSelector(`[data-window-type="${windowType}"]`, { timeout: 5000 });
      
      // Check window has content (not empty)
      const windowContent = await page.locator(`[data-window-type="${windowType}"]`);
      const textContent = await windowContent.textContent();
      
      expect(textContent).not.toBe('');
      expect(textContent?.length).toBeGreaterThan(10); // At least some content
      
      // Close window
      const closeButton = await windowContent.locator('[data-close-window]');
      if (await closeButton.count() > 0) {
        await closeButton.click();
      }
    }
  });

  // ================================
  // TEST 13: NO RUNTIME ERRORS
  // ================================
  
  test('No runtime errors during 30 second session', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Open a few windows
    await page.locator('[data-window="PASSPORT"]').click();
    await page.waitForTimeout(2000);
    
    await page.locator('[data-window="GLOBAL_CHAT"]').click();
    await page.waitForTimeout(2000);
    
    await page.locator('[data-window="GUILDS"]').click();
    await page.waitForTimeout(2000);
    
    // Wait for full 30 seconds
    await page.waitForTimeout(24000);
    
    // Filter out debug logs
    const criticalErrors = errors.filter(e => 
      !e.includes('[debug]') &&
      !e.includes('[info]') &&
      !e.includes('[NetClient]') && // Expected in mock mode
      !e.includes('[useScoreEvents]') // Expected in mock mode
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  // ================================
  // TEST 14: QUERY CAPS ENFORCED
  // ================================
  
  test('Query caps prevent performance issues', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Open Global Chat
    await page.locator('[data-window="GLOBAL_CHAT"]').click();
    await page.waitForSelector('[data-window-type="GLOBAL_CHAT"]', { timeout: 5000 });
    
    // Count messages (should not exceed 100)
    const messageCount = await page.locator('[data-message]').count();
    expect(messageCount).toBeLessThanOrEqual(100);
    
    // Open Leaderboards
    await page.locator('[data-window="LEADERBOARDS"]').click();
    await page.waitForSelector('[data-window-type="LEADERBOARDS"]', { timeout: 5000 });
    
    // Count leaderboard entries (should not exceed 10)
    const entryCount = await page.locator('[data-leaderboard-entry]').count();
    expect(entryCount).toBeLessThanOrEqual(10);
  });

});

// ================================
// VISUAL REGRESSION TESTS (OPTIONAL)
// ================================

test.describe('Visual Regression', () => {
  
  test('HUD screenshots match baseline', async ({ page }) => {
    await page.goto('/');
    await waitForHUDLoad(page);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('hud-full.png', {
      fullPage: true,
      maxDiffPixels: 100 // Allow minor rendering differences
    });
    
    // Open Passport window
    await page.locator('[data-window="PASSPORT"]').click();
    await page.waitForSelector('[data-window-type="PASSPORT"]', { timeout: 5000 });
    
    // Screenshot Passport window
    const passportWindow = await page.locator('[data-window-type="PASSPORT"]');
    await expect(passportWindow).toHaveScreenshot('passport-window.png', {
      maxDiffPixels: 50
    });
  });
  
});
