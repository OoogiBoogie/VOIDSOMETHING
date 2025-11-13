/**
 * SYSTEM NOTIFICATION CENTER
 * 
 * Global toast/notification layer for transaction status, errors, and system events.
 * Lives high in the component tree (VoidRuntimeProvider or VoidGameShell).
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader } from 'lucide-react';

// ================================
// TYPES
// ================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // milliseconds (0 = permanent until dismissed)
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SystemNotificationContext {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  
  // Convenience methods
  showInfo: (title: string, message?: string, duration?: number) => string;
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showLoading: (title: string, message?: string) => string; // Returns ID to dismiss later
  
  // Transaction helpers
  showTxPending: (txHash: string) => string;
  showTxSuccess: (txHash: string, action?: { label: string; onClick: () => void }) => string;
  showTxError: (error: string) => string;
}

const NotificationContext = createContext<SystemNotificationContext | null>(null);

// ================================
// PROVIDER
// ================================

export function SystemNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // Default 5s
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-dismiss if duration > 0
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration: duration ?? 8000 });
  }, [addNotification]);

  const showLoading = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'loading', title, message, duration: 0 }); // Permanent
  }, [addNotification]);

  // Transaction helpers
  const showTxPending = useCallback((txHash: string) => {
    return showLoading(
      'Transaction Pending',
      `TX: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`
    );
  }, [showLoading]);

  const showTxSuccess = useCallback((txHash: string, action?: { label: string; onClick: () => void }) => {
    return addNotification({
      type: 'success',
      title: 'Transaction Confirmed',
      message: `TX: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      action,
      duration: 6000,
    });
  }, [addNotification]);

  const showTxError = useCallback((error: string) => {
    return showError('Transaction Failed', error);
  }, [showError]);

  const value: SystemNotificationContext = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showLoading,
    showTxPending,
    showTxSuccess,
    showTxError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationRenderer notifications={notifications} onDismiss={removeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotifications(): SystemNotificationContext {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within SystemNotificationProvider');
  }
  return context;
}

// ================================
// RENDERER
// ================================

interface NotificationRendererProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

function NotificationRenderer({ notifications, onDismiss }: NotificationRendererProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
}

// ================================
// TOAST COMPONENT
// ================================

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300); // Wait for exit animation
  };

  const { icon, iconColor, bgClass, borderClass } = getNotificationStyle(notification.type);

  return (
    <div
      className={`pointer-events-auto transform transition-all duration-300 ${
        isLeaving ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`rounded-2xl border backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden ${bgClass} ${borderClass}`}
      >
        <div className="px-4 py-3 flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-bio-silver mb-0.5">
              {notification.title}
            </div>
            {notification.message && (
              <div className="text-xs text-bio-silver/70 break-words">
                {notification.message}
              </div>
            )}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-xs font-semibold text-signal-green hover:text-cyber-cyan underline transition-colors"
              >
                {notification.action.label}
              </button>
            )}
          </div>

          {/* Dismiss button */}
          {notification.type !== 'loading' && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-6 h-6 rounded-lg bg-black/40 border border-bio-silver/20 hover:border-bio-silver/40 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-bio-silver/60" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================
// STYLING HELPER
// ================================

function getNotificationStyle(type: NotificationType) {
  switch (type) {
    case 'success':
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        iconColor: 'text-signal-green',
        bgClass: 'bg-black/90',
        borderClass: 'border-signal-green/40',
      };
    case 'error':
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        iconColor: 'text-signal-red',
        bgClass: 'bg-black/90',
        borderClass: 'border-signal-red/40',
      };
    case 'warning':
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        iconColor: 'text-signal-yellow',
        bgClass: 'bg-black/90',
        borderClass: 'border-signal-yellow/40',
      };
    case 'loading':
      return {
        icon: <Loader className="w-5 h-5 animate-spin" />,
        iconColor: 'text-cyber-cyan',
        bgClass: 'bg-black/90',
        borderClass: 'border-cyber-cyan/40',
      };
    case 'info':
    default:
      return {
        icon: <Info className="w-5 h-5" />,
        iconColor: 'text-bio-silver',
        bgClass: 'bg-black/90',
        borderClass: 'border-bio-silver/40',
      };
  }
}
