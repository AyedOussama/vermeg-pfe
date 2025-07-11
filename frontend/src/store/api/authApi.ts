import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginCredentials, TokenValidationResult } from '../../types/auth';

// Interface pour les réponses d'authentification
interface LoginResponse {
  message: string;
  timestamp: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Configuration de base pour les appels API
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:7000/api', // URL directe sans proxy
  credentials: 'include', // Important pour les cookies
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  // Ajouter une gestion d'erreur personnalisée
  fetchFn: async (input, init) => {
    try {
      console.log('🌐 Making API request to:', input);
      console.log('🔧 Request options:', init);

      const response = await fetch(input, init);
      console.log('📡 API response status:', response.status);
      console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()));

      return response;
    } catch (error) {
      console.error('❌ API request failed:', error);
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);

      // Vérifier si c'est un problème CORS
      if (error.message.includes('CORS') || error.message.includes('insecure')) {
        console.error('🚫 CORS Error detected - Backend may not allow requests from localhost:3000');
      }

      throw error;
    }
  },
});

// API d'authentification avec RTK Query
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    // Login - POST /auth/login
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Logout - POST /auth/logout
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Valider la session - POST /auth/validate
    validateSession: builder.query<TokenValidationResult, void>({
      query: () => ({
        url: '/auth/validate',
        method: 'POST',
      }),
      providesTags: ['Auth'],
    }),

    // Rafraîchir la session - POST /auth/refresh
    refreshSession: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Obtenir les infos de l'utilisateur connecté - GET /auth/me
    getCurrentUser: builder.query<TokenValidationResult, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    // Changer le mot de passe - POST /auth/change-password
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Mot de passe oublié - POST /auth/forgot-password/request
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: ({ email }) => ({
        url: '/auth/forgot-password/request',
        method: 'POST',
        body: { email },
      }),
    }),

    // Réinitialiser le mot de passe - POST /auth/forgot-password/reset
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (resetData) => ({
        url: '/auth/forgot-password/reset',
        method: 'POST',
        body: resetData,
      }),
    }),
  }),
});

// Export des hooks générés automatiquement
export const {
  useLoginMutation,
  useLogoutMutation,
  useValidateSessionQuery,
  useRefreshSessionMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
