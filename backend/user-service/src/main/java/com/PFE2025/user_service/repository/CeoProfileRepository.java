package com.PFE2025.user_service.repository;

import com.PFE2025.user_service.model.CeoProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des profils CEO.
 * Fournit les opérations CRUD et les requêtes spécialisées.
 */
@Repository
public interface CeoProfileRepository extends MongoRepository<CeoProfile, String> {

    /**
     * Trouve un profil CEO par son keycloakId
     */
    Optional<CeoProfile> findByKeycloakId(String keycloakId);

    /**
     * Vérifie si un profil existe pour un keycloakId donné
     */
    boolean existsByKeycloakId(String keycloakId);

    /**
     * Trouve tous les profils CEO avec pagination
     */
    Page<CeoProfile> findAll(Pageable pageable);

    /**
     * Recherche par nom ou prénom
     */
    @Query("{'$or': [{'firstName': {'$regex': ?0, '$options': 'i'}}, {'lastName': {'$regex': ?0, '$options': 'i'}}, {'fullName': {'$regex': ?0, '$options': 'i'}}]}")
    Page<CeoProfile> findByNameContaining(String name, Pageable pageable);


    /**
     * Recherche combinée (nom, email, localisation) - simplifié
     */
    @Query("{'$or': [" +
           "{'firstName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'lastName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'fullName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'email': {'$regex': ?0, '$options': 'i'}}, " +
           "{'location': {'$regex': ?0, '$options': 'i'}}" +
           "]}")
    Page<CeoProfile> searchByKeyword(String keyword, Pageable pageable);

    /**
     * Trouve les CEOs par localisation
     */
    Page<CeoProfile> findByLocationContainingIgnoreCase(String location, Pageable pageable);
}
