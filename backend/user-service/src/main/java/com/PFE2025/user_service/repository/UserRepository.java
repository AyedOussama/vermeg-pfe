package com.PFE2025.user_service.repository;

import com.PFE2025.user_service.model.User;
import com.PFE2025.user_service.model.UserType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Core methods
    Optional<User> findByKeycloakId(String keycloakId);

    boolean existsByKeycloakId(String keycloakId);

    // Paged search method that uses local fields (phone, department)
    @Query("{ $or: [ { 'phone': { $regex: ?0, $options: 'i' } }, { 'department': { $regex: ?0, $options: 'i' } } ] }")
    Page<User> searchUsers(String query, Pageable pageable);

    // Methods for filtering by user type
    Page<User> findByUserType(UserType userType, Pageable pageable);

    long countByUserType(UserType userType);

    // Methods for handling date-based operations
    List<User> findByCreatedAtAfter(LocalDateTime date);

    List<User> findByUpdatedAtAfter(LocalDateTime date);

    // Methods for bulk operations
    void deleteByKeycloakId(String keycloakId);

    // Combined search methods
    @Query("{ 'userType': ?0, $or: [ { 'phone': { $regex: ?1, $options: 'i' } }, { 'department': { $regex: ?1, $options: 'i' } } ] }")
    Page<User> searchByUserTypeAndTerms(UserType userType, String searchTerm, Pageable pageable);



}