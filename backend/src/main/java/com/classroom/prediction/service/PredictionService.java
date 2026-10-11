package com.classroom.prediction.service;

import com.classroom.prediction.dto.PredictionResultDto;
import com.classroom.prediction.model.*;
import com.classroom.prediction.repository.BookingRepository;
import com.classroom.prediction.repository.ClassroomRepository;
import com.classroom.prediction.repository.PredictionLogRepository;
import com.classroom.prediction.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final ClassroomRepository classroomRepository;
    private final BookingRepository bookingRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final PredictionLogRepository predictionLogRepository;

    @Value("${app.prediction.min-sample-size:5}")
    private int minSampleSize;

    @Transactional
    public PredictionResultDto predictClassroomAvailability(Long classroomId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + classroomId));

        return computePrediction(classroom, date, startTime, endTime, true);
    }

    public PredictionResultDto predictClassroomAvailabilityReadonly(Classroom classroom, LocalDate date, LocalTime startTime, LocalTime endTime) {
        return computePrediction(classroom, date, startTime, endTime, false);
    }

    private PredictionResultDto computePrediction(Classroom classroom, LocalDate date, LocalTime startTime, LocalTime endTime, boolean logPrediction) {
        List<String> factors = new ArrayList<>();

        // 1. Check classroom status
        if (classroom.getStatus() != RoomStatus.ACTIVE) {
            String msg = "Classroom is currently in " + classroom.getStatus() + " status";
            PredictionResultDto result = PredictionResultDto.builder()
                    .classroomId(classroom.getId())
                    .roomNumber(classroom.getRoomNumber())
                    .requestedDate(date)
                    .startTime(startTime)
                    .endTime(endTime)
                    .actualAvailable(false)
                    .actualStatusMessage(msg)
                    .predictedAvailability(0.0)
                    .confidence("HIGH")
                    .explanation("The classroom is marked as " + classroom.getStatus() + " by facility administrators.")
                    .insufficientData(false)
                    .disclaimer("Predictions are statistical estimates, not guarantees.")
                    .contributingFactors(List.of(msg))
                    .build();
            if (logPrediction) saveLog(result, classroom);
            return result;
        }

        // 2. Check actual approved bookings
        List<Booking> approvedOverlaps = bookingRepository.findOverlappingBookings(
                classroom.getId(), date, startTime, endTime, List.of(BookingStatus.APPROVED));

        boolean hasApprovedBooking = !approvedOverlaps.isEmpty();

        // 3. Check recurring master timetable conflict
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<TimetableSlot> timetableConflicts = timetableSlotRepository.findConflictingTimetableSlots(
                classroom.getId(), dayOfWeek, startTime, endTime);

        boolean hasTimetableConflict = !timetableConflicts.isEmpty();

        boolean actualAvailable = !hasApprovedBooking && !hasTimetableConflict;
        String actualStatusMessage;
        if (hasApprovedBooking) {
            Booking b = approvedOverlaps.get(0);
            actualStatusMessage = "Booked by " + b.getFaculty().getName() + " (" + b.getSubjectOrCourse() + ")";
        } else if (hasTimetableConflict) {
            TimetableSlot t = timetableConflicts.get(0);
            actualStatusMessage = "Scheduled class: " + t.getCourseName() + " (" + t.getFacultyName() + ")";
        } else {
            actualStatusMessage = "No confirmed booking";
        }

        // 4. If actual schedule has confirmed booking/class, prediction availability is 0%
        if (!actualAvailable) {
            factors.add("Actual confirmed schedule in place: " + actualStatusMessage);
            PredictionResultDto result = PredictionResultDto.builder()
                    .classroomId(classroom.getId())
                    .roomNumber(classroom.getRoomNumber())
                    .requestedDate(date)
                    .startTime(startTime)
                    .endTime(endTime)
                    .actualAvailable(false)
                    .actualStatusMessage(actualStatusMessage)
                    .predictedAvailability(0.0)
                    .confidence("HIGH")
                    .explanation("An active booking or scheduled curriculum class occupies this slot (" + actualStatusMessage + ").")
                    .insufficientData(false)
                    .disclaimer("Predictions are statistical estimates, not guarantees.")
                    .contributingFactors(factors)
                    .build();
            if (logPrediction) saveLog(result, classroom);
            return result;
        }

        // 5. Baseline Statistical AI Model based on Historical Records & Academic Patterns
        List<Booking> historicalBookings = bookingRepository.findHistoricalBookingsByClassroom(classroom.getId());
        int totalHistorical = historicalBookings.size();

        // Sample count on this specific day of week and matching time slot
        long sameDaySlotBookings = historicalBookings.stream()
                .filter(b -> b.getBookingDate().getDayOfWeek() == dayOfWeek)
                .filter(b -> (b.getStartTime().isBefore(endTime) && b.getEndTime().isAfter(startTime)))
                .count();

        long sameDayTotal = historicalBookings.stream()
                .filter(b -> b.getBookingDate().getDayOfWeek() == dayOfWeek)
                .count();

        boolean insufficientData = totalHistorical < minSampleSize;

        double predictedAvailability;
        String confidence;
        StringBuilder explanation = new StringBuilder();

        if (insufficientData) {
            // Prior empirical distribution: typical university room availability base ~85%
            predictedAvailability = 85.0;
            confidence = "LOW";
            factors.add("Insufficient historical booking records (" + totalHistorical + " recorded; minimum " + minSampleSize + " recommended)");
            factors.add("Default academic prior baseline applied (85.0% estimated availability)");
            explanation.append("Insufficient historical booking data for Room ").append(classroom.getRoomNumber())
                    .append(". An empirical baseline estimate is provided. As more bookings are logged, prediction confidence will increase.");
        } else {
            // Calculate historical occupancy frequency
            double historicalOccupancyRate;
            if (sameDayTotal > 0) {
                historicalOccupancyRate = (double) sameDaySlotBookings / Math.max(sameDayTotal, 4.0);
            } else {
                historicalOccupancyRate = 0.15; // default low occupancy
            }

            // Time-of-day demand multiplier (Peak hours: 10:00 to 15:00)
            double timeOfDayFactor = 1.0;
            int startHour = startTime.getHour();
            if (startHour >= 10 && startHour <= 14) {
                timeOfDayFactor = 1.30; // 30% higher demand during peak core hours
                factors.add("Peak academic hours (10:00 AM - 3:00 PM): elevated demand multiplier 1.3x");
            } else if (startHour >= 8 && startHour < 10) {
                timeOfDayFactor = 0.90; // Early morning slightly lower demand
                factors.add("Morning slot: moderate demand multiplier 0.9x");
            } else {
                timeOfDayFactor = 0.75; // Late afternoon / evening lower demand
                factors.add("Late afternoon/evening: reduced demand multiplier 0.75x");
            }

            // Room Type demand weighting
            double roomTypeFactor = switch (classroom.getRoomType()) {
                case LABORATORY -> 1.20; // Labs are high-demand
                case LECTURE_HALL -> 1.10;
                case SEMINAR_HALL -> 0.85;
                case MEETING_ROOM -> 0.95;
            };
            factors.add("Room type " + classroom.getRoomType() + " utilization weight: " + roomTypeFactor + "x");

            // Capacity factor
            double capacityFactor = classroom.getCapacity() > 100 ? 1.15 : 1.0;

            // Day of week factor
            factors.add("Historical pattern for " + dayOfWeek + ": " + sameDaySlotBookings + " historical bookings in this time slot");

            double effectiveOccupancy = Math.min(0.92, historicalOccupancyRate * timeOfDayFactor * roomTypeFactor * capacityFactor);
            predictedAvailability = Math.round((1.0 - effectiveOccupancy) * 100.0 * 10.0) / 10.0;
            predictedAvailability = Math.max(8.0, Math.min(96.0, predictedAvailability));

            if (totalHistorical >= 15 && sameDayTotal >= 4) {
                confidence = "HIGH";
            } else if (totalHistorical >= 6) {
                confidence = "MEDIUM";
            } else {
                confidence = "LOW";
            }

            explanation.append("Historical analysis of ").append(totalHistorical).append(" past bookings: ")
                    .append(dayOfWeek).append(" slots around ").append(startTime).append(" show an estimated ")
                    .append(Math.round((100.0 - predictedAvailability))).append("% contention rate. ")
                    .append("No conflicting timetable schedule or confirmed booking detected.");
        }

        factors.add("Actual schedule: " + actualStatusMessage);

        PredictionResultDto result = PredictionResultDto.builder()
                .classroomId(classroom.getId())
                .roomNumber(classroom.getRoomNumber())
                .requestedDate(date)
                .startTime(startTime)
                .endTime(endTime)
                .actualAvailable(true)
                .actualStatusMessage(actualStatusMessage)
                .predictedAvailability(predictedAvailability)
                .confidence(confidence)
                .explanation(explanation.toString())
                .insufficientData(insufficientData)
                .disclaimer("Predictions are statistical estimates based on historical patterns, not a guarantee.")
                .historicalBookingRate(Math.round((100.0 - predictedAvailability) * 10.0) / 10.0)
                .timetableConflict(false)
                .historicalSampleCount(totalHistorical)
                .contributingFactors(factors)
                .build();

        if (logPrediction) {
            saveLog(result, classroom);
        }

        return result;
    }

    private void saveLog(PredictionResultDto dto, Classroom classroom) {
        try {
            PredictionLog logEntity = PredictionLog.builder()
                    .classroom(classroom)
                    .requestedDate(dto.getRequestedDate())
                    .startTime(dto.getStartTime())
                    .endTime(dto.getEndTime())
                    .predictedAvailability(dto.getPredictedAvailability())
                    .confidence(dto.getConfidence())
                    .explanation(dto.getExplanation())
                    .outcomeTracked(false)
                    .build();
            predictionLogRepository.save(logEntity);
        } catch (Exception e) {
            log.warn("Failed to persist prediction log", e);
        }
    }

    @Transactional
    public void evaluateTrackedOutcomes() {
        List<PredictionLog> untracked = predictionLogRepository.findAll().stream()
                .filter(p -> !Boolean.TRUE.equals(p.getOutcomeTracked()))
                .filter(p -> p.getRequestedDate().isBefore(LocalDate.now()) ||
                        (p.getRequestedDate().isEqual(LocalDate.now()) && p.getEndTime().isBefore(LocalTime.now())))
                .toList();

        for (PredictionLog pl : untracked) {
            List<Booking> approved = bookingRepository.findOverlappingBookings(
                    pl.getClassroom().getId(), pl.getRequestedDate(), pl.getStartTime(), pl.getEndTime(),
                    List.of(BookingStatus.APPROVED, BookingStatus.COMPLETED));

            boolean actualBooked = !approved.isEmpty();
            pl.setActualBooked(actualBooked);
            pl.setOutcomeTracked(true);
            pl.setEvaluatedAt(LocalDateTime.now());
            predictionLogRepository.save(pl);
        }
    }
}
