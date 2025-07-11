import { createTheme, ThemeOptions } from '@mui/material/styles';
import { modernColors } from './modern-colors';

// Modern Vermeg color palette using professional red/purple scheme
const vermegRed = modernColors.primary;
const vermegPurple = modernColors.secondary;
const vermegNeutral = modernColors.neutral;

// Modern Material UI theme configuration
export const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: vermegRed[500],
      light: vermegRed[400],
      dark: vermegRed[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: vermegPurple[600],
      light: vermegPurple[500],
      dark: vermegPurple[700],
      contrastText: '#ffffff',
    },
    error: {
      main: modernColors.semantic.error.main,
      light: modernColors.semantic.error.light,
      dark: modernColors.semantic.error.dark,
    },
    warning: {
      main: modernColors.semantic.warning.main,
      light: modernColors.semantic.warning.light,
      dark: modernColors.semantic.warning.dark,
    },
    info: {
      main: modernColors.semantic.info.main,
      light: modernColors.semantic.info.light,
      dark: modernColors.semantic.info.dark,
    },
    success: {
      main: modernColors.semantic.success.main,
      light: modernColors.semantic.success.light,
      dark: modernColors.semantic.success.dark,
    },
    background: {
      default: vermegNeutral[50],
      paper: '#ffffff',
    },
    text: {
      primary: vermegNeutral[800],
      secondary: vermegNeutral[600],
      disabled: vermegNeutral[400],
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    button: {
      textTransform: 'none', // Évite les majuscules automatiques
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // Correspond au rounded-full de Tailwind
          padding: '8px 20px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        containedPrimary: {
          backgroundColor: vermegRed[500],
          color: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            backgroundColor: vermegRed[600],
            transform: 'scale(1.05)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          '&:active': {
            transform: 'scale(1.02)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem', // Correspond au rounded-lg de Tailwind
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: vermegRed[600],
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: vermegRed[600],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem', // Correspond au rounded-xl de Tailwind
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // Correspond au rounded-full de Tailwind
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.75rem', // Correspond au rounded-xl de Tailwind
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: vermegRed[50],
            '&:hover': {
              backgroundColor: vermegRed[100],
            },
          },
          '&:hover': {
            backgroundColor: vermegNeutral[100],
          },
        },
      },
    },
  },
};

// Création du thème
const theme = createTheme(themeOptions);

export default theme;