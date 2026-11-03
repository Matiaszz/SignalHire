package dev.matias.signalhire.modules.company.domain.model.vo.member;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@AllArgsConstructor
@Getter
public class Member implements Cloneable {
    User user;
    @Setter
    CompanyRole role;
    Instant joinedAt;


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
