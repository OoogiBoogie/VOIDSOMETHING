/**
 * Character Select State Management
 * Manages character selection, model loading, and Net Protocol persistence
 */

import { create } from 'zustand';

export type CharacterId = 'psx' | 'miggles';

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  description: string;
  modelPath: string;
  accentColor: string;
  glowColor: string;
  thumbnail: string;
}

export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  psx: {
    id: 'psx',
    name: 'PSX Operative',
    description: 'Elite cyber-soldier. Fast, precise, lethal.',
    modelPath: '/models/psxModel.glb',
    accentColor: '#00FF9A',
    glowColor: 'rgba(0, 255, 154, 0.3)',
    thumbnail: '/textures/psx-portrait.png',
  },
  miggles: {
    id: 'miggles',
    name: 'Miggles',
    description: 'Mysterious entity. Origins unknown.',
    modelPath: '/models/migglesPlaceholder.glb',
    accentColor: '#F79625',
    glowColor: 'rgba(247, 150, 37, 0.3)',
    thumbnail: '/textures/miggles-portrait.png',
  },
};

interface CharacterSelectState {
  // Selection state
  selectedCharacter: CharacterId | null;
  hoveredCharacter: CharacterId | null;
  
  // Loading states
  isLoadingModel: boolean;
  isSaving: boolean;
  isConfirmed: boolean;
  
  // Model state
  modelLoaded: boolean;
  modelError: string | null;
  
  // Glitch effects
  isGlitching: boolean;
  glitchIntensity: number;
  
  // Actions
  selectCharacter: (id: CharacterId) => void;
  setHoveredCharacter: (id: CharacterId | null) => void;
  confirmSelection: () => void;
  setModelLoaded: (loaded: boolean) => void;
  setModelError: (error: string | null) => void;
  setSaving: (saving: boolean) => void;
  triggerGlitch: (intensity?: number) => void;
  reset: () => void;
}

export const useCharacterSelectState = create<CharacterSelectState>((set, get) => ({
  // Initial state
  selectedCharacter: null,
  hoveredCharacter: null,
  isLoadingModel: false,
  isSaving: false,
  isConfirmed: false,
  modelLoaded: false,
  modelError: null,
  isGlitching: false,
  glitchIntensity: 0,
  
  // Actions
  selectCharacter: (id: CharacterId) => {
    const current = get().selectedCharacter;
    
    // Trigger glitch effect on character switch
    if (current !== id) {
      get().triggerGlitch(0.7);
    }
    
    set({
      selectedCharacter: id,
      modelLoaded: false,
      modelError: null,
      isLoadingModel: true,
      isConfirmed: false,
    });
  },
  
  setHoveredCharacter: (id: CharacterId | null) => {
    set({ hoveredCharacter: id });
  },
  
  confirmSelection: () => {
    const { selectedCharacter } = get();
    if (selectedCharacter) {
      set({ isConfirmed: true });
      get().triggerGlitch(1.0);
    }
  },
  
  setModelLoaded: (loaded: boolean) => {
    set({ 
      modelLoaded: loaded,
      isLoadingModel: !loaded,
    });
  },
  
  setModelError: (error: string | null) => {
    set({ 
      modelError: error,
      isLoadingModel: false,
    });
  },
  
  setSaving: (saving: boolean) => {
    set({ isSaving: saving });
  },
  
  triggerGlitch: (intensity: number = 0.5) => {
    set({ 
      isGlitching: true,
      glitchIntensity: intensity,
    });
    
    // Auto-clear glitch after animation
    setTimeout(() => {
      set({ 
        isGlitching: false,
        glitchIntensity: 0,
      });
    }, 300);
  },
  
  reset: () => {
    set({
      selectedCharacter: null,
      hoveredCharacter: null,
      isLoadingModel: false,
      isSaving: false,
      isConfirmed: false,
      modelLoaded: false,
      modelError: null,
      isGlitching: false,
      glitchIntensity: 0,
    });
  },
}));
