"use client";

import React from 'react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';
import { Store, Plus, TrendingUp } from 'lucide-react';
import { BusinessManagementPanel } from '@/components/business/business-management-panel';
import { LicenseType, BusinessSector, BusinessStatus } from '@/lib/land/types';

/**
 * BUSINESS SCREEN
 * Business registry, SKU management, revenue tracking
 */

export function BusinessScreen() {
  const [hasBusinesses, setHasBusinesses] = React.useState(false);

  // Mock data - TODO: Replace with real data from API
  const mockBusiness = {
    businessId: "BIZ-001",
    ownerAddress: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    licenseType: LicenseType.RETAIL,
    sector: BusinessSector.RETAIL,
    linkedParcelIds: [1],
    primaryParcelId: 1,
    buildingIds: [],
    brandName: "Sample Business",
    tagline: "Your tagline here",
    brandColors: {
      primary: "#ff0032",
      secondary: "#00f0ff"
    },
    status: BusinessStatus.ACTIVE,
    openedAt: new Date(),
    totalRevenue: 0n,
    monthlyRevenue: 0n,
    revenueDistribution: {
      toOwner: 7000n,
      toEcosystem: 3000n,
      treasuryBps: 1000,
      foundersBps: 500,
      stakingBps: 500
    }
  };

  const mockSKUs: any[] = [];

  if (!hasBusinesses) {
    return (
      <div className="p-6 flex items-center justify-center min-h-full">
        <ChromePanel variant="glass" className="p-12 text-center max-w-2xl">
          <Store className="w-20 h-20 mx-auto mb-6 text-white/30" />
          <h2 className="text-2xl font-bold font-orbitron text-white mb-4">
            No Businesses Registered
          </h2>
          <p className="text-white/60 mb-6">
            Own a parcel and create your first business to start selling products and generating revenue
          </p>
          <ChromeButton onClick={() => setHasBusinesses(true)}>
            <Plus className="w-5 h-5 mr-2 inline-block" />
            Register Business
          </ChromeButton>
        </ChromePanel>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BusinessManagementPanel 
        business={mockBusiness}
        skus={mockSKUs}
      />
    </div>
  );
}
