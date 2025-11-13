"use client";

import React, { useState } from 'react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';
import { Building2, Home, Key, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * REAL ESTATE SCREEN
 * Property management: parcels, buildings, units, leases
 */

type RealEstateTab = 'parcels' | 'buildings' | 'units' | 'leases';

export function RealEstateScreen() {
  const [activeTab, setActiveTab] = useState<RealEstateTab>('parcels');

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-[#00f0ff]/20 bg-black/40">
        <ChromeButton
          variant={activeTab === 'parcels' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('parcels')}
        >
          <Home className="w-4 h-4 mr-2" />
          My Parcels
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'buildings' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('buildings')}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Buildings
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'units' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('units')}
        >
          <Key className="w-4 h-4 mr-2" />
          Units
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'leases' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('leases')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Leases
        </ChromeButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'parcels' && <ParcelsView />}
        {activeTab === 'buildings' && <BuildingsView />}
        {activeTab === 'units' && <UnitsView />}
        {activeTab === 'leases' && <LeasesView />}
      </div>
    </div>
  );
}

// View Components
function ParcelsView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-orbitron text-white">
          My Land Parcels
        </h3>
        <ChromeButton>
          <Plus className="w-4 h-4 mr-2" />
          Browse Marketplace
        </ChromeButton>
      </div>

      <ChromePanel variant="glass" className="p-8 text-center">
        <Home className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h4 className="text-lg font-semibold text-white mb-2">
          No Parcels Owned
        </h4>
        <p className="text-sm text-white/60 mb-4">
          Start your VOID journey by acquiring your first parcel
        </p>
        <ChromeButton>
          Explore Available Land
        </ChromeButton>
      </ChromePanel>
    </div>
  );
}

function BuildingsView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-orbitron text-white">
          My Buildings
        </h3>
        <ChromeButton>
          <Plus className="w-4 h-4 mr-2" />
          Construct Building
        </ChromeButton>
      </div>

      <ChromePanel variant="glass" className="p-8 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h4 className="text-lg font-semibold text-white mb-2">
          No Buildings Yet
        </h4>
        <p className="text-sm text-white/60 mb-4">
          Purchase land first, then construct your building
        </p>
      </ChromePanel>
    </div>
  );
}

function UnitsView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-orbitron text-white">
          Leasable Units
        </h3>
        <ChromeButton>
          <Plus className="w-4 h-4 mr-2" />
          Create Unit
        </ChromeButton>
      </div>

      <ChromePanel variant="glass" className="p-8 text-center">
        <Key className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h4 className="text-lg font-semibold text-white mb-2">
          No Units Available
        </h4>
        <p className="text-sm text-white/60 mb-4">
          Build a building and subdivide it into leasable units
        </p>
      </ChromePanel>
    </div>
  );
}

function LeasesView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-orbitron text-white">
          Active Leases
        </h3>
        <ChromeButton>
          View Revenue
        </ChromeButton>
      </div>

      <ChromePanel variant="glass" className="p-8 text-center">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h4 className="text-lg font-semibold text-white mb-2">
          No Active Leases
        </h4>
        <p className="text-sm text-white/60 mb-4">
          Create units and lease them to tenants to generate passive income
        </p>
      </ChromePanel>
    </div>
  );
}
