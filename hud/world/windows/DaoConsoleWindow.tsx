'use client';

import React from 'react';

interface DaoConsoleWindowProps {
  dao?: any;
  onOpenWindow?: (type: string, props?: any) => void;
  onClose?: () => void;
}

export function DaoConsoleWindow({ dao, onOpenWindow }: DaoConsoleWindowProps) {
  const psxVotingPower = dao?.myVotingPower ?? dao?.votingPower ?? 125000;
  const activeProposals = dao?.activeProposals ?? MOCK_ACTIVE_PROPOSALS;
  const pastProposals = dao?.pastProposals ?? MOCK_PAST_PROPOSALS;

  return (
    <div className="flex flex-col gap-4">
      {/* voting power */}
      <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-psx-blue/70 px-4 py-3 shadow-[0_0_30px_rgba(59,130,246,0.7)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
              Your Voting Power
            </div>
            <div className="text-[1rem] text-psx-blue font-mono">
              {psxVotingPower.toLocaleString()} PSX
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-psx-blue to-bio-silver text-void-black text-[0.7rem] font-mono tracking-[0.2em] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition"
            onClick={() => onOpenWindow?.("defiOverview")}
          >
            Stake More
          </button>
        </div>
      </div>

      {/* active proposals */}
      <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden">
        <HeaderRow title="Active Proposals" />
        <div className="max-h-[30vh] overflow-y-auto divide-y divide-bio-silver/15">
          {activeProposals.map((p: any) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                onOpenWindow?.("proposalDetail", { proposalId: p.id })
              }
              className="w-full text-left px-3 py-2 hover:bg-void-deep/50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[0.8rem] text-bio-silver/90">
                    {p.title}
                  </div>
                  <div className="text-[0.65rem] text-bio-silver/60">
                    Ends in {p.endsIn} · Quorum {p.quorumPct}%
                  </div>
                </div>
                <div className="text-right text-[0.7rem] font-mono">
                  <div className="text-signal-green">
                    {p.forPct.toFixed(1)}% For
                  </div>
                  <div className="text-rose-400">
                    {p.againstPct.toFixed(1)}% Against
                  </div>
                </div>
              </div>
            </button>
          ))}
          {activeProposals.length === 0 && (
            <EmptyRow text="No active proposals. Check back later." />
          )}
        </div>
      </section>

      {/* past proposals summary */}
      <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-bio-silver/30 flex items-center justify-between">
          <h3 className="text-[0.8rem] font-mono tracking-[0.22em] uppercase text-bio-silver/80">
            History
          </h3>
          <span className="text-[0.6rem] text-bio-silver/50">
            {pastProposals.length} proposals
          </span>
        </div>
        <div className="max-h-[16vh] overflow-y-auto divide-y divide-bio-silver/15">
          {pastProposals.slice(0, 6).map((p: any) => (
            <div
              key={p.id}
              className="px-3 py-1.5 text-[0.7rem] flex items-center justify-between"
            >
              <span className="truncate max-w-[60%] text-bio-silver/80">
                {p.title}
              </span>
              <span className="text-bio-silver/55">
                {p.result.toUpperCase()}
              </span>
            </div>
          ))}
          {pastProposals.length === 0 && (
            <EmptyRow text="No history yet." />
          )}
        </div>
      </section>
    </div>
  );
}

function HeaderRow({ title }: { title: string }) {
  return (
    <div className="px-3 py-2 border-b border-bio-silver/30 flex items-center justify-between">
      <h3 className="text-[0.8rem] font-mono tracking-[0.22em] uppercase text-psx-blue">
        {title}
      </h3>
      <span className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/50">
        DAO
      </span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="px-3 py-3 text-[0.7rem] text-bio-silver/60 text-center">
      {text}
    </div>
  );
}

const MOCK_ACTIVE_PROPOSALS = [
  { id: "27", title: "Increase creator emissions by 15%", endsIn: "2d 8h", quorumPct: 10, forPct: 68.5, againstPct: 31.5 },
  { id: "28", title: "Allocate 50k PSX to AI OPS development", endsIn: "4d 12h", quorumPct: 10, forPct: 82.1, againstPct: 17.9 },
];

const MOCK_PAST_PROPOSALS = [
  { id: "26", title: "Add ZORA integration to creator hub", result: "passed" },
  { id: "25", title: "Reduce vault withdrawal fee", result: "passed" },
  { id: "24", title: "Emergency governance upgrade", result: "passed" },
];
