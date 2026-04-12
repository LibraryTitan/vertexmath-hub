/**
 * Portable Design Token System — VertexMath Suite
 *
 * Canonical source: paper-builder/src/shared/designTokens.ts
 * Copy into each app that needs the shared visual language:
 *   - vertexmath-hub/src/theme/designTokens.ts
 *   - VertexMath/src/mui/designTokens.js (strip types)
 *
 * Dark-first design with full light mode support.
 * All colors, spacing, typography, motion, shadows, blur, and z-index
 * are derived from Paper Builder's dashboard theme.
 */

// ─── Typography ──────────────────────────────────────────────────
export const FONT_HEADLINE = '"Manrope", sans-serif';
export const FONT_BODY = '"Inter", sans-serif';
export const FONT_STACK_HEADLINE = '"Manrope", "Inter", sans-serif';
export const FONT_STACK_BODY = '"Inter", "Roboto", "Helvetica", "Arial", sans-serif';

export const typography = {
  brand:        { size: '1.25rem', weight: 800, letterSpacing: '-0.01em', lineHeight: 1, family: FONT_HEADLINE },
  sectionHead:  { size: '1.5rem',  weight: 700, letterSpacing: 'normal',  lineHeight: 1.2, family: FONT_HEADLINE },
  navItem:      { size: '11px',    weight: 700, letterSpacing: '0.05em',  lineHeight: 1, family: FONT_BODY, textTransform: 'uppercase' as const },
  sectionLabel: { size: '10px',    weight: 700, letterSpacing: '0.2em',   lineHeight: 1, family: FONT_BODY, textTransform: 'uppercase' as const },
  cardTitle:    { size: '14px',    weight: 700, letterSpacing: 'normal',  lineHeight: 1.3, family: FONT_BODY },
  cardMeta:     { size: '10px',    weight: 700, letterSpacing: '-0.05em', lineHeight: 1, family: FONT_BODY, textTransform: 'uppercase' as const },
  badge:        { size: '9px',     weight: 800, letterSpacing: '0.08em',  lineHeight: 1, family: FONT_BODY, textTransform: 'uppercase' as const },
  body:         { size: '0.875rem', weight: 400, letterSpacing: 'normal', lineHeight: 1.5, family: FONT_BODY },
  bodySmall:    { size: '0.8125rem', weight: 400, letterSpacing: 'normal', lineHeight: 1.4, family: FONT_BODY },
  caption:      { size: '0.6875rem', weight: 400, letterSpacing: 'normal', lineHeight: 1.4, family: FONT_BODY },
  planPill:     { size: '10px',    weight: 700, letterSpacing: '0.08em',  lineHeight: 1, family: FONT_BODY, textTransform: 'uppercase' as const },
} as const;

// ─── Colors ──────────────────────────────────────────────────────

export interface ColorPalette {
  // Core surfaces
  background: string;
  surface: string;
  surfaceContainer: string;
  surfaceBright: string;
  outlineVariant: string;

  // Dashboard surfaces
  sidebarBg: string;
  sidebarHeaderBg: string;
  sidebarFooterBg: string;
  sidebarBorder: string;
  contentBg: string;
  cardBg: string;
  cardBorder: string;
  cardBorderHover: string;
  cardHover: string;
  topBarBg: string;
  topBarBorder: string;
  searchBg: string;
  searchBorder: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accent
  primary: string;
  onPrimary: string;
  primaryGradient: string;

  // Navigation
  activeNavBg: string;
  activeNavText: string;
  sectionLabel: string;
  divider: string;

  // Storage
  storageBg: string;
  storageBar: string;
  storageDanger: string;

  // Star / favorites
  starAccent: string;
}

