package com.pfe2025.application_service.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe2025.application_service.dto.EvaluationDTO;
import com.pfe2025.application_service.event.ApplicationEvaluatedEvent;
import com.pfe2025.application_service.model.Evaluation;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

/**
 * Mapper pour les entités Evaluation et DTOs associés.
 */
@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public abstract class EvaluationMapper {

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Convertit une entité Evaluation en DTO.
     */
    @Mapping(target = "evaluatedAt", source = "createdAt")
    @Mapping(target = "categoryScores", source = "categoryScores", qualifiedByName = "jsonToMap")
    public abstract EvaluationDTO toEvaluationDTO(Evaluation evaluation);

    /**
     * Convertit un événement ApplicationEvaluatedEvent en entité Evaluation.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "application", ignore = true)
    @Mapping(target = "categoryScores", source = "categoryScores", qualifiedByName = "mapToJson")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    public abstract Evaluation fromApplicationEvaluatedEvent(ApplicationEvaluatedEvent event);

    /**
     * Convertit une chaîne JSON en Map.
     */
    @Named("jsonToMap")
    protected Map<String, Double> jsonToMap(String json) {
        if (json == null || json.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Double>>() {});
        } catch (JsonProcessingException e) {
            return new HashMap<>();
        }
    }

    /**
     * Convertit une Map en chaîne JSON.
     */
    @Named("mapToJson")
    public String mapToJson(Map<String, Double> map) {
        if (map == null || map.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}