/**
 * PHASE 5 — WORLD EVENT PAYLOADS
 * 
 * Strongly-typed payloads for every world event.
 * Designed for analytics, HUD reactions, and future ML/insights.
 */

import { WorldEventType } from "./eventTypes";

// Core position data
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ParcelCoords {
  x: number;
  z: number;
}

// Base event interface - all events extend this
export interface BaseWorldEvent {
  type: WorldEventType;
  timestamp: number;
  sessionId?: string;
  walletAddress?: string;
}

// Player Movement
export interface PlayerMovedEvent extends BaseWorldEvent {
  type: WorldEventType.PLAYER_MOVED;
  position: Vec3;
  previousPosition: Vec3;
  velocity: number;
  parcelId?: string;
  districtId?: string;
}

// User Lifecycle
export interface UserLoggedInEvent extends BaseWorldEvent {
  type: WorldEventType.USER_LOGGED_IN;
  walletAddress: string;
  loginMethod: "wallet" | "bypass";
  referrer?: string;
}

export interface UserLoggedOutEvent extends BaseWorldEvent {
  type: WorldEventType.USER_LOGGED_OUT;
  walletAddress: string;
  sessionDuration: number;
}

// World Lifecycle
export interface WorldLoadedEvent extends BaseWorldEvent {
  type: WorldEventType.WORLD_LOADED;
  loadTime: number;
  renderMode: "desktop" | "mobile";
  worldVersion: string;
}

export interface WorldUnloadedEvent extends BaseWorldEvent {
  type: WorldEventType.WORLD_UNLOADED;
  sessionDuration: number;
}

// Parcel Events
export interface ParcelEnteredEvent extends BaseWorldEvent {
  type: WorldEventType.PARCEL_ENTERED;
  parcelId: string;
  parcelCoords: ParcelCoords;
  districtId: string;
  worldPosition: Vec3;
  previousParcelId?: string;
  isFirstVisit: boolean;
}

export interface ParcelExitedEvent extends BaseWorldEvent {
  type: WorldEventType.PARCEL_EXITED;
  parcelId: string;
  parcelCoords: ParcelCoords;
  districtId: string;
  timeInParcel: number; // milliseconds
  nextParcelId?: string;
}

// District Events
export interface DistrictEnteredEvent extends BaseWorldEvent {
  type: WorldEventType.DISTRICT_ENTERED;
  districtId: string;
  districtName: string;
  parcelId: string;
  worldPosition: Vec3;
  previousDistrictId?: string;
  isFirstVisit: boolean;
}

export interface DistrictExitedEvent extends BaseWorldEvent {
  type: WorldEventType.DISTRICT_EXITED;
  districtId: string;
  districtName: string;
  timeInDistrict: number; // milliseconds
  nextDistrictId?: string;
}

// Property Events (future expansion)
export interface PropertyViewedEvent extends BaseWorldEvent {
  type: WorldEventType.PROPERTY_VIEWED;
  propertyId: string;
  parcelId: string;
  districtId: string;
  listingPrice?: number;
  ownerAddress?: string;
}

export interface PropertyPurchasedEvent extends BaseWorldEvent {
  type: WorldEventType.PROPERTY_PURCHASED;
  propertyId: string;
  parcelId: string;
  districtId: string;
  price: number;
  buyerAddress: string;
  sellerAddress?: string;
  txHash: string;
}

// Discovery Events
export interface FirstParcelVisitEvent extends BaseWorldEvent {
  type: WorldEventType.FIRST_PARCEL_VISIT;
  parcelId: string;
  parcelCoords: ParcelCoords;
  districtId: string;
  xpAwarded: number;
}

export interface FirstDistrictVisitEvent extends BaseWorldEvent {
  type: WorldEventType.FIRST_DISTRICT_VISIT;
  districtId: string;
  districtName: string;
  parcelId: string;
  xpAwarded: number;
}

// Area Discovery (generic)
export interface AreaDiscoveredEvent extends BaseWorldEvent {
  type: WorldEventType.AREA_DISCOVERED;
  areaName: string;
  areaType: string;
  location: Vec3;
  xpAwarded: number;
}

// Session Events
export interface SessionStartedEvent extends BaseWorldEvent {
  type: WorldEventType.SESSION_STARTED;
  walletAddress: string;
  device: "desktop" | "mobile";
  userAgent: string;
}

export interface SessionEndedEvent extends BaseWorldEvent {
  type: WorldEventType.SESSION_ENDED;
  walletAddress: string;
  duration: number;
  parcelsVisited: number;
  districtsVisited: number;
}

