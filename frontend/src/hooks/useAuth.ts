import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useLoginMutation,
  useLogoutMutation,
  useValidateSessionQuery,
} from '../api/authApi';
import {
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectSessionChecked,
  clearError,
  resetAuth,
  setUser,
} from '../store/slices/authSlice';
import { LoginCredentials, TokenValidationResult, UserRole } from '../types/auth';
import type { AppDispatch } from '../store/store';

// Interface pour le hook useAuth
interface UseAuthReturn {
  // État d'authentification
  isAuthenticated: boolean;
  user: TokenValidationResult | null;
  isLoading: boolean;
  error: string | null;
  sessionChecked: boolean;

  // Actions d'authentification
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;

  // Utilitaires
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  getRedirectPath: (userRole?: string) => string;
}

/**
 * Hook personnalisé pour la gestion de l'authentification
 * Utilise Redux Toolkit Query pour les appels API et Redux pour l'état global
 */
export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Sélecteurs Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const sessionChecked = useSelector(selectSessionChecked);

  // Mutations RTK Query
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Query pour valider la session
  const { refetch: refetchValidation } = useValidateSessionQuery(undefined, {
    skip: false, // Toujours actif - c'est ce qui met à jour l'état Redux
  });

  // Fonction de connexion
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      console.log('🔐 Starting login process...');
      const result = await loginMutation(credentials).unwrap();
      console.log('✅ Login mutation successful:', result);

      // Si le login retourne directement les données utilisateur, les utiliser
      if (result.user) {
        console.log('📝 Using user data from login response:', result.user);
        dispatch(setUser(result.user));
        console.log('🎉 Login process completed successfully (fast path)');
        return;
      }

      // Sinon, fallback vers la validation de session
      console.log('📡 No user data in login response, validating session...');
      const validationResult = await refetchValidation();
      console.log('✅ Session validation result:', validationResult);

      // Mettre à jour l'état Redux avec les données utilisateur
      if (validationResult.data) {
        console.log('📝 Updating Redux state with user data:', validationResult.data);
        dispatch(setUser(validationResult.data));
      }

      console.log('🎉 Login process completed successfully');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      const message = error?.data?.message || 'Échec de la connexion';
      throw new Error(message);
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap();
      dispatch(resetAuth());
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('❌ Logout failed:', error);
      // Même en cas d'erreur, on nettoie l'état local
      dispatch(resetAuth());
    }
  };

  // Fonction pour nettoyer les erreurs
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: UserRole): boolean => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  };

  // Vérifier si l'utilisateur a au moins un des rôles spécifiés
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user?.roles) return false;
    return roles.some(role => user.roles!.includes(role));
  };

  // Fonction pour obtenir le chemin de redirection selon le rôle
  const getRedirectPath = React.useCallback((userRole?: string): string => {
    const role = userRole || user?.roles?.[0];
    switch (role) {
      case 'CANDIDATE':
        return '/candidate/dashboard';
      case 'CEO':
        return '/ceo/jobs'; // Cohérent avec authRedirect.ts
      case 'PROJECT_LEADER':
        return '/project-leader/dashboard';
      case 'RH':
        return '/rh/applications'; // Cohérent avec authRedirect.ts
      case 'HR_ADMIN':
        return '/hr-admin/dashboard';
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard';
      default:
        return '/dashboard';
    }
  }, [user?.roles]);

  return {
    // État
    isAuthenticated,
    user,
    isLoading: isLoading || isLoggingIn || isLoggingOut,
    error,
    sessionChecked,

    // Actions
    login,
    logout,
    clearError: clearAuthError,

    // Utilitaires
    hasRole,
    hasAnyRole,
    getRedirectPath,
  };
};
