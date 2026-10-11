package com.classroom.prediction.repository;

import com.classroom.prediction.model.PredictionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionLogRepository extends JpaRepository<PredictionLog, Long> {

    List<PredictionLog> findTop20ByOrderByCreatedAtDesc();

    List<PredictionLog> findByOutcomeTrackedTrue();

    @Query("SELECT COUNT(p) FROM PredictionLog p")
    long countTotalPredictions();

    @Query("SELECT COUNT(p) FROM PredictionLog p WHERE p.outcomeTracked = true")
    long countTrackedPredictions();

    @Query("SELECT AVG(CASE WHEN ((p.predictedAvailability >= 50.0 AND p.actualBooked = false) OR (p.predictedAvailability < 50.0 AND p.actualBooked = true)) THEN 100.0 ELSE 0.0 END) FROM PredictionLog p WHERE p.outcomeTracked = true")
    Double calculateOverallAccuracy();
}
