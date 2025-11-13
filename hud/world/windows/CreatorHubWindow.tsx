'use client';

import React from 'react';

interface CreatorHubWindowProps {
  creator?: any;
  onOpenWindow?: (type: string, props?: any) => void;
  onClose?: () => void;
}

export function CreatorHubWindow({ creator, onOpenWindow }: CreatorHubWindowProps) {
  const drops = creator?.activeDrops ?? creator?.trendingDrops ?? MOCK_DROPS;
  const byotProjects = creator?.byotProjects ?? MOCK_BYOT;
  const land = creator?.land ?? MOCK_LAND;

  return (
    <div className="flex flex-col gap-4">
      {/* summary row */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryBox
          label="Active Drops"
          value={drops.length}
          sub="Live creator launches"
        />
        <SummaryBox
          label="BYOT Projects"
          value={byotProjects.length}
          sub="Imported creator tokens"
        />
        <SummaryBox
          label="Metaverse Land"
          value={land.length}
          sub="Owned / managed parcels"
        />
      </div>

      {/* drops list */}
      <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-cyber-cyan/60 shadow-[0_0_30px_rgba(56,189,248,0.7)] overflow-hidden">
        <HeaderRow title="Creator Drops" tag="CREATOR" />
        <div className="max-h-[26vh] overflow-y-auto divide-y divide-bio-silver/15">
          {drops.map((drop: any) => (
            <button
              key={drop.id}
              type="button"
              onClick={() => onOpenWindow?.("dropDetail", { dropId: drop.id })}
              className="w-full text-left px-3 py-2 hover:bg-void-deep/50 flex items-center justify-between gap-3 transition"
            >
              <div>
                <div className="text-[0.8rem] text-bio-silver">
                  {drop.name}
                </div>
                <div className="text-[0.65rem] text-bio-silver/60">
                  {drop.creatorName} · {drop.supplyMinted}/{drop.maxSupply} minted
                </div>
              </div>
              <div className="text-right text-[0.7rem] font-mono">
                <div className="text-cyber-cyan">
                  {drop.price} {drop.tokenSymbol}
                </div>
                <div className="text-bio-silver/60">
                  {Math.round(drop.mintedPct)}% minted
                </div>
              </div>
            </button>
          ))}
          {drops.length === 0 && (
            <EmptyRow text="No active drops. Launch or import one." />
          )}
        </div>
      </section>

      {/* BYOT + land row */}
      <div className="grid grid-cols-2 gap-3">
        <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden">
          <HeaderRow title="BYOT Creator Tokens" tag="BYOT" />
          <div className="max-h-[18vh] overflow-y-auto divide-y divide-bio-silver/15">
            {byotProjects.map((p: any) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenWindow?.("dropDetail", { dropId: p.id })}
                className="w-full text-left px-3 py-2 hover:bg-void-deep/50 transition"
              >
                <div className="flex items-center justify-between text-[0.7rem]">
                  <span className="text-bio-silver/90">{p.name}</span>
                  <span className="text-bio-silver/60">
                    {p.tokenSymbol} · {p.holders} holders
                  </span>
                </div>
              </button>
            ))}
            {byotProjects.length === 0 && (
              <EmptyRow text="No BYOT projects linked yet." />
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-black/75 backdrop-blur-2xl border border-signal-green/50 overflow-hidden">
          <HeaderRow title="Metaverse Land" tag="LAND" />
          <div className="max-h-[18vh] overflow-y-auto divide-y divide-bio-silver/15">
            {land.map((parcel: any) => (
              <button
                key={parcel.id}
                type="button"
                onClick={() => onOpenWindow?.("zones", { focusParcelId: parcel.id })}
                className="w-full text-left px-3 py-2 hover:bg-void-deep/50 transition"
              >
                <div className="flex items-center justify-between text-[0.7rem]">
                  <span className="text-bio-silver/90">
                    {parcel.name ?? `Parcel #${parcel.id}`}
                  </span>
                  <span className="text-bio-silver/60">
                    District {parcel.district} · ({parcel.x},{parcel.z})
                  </span>
                </div>
              </button>
            ))}
            {land.length === 0 && (
              <EmptyRow text="No land owned. Scout the map for opportunities." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 px-3 py-2">
      <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
        {label}
      </div>
      <div className="text-[0.95rem] text-cyber-cyan font-mono">
        {value.toLocaleString()}
      </div>
      <div className="text-[0.65rem] text-bio-silver/60">{sub}</div>
    </div>
  );
}

function HeaderRow({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="px-3 py-2 border-b border-bio-silver/30 flex items-center justify-between">
      <h3 className="text-[0.8rem] font-mono tracking-[0.22em] uppercase text-cyber-cyan">
        {title}
      </h3>
      {tag && (
        <span className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/50">
          {tag}
        </span>
      )}
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

const MOCK_DROPS = [
  { id: 1, name: "Cyberspace Avatars", creatorName: "VOID Studios", supplyMinted: 847, maxSupply: 1000, price: 0.08, tokenSymbol: "ETH", mintedPct: 84.7 },
  { id: 2, name: "Neon Dreams Collection", creatorName: "Dreamcore Labs", supplyMinted: 1250, maxSupply: 5000, price: 0.05, tokenSymbol: "ETH", mintedPct: 25.0 },
];

const MOCK_BYOT = [
  { id: 3, name: "STUDIO Token", tokenSymbol: "STUDIO", holders: 1250 },
  { id: 4, name: "DREAM Coin", tokenSymbol: "DREAM", holders: 850 },
];

const MOCK_LAND = [
  { id: 1, name: "Central Plaza", district: 1, x: 120, z: 240 },
  { id: 2, name: null, district: 3, x: 450, z: 680 },
];
