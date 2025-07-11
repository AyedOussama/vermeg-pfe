package com.pfe2025.jobpostingservice.util;



import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Optional;

/**
 * Utilitaires pour la manipulation de données JSON.
 */
public class JsonUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private JsonUtils() {
        // Classe utilitaire, constructeur privé
    }

    /**
     * Parse une chaîne JSON en JsonNode.
     *
     * @param json La chaîne JSON à parser
     * @return Le JsonNode correspondant ou empty en cas d'erreur
     */
    public static Optional<JsonNode> parseJson(String json) {
        try {
            return Optional.ofNullable(objectMapper.readTree(json));
        } catch (JsonProcessingException e) {
            return Optional.empty();
        }
    }

    /**
     * Convertit un objet en chaîne JSON.
     *
     * @param object L'objet à convertir
     * @return La chaîne JSON ou une chaîne vide en cas d'erreur
     */
    public static String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    /**
     * Applique un modèle JSON à un contenu.
     *
     * @param templateJson Le modèle JSON
     * @param contentJson Le contenu JSON à appliquer
     * @return Le JSON résultant de la fusion
     */
    public static String applyTemplate(String templateJson, String contentJson) {
        try {
            JsonNode templateNode = objectMapper.readTree(templateJson);
            JsonNode contentNode = objectMapper.readTree(contentJson);

            // Fusion profonde des nœuds
            JsonNode result = mergeNodes((ObjectNode) templateNode, contentNode);

            return objectMapper.writeValueAsString(result);
        } catch (JsonProcessingException e) {
            return templateJson;
        }
    }

    /**
     * Fusionne deux nœuds JSON de manière récursive.
     *
     * @param target Le nœud cible
     * @param source Le nœud source
     * @return Le nœud fusionné
     */
    private static JsonNode mergeNodes(ObjectNode target, JsonNode source) {
        if (source instanceof ObjectNode) {
            ObjectNode sourceObj = (ObjectNode) source;
            sourceObj.fieldNames().forEachRemaining(fieldName -> {
                JsonNode sourceValue = sourceObj.get(fieldName);
                JsonNode targetValue = target.get(fieldName);

                if (targetValue instanceof ObjectNode && sourceValue instanceof ObjectNode) {
                    // Fusion récursive des objets
                    target.set(fieldName, mergeNodes((ObjectNode) targetValue, sourceValue));
                } else {
                    // Remplacement direct
                    target.set(fieldName, sourceValue);
                }
            });
        }

        return target;
    }
}
