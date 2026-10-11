package com.classroom.prediction.controller;

import com.classroom.prediction.dto.TimetableSlotDto;
import com.classroom.prediction.dto.TimetableSlotRequest;
import com.classroom.prediction.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public ResponseEntity<List<TimetableSlotDto>> getAllSlots() {
        return ResponseEntity.ok(timetableService.getAllSlots());
    }

    @GetMapping("/public")
    public ResponseEntity<List<TimetableSlotDto>> searchSlots(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(timetableService.searchSlots(query));
    }

    @GetMapping("/classroom/{classroomId}")
    public ResponseEntity<List<TimetableSlotDto>> getSlotsByClassroom(@PathVariable Long classroomId) {
        return ResponseEntity.ok(timetableService.getSlotsByClassroom(classroomId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimetableSlotDto> createSlot(@Valid @RequestBody TimetableSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timetableService.createSlot(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        timetableService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }
}
