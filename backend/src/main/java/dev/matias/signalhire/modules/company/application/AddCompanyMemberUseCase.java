package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.member.Member;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.modules.company.presentation.dto.AddMemberRequestDTO;
import dev.matias.signalhire.modules.company.presentation.dto.MemberResponseDTO;
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
public class AddCompanyMemberUseCase {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public MemberResponseDTO execute(ObjectId companyId, AddMemberRequestDTO request, ObjectId currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Empresa não encontrada."
                ));

        Member currentMember = company.getMember(currentUserId);
        if (currentMember == null || (currentMember.getRole() != CompanyRole.OWNER && currentMember.getRole() != CompanyRole.ADMIN)) {
            throw new ApplicationException(
                    ApplicationExceptionCode.FORBIDDEN_ACTION,
                    "Você não tem permissão para adicionar membros a esta empresa."
            );
        }

        if (request.role() == CompanyRole.OWNER && currentMember.getRole() != CompanyRole.OWNER) {
            throw new ApplicationException(
                    ApplicationExceptionCode.FORBIDDEN_ACTION,
                    "Apenas proprietários podem adicionar novos proprietários à empresa."
            );
        }

        String normalizedEmail = request.email().trim().toLowerCase();
        User userToAdd = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Nenhum usuário cadastrado foi encontrado com o e-mail informado."
                ));

        if (company.getMember(userToAdd.getId()) != null) {
            throw new BusinessException("Este usuário já é membro desta empresa.");
        }

        company.addMember(userToAdd, request.role());
        Company updated = companyRepository.save(company);
        log.info("Membro '{}' adicionado à empresa '{}' com o cargo {}.", userToAdd.getEmail(), company.getName(), request.role());

        Member addedMember = updated.getMember(userToAdd.getId());
        return MemberResponseDTO.from(addedMember);
    }
}
