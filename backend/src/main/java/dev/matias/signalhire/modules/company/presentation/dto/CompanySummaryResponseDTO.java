package dev.matias.signalhire.modules.company.presentation.dto;

import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.profile.CompanySize;
import lombok.Builder;
import org.bson.types.ObjectId;

import java.time.Instant;

@Builder
public record CompanySummaryResponseDTO(
        String id,
        String name,
        String description,
        String logoUrl,
        CompanySize size,
        CompanyRole currentUserRole,
        int membersCount,
        Instant createdAt
) {
    public static CompanySummaryResponseDTO from(Company company, ObjectId currentUserId) {
        if (company == null) return null;
        var userMember = currentUserId != null ? company.getMember(currentUserId) : null;
        return CompanySummaryResponseDTO.builder()
                .id(company.getId() != null ? company.getId().toHexString() : null)
                .name(company.getName())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .size(company.getSize())
                .currentUserRole(userMember != null ? userMember.getRole() : null)
                .membersCount(company.getMembers() != null ? company.getMembers().size() : 0)
                .createdAt(company.getCreatedAt())
                .build();
    }
}
