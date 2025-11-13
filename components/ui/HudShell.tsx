"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Map, Building2, Package, Store, 
  Landmark, Settings, User, Menu, X,
  Bell, Wallet, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';
import { CRTOverlay } from '@/components/CRTOverlay';
import { useAccount } from 'wagmi';

// ============================================================================
// TYPES
// ============================================================================

export type HudSection = 
  | 'HOME'
  | 'LAND'
  | 'REALESTATE'
  | 'INVENTORY'
  | 'BUSINESS'
  | 'DAO'
  | 'SETTINGS';

interface HudShellProps {
  children?: React.ReactNode;
  currentSection?: HudSection;
  onSectionChange?: (section: HudSection) => void;
  hideNav?: boolean;
  className?: string;
}

interface NavItem {
  id: HudSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description: string;
}

// ============================================================================
// NAV CONFIGURATION
// ============================================================================

const NAV_ITEMS: NavItem[] = [
  {
    id: 'HOME',
    label: 'HUB',
    icon: Home,
    description: 'Main dashboard & activity feed'
  },
  {
    id: 'LAND',
    label: 'LAND & MAP',
    icon: Map,
    description: 'Browse & explore the city grid'
  },
  {
    id: 'REALESTATE',
    label: 'REAL ESTATE',
    icon: Building2,
    description: 'Manage properties & buildings'
  },
  {
    id: 'INVENTORY',
    label: 'INVENTORY',
    icon: Package,
    description: 'Your assets & collectibles'
  },
  {
    id: 'BUSINESS',
    label: 'BUSINESS',
    icon: Store,
    description: 'Business registry & SKUs'
  },
  {
    id: 'DAO',
    label: 'GOVERNANCE',
    icon: Landmark,
    description: 'DAO voting & proposals'
  },
  {
    id: 'SETTINGS',
    label: 'SETTINGS',
    icon: Settings,
    description: 'Profile & preferences'
  }
];

// ============================================================================
// HUD SHELL COMPONENT
// ============================================================================

export function HudShell({
  children,
  currentSection = 'HOME',
  onSectionChange,
  hideNav = false,
  className = ''
}: HudShellProps) {
  const { address, isConnected } = useAccount();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: HudSection) => {
    onSectionChange?.(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black ${className}`}>
      {/* CRT Overlay */}
      <CRTOverlay />

      <div className="relative z-10 flex h-full">
        {/* ========== PRIMARY NAV RAIL (Desktop) ========== */}
        {!hideNav && (
          <motion.nav
            initial={false}
            animate={{ width: navCollapsed ? 80 : 240 }}
            className="hidden lg:flex flex-col bg-black/80 border-r border-[#00f0ff]/30 backdrop-blur-sm"
          >
            {/* Logo / Branding */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-[#00f0ff]/20">
              {!navCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col"
                >
                  <h1 className="text-xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#ff0032] via-[#7b00ff] to-[#00f0ff]">
                    PSX-VOID
                  </h1>
                  <span className="text-[10px] text-[#00f0ff]/60 font-mono tracking-wider">
                    GENESIS v1.0.0
                  </span>
                </motion.div>
              )}
              <ChromeButton
                variant="ghost"
                onClick={() => setNavCollapsed(!navCollapsed)}
                className="w-8 h-8 p-0"
              >
                {navCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </ChromeButton>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative w-full flex items-center gap-3 px-3 py-3 rounded-lg
                      transition-all duration-200 group
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#ff0032]/20 via-[#7b00ff]/20 to-[#00f0ff]/20 border border-[#00f0ff]/50' 
                        : 'hover:bg-white/5 border border-transparent'
                      }
                    `}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ff0032] via-[#7b00ff] to-[#00f0ff] rounded-r"
                      />
                    )}

                    {/* Icon */}
                    <Icon className={`
                      w-5 h-5 flex-shrink-0
                      ${isActive 
                        ? 'text-[#00f0ff]' 
                        : 'text-white/60 group-hover:text-[#00f0ff]'
                      }
                    `} />

                    {/* Label & Description */}
                    {!navCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-start flex-1 min-w-0"
                      >
                        <span className={`
                          text-sm font-semibold font-orbitron tracking-wide
                          ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}
                        `}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono truncate w-full">
                          {item.description}
                        </span>
                      </motion.div>
                    )}

                    {/* Badge */}
                    {item.badge && !navCollapsed && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#ff0032] text-white">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* User Section */}
            {isConnected && (
              <div className={`
                border-t border-[#00f0ff]/20 p-3
                ${navCollapsed ? 'flex justify-center' : ''}
              `}>
                {navCollapsed ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff0032] to-[#7b00ff] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff0032] to-[#7b00ff] flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-white/80 truncate">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                      <div className="text-[10px] text-[#00f0ff]/60">
                        Connected
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.nav>
        )}

        {/* ========== MAIN CONTENT AREA ========== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ========== TOP BAR ========== */}
          {!hideNav && (
            <header className="h-16 border-b border-[#00f0ff]/30 bg-black/60 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6">
              {/* Mobile Menu Toggle */}
              <ChromeButton
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </ChromeButton>

              {/* Section Title */}
              <div className="flex items-center gap-3">
                {NAV_ITEMS.find(item => item.id === currentSection)?.icon && (
                  <>
                    {React.createElement(NAV_ITEMS.find(item => item.id === currentSection)!.icon, {
                      className: "w-6 h-6 text-[#00f0ff]"
                    })}
                  </>
                )}
                <div>
                  <h2 className="text-lg font-bold font-orbitron text-white">
                    {NAV_ITEMS.find(item => item.id === currentSection)?.label || 'HUB'}
                  </h2>
                  <p className="text-[10px] text-white/50 font-mono">
                    {NAV_ITEMS.find(item => item.id === currentSection)?.description}
                  </p>
                </div>
              </div>

              {/* Top Bar Actions */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <ChromeButton variant="ghost" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff0032] rounded-full animate-pulse" />
                </ChromeButton>

                {/* Wallet */}
                {isConnected && (
                  <ChromeButton variant="secondary" className="hidden md:flex">
                    <Wallet className="w-4 h-4 mr-2" />
                    <span className="font-mono text-xs">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </ChromeButton>
                )}
              </div>
            </header>
          )}

          {/* ========== CONTENT PANE ========== */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-black via-[#0a0014] to-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* ========== MOBILE MENU ========== */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-black/95 backdrop-blur-lg border-r border-[#00f0ff]/30 lg:hidden"
            >
              {/* Mobile Logo */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#00f0ff]/20">
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#ff0032] via-[#7b00ff] to-[#00f0ff]">
                    PSX-VOID
                  </h1>
                  <span className="text-[10px] text-[#00f0ff]/60 font-mono tracking-wider">
                    GENESIS v1.0.0
                  </span>
                </div>
                <ChromeButton
                  variant="ghost"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </ChromeButton>
              </div>

              {/* Mobile Nav Items */}
              <div className="py-4 space-y-1 px-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`
                        relative w-full flex items-center gap-3 px-3 py-3 rounded-lg
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#ff0032]/20 via-[#7b00ff]/20 to-[#00f0ff]/20 border border-[#00f0ff]/50' 
                          : 'hover:bg-white/5 border border-transparent'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#00f0ff]' : 'text-white/60'}`} />
                      <div className="flex flex-col items-start flex-1">
                        <span className={`text-sm font-semibold font-orbitron ${isActive ? 'text-white' : 'text-white/80'}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {item.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
