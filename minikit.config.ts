// minikit.config.ts
// Base Mini App Configuration for VOID Metaverse

const ROOT_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const minikitConfig = {
  // Step 1: Deploy first, then fill this after signing at base.dev/preview
  accountAssociation: {
    "header": "", // Will be filled after deployment
    "payload": "",
    "signature": ""
  },
  
  miniapp: {
    version: "1",
    name: "VOID Metaverse",
    subtitle: "PSX Agency Protocol on Base",
    description: "Enter a cyberpunk metaverse on Base. Explore districts, trade on DEX, earn XP, and build your agency in a 3D world.",
    
    // Screenshots (create these and add to /public folder)
    screenshotUrls: [
      `${ROOT_URL}/screenshots/void-gameplay.png`,
      `${ROOT_URL}/screenshots/void-hud.png`,
      `${ROOT_URL}/screenshots/void-dex.png`,
    ],
    
    // Icons and splash (512x512 recommended)
    iconUrl: `${ROOT_URL}/icon-512.png`,
    splashImageUrl: `${ROOT_URL}/splash-void.png`,
    splashBackgroundColor: "#000000",
    
    // URLs
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/minikit/webhook`,
    
    // Category and discoverability
    primaryCategory: "gaming",
    tags: ["metaverse", "gaming", "defi", "social", "3d", "base", "onchain", "cyberpunk"],
    
    // Hero image for app store
    heroImageUrl: `${ROOT_URL}/hero-void.png`,
    
    // SEO / Social
    tagline: "Cyberpunk metaverse on Base",
    ogTitle: "VOID - PSX Agency Protocol",
    ogDescription: "Enter the VOID: A cyberpunk metaverse powered by Base. Trade, explore, and build your agency.",
    ogImageUrl: `${ROOT_URL}/og-void.png`,
  },
} as const;

// Export types for TypeScript
export type MiniKitConfig = typeof minikitConfig;
