/**
 * VOID METAVERSE - INPUT MODE SYSTEM
 * 
 * Manages keyboard/input behavior across different application states:
 * - LOGIN: User is in login/intro/forms (all keys go to UI)
 * - WORLD: User is in 3D world (WASD movement, HUD shortcuts active)
 */

import { create } from 'zustand'

export type InputMode = 'LOGIN' | 'WORLD'

interface InputModeState {
  mode: InputMode
  setMode: (mode: InputMode) => void
  isWorldMode: () => boolean
  isLoginMode: () => boolean
}

export const useInputMode = create<InputModeState>((set, get) => ({
  mode: 'LOGIN',
  
  setMode: (mode: InputMode) => {
    console.log(`🎮 Input Mode: ${mode}`)
    set({ mode })
  },
  
  isWorldMode: () => get().mode === 'WORLD',
  isLoginMode: () => get().mode === 'LOGIN',
}))

/**
 * Hook for components that need to check input mode before handling keys
 */
export function useKeyboardHandler() {
  const { mode, isWorldMode } = useInputMode()
  
  const handleKey = (
    e: KeyboardEvent,
    handler: () => void,
    options?: {
      preventDefault?: boolean
      requireWorldMode?: boolean
    }
  ) => {
    const {
      preventDefault = true,
      requireWorldMode = true,
    } = options || {}
    
    // If world mode is required and we're not in world mode, ignore
    if (requireWorldMode && mode !== 'WORLD') {
      return
    }
    
    // Check if user is typing in a text field
    const target = e.target as HTMLElement
    const isTextInput = 
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    
    if (isTextInput && mode === 'LOGIN') {
      // In login mode with text focus, let normal typing work
      return
    }
    
    if (preventDefault) {
      e.preventDefault()
    }
    
    handler()
  }
  
  return { mode, isWorldMode, handleKey }
}
