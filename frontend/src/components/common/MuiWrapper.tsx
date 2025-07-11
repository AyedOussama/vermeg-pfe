import React from 'react';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import theme from '@/assets/theme/mui-theme';

interface MuiWrapperProps {
  children: React.ReactNode;
}

export const MuiWrapper: React.FC<MuiWrapperProps> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default MuiWrapper;