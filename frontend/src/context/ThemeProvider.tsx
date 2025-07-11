import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_THEMES } from '@/data/dummyData';

interface ThemeContextType {
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  applyTheme: (role: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const applyTheme = (role: string) => {
    const theme = ROLE_THEMES[role as keyof typeof ROLE_THEMES];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-text', theme.text);

    // Update CSS custom properties for Tailwind
    root.style.setProperty('--tw-color-primary', theme.primary);
    root.style.setProperty('--tw-color-secondary', theme.secondary);
    root.style.setProperty('--tw-color-accent', theme.accent);
  };

  const getCurrentTheme = () => {
    if (!user?.roles || user.roles.length === 0) {
      return {
        primary: '#EF4444', // Default red
        secondary: '#DC2626',
        accent: '#F87171',
        background: '#FEF2F2',
        text: '#991B1B'
      };
    }
    const primaryRole = user.roles[0];
    return ROLE_THEMES[primaryRole as keyof typeof ROLE_THEMES] || ROLE_THEMES.CANDIDATE;
  };

  // Apply theme when user role changes
  useEffect(() => {
    if (user?.roles && user.roles.length > 0) {
      applyTheme(user.roles[0]);
    } else {
      // Apply default theme for unauthenticated users
      const root = document.documentElement;
      root.style.setProperty('--color-primary', '#EF4444');
      root.style.setProperty('--color-secondary', '#DC2626');
      root.style.setProperty('--color-accent', '#F87171');
      root.style.setProperty('--color-background', '#FEF2F2');
      root.style.setProperty('--color-text', '#991B1B');
    }
  }, [user?.roles]);

  const contextValue: ThemeContextType = {
    theme: getCurrentTheme(),
    applyTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
