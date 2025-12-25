/**
 * Design System
 * Professional design presets, color palettes, and component styles
 * Inspired by professional tools like Lovable.dev, Bolt.new, Squarespace
 */

// ============================================
// COLOR PALETTES
// ============================================

export interface ColorPalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  gradient?: string;
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  modern: {
    primary: '#6366f1',        // Indigo
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    secondary: '#f43f5e',      // Rose
    accent: '#06b6d4',         // Cyan
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: '#0f172a',
    textMuted: '#64748b',
    textInverse: '#ffffff',
    border: '#e2e8f0',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  darkMode: {
    primary: '#818cf8',
    primaryDark: '#6366f1',
    primaryLight: '#a5b4fc',
    secondary: '#fb7185',
    accent: '#22d3ee',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    textInverse: '#0f172a',
    border: '#334155',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    gradient: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
  },
  startup: {
    primary: '#8b5cf6',        // Purple
    primaryDark: '#7c3aed',
    primaryLight: '#a78bfa',
    secondary: '#f97316',      // Orange
    accent: '#14b8a6',         // Teal
    background: '#fafaf9',
    surface: '#ffffff',
    surfaceHover: '#f5f5f4',
    text: '#1c1917',
    textMuted: '#78716c',
    textInverse: '#ffffff',
    border: '#e7e5e4',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
  },
  corporate: {
    primary: '#2563eb',        // Blue
    primaryDark: '#1d4ed8',
    primaryLight: '#3b82f6',
    secondary: '#059669',      // Green
    accent: '#0891b2',
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceHover: '#f3f4f6',
    text: '#111827',
    textMuted: '#6b7280',
    textInverse: '#ffffff',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#dc2626',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
  },
  minimal: {
    primary: '#171717',
    primaryDark: '#0a0a0a',
    primaryLight: '#404040',
    secondary: '#737373',
    accent: '#525252',
    background: '#ffffff',
    surface: '#fafafa',
    surfaceHover: '#f5f5f5',
    text: '#171717',
    textMuted: '#737373',
    textInverse: '#ffffff',
    border: '#e5e5e5',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
  },
  gradient: {
    primary: '#ec4899',
    primaryDark: '#db2777',
    primaryLight: '#f472b6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#fdf4ff',
    surface: '#ffffff',
    surfaceHover: '#fae8ff',
    text: '#1e1b4b',
    textMuted: '#6b7280',
    textInverse: '#ffffff',
    border: '#f3e8ff',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)',
  },
  glassmorphism: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    secondary: '#f43f5e',
    accent: '#8b5cf6',
    background: 'rgba(255, 255, 255, 0.1)',
    surface: 'rgba(255, 255, 255, 0.15)',
    surfaceHover: 'rgba(255, 255, 255, 0.25)',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    textInverse: '#0f172a',
    border: 'rgba(255, 255, 255, 0.2)',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%)',
  },
};

// ============================================
// TYPOGRAPHY SCALES
// ============================================

export interface TypographyScale {
  fontFamily: string;
  headingFamily: string;
  h1: { size: string; weight: string; lineHeight: string };
  h2: { size: string; weight: string; lineHeight: string };
  h3: { size: string; weight: string; lineHeight: string };
  h4: { size: string; weight: string; lineHeight: string };
  body: { size: string; weight: string; lineHeight: string };
  small: { size: string; weight: string; lineHeight: string };
  tiny: { size: string; weight: string; lineHeight: string };
}

