import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import { TokenValidationResult } from '../../types/auth';
import type { RootState } from '../store';

// Interface pour l'état d'authentification
interface AuthState {
  isAuthenticated: boolean;
  user: TokenValidationResult | null;
  isLoading: boolean;
  error: string | null;
  sessionChecked: boolean;
}

// État initial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  sessionChecked: false,
};

// Slice d'authentification
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Actions synchrones
    clearError: (state) => {
      state.error = null;
    },
    setSessionChecked: (state, action: PayloadAction<boolean>) => {
      state.sessionChecked = action.payload;
    },
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.sessionChecked = false;
    },
    setUser: (state, action: PayloadAction<TokenValidationResult>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.sessionChecked = true;
        // L'authentification sera mise à jour par validateSession
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.error?.message || 'Login failed';
      })

      // Logout
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.sessionChecked = true;
      })

      // Validation de session
      .addMatcher(authApi.endpoints.validateSession.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionChecked = true;
        if (action.payload?.valid) {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.error = null;
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addMatcher(authApi.endpoints.validateSession.matchRejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.sessionChecked = true;
      });
  },
});

// Export des actions
export const { clearError, setSessionChecked, resetAuth, setUser } = authSlice.actions;

// Sélecteurs
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectSessionChecked = (state: RootState) => state.auth.sessionChecked;

// Export du reducer
export default authSlice.reducer;
