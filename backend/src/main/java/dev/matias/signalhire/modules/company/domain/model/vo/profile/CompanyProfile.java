package dev.matias.signalhire.modules.company.domain.model.vo.profile;

import com.google.common.collect.ImmutableList;
import lombok.*;

import java.util.Collections;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfile {
    private String mission;
    private String vision;
    private List<String> values;
    private String cultureDescription;
    private List<WorkEnvironment> workEnvironments;
    private CommunicationStyle communicationStyle;
    private ManagementStyle managementStyle;
    private InnovationLevel innovationLevel;
    private List<String> benefits;

    public List<String> getValues() {
        return this.values != null ? ImmutableList.copyOf(this.values) : Collections.emptyList();
    }

    public List<String> getBenefits() {
        return this.benefits != null ? ImmutableList.copyOf(this.benefits) : Collections.emptyList();
    }

    public List<WorkEnvironment> getWorkEnvironments() {
        return this.workEnvironments != null ? ImmutableList.copyOf(this.workEnvironments) : Collections.emptyList();
    }
}
