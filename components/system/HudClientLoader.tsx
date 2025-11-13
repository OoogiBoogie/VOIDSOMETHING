// components/system/HudClientLoader.tsx
"use client";

import dynamic from "next/dynamic";
import ClientApp from "@/components/system/ClientApp";

const VoidGameShell = dynamic(() => import("@/components/game/VoidGameShell"), { ssr: false });

export default function HudClientLoader() {
  return (
    <ClientApp>
      <VoidGameShell />
    </ClientApp>
  );
}
