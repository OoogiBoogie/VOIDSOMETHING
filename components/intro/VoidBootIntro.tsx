"use client";

import React, { useEffect, useState } from "react";

const INTRO_STORAGE_KEY = "psx_void_intro_shown";

type Props = {
  onDone?: () => void;
};

export function VoidBootIntro({ onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const [glitchText, setGlitchText] = useState("BOOTING VOID ENVIRONMENT");

  useEffect(() => {
    // Only show once per session
    const alreadyShown =
      typeof window !== "undefined" &&
      sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
    if (alreadyShown) {
      setVisible(false);
      onDone?.();
      return;
    }

    // glitch text effect
    const base = "ENTER THE PSX VOID";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%*";

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const mixed = base
        .split("")
        .map((ch, i) => {
          if (frame < 8) {
            // heavy glitch at start
            return chars[Math.floor(Math.random() * chars.length)];
          }
          if (frame < 18 && Math.random() > 0.6) {
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return ch;
        })
        .join("");
      setGlitchText(mixed);
      if (frame > 24) {
        clearInterval(interval);
        setGlitchText(base);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [onDone]);

  const closeIntro = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    }
    setVisible(false);
    onDone?.();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // any key closes
      closeIntro();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      {/* matrix background */}
      <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
        <MatrixRain />
      </div>

      {/* center panel */}
      <div className="relative max-w-2xl w-full px-6">
        <div className="rounded-3xl border border-purple-500/70 bg-black/80 shadow-[0_0_60px_rgba(168,85,255,0.6)] px-6 py-6 md:px-8 md:py-8">
          <div className="font-mono text-xs md:text-sm text-emerald-400 mb-3 tracking-[0.25em] uppercase">
            // psx void boot sequence
          </div>

          {/* ASCII / logo block */}
          <pre className="font-mono text-[9px] md:text-xs leading-[1.1] text-purple-300 mb-4 whitespace-pre overflow-x-auto">
{String.raw`  ██▓███    ██████  ▄▄▄▄    ▓██   ██▓
 ▓██░  ██▒▒██    ▒ ▓█████▄   ▒██  ██▒
 ▓██░ ██▓▒░ ▓██▄   ▒██▒ ▄██   ▒██ ██░
 ▒██▄█▓▒ ▒  ▒   ██▒▒██░█▀     ░ ▐██▓░
 ▒██▒ ░  ░▒██████▒▒░▓█  ▀█▓   ░ ██▒▓░
 ▒▓▒░ ░  ░▒ ▒▓▒ ▒ ░░▒▓███▀▒    ██▒▒▒ 
 ░▒ ░     ░ ░▒  ░ ░▒░▒   ░   ▓██ ░▒░ 
 ░░       ░  ░  ░   ░    ░   ▒ ▒ ░░  
              ░      ░        ░ ░     
                       ░       ░ ░    `}
          </pre>

          {/* glitch line */}
          <div className="font-mono text-sm md:text-base text-emerald-400 mb-1">
            {glitchText}
          </div>
          <div className="font-mono text-[11px] text-slate-400 mb-4">
            base sepolia · chain id 84532 · protocol online
          </div>

          {/* logs */}
          <div className="bg-black/60 border border-emerald-500/30 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
            <div>&gt; initializing world grid [40x40] ... OK</div>
            <div>&gt; linking HUD &lt;-&gt; 3d world bus ... OK</div>
            <div>&gt; loading defi core [void / usdc] ... OK</div>
            <div>&gt; mounting land registry [base sepolia] ... OK</div>
            <div>&gt; wallet layer [privy + coinbase / base] ... STANDBY</div>
            <div>&gt; rewards engine ... PENDING · phase 3</div>
            <div>&gt; creator tools ... PENDING · phase 3</div>
          </div>

          {/* controls */}
          <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <button
              onClick={closeIntro}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-emerald-400 text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-slate-950 shadow-[0_0_30px_rgba(168,85,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              press any key to jack in
            </button>
            <div className="font-mono text-[10px] text-slate-500 text-right">
              tip: intro plays once per session · clear sessionStorage to replay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** super simple matrix rain effect */
function MatrixRain() {
  const columns = 40;
  const rows = 24;
  const charset = "01#@$%&";

  const lines = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () =>
      charset[Math.floor(Math.random() * charset.length)]
    ).join("")
  ).join("\n");

  return (
    <pre className="w-full h-full text-[8px] md:text-[10px] text-emerald-400/40 font-mono p-4 animate-[matrix-scroll_2.2s_linear_infinite] whitespace-pre-wrap">
      {lines}
      <style jsx>{`
        @keyframes matrix-scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-25%);
          }
        }
      `}</style>
    </pre>
  );
}
