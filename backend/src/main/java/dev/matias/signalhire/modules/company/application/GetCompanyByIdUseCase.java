package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.modules.company.presentation.dto.CompanyResponseDTO;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetCompanyByIdUseCase {

    private final CompanyRepository companyRepository;

    public CompanyResponseDTO execute(ObjectId companyId, ObjectId currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Empresa não encontrada."
                ));

        if (currentUserId == null || company.getMember(currentUserId) == null) {
            throw new ApplicationException(
                    ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                    "Empresa não encontrada."
            );
        }

        return CompanyResponseDTO.from(company);
    }
}
