// ============================================================================
// REDUX STORE CONFIGURATION
// ============================================================================

// Export du nouveau store avec Redux Persist et RTK Query
export { store, persistor } from './store';
export type { RootState, AppDispatch } from './store';

// Export des APIs RTK Query
export { authApi } from '../api/authApi';

// Export des slices
export { default as authSlice } from './slices/authSlice';

// Export des sélecteurs
export {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectSessionChecked,
} from './slices/authSlice';

// Export des actions
export {
  clearError,
  setSessionChecked,
  resetAuth,
  setUser,
} from './slices/authSlice';
