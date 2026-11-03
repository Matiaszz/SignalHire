package dev.matias.signalhire.modules.company;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.company.application.*;
import dev.matias.signalhire.modules.company.domain.model.Company;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.member.Member;
import dev.matias.signalhire.modules.company.domain.model.vo.profile.CompanyProfile;
import dev.matias.signalhire.modules.company.domain.model.vo.profile.CompanySize;
import dev.matias.signalhire.modules.company.domain.repository.CompanyRepository;
import dev.matias.signalhire.modules.company.presentation.dto.*;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import dev.matias.signalhire.shared.exception.BusinessException;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CompanyUseCasesTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    private CreateCompanyUseCase createCompanyUseCase;
    private GetCompanyByIdUseCase getCompanyByIdUseCase;
    private ListMyCompaniesUseCase listMyCompaniesUseCase;
    private UpdateCompanyUseCase updateCompanyUseCase;
    private DeleteCompanyUseCase deleteCompanyUseCase;
    private AddCompanyMemberUseCase addCompanyMemberUseCase;
    private UpdateCompanyMemberRoleUseCase updateCompanyMemberRoleUseCase;
    private RemoveCompanyMemberUseCase removeCompanyMemberUseCase;
    private ListCompanyMembersUseCase listCompanyMembersUseCase;

    private User ownerUser;
    private User regularUser;

    @BeforeEach
    void setUp() {
        createCompanyUseCase = new CreateCompanyUseCase(companyRepository, userRepository);
        getCompanyByIdUseCase = new GetCompanyByIdUseCase(companyRepository);
        listMyCompaniesUseCase = new ListMyCompaniesUseCase(companyRepository);
        updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);
        deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);
        addCompanyMemberUseCase = new AddCompanyMemberUseCase(companyRepository, userRepository);
        updateCompanyMemberRoleUseCase = new UpdateCompanyMemberRoleUseCase(companyRepository, userRepository);
        removeCompanyMemberUseCase = new RemoveCompanyMemberUseCase(companyRepository);
        listCompanyMembersUseCase = new ListCompanyMembersUseCase(companyRepository);

        ownerUser = User.builder()
                .id(ObjectId.get())
                .name("Alice Owner")
                .email("alice@techcorp.com")
                .role("USER")
                .active(true)
                .build();

        regularUser = User.builder()
                .id(ObjectId.get())
                .name("Bob Member")
                .email("bob@techcorp.com")
                .role("USER")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should create company and register current user as OWNER")
    void shouldCreateCompanyWithCurrentUserAsOwner() {
        CreateCompanyRequestDTO request = CreateCompanyRequestDTO.builder()
                .name("Tech Corp")
                .legalName("Tech Corp LTDA")
                .description("Inovação em tecnologia")
                .size(CompanySize.STARTUP)
                .build();

        when(userRepository.findById(ownerUser.getId())).thenReturn(Optional.of(ownerUser));
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        CompanyResponseDTO response = createCompanyUseCase.execute(request, ownerUser.getId());

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Tech Corp");
        assertThat(response.members()).hasSize(1);
        assertThat(response.members().get(0).role()).isEqualTo(CompanyRole.OWNER);
        assertThat(response.members().get(0).email()).isEqualTo("alice@techcorp.com");
    }

    @Test
    @DisplayName("Should allow a single user to be the owner of multiple companies")
    void shouldAllowUserToOwnMultipleCompanies() {
        CreateCompanyRequestDTO request1 = CreateCompanyRequestDTO.builder().name("Company One").build();
        CreateCompanyRequestDTO request2 = CreateCompanyRequestDTO.builder().name("Company Two").build();

        when(userRepository.findById(ownerUser.getId())).thenReturn(Optional.of(ownerUser));
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        CompanyResponseDTO company1 = createCompanyUseCase.execute(request1, ownerUser.getId());
        CompanyResponseDTO company2 = createCompanyUseCase.execute(request2, ownerUser.getId());

        assertThat(company1.name()).isEqualTo("Company One");
        assertThat(company2.name()).isEqualTo("Company Two");
        assertThat(company1.id()).isNotEqualTo(company2.id());
    }

    @Test
    @DisplayName("Should get company by ID when user is a member")
    void shouldGetCompanyById() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder()
                .id(companyId)
                .name("Acme Inc")
                .build();
        company.addMember(ownerUser, CompanyRole.OWNER);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        CompanyResponseDTO response = getCompanyByIdUseCase.execute(companyId, ownerUser.getId());

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(companyId.toHexString());
        assertThat(response.name()).isEqualTo("Acme Inc");
    }

    @Test
    @DisplayName("Should throw 404 NOT_FOUND when getting nonexistent company")
    void shouldThrowWhenCompanyNotFound() {
        ObjectId companyId = ObjectId.get();
        when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> getCompanyByIdUseCase.execute(companyId, ownerUser.getId()))
                .isInstanceOf(ApplicationException.class)
                .hasFieldOrPropertyWithValue("errorCode", ApplicationExceptionCode.RESOURCE_NOT_FOUND);
    }

    @Test
    @DisplayName("Should throw 404 NOT_FOUND when company exists but user has no relation with it")
    void shouldThrowNotFoundWhenUserHasNoRelationWithCompany() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder()
                .id(companyId)
                .name("Acme Inc")
                .build();
        company.addMember(ownerUser, CompanyRole.OWNER);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        assertThatThrownBy(() -> getCompanyByIdUseCase.execute(companyId, regularUser.getId()))
                .isInstanceOf(ApplicationException.class)
                .hasFieldOrPropertyWithValue("errorCode", ApplicationExceptionCode.RESOURCE_NOT_FOUND);
    }

    @Test
    @DisplayName("Should list companies of current user")
    void shouldListMyCompanies() {
        Company company = Company.builder()
                .id(ObjectId.get())
                .name("Tech Corp")
                .build();
        company.addMember(ownerUser, CompanyRole.OWNER);

        when(companyRepository.findAllByMemberUserId(ownerUser.getId())).thenReturn(List.of(company));

        List<CompanySummaryResponseDTO> list = listMyCompaniesUseCase.execute(ownerUser.getId());

        assertThat(list).hasSize(1);
        assertThat(list.get(0).name()).isEqualTo("Tech Corp");
        assertThat(list.get(0).currentUserRole()).isEqualTo(CompanyRole.OWNER);
    }

    @Test
    @DisplayName("Should allow OWNER or ADMIN to update company")
    void shouldUpdateCompanyWhenOwner() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder()
                .id(companyId)
                .name("Old Name")
                .build();
        company.addMember(ownerUser, CompanyRole.OWNER);

        UpdateCompanyRequestDTO request = UpdateCompanyRequestDTO.builder()
                .name("New Name")
                .description("Updated description")
                .build();

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        CompanyResponseDTO response = updateCompanyUseCase.execute(companyId, request, ownerUser.getId());

        assertThat(response.name()).isEqualTo("New Name");
        assertThat(response.description()).isEqualTo("Updated description");
    }

    @Test
    @DisplayName("Should throw FORBIDDEN when regular MEMBER attempts to update company")
    void shouldThrowForbiddenWhenMemberUpdatesCompany() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(regularUser, CompanyRole.MEMBER);

        UpdateCompanyRequestDTO request = UpdateCompanyRequestDTO.builder().name("Hacked Name").build();

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        assertThatThrownBy(() -> updateCompanyUseCase.execute(companyId, request, regularUser.getId()))
                .isInstanceOf(ApplicationException.class)
                .hasFieldOrPropertyWithValue("errorCode", ApplicationExceptionCode.FORBIDDEN_ACTION);
    }

    @Test
    @DisplayName("Should allow OWNER to delete company")
    void shouldDeleteCompanyWhenOwner() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(ownerUser, CompanyRole.OWNER);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        deleteCompanyUseCase.execute(companyId, ownerUser.getId());

        verify(companyRepository).delete(company);
    }

    @Test
    @DisplayName("Should throw FORBIDDEN when non-owner attempts to delete company")
    void shouldThrowForbiddenWhenNonOwnerDeletesCompany() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(regularUser, CompanyRole.ADMIN);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        assertThatThrownBy(() -> deleteCompanyUseCase.execute(companyId, regularUser.getId()))
                .isInstanceOf(ApplicationException.class)
                .hasFieldOrPropertyWithValue("errorCode", ApplicationExceptionCode.FORBIDDEN_ACTION);
    }

    @Test
    @DisplayName("Should add new member to company by email")
    void shouldAddMemberSuccessfully() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(ownerUser, CompanyRole.OWNER);

        AddMemberRequestDTO request = AddMemberRequestDTO.builder()
                .email("bob@techcorp.com")
                .role(CompanyRole.RECRUITER)
                .build();

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(userRepository.findByEmailIgnoreCase("bob@techcorp.com")).thenReturn(Optional.of(regularUser));
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        MemberResponseDTO added = addCompanyMemberUseCase.execute(companyId, request, ownerUser.getId());

        assertThat(added).isNotNull();
        assertThat(added.email()).isEqualTo("bob@techcorp.com");
        assertThat(added.role()).isEqualTo(CompanyRole.RECRUITER);
    }

    @Test
    @DisplayName("Should throw BusinessException when adding an already existing member")
    void shouldThrowWhenAddingDuplicateMember() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(ownerUser, CompanyRole.OWNER);
        company.addMember(regularUser, CompanyRole.MEMBER);

        AddMemberRequestDTO request = AddMemberRequestDTO.builder()
                .email("bob@techcorp.com")
                .role(CompanyRole.MEMBER)
                .build();

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(userRepository.findByEmailIgnoreCase("bob@techcorp.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> addCompanyMemberUseCase.execute(companyId, request, ownerUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("já é membro");
    }

    @Test
    @DisplayName("Should change member role successfully")
    void shouldChangeMemberRoleSuccessfully() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(ownerUser, CompanyRole.OWNER);
        company.addMember(regularUser, CompanyRole.MEMBER);

        UpdateMemberRoleRequestDTO request = UpdateMemberRoleRequestDTO.builder()
                .role(CompanyRole.ADMIN)
                .build();

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(userRepository.findById(ownerUser.getId())).thenReturn(Optional.of(ownerUser));
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        MemberResponseDTO updated = updateCompanyMemberRoleUseCase.execute(
                companyId,
                regularUser.getId(),
                request,
                ownerUser.getId()
        );

        assertThat(updated).isNotNull();
        assertThat(updated.role()).isEqualTo(CompanyRole.ADMIN);
    }

    @Test
    @DisplayName("Should prevent demoting the only OWNER of the company")
    void shouldPreventDemotingOnlyOwner() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(ownerUser, CompanyRole.OWNER);

        UpdateMemberRoleRequestDTO request = UpdateMemberRoleRequestDTO.builder()
                .role(CompanyRole.ADMIN)
                .build();

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        assertThatThrownBy(() -> updateCompanyMemberRoleUseCase.execute(
                companyId,
                ownerUser.getId(),
                request,
                ownerUser.getId()
        ))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ao menos um proprietário");
    }

    @Test
    @DisplayName("Should remove member from company")
    void shouldRemoveMemberSuccessfully() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(ownerUser, CompanyRole.OWNER);
        company.addMember(regularUser, CompanyRole.MEMBER);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        removeCompanyMemberUseCase.execute(companyId, regularUser.getId(), ownerUser.getId());

        assertThat(company.getMember(regularUser.getId())).isNull();
        verify(companyRepository).save(company);
    }

    @Test
    @DisplayName("Should prevent removing the only OWNER")
    void shouldPreventRemovingOnlyOwner() {
        ObjectId companyId = ObjectId.get();
        Company company = Company.builder().id(companyId).name("Tech Corp").build();
        company.addMember(ownerUser, CompanyRole.OWNER);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));

        assertThatThrownBy(() -> removeCompanyMemberUseCase.execute(companyId, ownerUser.getId(), ownerUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("único proprietário");
    }
}
