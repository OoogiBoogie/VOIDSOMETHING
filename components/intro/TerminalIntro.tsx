"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioEngine } from "@/features/audio/useAudioEngine";
import { AudioEvents } from "@/features/audio/audioEvents";

const INTRO_STORAGE_KEY = "void_terminal_intro_shown";

interface TerminalIntroProps {
  onComplete: () => void;
}

type Phase = "boot" | "matrix" | "password" | "complete";

export function TerminalIntro({ onComplete }: TerminalIntroProps) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { play } = useAudioEngine();

  // Skip if already shown this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shown = sessionStorage.getItem(INTRO_STORAGE_KEY);
      if (shown === "1") {
        onComplete();
        return;
      }

      // CRITICAL: Clear any wallet connection data on fresh terminal boot
      // Force users to explicitly select wallet each time
      // Clears RainbowKit's cached connections
      try {
        // Clear RainbowKit wallet cache
        Object.keys(localStorage).forEach(key => {
          if (
            key.startsWith('wagmi.') || 
            key.startsWith('rainbowkit.') ||
            key.includes('walletconnect') ||
            key.includes('wallet')
          ) {
            localStorage.removeItem(key);
          }
        });
        
        // Also clear any session storage wallet data
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('wallet') || key.includes('wagmi')) {
            sessionStorage.removeItem(key);
          }
        });
        
        console.log('[TerminalIntro] ✓ Cleared cached wallet connections - fresh start required');
      } catch (error) {
        console.warn('[TerminalIntro] Failed to clear wallet cache:', error);
      }
    }

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setCursorBlink((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [onComplete]);

  // Boot sequence
  useEffect(() => {
    if (phase !== "boot") return;

    const lines = [
      "> INITIALIZING VOID TERMINAL...",
      "> LOADING CYBERCITY CORE v3.14...",
      "> CHECKING BLOCKCHAIN CONNECTION... OK",
      "> CONNECTING TO BASE SEPOLIA [84532]... OK",
      "> MOUNTING 3D WORLD GRID [40x40]... OK",
      "> LINKING HUD ↔ SCENE BUS... OK",
      "> LOADING DEFI PROTOCOLS... OK",
      "> CLEARING CACHED WALLET SESSIONS... OK",
      "> INITIALIZING WEB3 WALLET LAYER... STANDBY",
      "> ACTIVATING RAINBOWKIT AUTH... READY",
      "",
      "> SYSTEM STATUS: ONLINE",
      "> WALLET SELECTION REQUIRED",
      "> AWAITING AUTHORIZATION...",
    ];

    let currentIndex = 0;
    const typeSpeed = 60;

    const typeTimer = setInterval(() => {
      if (currentIndex < lines.length) {
        setBootLines((prev) => [...prev, lines[currentIndex]]);
        play(AudioEvents.INTRO_BOOT_BEEP);
        currentIndex++;
      } else {
        clearInterval(typeTimer);
        setTimeout(() => {
          setPhase("matrix");
          play(AudioEvents.INTRO_GLITCH);
        }, 800);
      }
    }, typeSpeed);

    return () => clearInterval(typeTimer);
  }, [phase, play]);

  // Matrix phase timer
  useEffect(() => {
    if (phase === "matrix") {
      const timer = setTimeout(() => {
        setPhase("password");
        play(AudioEvents.INTRO_WARNING_VOICE);
        setTimeout(() => inputRef.current?.focus(), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, play]);

  // Handle password submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = passwordInput.trim().toUpperCase();

    if (input === "THE VOID" || input === "THEVOID") {
      setPhase("complete");
      play(AudioEvents.UI_SUCCESS);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      }

      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setPasswordError(true);
      play(AudioEvents.UI_ERROR);
      setTimeout(() => setPasswordError(false), 500);
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {/* Matrix rain background */}
      <div className="absolute inset-0 opacity-20">
        <MatrixRain />
      </div>

      {/* Terminal window */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-black/90 border-2 border-emerald-500/50 rounded-lg shadow-[0_0_60px_rgba(16,185,129,0.3)] overflow-hidden">
          {/* Terminal header */}
          <div className="bg-gradient-to-r from-emerald-900/80 to-cyan-900/80 px-4 py-3 flex items-center justify-between border-b border-emerald-500/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="font-mono text-xs text-emerald-400 tracking-wider">
              VOID://TERMINAL/v3.14
            </div>
            <button
              onClick={handleSkip}
              className="text-emerald-400/60 hover:text-emerald-400 text-xs font-mono transition-colors"
            >
              [SKIP]
            </button>
          </div>

          {/* Terminal content */}
          <div className="p-6 h-[600px] overflow-y-auto font-mono text-sm">
            <AnimatePresence mode="wait">
              {/* BOOT PHASE */}
              {phase === "boot" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1"
                >
                  {bootLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`${
                        line.includes("OK") || line.includes("READY")
                          ? "text-emerald-400"
                          : line.includes("STANDBY")
                          ? "text-yellow-400"
                          : "text-cyan-400"
                      }`}
                    >
                      {line}
                    </motion.div>
                  ))}
                  <div className="text-emerald-400">
                    {cursorBlink ? "█" : " "}
                  </div>
                </motion.div>
              )}

              {/* MATRIX PHASE */}
              {phase === "matrix" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  {/* ASCII Art */}
                  <pre className="text-emerald-400 text-xs md:text-sm leading-tight mb-8 whitespace-pre">
                    {String.raw`
  ██████╗ ███████╗██╗  ██╗    ██╗   ██╗ ██████╗ ██╗██████╗ 
  ██╔══██╗██╔════╝╚██╗██╔╝    ██║   ██║██╔═══██╗██║██╔══██╗
  ██████╔╝███████╗ ╚███╔╝     ██║   ██║██║   ██║██║██║  ██║
  ██╔═══╝ ╚════██║ ██╔██╗     ╚██╗ ██╔╝██║   ██║██║██║  ██║
  ██║     ███████║██╔╝ ██╗     ╚████╔╝ ╚██████╔╝██║██████╔╝
  ╚═╝     ╚══════╝╚═╝  ╚═╝      ╚═══╝   ╚═════╝ ╚═╝╚═════╝ 
                    `}
                  </pre>

                  <motion.div
                    animate={{
                      textShadow: [
                        "0 0 20px #10b981",
                        "0 0 40px #06ffa5",
                        "0 0 20px #10b981",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl md:text-4xl font-bold text-emerald-400 mb-4"
                  >
                    ENTER THE VOID
                  </motion.div>

                  <div className="text-cyan-400 text-sm">
                    A CYBERPUNK METAVERSE ON BASE
                  </div>
                </motion.div>
              )}

              {/* PASSWORD PHASE */}
              {phase === "password" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="text-red-400 border border-red-500/50 bg-red-500/10 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⚠️</span>
                      <span className="font-bold">UNAUTHORIZED ACCESS DETECTED</span>
                    </div>
                    <div className="text-sm text-red-300">
                      This terminal is restricted to PSX Agency operatives only.
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="border border-emerald-500/30 bg-emerald-500/5 p-4 rounded"
                  >
                    <div className="text-emerald-400 mb-3">
                      <div className="text-sm opacity-70">
                        "Turn back now... or enter the password and join us."
                      </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">&gt;</span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className={`flex-1 bg-transparent border-b-2 ${
                            passwordError
                              ? "border-red-500 animate-shake"
                              : "border-emerald-500/50"
                          } text-emerald-400 outline-none px-2 py-1 font-mono placeholder:text-emerald-700`}
                          placeholder="ENTER PASSWORD..."
                          autoComplete="off"
                        />
                        {cursorBlink && (
                          <span className="text-emerald-400">█</span>
                        )}
                      </div>

                      {passwordError && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400 text-xs"
                        >
                          ACCESS DENIED. Try again...
                        </motion.div>
                      )}

                      <div className="text-xs text-gray-500 font-mono">
                        Hint: "THE VOID" (case-insensitive)
                      </div>
                    </form>
                  </motion.div>

                  <div className="text-cyan-400/60 text-xs">
                    <div>&gt; WALLET: PRIVY + ONCHAINKIT</div>
                    <div>&gt; CHAIN: BASE SEPOLIA (84532)</div>
                    <div>&gt; ENGINE: THREE.JS + REACT</div>
                  </div>
                </motion.div>
              )}

              {/* COMPLETE PHASE */}
              {phase === "complete" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-emerald-400 text-2xl font-bold mb-4">
                    ✓ ACCESS GRANTED
                  </div>
                  <div className="text-cyan-400">
                    INITIALIZING WORLD INTERFACE...
                  </div>
                  <div className="mt-4 flex justify-center gap-1">
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    >
                      █
                    </motion.span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    >
                      █
                    </motion.span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    >
                      █
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

/** Matrix rain background effect */
function MatrixRain() {
  const [columns, setColumns] = useState<number[]>([]);

  useEffect(() => {
    const numColumns = Math.floor(window.innerWidth / 20);
    setColumns(Array.from({ length: numColumns }, (_, i) => i));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {columns.map((col) => (
        <MatrixColumn key={col} index={col} />
      ))}
    </div>
  );
}

function MatrixColumn({ index }: { index: number }) {
  const [chars, setChars] = useState("");
  const charset = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ";

  useEffect(() => {
    const updateChars = () => {
      const length = Math.floor(Math.random() * 20) + 10;
      const newChars = Array.from(
        { length },
        () => charset[Math.floor(Math.random() * charset.length)]
      ).join("\n");
      setChars(newChars);
    };

    updateChars();
    const interval = setInterval(updateChars, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <pre
      className="absolute text-emerald-400 font-mono text-xs leading-tight whitespace-pre opacity-40"
      style={{
        left: `${index * 20}px`,
        top: 0,
        animation: `matrix-fall ${Math.random() * 10 + 5}s linear infinite`,
        animationDelay: `${Math.random() * 5}s`,
      }}
    >
      {chars}
      <style jsx>{`
        @keyframes matrix-fall {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </pre>
  );
}
