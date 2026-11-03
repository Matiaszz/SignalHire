package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.modules.company.presentation.dto.CompanyResponseDTO;
import dev.matias.signalhire.modules.company.presentation.dto.CreateCompanyRequestDTO;
import dev.matias.signalhire.modules.company.presentation.dto.SiteDTO;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreateCompanyUseCase {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public CompanyResponseDTO execute(CreateCompanyRequestDTO request, ObjectId currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Usuário não encontrado."
                ));

        Company company = Company.builder()
                .name(request.name().trim())
                .legalName(request.legalName() != null ? request.legalName().trim() : null)
                .description(request.description() != null ? request.description().trim() : null)
                .logoUrl(request.logoUrl())
                .size(request.size())
                .profile(request.profile() != null ? request.profile().toDomain() : null)
                .sites(request.sites() != null
                        ? new ArrayList<>(request.sites().stream().map(SiteDTO::toDomain).toList())
                        : new ArrayList<>())
                .build();

        company.addMember(currentUser, CompanyRole.OWNER);

        Company saved = companyRepository.save(company);
        log.info("Empresa '{}' ({}) criada pelo usuário '{}'.", saved.getName(), saved.getId(), currentUser.getEmail());

        return CompanyResponseDTO.from(saved);
    }
}
