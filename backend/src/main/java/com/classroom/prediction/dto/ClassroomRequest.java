package com.classroom.prediction.dto;

import com.classroom.prediction.model.RoomStatus;
import com.classroom.prediction.model.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomRequest {
    @NotBlank
    private String roomNumber;

    @NotBlank
    private String building;

    @NotNull
    private Integer floor;

    @NotNull
    @Min(1)
    private Integer capacity;

    private Set<String> facilities;

    @NotNull
    private RoomType roomType;

    private RoomStatus status = RoomStatus.ACTIVE;
}
