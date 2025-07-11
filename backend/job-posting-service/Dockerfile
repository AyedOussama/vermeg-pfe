FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="Vermeg Team <equipe_RH@vermeg.com>"
LABEL description="Job Posting Service for Vermeg Recruitment Platform"

# Ajout d'un utilisateur non-root pour exécuter l'application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Définition du répertoire de travail
WORKDIR /app

# Ajout du JAR de l'application
COPY target/job-posting-service-*.jar app.jar

# Exposition du port du service
EXPOSE 7005

# Configuration du profil Spring comme variable d'environnement (par défaut prod)
ENV SPRING_PROFILES_ACTIVE=prod

# Configuration des options JVM pour l'environnement conteneurisé
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Lancement de l'application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]