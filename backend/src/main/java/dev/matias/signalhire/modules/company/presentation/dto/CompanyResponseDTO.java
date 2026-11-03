package dev.matias.signalhire.modules.company.presentation.dto;

import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.profile.CompanySize;
import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
public record CompanyResponseDTO(
        String id,
        String name,
        String legalName,
        String description,
        String logoUrl,
        CompanySize size,
        CompanyProfileDTO profile,
        List<SiteDTO> sites,
        List<MemberResponseDTO> members,
        Instant createdAt,
        Instant updatedAt
) {
    public static CompanyResponseDTO from(Company company) {
        if (company == null) return null;
        return CompanyResponseDTO.builder()
                .id(company.getId() != null ? company.getId().toHexString() : null)
                .name(company.getName())
                .legalName(company.getLegalName())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .size(company.getSize())
                .profile(company.getProfile() != null ? CompanyProfileDTO.from(company.getProfile()) : null)
                .sites(company.getSites() != null ? company.getSites().stream().map(SiteDTO::from).toList() : List.of())
                .members(company.getMembers() != null ? company.getMembers().stream().map(MemberResponseDTO::from).toList() : List.of())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }
}
