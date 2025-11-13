'use client';

import React from 'react';

interface WorldMapWindowProps {
  world?: any;
  onOpenWindow?: (type: string, props?: any) => void;
  onClose?: () => void;
}

export function WorldMapWindow({ world, onOpenWindow }: WorldMapWindowProps) {
  const districts = world?.districts ?? MOCK_DISTRICTS;
  const playerCoords = world?.coordinates ?? world?.coords ?? { x: 120, z: 240 };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
            Current Position
          </div>
          <div className="text-[0.85rem] font-mono text-signal-green">
            ({playerCoords.x}, {playerCoords.z})
          </div>
        </div>
        <button
          type="button"
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-signal-green to-cyber-cyan text-void-black text-[0.7rem] font-mono tracking-[0.2em] hover:shadow-[0_0_20px_rgba(0,255,157,0.6)] transition"
          onClick={() => onOpenWindow?.("zones")}
        >
          My Land
        </button>
      </div>

      {/* big map grid */}
      <div className="flex-1 rounded-3xl bg-black/80 backdrop-blur-2xl border border-signal-green/60 shadow-[0_0_40px_rgba(0,255,157,0.7)] overflow-hidden flex">
        <div className="relative flex-1">
          {/* background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(0,255,157,0.2),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(124,0,255,0.3),transparent_55%)] opacity-60" />
          <div className="absolute inset-[8px] border border-bio-silver/30 grid grid-cols-12 grid-rows-8">
            {districts.map((d: any) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onOpenWindow?.("agencyBoard", { districtId: d.id })}
                className="relative border border-bio-silver/15 hover:border-signal-green/70 group transition"
                style={{
                  gridColumn: `${d.gridColStart} / ${d.gridColEnd}`,
                  gridRow: `${d.gridRowStart} / ${d.gridRowEnd}`,
                }}
              >
                <span className="absolute left-1 top-1 text-[0.55rem] text-bio-silver/70 group-hover:text-signal-green transition">
                  {d.name}
                </span>
                {d.isHot && (
                  <span className="absolute right-1 bottom-1 w-2 h-2 rounded-full bg-signal-green shadow-[0_0_10px_rgba(0,255,157,0.9)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* sidebar with filters */}
        <div className="w-56 border-l border-bio-silver/30 bg-black/85 flex flex-col">
          <div className="px-3 py-2 border-b border-bio-silver/30 text-[0.75rem] font-mono tracking-[0.22em] uppercase text-bio-silver/70">
            Filters
          </div>
          <div className="px-3 py-2 flex flex-col gap-2 text-[0.7rem]">
            <FilterRow label="Creator Hubs" color="cyber" />
            <FilterRow label="DeFi Vaults" color="void" />
            <FilterRow label="Agency Boards" color="red" />
            <FilterRow label="DAO Terminals" color="psx" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, color }: { label: string; color: string }) {
  const cls =
    color === "cyber"
      ? "bg-cyber-cyan"
      : color === "void"
      ? "bg-void-purple"
      : color === "psx"
      ? "bg-psx-blue"
      : "bg-red-500";

  return (
    <label className="flex items-center gap-2 cursor-pointer hover:text-bio-silver transition">
      <span className={`w-3 h-3 rounded-full ${cls}`} />
      <span className="text-bio-silver/80 text-[0.7rem]">{label}</span>
    </label>
  );
}

const MOCK_DISTRICTS = [
  { id: 1, name: "VOID CORE", gridColStart: 5, gridColEnd: 9, gridRowStart: 3, gridRowEnd: 6, isHot: true },
  { id: 2, name: "CREATOR ZONE", gridColStart: 1, gridColEnd: 5, gridRowStart: 1, gridRowEnd: 4, isHot: false },
  { id: 3, name: "DEFI DISTRICT", gridColStart: 9, gridColEnd: 13, gridRowStart: 1, gridRowEnd: 4, isHot: true },
  { id: 4, name: "AGENCY HQ", gridColStart: 1, gridColEnd: 5, gridRowStart: 5, gridRowEnd: 9, isHot: false },
  { id: 5, name: "DAO PLAZA", gridColStart: 9, gridColEnd: 13, gridRowStart: 5, gridRowEnd: 9, isHot: false },
];
