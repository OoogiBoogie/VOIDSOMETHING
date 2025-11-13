# VOID DEV OPERATIONS GUIDE

**Version:** 1.0  
**Date:** Week 4, Phase 4.5  
**Audience:** DevOps, founders, technical stakeholders  
**Purpose:** Comprehensive deployment, monitoring, and troubleshooting guide

---

## TABLE OF CONTENTS

1. [Environment Setup](#1-environment-setup)
2. [Build & Deployment](#2-build--deployment)
3. [Server Management](#3-server-management)
4. [Monitoring & Logging](#4-monitoring--logging)
5. [Troubleshooting](#5-troubleshooting)
6. [Pre-Demo Checklist](#6-pre-demo-checklist)
7. [Emergency Procedures](#7-emergency-procedures)
8. [Performance Optimization](#8-performance-optimization)

---

## 1. ENVIRONMENT SETUP

### 1.1 Environment Variables Reference

**Location:** `.env.local` (root directory)

#### Core Configuration
```env
# REQUIRED: Next.js public URL
NEXT_PUBLIC_APP_URL=https://void.psx.gg

# REQUIRED: Feature flags
NEXT_PUBLIC_DEMO_MODE=true              # Enable demo mode with mock data
NEXT_PUBLIC_USE_MOCK_DATA=true          # Use hooks/useDemoData.ts
NEXT_PUBLIC_ENABLE_NET_PROTOCOL=false   # Enable Net Protocol SDK (Phase 5)
NEXT_PUBLIC_ENABLE_VOIDSCORE=false      # Enable VoidScore leaderboards (Phase 5)

# REQUIRED: Blockchain configuration
NEXT_PUBLIC_CHAIN_ID=84532                        # Base Sepolia testnet
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.basescan.org

# REQUIRED: Contract addresses (Phase 3 deployed)
NEXT_PUBLIC_LAND_CONTRACT=0x...                   # VOID Land NFT
NEXT_PUBLIC_COSMETICS_CONTRACT=0x...              # Cosmetics Manager
NEXT_PUBLIC_VOIDSCORE_CONTRACT=                   # Not yet deployed (Phase 5)

# REQUIRED: Abstract Global Wallet
NEXT_PUBLIC_ABSTRACT_CLIENT_ID=your-client-id
NEXT_PUBLIC_ABSTRACT_PROJECT_ID=your-project-id
```

#### Optional: API Keys (Phase 5+)
```env
# Price oracles (CoinGecko, CoinMarketCap)
NEXT_PUBLIC_COINGECKO_API_KEY=          # For live price feeds
NEXT_PUBLIC_CMC_API_KEY=                # Alternative oracle

# Net Protocol
NET_PROTOCOL_API_KEY=                   # Server-side SDK
NET_PROTOCOL_NETWORK_ID=                # Network identifier

# Analytics & Monitoring
NEXT_PUBLIC_MIXPANEL_TOKEN=             # User analytics
SENTRY_DSN=                             # Error tracking
LOGROCKET_APP_ID=                       # Session replay

# Subgraph endpoints
NEXT_PUBLIC_SUBGRAPH_URL=               # The Graph indexer
```

#### Development vs Production
```env
# DEMO MODE (Week 4)
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_NET_PROTOCOL=false
NEXT_PUBLIC_ENABLE_VOIDSCORE=false

# PRODUCTION (Week 5+)
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_NET_PROTOCOL=true
NEXT_PUBLIC_ENABLE_VOIDSCORE=true
```

### 1.2 Quick Setup Script

**Linux/Mac:**
```bash
#!/bin/bash
# setup-env.sh

# Copy template
cp .env.example .env.local

# Prompt for required values
echo "Enter your Abstract Client ID:"
read ABSTRACT_CLIENT_ID

echo "Enter your Abstract Project ID:"
read ABSTRACT_PROJECT_ID

# Write to .env.local
cat > .env.local << EOF
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_NET_PROTOCOL=false
NEXT_PUBLIC_ENABLE_VOIDSCORE=false
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ABSTRACT_CLIENT_ID=$ABSTRACT_CLIENT_ID
NEXT_PUBLIC_ABSTRACT_PROJECT_ID=$ABSTRACT_PROJECT_ID
EOF

echo "✅ .env.local created with demo mode enabled"
```

**Windows PowerShell:**
```powershell
# setup-env.ps1

Copy-Item .env.example .env.local

$ClientID = Read-Host "Enter your Abstract Client ID"
$ProjectID = Read-Host "Enter your Abstract Project ID"

@"
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_NET_PROTOCOL=false
NEXT_PUBLIC_ENABLE_VOIDSCORE=false
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ABSTRACT_CLIENT_ID=$ClientID
NEXT_PUBLIC_ABSTRACT_PROJECT_ID=$ProjectID
"@ | Set-Content .env.local

Write-Host "✅ .env.local created with demo mode enabled"
```

### 1.3 Environment Validation

**Automated checker script:**
```bash
npm run validate:env

# Checks:
# ✅ All required env vars present
# ✅ URLs are valid
# ✅ Contract addresses are checksummed
# ✅ Feature flags are boolean
# ✅ Chain ID matches network
```

---

## 2. BUILD & DEPLOYMENT

### 2.1 Local Development Server

```bash
# Install dependencies
npm install

# Run dev server (auto-reload enabled)
npm run dev

# Server will start on http://localhost:3000
# HUD should load within 5 seconds
```

**Expected output:**
```
▲ Next.js 15.1.6
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000

✓ Starting...
✓ Ready in 3.2s
```

**Common issues:**

- **Port 3000 already in use:**
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

- **Out of memory:**
  ```bash
  # Increase Node heap size
  export NODE_OPTIONS="--max-old-space-size=4096"
  npm run dev
  ```

### 2.2 Production Build

```bash
# Build optimized production bundle
npm run build

# Expected output:
# ✓ Creating an optimized production build
# ✓ Compiled successfully in 45.2s
# ✓ Collecting page data
# ✓ Generating static pages (15/15)
# ✓ Finalizing page optimization
```

**Build artifacts:**
- `.next/static/` - Static assets (images, fonts, JS bundles)
- `.next/server/` - Server-side rendered pages
- `.next/cache/` - Build cache (safe to delete)

**Build time benchmarks:**
- Cold build: ~60 seconds
- Warm build: ~20 seconds
- Incremental rebuild: ~5 seconds

### 2.3 Deployment Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Environment variables are set via Vercel dashboard
# Settings → Environment Variables
```

**Build command:** `npm run build`  
**Output directory:** `.next`  
**Install command:** `npm install`

**Vercel configuration (.vercel/project.json):**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

#### Custom Server (Node.js)

```bash
# Build production bundle
npm run build

# Start production server
npm run start

# Server runs on PORT=3000 (default)
# Set PORT env var to change: PORT=8080 npm start
```

**PM2 process manager:**
```bash
# Install PM2
npm i -g pm2

# Start with PM2
pm2 start npm --name "void-hud" -- start

# View logs
pm2 logs void-hud

# Restart
pm2 restart void-hud

# Auto-restart on file changes
pm2 restart void-hud --watch
```

#### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Docker commands:**
```bash
# Build image
docker build -t void-hud:latest .

# Run container
docker run -p 3000:3000 void-hud:latest

# With environment variables
docker run -p 3000:3000 --env-file .env.local void-hud:latest
```

### 2.4 Static Export (Optional)

**For CDN deployment (Cloudflare, AWS S3):**

```bash
# Add to package.json
"scripts": {
  "export": "next build && next export"
}

# Run export
npm run export

# Output: /out directory (static HTML/CSS/JS)
```

**Note:** Dynamic API routes won't work in static export. Use serverless functions or separate API server.

---

## 3. SERVER MANAGEMENT

### 3.1 Health Checks

**Endpoint:** `GET /api/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": 1704067200000,
  "uptime": 3600,
  "environment": "production",
  "features": {
    "demoMode": false,
    "mockData": false,
    "netProtocol": true,
    "voidScore": true
  }
}
```

**Health check script:**
```bash
#!/bin/bash
# healthcheck.sh

HEALTH_URL="https://void.psx.gg/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -eq 200 ]; then
  echo "✅ Server is healthy"
  exit 0
else
  echo "❌ Server is unhealthy (HTTP $response)"
  exit 1
fi
```

### 3.2 Process Monitoring

**PM2 monitoring:**
```bash
# Real-time dashboard
pm2 monit

# CPU/memory usage
pm2 status

# Restart if memory exceeds 500MB
pm2 start npm --name void-hud -- start --max-memory-restart 500M
```

**Systemd service (Linux):**
```ini
# /etc/systemd/system/void-hud.service

[Unit]
Description=VOID HUD Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/void-hud
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Commands:**
```bash
# Start service
sudo systemctl start void-hud

# Enable auto-start on boot
sudo systemctl enable void-hud

# View logs
sudo journalctl -u void-hud -f
```

### 3.3 Log Rotation

**PM2 log rotation:**
```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

**Logrotate (Linux):**
```conf
# /etc/logrotate.d/void-hud

/var/log/void-hud/*.log {
  daily
  rotate 7
  compress
  delaycompress
  notifempty
  create 0640 www-data www-data
  sharedscripts
  postrotate
    pm2 reloadLogs
  endscript
}
```

---

## 4. MONITORING & LOGGING

### 4.1 Application Logs

**Server-side logging (lib/logger.ts):**
```typescript
import { logger } from '@/lib/logger';

// INFO level
logger.info('User connected', { userId: '0x123', sessionId: 'abc' });

// ERROR level
logger.error('API request failed', { error: err.message, endpoint: '/api/chat' });

// DEBUG level (only in development)
logger.debug('Cache hit', { key: 'leaderboards', ttl: 300 });
```

**Log format (JSON structured):**
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "error",
  "message": "API request failed",
  "metadata": {
    "error": "Network timeout",
    "endpoint": "/api/chat",
    "userId": "0x123"
  }
}
```

### 4.2 Client-Side Monitoring

**Console logging standards:**
```typescript
// ✅ Acceptable in production
console.info('[VoidHud] User opened Passport window');
console.warn('[NetClient] Retrying connection (attempt 2/3)');

// ✅ Debug logging (gated behind env var)
if (process.env.NODE_ENV === 'development') {
  console.debug('[useScoreEvents] Mock mode: generated 10 events');
}

// ❌ Never in production
console.log(userData); // Sensitive data leak
console.error('this should never happen'); // Uninformative
```

**Sentry integration (lib/sentry.ts):**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% performance monitoring
  
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  }
});
```

**Error boundaries:**
```tsx
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <VoidHudApp />
</Sentry.ErrorBoundary>
```

### 4.3 Performance Metrics

**Web Vitals tracking:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Custom metrics:**
```typescript
// Measure HUD load time
const start = performance.now();
await loadHudData();
const duration = performance.now() - start;

logger.info('HUD loaded', { duration, userId });
```

**Benchmarks (target metrics):**
- **FCP (First Contentful Paint):** < 1.5s
- **LCP (Largest Contentful Paint):** < 2.5s
- **TTI (Time to Interactive):** < 3.5s
- **CLS (Cumulative Layout Shift):** < 0.1

### 4.4 Database Query Monitoring

**Prisma logging (lib/prisma.ts):**
```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  logger.debug('Database query', {
    query: e.query,
    duration: e.duration,
    params: e.params
  });
});
```

**Slow query alerts:**
```typescript
if (e.duration > 1000) {
  logger.warn('Slow database query', {
    query: e.query,
    duration: e.duration
  });
}
```

---

## 5. TROUBLESHOOTING

### 5.1 Common Issues & Solutions

#### Issue: HUD Not Loading

**Symptoms:**
- Blank screen after 5+ seconds
- No HUD container visible
- Console error: "Cannot read property 'wallet' of undefined"

**Diagnosis:**
```bash
# Check server logs
pm2 logs void-hud --lines 50

# Check browser console
# Open DevTools → Console
# Look for red errors (not warnings)
```

**Solutions:**

1. **Verify environment variables:**
   ```bash
   cat .env.local | grep NEXT_PUBLIC_DEMO_MODE
   # Should be "true" for demo mode
   ```

2. **Clear build cache:**
   ```bash
   rm -rf .next
   npm run build
   npm run dev
   ```

3. **Check Abstract wallet connection:**
   ```typescript
   // In browser console
   console.log(window.ethereum);
   // Should show Abstract wallet provider
   ```

#### Issue: Demo Data Not Showing

**Symptoms:**
- Empty windows (no messages, no leaderboards, no gigs)
- "No data available" placeholders

**Diagnosis:**
```bash
# Check NEXT_PUBLIC_USE_MOCK_DATA flag
cat .env.local | grep USE_MOCK_DATA
# Should be "true"

# Check hooks/useDemoData.ts is being called
# Browser console should show:
# "[useDemoData] Mock mode: generating 8 chat messages"
```

**Solutions:**

1. **Restart dev server after env change:**
   ```bash
   # Ctrl+C to stop server
   npm run dev
   ```

2. **Verify shouldUseMockData() function:**
   ```typescript
   // In browser console
   console.log(window.location.hostname);
   // Should be "localhost" for demo mode to activate
   ```

#### Issue: Wallet Connection Failed

**Symptoms:**
- "Connect Wallet" button stuck in loading state
- Error: "Provider not found"

**Diagnosis:**
```javascript
// Browser console
console.log(window.ethereum);
// Should show Abstract provider

console.log(navigator.userAgent);
// Check if mobile browser (Abstract requires mobile app)
```

**Solutions:**

1. **Install Abstract wallet extension:**
   - Desktop: Install Abstract Chrome extension
   - Mobile: Use Abstract mobile app

2. **Reload page after wallet install:**
   ```javascript
   window.location.reload();
   ```

3. **Check RPC URL:**
   ```bash
   cat .env.local | grep RPC_URL
   # Should be https://sepolia.base.org
   ```

#### Issue: High Memory Usage

**Symptoms:**
- PM2 shows >1GB memory usage
- Browser tab crashes
- "Out of memory" errors

**Diagnosis:**
```bash
# Check process memory
pm2 status

# Check Node heap size
node --max-old-space-size=4096 server.js

# Browser DevTools → Performance → Memory
# Look for memory leaks (sawtooth pattern)
```

**Solutions:**

1. **Restart PM2 process:**
   ```bash
   pm2 restart void-hud
   ```

2. **Enable memory limit:**
   ```bash
   pm2 start npm --name void-hud -- start --max-memory-restart 500M
   ```

3. **Find memory leaks:**
   ```typescript
   // Check for event listener leaks
   useEffect(() => {
     const handler = () => {};
     window.addEventListener('resize', handler);
     
     // Missing cleanup!
     return () => window.removeEventListener('resize', handler);
   }, []);
   ```

#### Issue: API Rate Limiting

**Symptoms:**
- 429 errors in browser console
- "Too many requests" message

**Diagnosis:**
```bash
# Check API logs
pm2 logs void-hud | grep "429"

# Count requests per minute
pm2 logs void-hud | grep "/api/chat" | wc -l
```

**Solutions:**

1. **Implement request debouncing:**
   ```typescript
   const debouncedSend = debounce(sendMessage, 1000);
   ```

2. **Add client-side caching:**
   ```typescript
   const { data } = useSWR('/api/leaderboards', fetcher, {
     revalidateOnFocus: false,
     dedupingInterval: 60000 // 1 minute
   });
   ```

3. **Server-side rate limiting:**
   ```typescript
   // middleware.ts
   import { rateLimit } from '@/lib/rate-limit';
   
   const limiter = rateLimit({
     interval: 60 * 1000, // 1 minute
     uniqueTokenPerInterval: 500
   });
   
   if (!limiter.check(req.ip)) {
     return new Response('Too Many Requests', { status: 429 });
   }
   ```

### 5.2 Debug Tools

#### Next.js Debug Mode

```bash
# Run dev server in debug mode
NODE_OPTIONS='--inspect' npm run dev

# Open Chrome DevTools
# chrome://inspect
# Click "Open dedicated DevTools for Node"
```

#### React DevTools

```bash
# Install React DevTools extension
# Chrome: https://chrome.google.com/webstore (search "React Developer Tools")

# Components tab shows:
# - Component tree
# - Props
# - State
# - Hooks

# Profiler tab shows:
# - Render times
# - Re-render count
# - Performance bottlenecks
```

#### Network Debugging

```javascript
// Browser console
// Filter API requests
fetch = new Proxy(fetch, {
  apply(target, thisArg, args) {
    console.log('[Fetch]', args[0]);
    return Reflect.apply(target, thisArg, args);
  }
});
```

---

## 6. PRE-DEMO CHECKLIST

**Run this 2-minute verification before any live demo.**

### 6.1 Environment Check

```bash
# ✅ Verify .env.local settings
cat .env.local | grep -E "DEMO_MODE|USE_MOCK_DATA|NET_PROTOCOL|VOIDSCORE"

# Expected output:
# NEXT_PUBLIC_DEMO_MODE=true
# NEXT_PUBLIC_USE_MOCK_DATA=true
# NEXT_PUBLIC_ENABLE_NET_PROTOCOL=false
# NEXT_PUBLIC_ENABLE_VOIDSCORE=false
```

### 6.2 Build & Server Check

```bash
# ✅ Build succeeds without errors
npm run build
# Should see: "✓ Compiled successfully"

# ✅ Dev server starts in <5 seconds
npm run dev
# Should see: "✓ Ready in 3.2s"

# ✅ Health endpoint responds
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

### 6.3 Visual Smoke Test

**Open browser to http://localhost:3000**

| Check | Expected Result | Status |
|-------|-----------------|--------|
| HUD loads within 5 seconds | Top economy strip + bottom dock visible | ⬜ |
| Demo mode label visible | "(Demo)" in economy strip | ⬜ |
| VOID price shows $0.0024 | Demo price visible | ⬜ |
| PSX price shows $0.0018 | Demo price visible | ⬜ |
| Open Passport window | GOLD tier + 720 XP visible | ⬜ |
| Open Wallet tab | Balance shows 2500 VOID | ⬜ |
| Open Global Chat | 8 demo messages visible | ⬜ |
| Open DMs (Phone) | 3 conversations visible | ⬜ |
| Open Guilds | "VOID Builders" membership visible | ⬜ |
| Open Agency Board | 6 gigs visible | ⬜ |
| Open Leaderboards | Rank #7 + 10 entries visible | ⬜ |
| Open World Map | 3 zones unlocked | ⬜ |
| No console errors | Zero red errors in DevTools console | ⬜ |

### 6.4 Automated E2E Test

```bash
# ✅ Run smoke test suite
npm run test:e2e

# Should see:
# ✓ 14 passed (30s)
# No failures
```

---

## 7. EMERGENCY PROCEDURES

### 7.1 Server Crash Recovery

**If production server goes down during demo:**

```bash
# 1. SSH into server
ssh user@void.psx.gg

# 2. Check process status
pm2 status

# 3. Restart application
pm2 restart void-hud

# 4. Verify health
curl http://localhost:3000/api/health

# 5. Check logs for errors
pm2 logs void-hud --lines 100 | grep -i error
```

**If PM2 is unresponsive:**
```bash
# Kill all Node processes
killall -9 node

# Start fresh
pm2 start npm --name void-hud -- start
```

### 7.2 Demo Mode Fallback

**If live data fails, switch to demo mode mid-presentation:**

```bash
# 1. Edit .env.local
nano .env.local

# 2. Change flags:
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_USE_MOCK_DATA=true

# 3. Restart server (5 second downtime)
pm2 restart void-hud

# 4. Refresh browser
# Ctrl+Shift+R (hard reload)
```

**Founder speaking points during restart:**
> "Let me switch to our demo environment which showcases the full feature set without blockchain latency. This is the same UI you'll use in production, just with pre-populated data for demonstration purposes."

### 7.3 Wallet Connection Recovery

**If Abstract wallet disconnects:**

```javascript
// Browser console (have this ready in a snippet)
window.location.reload();

// Or programmatically reconnect
if (window.ethereum) {
  window.ethereum.request({ method: 'eth_requestAccounts' });
}
```

### 7.4 Rollback Procedures

**If new deployment breaks production:**

```bash
# Vercel rollback (instant)
vercel rollback

# PM2 rollback
cd /var/www/void-hud
git reset --hard HEAD~1  # Go back 1 commit
npm install
npm run build
pm2 restart void-hud
```

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Frontend Optimization

**Code splitting:**
```typescript
// Lazy load heavy components
const WorldMap = dynamic(() => import('@/components/windows/WorldMap'), {
  loading: () => <Skeleton />,
  ssr: false // Don't server-render Three.js
});
```

**Image optimization:**
```tsx
import Image from 'next/image';

<Image 
  src="/assets/avatar.png" 
  width={64} 
  height={64}
  loading="lazy"
  placeholder="blur"
/>
```

**Memoization:**
```typescript
const memoizedData = useMemo(() => {
  return expensiveComputation(data);
}, [data]);

const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

### 8.2 Backend Optimization

**Database indexing:**
```sql
-- Add indexes for common queries
CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

**Caching:**
```typescript
import { cache } from '@/lib/redis';

async function getLeaderboards() {
  const cached = await cache.get('leaderboards');
  if (cached) return JSON.parse(cached);
  
  const data = await db.leaderboards.findMany();
  await cache.set('leaderboards', JSON.stringify(data), 'EX', 300); // 5 min TTL
  
  return data;
}
```

### 8.3 Monitoring Performance

**Lighthouse CI:**
```bash
# Install Lighthouse CI
npm i -g @lhci/cli

# Run audit
lhci autorun

# Target scores:
# Performance: >90
# Accessibility: >95
# Best Practices: >90
# SEO: >90
```

**Bundle analyzer:**
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Look for:
# - Large dependencies (>100KB)
# - Duplicate dependencies
# - Unused code
```

---

## APPENDIX A: USEFUL COMMANDS

### Development
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test:e2e         # Run E2E smoke tests
```

### Deployment
```bash
vercel --prod            # Deploy to Vercel
pm2 start npm -- start   # Start with PM2
pm2 restart void-hud     # Restart PM2 process
pm2 logs void-hud        # View logs
```

### Troubleshooting
```bash
rm -rf .next node_modules  # Clean install
npm install
npm run build

curl http://localhost:3000/api/health  # Health check
pm2 monit                              # Process monitor
```

---

## APPENDIX B: CONTACT & ESCALATION

**For DevOps emergencies:**
- Primary: devops@psx.gg
- Secondary: Slack #void-ops channel

**For demo support:**
- Primary: founder@psx.gg
- Backup demo link: https://demo.void.psx.gg

**Incident response SLA:**
- P0 (Production down): 15 minutes
- P1 (Demo broken): 1 hour
- P2 (Performance degraded): 4 hours

---

**Document Version:** 1.0  
**Last Updated:** Week 4, Phase 4.5  
**Next Review:** Phase 5.0 (Mainnet preparation)
