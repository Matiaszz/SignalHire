package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.member.Member;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import dev.matias.signalhire.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RemoveCompanyMemberUseCase {

    private final CompanyRepository companyRepository;

    @Transactional
    public void execute(ObjectId companyId, ObjectId memberUserId, ObjectId currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Empresa não encontrada."
                ));

        Member currentMember = company.getMember(currentUserId);
        if (currentMember == null || (currentMember.getRole() != CompanyRole.OWNER && currentMember.getRole() != CompanyRole.ADMIN)) {
            throw new ApplicationException(
                    ApplicationExceptionCode.FORBIDDEN_ACTION,
                    "Você não tem permissão para remover membros desta empresa."
            );
        }

        Member targetMember = company.getMember(memberUserId);
        if (targetMember == null) {
            throw new ApplicationException(
                    ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                    "Membro não encontrado nesta empresa."
            );
        }

        if (currentMember.getRole() == CompanyRole.ADMIN && targetMember.getRole() == CompanyRole.OWNER) {
            throw new ApplicationException(
                    ApplicationExceptionCode.FORBIDDEN_ACTION,
                    "Administradores não têm permissão para remover proprietários da empresa."
            );
        }

        if (targetMember.getRole() == CompanyRole.OWNER) {
            long ownerCount = company.getMembers().stream()
                    .filter(m -> m.getRole() == CompanyRole.OWNER)
                    .count();
            if (ownerCount <= 1) {
                throw new BusinessException("Não é possível remover o único proprietário da empresa.");
            }
        }

        company.removeMember(targetMember);
        companyRepository.save(company);
        log.info("Membro '{}' removido da empresa '{}' por '{}'.", memberUserId, company.getName(), currentUserId);
    }
}
