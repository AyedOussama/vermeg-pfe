// Modern Color Palette for Vermeg Landing Page
// Professional, accessible, and visually appealing color scheme

export const modernColors = {
  // Primary Brand Colors
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Secondary Purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main purple
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Accent Colors
  accent: {
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4', // Main cyan
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    emerald: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Main emerald
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899', // Main pink
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
  },

  // Neutral Colors (Slate-based)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Semantic Colors
  semantic: {
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#047857',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
    },
    info: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
    },
  },

  // Gradient Combinations
  gradients: {
    primary: 'from-red-600 to-purple-600',
    primaryLight: 'from-red-50 to-purple-50',
    hero: 'from-slate-900 via-red-900 to-purple-900',
    accent: 'from-red-400 via-purple-400 to-pink-400',
    subtle: 'from-slate-50 to-red-50/30',
    warm: 'from-emerald-50 to-teal-50',
    cool: 'from-red-50 to-purple-50/30',
  },

  // Background Variations
  backgrounds: {
    primary: 'bg-slate-50',
    secondary: 'bg-white',
    accent: 'bg-gradient-to-br from-slate-50 to-red-50/30',
    dark: 'bg-slate-900',
    hero: 'bg-gradient-to-br from-slate-900 via-red-900 to-purple-900',
  },

  // Text Colors
  text: {
    primary: 'text-slate-800',
    secondary: 'text-slate-600',
    muted: 'text-slate-400',
    inverse: 'text-white',
    accent: 'text-red-600',
    gradient: 'bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent',
  },

  // Border Colors
  borders: {
    light: 'border-slate-200',
    medium: 'border-slate-300',
    accent: 'border-red-200',
    gradient: 'border border-white/20',
  },

  // Shadow Variations
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    colored: 'shadow-lg shadow-red-500/10',
  },
};

// Utility functions for color usage
export const getGradientClass = (type: keyof typeof modernColors.gradients) => {
  return `bg-gradient-to-r ${modernColors.gradients[type]}`;
};

export const getTextGradientClass = (type: keyof typeof modernColors.gradients) => {
  return `bg-gradient-to-r ${modernColors.gradients[type]} bg-clip-text text-transparent`;
};

// Color accessibility helpers
export const colorCombinations = {
  // High contrast combinations for accessibility
  highContrast: [
    { bg: 'bg-slate-900', text: 'text-white' },
    { bg: 'bg-white', text: 'text-slate-900' },
    { bg: 'bg-red-600', text: 'text-white' },
    { bg: 'bg-purple-600', text: 'text-white' },
  ],

  // Medium contrast for secondary content
  mediumContrast: [
    { bg: 'bg-slate-100', text: 'text-slate-700' },
    { bg: 'bg-red-50', text: 'text-red-800' },
    { bg: 'bg-purple-50', text: 'text-purple-800' },
  ],
};

export default modernColors;
