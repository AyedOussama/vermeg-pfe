package com.pfe2025.application_service.repository;

import com.pfe2025.application_service.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByReportType(Report.ReportType reportType);

    Page<Report> findByCreatedBy(String createdBy, Pageable pageable);

    Page<Report> findByCreatedAtBetween(
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    List<Report> findByJobPostingId(Long jobPostingId);

    List<Report> findByDepartment(String department);

    @Query("SELECT r FROM Report r WHERE " +
            "LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Report> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.isScheduled = true AND " +
            "(r.lastGeneratedAt IS NULL OR r.lastGeneratedAt < :threshold)")
    List<Report> findScheduledReportsNeedingGeneration(@Param("threshold") LocalDateTime threshold);


    List<Report> findTop5ByOrderByCreatedAtDesc();
}