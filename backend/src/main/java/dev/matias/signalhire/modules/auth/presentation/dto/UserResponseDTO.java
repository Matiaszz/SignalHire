package dev.matias.signalhire.modules.auth.presentation.dto;

import dev.matias.signalhire.modules.auth.domain.model.User;
import lombok.Builder;

import java.time.Instant;

@Builder
public record UserResponseDTO(
        String id,
        String name,
        String email,
        String profilePictureUrl,
        String role,
        Instant createdAt
) {
    public static UserResponseDTO from(User user) {
        if (user == null) {
            return null;
        }
        return UserResponseDTO.builder()
                .id(user.getId() != null ? user.getId().toHexString() : null)
                .name(user.getName())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
