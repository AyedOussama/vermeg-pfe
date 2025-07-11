package com.pfe2025.application_service.repository;

import com.pfe2025.application_service.model.Application;
import com.pfe2025.application_service.model.ApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {

    List<ApplicationStatusHistory> findByApplicationId(Long applicationId);

    List<ApplicationStatusHistory> findByApplicationIdOrderByChangedAtDesc(Long applicationId);

    @Query("SELECT AVG(DATEDIFF(MINUTE, h1.changedAt, h2.changedAt)) " +
            "FROM ApplicationStatusHistory h1 JOIN ApplicationStatusHistory h2 " +
            "ON h1.application.id = h2.application.id " +
            "WHERE h1.newStatus = :fromStatus AND h2.newStatus = :toStatus " +
            "AND h1.changedAt < h2.changedAt " +
            "AND NOT EXISTS (SELECT 1 FROM ApplicationStatusHistory h3 " +
            "                WHERE h3.application.id = h1.application.id " +
            "                AND h3.changedAt > h1.changedAt AND h3.changedAt < h2.changedAt)")
    Double calculateAverageTimeInMinutesBetweenStatuses(
            @Param("fromStatus") Application.ApplicationStatus fromStatus,
            @Param("toStatus") Application.ApplicationStatus toStatus);
}