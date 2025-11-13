'use client';

import React from 'react';

type HubMode = 'WORLD' | 'CREATOR' | 'DEFI' | 'DAO' | 'AGENCY' | 'AI_OPS';

export const HubDynamicPanel: React.FC<{
  hubMode: HubMode;
  snapshot: any;
  onOpenWindow: (type: string, props?: any) => void;
  triggerFX?: (fx: string, payload?: any) => void;
}> = ({ hubMode, snapshot, onOpenWindow, triggerFX }) => {
  switch (hubMode) {
    case 'WORLD':
      return (
        <WorldActivityPanel
          world={snapshot.world ?? {}}
          onOpenWindow={onOpenWindow}
        />
      );
    case 'CREATOR':
      return (
        <CreatorDiscoveryPanel
          creator={snapshot.creator ?? {}}
          onOpenWindow={onOpenWindow}
        />
      );
    case 'DEFI':
      return (
        <DefiMarketPanel
          defi={snapshot.defi ?? {}}
          onOpenWindow={onOpenWindow}
        />
      );
    case 'DAO':
      return (
        <DaoOverviewPanel dao={snapshot.dao ?? {}} onOpenWindow={onOpenWindow} />
      );
    case 'AGENCY':
      return (
        <AgencyOverviewPanel
          agency={snapshot.agency ?? {}}
          onOpenWindow={onOpenWindow}
        />
      );
    case 'AI_OPS':
      return (
        <AiOpsOverviewPanel
          aiOps={snapshot.aiOps ?? {}}
          onOpenWindow={onOpenWindow}
        />
      );
    default:
      return null;
  }
};

/* WORLD: events, hotspots – bigger box like you asked */
const WorldActivityPanel: React.FC<any> = ({ world, onOpenWindow }) => {
  const events = (world.events ?? []).slice(0, 3);

  return (
    <div className="h-full flex flex-col">
      <header className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
            World Activity
          </h3>
          <p className="text-[0.65rem] text-bio-silver/55">
            Live events, portals & hotspots.
          </p>
        </div>
        <button
          className="text-[0.6rem] text-emerald-300 hover:text-cyan-300"
          onClick={() => onOpenWindow('WORLD_MAP', { world })}
        >
          Map View ▸
        </button>
      </header>
      <div className="flex-1 px-3 pb-3 space-y-1.5">
        {events.map((e: any) => (
          <button
            key={e.id}
            type="button"
            className="w-full text-left px-3 py-1.5 rounded-2xl bg-black/70 border border-bio-silver/25 hover:border-emerald-300/70 transition flex items-center justify-between text-[0.7rem]"
            onClick={() => onOpenWindow('WORLD_MAP', { world, focusEventId: e.id })}
          >
            <div>
              <div className="font-medium">{e.name}</div>
              <div className="text-[0.6rem] text-bio-silver/55">
                District {e.district} · {e.players} players
              </div>
            </div>
            <span className="text-[0.6rem] text-emerald-300/85">
              {e.status ?? 'Live'}
            </span>
          </button>
        ))}
        {events.length === 0 && (
          <p className="text-[0.7rem] text-bio-silver/50 italic">
            No events discovered yet.
          </p>
        )}
      </div>
    </div>
  );
};

