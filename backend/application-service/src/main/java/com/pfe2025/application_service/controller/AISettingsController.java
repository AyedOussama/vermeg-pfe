package com.pfe2025.application_service.controller;

import com.pfe2025.application_service.dto.AISettingsDTO;
import com.pfe2025.application_service.service.AISettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/ai-settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Settings", description = "API for managing AI automation settings")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('RH_ADMIN')")
public class AISettingsController {

    private final AISettingsService aiSettingsService;

    @GetMapping
    @Operation(summary = "List settings", description = "Get all AI settings by department")
    @ApiResponse(responseCode = "200", description = "Settings retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<List<AISettingsDTO>> getAllSettings() {
        log.info("REST request to get all AI settings");

        List<AISettingsDTO> settings = aiSettingsService.getAllSettings();
        return ResponseEntity.ok(settings);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Settings detail", description = "Get AI settings by ID")
    @ApiResponse(responseCode = "200", description = "Settings retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Settings not found")
    public ResponseEntity<AISettingsDTO> getSettings(@PathVariable Long id) {
        log.info("REST request to get AI settings {}", id);

        AISettingsDTO settings = aiSettingsService.getSettingsById(id);
        return ResponseEntity.ok(settings);
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Settings by department", description = "Get AI settings for a department")
    @ApiResponse(responseCode = "200", description = "Settings retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Department not found")
    public ResponseEntity<AISettingsDTO> getSettingsByDepartment(@PathVariable String department) {
        log.info("REST request to get AI settings for department {}", department);

        AISettingsDTO settings = aiSettingsService.getSettingsByDepartment(department);
        return ResponseEntity.ok(settings);
    }

    @PostMapping
    @Operation(summary = "Create settings", description = "Create new AI settings")
    @ApiResponse(responseCode = "200", description = "Settings created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid data")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "409", description = "Settings already exist for this department")
    public ResponseEntity<AISettingsDTO> createSettings(@Valid @RequestBody AISettingsDTO request) {
        log.info("REST request to create AI settings for department {}", request.getDepartment());

        AISettingsDTO settings = aiSettingsService.createSettings(request);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update settings", description = "Update existing AI settings")
    @ApiResponse(responseCode = "200", description = "Settings updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid data")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Settings not found")
    public ResponseEntity<AISettingsDTO> updateSettings(
            @PathVariable Long id,
            @Valid @RequestBody AISettingsDTO request) {
        log.info("REST request to update AI settings {}", id);

        AISettingsDTO settings = aiSettingsService.updateSettings(id, request);
        return ResponseEntity.ok(settings);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate settings", description = "Activate AI settings")
    @ApiResponse(responseCode = "200", description = "Settings activated successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Settings not found")
    public ResponseEntity<AISettingsDTO> activateSettings(@PathVariable Long id) {
        log.info("REST request to activate AI settings {}", id);

        AISettingsDTO settings = aiSettingsService.setSettingsActive(id, true);
        return ResponseEntity.ok(settings);
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate settings", description = "Deactivate AI settings")
    @ApiResponse(responseCode = "200", description = "Settings deactivated successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Settings not found")
    public ResponseEntity<AISettingsDTO> deactivateSettings(@PathVariable Long id) {
        log.info("REST request to deactivate AI settings {}", id);

        AISettingsDTO settings = aiSettingsService.setSettingsActive(id, false);
        return ResponseEntity.ok(settings);
    }

    @PostMapping("/calibrate/{id}")
    @Operation(summary = "Calibrate settings", description = "Automatically calibrate AI settings")
    @ApiResponse(responseCode = "200", description = "Settings calibrated successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Settings not found")
    public ResponseEntity<AISettingsDTO> calibrateSettings(@PathVariable Long id) {
        log.info("REST request to calibrate AI settings {}", id);

        AISettingsDTO settings = aiSettingsService.calibrateSettings(id);
        return ResponseEntity.ok(settings);
    }
}