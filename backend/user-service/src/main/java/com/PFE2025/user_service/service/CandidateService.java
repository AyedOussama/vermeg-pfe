package com.PFE2025.user_service.service;

import com.PFE2025.user_service.dto.request.PasswordChangeRequest;
import com.PFE2025.user_service.dto.request.CandidateRegistrationRequest;
import com.PFE2025.user_service.dto.response.CandidateProfileResponse;
import com.PFE2025.user_service.dto.response.UserRegistrationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CandidateService {
    /**
     * Registers a new candidate user.
     *
     * @param request Registration data for the candidate
     * @return Response containing the registered candidate details
     */
    UserRegistrationResponse registerCandidate(CandidateRegistrationRequest request);

    /**
     * Changes the password for an authenticated candidate.
     *
     * @param username The username of the authenticated user (not used directly)
     * @param request Password change details including old and new password
     */
    void changePassword(String username, PasswordChangeRequest request);

    /**
     * Récupère un candidat par son keycloakId
     */
    CandidateProfileResponse getCandidateByKeycloakId(String keycloakId);

    /**
     * Récupère tous les candidats avec pagination
     */
    Page<CandidateProfileResponse> getAllCandidates(Pageable pageable);

    /**
     * Recherche des candidats par mot-clé
     */
    Page<CandidateProfileResponse> searchCandidates(String keyword, Pageable pageable);

    /**
     * Récupère les candidats par localisation
     */
    Page<CandidateProfileResponse> getCandidatesByLocation(String location, Pageable pageable);

    /**
     * Récupère les candidats par niveau d'expérience
     */
    Page<CandidateProfileResponse> getCandidatesByExperienceLevel(String experienceLevel, Pageable pageable);

    /**
     * Récupère un candidat par son ID
     */
    CandidateProfileResponse getCandidateById(String id);

    /**
     * Compte le nombre total de candidats
     */
    long countCandidates();
}