package com.classroom.prediction.dto;

import com.classroom.prediction.model.RoomStatus;
import com.classroom.prediction.model.RoomType;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomSearchResultDto {
    private Long id;
    private String roomNumber;
    private String building;
    private Integer floor;
    private Integer capacity;
    private Set<String> facilities;
    private RoomType roomType;
    private RoomStatus status;

    // Actual & Predicted availability
    private boolean actualAvailable;
    private String actualStatusMessage;
    private Double predictedAvailability;
    private String predictionConfidence;
    private String predictionExplanation;
    private boolean insufficientData;

    // Utilization statistics
    private Double utilizationRate; // e.g., 34.5%
    private Long totalCompletedBookings;

    // Suitability rank score (for sorting)
    private Double suitabilityScore;
}
