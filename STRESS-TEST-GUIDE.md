# PC Rendering Stress Test Guide

**Last Updated**: Performance Optimization Session  
**Status**: Ready for Testing

---

## Performance Monitoring Setup

### Enable PerformanceMonitor
Press **Ctrl+Shift+P** to toggle the performance overlay

**Metrics Tracked:**
- Current FPS
- Average FPS (60 frame rolling window)
- Frame Time (ms)
- Render Count
- Memory Usage (MB)
- Performance Grade (EXCELLENT / GOOD / POOR)

**Color Coding:**
- 🟢 Green: Excellent (55+ FPS)
- 🟡 Yellow: Good (40-54 FPS)
- 🔴 Red: Poor (<40 FPS)

---

## Optimization Baseline

### Components Optimized:
✅ **VoidHudApp.tsx**
   - Memoized `economySnapshot` object (prevents large object recreation)
   - Memoized `playerState` object
   - Dependencies: districts, position, friends, royalties, votingPower, level, address, currentXP, xpProgress, positions

✅ **PlayerChipV2.tsx**
   - Wrapped with `React.memo` + custom comparison
   - Only re-renders when: walletAddress, level, xpProgress, voidBalance, or theme.spineColor change

✅ **HubEconomyStrip.tsx**
   - Wrapped with `React.memo` + custom comparison
   - Converted all event handlers to `useCallback`
   - Only re-renders when: hubMode, theme.spineColor, voidPrice, voidChange24h, psxBalance, signalEpoch, or trendingDrops count change

✅ **MiniMapPanel.tsx**
   - Wrapped with `React.memo` + custom comparison
   - Converted all event handlers to `useCallback`
   - Only re-renders when: player coordinates (x, z), POI count, or theme.spineColor change

✅ **Scene3D.tsx**
   - Already optimized with `camera.far = 500` (view distance capped)
   - Fog range: 16-90 (limits rendering depth)
   - Minimal lighting (1 ambient + 1 directional)

---

## Stress Test Procedures

### Test 1: Hub Switching Stress (60 seconds)
**Objective:** Test hub mode switching performance

**Procedure:**
1. Enable PerformanceMonitor (Ctrl+Shift+P)
2. Record baseline FPS
3. Rapidly press W, C, D, G, A, I keys for 60 seconds
4. Watch for FPS drops or stuttering
5. Check memory growth

**Expected Result:**
- FPS should stay above 40 during rapid switching
- No visual stuttering
- Memory should stabilize (no continuous growth)

**Success Criteria:** Average FPS > 40, no memory leaks

---

### Test 2: Window Spam Stress
**Objective:** Test window system performance

**Procedure:**
1. Enable PerformanceMonitor
2. Record baseline FPS
3. Rapidly click hub chips to open economy strip
4. Click different sections (VOID price, PSX, CREATE, SIGNAL)
5. Open and close windows as fast as possible for 30 seconds
6. Monitor FPS and memory

**Expected Result:**
- FPS should stay above 40
- Windows should open/close smoothly
- No memory accumulation

**Success Criteria:** Smooth window transitions, average FPS > 40

---

### Test 3: Wallet Connection Stress
**Objective:** Test Privy integration stability

**Procedure:**
1. Enable PerformanceMonitor
2. Disconnect wallet (if connected)
3. Click "Connect Wallet" button
4. Complete connection
5. Disconnect
6. Repeat 5 times rapidly
7. Monitor FPS during auth flows

**Expected Result:**
- No FPS drops during connection
- Smooth UI updates
- No memory leaks

**Success Criteria:** FPS stays above 50 during wallet operations

---

### Test 4: Navigation + Multi-Action Stress
**Objective:** Test concurrent operations

**Procedure:**
1. Enable PerformanceMonitor
2. Move around 3D world (WASD)
3. While moving, switch hubs (W/C/D/G keys)
4. While hub switching, click map elements
5. Perform for 60 seconds
6. Monitor FPS continuously

**Expected Result:**
- FPS should stay above 35 during heavy load
- No stuttering in 3D movement
- Hub switches remain smooth

**Success Criteria:** Average FPS > 35, no major frame drops

---

