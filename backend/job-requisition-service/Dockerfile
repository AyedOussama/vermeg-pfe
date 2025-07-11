FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="Vermeg Team <equipe_RH@vermeg.com>"
LABEL description="Job Requisition Service for Vermeg Recruitment Platform"

# Add a non-root user to run the application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set working directory
WORKDIR /app

# Add application jar
COPY target/job-requisition-service-*.jar app.jar

# Expose the service port
EXPOSE 7004

# Set Spring profile as environment variable (defaults to prod)
ENV SPRING_PROFILES_ACTIVE=prod

# Configure JVM options for containerized environment
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]