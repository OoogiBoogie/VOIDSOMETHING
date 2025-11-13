'use client';

/**
 * JOB BOARD PANEL - Red box showing available gigs/jobs
 */

import React from 'react';
import { Briefcase } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  reward: string;
  type: 'gig' | 'grant' | 'bounty';
}

interface JobBoardPanelProps {
  jobs: Job[];
}

export default function JobBoardPanel({ jobs = [] }: JobBoardPanelProps) {
  return (
    <div className="rounded-2xl bg-black/80 border border-rose-500/60 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="w-3.5 h-3.5 text-rose-400" />
        <div className="text-[10px] font-mono tracking-[0.2em] text-rose-300 uppercase">
          JOB BOARD ({jobs.length})
        </div>
      </div>

      <div className="space-y-1.5 max-h-28 overflow-y-auto">
        {jobs.slice(0, 3).map((job) => (
          <button
            key={job.id}
            className="w-full text-left rounded-xl bg-black/70 border border-rose-500/30 px-2.5 py-1.5 hover:border-rose-400/60 transition-colors"
          >
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-200 truncate flex-1">{job.title}</span>
              <span className="text-emerald-300 ml-2">{job.reward}</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 uppercase">
              {job.type}
            </div>
          </button>
        ))}

        {jobs.length === 0 && (
          <div className="text-[11px] text-rose-400/40 italic text-center py-2">
            no active jobs
          </div>
        )}
      </div>
    </div>
  );
}
