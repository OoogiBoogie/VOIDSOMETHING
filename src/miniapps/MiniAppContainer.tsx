/**
 * MINIAPP CONTAINER
 * 
 * Reusable window/panel component for rendering miniapps.
 * Handles both internal (React) and external (iframe) miniapps.
 */

'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { useMiniAppManager, useActiveMiniApp } from './MiniAppManager';
import type { VoidMessage, VoidInitMessage, VoidTxRequestMessage, VoidTxResultMessage } from './types';

/**
 * MiniApp Container Component
 * 
 * Renders the active miniapp in a draggable/resizable window.
 */
export function MiniAppContainer() {
  const { closeMiniApp } = useMiniAppManager();
  const activeMiniApp = useActiveMiniApp();
  const [isMinimized, setIsMinimized] = useState(false);
  
  if (!activeMiniApp) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto backdrop-blur-sm">
      <div 
        className={`bg-black border-2 border-cyan-500/50 rounded-lg shadow-2xl overflow-hidden transition-all ${
          isMinimized 
            ? 'w-80 h-16' 
            : 'w-[90vw] h-[85vh] max-w-6xl max-h-[800px]'
        }`}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-cyan-500/10 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeMiniApp.icon || '📦'}</span>
            <div>
              <h3 className="font-mono font-bold text-white text-sm">
                {activeMiniApp.name}
              </h3>
              {activeMiniApp.description && !isMinimized && (
                <p className="text-xs text-gray-400 font-mono">
                  {activeMiniApp.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Window Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-cyan-500/20 rounded transition-colors text-gray-400 hover:text-cyan-400"
              title={isMinimized ? 'Restore' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={closeMiniApp}
              className="p-1 hover:bg-red-500/20 rounded transition-colors text-gray-400 hover:text-red-400"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        {!isMinimized && (
          <div className="h-[calc(100%-3rem)] overflow-hidden">
            {activeMiniApp.type === 'internal' ? (
              <InternalMiniAppRenderer app={activeMiniApp} />
            ) : (
              <ExternalMiniAppRenderer app={activeMiniApp} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Internal Miniapp Renderer
 * Dynamically loads and renders React component
 */
function InternalMiniAppRenderer({ app }: { app: any }) {
  const [componentState, setComponentState] = useState<{ appId: string | null; component: React.ComponentType<any> | null }>({
    appId: null,
    component: null,
  });
  const [errorState, setErrorState] = useState<{ appId: string | null; message: string | null }>({
    appId: null,
    message: null,
  });
  const loaderMissing = !app.loader;
  
  useEffect(() => {
    if (loaderMissing) {
      return;
    }

    let isCancelled = false;

    app.loader()
      .then((module: any) => {
        if (isCancelled) return;
        setComponentState({ appId: app.id, component: module.default });
        setErrorState({ appId: app.id, message: null });
      })
      .catch((err: Error) => {
        if (isCancelled) return;
        console.error(`[MiniApp] Failed to load ${app.id}:`, err);
        setErrorState({ appId: app.id, message: err.message });
      });

    return () => {
      isCancelled = true;
    };
  }, [app, loaderMissing]);

  const LoadedComponent = componentState.appId === app.id ? componentState.component : null;
  const error = errorState.appId === app.id ? errorState.message : null;

  if (loaderMissing) {
    return (
      <div className="h-full flex items-center justify-center bg-black/90">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-yellow-400 font-mono">Miniapp loader not configured</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-black/90">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-400 font-mono">Failed to load miniapp</p>
          <p className="text-xs text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!LoadedComponent) {
    return (
      <div className="h-full flex items-center justify-center bg-black/90">
        <div className="text-cyan-400 font-mono">Loading miniapp...</div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-black/90">
        <div className="text-cyan-400 font-mono">Loading...</div>
      </div>
    }>
      <LoadedComponent />
    </Suspense>
  );
}

/**
 * External Miniapp Renderer
 * Renders iframe and handles postMessage communication
 */
function ExternalMiniAppRenderer({ app }: { app: any }) {
  const { runtime } = useMiniAppManager();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  /**
   * Send message to iframe
   */
  const sendToIframe = useCallback((message: VoidMessage) => {
    if (!iframeRef.current?.contentWindow) {
      console.warn('[MiniApp] Cannot send message - iframe not ready');
      return;
    }
    
    iframeRef.current.contentWindow.postMessage(message, '*'); // TODO: Restrict origin in production
  }, []);
  
  /**
   * Handle messages from iframe
   */
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // TODO: Validate event.origin in production
      
      const message = event.data as VoidMessage;
      
      switch (message.type) {
        case 'void:ready':
          console.log('[MiniApp] External app is ready');
          setIsReady(true);
          
          // Send init data
          const initMessage: VoidInitMessage = {
            type: 'void:init',
            payload: {
              walletAddress: runtime.walletAddress || '',
              chainId: runtime.chainId || 0,
              xp: runtime.netProfile?.xp || '0',
              level: runtime.netProfile?.level || 1,
              tier: runtime.xp?.tier || 'INITIATE',
              agentId: runtime.netProfile?.agentId || '',
              netProfile: runtime.netProfile,
            },
          };
          sendToIframe(initMessage);
          break;
          
        case 'void:txRequest':
          console.log('[MiniApp] Transaction request:', message);
          // TODO: Handle transaction request
          // This would use existing wallet provider to execute the tx
          const txMsg = message as VoidTxRequestMessage;
          
          // For now, send back error
          const resultMessage: VoidTxResultMessage = {
            type: 'void:txResult',
            requestId: txMsg.requestId,
            payload: {
              success: false,
              error: 'Transaction execution not yet implemented',
            },
          };
          sendToIframe(resultMessage);
          break;
          
        default:
          console.warn('[MiniApp] Unknown message type:', message.type);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [runtime, sendToIframe]);
  
  if (!app.url) {
    return (
      <div className="h-full flex items-center justify-center bg-black/90">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-yellow-400 font-mono">No URL configured</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full relative bg-black">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="text-cyan-400 font-mono">Connecting to external app...</div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={app.url}
        className="w-full h-full border-0"
        title={app.name}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
