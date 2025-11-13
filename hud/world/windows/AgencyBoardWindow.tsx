'use client';

import React from 'react';
import { ArrowRight, Briefcase, Users } from 'lucide-react';
import type { WindowType } from '@/hud/windowTypes';

interface AgencyBoardWindowProps {
  agency?: any;
  onOpenWindow?: (type: WindowType, props?: any) => void;
  onClose?: () => void;
}

export function AgencyBoardWindow({ agency, onOpenWindow }: AgencyBoardWindowProps) {
  const gigs = agency?.openGigs ?? agency?.gigs ?? MOCK_GIGS;
  const squads = agency?.squads ?? MOCK_SQUADS;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Summary label="Open Gigs" value={gigs.length} />
        <Summary label="Active Squads" value={squads.length} />
      </div>

      <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-red-500/60 shadow-[0_0_30px_rgba(248,113,113,0.7)] overflow-hidden">
        <div className="px-3 py-2 border-b border-bio-silver/30 flex items-center justify-between">
          <h3 className="text-[0.8rem] font-mono tracking-[0.22em] uppercase text-red-400">
            Gig Board
          </h3>
          <span className="text-[0.6rem] text-bio-silver/55">
            PSX-backed roles
          </span>
        </div>
        <div className="max-h-[32vh] overflow-y-auto divide-y divide-bio-silver/15">
          {gigs.map((g: any) => (
            <div
              key={g.id}
              className="px-3 py-2 hover:bg-void-deep/50 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-[0.8rem] text-bio-silver/90">
                    {g.title}
                  </div>
                  <div className="text-[0.65rem] text-bio-silver/60">
                    {g.agencyName} · {g.district}
                  </div>
                </div>
                <div className="text-right text-[0.7rem] font-mono">
                  <div className="text-signal-green">
                    {g.reward} SIGNAL
                  </div>
                  <div className="text-psx-blue">{g.psxStake} PSX stake</div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenWindow?.("JOB_DETAIL" as WindowType, { jobId: g.id })}
                  className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[0.7rem] font-bold rounded hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {gigs.length === 0 && (
            <div className="px-6 py-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-red-400/40" />
              <p className="text-[0.8rem] text-bio-silver/80 mb-1">No gigs available right now</p>
              <p className="text-[0.65rem] text-bio-silver/50">Check back later for new opportunities</p>
            </div>
          )}
        </div>
      </section>

      {/* squads section */}
      <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-bio-silver/30 flex items-center justify-between">
          <h3 className="text-[0.8rem] font-mono tracking-[0.22em] uppercase text-bio-silver/80">
            Active Squads
          </h3>
        </div>
        <div className="max-h-[20vh] overflow-y-auto divide-y divide-bio-silver/15">
          {squads.map((s: any) => (
            <div
              key={s.id}
              className="px-3 py-2 text-[0.7rem] flex items-center justify-between"
            >
              <div>
                <div className="text-bio-silver/90">{s.name}</div>
                <div className="text-bio-silver/60 text-[0.65rem]">
                  {s.members} members · {s.activeGigs} active gigs
                </div>
              </div>
              <div className="text-signal-green">{s.totalEarned} SIGNAL earned</div>
            </div>
          ))}
          {squads.length === 0 && (
            <div className="px-6 py-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-bio-silver/40" />
              <p className="text-[0.8rem] text-bio-silver/80 mb-1">No squads formed yet</p>
              <p className="text-[0.65rem] text-bio-silver/50">Apply to a gig to join or create one</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 px-3 py-2">
      <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
        {label}
      </div>
      <div className="text-[0.95rem] text-red-400 font-mono">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

const MOCK_GIGS = [
  { id: 1, title: "3D Environment Designer", agencyName: "VOID Studios", district: "Creator Zone", reward: 1500, psxStake: 5000 },
  { id: 2, title: "Smart Contract Auditor", agencyName: "SecureDAO", district: "DeFi District", reward: 2500, psxStake: 10000 },
  { id: 3, title: "Community Moderator", agencyName: "VOID Labs", district: "DAO Plaza", reward: 800, psxStake: 2000 },
];

const MOCK_SQUADS = [
  { id: 1, name: "Alpha Builders", members: 8, activeGigs: 3, totalEarned: 12500 },
  { id: 2, name: "Creative Collective", members: 12, activeGigs: 5, totalEarned: 24800 },
];