export const darkColors: ColorPalette = {
  background:      '#0e0e0e',
  surface:         '#131313',
  surfaceContainer:'#1a1a1a',
  surfaceBright:   '#2c2c2c',
  outlineVariant:  '#484847',

  sidebarBg:       '#1a1a1a',
  sidebarHeaderBg: '#131313',
  sidebarFooterBg: '#131313',
  sidebarBorder:   'rgba(72, 72, 71, 0.1)',
  contentBg:       '#0e0e0e',
  cardBg:          '#131313',
  cardBorder:      'transparent',
  cardBorderHover: 'rgba(72, 72, 71, 0.2)',
  cardHover:       '#1a1a1a',
  topBarBg:        'rgba(14, 14, 14, 0.8)',
  topBarBorder:    'rgba(72, 72, 71, 0.1)',
  searchBg:        '#1a1a1a',
  searchBorder:    'transparent',

  textPrimary:     '#ffffff',
  textSecondary:   '#adaaaa',
  textMuted:       '#6b7280',

  primary:         '#74b9ff',
  onPrimary:       '#00355a',
  primaryGradient: 'linear-gradient(135deg, #74b9ff 0%, #5fa5ea 100%)',

  activeNavBg:     'rgba(116, 185, 255, 0.12)',
  activeNavText:   '#74b9ff',
  sectionLabel:    '#6b7280',
  divider:         'rgba(72, 72, 71, 0.1)',

  storageBg:       '#1a1a1a',
  storageBar:      '#74b9ff',
  storageDanger:   '#f85149',

  starAccent:      '#f59e0b',
};

export const lightColors: ColorPalette = {
  background:      '#f9fafb',
  surface:         '#ffffff',
  surfaceContainer:'#f3f4f6',
  surfaceBright:   '#e5e7eb',
  outlineVariant:  '#d1d5db',

  sidebarBg:       '#e5e7eb',
  sidebarHeaderBg: '#ffffff',
  sidebarFooterBg: '#ffffff',
  sidebarBorder:   'rgba(209, 213, 219, 0.3)',
  contentBg:       '#f3f4f6',
  cardBg:          '#ffffff',
  cardBorder:      'transparent',
  cardBorderHover: 'rgba(209, 213, 219, 0.4)',
  cardHover:       '#f3f4f6',
  topBarBg:        'rgba(243, 244, 246, 0.88)',
  topBarBorder:    'rgba(209, 213, 219, 0.3)',
  searchBg:        '#e5e7eb',
  searchBorder:    'transparent',

  textPrimary:     '#111827',
  textSecondary:   '#4b5563',
  textMuted:       '#6b7280',

  primary:         '#3b82f6',
  onPrimary:       '#ffffff',
  primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',

  activeNavBg:     '#f3f4f6',
  activeNavText:   '#3b82f6',
  sectionLabel:    '#6b7280',
  divider:         'rgba(209, 213, 219, 0.3)',

  storageBg:       '#e5e7eb',
  storageBar:      '#3b82f6',
  storageDanger:   '#ef4444',

  starAccent:      '#f59e0b',
};

// ─── MUI Theme Palette Overrides ─────────────────────────────────

export const darkMuiPalette = {
  primary:    { main: '#73b8fe', light: '#e3f2fd', dark: '#5fa5ea' },
  secondary:  { main: '#f48fb1' },
  background: { default: '#0e0e0e', paper: '#222222' },
  text:       { primary: '#ffffff', secondary: '#b0b0b0' },
  divider:    'rgba(72, 72, 71, 0.15)',
  action:     { hover: 'rgba(255, 255, 255, 0.06)', selected: 'rgba(115, 184, 254, 0.16)' },
  grey:       { 50: '#2c2c2c', 100: '#1a1a1a', 200: '#131313', 300: '#0e0e0e', 800: '#424242', 900: '#212121' },
} as const;