### Test 5: Memory Leak Test (5+ minutes)
**Objective:** Verify no memory accumulation over time

**Procedure:**
1. Enable PerformanceMonitor
2. Record initial memory usage (MB)
3. Perform normal gameplay for 5 minutes:
   - Move around
   - Switch hubs occasionally
   - Open/close windows
   - Interact with UI elements
4. Record final memory usage
5. Calculate growth

**Expected Result:**
- Memory growth < 50MB over 5 minutes
- FPS remains stable throughout

**Success Criteria:** Memory stable, no continuous growth trend

---

### Test 6: Concurrent Actions Stress
**Objective:** Maximum simultaneous operations

**Procedure:**
1. Enable PerformanceMonitor
2. Open multiple windows
3. Switch hubs
4. Move player character
5. Connect/disconnect wallet
6. All actions within 10 second window
7. Monitor FPS and memory spikes

**Expected Result:**
- FPS should drop but recover quickly
- No crashes or freezes
- Smooth recovery to baseline

**Success Criteria:** FPS recovers to > 40 within 3 seconds

---

## Benchmark Targets

### PC Desktop (Expected Performance)
- **Idle FPS:** 60
- **Light Activity:** 55-60 FPS
- **Heavy Activity:** 40-55 FPS
- **Stress Test:** > 35 FPS minimum
- **Memory Usage:** < 200MB total
- **Frame Time:** < 20ms average

### Known Bottlenecks (Pre-Optimization)
- Large object recreations on every render (economySnapshot, playerState)
- Inline functions causing child re-renders
- No memoization on frequently updating components

### Optimizations Applied
- ✅ React.memo on 4 major components
- ✅ useMemo for expensive computations
- ✅ useCallback for event handlers
- ✅ Custom comparison functions to prevent unnecessary re-renders
- ✅ Real-time performance monitoring

---

## Reporting Results

### Format:
```
Test: [Test Name]
Duration: [Time]
Baseline FPS: [Number]
Minimum FPS: [Number]
Average FPS: [Number]
Memory Start: [MB]
Memory End: [MB]
Issues: [Description or "None"]
Grade: PASS / FAIL
```

### Example:
```
Test: Hub Switching Stress
Duration: 60 seconds
Baseline FPS: 60
Minimum FPS: 42
Average FPS: 54
Memory Start: 145MB
Memory End: 152MB
Issues: None
Grade: PASS
```

---

## Next Steps After Testing

### If Performance Issues Found:
1. Identify bottleneck component with PerformanceMonitor
2. Add memoization to problem areas
3. Consider lazy loading heavy components (React.lazy)
4. Audit HUDContext for state bloat
5. Implement virtualization for large lists
6. Check 3D scene complexity (mesh count, draw calls)

### If Performance Good:
1. Document baseline metrics
2. Set up performance regression testing
3. Consider additional visual effects
4. Optimize for lower-end hardware

---

## Tools Used

**Performance Monitoring:**
- Custom PerformanceMonitor component (Ctrl+Shift+P)
- Browser DevTools Performance tab
- React DevTools Profiler

**Optimization Techniques:**
- React.memo for component memoization
- useMemo for expensive computations
- useCallback for stable function references
- Custom equality checks for props comparison

**3D Optimization:**
- Camera far plane limiting (500 units)
- Fog for depth culling (16-90 range)
- Minimal lighting setup
- Frustum culling (automatic with Three.js)

---

## Testing Checklist

- [ ] Baseline FPS recorded
- [ ] Test 1: Hub Switching (60s) - PASS/FAIL
- [ ] Test 2: Window Spam (30s) - PASS/FAIL
- [ ] Test 3: Wallet Connection (5x) - PASS/FAIL
- [ ] Test 4: Navigation + Multi-Action (60s) - PASS/FAIL
- [ ] Test 5: Memory Leak (5min) - PASS/FAIL
- [ ] Test 6: Concurrent Actions (10s) - PASS/FAIL
- [ ] Results documented
- [ ] Issues logged (if any)
- [ ] Performance grade assigned

**Overall Grade:** ___________

**Date Tested:** ___________

**Tester:** ___________

---

**Ready to test! Press Ctrl+Shift+P to enable monitoring and run stress tests.**
