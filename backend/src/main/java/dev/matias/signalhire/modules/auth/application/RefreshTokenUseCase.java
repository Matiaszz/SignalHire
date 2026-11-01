package dev.matias.signalhire.modules.auth.application;

import dev.matias.signalhire.modules.auth.domain.model.RefreshToken;
import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.RefreshTokenRepository;
import dev.matias.signalhire.modules.auth.presentation.dto.AuthResponseDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.UserResponseDTO;
import dev.matias.signalhire.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public RegisterUseCase.AuthResult execute(
            String rawRefreshToken,
            String userAgent,
            String ipAddress
    ) {
        if (!StringUtils.hasText(rawRefreshToken)) {
            throw new BadCredentialsException("Refresh token não fornecido.");
        }

        String tokenHash = jwtService.hashToken(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Sessão inválida ou expirada."));

        if (token.isRevoked()) {
            refreshTokenRepository.revokeFamily(token.getFamilyId(), Instant.now());
            throw new BadCredentialsException("Tentativa de reutilização de sessão detectada. Faça login novamente.");
        }

        if (token.isExpired()) {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
            throw new BadCredentialsException("Sessão expirada. Faça login novamente.");
        }

        User user = token.getUser();
        if (!user.isActive()) {
            throw new BadCredentialsException("Conta desativada.");
        }

        // Rotate
        String newRawToken = jwtService.generateRawRefreshToken();
        String newHash = jwtService.hashToken(newRawToken);

        token.revoke(newHash);
        refreshTokenRepository.save(token);

        RefreshToken newToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(user)
                .tokenHash(newHash)
                .familyId(token.getFamilyId())
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        refreshTokenRepository.save(newToken);

        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        );

        AuthResponseDTO response = AuthResponseDTO.of(
                accessToken,
                jwtService.getAccessExpirationMs(),
                UserResponseDTO.from(user)
        );

        return new RegisterUseCase.AuthResult(response, newRawToken);
    }
}
