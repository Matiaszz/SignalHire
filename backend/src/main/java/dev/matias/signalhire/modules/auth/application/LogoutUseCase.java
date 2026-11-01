package dev.matias.signalhire.modules.auth.application;

import dev.matias.signalhire.modules.auth.domain.repository.RefreshTokenRepository;
import dev.matias.signalhire.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogoutUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public void execute(String rawRefreshToken) {
        if (StringUtils.hasText(rawRefreshToken)) {
            String tokenHash = jwtService.hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.revoke(null);
                refreshTokenRepository.save(token);
                log.info("Sessão revogada para o token hash {}", tokenHash);
            });
        }
    }
}
