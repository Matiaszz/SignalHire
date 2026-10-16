# Multi-stage Dockerfile for SignalHire Backend (Java 21 / Spring Boot)

# ==========================================
# Stage 1: Build JAR
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Install dos2unix in case scripts have CRLF from Windows
RUN apk add --no-cache dos2unix

# Copy Gradle wrapper and configuration
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN dos2unix gradlew && chmod +x gradlew

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy application source code
COPY src src

# Build executable JAR without running tests (tests run in CI)
RUN ./gradlew bootJar --no-daemon -x test

# ==========================================
# Stage 2: Runtime image
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install tools needed for health checks
RUN apk add --no-cache wget curl

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built JAR from builder stage
COPY --from=builder /workspace/build/libs/*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q 'UP' || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
