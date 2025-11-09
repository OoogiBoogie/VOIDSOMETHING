/**
 * Audio Provider
 * Context wrapper to make audio engine available throughout the app
 */

"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAudioEngine } from "./useAudioEngine";
import { AudioEventKey } from "./audioEvents";

type AudioContextValue = {
  play: (eventKey: AudioEventKey) => void;
  stop: (eventKey: AudioEventKey) => void;
  stopAll: () => void;
  setCategoryVolume: (category: string, volume: number) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

interface AudioProviderProps {
  children: ReactNode;
  masterVolume?: number;
  enableSounds?: boolean;
}

export function AudioProvider({ 
  children, 
  masterVolume = 1,
  enableSounds = true 
}: AudioProviderProps) {
  const audio = useAudioEngine({ masterVolume, enableSounds });

  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return ctx;
}
