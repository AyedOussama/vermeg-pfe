FROM eclipse-temurin:17-jdk-alpine as build
WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN chmod +x ./mvnw
RUN ./mvnw install -DskipTests
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)

FROM eclipse-temurin:17-jre-alpine
VOLUME /tmp

ARG DEPENDENCY=/workspace/app/target/dependency

# Ajout des dépendances nécessaires pour Keycloak Admin Client
RUN apk add --no-cache tzdata curl

COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

# Ajout d'un utilisateur non-root pour améliorer la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Configuration pour la JVM
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+UseStringDeduplication -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck pour permettre à Docker de vérifier la santé du service
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -cp app:app/lib/* com.PFE2025.auth_service.AuthServiceApplication"]
ENTRYPOINT ["java","-cp","app:app/lib/*","com.PFE2025.auth_service.AuthServiceApplication"]