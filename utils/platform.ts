// utils/platform.ts
// Detect if running inside Base mini app vs regular browser

/**
 * Check if the app is running inside the Base mini app
 * (vs regular web browser)
 */
export function isBaseMiniApp(): boolean {
  if (typeof window === "undefined") return false;

  // Check user agent for Base app indicators
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isBaseApp =
    userAgent.includes("base") ||
    userAgent.includes("coinbase") ||
    userAgent.includes("minikit");

  // Check for MiniKit SDK availability
  const hasMiniKitSDK = typeof (window as any).minikit !== "undefined";

  return isBaseApp || hasMiniKitSDK;
}

/**
 * Get platform-specific configuration
 */
export function getPlatformConfig() {
  const isMiniApp = isBaseMiniApp();

  return {
    isMiniApp,
    // Lower graphics quality in mini app
    graphicsQuality: isMiniApp ? "low" : "high",
    // Disable shadows in mini app for performance
    enableShadows: !isMiniApp,
    // Use lower DPI in mini app
    pixelRatio: isMiniApp ? 1 : (typeof window !== "undefined" ? window.devicePixelRatio : 1),
    // Show simplified HUD in mini app
    showFullHUD: !isMiniApp,
  };
}

/**
 * Send event to MiniKit (if running in Base app)
 */
export function sendMiniKitEvent(eventType: string, data: any) {
  if (!isBaseMiniApp()) return;

  const minikit = (window as any).minikit;
  if (!minikit?.sendEvent) return;

  try {
    minikit.sendEvent({
      type: eventType,
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to send MiniKit event:", error);
  }
}
