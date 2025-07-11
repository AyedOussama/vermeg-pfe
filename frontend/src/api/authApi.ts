import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginCredentials, TokenValidationResult } from '../types/auth';

// Types pour les réponses API
interface LoginResponse {
  message: string;
  user?: TokenValidationResult;
}

interface LogoutResponse {
  message: string;
}

// Configuration de base pour les appels API
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:7000/api',
  credentials: 'include', // Important pour les cookies
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// API d'authentification avec RTK Query
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login - POST /auth/login
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Logout - POST /auth/logout
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Valider la session - POST /auth/validate
    validateSession: builder.query<TokenValidationResult, void>({
      query: () => ({
        url: '/auth/validate',
        method: 'POST',
      }),
      providesTags: ['Auth'],
    }),
  }),
});

// Export des hooks générés automatiquement
export const {
  useLoginMutation,
  useLogoutMutation,
  useValidateSessionQuery,
} = authApi;
