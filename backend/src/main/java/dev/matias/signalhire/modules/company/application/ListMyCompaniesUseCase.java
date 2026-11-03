package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.modules.company.presentation.dto.CompanySummaryResponseDTO;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListMyCompaniesUseCase {

    private final CompanyRepository companyRepository;

    public List<CompanySummaryResponseDTO> execute(ObjectId currentUserId) {
        List<Company> companies = companyRepository.findAllByMemberUserId(currentUserId);
        return companies.stream()
                .map(company -> CompanySummaryResponseDTO.from(company, currentUserId))
                .toList();
    }
}
