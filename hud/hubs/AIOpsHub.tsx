'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap } from 'lucide-react';
import { aiAgentService } from '@/services/aiAgentService';

export default function AIOpsHub() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      const data = await aiAgentService.getAllAgents();
      setAgents(data);
    };
    loadAgents();
  }, []);

  const activeAgents = agents.filter(a => a.status === 'active').length;

  return (
    <section className="space-y-4">
      {/* AI overview */}
      <div className="hud-card-signal">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#00FF9D] flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            AI AGENTS · OVERVIEW
          </h2>
          <span className="hud-pill bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/40">
            {activeAgents} ACTIVE
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-xl p-4 border border-[#00FF9D]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Total Agents</p>
            <p className="data-text text-[#00FF9D] text-xl">{agents.length}</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#00FF9D]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Active Now</p>
            <p className="data-text text-[#00D4FF] text-xl">{activeAgents}</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#00FF9D]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Actions (24h)</p>
            <p className="data-text text-[#7C00FF] text-xl">
              {agents.reduce((sum, a) => sum + (a.metrics?.actions24h || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Agent status grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {agents.length > 0 ? (
          agents.map((agent, i) => (
            <AgentCard key={i} agent={agent} />
          ))
        ) : (
          <>
            <AgentCard agent={{ 
              name: 'Vault AI', 
              type: 'vault', 
              status: 'active',
              metrics: { uptime: 99.9, successRate: 98.5, actions24h: 1247 }
            }} />
            <AgentCard agent={{ 
              name: 'Emission AI', 
              type: 'emission', 
              status: 'active',
              metrics: { uptime: 100, successRate: 99.2, actions24h: 842 }
            }} />
            <AgentCard agent={{ 
              name: 'Mission AI', 
              type: 'mission', 
              status: 'active',
              metrics: { uptime: 99.8, successRate: 97.8, actions24h: 2104 }
            }} />
            <AgentCard agent={{ 
              name: 'Governance AI', 
              type: 'governance', 
              status: 'active',
              metrics: { uptime: 99.7, successRate: 98.9, actions24h: 456 }
            }} />
          </>
        )}
      </div>

      {/* System performance */}
      <div className="hud-card-signal">
        <h2 className="text-xs text-[#00FF9D] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          SYSTEM PERFORMANCE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Avg Uptime" value="99.8%" color="#00FF9D" />
          <StatCard label="Success Rate" value="98.1%" color="#00D4FF" />
          <StatCard label="Avg Response" value="42ms" color="#7C00FF" />
          <StatCard label="CPU Usage" value="34%" color="#3AA3FF" />
        </div>
      </div>
    </section>
  );
}

function AgentCard({ agent }: { agent: any }) {
  const typeColors: Record<string, string> = {
    vault: '#00D4FF',
    emission: '#7C00FF',
    mission: '#00FF9D',
    governance: '#3AA3FF',
    security: '#FF3A52',
  };

  const color = typeColors[agent.type] || '#00FF9D';

  return (
    <div 
      className="bg-black/40 rounded-xl p-4 border hover:shadow-lg transition-all"
      style={{ borderColor: `${color}40` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: agent.status === 'active' ? '#00FF9D' : '#FF3A52' }}
          />
          <h3 className="text-sm font-display uppercase" style={{ color }}>
            {agent.name}
          </h3>
        </div>
        <span className="text-[0.6rem] font-mono text-[#C7D8FF]/60 uppercase">
          {agent.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[0.7rem]">
        <div>
          <p className="text-[#C7D8FF]/60 mb-1">Uptime</p>
          <p className="data-text text-[#00FF9D]">
            {agent.metrics?.uptime?.toFixed(1) || '99.9'}%
          </p>
        </div>
        <div>
          <p className="text-[#C7D8FF]/60 mb-1">Success</p>
          <p className="data-text text-[#00D4FF]">
            {agent.metrics?.successRate?.toFixed(1) || '98.5'}%
          </p>
        </div>
        <div>
          <p className="text-[#C7D8FF]/60 mb-1">Actions</p>
          <p className="data-text" style={{ color }}>
            {agent.metrics?.actions24h || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-black/40 rounded-lg p-3 border border-[#00FF9D]/10">
      <p className="text-[0.65rem] text-[#C7D8FF]/60 mb-1">{label}</p>
      <p className="data-text text-lg" style={{ color }}>{value}</p>
    </div>
  );
}
