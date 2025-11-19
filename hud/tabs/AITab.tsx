'use client';

/**
 * AI TAB - Signal node, emissions, vault health
 * Shows: signal level, emission status, vault health overview
 * Data: Mock telemetry (ready for /api/ai/telemetry integration)
 */

import React from 'react';
import { useAccount } from 'wagmi';

interface AITabProps {
  onClose?: () => void;
}

export default function AITab({ onClose }: AITabProps) {
  const { address, isConnected } = useAccount();

  // Mock AI telemetry - ready to replace with API call
  const mockTelemetry = {
    signalLevel: 2.4,
    signalStrength: 78,
    lastPulse: '00:03:42 ago',
    syncStatus: 'Active',
    nextEpoch: '4h 23m',
    suggestedEmission: 12500,
    vaults: [
      { name: 'xVOID Staking Vault', status: 'HEALTHY', apr: 12.5, tvl: 450000, utilization: 67 },
      { name: 'LP Rewards Vault', status: 'HEALTHY', apr: 18.2, tvl: 280000, utilization: 52 },
      { name: 'Creator Vault', status: 'WARNING', apr: 8.1, tvl: 120000, utilization: 89 },
      { name: 'DAO Treasury', status: 'HEALTHY', apr: 3.1, tvl: 210000, utilization: 34 },
    ],
    predictedYields: [
      { vault: 'VOID Vault', prediction: '+2.4%', confidence: 87 },
      { vault: 'USDC LP', prediction: '+0.9%', confidence: 92 },
      { vault: 'DAO Treasury', prediction: 'steady', confidence: 95 },
    ],
    activeCiphers: [
      { name: 'The Signal', stage: 3, totalStages: 12, status: 'Decrypting' },
      { name: 'The Pact', stage: 0, totalStages: 8, status: 'Locked' },
      { name: 'USB Heist', stage: 12, totalStages: 12, status: 'Archived' },
    ],
  };

  if (!isConnected) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="text-4xl mb-2">🧠</div>
        <div className="text-lg font-bold text-signal-green uppercase tracking-wider">AI Signal Node</div>
        <div className="text-sm text-bio-silver/60 max-w-md">
          Connect with Privy to access the VOID AI network and decode signals.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          🧠 VOID SIGNAL NODE
        </div>
        <div className="text-[0.7rem] text-signal-green">
          System Online — Listening for Frequencies...
        </div>
      </div>

      {/* Signal Status */}
      <div className="p-4 border border-signal-green/40 rounded-lg bg-black/40 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-bio-silver/60 uppercase tracking-wider">Signal Level</div>
            <div className="text-3xl font-bold text-signal-green">{mockTelemetry.signalLevel.toFixed(1)}×</div>
            <div className="text-[0.65rem] text-bio-silver/60">Network intensity this epoch</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-bio-silver/60">199Hz Sync</div>
            <div className="text-sm font-bold text-signal-green">✅ {mockTelemetry.syncStatus}</div>
            <div className="text-[0.65rem] text-bio-silver/60">Last pulse: {mockTelemetry.lastPulse}</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[0.65rem] mb-1">
            <span className="text-bio-silver/60">Signal Strength</span>
            <span className="text-signal-green">{mockTelemetry.signalStrength}%</span>
          </div>
          <div className="h-2 bg-black/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-signal-green to-cyber-cyan animate-pulse"
              style={{ width: `${mockTelemetry.signalStrength}%` }}
            />
          </div>
        </div>
      </div>

      {/* Emission Status */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Emission Oracle</div>
        <div className="p-3 bg-black/40 border border-void-purple/40 rounded space-y-2">
          <div className="flex justify-between text-[0.7rem]">
            <span className="text-bio-silver/60">Next Epoch:</span>
            <span className="text-cyber-cyan">{mockTelemetry.nextEpoch}</span>
          </div>
          <div className="flex justify-between text-[0.7rem]">
            <span className="text-bio-silver/60">Suggested Emission Rate:</span>
            <span className="text-void-purple">{mockTelemetry.suggestedEmission.toLocaleString()} VOID / epoch</span>
          </div>
          <div className="pt-2 border-t border-bio-silver/20">
            <div className="text-[0.65rem] text-bio-silver/60">
              AI monitors network activity and suggests optimal emission rates to maintain economic balance.
            </div>
          </div>
        </div>
      </div>

      {/* Predicted Yield Curves */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Predicted Yield Curves</div>
        <div className="space-y-2">
          {mockTelemetry.predictedYields.map((pred, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-black/40 border border-bio-silver/20 rounded">
              <span className="text-[0.7rem] text-bio-silver">{pred.vault}</span>
              <div className="flex items-center gap-3">
                <span className={`text-[0.75rem] font-bold ${
                  pred.prediction.includes('+') ? 'text-signal-green' : 'text-bio-silver/60'
                }`}>
                  {pred.prediction}
                </span>
                <span className="text-[0.65rem] text-bio-silver/60">{pred.confidence}% confidence</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vault Health Overview */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Vault Health Monitor</div>
        <div className="space-y-2">
          {mockTelemetry.vaults.map((vault, i) => (
            <div key={i} className={`p-3 bg-black/40 border rounded ${
              vault.status === 'HEALTHY' ? 'border-signal-green/40' :
              vault.status === 'WARNING' ? 'border-yellow-500/40' :
              'border-red-500/40'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[0.75rem] font-bold text-bio-silver">{vault.name}</div>
                  <div className="text-[0.65rem] text-bio-silver/60">TVL: ${(vault.tvl / 1000).toFixed(0)}K • APR: {vault.apr}%</div>
                </div>
                <span className={`text-[0.6rem] px-2 py-0.5 border rounded ${
                  vault.status === 'HEALTHY' ? 'bg-signal-green/20 border-signal-green/40 text-signal-green' :
                  vault.status === 'WARNING' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
                  'bg-red-500/20 border-red-500/40 text-red-500'
                }`}>
                  {vault.status}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[0.65rem] mb-1">
                  <span className="text-bio-silver/60">Utilization</span>
                  <span className="text-bio-silver">{vault.utilization}%</span>
                </div>
                <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      vault.utilization > 85 ? 'bg-yellow-500' :
                      vault.utilization > 95 ? 'bg-red-500' :
                      'bg-gradient-to-r from-signal-green to-cyber-cyan'
                    }`}
                    style={{ width: `${vault.utilization}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Ciphers */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Active Ciphers</div>
        <div className="space-y-2">
          {mockTelemetry.activeCiphers.map((cipher, i) => (
            <div key={i} className="p-3 bg-black/40 border border-bio-silver/20 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[0.75rem] font-bold text-void-purple">{cipher.name}</span>
                <span className="text-[0.65rem] text-bio-silver/60">{cipher.status}</span>
              </div>
              <div>
                <div className="flex justify-between text-[0.65rem] mb-1">
                  <span className="text-bio-silver/60">Progress</span>
                  <span className="text-cyber-cyan">Stage {cipher.stage}/{cipher.totalStages}</span>
                </div>
                <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-void-purple to-cyber-cyan"
                    style={{ width: `${(cipher.stage / cipher.totalStages) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-3 py-2 px-4 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all">
          [ Decode Next Transmission ]
        </button>
      </div>

      {/* World Event Integration Info */}
      <div className="p-3 bg-void-purple/10 border border-void-purple/30 rounded text-[0.65rem] text-bio-silver/60">
        <div className="text-void-purple mb-1 font-bold">🧩 World Event Integration</div>
        <div>• AI Ciphers affect governance proposals</div>
        <div>• Users completing Ciphers gain XP + yield boosts</div>
        <div>• Signal strength modulates emission rates</div>
      </div>
    </div>
  );
}
