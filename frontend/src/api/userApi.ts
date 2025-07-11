// DEPRECATED: Ce fichier est remplacé par les hooks RTK Query
// Utilisez les hooks suivants à la place:
// - useCandidate() pour l'inscription des candidats
// - useGetCurrentUserProfileQuery, useRegisterCandidateMutation, etc. depuis store/api/userApi.ts

import { CandidateRegistrationData, User, UserProfile } from '../types/auth';

console.warn('DEPRECATED: userApi.ts is deprecated. Use RTK Query hooks instead.');

// Types pour la compatibilité
interface UserApiResponse<T = any> {
  data: T;
  message?: string;
}

interface CandidateResponse {
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: string;
  message: string;
}

interface QueryParams {
  page?: number;
  size?: number;
  search?: string;
  [key: string]: any;
}

// Interface vide pour la compatibilité
const userApi = {
  // Profile endpoints
  getCurrentUserProfile: async (): Promise<UserApiResponse<UserProfile>> => {
    throw new Error('DEPRECATED: Use useGetCurrentUserProfileQuery hook instead');
  },

  updateCurrentUserProfile: async (profileData: Partial<UserProfile>): Promise<UserApiResponse<UserProfile>> => {
    throw new Error('DEPRECATED: Use useUpdateCurrentUserProfileMutation hook instead');
  },

  // Candidate endpoints
  registerCandidate: async (candidateData: FormData): Promise<UserApiResponse<CandidateResponse>> => {
    throw new Error('DEPRECATED: Use useRegisterCandidateMutation hook instead');
  },

  getAllCandidates: async (params: QueryParams = {}): Promise<UserApiResponse<User[]>> => {
    throw new Error('DEPRECATED: Use useGetAllCandidatesQuery hook instead');
  },

  getCandidateById: async (id: string): Promise<UserApiResponse<User>> => {
    throw new Error('DEPRECATED: Use useGetCandidateProfileQuery hook instead');
  },

  updateCandidate: async (id: string, candidateData: Partial<User>): Promise<UserApiResponse<User>> => {
    throw new Error('DEPRECATED: Use useUpdateCandidateMutation hook instead');
  },

  deleteCandidate: async (id: string): Promise<UserApiResponse> => {
    throw new Error('DEPRECATED: Use useDeleteCandidateMutation hook instead');
  },

  // Admin user management
  getAllUsers: async (params: QueryParams = {}): Promise<UserApiResponse<User[]>> => {
    throw new Error('DEPRECATED: Use useGetAllUsersQuery hook instead');
  },

  getUserById: async (id: string): Promise<UserApiResponse<User>> => {
    throw new Error('DEPRECATED: Use useGetUserByIdQuery hook instead');
  },

  createUser: async (userData: Partial<User>): Promise<UserApiResponse<User>> => {
    throw new Error('DEPRECATED: Use useCreateUserMutation hook instead');
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<UserApiResponse<User>> => {
    throw new Error('DEPRECATED: Use useUpdateUserMutation hook instead');
  },

  deleteUser: async (id: string): Promise<UserApiResponse> => {
    throw new Error('DEPRECATED: Use useDeleteUserMutation hook instead');
  },
};

export default userApi;