export interface SessionHeartbeatEvent extends BaseWorldEvent {
  type: WorldEventType.SESSION_HEARTBEAT;
  walletAddress: string;
  currentParcelId?: string;
  currentDistrictId?: string;
  totalTimeActive: number;
}

// Interaction Events
export interface InteractableHoveredEvent extends BaseWorldEvent {
  type: WorldEventType.INTERACTABLE_HOVERED;
  interactableId: string;
  interactionType: string;
  position: Vec3;
  distance: number;
}

export interface InteractableLeftEvent extends BaseWorldEvent {
  type: WorldEventType.INTERACTABLE_LEFT;
  interactableId: string;
  hoverDuration: number;
}

export interface InteractTriggeredEvent extends BaseWorldEvent {
  type: WorldEventType.INTERACT_TRIGGERED;
  interactableId: string;
  interactionType: string;
  position: Vec3;
  walletAddress: string;
}

export interface InteractionStartedEvent extends BaseWorldEvent {
  type: WorldEventType.INTERACTION_STARTED;
  playerId: string;
  interactableId: string;
  interactionType: string;
  position: Vec3;
}

export interface InteractionCompletedEvent extends BaseWorldEvent {
  type: WorldEventType.INTERACTION_COMPLETED;
  playerId: string;
  interactableId: string;
  interactionType: string;
  duration?: number;
}

export interface InteractionFailedEvent extends BaseWorldEvent {
  type: WorldEventType.INTERACTION_FAILED;
  playerId: string;
  interactableId: string;
  error: string;
}

// XP Events (Phase 6.0)
export interface XPGainedEvent extends BaseWorldEvent {
  type: WorldEventType.XP_GAINED;
  walletAddress: string;
  sessionId: string;
  amount: number;
  newTotal: number;
  source: string;
  sourceDetails?: string;
}

export interface XPCapReachedEvent extends BaseWorldEvent {
  type: WorldEventType.XP_CAP_REACHED;
  walletAddress: string;
  sessionId: string;
  cappedAmount: number;
  maxPerMinute: number;
}

export interface XPMultiplierAppliedEvent extends BaseWorldEvent {
  type: WorldEventType.XP_MULTIPLIER_APPLIED;
  multiplier: number;
  reason: string;
  expiresAt?: number;
}

// Achievement Events (Phase 6.1)
export interface AchievementUnlockedEvent extends BaseWorldEvent {
  type: WorldEventType.ACHIEVEMENT_UNLOCKED;
  walletAddress: string;
  sessionId: string;
  achievementId: string;
  title: string;
  xpBonus: number;
  category: string;
}

export interface AchievementProgressEvent extends BaseWorldEvent {
  type: WorldEventType.ACHIEVEMENT_PROGRESS;
  walletAddress: string;
  sessionId: string;
  achievementId: string;
  progress: number;
  current: number;
  required: number;
}

// Union type of all events
export type WorldEvent =
  | PlayerMovedEvent
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | WorldLoadedEvent
  | WorldUnloadedEvent
  | ParcelEnteredEvent
  | ParcelExitedEvent
  | DistrictEnteredEvent
  | DistrictExitedEvent
  | PropertyViewedEvent
  | PropertyPurchasedEvent
  | FirstParcelVisitEvent
  | FirstDistrictVisitEvent
  | AreaDiscoveredEvent
  | SessionStartedEvent
  | SessionEndedEvent
  | SessionHeartbeatEvent
  | InteractableHoveredEvent
  | InteractableLeftEvent
  | InteractTriggeredEvent
  | InteractionStartedEvent
  | InteractionCompletedEvent
  | InteractionFailedEvent
  | XPGainedEvent
  | XPCapReachedEvent
  | XPMultiplierAppliedEvent
  | AchievementUnlockedEvent
  | AchievementProgressEvent;

// Type guard helpers
export function isParcelEvent(event: WorldEvent): event is ParcelEnteredEvent | ParcelExitedEvent {
  return event.type === WorldEventType.PARCEL_ENTERED || event.type === WorldEventType.PARCEL_EXITED;
}

export function isDistrictEvent(event: WorldEvent): event is DistrictEnteredEvent | DistrictExitedEvent {
  return event.type === WorldEventType.DISTRICT_ENTERED || event.type === WorldEventType.DISTRICT_EXITED;
}

export function isDiscoveryEvent(event: WorldEvent): event is FirstParcelVisitEvent | FirstDistrictVisitEvent {
  return event.type === WorldEventType.FIRST_PARCEL_VISIT || event.type === WorldEventType.FIRST_DISTRICT_VISIT;
}
