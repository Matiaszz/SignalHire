package dev.matias.signalhire.modules.company.domain.model.vo.member;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import lombok.*;

import java.time.Instant;
import java.util.Objects;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Member implements Cloneable {

    private User user;
    private CompanyRole role;
    private Instant joinedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Member member = (Member) o;
        if (user == null || member.user == null) return false;
        return Objects.equals(user.getId(), member.user.getId());
    }

    @Override
    public int hashCode() {
        return user != null && user.getId() != null ? user.getId().hashCode() : 0;
    }

    @Override
    public Member clone() {
        try {
            Member clone = (Member) super.clone();
            clone.user = this.user;
            clone.role = this.role;
            clone.joinedAt = this.joinedAt;

            return clone;
        } catch (CloneNotSupportedException e) {
            throw new ApplicationException(ApplicationExceptionCode.INTERNAL_ERROR, "Clone not supported (Member)");
        }
    }
}
