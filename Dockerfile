# ========================================================
# Optimized Fast Dockerfile for Spring Boot Backend
# Root Context (Compatible with Render, Railway, Docker)
# ========================================================

# Stage 1: Fast Build (Debian-based image avoids Alpine DNS latency)
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /workspace

# Step 1: Copy pom.xml and cache dependencies (Docker layer cached)
COPY backend/pom.xml ./backend/pom.xml
RUN cd backend && mvn dependency:resolve -B -ntp -q

# Step 2: Copy source code and build package
# -B: Batch mode
# -ntp: No transfer progress (prevents log buffer bottleneck on Render)
# -Dmaven.test.skip=true: Skips test compilation and test plugins
# -T 1C: Multi-threaded compilation
# -q: Quiet mode to eliminate console I/O throttling
COPY backend/src ./backend/src
RUN cd backend && mvn package -B -ntp -Dmaven.test.skip=true -DskipTests -T 1C -q

# Stage 2: Minimal Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN mkdir -p /app/data

# Copy built jar from builder stage
COPY --from=builder /workspace/backend/target/*.jar /app/app.jar

ENV PORT=8080
EXPOSE 8080

# Configure container memory limits for Render 512MB RAM free tier
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]
