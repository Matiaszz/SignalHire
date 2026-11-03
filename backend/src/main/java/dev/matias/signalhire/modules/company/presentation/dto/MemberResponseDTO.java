package dev.matias.signalhire.modules.company.presentation.dto;

import dev.matias.signalhire.modules.company.domain.model.vo.member.CompanyRole;
import dev.matias.signalhire.modules.company.domain.model.vo.member.Member;
import lombok.Builder;

import java.time.Instant;

@Builder
public record MemberResponseDTO(
        String userId,
        String name,
        String email,
        String profilePictureUrl,
        CompanyRole role,
        Instant joinedAt
) {
    public static MemberResponseDTO from(Member member) {
        if (member == null) return null;
        var user = member.getUser();
        return MemberResponseDTO.builder()
                .userId(user != null && user.getId() != null ? user.getId().toHexString() : null)
                .name(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .profilePictureUrl(user != null ? user.getProfilePictureUrl() : null)
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
