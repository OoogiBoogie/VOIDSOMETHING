/**
 * Character Select Window
 * AAA-quality character selection terminal with CRT/Glitch/Y2K/Xbox aesthetic
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterSelectState, CHARACTERS, type CharacterId } from '@/state/characterSelect/useCharacterSelectState';
import { saveCharacterSelection, loadCharacterSelection } from '@/lib/net/characterStorage';
import RotatingModelPreview from './RotatingModelPreview';

interface CharacterCardProps {
  characterId: CharacterId;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
}

function CharacterCard({ characterId, isSelected, isHovered, onSelect, onHover }: CharacterCardProps) {
  const character = CHARACTERS[characterId];
  const { isGlitching } = useCharacterSelectState();
  
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`
        relative group
        w-full p-6
        border-2 rounded-lg
        transition-all duration-300
        ${isSelected 
          ? `border-[${character.accentColor}] bg-gradient-to-br from-black/80 to-black/40 shadow-[0_0_30px_${character.glowColor}]`
          : 'border-cyan-500/30 bg-black/60 hover:border-cyan-500/60'
        }
        ${isHovered && !isSelected ? 'scale-105' : ''}
        ${isGlitching && isSelected ? 'animate-[glitch_0.3s_ease-in-out]' : ''}
      `}
      style={{
        borderColor: isSelected ? character.accentColor : undefined,
        boxShadow: isSelected ? `0 0 30px ${character.glowColor}` : undefined,
      }}
    >
      {/* CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] rounded-lg" />
      
      {/* Chrome edge effect */}
      <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />
      
      {/* Selection indicator */}
      {isSelected && (
        <div 
          className="absolute top-2 right-2 w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: character.accentColor }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Portrait placeholder */}
        <div 
          className="w-24 h-24 rounded-lg border-2 flex items-center justify-center font-mono text-2xl"
          style={{ 
            borderColor: character.accentColor,
            backgroundColor: `${character.accentColor}20`,
            color: character.accentColor,
          }}
        >
          {characterId === 'psx' ? 'PSX' : 'M'}
        </div>
        
        {/* Name */}
        <div 
          className="font-bold text-xl tracking-wider"
          style={{ color: isSelected ? character.accentColor : '#FFFFFF' }}
        >
          {character.name}
        </div>
        
        {/* Description */}
        <div className="text-gray-400 text-sm text-center font-mono">
          {character.description}
        </div>
        
        {/* Selected badge */}
        {isSelected && (
          <div 
            className="mt-2 px-4 py-1 rounded-full text-xs font-bold border"
            style={{ 
              borderColor: character.accentColor,
              backgroundColor: `${character.accentColor}30`,
              color: character.accentColor,
            }}
          >
            SELECTED
          </div>
        )}
      </div>
    </button>
  );
}

