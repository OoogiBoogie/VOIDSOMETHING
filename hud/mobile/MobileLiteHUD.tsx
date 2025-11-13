'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  useVoidEmitter, 
  useVoidVault, 
  useClaimableRewards,
  useCreatorRoyalties,
  useVotingPower 
} from '@/hooks/useVoidEngine';
import { useGamification } from '@/hooks/useGamification';
import { 
  Zap, 
  Wallet, 
  Palette, 
  Vote, 
  Shield, 
  Cpu,
  TrendingUp,
  Target,
  ChevronRight
} from 'lucide-react';

type MobileTab = 'overview' | 'missions' | 'vault' | 'creator' | 'dao' | 'ai';

export default function MobileLiteHUD() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<MobileTab>('overview');

  // Real data hooks
  const { vxp } = useVoidEmitter(address || '');
  const { positions } = useVoidVault(address || '');
  const { rewards } = useClaimableRewards(address || '');
  const { royalties } = useCreatorRoyalties(address || '');
  const { votingPower } = useVotingPower(address || '');
  const gamification = useGamification(address || '');

  // Calculated values
  const level = vxp ? Math.floor(vxp.total / 5000) + 1 : 7;
  const currentXP = vxp?.total || 14820;
  const streakDays = 4; // TODO: Get from gamification.streak when available
  const totalStaked = positions?.reduce((sum, p) => sum + parseFloat(p.stakedAmount), 0) || 1250;
  const pendingRewards = positions?.reduce((sum, p) => 
    sum + p.pendingRewards.reduce((s, r) => s + parseFloat(r.amount), 0), 0
  ) || 12.4;
  const claimableCreate = royalties ? parseFloat(royalties.claimable) : 0;
  const totalPower = votingPower?.totalPower || 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="min-h-screen w-full void-gradient pb-20 pointer-events-auto">
        {/* Mobile header - compact */}
        <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-[#00FF9D]/30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-lg text-[#00FF9D] uppercase tracking-wider">
              VOID HUD
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-[#C7D8FF]/80">ONLINE</span>
            </div>
          </div>
          
          {/* Level bar - always visible */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF9D]/60 to-[#7C00FF]/70" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-display text-[#00FF9D]">LVL {level}</span>
                <span className="font-mono text-[#C7D8FF]/60">{currentXP.toLocaleString()} vXP</span>
              </div>
              <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div 
                  className="h-full"
                  style={{
                    width: `${((currentXP % 5000) / 5000) * 100}%`,
                    background: 'linear-gradient(to right, #00FF9D, #00D4FF, #7C00FF)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main scrollable content */}
      <div className="px-4 py-4 space-y-3">
        {activeTab === 'overview' && (
          <>
            {/* Quick stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <TapCard
                icon={<Zap className="w-5 h-5" />}
                label="Streak"
                value={`${streakDays} days`}
                color="#00FF9D"
                onClick={() => setActiveTab('missions')}
              />
              <TapCard
                icon={<Wallet className="w-5 h-5" />}
                label="Staked"
                value={`${totalStaked.toLocaleString()} VOID`}
                color="#7C00FF"
                onClick={() => setActiveTab('vault')}
              />
              <TapCard
                icon={<Palette className="w-5 h-5" />}
                label="Royalties"
                value={`${claimableCreate.toFixed(0)} CREATE`}
                color="#00D4FF"
                onClick={() => setActiveTab('creator')}
              />
              <TapCard
                icon={<Vote className="w-5 h-5" />}
                label="Voting Power"
                value={totalPower.toLocaleString()}
                color="#3AA3FF"
                onClick={() => setActiveTab('dao')}
              />
            </div>

            {/* Active missions - big tappable */}
            <div className="hud-card-signal active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-display text-[#00FF9D] uppercase tracking-wider">
                  Active Missions
                </h2>
                <button 
                  onClick={() => setActiveTab('missions')}
                  className="text-[#00FF9D] text-xs uppercase tracking-wider flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                <MissionRow title="Explore new district" reward={35} progress={0.4} />
                <MissionRow title="Support creator drop" reward={50} progress={0.33} />
              </div>
            </div>

            {/* Vault summary - big tappable */}
            <div 
              className="hud-card-void active:scale-[0.98] transition-transform"
              onClick={() => setActiveTab('vault')}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-display text-[#7C00FF] uppercase tracking-wider">
                  Vault Rewards
                </h2>
                <span className="text-xs font-mono text-[#00FF9D]">
                  +{pendingRewards.toFixed(1)} VOID
                </span>
              </div>
              <button className="w-full py-3 bg-[#7C00FF]/20 active:bg-[#7C00FF]/30 border border-[#7C00FF]/60 rounded-xl text-[#7C00FF] font-display text-sm uppercase tracking-wider transition-all">
                Claim Rewards
              </button>
            </div>

            {/* Recent activity feed */}
            <div className="hud-card border-[#00FF9D]/20">
              <h2 className="text-sm font-display text-[#00FF9D] uppercase tracking-wider mb-3">
                Recent Activity
              </h2>
              <div className="space-y-2 text-xs">
                <ActivityItem text="Mission completed" value="+35 SIGNAL" time="2m ago" />
                <ActivityItem text="Vault rewards claimed" value="+12.4 VOID" time="1h ago" />
                <ActivityItem text="Creator drop sold" value="+45 CREATE" time="3h ago" />
              </div>
            </div>
          </>
        )}

        {activeTab === 'missions' && (
          <>
            <BackButton onClick={() => setActiveTab('overview')} />
            <MissionsView />
          </>
        )}

        {activeTab === 'vault' && (
          <>
            <BackButton onClick={() => setActiveTab('overview')} />
            <VaultView positions={positions} pendingRewards={pendingRewards} />
          </>
        )}

        {activeTab === 'creator' && (
          <>
            <BackButton onClick={() => setActiveTab('overview')} />
            <CreatorView royalties={royalties} />
          </>
        )}

        {activeTab === 'dao' && (
          <>
            <BackButton onClick={() => setActiveTab('overview')} />
            <DAOView votingPower={votingPower} />
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <BackButton onClick={() => setActiveTab('overview')} />
            <AIView />
          </>
        )}
      </div>

      {/* Bottom navigation - fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-[#00FF9D]/30">
        <div className="grid grid-cols-6 gap-1 px-2 py-2">
          <NavButton 
            icon={<Target className="w-5 h-5" />}
            label="Home"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <NavButton 
            icon={<Zap className="w-5 h-5" />}
            label="Missions"
            active={activeTab === 'missions'}
            onClick={() => setActiveTab('missions')}
          />
          <NavButton 
            icon={<Wallet className="w-5 h-5" />}
            label="Vault"
            active={activeTab === 'vault'}
            onClick={() => setActiveTab('vault')}
          />
          <NavButton 
            icon={<Palette className="w-5 h-5" />}
            label="Creator"
            active={activeTab === 'creator'}
            onClick={() => setActiveTab('creator')}
          />
          <NavButton 
            icon={<Vote className="w-5 h-5" />}
            label="DAO"
            active={activeTab === 'dao'}
            onClick={() => setActiveTab('dao')}
          />
          <NavButton 
            icon={<Cpu className="w-5 h-5" />}
            label="AI"
            active={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
        </div>
      </nav>
    </div>
    </div>
  );
}

// Reusable components
function TapCard({ 
  icon, 
  label, 
  value, 
  color, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-black/70 backdrop-blur-xl border rounded-2xl p-4 active:scale-95 transition-transform"
      style={{ borderColor: `${color}40` }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs uppercase tracking-wider font-display">{label}</span>
      </div>
      <p className="text-lg font-mono font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function MissionRow({ title, reward, progress }: { title: string; reward: number; progress: number }) {
  return (
    <div className="flex items-center justify-between p-2 bg-black/40 rounded-lg">
      <div className="flex-1">
        <p className="text-xs text-[#C7D8FF] mb-1">{title}</p>
        <div className="h-1 bg-black/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00FF9D]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <span className="ml-3 text-xs font-mono text-[#00FF9D]">+{reward}</span>
    </div>
  );
}

function ActivityItem({ text, value, time }: { text: string; value: string; time: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#00FF9D]/10 last:border-0">
      <div>
        <p className="text-[#C7D8FF]">{text}</p>
        <p className="text-[0.65rem] text-[#C7D8FF]/50">{time}</p>
      </div>
      <span className="font-mono text-[#00FF9D]">{value}</span>
    </div>
  );
}

function NavButton({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-[#00FF9D]/20 text-[#00FF9D]' 
          : 'text-[#C7D8FF]/50 active:bg-[#00FF9D]/10'
      }`}
    >
      {icon}
      <span className="text-[0.6rem] uppercase tracking-wider font-mono">{label}</span>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-[#00FF9D] text-sm uppercase tracking-wider mb-4"
    >
      <ChevronRight className="w-4 h-4 rotate-180" />
      Back
    </button>
  );
}

// View components
function MissionsView() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-display text-[#00FF9D] uppercase tracking-wider">Active Missions</h2>
      {[
        { title: 'Explore a new district', reward: 35, progress: 0.4, time: '2h 15m' },
        { title: 'Complete 3 creator interactions', reward: 50, progress: 0.33, time: '5h 42m' },
        { title: 'Stake into any vault', reward: 20, progress: 0.7, time: '1h 08m' },
      ].map((mission, i) => (
        <div key={i} className="hud-card-signal">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#C7D8FF]">{mission.title}</p>
            <span className="text-sm font-mono text-[#00FF9D]">+{mission.reward} SIGNAL</span>
          </div>
          <div className="mb-2">
            <div className="h-2 bg-black/60 rounded-full overflow-hidden">
              <div 
                className="h-full"
                style={{
                  width: `${mission.progress * 100}%`,
                  background: 'linear-gradient(to right, #00FF9D, #00D4FF)'
                }}
              />
            </div>
          </div>
          <p className="text-xs text-[#C7D8FF]/60">Time left: {mission.time}</p>
        </div>
      ))}
    </div>
  );
}

function VaultView({ positions, pendingRewards }: { positions: any; pendingRewards: number }) {
  const totalStaked = positions?.reduce((sum: number, p: any) => sum + parseFloat(p.stakedAmount), 0) || 1250;
  
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-display text-[#7C00FF] uppercase tracking-wider">Vault</h2>
      
      <div className="hud-card-void">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-[#C7D8FF]/60 mb-1">Total Staked</p>
            <p className="text-xl font-mono text-[#7C00FF]">{totalStaked.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[#C7D8FF]/60 mb-1">Pending</p>
            <p className="text-xl font-mono text-[#00FF9D]">+{pendingRewards.toFixed(1)}</p>
          </div>
        </div>
        <button className="w-full py-3 bg-[#00FF9D]/20 active:bg-[#00FF9D]/30 border border-[#00FF9D]/60 rounded-xl text-[#00FF9D] font-display text-sm uppercase tracking-wider">
          Claim All Rewards
        </button>
      </div>
    </div>
  );
}

function CreatorView({ royalties }: { royalties: any }) {
  const claimable = royalties ? parseFloat(royalties.claimable) : 0;
  const totalEarned = royalties ? parseFloat(royalties.totalEarned) : 0;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-display text-[#00D4FF] uppercase tracking-wider">Creator</h2>
      
      <div className="hud-card-cyber">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-[#C7D8FF]/60 mb-1">Total Earned</p>
            <p className="text-xl font-mono text-[#00D4FF]">{totalEarned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[#C7D8FF]/60 mb-1">Claimable</p>
            <p className="text-xl font-mono text-[#00FF9D]">{claimable.toFixed(0)}</p>
          </div>
        </div>
        <button className="w-full py-3 bg-[#00D4FF]/20 active:bg-[#00D4FF]/30 border border-[#00D4FF]/60 rounded-xl text-[#00D4FF] font-display text-sm uppercase tracking-wider">
          Claim Royalties
        </button>
      </div>
    </div>
  );
}

function DAOView({ votingPower }: { votingPower: any }) {
  const totalPower = votingPower?.totalPower || 0;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-display text-[#3AA3FF] uppercase tracking-wider">DAO</h2>
      
      <div className="hud-card-psx">
        <p className="text-xs text-[#C7D8FF]/60 mb-2">Your Voting Power</p>
        <p className="text-3xl font-mono text-[#3AA3FF] mb-4">{totalPower.toLocaleString()}</p>
        <button className="w-full py-3 bg-[#3AA3FF]/20 active:bg-[#3AA3FF]/30 border border-[#3AA3FF]/60 rounded-xl text-[#3AA3FF] font-display text-sm uppercase tracking-wider">
          View Proposals
        </button>
      </div>
    </div>
  );
}

function AIView() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-display text-[#00FF9D] uppercase tracking-wider">AI Agents</h2>
      
      <div className="hud-card-signal">
        <div className="space-y-2">
          <AIAgentRow name="Vault AI" status="active" actions={1247} />
          <AIAgentRow name="Mission AI" status="active" actions={2104} />
          <AIAgentRow name="Gov AI" status="active" actions={456} />
        </div>
      </div>
    </div>
  );
}

function AIAgentRow({ name, status, actions }: { name: string; status: string; actions: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00FF9D]" />
        <span className="text-sm text-[#C7D8FF]">{name}</span>
      </div>
      <span className="text-xs font-mono text-[#00FF9D]">{actions} actions</span>
    </div>
  );
}
