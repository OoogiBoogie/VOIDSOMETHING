'use client';

import React from 'react';

interface DefiOverviewWindowProps {
  defi?: any;
  onOpenWindow?: (type: string, props?: any) => void;
  onClose?: () => void;
}

export function DefiOverviewWindow({ defi, onOpenWindow }: DefiOverviewWindowProps) {
  const voidPrice = defi?.voidPrice ?? 0.0024;
  const voidChange24h = defi?.voidChange24h ?? 12.5;
  const psxPrice = defi?.psxPrice ?? 0.0018;
  const psxChange24h = defi?.psxChange24h ?? -3.2;
  const signalEpoch = defi?.epoch ?? 42;
  const emissionMultiplier = defi?.emissionMultiplier ?? 2.4;
  const tvl = defi?.tvl ?? 2847000;
  const vaults = defi?.vaults ?? MOCK_VAULTS;

  return (
    <div className="flex flex-col gap-4">
      {/* top stats row */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="VOID"
          value={`$${voidPrice.toFixed(4)}`}
          sub={`${voidChange24h >= 0 ? "+" : ""}${voidChange24h.toFixed(2)}%`}
          accent="void"
        />
        <StatCard
          label="PSX"
          value={`$${psxPrice.toFixed(4)}`}
          sub={`${psxChange24h >= 0 ? "+" : ""}${psxChange24h.toFixed(2)}%`}
          accent="psx"
        />
        <StatCard
          label="SIGNAL EPOCH"
          value={signalEpoch.toString()}
          sub={`${emissionMultiplier.toFixed(2)}× multiplier`}
          accent="signal"
        />
        <StatCard
          label="DEFI TVL"
          value={`$${tvl.toLocaleString()}`}
          sub="Total value locked"
          accent="defi"
        />
      </div>

      {/* vault grid */}
      <div className="mt-1 rounded-2xl bg-black/70 backdrop-blur-2xl border border-void-purple/60 shadow-[0_0_30px_rgba(124,58,237,0.7)] overflow-hidden">
        <div className="px-3 py-2 border-b border-bio-silver/30 flex items-center justify-between">
          <h3 className="text-[0.8rem] font-mono tracking-[0.25em] uppercase text-void-purple">
            Vault Matrix
          </h3>
          <span className="text-[0.65rem] text-bio-silver/60">
            FRAME / FEY / ZORA hooks · 1155 partners
          </span>
        </div>

        <div className="max-h-[42vh] overflow-y-auto">
          <table className="w-full text-[0.72rem] font-mono">
            <thead>
              <tr className="text-bio-silver/60 uppercase tracking-[0.18em] bg-black/70 sticky top-0">
                <th className="py-2 px-3 text-left">Vault</th>
                <th className="py-2 px-3 text-right">APR</th>
                <th className="py-2 px-3 text-right">TVL</th>
                <th className="py-2 px-3 text-right">Token</th>
                <th className="py-2 px-3 text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {vaults.map((v: any) => (
                <tr
                  key={v.id}
                  className="border-t border-bio-silver/15 hover:bg-void-deep/40 cursor-pointer transition"
                  onClick={() => onOpenWindow?.("vaultDetail", { vaultId: v.id })}
                >
                  <td className="py-2 px-3">
                    <span className="text-bio-silver/90">{v.name}</span>
                    <span className="block text-[0.6rem] text-bio-silver/50">
                      {v.strategyLabel}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-signal-green">
                    {v.apr.toFixed(2)}%
                  </td>
                  <td className="py-2 px-3 text-right text-bio-silver/80">
                    ${v.tvl.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-cyber-cyan">
                    {v.tokenSymbol}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <RiskPill level={v.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  const colors = {
    void: "from-void-purple to-signal-green",
    psx: "from-psx-blue to-bio-silver",
    signal: "from-signal-green to-cyber-cyan",
    defi: "from-void-purple to-psx-blue",
  }[accent] || "from-void-purple to-psx-blue";

  return (
    <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 relative overflow-hidden">
      <div
        className={`pointer-events-none absolute inset-[1px] rounded-2xl border border-transparent bg-gradient-to-br ${colors} opacity-40 mix-blend-screen`}
      />
      <div className="relative z-10 px-3 py-2 flex flex-col gap-1">
        <span className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          {label}
        </span>
        <span className="text-[0.9rem] text-bio-silver font-mono">{value}</span>
        {sub && (
          <span className="text-[0.65rem] text-bio-silver/60">{sub}</span>
        )}
      </div>
    </div>
  );
}

function RiskPill({ level }: { level: string }) {
  const label = level?.toUpperCase?.() ?? "N/A";
  const cls =
    level === "low"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/60"
      : level === "medium"
      ? "bg-amber-500/20 text-amber-300 border-amber-400/60"
      : "bg-rose-500/20 text-rose-300 border-rose-400/60";

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border text-[0.6rem] ${cls}`}
    >
      {label}
    </span>
  );
}

const MOCK_VAULTS = [
  { id: 1, name: "VOID/ETH LP", strategyLabel: "Auto-compound", apr: 145.2, tvl: 1250000, tokenSymbol: "VOID-ETH", riskLevel: "medium" },
  { id: 2, name: "PSX Staking", strategyLabel: "Single-side stake", apr: 89.5, tvl: 850000, tokenSymbol: "PSX", riskLevel: "low" },
  { id: 3, name: "SIGNAL Farm", strategyLabel: "Emission booster", apr: 220.7, tvl: 425000, tokenSymbol: "SIGNAL", riskLevel: "high" },
  { id: 4, name: "VOID Vault", strategyLabel: "Auto-restake", apr: 125.3, tvl: 322000, tokenSymbol: "VOID", riskLevel: "low" },
];
