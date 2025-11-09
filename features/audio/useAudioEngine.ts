/**
 * Audio Engine Hook
 * Central controller for all audio playback
 */

import { useCallback, useEffect, useRef } from "react";
import { audioConfig } from "./audioConfig";
import { AudioEventKey } from "./audioEvents";

type AudioEngineOptions = {
  masterVolume?: number; // 0–1
  enableSounds?: boolean;
};

export function useAudioEngine(options: AudioEngineOptions = {}) {
  const { masterVolume = 1, enableSounds = true } = options;

  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  const categoryVolumesRef = useRef<Record<string, number>>({
    ui: 1,
    world: 1,
    web3: 1,
    ambient: 1,
    social: 1,
  });

  // Preload all audio
  useEffect(() => {
    if (!enableSounds) return;

    const elements: Record<string, HTMLAudioElement> = {};

    Object.entries(audioConfig).forEach(([eventKey, cfg]) => {
      const audio = new Audio(cfg.src);
      audio.loop = !!cfg.loop;
      
      const categoryVolume = categoryVolumesRef.current[cfg.category || "ui"] || 1;
      audio.volume = cfg.volume * masterVolume * categoryVolume;
      
      // Preload audio
      audio.load();
      
      elements[eventKey] = audio;
    });

    audioElementsRef.current = elements;

    return () => {
      Object.values(elements).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, [masterVolume, enableSounds]);

  const play = useCallback((eventKey: AudioEventKey) => {
    if (!enableSounds) return;
    
    const audio = audioElementsRef.current[eventKey];
    if (!audio) {
      console.warn(`[Audio] No audio configured for event: ${eventKey}`);
      return;
    }

    // Restart from beginning (unless it's a loop)
    if (!audio.loop) {
      audio.currentTime = 0;
    }
    
    audio.play().catch((error) => {
      // Ignore autoplay block errors
      if (error.name !== "NotAllowedError") {
        console.error(`[Audio] Error playing ${eventKey}:`, error);
      }
    });
  }, [enableSounds]);

  const stop = useCallback((eventKey: AudioEventKey) => {
    const audio = audioElementsRef.current[eventKey];
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const stopAll = useCallback(() => {
    Object.values(audioElementsRef.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const setCategoryVolume = useCallback((category: string, volume: number) => {
    categoryVolumesRef.current[category] = Math.max(0, Math.min(1, volume));
    
    // Update all audio elements in this category
    Object.entries(audioConfig).forEach(([eventKey, cfg]) => {
      if (cfg.category === category) {
        const audio = audioElementsRef.current[eventKey];
        if (audio) {
          const categoryVolume = categoryVolumesRef.current[category] || 1;
          audio.volume = cfg.volume * masterVolume * categoryVolume;
        }
      }
    });
  }, [masterVolume]);

  return { 
    play, 
    stop, 
    stopAll,
    setCategoryVolume,
  };
}