export const TYPOGRAPHY_SCALES: Record<string, TypographyScale> = {
  modern: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFamily: 'Inter, system-ui, sans-serif',
    h1: { size: '3.5rem', weight: '700', lineHeight: '1.1' },
    h2: { size: '2.5rem', weight: '700', lineHeight: '1.2' },
    h3: { size: '1.75rem', weight: '600', lineHeight: '1.3' },
    h4: { size: '1.25rem', weight: '600', lineHeight: '1.4' },
    body: { size: '1rem', weight: '400', lineHeight: '1.6' },
    small: { size: '0.875rem', weight: '400', lineHeight: '1.5' },
    tiny: { size: '0.75rem', weight: '400', lineHeight: '1.5' },
  },
  elegant: {
    fontFamily: 'Libre Baskerville, Georgia, serif',
    headingFamily: 'Playfair Display, Georgia, serif',
    h1: { size: '3rem', weight: '700', lineHeight: '1.2' },
    h2: { size: '2.25rem', weight: '700', lineHeight: '1.25' },
    h3: { size: '1.5rem', weight: '600', lineHeight: '1.35' },
    h4: { size: '1.125rem', weight: '600', lineHeight: '1.4' },
    body: { size: '1.0625rem', weight: '400', lineHeight: '1.7' },
    small: { size: '0.9375rem', weight: '400', lineHeight: '1.6' },
    tiny: { size: '0.8125rem', weight: '400', lineHeight: '1.5' },
  },
  bold: {
    fontFamily: 'DM Sans, system-ui, sans-serif',
    headingFamily: 'DM Sans, system-ui, sans-serif',
    h1: { size: '4rem', weight: '800', lineHeight: '1.05' },
    h2: { size: '2.75rem', weight: '700', lineHeight: '1.15' },
    h3: { size: '1.875rem', weight: '700', lineHeight: '1.25' },
    h4: { size: '1.375rem', weight: '600', lineHeight: '1.35' },
    body: { size: '1rem', weight: '400', lineHeight: '1.6' },
    small: { size: '0.875rem', weight: '500', lineHeight: '1.5' },
    tiny: { size: '0.75rem', weight: '500', lineHeight: '1.5' },
  },
};

// ============================================
// SPACING SCALES
// ============================================

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  section: string;
  container: string;
}

export const SPACING_SCALES: Record<string, SpacingScale> = {
  compact: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    '4xl': '4rem',
    section: '3rem',
    container: '1rem',
  },
  comfortable: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    section: '5rem',
    container: '2rem',
  },
  spacious: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
    '4xl': '8rem',
    section: '7rem',
    container: '3rem',
  },
};

// ============================================
// STYLE PRESETS
// ============================================

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'bold' | 'minimal' | 'creative';
  colors: keyof typeof COLOR_PALETTES;
  typography: keyof typeof TYPOGRAPHY_SCALES;
  spacing: keyof typeof SPACING_SCALES;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadows: 'none' | 'subtle' | 'medium' | 'dramatic';
  buttonStyle: 'solid' | 'outline' | 'ghost' | 'gradient';
  cardStyle: 'flat' | 'elevated' | 'outlined' | 'glass';
  animations: boolean;
}

