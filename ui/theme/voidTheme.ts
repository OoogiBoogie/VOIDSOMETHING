/**
 * VOID PROTOCOL - UNIFIED THEME SYSTEM
 * 
 * Single source of truth for all colors, gradients, shadows, and design tokens.
 * Applied consistently across WORLD, DEFI, CREATOR, DAO, and AI OPS hubs.
 * 
 * Based on existing DEFI screenshot aesthetic: deep blue/black base with neon purple/teal accents.
 */

export const voidTheme = {
  colors: {
    // Base backgrounds
    bg: "#02030A",
    bgAlt: "#050715",
    bgDeep: "#000208",
    
    // Panel/surface colors
    panelBg: "rgba(2, 4, 20, 0.92)",
    panelBgSolid: "#0a0d1f",
    panelBorder: "#1b2138",
    panelBorderActive: "#2d3454",
    
    // Neon accent colors
    neonPurple: "#8f3bff",
    neonTeal: "#09f0c8",
    neonPink: "#ff3bd4",
    neonBlue: "#3b8fff",
    
    // Text hierarchy
    textPrimary: "#f5f7ff",
    textSecondary: "#9ea3c7",
    textTertiary: "#5d6384",
    textMuted: "#3a3f5c",
    
    // Semantic colors
    accentPositive: "#29ff9a",
    accentWarning: "#ffd43b",
    accentDanger: "#ff4b81",
    accentInfo: "#09f0c8",
    
    // Interactive states
    inputBg: "rgba(10, 13, 31, 0.6)",
    inputBorder: "#252b47",
    inputBorderFocus: "#8f3bff",
    inputBorderHover: "#3d4565",
    
    // District/zone colors
    districtDefi: "#8f3bff",
    districtCreator: "#09f0c8",
    districtDao: "#ff3bd4",
    districtAi: "#3b8fff",
    districtNeutral: "#5d6384",
    
    // Legacy/common aliases (for backward compatibility)
    primary: "#8f3bff",      // → neonPurple
    accent: "#09f0c8",       // → neonTeal
    success: "#29ff9a",      // → accentPositive
    text: "#f5f7ff",         // → textPrimary
  },
  
  gradients: {
    // Top bar gradient
    topBar: "linear-gradient(90deg, #8f3bff 0%, #09f0c8 40%, #8f3bff 100%)",
    
    // Button gradients
    buttonPrimary: "linear-gradient(135deg, rgba(143,59,255,1) 0%, rgba(9,240,200,1) 100%)",
    buttonSecondary: "linear-gradient(135deg, rgba(59,143,255,1) 0%, rgba(143,59,255,1) 100%)",
    buttonDanger: "linear-gradient(135deg, rgba(255,75,129,1) 0%, rgba(255,59,212,1) 100%)",
    
    // Panel gradients
    panelHeader: "linear-gradient(180deg, rgba(143,59,255,0.15) 0%, transparent 100%)",
    panelGlow: "radial-gradient(circle at center, rgba(143,59,255,0.2) 0%, transparent 70%)",
    
    // Track/progress gradients
    trackGlow: "linear-gradient(90deg, #8f3bff 0%, #09f0c8 100%)",
    progressBar: "linear-gradient(90deg, #8f3bff 0%, #09f0c8 50%, #ff3bd4 100%)",
    
    // Overlay gradients
    overlayTop: "linear-gradient(180deg, rgba(2,3,10,0.95) 0%, transparent 100%)",
    overlayBottom: "linear-gradient(0deg, rgba(2,3,10,0.95) 0%, transparent 100%)",
  },
  
  shadows: {
    // Glow effects
    glowPurple: "0 0 24px rgba(143, 59, 255, 0.55)",
    glowTeal: "0 0 16px rgba(9, 240, 200, 0.5)",
    glowPink: "0 0 20px rgba(255, 59, 212, 0.45)",
    glowBlue: "0 0 18px rgba(59, 143, 255, 0.5)",
    
    // Glow (strong)
    glowPurpleStrong: "0 0 32px rgba(143, 59, 255, 0.8), 0 0 64px rgba(143, 59, 255, 0.4)",
    glowTealStrong: "0 0 28px rgba(9, 240, 200, 0.75), 0 0 56px rgba(9, 240, 200, 0.35)",
    
    // Panel shadows
    panelShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    panelShadowHover: "0 12px 48px rgba(0, 0, 0, 0.5)",
    
    // Elevated surfaces
    elevated: "0 4px 16px rgba(0, 0, 0, 0.3)",
    elevatedHover: "0 6px 24px rgba(0, 0, 0, 0.4)",
    
    // Inset shadows
    inset: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
    
    // Legacy/common aliases (for backward compatibility)
    glow: "0 0 24px rgba(143, 59, 255, 0.55)",              // → glowPurple
    glowLarge: "0 0 32px rgba(143, 59, 255, 0.8), 0 0 64px rgba(143, 59, 255, 0.4)",  // → glowPurpleStrong
    textGlow: "0 0 24px rgba(143, 59, 255, 0.55)",          // → glowPurple
  },
  
  radii: {
    // Panel/window radii
    panel: 14,
    panelSmall: 8,
    panelLarge: 20,
    
    // Button/interactive radii
    button: 999,
    chip: 999,
    input: 8,
    
    // Other radii
    card: 12,
    badge: 6,
  },
  
  spacing: {
    // Base spacing scale (px)
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    
    // Layout spacing
    panelPadding: 20,
    sectionGap: 16,
  },
  
  typography: {
    // Font families
    fontPrimary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
    
    // Font sizes (px)
    sizeXs: 11,
    sizeSm: 13,
    sizeBase: 15,
    sizeMd: 17,
    sizeLg: 20,
    sizeXl: 24,
    size2xl: 32,
    
    // Font weights
    weightNormal: 400,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,
    
    // Line heights
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.7,
  },
  
  animation: {
    // Transition durations (ms)
    fast: 150,
    normal: 250,
    slow: 400,
    
    // Easing functions
    easeOut: "cubic-bezier(0.33, 1, 0.68, 1)",
    easeIn: "cubic-bezier(0.32, 0, 0.67, 0)",
    easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    
    // Spring easing
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  
  zIndex: {
    // Z-index scale
    background: 0,
    base: 1,
    overlay: 10,
    panel: 100,
    modal: 1000,
    notification: 2000,
    tooltip: 3000,
  },
} as const;

/**
 * Type helper for theme access
 */
export type VoidTheme = typeof voidTheme;

/**
 * CSS Custom Properties mapping
 * Use this to inject theme variables into the DOM
 */
export const getThemeVars = () => ({
  // Colors
  "--void-bg": voidTheme.colors.bg,
  "--void-bg-alt": voidTheme.colors.bgAlt,
  "--void-bg-deep": voidTheme.colors.bgDeep,
  
  "--void-panel-bg": voidTheme.colors.panelBg,
  "--void-panel-bg-solid": voidTheme.colors.panelBgSolid,
  "--void-panel-border": voidTheme.colors.panelBorder,
  "--void-panel-border-active": voidTheme.colors.panelBorderActive,
  
  "--void-neon-purple": voidTheme.colors.neonPurple,
  "--void-neon-teal": voidTheme.colors.neonTeal,
  "--void-neon-pink": voidTheme.colors.neonPink,
  "--void-neon-blue": voidTheme.colors.neonBlue,
  
  "--void-text-primary": voidTheme.colors.textPrimary,
  "--void-text-secondary": voidTheme.colors.textSecondary,
  "--void-text-tertiary": voidTheme.colors.textTertiary,
  "--void-text-muted": voidTheme.colors.textMuted,
  
  "--void-positive": voidTheme.colors.accentPositive,
  "--void-warning": voidTheme.colors.accentWarning,
  "--void-danger": voidTheme.colors.accentDanger,
  "--void-info": voidTheme.colors.accentInfo,
  
  "--void-input-bg": voidTheme.colors.inputBg,
  "--void-input-border": voidTheme.colors.inputBorder,
  "--void-input-border-focus": voidTheme.colors.inputBorderFocus,
  "--void-input-border-hover": voidTheme.colors.inputBorderHover,
  
  // Gradients
  "--void-gradient-top-bar": voidTheme.gradients.topBar,
  "--void-gradient-button-primary": voidTheme.gradients.buttonPrimary,
  "--void-gradient-button-secondary": voidTheme.gradients.buttonSecondary,
  "--void-gradient-track": voidTheme.gradients.trackGlow,
  
  // Shadows
  "--void-glow-purple": voidTheme.shadows.glowPurple,
  "--void-glow-teal": voidTheme.shadows.glowTeal,
  "--void-glow-pink": voidTheme.shadows.glowPink,
  "--void-shadow-panel": voidTheme.shadows.panelShadow,
  "--void-shadow-elevated": voidTheme.shadows.elevated,
  
  // Radii
  "--void-radius-panel": `${voidTheme.radii.panel}px`,
  "--void-radius-button": `${voidTheme.radii.button}px`,
  "--void-radius-input": `${voidTheme.radii.input}px`,
  "--void-radius-card": `${voidTheme.radii.card}px`,
  
  // Spacing
  "--void-spacing-xs": `${voidTheme.spacing.xs}px`,
  "--void-spacing-sm": `${voidTheme.spacing.sm}px`,
  "--void-spacing-md": `${voidTheme.spacing.md}px`,
  "--void-spacing-lg": `${voidTheme.spacing.lg}px`,
  "--void-spacing-xl": `${voidTheme.spacing.xl}px`,
  
  // Typography
  "--void-font-primary": voidTheme.typography.fontPrimary,
  "--void-font-mono": voidTheme.typography.fontMono,
  "--void-font-size-base": `${voidTheme.typography.sizeBase}px`,
  
  // Animation
  "--void-transition-fast": `${voidTheme.animation.fast}ms`,
  "--void-transition-normal": `${voidTheme.animation.normal}ms`,
  "--void-ease-out": voidTheme.animation.easeOut,
});

/**
 * Helper to convert theme vars to React CSSProperties
 */
export const getThemeStyles = (): React.CSSProperties => {
  const vars = getThemeVars();
  return vars as React.CSSProperties;
};
