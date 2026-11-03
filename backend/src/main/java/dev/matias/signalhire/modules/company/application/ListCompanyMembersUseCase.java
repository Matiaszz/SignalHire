package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.modules.company.presentation.dto.MemberResponseDTO;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListCompanyMembersUseCase {

    private final CompanyRepository companyRepository;

    public List<MemberResponseDTO> execute(ObjectId companyId, ObjectId currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Empresa não encontrada."
                ));

        if (company.getMember(currentUserId) == null) {
            throw new ApplicationException(
                    ApplicationExceptionCode.FORBIDDEN_ACTION,
                    "Apenas membros da empresa podem visualizar a lista completa de membros."
            );
        }

        return company.getMembers().stream()
                .map(MemberResponseDTO::from)
                .toList();
    }
}
