// hooks/usePlatformHUD.ts
"use client";

import { useEffect, useState } from "react";
import { DESKTOP } from "@/components/desktop";
import { LITE } from "@/components/mobile/lite";
import { ROAM } from "@/components/mobile/roam";

export type Mode = "desktop" | "lite-landscape" | "roam-portrait";

export function usePlatformHUD(): { mode: Mode; HUD: typeof DESKTOP } {
  const [mode, setMode] = useState<Mode>("desktop");

  useEffect(() => {
    const mqPortrait = window.matchMedia("(orientation: portrait)");
    const mqMaxW = window.matchMedia("(max-width: 1024px)");

    const update = () => {
      if (mqMaxW.matches) {
        setMode(mqPortrait.matches ? "roam-portrait" : "lite-landscape");
      } else {
        setMode("desktop");
      }
    };

    update();
    mqPortrait.addEventListener("change", update);
    mqMaxW.addEventListener("change", update);
    return () => {
      mqPortrait.removeEventListener("change", update);
      mqMaxW.removeEventListener("change", update);
    };
  }, []);

  const HUD = mode === "desktop" ? DESKTOP : mode === "roam-portrait" ? ROAM : LITE;
  return { mode, HUD };
}
