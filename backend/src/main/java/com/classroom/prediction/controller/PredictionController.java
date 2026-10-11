package com.classroom.prediction.controller;

import com.classroom.prediction.dto.PredictionResultDto;
import com.classroom.prediction.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/prediction")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping
    public ResponseEntity<PredictionResultDto> getPrediction(
            @RequestParam Long classroomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {

        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalTime start = startTime != null ? startTime : LocalTime.of(9, 0);
        LocalTime end = endTime != null ? endTime : LocalTime.of(10, 0);

        return ResponseEntity.ok(predictionService.predictClassroomAvailability(classroomId, targetDate, start, end));
    }

    @PostMapping("/evaluate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> evaluateOutcomes() {
        predictionService.evaluateTrackedOutcomes();
        return ResponseEntity.ok(Map.of("message", "Prediction outcomes evaluated successfully"));
    }
}
