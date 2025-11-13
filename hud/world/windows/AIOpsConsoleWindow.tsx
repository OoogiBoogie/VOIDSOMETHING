'use client';

import React from 'react';

interface AIOpsConsoleWindowProps {
  aiOps?: any;
  onOpenWindow?: (type: string, props?: any) => void;
  onClose?: () => void;
}

export function AIOpsConsoleWindow({ aiOps }: AIOpsConsoleWindowProps) {
  const logs = aiOps?.logs ?? MOCK_LOGS;
  const policies = aiOps?.policies ?? MOCK_POLICIES;
  const current = aiOps?.currentPolicy ?? policies[0];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-signal-green/60 px-4 py-3 shadow-[0_0_30px_rgba(0,255,157,0.7)]">
        <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          Current Policy
        </div>
        <div className="text-[0.9rem] text-signal-green font-mono">
          {current?.label ?? "NEUTRAL"}
        </div>
        <div className="text-[0.65rem] text-bio-silver/60">
          {current?.description ?? "AI OPS idle."}
        </div>
      </div>

      <div className="grid grid-cols-[2fr,1.5fr] gap-3 flex-1 min-h-0">
        {/* logs */}
        <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-bio-silver/30 text-[0.8rem] font-mono tracking-[0.22em] uppercase text-bio-silver/70">
            Live Log
          </div>
          <div className="flex-1 overflow-y-auto text-[0.7rem] font-mono space-y-1 px-3 py-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-bio-silver/45">{log.time}</span>
                <span className="text-bio-silver/85">{log.message ?? log.action}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-bio-silver/60">No events yet.</div>
            )}
          </div>
        </section>

        {/* policy list */}
        <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-bio-silver/30 text-[0.8rem] font-mono tracking-[0.22em] uppercase text-bio-silver/70">
            Policies
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-bio-silver/15 text-[0.7rem]">
            {policies.map((p: any) => (
              <div key={p.id} className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-bio-silver/90">{p.label}</span>
                  {p.id === current?.id && (
                    <span className="text-[0.6rem] text-signal-green">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-bio-silver/60 text-[0.65rem]">
                  {p.description}
                </div>
              </div>
            ))}
            {policies.length === 0 && (
              <div className="px-3 py-3 text-bio-silver/60">
                No policy definitions yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const MOCK_LOGS = [
  { id: 1, time: "14:32:18", message: "VaultAI: Analyzed VOID/ETH LP position" },
  { id: 2, time: "14:31:45", message: "MissionAI: New creator drop detected in District 2" },
  { id: 3, time: "14:30:12", message: "VaultAI: Risk flag cleared on PSX staking vault" },
  { id: 4, time: "14:28:33", message: "MissionAI: Suggested mission: Attend DAO proposal #27" },
];

const MOCK_POLICIES = [
  { id: 1, label: "NEUTRAL", description: "Monitor only, no automatic actions" },
  { id: 2, label: "AGGRESSIVE", description: "Auto-compound vaults, accept high-yield missions" },
  { id: 3, label: "CONSERVATIVE", description: "Risk alerts only, manual approval required" },
];
