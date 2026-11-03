package dev.matias.signalhire.modules.auth.application;

import dev.matias.signalhire.modules.auth.domain.model.RefreshToken;
import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.RefreshTokenRepository;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.auth.presentation.dto.AuthResponseDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.UserResponseDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.RegisterRequestDTO;
import dev.matias.signalhire.shared.exception.ApplicationException;
import dev.matias.signalhire.shared.exception.ApplicationExceptionCode;
import dev.matias.signalhire.shared.exception.BusinessException;
import dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService;
import dev.matias.signalhire.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StorageService storageService;

    @Transactional
    public AuthResult execute(
            RegisterRequestDTO request,
            MultipartFile profilePicture,
            String userAgent,
            String ipAddress
    ) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ApplicationException(
                    ApplicationExceptionCode.EMAIL_ALREADY_EXISTS,
                    "O e-mail informado já está em uso na plataforma.");
        }

        ObjectId userId = ObjectId.get();
        String avatarUrl = org.springframework.util.StringUtils.hasText(request.profilePictureUrl())
                ? request.profilePictureUrl().trim()
                : null;

        if (avatarUrl == null && profilePicture != null && !profilePicture.isEmpty()) {
            avatarUrl = storageService.uploadAvatar(userId, profilePicture);
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role("USER")
                .active(true)
                .profilePictureUrl(avatarUrl)
                .build();

        user = userRepository.save(user);

        // Issue Tokens
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

        return new AuthResult(response, rawRefreshToken);
    }

    public record AuthResult(AuthResponseDTO response, String rawRefreshToken) {}
}
