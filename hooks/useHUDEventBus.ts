"use client";

/**
 * @title HUD Event Bus Hook
 * @notice Manages contract event listeners + WebSocket connections for real-time HUD updates
 * 
 * Event Sources:
 * 1. Contract events (XPOracle, MissionRegistry, VoidEmitter, etc.)
 * 2. WebSocket events (multiplayer, chat, district activity)
 * 3. Local events (UI interactions, state changes)
 * 
 * Phase 1 Scope:
 * - XP updates (XPOracle)
 * - Mission completions (MissionRegistry)
 * - Vault updates (VoidVaultFactory)
 * - Treasury emissions (VoidEmitter)
 * 
 * Phase 2 (LOCKED):
 * - Cosmetic purchases (SKUFactory)
 * - Loadout changes (PlayerCosmetics)
 */

import { useEffect, useCallback, useRef } from "react";
import { useHUD } from "@/contexts/HUDContext";

// ============ EVENT TYPES ============

export interface ContractEvent {
  contract: string;
  event: string;
  args: any;
  blockNumber: number;
  transactionHash: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

// ============ HOOK ============

export function useHUDEventBus() {
  const { publishEvent, addNotification } = useHUD();
  const wsRef = useRef<WebSocket | null>(null);
  
  // ============ CONTRACT EVENT HANDLERS ============
  
  const handleXPUpdate = useCallback((event: ContractEvent) => {
    publishEvent("XP_UPDATED", {
      player: event.args.player,
      newXP: event.args.newXP,
      oldXP: event.args.oldXP,
      blockNumber: event.blockNumber,
    });
    
    addNotification({
      type: "success",
      title: "XP Gained",
      message: `+${Number(event.args.newXP) - Number(event.args.oldXP)} XP`,
      duration: 3000,
    });
  }, [publishEvent, addNotification]);
  
  const handleMissionCompleted = useCallback((event: ContractEvent) => {
    publishEvent("MISSION_COMPLETED", {
      player: event.args.player,
      missionId: event.args.missionId,
      rewardXP: event.args.rewardXP,
      rewardSIGNAL: event.args.rewardSIGNAL,
    });
    
    addNotification({
      type: "success",
      title: "Mission Complete",
      message: `+${event.args.rewardXP} XP, +${event.args.rewardSIGNAL} SIGNAL`,
      duration: 5000,
    });
  }, [publishEvent, addNotification]);
  
  const handleVaultCreated = useCallback((event: ContractEvent) => {
    publishEvent("VAULT_CREATED", {
      owner: event.args.owner,
      vaultAddress: event.args.vaultAddress,
      collateralToken: event.args.collateralToken,
    });
    
    addNotification({
      type: "info",
      title: "Vault Created",
      message: `New vault at ${event.args.vaultAddress.slice(0, 8)}...`,
      duration: 4000,
    });
  }, [publishEvent, addNotification]);
  
  const handleEmissionDistributed = useCallback((event: ContractEvent) => {
    publishEvent("EMISSION_DISTRIBUTED", {
      recipient: event.args.recipient,
      amount: event.args.amount,
      emissionRate: event.args.emissionRate,
    });
  }, [publishEvent]);
  
  // ============ WEBSOCKET HANDLERS ============
  
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case "district_activity":
        publishEvent("DISTRICT_ACTIVITY", message.data);
        break;
        
      case "player_joined":
        publishEvent("PLAYER_JOINED", message.data);
        addNotification({
          type: "info",
          title: "Player Joined",
          message: `${message.data.username} entered ${message.data.district}`,
          duration: 3000,
        });
        break;
        
      case "mission_available":
        publishEvent("MISSION_AVAILABLE", message.data);
        addNotification({
          type: "info",
          title: "New Mission",
          message: message.data.title,
          duration: 5000,
        });
        break;
        
      default:
        publishEvent("WEBSOCKET_MESSAGE", message);
    }
  }, [publishEvent, addNotification]);
  
  // ============ WEBSOCKET CONNECTION ============
  
  useEffect(() => {
    // WebSocket URL from env (optional for Phase 1)
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    
    if (!wsUrl) {
      console.warn("[HUD Event Bus] WebSocket URL not configured (optional for Phase 1)");
      return;
    }
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log("[HUD Event Bus] WebSocket connected");
        publishEvent("WEBSOCKET_CONNECTED", { url: wsUrl });
      };
      
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("[HUD Event Bus] Failed to parse WebSocket message:", error);
        }
      };
      
      ws.onerror = (error) => {
        console.error("[HUD Event Bus] WebSocket error:", error);
        publishEvent("WEBSOCKET_ERROR", { error });
      };
      
      ws.onclose = () => {
        console.log("[HUD Event Bus] WebSocket disconnected");
        publishEvent("WEBSOCKET_DISCONNECTED", {});
      };
      
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error("[HUD Event Bus] Failed to initialize WebSocket:", error);
    }
  }, [publishEvent, handleWebSocketMessage]);
  
  // ============ CONTRACT EVENT LISTENERS ============
  
  // NOTE: Contract event listeners would be initialized here using ethers/viem
  // For Phase 1, this is placeholder logic - actual contract integration in Task 17
  
  useEffect(() => {
    console.log("[HUD Event Bus] Contract event listeners initialized (Phase 1 simulation mode)");
    
    // Placeholder: Simulate contract events for testing
    if (process.env.NODE_ENV === "development") {
      // Simulate XP update every 30 seconds
      const xpInterval = setInterval(() => {
        const mockXPEvent: ContractEvent = {
          contract: "XPOracle",
          event: "XPUpdated",
          args: {
            player: "0x1234...5678",
            newXP: Math.floor(Math.random() * 1000) + 100,
            oldXP: Math.floor(Math.random() * 100),
          },
          blockNumber: Math.floor(Math.random() * 1000000),
          transactionHash: `0x${Math.random().toString(16).slice(2)}`,
        };
        handleXPUpdate(mockXPEvent);
      }, 30000);
      
      return () => clearInterval(xpInterval);
    }
  }, [handleXPUpdate]);
  
  // ============ PUBLIC API ============
  
  return {
    // Send custom event
    publishEvent,
    
    // Send notification
    notify: addNotification,
    
    // WebSocket status
    isWebSocketConnected: wsRef.current?.readyState === WebSocket.OPEN,
    
    // Send WebSocket message
    sendWebSocketMessage: useCallback((type: string, data: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type, data, timestamp: Date.now() }));
      } else {
        console.warn("[HUD Event Bus] WebSocket not connected, cannot send message");
      }
    }, []),
  };
}

