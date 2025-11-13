'use client';

import React from 'react';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

export default function AgencyHub() {
  return (
    <section className="space-y-4">
      {/* Security status */}
      <div className="hud-card border-[#FF3A52]/30 bg-[#FF3A52]/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-[#FF3A52] flex items-center gap-2">
            <Shield className="w-4 h-4" />
            SECURITY STATUS
          </h2>
          <span className="hud-pill bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/40">
            ALL CLEAR
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-xl p-4 border border-[#FF3A52]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Threat Level</p>
            <p className="data-text text-[#00FF9D] text-xl">LOW</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#FF3A52]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Active Scans</p>
            <p className="data-text text-[#00D4FF] text-xl">24/7</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-[#FF3A52]/20">
            <p className="text-[0.7rem] text-[#C7D8FF]/60 mb-1">Blocked (24h)</p>
            <p className="data-text text-[#FF3A52] text-xl">0</p>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="hud-card border-[#FF3A52]/30 bg-[#FF3A52]/5">
        <h2 className="text-xs text-[#FF3A52] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          SECURITY LOG
        </h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[
            { time: '2m ago', event: 'Routine scan completed', status: 'success' },
            { time: '15m ago', event: 'Wallet connection verified', status: 'success' },
            { time: '1h ago', event: 'Transaction approved', status: 'success' },
            { time: '3h ago', event: 'Smart contract audit passed', status: 'success' },
            { time: '6h ago', event: 'Rate limit enforced', status: 'warning' },
          ].map((log, i) => (
            <div 
              key={i}
              className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-[#FF3A52]/10 hover:bg-black/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.status === 'success' ? 'bg-[#00FF9D]' : 
                  log.status === 'warning' ? 'bg-[#FFD700]' : 
                  'bg-[#FF3A52]'
                }`} />
                <div>
                  <p className="text-[0.75rem] text-[#C7D8FF]">{log.event}</p>
                  <p className="text-[0.65rem] text-[#C7D8FF]/60">{log.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="hud-card border-[#FF3A52]/30 bg-[#FF3A52]/5">
        <h2 className="text-xs text-[#FF3A52] mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          SYSTEM ALERTS
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#00FF9D]/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#00FF9D]" />
          </div>
          <p className="text-[#00FF9D] font-mono text-sm mb-1">All Systems Operational</p>
          <p className="text-[#C7D8FF]/60 text-xs">No active threats detected</p>
        </div>
      </div>

      {/* Protection stats */}
      <div className="hud-card border-[#FF3A52]/30 bg-[#FF3A52]/5">
        <h2 className="text-xs text-[#FF3A52] mb-3">PROTECTION STATS</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Uptime" value="99.98%" color="#00FF9D" />
          <StatCard label="Scans/Day" value="24,847" color="#00D4FF" />
          <StatCard label="Threats Blocked" value="0" color="#00FF9D" />
          <StatCard label="False Positives" value="0" color="#00FF9D" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-black/40 rounded-lg p-3 border border-[#FF3A52]/10">
      <p className="text-[0.65rem] text-[#C7D8FF]/60 mb-1">{label}</p>
      <p className="data-text text-lg" style={{ color }}>{value}</p>
    </div>
  );
}
