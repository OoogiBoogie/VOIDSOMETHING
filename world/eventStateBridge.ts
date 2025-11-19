/**
 * PHASE 5.4 — EVENT STATE BRIDGE
 * 
 * Connects world events to player state and lifecycle.
 * Ensures all systems stay in sync through the event bus.
 */

import { worldEventBus } from "./events/eventBus";
import { WorldEventType } from "./events/eventTypes";
import { usePlayerState } from "../state/player";
import type {
  ParcelEnteredEvent,
  ParcelExitedEvent,
  DistrictEnteredEvent,
  DistrictExitedEvent,
  SessionStartedEvent,
  SessionEndedEvent,
  PlayerMovedEvent,
  WorldLoadedEvent,
  UserLoggedInEvent,
} from "./events/eventPayloads";

class EventStateBridge {
  private isActive = false;

  /**
   * Start listening to events and syncing state
   */
  start(): void {
    if (this.isActive) return;
    this.isActive = true;

    // Parcel events → player state
    worldEventBus.on(WorldEventType.PARCEL_ENTERED, this.handleParcelEntered);
    worldEventBus.on(WorldEventType.PARCEL_EXITED, this.handleParcelExited);

    // District events → player state
    worldEventBus.on(WorldEventType.DISTRICT_ENTERED, this.handleDistrictEntered);
    worldEventBus.on(WorldEventType.DISTRICT_EXITED, this.handleDistrictExited);

    // Session events → player state + lifecycle
    worldEventBus.on(WorldEventType.SESSION_STARTED, this.handleSessionStarted);
    worldEventBus.on(WorldEventType.SESSION_ENDED, this.handleSessionEnded);

    // Player movement → player state + activity
    worldEventBus.on(WorldEventType.PLAYER_MOVED, this.handlePlayerMoved);

    // World lifecycle → lifecycle manager
    worldEventBus.on(WorldEventType.WORLD_LOADED, this.handleWorldLoaded);
    worldEventBus.on(WorldEventType.USER_LOGGED_IN, this.handleUserLoggedIn);

    console.log("[EventStateBridge] Started - syncing events to state");
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;

    worldEventBus.off(WorldEventType.PARCEL_ENTERED);
    worldEventBus.off(WorldEventType.PARCEL_EXITED);
    worldEventBus.off(WorldEventType.DISTRICT_ENTERED);
    worldEventBus.off(WorldEventType.DISTRICT_EXITED);
    worldEventBus.off(WorldEventType.SESSION_STARTED);
    worldEventBus.off(WorldEventType.SESSION_ENDED);
    worldEventBus.off(WorldEventType.PLAYER_MOVED);
    worldEventBus.off(WorldEventType.WORLD_LOADED);
    worldEventBus.off(WorldEventType.USER_LOGGED_IN);

    console.log("[EventStateBridge] Stopped");
  }

  /**
   * Handle parcel entered
   */
  private handleParcelEntered = (event: ParcelEnteredEvent): void => {
    const state = usePlayerState.getState();

    // Update current parcel
    state.setCurrentParcel(event.parcelCoords.x, event.parcelCoords.z);

    // Record visit (tracks first-time visits automatically)
    state.recordParcelVisit(event.parcelCoords.x, event.parcelCoords.z);

    // Update activity timestamp
    state.updateActivity();

    // If first visit, emit AREA_DISCOVERED for HUD
    if (event.isFirstVisit) {
      worldEventBus.emit({
        type: WorldEventType.AREA_DISCOVERED,
        areaName: `Parcel (${event.parcelCoords.x}, ${event.parcelCoords.z})`,
        areaType: "parcel",
        location: event.worldPosition,
        xpAwarded: 10, // TODO: Make configurable
        timestamp: Date.now(),
        walletAddress: event.walletAddress,
      });
    }
  };

  /**
   * Handle parcel exited
   */
  private handleParcelExited = (event: ParcelExitedEvent): void => {
    // Activity update handled by PARCEL_ENTERED for next parcel
    usePlayerState.getState().updateActivity();
  };

  /**
   * Handle district entered
   */
  private handleDistrictEntered = (event: DistrictEnteredEvent): void => {
    const state = usePlayerState.getState();

    // Update current district
    state.setCurrentDistrict(event.districtId);

    // Record visit
    state.recordDistrictVisit(event.districtId);

    // Update activity
    state.updateActivity();

    // If first visit, emit AREA_DISCOVERED
    if (event.isFirstVisit) {
      worldEventBus.emit({
        type: WorldEventType.AREA_DISCOVERED,
        areaName: event.districtName,
        areaType: "district",
        location: event.worldPosition,
        xpAwarded: 50, // TODO: Make configurable
        timestamp: Date.now(),
        walletAddress: event.walletAddress,
      });
    }
  };

  /**
   * Handle district exited
   */
  private handleDistrictExited = (event: DistrictExitedEvent): void => {
    usePlayerState.getState().updateActivity();
  };

  /**
   * Handle session started
   */
  private handleSessionStarted = (event: SessionStartedEvent): void => {
    const state = usePlayerState.getState();

    // Start session in player state
    state.startSession(event.walletAddress);

    // Sync to lifecycle manager (it manages its own state)
    // No need to call lifecycle here - it emits SESSION_STARTED itself
  };

  /**
   * Handle session ended
   */
  private handleSessionEnded = (event: SessionEndedEvent): void => {
    const state = usePlayerState.getState();

    // End session in player state
    state.endSession();

    // Lifecycle manager handles its own cleanup
    // Analytics are already batched by the event bus
  };

  /**
   * Handle player moved
   */
  private handlePlayerMoved = (event: PlayerMovedEvent): void => {
    const state = usePlayerState.getState();

    // Update position
    state.updatePosition({
      x: event.position.x,
      y: event.position.y,
      z: event.position.z,
    });

    // Update activity (movement = activity)
    state.updateActivity();
  };

  /**
   * Handle world loaded
   */
  private handleWorldLoaded = (event: WorldLoadedEvent): void => {
    // Lifecycle manager emits this event itself
    // No additional action needed here
  };

  /**
   * Handle user logged in
   */
  private handleUserLoggedIn = (event: UserLoggedInEvent): void => {
    const state = usePlayerState.getState();

    // Connect wallet in state
    state.connect(event.walletAddress);

    // Lifecycle manager handles its own WALLET_CONNECTED event
    // It will call onWalletConnect when appropriate
  };
}

// Global singleton
export const eventStateBridge = new EventStateBridge();