// ============ CONTRACT EVENT SIMULATORS (Phase 1 Testing) ============

/**
 * Simulates contract events for HUD testing without live contracts
 */
export function useSimulatedContractEvents() {
  const { publishEvent, addNotification } = useHUD();
  
  const simulateXPGain = useCallback((amount: number) => {
    publishEvent("XP_UPDATED", {
      player: "0xLocalPlayer",
      newXP: amount,
      oldXP: 0,
      blockNumber: 0,
    });
    
    addNotification({
      type: "success",
      title: "XP Gained",
      message: `+${amount} XP`,
      duration: 3000,
    });
  }, [publishEvent, addNotification]);
  
  const simulateMissionComplete = useCallback((missionId: string, rewardXP: number, rewardSIGNAL: number) => {
    publishEvent("MISSION_COMPLETED", {
      player: "0xLocalPlayer",
      missionId,
      rewardXP,
      rewardSIGNAL,
    });
    
    addNotification({
      type: "success",
      title: "Mission Complete",
      message: `+${rewardXP} XP, +${rewardSIGNAL} SIGNAL`,
      duration: 5000,
    });
  }, [publishEvent, addNotification]);
  
  const simulateVaultAlert = useCallback((severity: "WARN" | "CRITICAL") => {
    publishEvent("VAULT_HEALTH_ALERT", {
      vaultId: "vault-123",
      severity,
      collateralization: severity === "CRITICAL" ? 105 : 115,
    });
    
    addNotification({
      type: severity === "CRITICAL" ? "error" : "warning",
      title: "Vault Alert",
      message: `Collateralization ${severity === "CRITICAL" ? "<110%" : "<120%"}`,
      duration: 8000,
    });
  }, [publishEvent, addNotification]);
  
  return {
    simulateXPGain,
    simulateMissionComplete,
    simulateVaultAlert,
  };
}
