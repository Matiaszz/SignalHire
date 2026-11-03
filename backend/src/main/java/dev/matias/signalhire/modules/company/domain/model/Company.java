package dev.matias.signalhire.modules.company.domain.model;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.member.Member;
import dev.matias.signalhire.modules.company.domain.model.vo.profile.CompanyProfile;
import dev.matias.signalhire.modules.company.domain.model.vo.profile.CompanySize;
import dev.matias.signalhire.modules.company.domain.model.vo.site.Site;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.*;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Document(collection = "companies")
public class Company {

    @Id
    @EqualsAndHashCode.Include
    @Builder.Default
    @Setter
    private ObjectId id = ObjectId.get();

    @Setter
    private String name;

    @Setter
    private String legalName;

    @Setter
    private String description;

    @Setter
    private String logoUrl;

    @Setter
    private CompanySize size;

    @Setter
    private CompanyProfile profile;

    @Builder.Default
    List<Site> sites = new ArrayList<>();

    @Builder.Default
    private Set<Member> members = new HashSet<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public void addSite(Site site){

        this.sites.add(site);
    }

    public boolean removeSite(Site site){
        return this.sites.remove(site);
    }

    public void addMember(Member member) {
        this.members.add(member);
    }

    public void addMember(User user, CompanyRole role){
        this.members.add(
                new Member(user, role, Instant.now())
        );
    }

    public boolean removeMember(Member member){
        return this.members.remove(member);
    }

    public boolean changeMemberRole(Member member, CompanyRole role, User currentUser) {
        Member currentMember = getMember(currentUser);
        if (currentMember == null) return false;

        if (!currentMember.getRole().equals(CompanyRole.OWNER) && !currentMember.getRole().equals(CompanyRole.ADMIN)){
            return false;
        }


        boolean isAdminAndRoleIsOwner = role.equals(CompanyRole.OWNER) &&
                currentMember.getRole().equals(CompanyRole.ADMIN);

        if (isAdminAndRoleIsOwner) {
            return false;
        }

        Member updated = member.clone();
        updated.setRole(role);
        this.members.remove(member);
        this.members.add(updated);

        return true;
    }

    public Member getMember(Member member) {
        return getMember(member.getUser().getId());
    }

    public Member getMember(User user) {
        return getMember(user.getId());
    }

    public Member getMember(ObjectId userId){
        List<Member> members = this.members.stream().toList();
        return members.stream()
                .filter(m -> userId.equals(m.getUser().getId()))
                .findFirst()
                .orElse(null);
    }

    public ImmutableSet<Member> getMembers(){
        return ImmutableSet.copyOf(this.members);
    }

    public ImmutableList<Site> getSites() {
        return ImmutableList.copyOf(this.sites);
    }
}
