package dev.matias.signalhire.modules.company.presentation.dto;

import dev.matias.signalhire.modules.company.domain.model.vo.profile.*;
import lombok.Builder;

import java.util.List;

@Builder
public record CompanyProfileDTO(
        String mission,
        String vision,
        List<String> values,
        String cultureDescription,
        List<WorkEnvironment> workEnvironments,
        CommunicationStyle communicationStyle,
        ManagementStyle managementStyle,
        InnovationLevel innovationLevel,
        List<String> benefits
) {
    public static CompanyProfileDTO from(CompanyProfile profile) {
        if (profile == null) return null;
        return CompanyProfileDTO.builder()
                .mission(profile.getMission())
                .vision(profile.getVision())
                .values(profile.getValues())
                .cultureDescription(profile.getCultureDescription())
                .workEnvironments(profile.getWorkEnvironments())
                .communicationStyle(profile.getCommunicationStyle())
                .managementStyle(profile.getManagementStyle())
                .innovationLevel(profile.getInnovationLevel())
                .benefits(profile.getBenefits())
                .build();
    }

    public CompanyProfile toDomain() {
        return CompanyProfile.builder()
                .mission(this.mission)
                .vision(this.vision)
                .values(this.values)
                .cultureDescription(this.cultureDescription)
                .workEnvironments(this.workEnvironments)
                .communicationStyle(this.communicationStyle)
                .managementStyle(this.managementStyle)
                .innovationLevel(this.innovationLevel)
                .benefits(this.benefits)
                .build();
    }
}
