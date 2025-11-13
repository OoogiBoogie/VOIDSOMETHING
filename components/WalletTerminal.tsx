"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";

interface WalletTerminalProps {
  onStart: () => void;
}

type Phase = "init" | "connecting" | "connected" | "error";

export function WalletTerminal({ onStart }: WalletTerminalProps) {
  const { authenticated, login, ready: privyReady, user } = usePrivy();
  const { address, isConnected } = useAccount();
  
  const [phase, setPhase] = useState<Phase>("init");
  const [logs, setLogs] = useState<string[]>([]);
  const [cursorBlink, setCursorBlink] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Initial boot logs
  useEffect(() => {
    const bootLogs = [
      "> WALLET AUTHENTICATION MODULE LOADED",
      "> PRIVY PROVIDER: ONLINE",
      "> BASE SEPOLIA RPC: CONNECTED",
      "> SUPPORTED CHAINS: [BASE, BASE SEPOLIA]",
      "> LOGIN METHODS: EMAIL | GOOGLE | TWITTER | DISCORD | WALLET",
      "",
      "> AWAITING USER AUTHENTICATION...",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < bootLogs.length) {
        setLogs((prev) => [...prev, bootLogs[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Monitor connection status
  useEffect(() => {
    console.log("🔵 [WALLET] Status check:", { authenticated, isConnected, address });
    
    // If already authenticated, skip to connected state
    if (authenticated && address) {
      console.log("🟢 [WALLET] User already authenticated!");
      setPhase("connected");
      setLogs((prev) => {
        // Only add success logs if not already added
        const hasSuccess = prev.some(log => log.includes("AUTHENTICATION SUCCESSFUL"));
        if (!hasSuccess) {
          return [
            ...prev,
            "",
            "> EXISTING SESSION DETECTED",
            "> AUTHENTICATION SUCCESSFUL",
            `> WALLET ADDRESS: ${address}`,
            `> CHAIN: BASE SEPOLIA (84532)`,
            "> READY TO ENTER WORLD",
          ];
        }
        return prev;
      });
    } else if (authenticated && !address) {
      console.warn("🟡 [WALLET] Authenticated but no address yet");
      // Wait for address to load
    }
  }, [authenticated, isConnected, address]);

  const handleConnect = async () => {
    console.log("🔵 [WALLET] Connect button clicked");
    console.log("🔵 [WALLET] Privy ready:", privyReady);
    console.log("🔵 [WALLET] Authenticated:", authenticated);
    
    // If already authenticated, just skip to world
    if (authenticated) {
      console.log("🟢 [WALLET] Already authenticated, entering world...");
      setPhase("connected");
      return;
    }
    
    if (!privyReady) {
      console.error("🔴 [WALLET] Privy not ready");
      setConnectionError("Privy not ready. Please refresh the page.");
      setPhase("error");
      return;
    }

    try {
      setPhase("connecting");
      setLogs((prev) => [
        ...prev,
        "",
        "> INITIATING PRIVY AUTHENTICATION...",
        "> OPENING WALLET SELECTION MODAL...",
      ]);

      console.log("🔵 [WALLET] Calling login()...");
      
      // Try to detect popup blockers immediately
      const testPopup = window.open('', '', 'width=1,height=1');
      if (testPopup) {
        testPopup.close();
        console.log("🟢 [WALLET] Popup test passed");
      } else {
        console.warn("🟡 [WALLET] Popup might be blocked");
        setLogs((prev) => [
          ...prev,
          "> WARNING: POPUP BLOCKER DETECTED",
          "> PLEASE ALLOW POPUPS FOR THIS SITE",
        ]);
      }
      
      // Call Privy login
      await login();
      
      console.log("🟢 [WALLET] Login completed");
      // Success handling is done in useEffect above
    } catch (error: any) {
      console.error("🔴 [WALLET] Connection error:", error);
      setPhase("error");
      
      let errorMessage = error?.message || "Failed to connect wallet";
      if (errorMessage.includes("timeout") || errorMessage.includes("popup")) {
        errorMessage = "Popup blocked or timed out. Check browser settings and allow popups for this site.";
      }
      
      setConnectionError(errorMessage);
      setLogs((prev) => [
        ...prev,
        "",
        `> ERROR: ${error?.message || "Connection failed"}`,
        "> PLEASE TRY AGAIN",
      ]);
    }
  };

  const handleRetry = () => {
    setPhase("init");
    setConnectionError(null);
    setLogs((prev) => [...prev, "", "> RETRYING CONNECTION..."]);
    handleConnect();
  };

  // User can enter world if authenticated with Privy (address may come async)
  const canEnterWorld = authenticated && (address || user);

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {/* Matrix rain background */}
      <div className="absolute inset-0 opacity-15">
        <MatrixRain />
      </div>

      {/* Terminal window */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-black/90 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden">
          {/* Terminal header */}
          <div className="bg-gradient-to-r from-cyan-900/80 to-blue-900/80 px-4 py-3 flex items-center justify-between border-b border-cyan-500/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="font-mono text-xs text-cyan-400 tracking-wider">
              WALLET://AUTH/PRIVY
            </div>
            <div className="w-16" /> {/* Spacer */}
          </div>

          {/* Terminal content */}
          <div className="p-6 min-h-[500px] max-h-[600px] overflow-y-auto font-mono text-sm">
            {/* Boot logs */}
            <div className="space-y-1 mb-4">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                  className={`${
                    log.includes("ERROR") || log.includes("FAILED")
                      ? "text-red-400"
                      : log.includes("SUCCESSFUL") || log.includes("CONNECTED")
                      ? "text-emerald-400"
                      : log.includes("AWAITING") || log.includes("INITIATING")
                      ? "text-yellow-400"
                      : "text-cyan-400"
                  }`}
                >
                  {log}
                </motion.div>
              ))}
            </div>

            {/* Main UI based on phase */}
            <AnimatePresence mode="wait">
              {/* INIT - Ready to connect */}
              {phase === "init" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* ASCII Wallet Icon */}
                  <pre className="text-cyan-400 text-xs leading-tight text-center mb-4">
{`
    ╔═══════════════════════════════╗
    ║   🔐 WALLET AUTHENTICATION   ║
    ╚═══════════════════════════════╝
    
       ┌─────────────────────┐
       │  💼  SELECT METHOD  │
       └─────────────────────┘
`}
                  </pre>

                  {/* Connection options */}
                  <div className="border border-cyan-500/30 bg-cyan-500/5 rounded p-4">
                    <div className="text-cyan-400 text-sm mb-3 font-bold">
                      AVAILABLE AUTHENTICATION METHODS:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <div>• EMAIL (MAGIC LINK)</div>
                      <div>• GOOGLE OAUTH</div>
                      <div>• TWITTER OAUTH</div>
                      <div>• DISCORD OAUTH</div>
                      <div>• WEB3 WALLET (METAMASK, COINBASE)</div>
                      <div>• WALLETCONNECT</div>
                    </div>
                  </div>

                  {/* Connect button */}
                  <button
                    onClick={handleConnect}
                    disabled={!privyReady}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg rounded border-2 border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {privyReady ? (
                      "[ INITIATE WALLET CONNECTION ]"
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        LOADING PRIVY...
                      </span>
                    )}
                  </button>

                  {!privyReady && (
                    <div className="text-yellow-400 text-xs text-center">
                      Initializing authentication provider...
                    </div>
                  )}

                  {privyReady && (
                    <div className="text-yellow-400 text-xs text-center border border-yellow-500/30 bg-yellow-500/5 p-3 rounded">
                      ⚠️ If popup doesn't appear, check your browser popup blocker settings
                      <br />
                      <span className="text-gray-400 text-[10px]">
                        Chrome: Look for blocked icon in address bar | Firefox: Check toolbar notification
                      </span>
                    </div>
                  )}

                  <div className="text-gray-500 text-xs text-center font-mono">
                    <div>NETWORK: BASE SEPOLIA (CHAIN ID: 84532)</div>
                    <div>PROVIDER: PRIVY + WAGMI + VIEM</div>
                  </div>
                </motion.div>
              )}

              {/* CONNECTING - In progress */}
              {phase === "connecting" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                  <div className="text-cyan-400 text-lg font-bold mb-2">
                    CONNECTING TO WALLET...
                  </div>
                  <div className="text-gray-400 text-sm">
                    Please complete authentication in the popup window
                  </div>
                  <div className="mt-6 flex justify-center gap-1">
                    <motion.span
                      className="text-cyan-400"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    >
                      █
                    </motion.span>
                    <motion.span
                      className="text-cyan-400"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    >
                      █
                    </motion.span>
                    <motion.span
                      className="text-cyan-400"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    >
                      █
                    </motion.span>
                  </div>
                </motion.div>
              )}

              {/* CONNECTED - Success */}
              {phase === "connected" && canEnterWorld && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Success banner */}
                  <div className="border-2 border-emerald-500 bg-emerald-500/10 rounded p-4 text-center">
                    <div className="text-emerald-400 text-2xl font-bold mb-2">
                      ✓ AUTHENTICATION SUCCESSFUL
                    </div>
                    <div className="font-mono text-sm text-emerald-300">
                      WALLET CONNECTED TO BASE SEPOLIA
                    </div>
                  </div>

                  {/* Wallet info */}
                  <div className="border border-cyan-500/30 bg-cyan-500/5 rounded p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">ADDRESS:</div>
                        <div className="text-cyan-400 font-mono break-all">
                          {address}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">CHAIN:</div>
                        <div className="text-cyan-400 font-mono">
                          BASE SEPOLIA (84532)
                        </div>
                      </div>
                      {user?.email && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">EMAIL:</div>
                          <div className="text-cyan-400 font-mono text-xs">
                            {user.email.address}
                          </div>
                        </div>
                      )}
                      {user?.google && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">GOOGLE:</div>
                          <div className="text-cyan-400 font-mono text-xs">
                            {user.google.email}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enter world button */}
                  <button
                    onClick={onStart}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-xl rounded border-2 border-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] transition-all animate-pulse"
                  >
                    [ ENTER THE VOID ]
                  </button>

                  <div className="text-center text-gray-400 text-xs font-mono">
                    <div>READY TO SPAWN AT PSX HQ</div>
                    <div>CONTROLS: WASD • SHIFT • E • TAB</div>
                  </div>
                </motion.div>
              )}

              {/* ERROR - Connection failed */}
              {phase === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="border-2 border-red-500 bg-red-500/10 rounded p-4">
                    <div className="text-red-400 text-xl font-bold mb-2">
                      ⚠️ CONNECTION ERROR
                    </div>
                    <div className="text-red-300 text-sm font-mono">
                      {connectionError || "Failed to authenticate wallet"}
                    </div>
                  </div>

                  <button
                    onClick={handleRetry}
                    className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-lg rounded border-2 border-yellow-400 hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all"
                  >
                    [ RETRY CONNECTION ]
                  </button>

                  <div className="text-gray-400 text-xs text-center">
                    If issue persists, check console for errors
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status indicator */}
            <div className="mt-6 pt-4 border-t border-cyan-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    phase === "connected"
                      ? "bg-emerald-400 animate-pulse"
                      : phase === "connecting"
                      ? "bg-yellow-400 animate-pulse"
                      : phase === "error"
                      ? "bg-red-400"
                      : "bg-gray-400"
                  }`}
                />
                <span className="text-gray-400 font-mono">
                  STATUS: {phase.toUpperCase()}
                </span>
              </div>
              <div className="text-gray-500 font-mono">
                {cursorBlink ? "█" : " "}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Matrix rain background effect (reused from TerminalIntro) */
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
      className="absolute text-cyan-400 font-mono text-xs leading-tight whitespace-pre opacity-40"
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
