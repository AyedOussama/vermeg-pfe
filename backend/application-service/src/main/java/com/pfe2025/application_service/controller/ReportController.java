package com.pfe2025.application_service.controller;

import com.pfe2025.application_service.model.Report;
import com.pfe2025.application_service.service.ReportService;
import com.pfe2025.application_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "API for generating and managing reports")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('RH_ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    @Operation(summary = "List reports", description = "Get the list of available reports")
    @ApiResponse(responseCode = "200", description = "Reports list retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<Page<Report>> getAllReports(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction) {
        log.info("REST request to get all reports");

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        Page<Report> reports = reportService.getAllReports(pageRequest);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/own")
    @Operation(summary = "My reports", description = "Get reports created by the current user")
    @ApiResponse(responseCode = "200", description = "Reports retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<Page<Report>> getMyReports(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction) {
        log.info("REST request to get current user's reports");

        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        Page<Report> reports = reportService.getReportsByCreator(userId, pageRequest);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Report detail", description = "Get a report by its ID")
    @ApiResponse(responseCode = "200", description = "Report retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Report not found")
    public ResponseEntity<Report> getReport(@PathVariable Long id) {
        log.info("REST request to get report {}", id);

        Report report = reportService.getReport(id);
        return ResponseEntity.ok(report);
    }

    @PostMapping
    @Operation(summary = "Generate report", description = "Generate a new report")
    @ApiResponse(responseCode = "201", description = "Report generated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid data")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<Report> generateReport(@RequestBody Map<String, Object> request) {
        log.info("REST request to generate a new report of type {}", request.get("reportType"));

        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        String title = (String) request.get("title");
        String description = (String) request.get("description");
        Report.ReportType reportType = Report.ReportType.valueOf((String) request.get("reportType"));
        Report.ReportFormat format = Report.ReportFormat.valueOf((String) request.get("format"));

        // Extract parameters
        @SuppressWarnings("unchecked")
        Map<String, Object> parameters = request.containsKey("parameters") ?
                (Map<String, Object>) request.get("parameters") : Map.of();

        Report report = reportService.generateReport(
                title, description, reportType, parameters, format, userId);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "Download report", description = "Download a generated report")
    @ApiResponse(responseCode = "200", description = "Report downloaded successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Report not found")
    public ResponseEntity<Resource> downloadReport(@PathVariable Long id) {
        log.info("REST request to download report {}", id);

        String userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        Resource reportResource = reportService.downloadReport(id, userId);
        Report report = reportService.getReport(id);

        String contentType;
        String filename;

        switch (report.getFormat()) {
            case PDF:
                contentType = MediaType.APPLICATION_PDF_VALUE;
                filename = report.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + ".pdf";
                break;
            case EXCEL:
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                filename = report.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + ".xlsx";
                break;
            case CSV:
                contentType = "text/csv";
                filename = report.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + ".csv";
                break;
            default:
                contentType = MediaType.APPLICATION_JSON_VALUE;
                filename = report.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + ".json";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(reportResource);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete report", description = "Delete an existing report")
    @ApiResponse(responseCode = "204", description = "Report deleted successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Report not found")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        log.info("REST request to delete report {}", id);

        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/metrics/dashboard")
    @Operation(summary = "Dashboard metrics", description = "Get metrics for the dashboard")
    @ApiResponse(responseCode = "200", description = "Metrics retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        log.info("REST request to get dashboard metrics");

        Map<String, Object> metrics = reportService.getDashboardMetrics();
        return ResponseEntity.ok(metrics);
    }
}