export const STYLE_PRESETS: Record<string, StylePreset> = {
  modernSaas: {
    id: 'modernSaas',
    name: 'Modern SaaS',
    description: 'Clean, professional look perfect for software products',
    category: 'modern',
    colors: 'modern',
    typography: 'modern',
    spacing: 'comfortable',
    borderRadius: 'lg',
    shadows: 'medium',
    buttonStyle: 'solid',
    cardStyle: 'elevated',
    animations: true,
  },
  darkPro: {
    id: 'darkPro',
    name: 'Dark Professional',
    description: 'Sleek dark theme for tech-forward brands',
    category: 'modern',
    colors: 'darkMode',
    typography: 'modern',
    spacing: 'comfortable',
    borderRadius: 'lg',
    shadows: 'subtle',
    buttonStyle: 'solid',
    cardStyle: 'elevated',
    animations: true,
  },
  startupBold: {
    id: 'startupBold',
    name: 'Startup Bold',
    description: 'Energetic, colorful design for disruptive startups',
    category: 'bold',
    colors: 'startup',
    typography: 'bold',
    spacing: 'spacious',
    borderRadius: 'xl',
    shadows: 'dramatic',
    buttonStyle: 'gradient',
    cardStyle: 'elevated',
    animations: true,
  },
  corporateTrust: {
    id: 'corporateTrust',
    name: 'Corporate Trust',
    description: 'Professional, trustworthy appearance for enterprise',
    category: 'classic',
    colors: 'corporate',
    typography: 'modern',
    spacing: 'comfortable',
    borderRadius: 'md',
    shadows: 'subtle',
    buttonStyle: 'solid',
    cardStyle: 'outlined',
    animations: false,
  },
  minimalClean: {
    id: 'minimalClean',
    name: 'Minimal Clean',
    description: 'Ultra-clean, typography-focused design',
    category: 'minimal',
    colors: 'minimal',
    typography: 'modern',
    spacing: 'spacious',
    borderRadius: 'sm',
    shadows: 'none',
    buttonStyle: 'outline',
    cardStyle: 'flat',
    animations: false,
  },
  gradientVibrant: {
    id: 'gradientVibrant',
    name: 'Gradient Vibrant',
    description: 'Eye-catching gradients for creative brands',
    category: 'creative',
    colors: 'gradient',
    typography: 'bold',
    spacing: 'comfortable',
    borderRadius: 'xl',
    shadows: 'medium',
    buttonStyle: 'gradient',
    cardStyle: 'elevated',
    animations: true,
  },
  glassFuturistic: {
    id: 'glassFuturistic',
    name: 'Glass Futuristic',
    description: 'Frosted glass effects for cutting-edge look',
    category: 'creative',
    colors: 'glassmorphism',
    typography: 'modern',
    spacing: 'comfortable',
    borderRadius: 'xl',
    shadows: 'subtle',
    buttonStyle: 'ghost',
    cardStyle: 'glass',
    animations: true,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPresetStyles(presetId: string) {
  const preset = STYLE_PRESETS[presetId] || STYLE_PRESETS.modernSaas;
  return {
    preset,
    colors: COLOR_PALETTES[preset.colors],
    typography: TYPOGRAPHY_SCALES[preset.typography],
    spacing: SPACING_SCALES[preset.spacing],
  };
}

export function generateTailwindClasses(preset: StylePreset): Record<string, string> {
  const borderRadiusMap = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  
  const shadowMap = {
    none: 'shadow-none',
    subtle: 'shadow-sm',
    medium: 'shadow-md',
    dramatic: 'shadow-xl',
  };
  
  return {
    borderRadius: borderRadiusMap[preset.borderRadius],
    shadow: shadowMap[preset.shadows],
    button: preset.buttonStyle === 'gradient' 
      ? 'bg-gradient-to-r from-primary to-secondary text-white' 
      : preset.buttonStyle === 'outline'
      ? 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white'
      : preset.buttonStyle === 'ghost'
      ? 'text-primary bg-transparent hover:bg-primary/10'
      : 'bg-primary text-white hover:bg-primary-dark',
    card: preset.cardStyle === 'glass'
      ? 'bg-white/10 backdrop-blur-lg border border-white/20'
      : preset.cardStyle === 'elevated'
      ? 'bg-white shadow-lg'
      : preset.cardStyle === 'outlined'
      ? 'bg-white border border-gray-200'
      : 'bg-white',
  };
}

// ============================================
// PAGE TEMPLATES
// ============================================

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'landing' | 'marketing' | 'portfolio' | 'saas' | 'ecommerce' | 'blog';
  sections: string[];
  defaultPreset: string;
  thumbnail?: string;
}

export const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  saasLanding: {
    id: 'saasLanding',
    name: 'SaaS Landing Page',
    description: 'Modern landing page for software products with hero, features, pricing, and CTA',
    category: 'saas',
    sections: ['hero', 'logoCloud', 'features', 'howItWorks', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    defaultPreset: 'modernSaas',
  },
  startupLaunch: {
    id: 'startupLaunch',
    name: 'Startup Launch',
    description: 'Bold, energetic page for product launches with waitlist signup',
    category: 'landing',
    sections: ['heroWithEmail', 'problemSolution', 'features', 'socialProof', 'cta'],
    defaultPreset: 'startupBold',
  },
  portfolioCreative: {
    id: 'portfolioCreative',
    name: 'Creative Portfolio',
    description: 'Showcase your work with style',
    category: 'portfolio',
    sections: ['heroMinimal', 'projectGrid', 'about', 'skills', 'contact'],
    defaultPreset: 'minimalClean',
  },
  agencyServices: {
    id: 'agencyServices',
    name: 'Agency Services',
    description: 'Professional agency website with services and case studies',
    category: 'marketing',
    sections: ['hero', 'services', 'caseStudies', 'team', 'testimonials', 'contact', 'footer'],
    defaultPreset: 'corporateTrust',
  },
  productShowcase: {
    id: 'productShowcase',
    name: 'Product Showcase',
    description: 'Highlight a single product with features and benefits',
    category: 'ecommerce',
    sections: ['productHero', 'features', 'gallery', 'specs', 'reviews', 'cta'],
    defaultPreset: 'gradientVibrant',
  },
};

export function getPresetById(id: string): StylePreset {
  return STYLE_PRESETS[id] || STYLE_PRESETS.modernSaas;
}

export function getTemplateById(id: string): PageTemplate {
  return PAGE_TEMPLATES[id] || PAGE_TEMPLATES.saasLanding;
}

export function getAllPresets(): StylePreset[] {
  return Object.values(STYLE_PRESETS);
}

export function getAllTemplates(): PageTemplate[] {
  return Object.values(PAGE_TEMPLATES);
}
