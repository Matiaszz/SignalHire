package dev.matias.signalhire.modules.auth.presentation.dto;

import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UpdateProfileRequestDTO(
        @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres.")
        String name,

        String profilePictureUrl
) {}
