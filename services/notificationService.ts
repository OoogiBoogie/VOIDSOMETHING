/**
 * Notification Service
 * Handles real-time notifications, WebSocket integration, and push system
 */

import type { Notification, HubKey, TabKey } from '@/hud/HUDTypes';

export interface NotificationPayload {
  type: Notification['type'];
  title: string;
  message: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  expiresAt?: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  categories: {
    social: boolean;
    quest: boolean;
    governance: boolean;
    defi: boolean;
    land: boolean;
    achievement: boolean;
  };
  muteUntil?: Date;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private subscriptions: Map<string, NotificationSubscription> = new Map();
  private wsConnection: WebSocket | null = null;
  private listeners: Map<string, ((notification: Notification) => void)[]> = new Map();

  /**
   * Initialize WebSocket connection for real-time notifications
   */
  async connect(userId: string): Promise<void> {
    // TODO: Replace with actual WebSocket endpoint
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

    try {
      this.wsConnection = new WebSocket(`${wsUrl}/notifications?userId=${userId}`);

      this.wsConnection.onopen = () => {
        console.log('[Notifications] WebSocket connected');
      };

      this.wsConnection.onmessage = (event) => {
        const notification: Notification = JSON.parse(event.data);
        this.handleIncomingNotification(notification);
      };

      this.wsConnection.onerror = (error) => {
        console.error('[Notifications] WebSocket error:', error);
      };

      this.wsConnection.onclose = () => {
        console.log('[Notifications] WebSocket closed');
        // TODO: Implement reconnection logic
        setTimeout(() => this.connect(userId), 5000);
      };
    } catch (error) {
      console.error('[Notifications] Failed to connect:', error);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Handle incoming notification
   */
  private handleIncomingNotification(notification: Notification): void {
    // Store notification
    this.notifications.set(notification.id, notification);

    // Trigger listeners
    const typeListeners = this.listeners.get(notification.type) || [];
    const allListeners = this.listeners.get('*') || [];
    [...typeListeners, ...allListeners].forEach(listener => listener(notification));

    // Show browser notification if permitted
    this.showBrowserNotification(notification);
  }

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<Notification> {
    // TODO: Replace with actual API call to send notification

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: payload.type,
      title: payload.title,
      body: payload.message,
      createdAt: new Date(),
      read: false,
      cta: payload.actionUrl ? {
        label: 'View',
        hub: 'world' as HubKey,
        tab: 'overview' as TabKey,
      } : undefined,
    };

    // Check user preferences
    const prefs = await this.getPreferences(userId);
    const categoryKey = this.getNotificationCategory(payload.type);

    if (prefs.channels.inApp && prefs.categories[categoryKey]) {
      this.notifications.set(notification.id, notification);
    }

    // Send via WebSocket if connected
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        action: 'send',
        userId,
        notification,
      }));
    }

    return notification;
  }

  /**
   * Get user notifications
   */
  async getNotifications(
    userId: string,
    filter?: {
      type?: Notification['type'];
      read?: boolean;
      limit?: number;
    }
  ): Promise<Notification[]> {
    // TODO: Replace with actual API call

    let notifications = Array.from(this.notifications.values());

    if (filter) {
      if (filter.type) {
        notifications = notifications.filter(n => n.type === filter.type);
      }
      if (filter.read !== undefined) {
        notifications = notifications.filter(n => n.read === filter.read);
      }
      if (filter.limit) {
        notifications = notifications.slice(0, filter.limit);
      }
    }

    // Sort by createdAt (newest first)
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    // TODO: Replace with actual API call
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    // TODO: Replace with actual API call
    Array.from(this.notifications.values()).forEach(n => {
      n.read = true;
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    // TODO: Replace with actual API call
    this.notifications.delete(notificationId);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    // TODO: Replace with actual API call
    return Array.from(this.notifications.values()).filter(n => !n.read).length;
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    // TODO: Replace with actual API call
    if (!this.preferences.has(userId)) {
      // Default preferences
      this.preferences.set(userId, {
        userId,
        channels: {
          inApp: true,
          email: true,
          push: true,
        },
        categories: {
          social: true,
          quest: true,
          governance: true,
          defi: true,
          land: true,
          achievement: true,
        },
      });
    }

    return this.preferences.get(userId)!;
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    // TODO: Replace with actual API call
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...preferences };
    this.preferences.set(userId, updated);
    return updated;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(
    userId: string,
    subscription: PushSubscription
  ): Promise<NotificationSubscription> {
    // TODO: Replace with actual API call

    const sub: NotificationSubscription = {
      id: `sub-${Date.now()}`,
      userId,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
      createdAt: new Date(),
    };

    this.subscriptions.set(sub.id, sub);
    return sub;
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(subscriptionId: string): Promise<void> {
    // TODO: Replace with actual API call
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Show browser notification
   */
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    new Notification(notification.title, {
      body: notification.body,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      tag: notification.id,
      requireInteraction: notification.type === 'governance',
    });
  }

  /**
   * Subscribe to notification type
   */
  on(type: Notification['type'] | '*', callback: (notification: Notification) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<number> {
    // TODO: Replace with actual bulk send API

    let sent = 0;
    for (const userId of userIds) {
      try {
        await this.sendNotification(userId, payload);
        sent++;
      } catch (error) {
        console.error(`Failed to send notification to ${userId}:`, error);
      }
    }

    return sent;
  }

  /**
   * Map notification type to category
   */
  private getNotificationCategory(type: Notification['type']): keyof NotificationPreferences['categories'] {
    const mapping: Record<Notification['type'], keyof NotificationPreferences['categories']> = {
      social: 'social',
      quest: 'quest',
      governance: 'governance',
      defi: 'defi',
      job: 'social', // Map job to social category
      creator: 'social', // Map creator to social category
      system: 'social', // Map system to social category
    };

    return mapping[type] || 'social';
  }
}

/**
 * Helper function to convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Export singleton instance
export const notificationService = new NotificationService();
