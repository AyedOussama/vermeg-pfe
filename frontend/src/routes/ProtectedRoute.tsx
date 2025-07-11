// routes/ProtectedRoute.tsx - Real authentication with Redux
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectPath = "/unauthorized"
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  console.log('ProtectedRoute check:', {
    isAuthenticated,
    requiredRole,
    userRoles: user?.roles,
    path: location.pathname
  });

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Si un rôle spécifique est requis, vérifier
  if (requiredRole && user?.roles && !user.roles.includes(requiredRole)) {
    console.log(`User roles ${user?.roles} do not include required role ${requiredRole}`);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('User authenticated and authorized, rendering protected content');
  // Utilisateur authentifié et autorisé
  return <>{children}</>;
};

export default ProtectedRoute;