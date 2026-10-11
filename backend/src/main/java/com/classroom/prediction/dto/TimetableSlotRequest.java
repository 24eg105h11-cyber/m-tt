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
public class TimetableSlotRequest {
    @NotNull
    private Long classroomId;

    @NotNull
    private DayOfWeek dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotBlank
    private String courseName;

    @NotBlank
    private String facultyName;

    private String semester;
    private String academicYear;
    private Boolean isActive = true;
}
