/**
 * MINIAPP SYSTEM - Main Exports
 * 
 * Centralized exports for the VOID MiniApp platform.
 */

// Core components
export { MiniAppManagerProvider, useMiniAppManager, useVoidRuntime, useActiveMiniApp } from './MiniAppManager';
export { MiniAppContainer } from './MiniAppContainer';
export { MiniAppDock } from './MiniAppDock';

// Registry
export { MINIAPP_REGISTRY, getMiniAppById, getEnabledMiniApps, getMiniAppsByCategory, getMiniAppCategories } from './miniapps.registry';

// Types
export type {
  MiniAppType,
  MiniAppCategory,
  MiniAppPermission,
  MiniAppDefinition,
  VoidRuntimeContext,
  MiniAppManagerState,
  MiniAppManagerActions,
  VoidMessageType,
  VoidInitMessage,
  VoidReadyMessage,
  VoidTxRequestMessage,
  VoidTxResultMessage,
  VoidErrorMessage,
  VoidMessage,
} from './types';
