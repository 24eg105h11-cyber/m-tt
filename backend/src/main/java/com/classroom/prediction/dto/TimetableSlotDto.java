package com.classroom.prediction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableSlotDto {
    private Long id;
    private Long classroomId;
    private String roomNumber;
    private String building;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String courseName;
    private String facultyName;
    private String semester;
    private String academicYear;
    private Boolean isActive;
}
