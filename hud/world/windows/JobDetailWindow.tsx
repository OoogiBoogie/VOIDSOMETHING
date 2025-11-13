'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Briefcase, ArrowLeft, CheckCircle, Users, Clock, Zap, Star, Shield, TrendingUp, AlertCircle, X } from 'lucide-react';
import { useScoreEvents } from '@/hooks/useScoreEvents';
import { useVoidQuests } from '@/hooks/useVoidQuests';
import { emitVoidEvent } from '@/lib/events/voidEvents';

// ================================
// TYPES
// ================================

export interface JobDetail {
  id: string;
  title: string;
  agency: {
    name: string;
    verified: boolean;
  };
  district: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  description: string;
  fullDescription: string[]; // Multiple paragraphs
  requirements: {
    minTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER';
    minXP?: number;
    skills?: string[];
    other?: string[];
  };
  rewards: {
    signal: number;
    xp: number;
    psxStake: number;
    bonus?: string;
  };
  metadata: {
    estimatedTime: string; // "2-4 hours"
    slots: { filled: number; total: number };
    status: 'OPEN' | 'IN_PROGRESS' | 'FILLED';
  };
  squad?: {
    id: string;
    name: string;
    members: number;
    slots: number;
  };
}

// ================================
// MOCK DATA EXPANSION
// ================================

function getJobDetail(jobId: string): JobDetail {
  // For demo: return detailed version of gig from AgencyBoardWindow
  return {
    id: jobId,
    title: 'Terminal Hack: Corporate Vault Breach',
    agency: {
      name: 'REDLINE SYNDICATE',
      verified: true,
    },
    district: 'NEON DISTRICT',
    difficulty: 'HARD',
    description: 'Infiltrate MegaCorp security and extract classified data without triggering alarms.',
    fullDescription: [
      'A high-stakes corporate espionage mission requiring advanced technical skills and stealth coordination.',
      'Your squad will need to breach MegaCorp\'s outer firewall, navigate their internal network, locate the vault servers, and extract the data before security protocols activate.',
      'This is a timed mission - you have 90 minutes from the moment you trigger the first alarm. Coordination with your squad is essential.',
      'Failure will result in a 24-hour lockout from REDLINE SYNDICATE gigs.',
    ],
    requirements: {
      minTier: 'SILVER',
      minXP: 500,
      skills: ['Hacking', 'Stealth', 'Network Security', 'Team Coordination'],
      other: ['Must have completed "Terminal Basics" tutorial', 'No active security violations'],
    },
    rewards: {
      signal: 850,
      xp: 1200,
      psxStake: 50,
      bonus: '+15% bonus for zero alarms triggered',
    },
    metadata: {
      estimatedTime: '2-4 hours',
      slots: { filled: 2, total: 4 },
      status: 'OPEN',
    },
    squad: {
      id: 'squad_redline_1',
      name: 'GHOST_OPS',
      members: 2,
      slots: 4,
    },
  };
}

// ================================
// MAIN COMPONENT
// ================================

