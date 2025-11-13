"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAudioEngine } from "@/features/audio/useAudioEngine"
import { AudioEvents } from "@/features/audio/audioEvents"

interface WelcomeScreenProps {
  onComplete: () => void
}

type Phase = "boot" | "warning" | "invitation" | "entry" | "complete"

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [phase, setPhase] = useState<Phase>("boot")
  const [showCursor, setShowCursor] = useState(true)
  const [bootText, setBootText] = useState("")
  const [idleLoop, setIdleLoop] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [inputError, setInputError] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { play } = useAudioEngine()

  // Full boot text
  const fullBootText = "VOID OPERATING SYSTEM v1.0\nAUTHORIZATION REQUIRED"

  // Phase timing
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // BOOT PHASE: 0-3s
    let charIndex = 0
    const typeInterval = setInterval(() => {
      if (charIndex <= fullBootText.length) {
        setBootText(fullBootText.substring(0, charIndex))
        // Play boot beep on each character
        if (charIndex % 3 === 0) {
          play(AudioEvents.INTRO_BOOT_BEEP)
        }
        charIndex++
      }
    }, 80)
    timers.push(typeInterval)

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    timers.push(cursorInterval)

    // Transition to WARNING at 3s
    timers.push(
      setTimeout(() => {
        setPhase("warning")
        play(AudioEvents.INTRO_GLITCH)
        play(AudioEvents.INTRO_WARNING_VOICE)
        playSubBass()
      }, 3000)
    )

    // Transition to INVITATION at 7s
    timers.push(
      setTimeout(() => {
        setPhase("invitation")
        play(AudioEvents.INTRO_WHISPER)
        // Focus input field
        setTimeout(() => {
          inputRef.current?.focus()
        }, 1000)
      }, 7000)
    )

    // Start idle loop at 20s if no action
    timers.push(
      setTimeout(() => {
        setIdleLoop(true)
      }, 20000)
    )

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(typeInterval)
      clearInterval(cursorInterval)
      stopSubBass()
    }
  }, [])

  // Audio: Sub-bass drone at 199Hz
  const playSubBass = () => {
    if (typeof window === "undefined") return
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return

    audioContextRef.current = new AudioContext()
    oscillatorRef.current = audioContextRef.current.createOscillator()
    gainNodeRef.current = audioContextRef.current.createGain()

    oscillatorRef.current.type = "sine"
    oscillatorRef.current.frequency.setValueAtTime(199, audioContextRef.current.currentTime)
    gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
    gainNodeRef.current.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 2)

    oscillatorRef.current.connect(gainNodeRef.current)
    gainNodeRef.current.connect(audioContextRef.current.destination)
    oscillatorRef.current.start()
  }

  const stopSubBass = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      oscillatorRef.current.disconnect()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  // Handle user input
  const handleEnter = () => {
    const input = userInput.trim().toUpperCase()
    const validCommands = ["THE VOID"]
    
    if (phase === "invitation" && validCommands.includes(input)) {
      setPhase("entry")
      stopSubBass()
      playTransitionSound()

      // Complete after transition
      setTimeout(() => {
        setPhase("complete")
        localStorage.setItem("void_intro_seen", "true")
        onComplete()
      }, 2000)
    } else if (phase === "invitation") {
      // Wrong command - shake effect
      setInputError(true)
      play(AudioEvents.UI_ERROR)
      setTimeout(() => setInputError(false), 500)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
    if (e.target.value.length > 0) {
      play(AudioEvents.INTRO_BOOT_BEEP)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEnter()
    }
  }

  const playTransitionSound = () => {
    play(AudioEvents.INTRO_METALLIC_SLAM)
    play(AudioEvents.INTRO_WHITE_NOISE_SWEEP)
  }

  // Keyboard listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Allow typing in input field during invitation phase
      if (phase === "invitation") {
        return // Input field handles this
      }
      
      // For other phases, allow skip with Enter/Space
      if (e.key === "Enter" || e.key === " ") {
        if (phase === "boot" || phase === "warning") {
          // Skip to invitation
          setPhase("invitation")
          play(AudioEvents.INTRO_WHISPER)
          setTimeout(() => {
            inputRef.current?.focus()
          }, 100)
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [phase])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuNSIvPjwvc3ZnPg==')] animate-grain" />
      </div>

      {/* CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-black/5 to-transparent bg-[length:100%_4px] animate-scanline" />
      </div>

      <AnimatePresence mode="wait">
        {/* BOOT PHASE */}
        {phase === "boot" && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <pre className="font-mono text-[#d6d8df] text-xl md:text-2xl tracking-wider whitespace-pre-wrap">
              {bootText}
              {showCursor && <span className="text-[#00f0ff] animate-pulse">_</span>}
            </pre>
            
            {/* Glitch effect on text */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{
                  opacity: [0, 0.3, 0],
                  x: [0, -2, 2, 0],
                }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="text-[#ff0032] mix-blend-screen"
              >
                <pre className="font-mono text-xl md:text-2xl tracking-wider whitespace-pre-wrap">
                  {bootText}
                </pre>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* WARNING PHASE */}
        {phase === "warning" && (
          <motion.div
            key="warning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl px-8"
          >
            <motion.div
              animate={{
                filter: ["invert(0)", "invert(1)", "invert(0)"],
              }}
              transition={{
                duration: 0.3,
                times: [0, 0.5, 1],
              }}
            >
              <h1 className="font-mono text-2xl md:text-4xl font-bold text-[#ff0032] mb-8 tracking-widest">
                WARNING
              </h1>
            </motion.div>

            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="space-y-6"
            >
              <p className="font-mono text-lg md:text-xl text-[#d6d8df] tracking-wide leading-relaxed">
                THE VOID IS NOT A GAME.
              </p>
              <p className="font-mono text-lg md:text-xl text-[#d6d8df] tracking-wide leading-relaxed">
                THE VOID IS NOT A PLACE.
              </p>
              <p className="font-mono text-lg md:text-xl text-[#d6d8df] tracking-wide leading-relaxed glow-text">
                THE VOID IS A MIRROR.
              </p>
            </motion.div>

            {/* Emissive glow */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-full h-full bg-gradient-radial from-[#7b00ff]/20 via-transparent to-transparent blur-3xl"
              />
            </div>
          </motion.div>
        )}

        {/* INVITATION PHASE */}
        {phase === "invitation" && (
          <motion.div
            key="invitation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            {/* Chrome logo formation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="mb-12"
            >
              <div className="relative inline-block">
                <h1 className="font-['Orbitron'] text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#d6d8df] via-white to-[#00f0ff] chrome-text">
                  VOID
                </h1>
                
                {/* Glow layers */}
                <div className="absolute inset-0 -z-10">
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-6xl md:text-8xl font-black text-[#00f0ff] blur-xl opacity-60"
                  >
                    VOID
                  </motion.div>
                </div>

                {/* RGB split effect */}
                <motion.div
                  animate={{
                    x: [-1, 1, -1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 0.1,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 text-6xl md:text-8xl font-black text-[#ff0032] mix-blend-screen -z-20"
                >
                  VOID
                </motion.div>
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1 }}
              className="space-y-6"
            >
              <p className="font-mono text-xl md:text-2xl text-[#d6d8df] mb-4 tracking-widest">
                WELCOME TO THE VOID.
              </p>
              
              {/* Command input */}
              <div className="max-w-md mx-auto">
                <p className="font-mono text-sm text-[#00f0ff]/60 mb-2 tracking-wider">
                  TYPE COMMAND TO PROCEED:
                </p>
                <motion.div
                  animate={inputError ? {
                    x: [-10, 10, -10, 10, 0],
                  } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="THE VOID"
                    className="w-full px-4 py-3 bg-black/80 border-2 border-[#00f0ff]/30 text-[#00f0ff] font-mono text-lg tracking-widest uppercase placeholder:text-[#00f0ff]/20 focus:border-[#00f0ff] focus:outline-none focus:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
                    style={{
                      textShadow: inputError ? '0 0 10px rgba(255, 0, 50, 0.8)' : '0 0 10px rgba(0, 240, 255, 0.5)',
                      borderColor: inputError ? '#ff0032' : undefined,
                    }}
                    maxLength={20}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </motion.div>
                <motion.p
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="font-mono text-xs text-[#00f0ff]/40 mt-2 tracking-wider text-center"
                >
                  {inputError ? (
                    <span className="text-[#ff0032]">ACCESS DENIED</span>
                  ) : (
                    <>TYPE: "THE VOID"</>
                  )}
                </motion.p>
              </div>
            </motion.div>

            {/* Whisper text (idle loop) */}
            {idleLoop && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-20 left-0 right-0 text-center font-mono text-sm text-[#ff0032] tracking-widest"
              >
                You can still turn back...
              </motion.p>
            )}

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: window.innerHeight + 50,
                  }}
                  animate={{
                    y: -50,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "linear",
                  }}
                  className="absolute w-1 h-1 bg-[#d6d8df] rounded-full blur-sm"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ENTRY PHASE */}
        {phase === "entry" && (
          <motion.div
            key="entry"
            initial={{ opacity: 1 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [1, 1.5, 2],
              filter: ["blur(0px)", "blur(0px)", "blur(40px)"],
            }}
            transition={{ duration: 2, times: [0, 0.5, 1] }}
            className="text-center"
          >
            {/* White flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.1, 1] }}
              className="absolute inset-0 bg-white"
            />

            {/* Logo melt effect */}
            <motion.div
              animate={{
                y: [0, -100],
                opacity: [1, 0],
                filter: ["blur(0px)", "blur(20px)"],
              }}
              transition={{ duration: 2 }}
            >
              <h1 className="font-['Orbitron'] text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#d6d8df] to-transparent chrome-text">
                VOID
              </h1>
            </motion.div>

            {/* Liquid chrome drip */}
            <motion.div
              initial={{ scaleY: 0, originY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, ease: "easeIn" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-screen bg-gradient-to-b from-[#d6d8df] via-[#00f0ff] to-transparent opacity-80 blur-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0); }
          70% { transform: translate(0, 10%); }
          80% { transform: translate(-15%, 0); }
          90% { transform: translate(10%, 5%); }
        }

        @keyframes scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }

        .animate-grain {
          animation: grain 8s steps(10) infinite;
        }

        .animate-scanline {
          animation: scanline 8s linear infinite;
        }

        .chrome-text {
          text-shadow: 
            0 0 10px rgba(0, 240, 255, 0.8),
            0 0 20px rgba(0, 240, 255, 0.5),
            0 0 30px rgba(0, 240, 255, 0.3),
            0 0 40px rgba(123, 0, 255, 0.2);
        }

        .glow-text {
          text-shadow: 
            0 0 10px rgba(255, 0, 50, 0.8),
            0 0 20px rgba(123, 0, 255, 0.5);
        }

        @font-face {
          font-family: 'Orbitron';
          font-style: normal;
          font-weight: 900;
          src: url('https://fonts.gstatic.com/s/orbitron/v25/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6xpmIyXjU1pg.woff2') format('woff2');
        }
      `}</style>
    </div>
  )
}
