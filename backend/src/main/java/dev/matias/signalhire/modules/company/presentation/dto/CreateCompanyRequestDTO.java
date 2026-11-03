package dev.matias.signalhire.modules.company.presentation.dto;

import dev.matias.signalhire.modules.company.domain.model.vo.profile.CompanySize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.util.List;

@Builder
public record CreateCompanyRequestDTO(
        @NotBlank(message = "O nome da empresa é obrigatório.")
        String name,

        String legalName,

        String description,

        String logoUrl,

        CompanySize size,

        CompanyProfileDTO profile,

        @Valid
        List<SiteDTO> sites
) {}
