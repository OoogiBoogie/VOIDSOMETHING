'use client';

import React from 'react';

export const FriendsListPanel: React.FC<{
  friends: any[];
  nearby: any[];
  onOpenWindow: (type: string, props?: any) => void;
}> = ({ friends, nearby, onOpenWindow }) => {
  const friendsLimited = friends.slice(0, 4);
  const nearbyLimited = nearby.slice(0, 2);

  return (
    <div className="px-3 pt-3 pb-2">
      <h3 className="text-[0.7rem] font-mono tracking-[0.25em] uppercase text-bio-silver/70 mb-1.5">
        Friends ({friends.length})
      </h3>
      <div className="space-y-1.5">
        {friendsLimited.map((f) => (
          <button
            key={f.id}
            type="button"
            className="w-full text-left text-[0.7rem] px-2 py-1 rounded-xl bg-black/60 border border-bio-silver/25 hover:border-emerald-300/70 hover:bg-black/80 transition flex items-center justify-between"
            onClick={() => onOpenWindow('FRIENDS', { initialFriendId: f.id })}
          >
            <span className="truncate">{f.username || f.name}</span>
            <span className="text-[0.6rem] text-emerald-300/80">
              {f.online ? 'online' : 'offline'}
            </span>
          </button>
        ))}
        {friends.length > friendsLimited.length && (
          <button
            type="button"
            className="w-full text-[0.65rem] text-left text-bio-silver/60 hover:text-emerald-300 mt-0.5"
            onClick={() => onOpenWindow('FRIENDS', {})}
          >
            View all…
          </button>
        )}
      </div>

      {/* nearby */}
      {nearbyLimited.length > 0 && (
        <div className="mt-3">
          <h4 className="text-[0.65rem] font-mono tracking-[0.22em] uppercase text-bio-silver/60 mb-1">
            Nearby ({nearby.length})
          </h4>
          <div className="space-y-1">
            {nearbyLimited.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between text-[0.65rem] px-2 py-1 rounded-xl bg-black/50 border border-bio-silver/20"
              >
                <span className="truncate">{n.username || n.name}</span>
                <span className="text-bio-silver/50">{n.distance}m</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
