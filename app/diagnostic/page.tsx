'use client';

import { useState, useEffect } from 'react';

export default function DiagnosticPage() {
  const [status, setStatus] = useState<string>('Checking...');
  const [envVars, setEnvVars] = useState<any>({});
  const [configStatus, setConfigStatus] = useState<string>('Loading...');

  useEffect(() => {
    // Check environment variables
    const env = {
      seasonalBurnUI: process.env.NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI,
      burnUtilSeasonal: process.env.NEXT_PUBLIC_VOID_BURN_UTILITY_SEASONAL,
      xpRewardSeasonal: process.env.NEXT_PUBLIC_XP_REWARD_SYSTEM_SEASONAL,
      seasonStartBlock: process.env.NEXT_PUBLIC_SEASONAL_BURN_SEASON_START_BLOCK,
    };
    setEnvVars(env);

    if (env.seasonalBurnUI === 'true') {
      setStatus('✅ Feature flag enabled');
    } else {
      setStatus('❌ Feature flag disabled (expected: true)');
    }

    // Try loading config
    import('@/config/burnContractsSeasonal')
      .then(() => {
        setConfigStatus('✅ Config loaded successfully');
      })
      .catch((err) => {
        setConfigStatus(`❌ Config error: ${err.message}`);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#0a0a0a', color: '#00ff88', minHeight: '100vh' }}>
      <h1>🔍 Seasonal Burn Diagnostic</h1>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88' }}>
        <h2>Feature Flag Status</h2>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{status}</p>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88' }}>
        <h2>Environment Variables</h2>
        <pre style={{ overflow: 'auto' }}>{JSON.stringify(envVars, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88' }}>
        <h2>Config Status</h2>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{configStatus}</p>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,204,0,0.1)', border: '1px solid #ffcc00' }}>
        <h2>⚠️ If config error shows:</h2>
        <ol>
          <li>Check browser console for detailed error</li>
          <li>Verify ABIs were extracted: check <code>contracts/abis/*.json</code></li>
          <li>Restart dev server after .env changes</li>
        </ol>
      </div>
    </div>
  );
}
