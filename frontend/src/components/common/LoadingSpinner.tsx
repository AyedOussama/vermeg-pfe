// components/common/LoadingSpinner.tsx
import React from 'react';
import { CircularProgress, Box, Typography, Skeleton } from '@mui/material';

interface LoadingSpinnerProps {
  /** Affichage en plein écran */
  fullScreen?: boolean;
  /** Taille du spinner */
  size?: 'small' | 'medium' | 'large';
  /** Couleur du spinner */
  color?: 'primary' | 'secondary' | 'inherit';
  /** Message de chargement (optionnel) */
  message?: string;
  /** Classe CSS personnalisée */
  className?: string;
  /** Variante du spinner */
  variant?: 'circular' | 'dots' | 'vermeg' | 'skeleton';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'medium',
  color = 'primary',
  message,
  className = '',
  variant = 'circular'
}) => {
  // Configuration des tailles pour Material UI
  const muiSizeConfig = {
    small: 24,
    medium: 40,
    large: 56
  };

  // Configuration des tailles pour les classes Tailwind
  const twSizeConfig = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-14 h-14'
  };

  // Spinner Material UI avec style Vermeg
  const CircularSpinner = () => (
    <CircularProgress
      size={muiSizeConfig[size]}
      color={color}
      thickness={4}
      className={className}
      sx={{
        color: color === 'primary' ? 'var(--vermeg-red)' : undefined,
        animationDuration: '1.5s'
      }}
    />
  );

  // Spinner avec points animés (Tailwind)
  const DotsSpinner = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 bg-red-600 rounded-full animate-bounce ${className}`}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );

  // Spinner Vermeg personnalisé
  const VermegSpinner = () => (
    <div className={`${twSizeConfig[size]} relative ${className}`}>
      <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
      {size === 'large' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-red-600">/</span>
        </div>
      )}
    </div>
  );

  // Skeleton loader pour les contenus
  const SkeletonSpinner = () => (
    <Box className={`space-y-3 ${className}`}>
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="40%" height={20} />
    </Box>
  );

  // Sélection du spinner selon la variante
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />;
      case 'vermeg':
        return <VermegSpinner />;
      case 'skeleton':
        return <SkeletonSpinner />;
      default:
        return <CircularSpinner />;
    }
  };

  const spinnerContent = (
    <Box className="flex flex-col items-center justify-center space-y-4">
      {fullScreen ? (
        // Version fullScreen avec branding Vermeg
        <Box className="flex flex-col items-center space-y-6">
          {/* Logo Vermeg */}
          <Box className="text-center">
            <Typography
              variant="h3"
              component="div"
              className="text-4xl font-bold mb-4"
              sx={{
                background: 'linear-gradient(135deg, var(--vermeg-red) 0%, #c53030 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center'
              }}
            >
              <span className="text-red-600">/</span>vermeg
            </Typography>
            <Typography
              variant="body1"
              className="text-gray-600 font-medium"
            >
              {message || 'Chargement de l\'application...'}
            </Typography>
          </Box>
          
          {/* Spinner principal */}
          {renderSpinner()}
          
          {/* Barre de progression animée */}
          <Box className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
            <Box 
              className="h-full bg-red-600 rounded-full animate-pulse"
              sx={{
                animation: 'loading-bar 2s ease-in-out infinite',
                '@keyframes loading-bar': {
                  '0%': { transform: 'translateX(-100%)' },
                  '50%': { transform: 'translateX(0%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }}
            />
          </Box>
        </Box>
      ) : (
        // Version inline standard
        <>
          {renderSpinner()}
          {message && (
            <Typography
              variant="body2"
              className="text-gray-600 font-medium text-center"
            >
              {message}
            </Typography>
          )}
        </>
      )}
    </Box>
  );

  // Version fullScreen avec overlay
  if (fullScreen) {
    return (
      <Box
        className="fixed inset-0 z-50 flex items-center justify-center"
        sx={{
          background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        }}
      >
        {/* Motif de grille subtil en arrière-plan */}
        <Box
          className="absolute inset-0 opacity-30"
          sx={{
            backgroundImage: `
              linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Contenu centré */}
        <Box className="relative z-10">
          {spinnerContent}
        </Box>
      </Box>
    );
  }

  // Version inline
  return (
    <Box className={`flex items-center justify-center p-4 ${className}`}>
      {spinnerContent}
    </Box>
  );
};

// Variantes spécialisées utilisant Material UI + Tailwind
export const ButtonSpinner: React.FC<{ className?: string; color?: 'inherit' | 'primary' }> = ({ 
  className = '', 
  color = 'inherit' 
}) => (
  <CircularProgress 
    size={16} 
    color={color}
    className={className}
    sx={{ color: color === 'inherit' ? 'currentColor' : undefined }}
  />
);

export const CardSpinner: React.FC<{ message?: string; variant?: 'circular' | 'skeleton' }> = ({ 
  message, 
  variant = 'circular' 
}) => (
  <Box className="flex items-center justify-center py-12">
    <LoadingSpinner 
      size="medium" 
      message={message} 
      variant={variant}
    />
  </Box>
);

export const PageSpinner: React.FC<{ message?: string }> = ({ message }) => (
  <Box className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="large" message={message} variant="vermeg" />
  </Box>
);

// Spinner pour les listes avec skeleton
export const ListSpinner: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <Box className="space-y-4 p-4">
    {Array.from({ length: items }).map((_, index) => (
      <Box key={index} className="card p-4">
        <Box className="flex items-start space-x-4">
          <Skeleton variant="circular" width={48} height={48} />
          <Box className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>
      </Box>
    ))}
  </Box>
);

// Spinner pour les cartes
export const CardSkeleton: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <Box className="card">
    <Skeleton variant="rectangular" width="100%" height={height} />
    <Box className="p-4 space-y-2">
      <Skeleton variant="text" width="80%" height={24} />
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="60%" height={16} />
    </Box>
  </Box>
);

// Spinner minimaliste pour les transitions rapides
export const MiniSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <CircularProgress 
    size={16} 
    thickness={6}
    className={className}
    sx={{ 
      color: 'var(--vermeg-red)',
      animationDuration: '1s'
    }}
  />
);

// Hook personnalisé pour gérer l'état de chargement avec Material UI
// eslint-disable-next-line react-refresh/only-export-components
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  
  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), []);
  
  return { isLoading, startLoading, stopLoading, toggleLoading };
};

// Hook pour les formulaires avec différents états
// eslint-disable-next-line react-refresh/only-export-components
export const useFormLoading = () => {
  const [states, setStates] = React.useState({
    saving: false,
    deleting: false,
    uploading: false,
    validating: false
  });
  
  const setLoading = (key: keyof typeof states, value: boolean) => {
    setStates(prev => ({ ...prev, [key]: value }));
  };
  
  return {
    ...states,
    setSaving: (value: boolean) => setLoading('saving', value),
    setDeleting: (value: boolean) => setLoading('deleting', value),
    setUploading: (value: boolean) => setLoading('uploading', value),
    setValidating: (value: boolean) => setLoading('validating', value),
    isAnyLoading: Object.values(states).some(Boolean)
  };
};

export default LoadingSpinner;