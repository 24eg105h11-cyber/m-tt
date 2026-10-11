package com.classroom.prediction.dto;

import com.classroom.prediction.model.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private String employeeOrStudentId;
}
