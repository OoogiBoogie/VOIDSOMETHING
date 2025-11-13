'use client';

import React from 'react';
import WorldMissionsPanel from '../components/WorldMissionsPanel';
import { FriendsListPanel } from '../panels/FriendsListPanel';
import { GlobalChatPreview } from '../panels/GlobalChatPreview';
import { SignalsPanel } from '../panels/SignalsPanel';

export const LeftRail: React.FC<any> = ({
  snapshot,
  chatState,
  hubMode,
  hasNearbyPlayers,
  onOpenWindow,
  triggerFX,
  theme,
}) => {
  const world = snapshot.world ?? {};
  const friends = snapshot.friends ?? [];
  const signals = snapshot.notifications ?? snapshot.signals ?? [];
  const messages = chatState?.GLOBAL ?? snapshot.chat?.global ?? [];

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* WORLD MISSIONS */}
      <WorldMissionsPanel
        missions={snapshot.missions ?? world.missions ?? []}
      />

      {/* FRIENDS + GLOBAL CHAT SNUG TOGETHER */}
      <div className="rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 overflow-hidden">
        <FriendsListPanel
          friends={friends}
          nearby={snapshot.nearby ?? world.nearbyPlayersList ?? []}
          onOpenWindow={onOpenWindow}
        />

        {/* global chat preview: last few msgs, no scrollbar */}
        <GlobalChatPreview
          messages={messages}
          onOpenFullChat={() => onOpenWindow('FRIENDS', {})}
          triggerFX={triggerFX}
        />
      </div>

      {/* SIGNALS / NOTIFS – like small "Signals app" */}
      <SignalsPanel signals={signals} onOpenWindow={onOpenWindow} theme={theme} />
    </div>
  );
};
