# Nouvelle Implémentation d'Authentification Frontend

## Vue d'ensemble

Cette implémentation remplace complètement l'ancien système d'authentification mock par une intégration réelle avec le backend utilisant Redux Toolkit, RTK Query et Redux Persist.

## Architecture

### Technologies utilisées
- **Redux Toolkit** : Gestion d'état moderne
- **RTK Query** : Gestion des appels API avec cache automatique
- **Redux Persist** : Persistance de l'état d'authentification
- **TypeScript** : Typage strict pour tous les composants

### Structure des fichiers

```
frontend/src/
├── store/
│   ├── store.ts                 # Configuration du store Redux avec persist
│   ├── api/
│   │   ├── authApi.ts          # API RTK Query pour l'authentification
│   │   └── userApi.ts          # API RTK Query pour les utilisateurs
│   └── slices/
│       └── authSlice.ts        # Slice Redux pour l'état d'authentification
├── hooks/
│   ├── useAuth.ts              # Hook personnalisé pour l'authentification
│   ├── useCandidate.ts         # Hook pour l'inscription candidat
│   └── redux.ts                # Hooks Redux typés
├── api/
│   ├── apiClient.ts            # Client Axios configuré
│   ├── authApi.ts              # DEPRECATED - Wrapper de compatibilité
│   ├── userApi.ts              # DEPRECATED - Wrapper de compatibilité
│   └── documentApi.ts          # API pour les documents
└── components/
    ├── auth/
    │   ├── LoginForm.tsx       # Formulaire de connexion
    │   └── CandidateRegistrationForm.tsx # Formulaire d'inscription candidat
    └── profile/
        └── UserProfile.tsx     # Composant d'affichage du profil
```

## Endpoints Backend Supportés

### Auth Service (via API Gateway)
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/validate` - Validation de session
- `POST /api/auth/refresh` - Rafraîchissement de session
- `GET /api/auth/me` - Informations utilisateur connecté
- `POST /api/auth/change-password` - Changement de mot de passe
- `POST /api/auth/forgot-password/request` - Mot de passe oublié
- `POST /api/auth/forgot-password/reset` - Réinitialisation mot de passe

### User Service (via API Gateway)
- `POST /api/users/register` - Inscription candidat avec CV
- `GET /api/profile/me` - Profil utilisateur connecté
- `GET /api/profile/candidate/{keycloakId}` - Profil candidat par ID
- `PUT /api/profile/photo` - Mise à jour photo de profil
- `GET /api/profile/candidates/count` - Nombre de candidats
- `GET /api/users/admin` - Liste des utilisateurs (admin)
- `GET /api/users/admin/{id}` - Utilisateur par ID (admin)
- `POST /api/users/admin` - Créer utilisateur (admin)
- `PUT /api/users/admin/{id}` - Mettre à jour utilisateur (admin)
- `DELETE /api/users/admin/{id}` - Supprimer utilisateur (admin)

## Utilisation

### 1. Hook d'authentification

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { 
    isAuthenticated, 
    user, 
    login, 
    logout, 
    isLoading, 
    error 
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Bonjour {user?.firstName}</p>
      ) : (
        <button onClick={handleLogin}>Se connecter</button>
      )}
    </div>
  );
};
```

### 2. Inscription candidat

```typescript
import { useCandidate } from '../hooks/useCandidate';

const RegistrationForm = () => {
  const { registerCandidate, isRegistering, registerError } = useCandidate();

  const handleSubmit = async (formData) => {
    try {
      await registerCandidate({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password',
        phone: '+33123456789',
        cvFile: file, // File object
        // ... autres champs
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
};
```

### 3. Profil utilisateur

```typescript
import { useGetCurrentUserProfileQuery } from '../store/api/userApi';

const ProfileComponent = () => {
  const { data: profile, isLoading, error } = useGetCurrentUserProfileQuery();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur</div>;

  return (
    <div>
      <h1>{profile?.firstName} {profile?.lastName}</h1>
      <p>{profile?.email}</p>
    </div>
  );
};
```

### 4. Utilisation directe des APIs RTK Query

```typescript
import { 
  useLoginMutation, 
  useGetCurrentUserQuery 
} from '../store/api/authApi';

const LoginComponent = () => {
  const [login, { isLoading }] = useLoginMutation();
  const { data: user } = useGetCurrentUserQuery();

  // ...
};
```

## Gestion des erreurs

Les erreurs sont automatiquement gérées par :
- **RTK Query** : Cache et retry automatiques
- **Axios Interceptors** : Gestion des erreurs 401 avec refresh automatique
- **Toast notifications** : Affichage des erreurs utilisateur

## Persistance

L'état d'authentification est automatiquement persisté dans le localStorage grâce à Redux Persist. L'utilisateur reste connecté même après fermeture du navigateur.

## Sécurité

- **Cookies HTTP-Only** : Authentification basée sur les cookies sécurisés
- **Refresh automatique** : Renouvellement automatique des sessions expirées
- **Validation de session** : Vérification automatique au démarrage de l'application

## Migration depuis l'ancien système

Les anciens fichiers API (`authApi.js`, `userApi.js`) sont marqués comme DEPRECATED et lèvent des erreurs avec des messages explicites pour guider la migration vers les nouveaux hooks.

## Types TypeScript

Tous les types sont définis dans `src/types/auth.ts` et correspondent exactement aux DTOs du backend Java.