/* CREATOR: top creators, twitch-style preview */
const CreatorDiscoveryPanel: React.FC<any> = ({ creator, onOpenWindow }) => {
  const topCreators = (creator.topCreators ?? []).slice(0, 3);

  return (
    <div className="h-full flex flex-col">
      <header className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
            Top Creators
          </h3>
          <p className="text-[0.65rem] text-bio-silver/55">
            Live drops, streams & land.
          </p>
        </div>
        <button
          className="text-[0.6rem] text-cyan-300 hover:text-emerald-300"
          onClick={() => onOpenWindow('CREATOR_HUB', {})}
        >
          Creator Hub ▸
        </button>
      </header>
      <div className="flex-1 px-3 pb-3 space-y-1.5">
        {topCreators.map((c: any) => (
          <button
            key={c.id}
            type="button"
            className="w-full text-left px-3 py-1.5 rounded-2xl bg-black/70 border border-bio-silver/25 hover:border-cyan-300/70 transition flex items-center justify-between text-[0.7rem]"
            onClick={() => onOpenWindow('DROP_DETAIL', { creatorId: c.id })}
          >
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-[0.6rem] text-bio-silver/55">
                {c.live ? 'Live now' : 'Offline'} · {c.activeDrops || 0} drops
              </div>
            </div>
            <span className="text-[0.6rem] text-cyan-300/85">
              {c.viewers ?? 0} viewers
            </span>
          </button>
        ))}
        {topCreators.length === 0 && (
          <p className="text-[0.7rem] text-bio-silver/50 italic">
            No creators streaming.
          </p>
        )}
      </div>
    </div>
  );
};

