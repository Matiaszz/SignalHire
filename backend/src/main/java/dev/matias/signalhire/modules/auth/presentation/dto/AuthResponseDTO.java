package dev.matias.signalhire.modules.auth.presentation.dto;

import lombok.Builder;

@Builder
public record AuthResponseDTO(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponseDTO user
) {
    public static AuthResponseDTO of(String accessToken, long expiresIn, UserResponseDTO user) {
        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(user)
                .build();
    }
}
