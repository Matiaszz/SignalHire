package dev.matias.signalhire.modules.company.presentation.controller;

import dev.matias.signalhire.modules.company.application.*;
import dev.matias.signalhire.modules.company.presentation.dto.*;
import dev.matias.signalhire.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CreateCompanyUseCase createCompanyUseCase;
    private final GetCompanyByIdUseCase getCompanyByIdUseCase;
    private final ListMyCompaniesUseCase listMyCompaniesUseCase;
    private final UpdateCompanyUseCase updateCompanyUseCase;
    private final DeleteCompanyUseCase deleteCompanyUseCase;
    private final AddCompanyMemberUseCase addCompanyMemberUseCase;
    private final UpdateCompanyMemberRoleUseCase updateCompanyMemberRoleUseCase;
    private final RemoveCompanyMemberUseCase removeCompanyMemberUseCase;
    private final ListCompanyMembersUseCase listCompanyMembersUseCase;

    @PostMapping
    public ResponseEntity<CompanyResponseDTO> create(
            @Valid @RequestBody CreateCompanyRequestDTO request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CompanyResponseDTO response = createCompanyUseCase.execute(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<CompanySummaryResponseDTO>> getMyCompanies(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<CompanySummaryResponseDTO> companies = listMyCompaniesUseCase.execute(principal.getId());
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> getById(
            @PathVariable ObjectId id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ObjectId currentUserId = principal != null ? principal.getId() : null;
        CompanyResponseDTO company = getCompanyByIdUseCase.execute(id, currentUserId);
        return ResponseEntity.ok(company);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> update(
            @PathVariable ObjectId id,
            @Valid @RequestBody UpdateCompanyRequestDTO request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CompanyResponseDTO updated = updateCompanyUseCase.execute(id, request, principal.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable ObjectId id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        deleteCompanyUseCase.execute(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberResponseDTO>> getMembers(
            @PathVariable ObjectId id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<MemberResponseDTO> members = listCompanyMembersUseCase.execute(id, principal.getId());
        return ResponseEntity.ok(members);
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<MemberResponseDTO> addMember(
            @PathVariable ObjectId id,
            @Valid @RequestBody AddMemberRequestDTO request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        MemberResponseDTO member = addCompanyMemberUseCase.execute(id, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    @PutMapping("/{id}/members/{userId}/role")
    public ResponseEntity<MemberResponseDTO> updateMemberRole(
            @PathVariable ObjectId id,
            @PathVariable ObjectId userId,
            @Valid @RequestBody UpdateMemberRoleRequestDTO request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        MemberResponseDTO updated = updateCompanyMemberRoleUseCase.execute(id, userId, request, principal.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable ObjectId id,
            @PathVariable ObjectId userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        removeCompanyMemberUseCase.execute(id, userId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