/* DEFI: vaults, swap, top coins */
const DefiMarketPanel: React.FC<any> = ({ defi, onOpenWindow }) => {
  const vaults = (defi.vaults ?? []).slice(0, 2);
  const coins = (defi.topCoins ?? []).slice(0, 3);

  return (
    <div className="h-full flex flex-col">
      <header className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
            DeFi Pulse
          </h3>
          <p className="text-[0.65rem] text-bio-silver/55">
            Vaults, swaps & top coins.
          </p>
        </div>
        <button
          className="text-[0.6rem] text-violet-300 hover:text-emerald-300"
          onClick={() => onOpenWindow('DEFI_OVERVIEW', {})}
        >
          DeFi Hub ▸
        </button>
      </header>
      <div className="flex-1 px-3 pb-3 grid grid-rows-2 gap-2">
        <div className="rounded-2xl bg-black/70 border border-bio-silver/25 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.65rem] text-bio-silver/60">Top vaults</span>
            <button
              className="text-[0.6rem] text-violet-300"
              onClick={() => onOpenWindow('DEFI_OVERVIEW', { tab: 'vaults' })}
            >
              View ▸
            </button>
          </div>
          <div className="space-y-0.5 text-[0.7rem]">
            {vaults.map((v: any) => (
              <button
                key={v.id}
                className="w-full text-left flex items-center justify-between hover:text-violet-300"
                onClick={() => onOpenWindow('VAULT_DETAIL', { vaultId: v.id })}
              >
                <span>{v.name}</span>
                <span className="text-[0.6rem] text-bio-silver/55">
                  {v.apr || v.apy}% APY
                </span>
              </button>
            ))}
            {vaults.length === 0 && (
              <p className="text-[0.65rem] text-bio-silver/50 italic">No vaults</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-black/70 border border-bio-silver/25 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.65rem] text-bio-silver/60">Top coins</span>
            <button
              className="text-[0.6rem] text-violet-300"
              onClick={() => onOpenWindow('DEFI_OVERVIEW', { tab: 'market' })}
            >
              Market ▸
            </button>
          </div>
          <div className="space-y-0.5 text-[0.7rem]">
            {coins.map((c: any) => (
              <div
                key={c.symbol}
                className="flex items-center justify-between"
              >
                <span>{c.symbol}</span>
                <span className="text-[0.6rem] text-bio-silver/55">
                  ${c.price} · {c.change24h > 0 ? '+' : ''}{c.change24h}%
                </span>
              </div>
            ))}
            {coins.length === 0 && (
              <p className="text-[0.65rem] text-bio-silver/50 italic">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* DAO: proposals + treasury */
const DaoOverviewPanel: React.FC<any> = ({ dao, onOpenWindow }) => {
  const proposals = (dao.proposals ?? []).slice(0, 3);

  return (
    <div className="h-full flex flex-col">
      <header className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
            DAO · Governance
          </h3>
          <p className="text-[0.65rem] text-bio-silver/55">
            Proposals & treasury state.
          </p>
        </div>
        <button
          className="text-[0.6rem] text-sky-300 hover:text-emerald-300"
          onClick={() => onOpenWindow('DAO_CONSOLE', {})}
        >
          DAO Console ▸
        </button>
      </header>
      <div className="flex-1 px-3 pb-3 space-y-1.5 text-[0.7rem]">
        {proposals.map((p: any) => (
          <button
            key={p.id}
            className="w-full text-left px-3 py-1.5 rounded-2xl bg-black/70 border border-bio-silver/25 hover:border-sky-300/70 transition"
            onClick={() => onOpenWindow('PROPOSAL_DETAIL', { proposalId: p.id })}
          >
            <div className="font-medium">{p.title}</div>
            <div className="text-[0.6rem] text-bio-silver/55">
              {p.status || 'Active'} · ends in {p.timeLeft}
            </div>
          </button>
        ))}
        {proposals.length === 0 && (
          <p className="text-[0.7rem] text-bio-silver/50 italic">
            No active proposals.
          </p>
        )}
      </div>
    </div>
  );
};

/* The Agency: proposals, grants, incubation */
const AgencyOverviewPanel: React.FC<any> = ({ agency, onOpenWindow }) => {
  const programs = (agency.programs ?? agency.gigs ?? []).slice(0, 3);

  return (
    <div className="h-full flex flex-col">
      <header className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
            The Agency
          </h3>
          <p className="text-[0.65rem] text-bio-silver/55">
            Grants, proposals & incubation.
          </p>
        </div>
        <button
          className="text-[0.6rem] text-rose-300 hover:text-emerald-300"
          onClick={() => onOpenWindow('AGENCY_BOARD', {})}
        >
          Open ▸
        </button>
      </header>
      <div className="flex-1 px-3 pb-3 space-y-1.5 text-[0.7rem]">
        {programs.map((pg: any) => (
          <button
            key={pg.id}
            className="w-full text-left px-3 py-1.5 rounded-2xl bg-black/70 border border-bio-silver/25 hover:border-rose-300/70 transition"
            onClick={() => onOpenWindow('JOB_DETAIL', { programId: pg.id })}
          >
            <div className="font-medium">{pg.title}</div>
            <div className="text-[0.6rem] text-bio-silver/55">
              {pg.type || 'Grant'} · {pg.reward || pg.pool}
            </div>
          </button>
        ))}
        {programs.length === 0 && (
          <p className="text-[0.7rem] text-bio-silver/50 italic">
            No active programs.
          </p>
        )}
      </div>
    </div>
  );
};

/* AI OPS overview */
const AiOpsOverviewPanel: React.FC<any> = ({ aiOps, onOpenWindow }) => {
  const logs = (aiOps.logs ?? []).slice(0, 4);

  return (
    <div className="h-full flex flex-col">
      <header className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
            AI Ops · Control
          </h3>
          <p className="text-[0.65rem] text-bio-silver/55">
            Automation & risk telemetry.
          </p>
        </div>
        <button
          className="text-[0.6rem] text-lime-300 hover:text-emerald-300"
          onClick={() => onOpenWindow('AI_OPS_CONSOLE', {})}
        >
          Console ▸
        </button>
      </header>
      <div className="flex-1 px-3 pb-3 space-y-1 text-[0.7rem]">
        {logs.map((l: any, idx: number) => (
          <div
            key={idx}
            className="px-2 py-1 rounded-xl bg-black/70 border border-bio-silver/25"
          >
            <div className="text-lime-300/80">{l.tag || l.text?.split(':')[0]}</div>
            <div className="text-[0.6rem] text-bio-silver/60">{l.message || l.text}</div>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-[0.7rem] text-bio-silver/50 italic">
            All systems nominal.
          </p>
        )}
      </div>
    </div>
  );
};
