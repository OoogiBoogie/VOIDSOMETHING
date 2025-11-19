'use client';

import { TerminalIntro } from '@/components/intro/TerminalIntro';
import { useState } from 'react';

export default function TestSimplePage() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <TerminalIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono p-8">
      <h1 className="text-2xl mb-4">✓ Test Page Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <p className="mt-4">The issue is likely in:</p>
      <ul className="list-disc ml-8 mt-2">
        <li>Privy Provider initialization</li>
        <li>Wagmi configuration</li>
        <li>VoidRuntimeProvider</li>
      </ul>
      <p className="mt-4 text-yellow-400">Visit / to test main app</p>
    </div>
  );
}
