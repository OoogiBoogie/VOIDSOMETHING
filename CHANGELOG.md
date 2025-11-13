# Changelog

All notable changes to PSX VOID will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Coming Soon
- Subgraph integration for Analytics tab
- Land parcel buy/sell flows
- Mobile-optimized HUD layout
- Gas price oracle widget
- Enhanced error boundaries with retry logic

---

## [0.3.0-phase3-alpha] - 2025-11-11

### Added
- **Test Infrastructure**
  - Test Conductor PowerShell script for guided E2E testing
  - QA logging system (JSONL format in qa-reports/)
  - FPS performance monitor badge (enable with NEXT_PUBLIC_SHOW_FPS=1)
  - Comprehensive E2E testing guide and results template
  - Pre-flight validation script

- **Production Hardening**
  - RPC fallback array with auto-ranking and retry logic (3 endpoints)
  - Chain guard hook validates Base Sepolia (84532) only
  - Input validation helpers (parseAmount, ensureRange, humanError)
  - Environment variable validation with Zod schema
  - CI/CD enhancements: secrets scanning, OSV vulnerability scan, Foundry integration

- **Core Economic Flows**
  - WalletTab: Live staking with APR = Base (12%) + XPOracle boost
  - SwapTab: VOID↔USDC swap with 0.3% fee routing to VoidHookRouterV4
  - LandTab: Live parcel ownership tracking with worldEvents subscription
  - Fee routing E2E test script (PowerShell with cast)

- **Theme Consistency**
  - Replaced 25+ hardcoded hex colors with voidTheme CSS variables
  - District colors now use semantic color tokens
  - Gradients standardized across all chrome elements

- **Documentation**
  - Multisig map for protocol governance
  - Runbooks for incident response
  - Phase 3 pre-deployment checklist
  - Builder AI prompt template

### Changed
- Upgraded CI/CD workflow to upload ops-dashboard and QA reports as artifacts
- wagmiConfig now uses fallback transport with multiple RPCs
- All DeFi inputs now use unified validation helpers
- Error messages converted to user-friendly copy via humanError()

### Fixed
- PowerShell test scripts use correct bigint syntax (removed `n` suffix)
- District color inconsistencies across Land tab and world views
- Missing chain ID validation on contract calls

### Security
- Added TruffleHog secrets scanning to CI pipeline
- OSV vulnerability scanning for npm dependencies
- Zod-based environment variable validation prevents config errors

---

## [0.2.0-phase2] - 2025-11-08

### Added
- Multi-tab HUD system (10 tabs: Wallet, Swap, Land, Analytics, DAO, Creator, AI, Settings, Help, Chat)
- Desktop window-based HUD with draggable/resizable panels
- Mobile bottom-sheet HUD with swipe gestures
- Roam mode toggle for exploration vs. action mode
- CurrentParcelPanel with live ownership tracking
- World map overlay with district visualization

### Changed
- Migrated from single panel HUD to tabbed interface
- Improved mobile UX with touch-optimized controls
- Enhanced district color coding system

### Fixed
- Privy authentication double-modal issue
- HUD z-index conflicts with 3D world
- Mobile keyboard overlap with input fields

---

## [0.1.0-phase1] - 2025-11-01

### Added
- Initial 3D world with R3F (React Three Fiber)
- Basic avatar movement (WASD controls)
- District system (DeFi, Creator, DAO, AI, Neutral)
- Parcel grid (100x100 parcels)
- Privy wallet integration
- Basic HUD with wallet connection

### Changed
- N/A (initial release)

### Fixed
- N/A (initial release)

---

## Version Naming Convention

**Format:** `MAJOR.MINOR.PATCH-phase<N>-<stability>`

- **MAJOR:** Breaking changes, major architecture shifts
- **MINOR:** New features, backwards-compatible
- **PATCH:** Bug fixes, minor improvements
- **phase<N>:** Development phase (1=MVP, 2=Multi-Tab, 3=Economic Flows, 4=Analytics, etc.)
- **stability:** alpha | beta | rc | stable

**Examples:**
- `0.3.0-phase3-alpha` - Phase 3 (Economic Flows), alpha quality
- `0.4.0-phase4-beta` - Phase 4 (Analytics), beta quality
- `1.0.0-mainnet-stable` - Mainnet launch, production ready

---

## Release Process

1. **Update CHANGELOG.md** with all changes since last release
2. **Run E2E tests:** `.\scripts\Test-Conductor.ps1`
3. **Bump version in package.json**
4. **Tag release:** `git tag v0.3.0-phase3-alpha`
5. **Push tag:** `git push origin v0.3.0-phase3-alpha`
6. **Create GitHub release** with CHANGELOG excerpt
7. **Deploy to production** (Vercel/Netlify)
8. **Announce in Discord/Twitter**

---

## Support

For questions or issues:
- **Discord:** https://discord.gg/psx-void
- **GitHub Issues:** https://github.com/psx-void/issues
- **Docs:** https://docs.psx-void.com

---

**Note:** This project is in active development. Breaking changes may occur in alpha/beta releases.
