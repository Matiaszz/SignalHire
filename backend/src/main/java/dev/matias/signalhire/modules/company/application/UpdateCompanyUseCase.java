package dev.matias.signalhire.modules.company.application;

import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.member.Member;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.modules.company.presentation.dto.CompanyResponseDTO;
import dev.matias.signalhire.modules.company.presentation.dto.SiteDTO;
import dev.matias.signalhire.modules.company.presentation.dto.UpdateCompanyRequestDTO;
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
public class UpdateCompanyUseCase {

    private final CompanyRepository companyRepository;

    @Transactional
    public CompanyResponseDTO execute(ObjectId companyId, UpdateCompanyRequestDTO request, ObjectId currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApplicationException(
                        ApplicationExceptionCode.RESOURCE_NOT_FOUND,
                        "Empresa não encontrada."
                ));

        Member currentMember = company.getMember(currentUserId);
        if (currentMember == null || (currentMember.getRole() != CompanyRole.OWNER && currentMember.getRole() != CompanyRole.ADMIN)) {
            throw new ApplicationException(
                    ApplicationExceptionCode.FORBIDDEN_ACTION,
                    "Você não tem permissão para editar os dados desta empresa."
            );
        }

        company.setName(request.name().trim());
        company.setLegalName(request.legalName() != null ? request.legalName().trim() : null);
        company.setDescription(request.description() != null ? request.description().trim() : null);

        if (request.logoUrl() != null) {
            company.setLogoUrl(request.logoUrl());
        }

        if (request.size() != null) {
            company.setSize(request.size());
        }

        if (request.profile() != null) {
            company.setProfile(request.profile().toDomain());
        }

        if (request.sites() != null) {
            company.setSites(new ArrayList<>(request.sites().stream().map(SiteDTO::toDomain).toList()));
        }

        Company updated = companyRepository.save(company);
        log.info("Empresa '{}' ({}) atualizada pelo usuário '{}'.", updated.getName(), updated.getId(), currentUserId);

        return CompanyResponseDTO.from(updated);
    }
}
