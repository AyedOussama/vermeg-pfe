FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/api-gateway-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 7000

# Configuration des variables d'environnement avec des valeurs par défaut
ENV SPRING_PROFILES_ACTIVE=docker \
    EUREKA_URI=http://eureka-server:8761/eureka \
    REDIS_HOST=redis \
    REDIS_PORT=6379 \
    KEYCLOAK_HOST=keycloak \
    KEYCLOAK_PORT=9090 \
    KEYCLOAK_REALM=vermeg-Platform

# Réduire les privilèges et ajouter un utilisateur non-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Augmenter la mémoire disponible pour l'environnement de test
ENTRYPOINT ["java", "-Xms512m", "-Xmx1024m", "-XX:+UseG1GC", "-jar", "app.jar"]