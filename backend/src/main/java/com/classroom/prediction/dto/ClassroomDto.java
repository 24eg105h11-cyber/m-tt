package com.classroom.prediction.dto;

import com.classroom.prediction.model.RoomStatus;
import com.classroom.prediction.model.RoomType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomDto {
    private Long id;
    private String roomNumber;
    private String building;
    private Integer floor;
    private Integer capacity;
    private Set<String> facilities;
    private RoomType roomType;
    private RoomStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
