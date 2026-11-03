package dev.matias.signalhire.modules.company.presentation.dto;

import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record UpdateMemberRoleRequestDTO(
        @NotNull(message = "O novo cargo (role) é obrigatório.")
        CompanyRole role
) {}
