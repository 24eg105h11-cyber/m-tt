package com.classroom.prediction.dto;

import com.classroom.prediction.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingApprovalRequest {
    @NotNull
    private BookingStatus status; // APPROVED or REJECTED

    private String rejectionReason;
}
