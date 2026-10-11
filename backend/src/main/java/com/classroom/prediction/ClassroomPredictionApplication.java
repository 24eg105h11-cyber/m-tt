package com.classroom.prediction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
@EnableScheduling
public class ClassroomPredictionApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(ClassroomPredictionApplication.class, args);
    }

    /**
     * Automatically loads key-value pairs from .env or backend/.env into System properties
     * so Spring Boot and application.yml can resolve them seamlessly.
     */
    private static void loadDotEnv() {
        File envFile = new File(".env");
        if (!envFile.exists() || !envFile.isFile()) {
            envFile = new File("backend/.env");
        }
        if (!envFile.exists() || !envFile.isFile()) {
            return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                int eqIndex = line.indexOf('=');
                String key = line.substring(0, eqIndex).trim();
                String value = line.substring(eqIndex + 1).trim();

                // Strip optional surrounding single or double quotes
                if ((value.startsWith("\"") && value.endsWith("\"")) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }

                // Only set if not already overridden by system environment or property
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (Exception e) {
            System.err.println("Note: Could not parse .env file: " + e.getMessage());
        }
    }
}
