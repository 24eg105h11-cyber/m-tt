package com.classroom.prediction.controller;

import com.classroom.prediction.dto.ClassroomSearchRequest;
import com.classroom.prediction.dto.ClassroomSearchResultDto;
import com.classroom.prediction.model.RoomType;
import com.classroom.prediction.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/classrooms/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<List<ClassroomSearchResultDto>> searchClassrooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) RoomType roomType,
            @RequestParam(required = false) Set<String> requiredFacilities) {

        ClassroomSearchRequest request = ClassroomSearchRequest.builder()
                .date(date != null ? date : LocalDate.now())
                .startTime(startTime != null ? startTime : LocalTime.of(9, 0))
                .endTime(endTime != null ? endTime : LocalTime.of(10, 0))
                .minCapacity(minCapacity)
                .building(building)
                .roomType(roomType)
                .requiredFacilities(requiredFacilities)
                .build();

        return ResponseEntity.ok(searchService.searchClassrooms(request));
    }
}
