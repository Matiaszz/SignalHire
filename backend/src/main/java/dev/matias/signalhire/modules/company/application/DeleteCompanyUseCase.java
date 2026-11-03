package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.member.Member;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeleteCompanyUseCase {

    private final CompanyRepository companyRepository;

    @Transactional
    public void execute(ObjectId companyId, ObjectId currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Empresa não encontrada."
                ));

        Member currentMember = company.getMember(currentUserId);
        if (currentMember == null || currentMember.getRole() != CompanyRole.OWNER) {
            throw new ApplicationException(
                    ApplicationExceptionCode.FORBIDDEN_ACTION,
                    "Apenas o proprietário (OWNER) pode excluir a empresa."
            );
        }

        companyRepository.delete(company);
        log.info("Empresa '{}' ({}) excluída pelo proprietário '{}'.", company.getName(), company.getId(), currentUserId);
    }
}
