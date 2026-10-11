package com.classroom.prediction.controller;

import com.classroom.prediction.dto.ClassroomDto;
import com.classroom.prediction.dto.ClassroomRequest;
import com.classroom.prediction.model.RoomStatus;
import com.classroom.prediction.model.RoomType;
import com.classroom.prediction.service.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping
    public ResponseEntity<List<ClassroomDto>> getAllClassrooms(
            @RequestParam(required = false) RoomStatus status,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) RoomType roomType,
            @RequestParam(required = false) Integer minCapacity) {
        return ResponseEntity.ok(classroomService.getAllClassrooms(status, building, roomType, minCapacity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassroomDto> getClassroomById(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.getClassroomById(id));
    }

    @GetMapping("/buildings")
    public ResponseEntity<List<String>> getBuildings() {
        return ResponseEntity.ok(classroomService.getBuildings());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassroomDto> createClassroom(@Valid @RequestBody ClassroomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classroomService.createClassroom(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassroomDto> updateClassroom(
            @PathVariable Long id,
            @Valid @RequestBody ClassroomRequest request) {
        return ResponseEntity.ok(classroomService.updateClassroom(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassroomDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        RoomStatus status = RoomStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(classroomService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClassroom(@PathVariable Long id) {
        classroomService.deleteClassroom(id);
        return ResponseEntity.noContent().build();
    }
}
