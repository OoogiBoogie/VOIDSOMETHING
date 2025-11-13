'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Bot, 
  Database, 
  Shield, 
  TrendingUp, 
  Zap,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  MemoryStick,
} from 'lucide-react';
import { aiAgentService } from '@/services/aiAgentService';
import type { AIAgent, AIAgentType, AgentStatus } from '@/services/aiAgentTypes';

export default function AIControlPanel() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgentType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await aiAgentService.getAllAgents();
      setAgents(data);
      if (!selectedAgent && data.length > 0) {
        setSelectedAgent(data[0].type);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentStatus = async (type: AIAgentType, currentStatus: AgentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await aiAgentService.setAgentStatus(type, newStatus);
      await loadAgents();
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  const getAgentIcon = (type: AIAgentType) => {
    const icons = {
      vault: Database,
      emission: TrendingUp,
      mission: Zap,
      governance: Activity,
      security: Shield,
    };
    return icons[type] || Bot;
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'paused':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'maintenance':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const selectedAgentData = agents.find((a) => a.type === selectedAgent);

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#00FFA6] mb-2 flex items-center gap-3">
          <Bot className="w-8 h-8" />
          AI Operations Control Panel
        </h1>
        <p className="text-gray-400">Monitor and manage autonomous AI agents</p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {agents.map((agent) => {
          const Icon = getAgentIcon(agent.type);
          const isSelected = selectedAgent === agent.type;

          return (
            <button
              key={agent.type}
              onClick={() => setSelectedAgent(agent.type)}
              className={`p-4 border rounded-lg transition-all text-left ${
                isSelected
                  ? 'bg-[#00FFA6]/10 border-[#00FFA6]'
                  : 'bg-black/40 border-white/10 hover:border-[#00FFA6]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-6 h-6 ${isSelected ? 'text-[#00FFA6]' : 'text-gray-400'}`} />
                <span className={`px-2 py-1 text-xs font-bold rounded border ${getStatusColor(agent.status)}`}>
                  {agent.status.toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold text-white mb-1">{agent.name}</h3>
              <p className="text-xs text-gray-400 mb-3">{agent.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Actions/24h</p>
                  <p className="font-bold text-[#00FFA6]">{agent.metrics.actionsExecuted24h}</p>
                </div>
                <div>
                  <p className="text-gray-500">Success</p>
                  <p className="font-bold text-green-400">{agent.metrics.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Details */}
      {selectedAgentData && (
        <div className="space-y-6">
          {/* Agent Header */}
          <div className="border border-white/10 bg-black/40 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedAgentData.name}</h2>
                <p className="text-gray-400">{selectedAgentData.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Version</p>
                  <p className="text-sm font-bold text-white">{selectedAgentData.version}</p>
                </div>
                <button
                  onClick={() => toggleAgentStatus(selectedAgentData.type, selectedAgentData.status)}
                  className={`px-6 py-3 rounded font-bold transition-all flex items-center gap-2 ${
                    selectedAgentData.status === 'active'
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {selectedAgentData.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Agent
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Resume Agent
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="p-3 bg-black/40 border border-white/5 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-gray-400">Uptime</p>
                </div>
                <p className="text-lg font-bold text-white">{selectedAgentData.metrics.uptime}h</p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-400">Actions/24h</p>
                </div>
                <p className="text-lg font-bold text-white">{selectedAgentData.metrics.actionsExecuted24h}</p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#00FFA6]" />
                  <p className="text-xs text-gray-400">Success Rate</p>
                </div>
                <p className="text-lg font-bold text-white">{selectedAgentData.metrics.successRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <p className="text-xs text-gray-400">Avg Response</p>
                </div>
                <p className="text-lg font-bold text-white">{selectedAgentData.metrics.avgResponseTime}ms</p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-gray-400">CPU Usage</p>
                </div>
                <p className="text-lg font-bold text-white">{selectedAgentData.metrics.cpuUsage.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <MemoryStick className="w-4 h-4 text-pink-400" />
                  <p className="text-xs text-gray-400">Memory</p>
                </div>
                <p className="text-lg font-bold text-white">{selectedAgentData.metrics.memoryUsage}MB</p>
              </div>
            </div>
          </div>

          {/* Agent-Specific State */}
          <div className="border border-white/10 bg-black/40 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Agent State</h3>
            
            {selectedAgentData.type === 'vault' && 'poolHealth' in selectedAgentData.state && (
              <div>
                <h4 className="text-sm font-bold text-[#00FFA6] mb-3">Pool Health Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(selectedAgentData.state.poolHealth).map(([poolId, pool]) => (
                    <div key={poolId} className="p-4 bg-black/40 border border-white/5 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{poolId}</span>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          pool.status === 'healthy' ? 'bg-green-400/10 text-green-400' :
                          pool.status === 'warning' ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-red-400/10 text-red-400'
                        }`}>
                          {pool.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Days until depletion:</span>
                          <span className="text-white font-bold">{pool.daysUntilDepletion}</span>
                        </div>
                        {parseFloat(pool.recommendedRefill) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Recommended refill:</span>
                            <span className="text-[#00FFA6] font-bold">{parseFloat(pool.recommendedRefill).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAgentData.type === 'emission' && 'currentRates' in selectedAgentData.state && (
              <div>
                <h4 className="text-sm font-bold text-[#00FFA6] mb-3">Emission Rates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-black/40 border border-white/5 rounded">
                    <p className="text-sm text-gray-400 mb-2">Current VOID Rate</p>
                    <p className="text-2xl font-bold text-[#00FFA6]">{selectedAgentData.state.currentRates.voidPerAction}</p>
                    <p className="text-xs text-gray-500">per action</p>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded">
                    <p className="text-sm text-gray-400 mb-2">Current SIGNAL Rate</p>
                    <p className="text-2xl font-bold text-yellow-400">{selectedAgentData.state.currentRates.signalPerAction}</p>
                    <p className="text-xs text-gray-500">per action</p>
                  </div>
                </div>
                {selectedAgentData.state.adjustmentRecommendation.needed && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-200 mb-1">Adjustment Recommended</p>
                      <p className="text-xs text-yellow-100">{selectedAgentData.state.adjustmentRecommendation.reason}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedAgentData.type === 'mission' && 'activeMissions' in selectedAgentData.state && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">Active Missions</p>
                  <p className="text-2xl font-bold text-white">{selectedAgentData.state.activeMissions}</p>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-400">{selectedAgentData.state.completionRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">Avg Participation</p>
                  <p className="text-2xl font-bold text-purple-400">{selectedAgentData.state.avgParticipation}</p>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">vXP Budget</p>
                  <p className="text-2xl font-bold text-[#00FFA6]">{selectedAgentData.state.rewardsBudget.vxp.toLocaleString()}</p>
                </div>
              </div>
            )}

            {selectedAgentData.type === 'governance' && 'proposalsAnalyzed' in selectedAgentData.state && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">Proposals Analyzed</p>
                  <p className="text-2xl font-bold text-white">{selectedAgentData.state.proposalsAnalyzed}</p>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">Auto-Vote</p>
                  <p className="text-2xl font-bold text-yellow-400">{selectedAgentData.state.autoVoteEnabled ? 'ON' : 'OFF'}</p>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">Votes Cast/24h</p>
                  <p className="text-2xl font-bold text-blue-400">{selectedAgentData.state.votesCast24h}</p>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">Analysis Queue</p>
                  <p className="text-2xl font-bold text-purple-400">{selectedAgentData.state.analysisQueue}</p>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded">
                  <p className="text-sm text-gray-400 mb-1">Avg Confidence</p>
                  <p className="text-2xl font-bold text-green-400">{selectedAgentData.state.averageConfidence.toFixed(1)}%</p>
                </div>
              </div>
            )}

            {selectedAgentData.type === 'security' && 'threatLevel' in selectedAgentData.state && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-black/40 border border-white/5 rounded">
                    <p className="text-sm text-gray-400 mb-1">Threat Level</p>
                    <p className={`text-2xl font-bold ${
                      selectedAgentData.state.threatLevel === 'green' ? 'text-green-400' :
                      selectedAgentData.state.threatLevel === 'yellow' ? 'text-yellow-400' :
                      selectedAgentData.state.threatLevel === 'orange' ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {selectedAgentData.state.threatLevel.toUpperCase()}
                    </p>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded">
                    <p className="text-sm text-gray-400 mb-1">Active Threats</p>
                    <p className="text-2xl font-bold text-red-400">{selectedAgentData.state.activeThreats}</p>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded">
                    <p className="text-sm text-gray-400 mb-1">Detected/24h</p>
                    <p className="text-2xl font-bold text-yellow-400">{selectedAgentData.state.threatsDetected24h}</p>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded">
                    <p className="text-sm text-gray-400 mb-1">Contracts Monitored</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedAgentData.state.monitoredContracts}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Actions */}
          <div className="border border-white/10 bg-black/40 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Actions</h3>
            <div className="space-y-3">
              {selectedAgentData.recentActions.map((action) => (
                <div
                  key={action.id}
                  className="p-4 bg-black/40 border border-white/5 rounded hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          action.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                          action.status === 'executing' ? 'bg-blue-400/10 text-blue-400' :
                          action.status === 'failed' ? 'bg-red-400/10 text-red-400' :
                          'bg-yellow-400/10 text-yellow-400'
                        }`}>
                          {action.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          action.priority === 'critical' ? 'bg-red-400/10 text-red-400' :
                          action.priority === 'high' ? 'bg-orange-400/10 text-orange-400' :
                          action.priority === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-blue-400/10 text-blue-400'
                        }`}>
                          {action.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-white font-bold mb-1">{action.description}</p>
                      {action.result && (
                        <p className="text-xs text-gray-400">{action.result.message}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {new Date(action.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {action.executionTime && (
                    <div className="text-xs text-gray-500">
                      Execution time: {action.executionTime}ms
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
