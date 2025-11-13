/**
 * useWorldState Hook
 * Manages player position, chat, parties, friends, and world entities
 */

import { useState, useEffect, useCallback } from 'react';
import { worldService } from '@/services/worldService';
import type {
  PlayerPosition,
  ChatMessage,
  Party,
  Friendship,
  WorldEvent,
} from '@/services/worldService';

export interface UseWorldStateReturn {
  // Player state
  position: PlayerPosition | null;
  currentParcelId: string | null;
  updatePosition: (pos: PlayerPosition) => Promise<void>;

  // Chat
  chatMessages: ChatMessage[];
  sendMessage: (text: string, channel?: string) => Promise<void>;

  // Party
  currentParty: Party | null;
  createParty: (name: string) => Promise<Party>;
  joinParty: (partyId: string) => Promise<void>;
  leaveParty: () => Promise<void>;
  inviteToParty: (userId: string) => Promise<void>;

  // Friends
  friends: Friendship[];
  addFriend: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;

  // Events
  nearbyEvents: WorldEvent[];
  allEvents: WorldEvent[];
  rsvpEvent: (eventId: string) => Promise<void>;

  // Utility
  teleportTo: (x: number, y: number, z: number) => Promise<void>;
}

export function useWorldState(userId?: string): UseWorldStateReturn {
  const [position, setPosition] = useState<PlayerPosition | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<WorldEvent[]>([]);
  const [allEvents, setAllEvents] = useState<WorldEvent[]>([]);

  // Load initial world state
  useEffect(() => {
    if (!userId) return;

    const loadWorldState = async () => {
      try {
        // Load player state
        const playerState = await worldService.getPlayerState(userId);
        setPosition(playerState.position);
        setCurrentParty(playerState.party || null);

        // Load friends
        const friendsList = await worldService.getFriends(userId);
        setFriends(friendsList);

        // Load events
        const events = await worldService.getEvents({});
        setAllEvents(events);

        // Filter nearby events (within 100 units for demo)
        if (playerState.position) {
          const nearby = events.filter(event => {
            const dx = event.location.x - playerState.position.x;
            const dz = event.location.z - playerState.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            return distance < 100;
          });
          setNearbyEvents(nearby);
        }
      } catch (error) {
        console.error('[useWorldState] Load error:', error);
      }
    };

    loadWorldState();
  }, [userId]);

  // Subscribe to chat
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = worldService.subscribeToChat('global', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    return unsubscribe;
  }, [userId]);

  // Update player position
  const updatePosition = useCallback(async (pos: PlayerPosition) => {
    if (!userId) return;
    
    await worldService.updatePlayerPosition(userId, pos);
    setPosition(pos);

    // Update nearby events when position changes
    const nearby = allEvents.filter(event => {
      const dx = event.location.x - pos.x;
      const dz = event.location.z - pos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      return distance < 100;
    });
    setNearbyEvents(nearby);
  }, [userId, allEvents]);

  // Send chat message
  const sendMessage = useCallback(async (text: string, channel = 'global') => {
    if (!userId) return;
    await worldService.sendChatMessage(userId, text, channel);
  }, [userId]);

  // Party management
  const createParty = useCallback(async (name: string): Promise<Party> => {
    if (!userId) throw new Error('No user ID');
    const party = await worldService.createParty(userId, name);
    setCurrentParty(party);
    return party;
  }, [userId]);

  const joinParty = useCallback(async (partyId: string) => {
    if (!userId) return;
    await worldService.joinParty(userId, partyId);
    // Refetch party state
    const playerState = await worldService.getPlayerState(userId);
    setCurrentParty(playerState.party || null);
  }, [userId]);

  const leaveParty = useCallback(async () => {
    if (!userId || !currentParty) return;
    await worldService.leaveParty(userId, currentParty.id);
    setCurrentParty(null);
  }, [userId, currentParty]);

  const inviteToParty = useCallback(async (inviteeId: string) => {
    if (!userId || !currentParty) return;
    await worldService.inviteToParty(currentParty.id, inviteeId);
  }, [userId, currentParty]);

  // Friend management
  const addFriend = useCallback(async (friendId: string) => {
    if (!userId) return;
    await worldService.addFriend(userId, friendId);
    const updated = await worldService.getFriends(userId);
    setFriends(updated);
  }, [userId]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (!userId) return;
    await worldService.removeFriend(userId, friendId);
    const updated = await worldService.getFriends(userId);
    setFriends(updated);
  }, [userId]);

  // Event management
  const rsvpEvent = useCallback(async (eventId: string) => {
    if (!userId) return;
    await worldService.rsvpEvent(userId, eventId);
  }, [userId]);

  // Teleport
  const teleportTo = useCallback(async (x: number, y: number, z: number) => {
    if (!userId) return;
    await worldService.teleportTo(userId, { x, y, z });
    setPosition({ x, y, z });
  }, [userId]);

  return {
    position,
    currentParcelId: position ? `parcel-${Math.floor(position.x)}-${Math.floor(position.z)}` : null,
    updatePosition,
    chatMessages,
    sendMessage,
    currentParty,
    createParty,
    joinParty,
    leaveParty,
    inviteToParty,
    friends,
    addFriend,
    removeFriend,
    nearbyEvents,
    allEvents,
    rsvpEvent,
    teleportTo,
  };
}
