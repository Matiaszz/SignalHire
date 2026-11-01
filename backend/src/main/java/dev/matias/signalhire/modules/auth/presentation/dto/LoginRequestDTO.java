package dev.matias.signalhire.modules.auth.presentation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record LoginRequestDTO(
        @NotBlank(message = "O email é obrigatório.")
        @Email(message = "O email informado é inválido.")
        String email,

        @NotBlank(message = "A senha é obrigatória.")
        String password
) {}