export const lightMuiPalette = {
  primary:    { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
  secondary:  { main: '#dc004e' },
  background: { default: '#f5f5f5', paper: '#ffffff' },
  text:       { primary: '#212121', secondary: '#666666' },
  divider:    '#e0e0e0',
  action:     { hover: 'rgba(0, 0, 0, 0.04)', selected: 'rgba(25, 118, 210, 0.08)' },
  grey:       { 50: '#fafafa', 100: '#f5f5f5', 200: '#eeeeee', 300: '#e0e0e0', 800: '#424242', 900: '#212121' },
} as const;

// ─── Layout ──────────────────────────────────────────────────────

export const layout = {
  sidebarWidth:    218,
  topBarHeight:    64,
  sidebarPadding:  12,
  contentPadding:  20,
  sectionGap:      56,
  cardWidth:       200,
  cardAspectRatio: '1 / 1.15',
  folderCardHeight:110,
  gridGap:         32,
  gridColumns:     'repeat(auto-fill, minmax(180px, 1fr))',
  searchMaxWidth:  672,
} as const;

// ─── Border Radius ───────────────────────────────────────────────

export const radius = {
  xs:    4,
  sm:    6,
  md:    8,
  base:  12,   // Global MUI shape.borderRadius
  lg:    16,   // Cards, thumbnails
  pill:  9999, // Storage bars, chips
} as const;

// ─── Shadows ─────────────────────────────────────────────────────

export const shadows = {
  dark: {
    storageGlow:    '0 0 8px rgba(116, 185, 255, 0.4)',
    storageDanger:  '0 0 8px rgba(248, 81, 73, 0.4)',
    floatingAmbient:'0 0 40px rgba(255, 255, 255, 0.08)',
    contextMenu:    '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    typeBadge:      '0 2px 8px rgba(0, 0, 0, 0.25)',
    toast:          '0 4px 12px rgba(0, 0, 0, 0.25)',
  },
  light: {
    storageGlow:    '0 0 8px rgba(59, 130, 246, 0.3)',
    storageDanger:  '0 0 8px rgba(239, 68, 68, 0.4)',
    floatingAmbient:'none',
    contextMenu:    '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    typeBadge:      '0 2px 8px rgba(0, 0, 0, 0.15)',
    toast:          '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
} as const;

// ─── Blur / Backdrop ─────────────────────────────────────────────

export const blur = {
  topBar:   'blur(12px)',
  glass:    'blur(20px)',
  controls: 'blur(4px)',
} as const;

// ─── Motion / Animation (Framer Motion) ──────────────────────────

export const motion = {
  /** Sidebar nav items, card hover, interactive buttons */
  springDefault: { type: 'spring' as const, stiffness: 400, damping: 17 },
  /** Snackbar entrance */
  springSnackbar: { type: 'spring' as const, stiffness: 350, damping: 18 },

  /** Card hover effect */
  cardHover:  { scale: 1.02, y: -3 },
  cardTap:    { scale: 0.98 },
  /** Nav/button hover effect */
  navHover:   { scale: 1.03 },
  navTap:     { scale: 0.97 },

  /** Snackbar enter/exit */
  snackbarInitial: { opacity: 0, y: 40, scale: 0.92 },
  snackbarAnimate: { opacity: 1, y: 0, scale: 1 },
  snackbarExit:    { opacity: 0, y: 20, scale: 0.95 },

  /** CSS transition shorthand tokens */
  cssQuick:    '0.15s',       // background-color, color
  cssMedium:   '200ms ease',  // all, opacity
  cssSlow:     '300ms',       // opacity fade
  cssStorage:  '0.3s ease',   // storage bar width
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────

export const zIndex = {
  sidebar:  60,
  topBar:   50,
  overlay:  5,
  controls: 2,
  toast:    999999,
} as const;

// ─── Accent Colors (folder tints, status indicators) ─────────────

export const accentColors = {
  blue:   { dark: '#74b9ff', light: '#3b82f6' },
  pink:   { dark: '#f06292', light: '#ec4899' },
  orange: { dark: '#ffb74d', light: '#f59e0b' },
  green:  { dark: '#66bb6a', light: '#10b981' },
  purple: { dark: '#ba68c8', light: '#8b5cf6' },
  red:    { dark: '#ef5350', light: '#ef4444' },
  teal:   { dark: '#26c6da', light: '#06b6d4' },
  gold:   { dark: '#f59e0b', light: '#d97706' },
} as const;

// ─── Pro CTA / Upgrade ──────────────────────────────────────────

export const proCta = {
  bg:          'rgba(30, 58, 95, 0.97)',
  border:      'rgba(245, 158, 11, 0.45)',
  iconColor:   '#f59e0b',
  titleColor:  '#f59e0b',
  buttonBg:    '#f59e0b',
  buttonText:  '#1e3a5f',
  buttonHover: '#d97706',
  descText:    'rgba(255, 255, 255, 0.85)',
} as const;

// ─── Utility: Get palette for mode ───────────────────────────────

export function getColors(mode: 'dark' | 'light'): ColorPalette {
  return mode === 'dark' ? darkColors : lightColors;
}

export function getShadows(mode: 'dark' | 'light') {
  return mode === 'dark' ? shadows.dark : shadows.light;
}

export function getMuiPalette(mode: 'dark' | 'light') {
  return mode === 'dark' ? darkMuiPalette : lightMuiPalette;
}
