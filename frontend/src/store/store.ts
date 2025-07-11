import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
// Supprimé: userApi et documentApi seront ajoutés plus tard
import authReducer from './slices/authSlice';

// Configuration de Redux Persist pour l'auth seulement
const authPersistConfig = {
  key: 'auth',
  storage,
};

// Persister seulement le slice auth
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Combiner les reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  [authApi.reducerPath]: authApi.reducer,
});

// Configuration du store Redux
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
      },
    })
      .concat(authApi.middleware),
  devTools: true,
});

// Créer le persistor
export const persistor = persistStore(store);

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
