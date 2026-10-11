package com.classroom.prediction.dto;

import com.classroom.prediction.model.BookingPurpose;
import com.classroom.prediction.model.BookingStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDto {
    private Long id;
    private ClassroomDto classroom;
    private UserDto faculty;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer requiredCapacity;
    private Set<String> requiredFacilities;
    private BookingPurpose purpose;
    private String subjectOrCourse;
    private String notes;
    private BookingStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
