package com.PFE2025.user_service.repository;

import com.PFE2025.user_service.model.RhAdminProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des profils RH Admin.
 * Fournit les opérations CRUD et les requêtes spécialisées.
 */
@Repository
public interface RhAdminProfileRepository extends MongoRepository<RhAdminProfile, String> {

    /**
     * Trouve un profil RH Admin par son keycloakId
     */
    Optional<RhAdminProfile> findByKeycloakId(String keycloakId);

    /**
     * Vérifie si un profil existe pour un keycloakId donné
     */
    boolean existsByKeycloakId(String keycloakId);

    /**
     * Trouve tous les profils RH Admin avec pagination
     */
    Page<RhAdminProfile> findAll(Pageable pageable);

    /**
     * Recherche par département
     */
    Page<RhAdminProfile> findByDepartmentContainingIgnoreCase(String department, Pageable pageable);

    /**
     * Recherche par niveau d'accès
     */
    Page<RhAdminProfile> findByAccessLevel(RhAdminProfile.AccessLevel accessLevel, Pageable pageable);

    /**
     * Recherche par nom ou prénom
     */
    @Query("{'$or': [{'firstName': {'$regex': ?0, '$options': 'i'}}, {'lastName': {'$regex': ?0, '$options': 'i'}}, {'fullName': {'$regex': ?0, '$options': 'i'}}]}")
    Page<RhAdminProfile> findByNameContaining(String name, Pageable pageable);

    /**
     * Recherche par spécialisation RH
     */
    Page<RhAdminProfile> findByHrSpecializationsContaining(String specialization, Pageable pageable);

    /**
     * Trouve les RH Admin par localisation
     */
    Page<RhAdminProfile> findByLocationContainingIgnoreCase(String location, Pageable pageable);

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
    Page<RhAdminProfile> searchByKeyword(String keyword, Pageable pageable);

    /**
     * Trouve les RH Admin avec une expérience minimale en recrutement
     */
    Page<RhAdminProfile> findByRecruitmentExperienceGreaterThanEqual(Integer minExperience, Pageable pageable);

    /**
     * Trouve les RH Admin gérant plus d'un certain nombre d'employés
     */
    Page<RhAdminProfile> findByEmployeesManagedGreaterThanEqual(Integer minEmployees, Pageable pageable);

    /**
     * Trouve les RH Admin responsables d'un département spécifique
     */
    Page<RhAdminProfile> findByResponsibleForContaining(String department, Pageable pageable);

    /**
     * Trouve les RH Admin parlant une langue spécifique
     */
    Page<RhAdminProfile> findByLanguagesContaining(String language, Pageable pageable);

    /**
     * Compte le nombre total de RH Admin
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
    List<RhAdminProfile> findDistinctDepartments();

    /**
     * Trouve toutes les spécialisations RH distinctes
     */
    @Query(value = "{}", fields = "{'hrSpecializations': 1}")
    List<RhAdminProfile> findDistinctHrSpecializations();
}
