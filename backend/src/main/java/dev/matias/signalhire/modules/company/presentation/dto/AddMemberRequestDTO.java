package dev.matias.signalhire.modules.company.presentation.dto;

import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record AddMemberRequestDTO(
        @NotBlank(message = "O e-mail do usuário é obrigatório.")
        @Email(message = "Formato de e-mail inválido.")
        String email,

        @NotNull(message = "O cargo (role) do membro é obrigatório.")
        CompanyRole role
) {}
