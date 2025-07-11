package com.PFE2025.user_service.repository;

import com.PFE2025.user_service.model.ProjectLeaderProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des profils Project Leader.
 * Fournit les opérations CRUD et les requêtes spécialisées.
 */
@Repository
public interface ProjectLeaderProfileRepository extends MongoRepository<ProjectLeaderProfile, String> {

    /**
     * Trouve un profil Project Leader par son keycloakId
     */
    Optional<ProjectLeaderProfile> findByKeycloakId(String keycloakId);

    /**
     * Vérifie si un profil existe pour un keycloakId donné
     */
    boolean existsByKeycloakId(String keycloakId);

    /**
     * Trouve tous les profils Project Leader avec pagination
     */
    Page<ProjectLeaderProfile> findAll(Pageable pageable);

    /**
     * Recherche par département
     */
    Page<ProjectLeaderProfile> findByDepartmentContainingIgnoreCase(String department, Pageable pageable);

    /**
     * Recherche par niveau de management
     */
    Page<ProjectLeaderProfile> findByManagementLevel(ProjectLeaderProfile.ManagementLevel managementLevel, Pageable pageable);

    /**
     * Recherche par nom ou prénom
     */
    @Query("{'$or': [{'firstName': {'$regex': ?0, '$options': 'i'}}, {'lastName': {'$regex': ?0, '$options': 'i'}}, {'fullName': {'$regex': ?0, '$options': 'i'}}]}")
    Page<ProjectLeaderProfile> findByNameContaining(String name, Pageable pageable);

    /**
     * Recherche par spécialisation
     */
    Page<ProjectLeaderProfile> findBySpecializationsContaining(String specialization, Pageable pageable);

    /**
     * Trouve les Project Leaders par localisation
     */
    Page<ProjectLeaderProfile> findByLocationContainingIgnoreCase(String location, Pageable pageable);

    /**
     * Recherche combinée (nom, département, localisation)
     */
    @Query("{'$or': [" +
           "{'firstName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'lastName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'fullName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'department': {'$regex': ?0, '$options': 'i'}}, " +
           "{'location': {'$regex': ?0, '$options': 'i'}}" +
           "]}")
    Page<ProjectLeaderProfile> searchByKeyword(String keyword, Pageable pageable);

    /**
     * Trouve les Project Leaders avec une expérience minimale
     */
    Page<ProjectLeaderProfile> findByYearsOfExperienceGreaterThanEqual(Integer minExperience, Pageable pageable);

    /**
     * Trouve les Project Leaders gérant plus d'un certain nombre de projets
     */
    Page<ProjectLeaderProfile> findByCurrentProjectsGreaterThanEqual(Integer minProjects, Pageable pageable);

    /**
     * Compte le nombre total de Project Leaders
     */
    long count();

    /**
     * Compte par département
     */
    long countByDepartmentContainingIgnoreCase(String department);

    /**
     * Trouve tous les départements distincts
     */
    @Query(value = "{}", fields = "{'department': 1}")
    List<ProjectLeaderProfile> findDistinctDepartments();
}
