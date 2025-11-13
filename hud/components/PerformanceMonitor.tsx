'use client';

/**
 * PERFORMANCE MONITOR - Real-time FPS & Rendering Stats
 * Shows FPS, memory usage, render count for stress testing
 */

import React, { useEffect, useState, useRef } from 'react';
import { Activity, Zap, Database } from 'lucide-react';

interface PerformanceStats {
  fps: number;
  avgFps: number;
  renderCount: number;
  memory: number;
  lastFrameTime: number;
}

export default function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    avgFps: 60,
    renderCount: 0,
    memory: 0,
    lastFrameTime: 16.67
  });
  const [visible, setVisible] = useState(false);
  
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameRef = useRef(performance.now());
  const renderCountRef = useRef(0);

  useEffect(() => {
    // Toggle with Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setVisible(v => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!visible) return;

    let animationFrameId: number;

    const measurePerformance = () => {
      const now = performance.now();
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      renderCountRef.current++;

      // Track frame times
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculate FPS
      const currentFps = Math.round(1000 / delta);
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const avgFps = Math.round(1000 / avgFrameTime);

      // Memory usage (if available)
      let memory = 0;
      if ((performance as any).memory) {
        memory = Math.round((performance as any).memory.usedJSHeapSize / 1048576); // MB
      }

      setStats({
        fps: currentFps,
        avgFps,
        renderCount: renderCountRef.current,
        memory,
        lastFrameTime: delta
      });

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    animationFrameId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(animationFrameId);
  }, [visible]);

  if (!visible) return null;

  const fpsColor = stats.fps >= 50 ? 'text-green-400' : stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400';
  const memoryColor = stats.memory < 100 ? 'text-green-400' : stats.memory < 200 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed top-20 right-6 z-[10000] bg-black/90 backdrop-blur-xl border-2 border-cyan-400/50 rounded-lg p-4 font-mono text-xs min-w-[280px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-400/30">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-bold">PERFORMANCE</span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">FPS:</span>
          <div className="flex items-center gap-2">
            <Zap className={`w-3 h-3 ${fpsColor}`} />
            <span className={`${fpsColor} font-bold`}>{stats.fps}</span>
            <span className="text-gray-500">({stats.avgFps} avg)</span>
          </div>
        </div>

        {/* Frame Time */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Frame Time:</span>
          <span className="text-white">{stats.lastFrameTime.toFixed(2)}ms</span>
        </div>

        {/* Render Count */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Renders:</span>
          <span className="text-white">{stats.renderCount.toLocaleString()}</span>
        </div>

        {/* Memory */}
        {stats.memory > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Memory:</span>
            <div className="flex items-center gap-2">
              <Database className={`w-3 h-3 ${memoryColor}`} />
              <span className={memoryColor}>{stats.memory} MB</span>
            </div>
          </div>
        )}

        {/* Performance Grade */}
        <div className="mt-3 pt-2 border-t border-cyan-400/30">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Grade:</span>
            <span className={`font-bold ${
              stats.avgFps >= 55 ? 'text-green-400' :
              stats.avgFps >= 40 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {stats.avgFps >= 55 ? 'EXCELLENT' : stats.avgFps >= 40 ? 'GOOD' : 'POOR'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-cyan-400/30 text-[0.65rem] text-gray-500 text-center">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}
