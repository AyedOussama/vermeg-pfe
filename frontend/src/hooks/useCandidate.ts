// TODO: Recréer l'API userApi pour l'inscription des candidats
// import { useRegisterCandidateMutation } from '../store/api/userApi';
import { CandidateRegistrationData } from '../types/auth';

// Interface pour les données d'inscription candidat
interface CandidateRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  dateOfBirth?: string;
  preferredCategories?: string[];
  cvFile: File;
}

// Interface pour le retour du hook
interface UseCandidateReturn {
  registerCandidate: (candidateData: CandidateRegistrationFormData) => Promise<any>;
  isRegistering: boolean;
  registerError: any;
}

// Hook personnalisé pour les opérations candidat (temporairement désactivé)
export const useCandidate = (): UseCandidateReturn => {
  // TODO: Réactiver quand l'API userApi sera recréée
  // const [registerCandidateMutation, { isLoading: isRegistering, error: registerError }] = useRegisterCandidateMutation();

  // Fonction d'inscription candidat (temporairement désactivée)
  const registerCandidate = async (candidateData: CandidateRegistrationFormData) => {
    // TODO: Implémenter quand l'API userApi sera recréée
    throw new Error('Inscription candidat temporairement indisponible');
  };

  return {
    registerCandidate,
    isRegistering: false, // TODO: Réactiver quand l'API sera recréée
    registerError: null, // TODO: Réactiver quand l'API sera recréée
  };
};

// Export du type pour utilisation externe
export type { CandidateRegistrationFormData };
