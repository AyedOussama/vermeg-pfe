package com.pfe2025.application_service.repository;

import com.pfe2025.application_service.model.AISettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AISettingsRepository extends JpaRepository<AISettings, Long> {

    Optional<AISettings> findByDepartment(String department);

    Optional<AISettings> findByDepartmentAndIsActive(String department, Boolean isActive);

    List<AISettings> findByIsActiveTrue();

    Optional<AISettings> findByDepartmentAndJobType(String department, String jobType);

    @Query("SELECT s FROM AISettings s WHERE s.lastCalibrationDate IS NULL OR s.lastCalibrationDate < :dateThreshold")
    List<AISettings> findSettingsNeedingCalibration(@Param("dateThreshold") java.time.LocalDateTime dateThreshold);
}