'use client';

import React from 'react';

export const GlobalChatPreview: React.FC<{
  messages: any[];
  onOpenFullChat: () => void;
  triggerFX?: (fx: string, payload?: any) => void;
}> = ({ messages, onOpenFullChat, triggerFX }) => {
  const lastMessages = [...(messages ?? [])].slice(-3);

  return (
    <div className="border-t border-bio-silver/30 px-3 pt-2 pb-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70">
          Global Chat
        </h3>
        <button
          type="button"
          className="text-[0.6rem] text-emerald-300 hover:text-cyan-300"
          onClick={() => {
            triggerFX?.('chatOpen', { channel: 'GLOBAL' });
            onOpenFullChat();
          }}
        >
          Open ▸
        </button>
      </div>
      <div className="space-y-0.5 text-[0.7rem] text-bio-silver/80">
        {lastMessages.length === 0 && (
          <p className="text-bio-silver/50 italic">channel is quiet…</p>
        )}
        {lastMessages.map((m) => (
          <p key={m.id} className="truncate">
            <span className="text-emerald-300/85">{m.user ?? 'anon'}: </span>
            <span>{m.text}</span>
          </p>
        ))}
      </div>
    </div>
  );
};
