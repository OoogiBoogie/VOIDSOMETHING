'use client';

import React from 'react';
import { JobBoardPanel } from '../panels/JobBoardPanel';
import { HubDynamicPanel } from '../panels/HubDynamicPanel';

export const RightRail: React.FC<any> = ({
  snapshot,
  hubMode,
  onOpenWindow,
  triggerFX,
  theme,
}) => {
  const jobs = snapshot.jobs ?? snapshot.agency?.jobs ?? snapshot.agency?.gigs ?? [];
  const hubData = snapshot;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* RED BOX – Job / task board, compact, no scrollbar */}
      <JobBoardPanel
        jobs={jobs}
        onOpenWindow={onOpenWindow}
        triggerFX={triggerFX}
      />

      {/* BIG WHITE AREA – dynamic hub view, takes most vertical space */}
      <div className="flex-1 rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden">
        <HubDynamicPanel
          hubMode={hubMode}
          snapshot={hubData}
          onOpenWindow={onOpenWindow}
          triggerFX={triggerFX}
        />
      </div>
    </div>
  );
};
