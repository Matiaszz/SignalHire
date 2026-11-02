package dev.matias.signalhire.modules.auth.application;

import dev.matias.signalhire.modules.auth.domain.model.RefreshToken;
import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.RefreshTokenRepository;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.auth.presentation.dto.AuthResponseDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.LoginRequestDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.UserResponseDTO;
import dev.matias.signalhire.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public RegisterUseCase.AuthResult execute(
            LoginRequestDTO request,
            String userAgent,
            String ipAddress
    ) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha incorretos."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("E-mail ou senha incorretos.");
        }

        if (!user.isActive()) {
            throw new BadCredentialsException("Sua conta está desativada. Entre em contato com o suporte.");
        }

        // Issue tokens
        String rawRefreshToken = jwtService.generateRawRefreshToken();
        String tokenHash = jwtService.hashToken(rawRefreshToken);
        ObjectId familyId = ObjectId.get();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .familyId(familyId)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        refreshTokenRepository.save(refreshToken);

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

        return new RegisterUseCase.AuthResult(response, rawRefreshToken);
    }
}
