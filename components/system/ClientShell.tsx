// components/system/ClientShell.tsx
"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

type AnyProps = Record<string, unknown>;

// Tiny error boundary so one tab never crashes the whole app
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  state = { error: undefined as Error | undefined };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-4 text-sm">
          <div className="mb-2 font-semibold">Something went wrong.</div>
          <pre className="opacity-70 whitespace-pre-wrap">{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export type ClientShellProps = {
  /** Path to a client component (no file extension). Example: "hud/VoidHudApp" */
  modulePath: string;
  /** Props to forward into that component */
  forwardedProps?: AnyProps;
  /** Optional fallback while the module loads */
  fallback?: React.ReactNode;
};

export default function ClientShell({ modulePath, forwardedProps, fallback }: ClientShellProps) {
  // One dynamic import that disables SSR for whatever module you point at.
  const ClientModule = dynamic(() => import(/* webpackChunkName: "client-shell-[request]" */ `@/${modulePath}`), {
    ssr: false,
    loading: () => <>{fallback ?? <div className="p-4">Loading…</div>}</>,
  });

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback ?? <div className="p-4">Loading…</div>}>
        {/* Your RootProviders (wagmi, Privy, Query, Theme) should live INSIDE the client tree */}
        <ClientModule {...(forwardedProps ?? {})} />
      </Suspense>
    </ErrorBoundary>
  );
}
