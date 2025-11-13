'use client';

import React from 'react';

// Placeholder windows - implement these as needed

export function MissionDetailWindow({ missionId }: any) {
  return (
    <div className="text-center py-8 text-bio-silver/60">
      Mission Detail #{missionId} - Coming Soon
    </div>
  );
}

export function WalletWindow() {
  return (
    <div className="text-center py-8 text-bio-silver/60">
      Wallet View - Coming Soon
    </div>
  );
}

export function ZonesWindow({ focusParcelId }: any) {
  return (
    <div className="text-center py-8 text-bio-silver/60">
      Zones & Land View {focusParcelId ? `(Parcel #${focusParcelId})` : ''} - Coming Soon
    </div>
  );
}

export function VoidHubWindow() {
  return (
    <div className="text-center py-8 text-bio-silver/60">
      VOID Global Hub - Coming Soon
    </div>
  );
}

export function CasinoWindow() {
  return (
    <div className="text-center py-8 text-bio-silver/60">
      Casino Pool - Coming Soon
    </div>
  );
}
