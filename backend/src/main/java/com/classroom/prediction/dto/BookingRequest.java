package com.classroom.prediction.dto;

import com.classroom.prediction.model.BookingPurpose;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull
    private Long classroomId;

    @NotNull
    private LocalDate bookingDate;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotNull
    @Min(1)
    private Integer requiredCapacity;

    private Set<String> requiredFacilities;

    @NotNull
    private BookingPurpose purpose;

    @NotBlank
    private String subjectOrCourse;

    private String notes;
}