export default function CharacterSelectWindow() {
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);
  
  const {
    selectedCharacter,
    hoveredCharacter,
    isConfirmed,
    isSaving,
    modelLoaded,
    selectCharacter,
    setHoveredCharacter,
    confirmSelection,
    setSaving,
    triggerGlitch,
  } = useCharacterSelectState();
  
  // Load saved character on mount
  useEffect(() => {
    loadCharacterSelection().then((saved) => {
      if (saved) {
        selectCharacter(saved);
      }
    });
  }, [selectCharacter]);
  
  const handleSelectCharacter = (id: CharacterId) => {
    selectCharacter(id);
    triggerGlitch(0.5);
  };
  
  const handleEnterVoid = async () => {
    if (!selectedCharacter || !modelLoaded) return;
    
    setIsEntering(true);
    confirmSelection();
    setSaving(true);
    
    try {
      // Save to Net Protocol
      await saveCharacterSelection(selectedCharacter);
      console.log('[CharacterSelect] Saved selection:', selectedCharacter);
      
      // Dramatic glitch effect
      triggerGlitch(1.0);
      
      // Wait for effect
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Navigate to world
      router.push('/world');
    } catch (error) {
      console.error('[CharacterSelect] Failed to save:', error);
      setSaving(false);
      setIsEntering(false);
    }
  };
  
  const canEnter = selectedCharacter !== null && modelLoaded && !isSaving;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* CRT overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,255,154,0.03),rgba(0,255,154,0.03)_1px,transparent_1px,transparent_2px)]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      
      {/* Main container */}
      <div className="relative w-[90vw] max-w-7xl h-[85vh] border-4 border-cyan-500/50 rounded-2xl overflow-hidden bg-black/80 backdrop-blur-xl shadow-[0_0_100px_rgba(0,255,154,0.3)]">
        {/* Chrome edge effect */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        
        {/* Header */}
        <div className="relative z-10 border-b border-cyan-500/50 bg-gradient-to-r from-black/90 to-black/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#00FF9A] tracking-wider font-mono glitch-text">
                [CHARACTER SELECT]
              </h1>
              <p className="text-gray-400 mt-2 font-mono text-sm">
                Choose your operative. This is a permanent decision.
              </p>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-3 text-sm font-mono">
              <div className={`w-2 h-2 rounded-full ${selectedCharacter ? 'bg-[#00FF9A]' : 'bg-gray-600'} animate-pulse`} />
              <span className="text-gray-400">
                {selectedCharacter ? 'READY' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 grid grid-cols-2 gap-8 p-8 h-[calc(100%-180px)]">
          {/* Left: 3D Preview */}
          <div className="flex flex-col gap-4">
            <div className="text-cyan-500 font-mono text-sm tracking-wider border-b border-cyan-500/30 pb-2">
              PREVIEW TERMINAL
            </div>
            
            <div className="flex-1 relative">
              {selectedCharacter ? (
                <RotatingModelPreview
                  characterId={selectedCharacter}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-black/50 rounded-lg border border-cyan-500/30 flex flex-col items-center justify-center">
                  <div className="text-gray-600 font-mono text-lg mb-4">
                    [NO SELECTION]
                  </div>
                  <div className="text-gray-700 font-mono text-sm">
                    Select a character to preview
                  </div>
                </div>
              )}
            </div>
            
            {/* Model info */}
            {selectedCharacter && (
              <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 font-mono text-xs">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">MODEL:</span>
                  <span className="text-[#00FF9A]">{CHARACTERS[selectedCharacter].modelPath}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">STATUS:</span>
                  <span className={modelLoaded ? 'text-[#00FF9A]' : 'text-yellow-500'}>
                    {modelLoaded ? 'LOADED' : 'LOADING...'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Right: Character selection */}
          <div className="flex flex-col gap-4">
            <div className="text-cyan-500 font-mono text-sm tracking-wider border-b border-cyan-500/30 pb-2">
              AVAILABLE OPERATIVES
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              <CharacterCard
                characterId="psx"
                isSelected={selectedCharacter === 'psx'}
                isHovered={hoveredCharacter === 'psx'}
                onSelect={() => handleSelectCharacter('psx')}
                onHover={(hover) => setHoveredCharacter(hover ? 'psx' : null)}
              />
              
              <CharacterCard
                characterId="miggles"
                isSelected={selectedCharacter === 'miggles'}
                isHovered={hoveredCharacter === 'miggles'}
                onSelect={() => handleSelectCharacter('miggles')}
                onHover={(hover) => setHoveredCharacter(hover ? 'miggles' : null)}
              />
            </div>
          </div>
        </div>
        
        {/* Footer - Enter Void button */}
        <div className="relative z-10 border-t border-cyan-500/50 bg-gradient-to-r from-black/90 to-black/60 p-6">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs text-gray-500">
              {selectedCharacter 
                ? `Selected: ${CHARACTERS[selectedCharacter].name}`
                : 'No selection made'
              }
            </div>
            
            <button
              onClick={handleEnterVoid}
              disabled={!canEnter || isEntering}
              className={`
                relative group
                px-12 py-4 rounded-lg
                font-bold text-xl tracking-wider
                transition-all duration-300
                ${canEnter && !isEntering
                  ? 'bg-gradient-to-r from-[#00FF9A] to-[#00CC7A] text-black hover:shadow-[0_0_40px_rgba(0,255,154,0.6)] hover:scale-105'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }
              `}
            >
              {/* Chrome edge */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
              
              {/* Glitch effect overlay */}
              {isEntering && (
                <div className="absolute inset-0 rounded-lg bg-white/50 animate-[glitch_0.3s_ease-in-out_infinite]" />
              )}
              
              <span className="relative z-10">
                {isEntering ? '[ENTERING VOID...]' : canEnter ? '[ENTER VOID]' : '[SELECT CHARACTER]'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
        }
        
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        .glitch-text {
          text-shadow: 
            2px 2px 0 rgba(0, 255, 154, 0.3),
            -2px -2px 0 rgba(0, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
