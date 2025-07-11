import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, UserProfile } from '../../types/auth';

// Interfaces pour les réponses basées sur le backend réel
interface UserRegistrationResponse {
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: string;
  message: string;
}

interface CandidateProfileResponse {
  id: string;
  keycloakId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  roles: string[];
  userType: string;
  status: string;
  location?: string;
  phone: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  dateOfBirth?: string;
  preferredCategories?: string[];
  cvDocumentId?: number;
  profilePhotoUrl?: string;
  // Données IA enrichies
  skills?: string[];
  experiences?: any[];
  educationHistory?: any[];
  certifications?: any[];
  languages?: any[];
  seniorityLevel?: string;
  yearsOfExperience?: number;
  profileSummary?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserDTO {
  id: string;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  enabled: boolean;
  phone?: string;
  department?: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}

interface QueryParams {
  page?: number;
  size?: number;
  search?: string;
  query?: string;
  role?: string;
  [key: string]: any;
}

// Configuration de base pour les appels API
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:7000/api', // URL directe sans proxy
  credentials: 'include', // Important pour les cookies
  prepareHeaders: (headers, { endpoint }) => {
    // Pour les uploads de fichiers, ne pas définir Content-Type
    // Le navigateur le fera automatiquement pour FormData
    if (endpoint !== 'registerCandidate' && endpoint !== 'updateProfilePhoto') {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

// API des utilisateurs avec RTK Query
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['Profile', 'Candidate', 'User', 'Admin'],
  endpoints: (builder) => ({
    // ==================== CANDIDATE ENDPOINTS ====================

    // Inscription candidat - POST /users/register
    registerCandidate: builder.mutation<UserRegistrationResponse, FormData>({
      query: (formData) => ({
        url: '/users/register',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Candidate'],
    }),

    // ==================== PROFILE ENDPOINTS ====================

    // Obtenir le profil de l'utilisateur connecté - GET /profile/me
    getCurrentUserProfile: builder.query<CandidateProfileResponse | UserDTO, void>({
      query: () => '/profile/me',
      providesTags: ['Profile'],
    }),

    // Obtenir un candidat par ID Keycloak - GET /profile/candidate/{keycloakId}
    getCandidateProfile: builder.query<CandidateProfileResponse, string>({
      query: (keycloakId) => `/profile/candidate/${keycloakId}`,
      providesTags: (result, error, keycloakId) => [
        { type: 'Candidate', id: keycloakId },
      ],
    }),

    // Mettre à jour la photo de profil - PUT /profile/photo
    updateProfilePhoto: builder.mutation<{ message: string; photoUrl: string }, FormData>({
      query: (formData) => ({
        url: '/profile/photo',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Obtenir un candidat par ID Keycloak (alternative) - GET /profile/candidates/{keycloakId}
    getCandidateByKeycloakId: builder.query<CandidateProfileResponse, string>({
      query: (keycloakId) => `/profile/candidates/${keycloakId}`,
      providesTags: (result, error, keycloakId) => [
        { type: 'Candidate', id: keycloakId },
      ],
    }),

    // Compter les profils candidats - GET /profile/candidates/count
    getCandidatesCount: builder.query<number, void>({
      query: () => '/profile/candidates/count',
      providesTags: ['Candidate'],
    }),

    // ==================== ADMIN USER MANAGEMENT ====================

    // Obtenir tous les utilisateurs - GET /users/admin
    getAllUsers: builder.query<{ content: UserDTO[]; totalElements: number; totalPages: number }, QueryParams>({
      query: (params = {}) => ({
        url: '/users/admin',
        params,
      }),
      providesTags: ['User'],
    }),

    // Obtenir un utilisateur par ID - GET /users/admin/{id}
    getUserById: builder.query<UserDTO, string>({
      query: (id) => `/users/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Créer un utilisateur - POST /users/admin
    createUser: builder.mutation<UserDTO, Partial<UserDTO>>({
      query: (userData) => ({
        url: '/users/admin',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Mettre à jour un utilisateur - PUT /users/admin/{id}
    updateUser: builder.mutation<UserDTO, { id: string; data: Partial<UserDTO> }>({
      query: ({ id, data }) => ({
        url: `/users/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'User',
      ],
    }),

    // Supprimer un utilisateur - DELETE /users/admin/{id}
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export des hooks générés automatiquement
export const {
  // Candidate endpoints
  useRegisterCandidateMutation,

  // Profile endpoints
  useGetCurrentUserProfileQuery,
  useGetCandidateProfileQuery,
  useUpdateProfilePhotoMutation,
  useGetCandidateByKeycloakIdQuery,
  useGetCandidatesCountQuery,

  // Admin user management
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
