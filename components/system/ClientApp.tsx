// components/system/ClientApp.tsx
"use client";

// Providers are handled in layout.tsx via RootProviders
// This component is now just a passthrough
export default function ClientApp({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
