# ========================================================
# Optimized Fast Dockerfile for Spring Boot Backend
# Backend Context
# ========================================================

# Stage 1: Fast Build
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:resolve -B -ntp -q

# Fast package
COPY src ./src
RUN mvn package -B -ntp -Dmaven.test.skip=true -DskipTests -T 1C -q

# Stage 2: Minimal Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN mkdir -p /app/data

COPY --from=builder /app/target/*.jar /app/app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]
