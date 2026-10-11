package com.classroom.prediction.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResultDto {
    private Long classroomId;
    private String roomNumber;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;

    // Actual state
    private boolean actualAvailable;
    private String actualStatusMessage; // e.g. "No confirmed booking" or "Occupied by MATH-101"

    // Prediction metrics
    private Double predictedAvailability; // 0 to 100 percentage
    private String confidence; // LOW, MEDIUM, HIGH
    private String explanation;
    private boolean insufficientData;
    private String disclaimer; // "Prediction is a statistical estimate based on historical patterns, not a guarantee."

    // Sub-factors breakdown
    private Double historicalBookingRate;
    private boolean timetableConflict;
    private Double dayOfWeekBusyness;
    private Integer historicalSampleCount;
    private List<String> contributingFactors;
}
