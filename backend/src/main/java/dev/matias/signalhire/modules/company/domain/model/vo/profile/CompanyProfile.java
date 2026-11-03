package dev.matias.signalhire.modules.company.domain.model.vo.profile;

import com.google.common.collect.ImmutableList;
import lombok.AllArgsConstructor;

import java.util.List;

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

    public ImmutableList<String> getValues(){
        return ImmutableList.copyOf(this.values);
    }

    public ImmutableList<String> getBenefits(){
        return ImmutableList.copyOf(this.benefits);
    }

    public ImmutableList<WorkEnvironment> getWorkEnvironments(){
        return ImmutableList.copyOf(this.workEnvironments);
    }

}
