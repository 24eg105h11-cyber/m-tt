package com.classroom.prediction.service;

import com.classroom.prediction.dto.ClassroomSearchRequest;
import com.classroom.prediction.dto.ClassroomSearchResultDto;
import com.classroom.prediction.dto.PredictionResultDto;
import com.classroom.prediction.model.Classroom;
import com.classroom.prediction.model.RoomStatus;
import com.classroom.prediction.repository.BookingRepository;
import com.classroom.prediction.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ClassroomRepository classroomRepository;
    private final BookingRepository bookingRepository;
    private final PredictionService predictionService;

    public List<ClassroomSearchResultDto> searchClassrooms(ClassroomSearchRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        LocalTime startTime = request.getStartTime() != null ? request.getStartTime() : LocalTime.of(9, 0);
        LocalTime endTime = request.getEndTime() != null ? request.getEndTime() : LocalTime.of(10, 0);

        List<Classroom> allRooms = classroomRepository.findAll();

        // 1. Initial Filtering by Hard Criteria
        List<Classroom> filtered = allRooms.stream()
                .filter(c -> request.getBuilding() == null || request.getBuilding().isBlank() ||
                        c.getBuilding().equalsIgnoreCase(request.getBuilding().trim()))
                .filter(c -> request.getRoomType() == null || c.getRoomType() == request.getRoomType())
                .filter(c -> request.getMinCapacity() == null || c.getCapacity() >= request.getMinCapacity())
                .filter(c -> {
                    if (request.getRequiredFacilities() == null || request.getRequiredFacilities().isEmpty()) {
                        return true;
                    }
                    Set<String> roomFacs = c.getFacilities() != null ? c.getFacilities() : Set.of();
                    return roomFacs.containsAll(request.getRequiredFacilities());
                })
                .toList();

        // 2. Fetch booking counts for utilization stats
        List<Object[]> bookingCounts = bookingRepository.countBookingsByClassroom();
        Map<Long, Long> countsMap = new HashMap<>();
        for (Object[] row : bookingCounts) {
            Long cId = (Long) row[0];
            Long cnt = (Long) row[1];
            countsMap.put(cId, cnt);
        }

        // 3. Evaluate Actual Availability & AI Predicted Availability for each candidate room
        List<ClassroomSearchResultDto> results = new ArrayList<>();
        for (Classroom c : filtered) {
            PredictionResultDto prediction = predictionService.predictClassroomAvailabilityReadonly(
                    c, date, startTime, endTime);

            long completedCount = countsMap.getOrDefault(c.getId(), 0L);
            // Utilization metric estimate (e.g. 0 to 100%)
            double approxUtilization = Math.min(95.0, Math.round((completedCount * 3.8) * 10.0) / 10.0);

            // Suitability scoring for intelligent ranking:
            // High priority: Actual availability (1000 pts if free, 0 if occupied)
            // Second priority: Predicted availability percentage (0-100 pts)
            // Third priority: Capacity fit (closer to requested min capacity = less waste)
            // Fourth priority: Active status
            double score = 0.0;
            if (prediction.isActualAvailable()) {
                score += 1000.0;
            }
            if (c.getStatus() == RoomStatus.ACTIVE) {
                score += 200.0;
            }
            score += (prediction.getPredictedAvailability() != null ? prediction.getPredictedAvailability() : 50.0);

            if (request.getMinCapacity() != null && request.getMinCapacity() > 0) {
                // Penalize oversized rooms slightly so optimal-sized rooms appear first
                int excess = c.getCapacity() - request.getMinCapacity();
                score -= Math.min(50.0, excess * 0.2);
            }

            ClassroomSearchResultDto item = ClassroomSearchResultDto.builder()
                    .id(c.getId())
                    .roomNumber(c.getRoomNumber())
                    .building(c.getBuilding())
                    .floor(c.getFloor())
                    .capacity(c.getCapacity())
                    .facilities(c.getFacilities())
                    .roomType(c.getRoomType())
                    .status(c.getStatus())
                    .actualAvailable(prediction.isActualAvailable())
                    .actualStatusMessage(prediction.getActualStatusMessage())
                    .predictedAvailability(prediction.getPredictedAvailability())
                    .predictionConfidence(prediction.getConfidence())
                    .predictionExplanation(prediction.getExplanation())
                    .insufficientData(prediction.isInsufficientData())
                    .utilizationRate(approxUtilization)
                    .totalCompletedBookings(completedCount)
                    .suitabilityScore(score)
                    .build();

            results.add(item);
        }

        // 4. Sort results by suitability score (descending), then capacity (ascending for best fit)
        results.sort(Comparator.comparing(ClassroomSearchResultDto::getSuitabilityScore).reversed()
                .thenComparing(ClassroomSearchResultDto::getCapacity));

        return results;
    }
}
