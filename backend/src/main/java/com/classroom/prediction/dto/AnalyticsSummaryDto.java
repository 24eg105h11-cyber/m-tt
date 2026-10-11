package com.classroom.prediction.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummaryDto {
    private long totalClassrooms;
    private long activeClassrooms;
    private long maintenanceClassrooms;
    private long totalBookings;
    private long pendingBookings;
    private long approvedBookings;
    private long rejectedBookings;
    private long totalFaculty;
    private long totalStudents;

    // AI Prediction Analytics
    private Double overallPredictionAccuracy; // e.g. 88.4%
    private long totalPredictionsLogged;
    private long totalPredictionsTracked;

    // Charting data
    private List<Map<String, Object>> buildingUtilization;
    private List<Map<String, Object>> hourlyDemand;
    private List<Map<String, Object>> dayOfWeekDemand;
    private List<Map<String, Object>> roomTypeDistribution;
    private List<Map<String, Object>> recentAccuracyTrend;
}
