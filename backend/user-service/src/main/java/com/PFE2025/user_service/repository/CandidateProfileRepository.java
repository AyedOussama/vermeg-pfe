package com.PFE2025.user_service.repository;

import com.PFE2025.user_service.model.CandidateProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour la gestion des profils candidats.
 */
@Repository
public interface CandidateProfileRepository extends MongoRepository<CandidateProfile, String> {
    
    /**
     * Trouve un profil candidat par son ID Keycloak
     */
    Optional<CandidateProfile> findByKeycloakId(String keycloakId);
    
    /**
     * Vérifie si un profil candidat existe pour un ID Keycloak donné
     */
    boolean existsByKeycloakId(String keycloakId);
    
    /**
     * Trouve un profil candidat par l'ID du document CV
     */
    Optional<CandidateProfile> findByDocumentCVId(Long documentCVId);
    
    /**
     * Trouve tous les profils candidats qui ont été enrichis par l'IA
     */
    // Note: Cette méthode nécessiterait une requête personnalisée si utilisée
    // List<CandidateProfile> findByCvProcessedAtIsNotNull();
    
    /**
     * Supprime un profil candidat par son ID Keycloak
     */
    void deleteByKeycloakId(String keycloakId);

    /**
     * Recherche combinée par mot-clé (nom, email, localisation, compétences)
     */
    @Query("{'$or': [" +
           "{'firstName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'lastName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'fullName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'email': {'$regex': ?0, '$options': 'i'}}, " +
           "{'location': {'$regex': ?0, '$options': 'i'}}, " +
           "{'skills': {'$regex': ?0, '$options': 'i'}}, " +
           "{'preferredCategories': {'$regex': ?0, '$options': 'i'}}" +
           "]}")
    Page<CandidateProfile> searchByKeyword(String keyword, Pageable pageable);

    /**
     * Trouve les candidats par localisation
     */
    Page<CandidateProfile> findByLocationContainingIgnoreCase(String location, Pageable pageable);

    /**
     * Trouve les candidats par niveau de séniorité
     */
    Page<CandidateProfile> findBySeniorityLevelContainingIgnoreCase(String seniorityLevel, Pageable pageable);
}
