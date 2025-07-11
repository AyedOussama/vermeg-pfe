package com.pfe2025.interview_service.repository;

import com.pfe2025.interview_service.model.CalendarIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarIntegrationRepository extends JpaRepository<CalendarIntegration, Long> {

    Optional<CalendarIntegration> findByUserId(String userId);

    Optional<CalendarIntegration> findByUserIdAndProvider(String userId, CalendarIntegration.CalendarProvider provider);

    List<CalendarIntegration> findByProvider(CalendarIntegration.CalendarProvider provider);

    @Query("SELECT c FROM CalendarIntegration c WHERE c.isActive = true AND c.tokenExpiryDate <= :expiryThreshold")
    List<CalendarIntegration> findExpiredTokens(@Param("expiryThreshold") LocalDateTime expiryThreshold);

    List<CalendarIntegration> findByIsActiveTrue();

    @Query("SELECT c FROM CalendarIntegration c WHERE c.isActive = true AND c.lastSyncDate < :lastSyncThreshold")
    List<CalendarIntegration> findIntegrationsNeedingSync(@Param("lastSyncThreshold") LocalDateTime lastSyncThreshold);
}