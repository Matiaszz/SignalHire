package dev.matias.signalhire.modules.auth.presentation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record RegisterRequestDTO(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres.")
        String name,

        @NotBlank(message = "O email é obrigatório.")
        @Email(message = "O email informado é inválido.")
        String email,

        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 6, max = 100, message = "A senha deve ter no mínimo 6 caracteres.")
        String password,

        String profilePictureUrl
) {}
