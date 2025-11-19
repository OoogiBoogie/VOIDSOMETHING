/**
 * PHASE 5.1 — HUD TOAST QUEUE
 * 
 * Manages toast notification queue with smart replacement logic.
 * Prevents spam, handles priorities, and ensures smooth UX.
 */

import { toast, type ExternalToast } from "sonner";

interface QueuedToast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  priority: number; // Higher = more important
  timestamp: number;
  options?: ExternalToast;
}

class HUDToastQueue {
  private queue: QueuedToast[] = [];
  private activeToastId: string | null = null;
  private isProcessing = false;
  private lastToastTime = 0;
  private minInterval = 800; // Minimum ms between toasts

  /**
   * Add toast to queue
   */
  add(
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    priority = 5,
    options?: ExternalToast
  ): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    
    // Check for duplicate message in last 5 seconds
    const isDuplicate = this.queue.some(
      (t) => t.message === message && Date.now() - t.timestamp < 5000
    );
    
    if (isDuplicate) {
      console.log("[ToastQueue] Skipping duplicate:", message);
      return;
    }

    const queuedToast: QueuedToast = {
      id,
      message,
      type,
      priority,
      timestamp: Date.now(),
      options,
    };

    // Insert based on priority
    const insertIndex = this.queue.findIndex((t) => t.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(queuedToast);
    } else {
      this.queue.splice(insertIndex, 0, queuedToast);
    }

    // Start processing if not already
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Add success toast (priority 7)
   */
  success(message: string, options?: ExternalToast): void {
    this.add(message, "success", 7, options);
  }

  /**
   * Add error toast (priority 10 - highest)
   */
  error(message: string, options?: ExternalToast): void {
    this.add(message, "error", 10, options);
  }

  /**
   * Add info toast (priority 5 - default)
   */
  info(message: string, options?: ExternalToast): void {
    this.add(message, "info", 5, options);
  }

  /**
   * Add warning toast (priority 8)
   */
  warning(message: string, options?: ExternalToast): void {
    this.add(message, "warning", 8, options);
  }

  /**
   * Process queue sequentially with timing control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const next = this.queue.shift();
      if (!next) break;

      // Throttle toasts
      const timeSinceLast = Date.now() - this.lastToastTime;
      if (timeSinceLast < this.minInterval) {
        await this.wait(this.minInterval - timeSinceLast);
      }

      // Show toast
      this.showToast(next);
      this.lastToastTime = Date.now();

      // Wait for toast duration before showing next
      const duration = next.options?.duration || 3000;
      await this.wait(duration);
    }

    this.isProcessing = false;
  }

  /**
   * Show individual toast
   */
  private showToast(queuedToast: QueuedToast): void {
    const { message, type, options } = queuedToast;

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        toast.warning(message, options);
        break;
      case "info":
      default:
        toast.info(message, options);
        break;
    }

    this.activeToastId = queuedToast.id;
  }

  /**
   * Clear all queued toasts
   */
  clear(): void {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Get queue length (for debugging)
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Wait helper
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Global singleton
export const hudToastQueue = new HUDToastQueue();
