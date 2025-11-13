'use client';

import React from 'react';

export const SignalsPanel: React.FC<{
  signals: any[];
  onOpenWindow: (type: string, props?: any) => void;
  theme: any;
}> = ({ signals, onOpenWindow }) => {
  const latest = signals.slice(0, 3);

  return (
    <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 px-3 pt-3 pb-2">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
          Signals ({signals.length})
        </h3>
        <button
          type="button"
          className="text-[0.6rem] text-emerald-300 hover:text-cyan-300"
          onClick={() => onOpenWindow('VOID_HUB', { tab: 'signals' })}
        >
          All ▸
        </button>
      </div>
      <div className="space-y-1 text-[0.7rem]">
        {latest.map((s) => (
          <div
            key={s.id}
            className="px-2 py-1 rounded-xl bg-black/60 border border-bio-silver/25"
          >
            <div className="text-emerald-300/85">{s.title || s.message}</div>
            <div className="text-[0.6rem] text-bio-silver/55">{s.timeAgo || 'now'}</div>
          </div>
        ))}
        {latest.length === 0 && (
          <p className="text-[0.7rem] text-bio-silver/50 italic">
            No active signals.
          </p>
        )}
      </div>
    </div>
  );
};
