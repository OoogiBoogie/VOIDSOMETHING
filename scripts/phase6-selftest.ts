// scripts/phase6-selftest.ts
/**
 * Phase 6 Self-Test Script
 * 
 * Validates Phase 6 wiring without browser or manual testing:
 * - XP engine awards points for exploration/sessions/interactions
 * - Achievement engine unlocks based on thresholds
 * - Airdrop engine calculates scores with multipliers
 * - Event bus → engine → player state chain works
 * 
 * Run: npm run phase6:selftest
 */

import { worldEventBus } from '../world/events/eventBus';
import { WorldEventType } from '../world/events/eventTypes';
import { xpEngine } from '../world/xp';
import { achievementEngine } from '../world/achievements';
import { airdropEngine } from '../world/airdrop';
import { eventStateBridge } from '../world/eventStateBridge';
import { usePlayerState } from '../state/player/usePlayerState';

// Helper to wait for async processing
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPhase6SelfTest() {
  const testWallet = '0xTESTPHASE6000000000000000000000000000000' as `0x${string}`;
  const isMainnet = false;
  const hasProfile = false;
  const isBeta = true;

  console.log('🧪 Phase 6 Self-Test Starting...\n');
  console.log('Test Wallet:', testWallet);
  console.log('Configuration:', { isMainnet, hasProfile, isBeta });
  console.log('─'.repeat(60));

  // Start engines
  console.log('\n📡 Starting Phase 6 engines...');
  eventStateBridge.start(); // Start event → state bridge first
  xpEngine.start(testWallet);
  achievementEngine.start(testWallet, isMainnet);
  airdropEngine.start(testWallet, hasProfile, isBeta);
  await delay(100);

  // Get initial state
  const initialState = usePlayerState.getState();
  console.log('\n📊 Initial State:');
  console.log('  XP:', initialState.stats?.totalXP || 0);
  console.log('  Level:', initialState.stats?.level || 1);
  console.log('  Achievements:', initialState.achievements?.size || 0);
  console.log('  Parcels Visited:', initialState.stats?.totalParcelsVisited || 0);
  console.log('  Districts Visited:', initialState.stats?.totalDistrictsVisited || 0);

  // Simulate session started
  console.log('\n🎮 Simulating SESSION_STARTED event...');
  worldEventBus.emit({
    type: WorldEventType.SESSION_STARTED,
    timestamp: Date.now(),
    walletAddress: testWallet,
    sessionId: 'test-session-001',
    device: 'desktop' as const,
    userAgent: 'Phase6-SelfTest/1.0',
  });
  await delay(100);

  // Simulate district entry (first visit)
  console.log('\n🗺️  Simulating DISTRICT_ENTERED event (first visit)...');
  worldEventBus.emit({
    type: WorldEventType.DISTRICT_ENTERED,
    timestamp: Date.now(),
    walletAddress: testWallet,
    sessionId: 'test-session-001',
    districtId: 'test-district-alpha',
    districtName: 'TEST DISTRICT ALPHA',
    parcelId: '1000',
    worldPosition: { x: 100, y: 0, z: 100 },
    isFirstVisit: true,
  });
  await delay(100);

  // Simulate multiple parcel entries (should unlock PIONEER_I at 10 parcels)
  console.log('\n🏞️  Simulating 12 unique PARCEL_ENTERED events...');
  for (let i = 0; i < 12; i++) {
    worldEventBus.emit({
      type: WorldEventType.PARCEL_ENTERED,
      timestamp: Date.now(),
      walletAddress: testWallet,
      sessionId: 'test-session-001',
      parcelId: `${1000 + i}`,
      parcelCoords: { x: i, z: 0 },
      districtId: 'test-district-alpha',
      worldPosition: { x: i * 10, y: 0, z: 0 },
      isFirstVisit: true,
    });
    await delay(50);
  }
  await delay(100);

  // Simulate creator terminal interaction
  console.log('\n💻 Simulating INTERACTION_COMPLETED event (creator terminal)...');
  worldEventBus.emit({
    type: WorldEventType.INTERACTION_COMPLETED,
    timestamp: Date.now(),
    walletAddress: testWallet,
    sessionId: 'test-session-001',
    playerId: testWallet,
    interactionType: 'CREATOR_TERMINAL',
    interactableId: 'terminal-001',
  });
  await delay(100);

  // Simulate session heartbeat (for session time tracking)
  console.log('\n⏱️  Simulating SESSION_HEARTBEAT event (10 minutes active)...');
  worldEventBus.emit({
    type: WorldEventType.SESSION_HEARTBEAT,
    timestamp: Date.now(),
    walletAddress: testWallet,
    sessionId: 'test-session-001',
    currentParcelId: '1000',
    currentDistrictId: 'test-district-alpha',
    totalTimeActive: 10 * 60 * 1000, // 10 minutes in milliseconds
  });
  await delay(200);

  // Force airdrop score recalculation (after all events)
  console.log('\n🎁 Forcing airdrop score recalculation...');
  airdropEngine.forceUpdate(testWallet, hasProfile, isBeta);
  await delay(100);

  // Get final state
  const finalState = usePlayerState.getState();
  console.log('\n📊 Final State:');
  console.log('  XP:', finalState.stats?.totalXP || 0);
  console.log('  Level:', finalState.stats?.level || 1);
  console.log('  Achievements:', finalState.achievements?.size || 0);
  console.log('  Parcels Visited:', finalState.stats?.totalParcelsVisited || 0);
  console.log('  Districts Visited:', finalState.stats?.totalDistrictsVisited || 0);

  // Get airdrop score
  const airdropScore = airdropEngine.getCurrentScore();
  console.log('\n🎁 Airdrop Score:');
  console.log('  Total Score:', airdropScore?.totalScore || 0);
  if (airdropScore?.breakdown) {
    console.log('  XP Points:', airdropScore.breakdown.xpPoints);
    console.log('  Achievement Points:', airdropScore.breakdown.achievementPoints);
    console.log('  Exploration Points:', airdropScore.breakdown.explorationPoints);
    console.log('  Session Points:', airdropScore.breakdown.sessionPoints);
    console.log('  Creator Points:', airdropScore.breakdown.creatorTerminalPoints);
  }

  console.log('\n─'.repeat(60));
  console.log('\n🔍 Validation Checks:\n');

  // Validation assertions
  const errors: string[] = [];

  // Check XP increased
  const xpGained = (finalState.stats?.totalXP || 0) - (initialState.stats?.totalXP || 0);
  if (xpGained <= 0) {
    errors.push('❌ XP did not increase (expected XP from parcels + district + session + creator terminal)');
  } else {
    console.log(`✅ XP increased by ${xpGained} (engine wiring works)`);
  }

  // Check parcels visited
  const parcelsVisited = finalState.stats?.totalParcelsVisited || 0;
  if (parcelsVisited < 10) {
    errors.push(`❌ Parcels visited count is ${parcelsVisited} (expected 12)`);
  } else {
    console.log(`✅ Parcels visited: ${parcelsVisited} (event → state bridge works)`);
  }

  // Check districts visited
  const districtsVisited = finalState.stats?.totalDistrictsVisited || 0;
  if (districtsVisited === 0) {
    errors.push('❌ Districts visited not updated (expected 1)');
  } else {
    console.log(`✅ Districts visited: ${districtsVisited} (district tracking works)`);
  }

  // Check achievements unlocked (should have PIONEER_I at 10 parcels)
  const achievementsCount = finalState.achievements?.size || 0;
  if (achievementsCount === 0) {
    errors.push('❌ No achievements unlocked (expected PIONEER_I at 10 parcels)');
  } else {
    console.log(`✅ Achievements unlocked: ${achievementsCount} (achievement engine works)`);
    console.log(`   Achievements: ${Array.from(finalState.achievements || []).join(', ')}`);
  }

  // Check airdrop score
  if (!airdropScore || airdropScore.totalScore === 0) {
    errors.push('❌ Airdrop score is 0 (airdrop engine may not be calculating)');
  } else {
    console.log(`✅ Airdrop score calculated: ${airdropScore.totalScore} (airdrop engine works)`);
  }

  // Stop engines
  console.log('\n🛑 Stopping engines...');
  eventStateBridge.stop();
  xpEngine.stop();
  achievementEngine.stop();
  airdropEngine.stop();

  // Final verdict
  console.log('\n' + '═'.repeat(60));
  if (errors.length === 0) {
    console.log('\n✅ ✅ ✅  PHASE 6 SELF-TEST PASSED  ✅ ✅ ✅\n');
    console.log('All systems operational:');
    console.log('  • XP engine awarding points correctly');
    console.log('  • Achievement engine unlocking on thresholds');
    console.log('  • Airdrop engine calculating scores');
    console.log('  • Event bus → engine → player state chain working');
    console.log('\n🚀 Phase 6 is ready for in-app testing!\n');
    console.log('═'.repeat(60));
    process.exit(0);
  } else {
    console.log('\n❌ ❌ ❌  PHASE 6 SELF-TEST FAILED  ❌ ❌ ❌\n');
    console.log('Errors detected:\n');
    errors.forEach((error) => console.log('  ' + error));
    console.log('\n🔧 Fix these issues before deploying Phase 6.\n');
    console.log('═'.repeat(60));
    process.exit(1);
  }
}

// Run the test
runPhase6SelfTest().catch((err) => {
  console.error('\n💥 Phase 6 self-test crashed:\n', err);
  process.exit(1);
});
