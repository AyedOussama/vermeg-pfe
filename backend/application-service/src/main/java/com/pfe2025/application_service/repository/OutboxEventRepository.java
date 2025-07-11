package com.pfe2025.application_service.repository;

import com.pfe2025.application_service.model.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    List<OutboxEvent> findByProcessedFalseOrderByCreationTimeAsc();

    List<OutboxEvent> findByProcessedFalseAndRetryCountLessThan(Integer maxRetries);

    @Query("SELECT o FROM OutboxEvent o WHERE o.processed = false AND o.creationTime < :threshold")
    List<OutboxEvent> findUnprocessedEventsBefore(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT o FROM OutboxEvent o WHERE o.processed = false AND o.aggregateType = :type")
    List<OutboxEvent> findUnprocessedEventsByType(@Param("type") String aggregateType);
}