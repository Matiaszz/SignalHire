package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.member.Member;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.modules.company.presentation.dto.MemberResponseDTO;
import dev.matias.signalhire.modules.company.presentation.dto.UpdateMemberRoleRequestDTO;
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
public class UpdateCompanyMemberRoleUseCase {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public MemberResponseDTO execute(ObjectId companyId, ObjectId memberUserId, UpdateMemberRoleRequestDTO request, ObjectId currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Empresa não encontrada."
                ));

        Member targetMember = company.getMember(memberUserId);
        if (targetMember == null) {
            throw new ApplicationException(
                    ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                    "Membro não encontrado nesta empresa."
            );
        }

        if (targetMember.getRole() == CompanyRole.OWNER && request.role() != CompanyRole.OWNER) {
            long ownerCount = company.getMembers().stream()
                    .filter(m -> m.getRole() == CompanyRole.OWNER)
                    .count();
            if (ownerCount <= 1) {
                throw new BusinessException("A empresa deve possuir ao menos um proprietário (OWNER).");
            }
        }

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Usuário autenticado não encontrado."
                ));

        boolean success = company.changeMemberRole(targetMember, request.role(), currentUser);
        if (!success) {
            throw new ApplicationException(
                    ApplicationExceptionCode.FORBIDDEN_ACTION,
                    "Você não possui permissão para alterar a função deste membro para o cargo selecionado."
            );
        }

        Company updated = companyRepository.save(company);
        log.info("Cargo do membro '{}' na empresa '{}' alterado para {}.", memberUserId, company.getName(), request.role());

        return MemberResponseDTO.from(updated.getMember(memberUserId));
    }
}
