# 🌌 VOID Metaverse - Complete Edition (000)

**The Ultimate 3D Web3 Metaverse Platform**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-Latest-blue?style=for-the-badge)](https://docs.pmnd.rs/react-three-fiber)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Wagmi](https://img.shields.io/badge/Wagmi-Latest-purple?style=for-the-badge)](https://wagmi.sh/)

---

## 📋 Overview

This is the **MASTER BUILD** of the VOID Metaverse, combining the best components from:
- ✅ **11118 Repository** - Phase 7 & 8 complete (Mobile Optimization + Frontend Integration)
- ✅ **maybe Folder** - v0.dev enhanced components with latest features
- ✅ **All Systems Integrated** - 11 core game systems, Systems Hub, Web3 infrastructure

---

## 🎮 Core Features

### 🏆 11 Core Game Systems
All systems are **mobile-optimized** and accessible via the **Systems Hub**:

1. **🏆 Achievements** - Track accomplishments, unlock rewards
2. **⚔️ Quests** - Daily, weekly, seasonal missions
3. **🏅 Leaderboards** - Global and friend rankings
4. **👥 Party System** - Form parties, shared quests
5. **🔄 Trading** - P2P item trading
6. **🔨 Auction House** - Buy/sell at auction
7. **🏦 Bank** - Item storage, VOID staking
8. **⚒️ Crafting** - Craft items and equipment
9. **💃 Emotes** - Express yourself with animations
10. **📷 Photo Mode** - Capture screenshots
11. **📅 Event Calendar** - View and join events

### 🎯 Systems Hub
- **Floating Action Button** - Animated, always accessible
- **12 Keyboard Shortcuts** - `S` for hub + 11 individual systems
- **4 Categories** - Social, Economy, Progression, Creative
- **Mobile-Optimized** - Touch-friendly interface

### 🌍 3D World
- **React Three Fiber** - High-performance 3D rendering
- **Cyberpunk City** - Multiple districts to explore
- **Character Movement** - WASD controls + mobile joystick
- **Camera System** - Multiple angles (close, medium, far)
- **Zone Interactions** - Enter buildings, trigger events

### 📱 Mobile Features
- **Touch Controls** - Virtual joystick + action buttons
- **Safe Area Support** - iOS notch and home indicator
- **Keyboard Detection** - Auto-adjust UI for virtual keyboard
- **Orientation Aware** - Portrait and landscape modes
- **Haptic Feedback** - Touch vibration (mobile only)
- **Pull-to-Refresh** - Update data in all systems
- **Mobile HUD** - Lite and Full modes

### 🔗 Web3 Integration
- **Privy Auth** - Email + wallet authentication
- **Wagmi Hooks** - React hooks for Ethereum
- **7 Smart Contracts**:
  - VOIDToken.sol
  - xVOIDVault.sol (staking)
  - FoundersNFT.sol
  - MetaverseLand.sol
  - SKUFactory.sol
  - FeeDistributor.sol
  - UniswapV4Hook.sol

### 🗃️ Database (Supabase)
- **27 Migration Scripts** - Complete schema
- **Real-time Features**:
  - Global chat
  - Proximity chat
  - Friend system
  - Online presence
  - Multiplayer positions

### 🎨 UI Components
- **80+ Components** - shadcn/ui + custom
- **Dark Theme** - Cyberpunk aesthetic
- **Animations** - Framer Motion
- **Responsive** - Mobile, tablet, desktop

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Git

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/rigofelix2017-rgb/000.git
cd 000

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your keys: NEXT_PUBLIC_PRIVY_APP_ID, NEXT_PUBLIC_SUPABASE_URL, etc.

# Run development server
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

\`\`\`bash
pnpm build
pnpm start
\`\`\`

---

## 📁 Project Structure

\`\`\`
000/
├── app/                          # Next.js 16 app directory
│   ├── page.tsx                  # Main metaverse page
│   ├── layout.tsx                # Root layout with providers
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # 47+ API endpoints
│   ├── auth/                     # Authentication pages
│   ├── creator-dashboard/        # Creator tools
│   ├── founders/                 # Founders NFT page
│   ├── governance/               # DAO governance
│   └── marketplace/              # SKU marketplace
│
├── components/                   # React components (80+)
│   ├── systems/                  # 11 core game systems
│   │   ├── achievement-system.tsx
│   │   ├── quest-system.tsx
│   │   ├── leaderboards-system.tsx
│   │   ├── party-system.tsx
│   │   ├── trading-system.tsx
│   │   ├── auction-house.tsx
│   │   ├── bank-system.tsx
│   │   ├── crafting-system.tsx
│   │   ├── emote-system.tsx
│   │   ├── photo-mode.tsx
│   │   └── event-calendar.tsx
│   ├── systems-hub.tsx           # Central systems interface
│   ├── systems-hub-button.tsx    # Floating action button
│   ├── scene-3d.tsx              # 3D world renderer
│   ├── mobile-touch-controls.tsx # Virtual joystick
│   ├── intro/                    # Intro sequence
│   ├── mobile/                   # Mobile-optimized wrappers
│   ├── ui/                       # shadcn/ui components
│   └── ... (60+ more components)
│
├── lib/                          # Utilities and hooks
│   ├── mobile-optimization.ts    # Mobile utilities (Phase 7)
│   ├── mobile-optimization-hooks.ts # Mobile hooks (14 hooks)
│   ├── contracts/                # Smart contract ABIs
│   ├── hooks/                    # Custom React hooks (20+)
│   ├── supabase/                 # Database client
│   ├── web3/                     # Web3 utilities
│   ├── websocket/                # Real-time multiplayer
│   └── xp/                       # XP system
│
├── hooks/                        # Additional hooks
│   ├── use-mobile.ts
│   ├── use-safe-area.ts
│   ├── use-orientation.ts
│   └── ... (7 hooks)
│
├── contracts/                    # Solidity smart contracts
│   ├── VOIDToken.sol
│   ├── xVOIDVault.sol
│   ├── FoundersNFT.sol
│   ├── MetaverseLand.sol
│   ├── SKUFactory.sol
│   ├── FeeDistributor.sol
│   └── UniswapV4Hook.sol
│
├── scripts/                      # Database migrations
│   └── 001-027_*.sql             # 27 migration scripts
│
├── server/                       # Backend services
│   └── multiplayer-server.js     # WebSocket server
│
├── styles/                       # Global styles
│   └── globals.css               # Tailwind + custom styles
│
└── public/                       # Static assets
    └── models/                   # 3D models (.glb files)
\`\`\`

---

## 🧪 E2E Testing

**Quick Start:** [START-HERE-E2E.md](./START-HERE-E2E.md) (5-minute setup)

### Test Conductor (Automated E2E)

Run comprehensive end-to-end testing with one command:

```powershell
# Install Foundry (one-time)
.\install-foundry-windows.ps1

# Run E2E tests (replace with your testnet private key)
.\scripts\Test-Conductor.ps1 -WalletPrivKey 0xYOUR_TESTNET_KEY
```

**What it validates:**
- ✅ Environment setup (Node, Foundry, RPC, Chain ID)
- ✅ UI availability (localhost:3000)
- ✅ Fee routing (0.3% swap fees → Router)
- ✅ Staking APR (12% + XP boost display)
- ✅ World ↔ HUD sync (≤3s)
- ✅ FPS performance (≥55 FPS target)

**Results:** Automated JSONL logs in `qa-reports/`

### Operations Scripts (Read-Only Monitoring)

Located in `scripts/ops/` - safe to run anytime:

```powershell
# System health check
.\scripts\ops\status.ps1

# Watch live events (VOID/USDC/Land transfers)
.\scripts\ops\watch-events.ps1 -Follow

# Audit fee routing (last 10k blocks)
.\scripts\ops\fee-audit.ps1

# Monitor gas prices
.\scripts\ops\gas-watch.ps1 -Follow

# Export land ownership (CSV/JSON)
.\scripts\ops\land-snapshot.ps1

# Query subgraph
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType meta
```

**Documentation:**
- **[DEV-E2E-ACCESS-GUIDE.md](./DEV-E2E-ACCESS-GUIDE.md)** - Comprehensive developer setup
- **[E2E-QUICK-START.md](./E2E-QUICK-START.md)** - Testing procedures
- **[TEST-CONDUCTOR-RESULTS.md](./TEST-CONDUCTOR-RESULTS.md)** - Results template
- **[scripts/ops/README.md](./scripts/ops/README.md)** - Ops pack overview
- **[docs/OPS-RUNBOOK.md](./docs/OPS-RUNBOOK.md)** - Operations guide
- **[docs/RUNBOOKS.md](./docs/RUNBOOKS.md)** - Incident response

---

## 🎯 Key Systems Breakdown

### Systems Hub
**Files**: `components/systems-hub.tsx`, `components/systems-hub-button.tsx`

Access all 11 systems via:
- Floating button (bottom-right)
- Keyboard shortcut `S`
- Individual system hotkeys (A, Q, L, H, T, U, K, C, Z, Y, W)

### Mobile Optimization (Phase 7)
**Files**: `lib/mobile-optimization.ts`, `lib/mobile-optimization-hooks.ts`, `components/mobile/*`

Features:
- 14 React hooks for mobile
- Touch-optimized UI components
- Haptic feedback
- Safe area support
- Pull-to-refresh
- Keyboard detection

### Web3 Infrastructure
**Files**: `lib/wagmiConfig.ts`, `lib/contracts/*`, `lib/hooks/use-*`

Features:
- Privy authentication
- Wagmi React hooks
- 7 smart contracts
- 20+ custom hooks

### API Routes
**Folder**: `app/api/`

47+ endpoints including:
- `/api/player-xp` - XP tracking
- `/api/daily-tasks` - Quest system
- `/api/friends/*` - Friend management
- `/api/passport` - User passport
- `/api/teleport` - Fast travel
- `/api/business-metrics` - Analytics
- ... and 40+ more

### Database Schema
**Folder**: `scripts/`

27 migration files covering:
- User profiles and roles
- XP and leveling system
- Chat (global, proximity, DM)
- Friend system
- Property/land parcels
- Governance proposals
- Business submissions
- Achievements
- Agencies
- SKU storefronts
- Staking snapshots
- Leaderboards

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `WASD` | Move character |
| `Shift` | Sprint |
| `S` | Open Systems Hub |
| `P` | Open Phone Interface |
| `Tab` | Open Dashboard |
| `I` | Open Inventory |
| `M` | Open Map |
| `F` | Open Friends |
| `Escape` | Close current UI |
| `A` | Open Achievements |
| `Q` | Open Quests |
| `L` | Open Leaderboards |
| `H` | Open Party System |
| `T` | Open Trading |
| `U` | Open Auction House |
| `K` | Open Bank |
| `C` | Open Crafting |
| `Z` | Open Emotes |
| `Y` | Open Photo Mode |
| `W` | Open Event Calendar |

---

## 📱 Mobile Controls

### Touch Controls
- **Joystick** (bottom-left) - Move character
- **Sprint Button** - Hold to run
- **Action Button** - Interact with objects
- **Map Button** - Open world map
- **Chat Button** - Open chat
- **Systems Button** - Open Systems Hub (bottom-right)

### Gestures
- **Tap** - Select/interact
- **Drag Joystick** - Move character
- **Pull Down** - Refresh (in systems)
- **Swipe** - Navigate (in menus)

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

\`\`\`env
# Privy (Authentication)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Wallet Connect (Optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Multiplayer WebSocket (Optional)
NEXT_PUBLIC_WS_URL=ws://localhost:8080
\`\`\`

### next.config.mjs

Already configured with:
- TypeScript & ESLint errors ignored for build
- Image optimization disabled
- Webpack fallbacks for Web3 packages
- Server-side externals for Privy/Wagmi

---

## 🎨 Customization

### Theming

Edit `app/globals.css`:

\`\`\`css
:root {
  --background: 0 0% 0%; /* Black background */
  --foreground: 0 0% 100%; /* White text */
  --primary: 263 70% 50%; /* Purple accent */
  --secondary: 333 71% 51%; /* Pink accent */
  /* ... more CSS variables */
}
\`\`\`

### Adding New Systems

1. Create component in `components/systems/your-system.tsx`
2. Add to Systems Hub in `components/systems-hub.tsx`:

\`\`\`tsx
const SYSTEMS: SystemDefinition[] = [
  // ... existing systems
  {
    id: 'your-system',
    name: 'Your System',
    icon: '🆕',
    description: 'Your system description',
    component: YourSystem,
    category: 'progression', // or 'social', 'economy', 'creative'
    hotkey: 'X',
  },
]
\`\`\`

3. Apply mobile optimization from Phase 7:

\`\`\`tsx
import { MobileOptimizedWrapper } from '@/components/mobile/MobileOptimizedComponents'
import { useHaptic } from '@/lib/mobile-optimization-hooks'

export function YourSystem() {
  const haptic = useHaptic()
  
  return (
    <MobileOptimizedWrapper title="Your System">
      {/* Your system UI */}
    </MobileOptimizedWrapper>
  )
}
\`\`\`

---

## 🚀 Deployment

### Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Environment Setup

Make sure to set all environment variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Docker: Use `.env` file or `-e` flags
- AWS/GCP: Use secrets manager

---

## 📊 Performance

### Optimization Features
- **Code Splitting** - Next.js automatic splitting
- **Lazy Loading** - Components load on demand
- **Image Optimization** - Next.js Image component
- **3D Optimization** - LOD (Level of Detail) for models
- **Mobile Optimization** - Reduced poly count on mobile
- **Caching** - API routes cached with SWR
- **WebSocket** - Real-time without polling

### Performance Targets
- **FPS**: 60 on desktop, 30+ on mobile
- **First Load**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **Bundle Size**: < 500KB (gzipped)

---

## 🧪 Testing

### Run Tests

\`\`\`bash
# Unit tests (if added)
pnpm test

# E2E tests (if added)
pnpm test:e2e

# Type checking
pnpm tsc --noEmit

# Linting
pnpm lint
\`\`\`

---

## 📚 Documentation

### Additional Docs
- `PHASE-7-COMPLETE.md` - Mobile optimization details
- `PHASE-8-COMPLETE.md` - Frontend integration details
- `SYSTEMS-HUB-USER-GUIDE.md` - User guide for all systems
- `LAME-INTEGRATION.md` - Integration documentation

### API Documentation
- All API routes include JSDoc comments
- Zod schemas for validation
- Type-safe with TypeScript

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Standards
- **TypeScript** - Strict mode enabled
- **ESLint** - Follow configured rules
- **Prettier** - Use for formatting
- **Components** - Functional components with hooks
- **Mobile-First** - Design for mobile, enhance for desktop

---

## 🐛 Troubleshooting

### Common Issues

**Build Fails:**
\`\`\`bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
\`\`\`

**3D Scene Not Rendering:**
- Check browser WebGL support
- Ensure React Three Fiber is installed
- Check console for errors

**Systems Hub Not Opening:**
- Verify all 11 systems are in `components/systems/`
- Check imports in `systems-hub.tsx`
- Clear browser cache

**Mobile Controls Not Working:**
- Check if `isMobile` is detected correctly
- Verify touch events are not blocked
- Test on real device (not just emulator)

---

## 📄 License

This project is proprietary and confidential.

---

## 🙏 Credits

### Technologies Used
- Next.js 16
- React 19
- TypeScript 5
- React Three Fiber
- Framer Motion
- Tailwind CSS
- shadcn/ui
- Wagmi
- Privy
- Supabase
- Three.js

### Development Team
- **Lead Developer**: rigofelix2017-rgb
- **AI Assistant**: GitHub Copilot

---

## 📞 Support

For issues, questions, or feature requests:
- **GitHub Issues**: [https://github.com/rigofelix2017-rgb/000/issues](https://github.com/rigofelix2017-rgb/000/issues)
- **Documentation**: See `/docs` folder
- **Discord**: [Coming Soon]

---

## 🎯 Roadmap

### Completed ✅
- [x] Phase 1-4: Foundation (Character, World, Camera, Controls)
- [x] Phase 5: Core Systems (11 systems, 5,028 lines)
- [x] Phase 6: API Infrastructure (47+ endpoints)
- [x] Phase 7: Mobile Optimization (all systems)
- [x] Phase 8: Frontend Integration (Systems Hub)

### In Progress 🔄
- [ ] Phase 9: Integration Testing
- [ ] Phase 10: Database Integration (Drizzle ORM)

### Future 🚀
- [ ] Multiplayer Real-time Sync
- [ ] Voice Chat Integration
- [ ] NFT Marketplace
- [ ] Land Ownership System
- [ ] DAO Governance
- [ ] Mobile App (React Native)
- [ ] VR Support

---

## 📈 Stats

- **Total Lines of Code**: ~25,000+
- **Components**: 80+
- **API Endpoints**: 47+
- **Database Tables**: 27
- **Smart Contracts**: 7
- **Mobile Hooks**: 14
- **Game Systems**: 11
- **Keyboard Shortcuts**: 20+

---

**Built with ❤️ for the VOID community**

*The ultimate Web3 metaverse platform - fully open, fully decentralized, fully immersive.*
