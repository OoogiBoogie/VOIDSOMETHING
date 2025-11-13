'use client';

import React from 'react';

export const JobBoardPanel: React.FC<{
  jobs: any[];
  onOpenWindow: (type: string, props?: any) => void;
  triggerFX?: (fx: string, payload?: any) => void;
}> = ({ jobs, onOpenWindow, triggerFX }) => {
  const limited = jobs.slice(0, 2);

  return (
    <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 px-3 pt-3 pb-2">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
          Job Board ({jobs.length})
        </h3>
        <button
          type="button"
          className="text-[0.6rem] text-rose-300 hover:text-emerald-300"
          onClick={() => {
            triggerFX?.('windowOpen', { type: 'AGENCY_BOARD' });
            onOpenWindow('AGENCY_BOARD', {});
          }}
        >
          The Agency ▸
        </button>
      </div>
      <div className="space-y-1 text-[0.7rem]">
        {limited.map((job) => (
          <button
            key={job.id}
            type="button"
            className="w-full text-left px-2 py-1.5 rounded-xl bg-black/60 border border-bio-silver/25 hover:border-rose-300/70 transition flex items-center justify-between"
            onClick={() => onOpenWindow('JOB_DETAIL', { jobId: job.id })}
          >
            <div>
              <div className="font-medium">{job.title}</div>
              <div className="text-[0.6rem] text-bio-silver/55">
                {job.reward} {job.token ?? 'PSX'}
              </div>
            </div>
            <span className="text-[0.6rem] text-bio-silver/50">
              {job.timeAgo ?? 'new'}
            </span>
          </button>
        ))}
        {limited.length === 0 && (
          <p className="text-[0.7rem] text-bio-silver/50 italic">
            No active gigs. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
};
