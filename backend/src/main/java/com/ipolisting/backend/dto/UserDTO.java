package com.ipolisting.backend.dto;

import com.ipolisting.backend.model.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;

    public static UserDTO from(User user) {
        UserDTO dto = new UserDTO();
        dto.id = user.getId();
        dto.email = user.getEmail();
        dto.fullName = user.getFullName();
        dto.role = user.getRole().name();
        dto.enabled = user.isEnabled();
        dto.createdAt = user.getCreatedAt();
        return dto;
    }
}