export function JobDetailWindow({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const { address } = useAccount();
  const job = getJobDetail(jobId);
  const [applying, setApplying] = useState(false);
  
  const { applyGigXP, completeGigXP } = useScoreEvents();
  const { incrementQuestProgress } = useVoidQuests();

  const handleApply = async () => {
    if (!address) return;
    
    setApplying(true);
    
    try {
      // Mock mode: XP grant only
      // Live mode: Backend API call when deployed
      // await applyToJob(jobId);
      
      // Grant XP for application
      await applyGigXP(jobId);
      
      // Progress quests
      incrementQuestProgress('weekly_agency', 0); // Job Hunter quest
      incrementQuestProgress('milestone_first_gig', 0); // Freelancer milestone
      
      // Emit event for notifications
      emitVoidEvent({
        type: 'SCORE_EVENT',
        address,
        payload: {
          eventType: 'GIG_APPLIED',
          xpReward: 10,
          description: `Applied to ${job.title}`,
          metadata: { gigId: jobId },
        },
      });
      
      setTimeout(() => {
        alert('Application submitted! Check the Agency Board for status updates.');
        onClose();
      }, 1000);
    } catch (error) {
      console.error('[JobDetail] Apply failed:', error);
      setApplying(false);
    }
  };

  const handleJoinSquad = () => {
    // Mock mode: Alert notification
    // Live mode: Squad contract call when deployed
    // await joinSquad(job.squad.id);
    alert(`Joined squad: ${job.squad?.name}`);
    onClose();
  };

  // Difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'HARD':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'EXPERT':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  // Tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S_TIER':
        return 'text-amber-400';
      case 'GOLD':
        return 'text-yellow-400';
      case 'SILVER':
        return 'text-gray-300';
      case 'BRONZE':
        return 'text-orange-700';
      default:
        return 'text-gray-500';
    }
  };

  // Status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'IN_PROGRESS':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'FILLED':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/95 text-white font-mono border border-cyan-400/30">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-400/30 bg-cyan-950/20">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wider text-cyan-300">GIG DETAILS</h2>
        </div>

        <button onClick={onClose} className="p-1 hover:bg-cyan-400/10 rounded transition-colors">
          <X className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title + Agency */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-cyan-300">{job.title}</h1>
            <div
              className={`px-3 py-1 rounded border text-xs font-bold ${getDifficultyColor(
                job.difficulty
              )}`}
            >
              {job.difficulty}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-bold text-cyan-400">{job.agency.name}</span>
            {job.agency.verified && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            <span>•</span>
            <span>{job.district}</span>
            <span>•</span>
            <div className={`px-2 py-0.5 rounded border text-xs ${getStatusColor(job.metadata.status)}`}>
              {job.metadata.status}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-cyan-950/20 border border-cyan-400/30 rounded p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Clock className="w-3 h-3" />
              <span>Est. Time</span>
            </div>
            <p className="text-sm font-bold text-cyan-300">{job.metadata.estimatedTime}</p>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-400/30 rounded p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Users className="w-3 h-3" />
              <span>Slots</span>
            </div>
            <p className="text-sm font-bold text-cyan-300">
              {job.metadata.slots.filled}/{job.metadata.slots.total}
            </p>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-400/30 rounded p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Zap className="w-3 h-3" />
              <span>Min XP</span>
            </div>
            <p className="text-sm font-bold text-cyan-300">{job.requirements.minXP ?? 0}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            MISSION BRIEFING
          </h3>
          <div className="space-y-2">
            {job.fullDescription.map((para, i) => (
              <p key={i} className="text-sm text-gray-300 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div>
          <h3 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            REQUIREMENTS
          </h3>

          <div className="space-y-3">
            {/* Tier requirement */}
            {job.requirements.minTier && (
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${getTierColor(job.requirements.minTier)}`} />
                <span className="text-sm text-gray-400">
                  Minimum Tier:{' '}
                  <span className={`font-bold ${getTierColor(job.requirements.minTier)}`}>
                    {job.requirements.minTier.replace('_', '-')}
                  </span>
                </span>
              </div>
            )}

            {/* XP requirement */}
            {job.requirements.minXP && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">
                  Minimum XP: <span className="font-bold text-cyan-300">{job.requirements.minXP}</span>
                </span>
              </div>
            )}

            {/* Skills */}
            {job.requirements.skills && job.requirements.skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.skills.map((skill) => (
                    <div
                      key={skill}
                      className="px-2 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded text-xs text-cyan-300"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other requirements */}
            {job.requirements.other && job.requirements.other.length > 0 && (
              <div className="space-y-1">
                {job.requirements.other.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rewards */}
        <div>
          <h3 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            REWARDS
          </h3>

          <div className="space-y-3">
            {/* SIGNAL reward (primary) */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">SIGNAL Reward</p>
                  <p className="text-3xl font-bold text-cyan-300">{job.rewards.signal}</p>
                </div>
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              {job.rewards.bonus && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {job.rewards.bonus}
                </p>
              )}
            </div>

            {/* Secondary rewards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-950/20 border border-cyan-400/30 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">XP Earned</p>
                <p className="text-xl font-bold text-cyan-300">+{job.rewards.xp}</p>
              </div>

              <div className="bg-cyan-950/20 border border-cyan-400/30 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">PSX Stake Required</p>
                <p className="text-xl font-bold text-orange-400">{job.rewards.psxStake} PSX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Squad info (if squad-based gig) */}
        {job.squad && (
          <div className="bg-purple-950/20 border border-purple-400/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-purple-300">SQUAD MISSION</h3>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              Join squad <span className="font-bold text-purple-300">{job.squad.name}</span> to complete
              this mission.
            </p>
            <p className="text-xs text-gray-400">
              Current members: {job.squad.members}/{job.squad.slots}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER - Actions */}
      <div className="px-6 py-4 border-t border-cyan-400/30 bg-black/50 flex items-center gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700/50 border border-gray-600 text-gray-300 font-bold rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex-1" />

        {job.squad && (
          <button
            onClick={handleJoinSquad}
            className="px-4 py-2 bg-purple-500/20 border border-purple-400/50 text-purple-300 font-bold rounded hover:bg-purple-500/30 transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Join Squad
          </button>
        )}

        <button
          onClick={handleApply}
          disabled={applying || job.metadata.status === 'FILLED'}
          className="px-6 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {applying ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Briefcase className="w-4 h-4" />
              Apply to Gig
            </>
          )}
        </button>
      </div>
    </div>
  );
}
