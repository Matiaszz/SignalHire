package dev.matias.signalhire.modules.auth;

import dev.matias.signalhire.modules.auth.application.LoginUseCase;
import dev.matias.signalhire.modules.auth.application.RefreshTokenUseCase;
import dev.matias.signalhire.modules.auth.application.RegisterUseCase;
import dev.matias.signalhire.modules.auth.domain.model.RefreshToken;
import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.RefreshTokenRepository;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.auth.presentation.dto.LoginRequestDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.RegisterRequestDTO;
import dev.matias.signalhire.shared.exception.BusinessException;
import dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService;
import dev.matias.signalhire.shared.security.JwtProperties;
import dev.matias.signalhire.shared.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthUseCasesTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private StorageService storageService;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;

    private RegisterUseCase registerUseCase;
    private LoginUseCase loginUseCase;
    private RefreshTokenUseCase refreshTokenUseCase;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setSecret("dGVzdC1zZWNyZXQta2V5LWZvci1zaWduYWxoaXJlLWp3dC1hdXRoZW50aWNhdGlvbi10ZXN0cy0yMDI2LTI1NmJpdHM=");
        jwtProperties.setAccessExpirationMs(900000);
        jwtProperties.setRefreshExpirationMs(604800000);
        jwtProperties.setCookieName("signalhire_refresh_token");

        jwtService = new JwtService(jwtProperties);

        registerUseCase = new RegisterUseCase(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtService,
                storageService
        );

        loginUseCase = new LoginUseCase(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtService
        );

        refreshTokenUseCase = new RefreshTokenUseCase(
                refreshTokenRepository,
                jwtService
        );
    }

    @Test
    @DisplayName("Should successfully register a new user and generate refresh token")
    void shouldRegisterUserSuccessfully() {
        RegisterRequestDTO request = RegisterRequestDTO.builder()
                .name("Carlos Silva")
                .email("carlos@signalhire.dev")
                .password("senhaForte123")
                .build();

        when(userRepository.existsByEmailIgnoreCase("carlos@signalhire.dev")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RegisterUseCase.AuthResult result = registerUseCase.execute(request, null, "Agent", "127.0.0.1");

        assertThat(result).isNotNull();
        assertThat(result.response().accessToken()).isNotBlank();
        assertThat(result.response().user().name()).isEqualTo("Carlos Silva");
        assertThat(result.response().user().email()).isEqualTo("carlos@signalhire.dev");
        assertThat(result.rawRefreshToken()).isNotBlank();
    }

    @Test
    @DisplayName("Should throw BusinessException when registering existing email")
    void shouldThrowWhenEmailExists() {
        RegisterRequestDTO request = RegisterRequestDTO.builder()
                .name("Carlos Silva")
                .email("carlos@signalhire.dev")
                .password("senhaForte123")
                .build();

        when(userRepository.existsByEmailIgnoreCase("carlos@signalhire.dev")).thenReturn(true);

        assertThatThrownBy(() -> registerUseCase.execute(request, null, "Agent", "127.0.0.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("já está em uso");
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void shouldLoginSuccessfully() {
        LoginRequestDTO request = LoginRequestDTO.builder()
                .email("carlos@signalhire.dev")
                .password("senhaForte123")
                .build();

        User user = User.builder()
                .id(UUID.randomUUID())
                .name("Carlos Silva")
                .email("carlos@signalhire.dev")
                .passwordHash(passwordEncoder.encode("senhaForte123"))
                .role("USER")
                .active(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("carlos@signalhire.dev")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RegisterUseCase.AuthResult result = loginUseCase.execute(request, "Agent", "127.0.0.1");

        assertThat(result).isNotNull();
        assertThat(result.response().accessToken()).isNotBlank();
        assertThat(result.rawRefreshToken()).isNotBlank();
    }

    @Test
    @DisplayName("Should reject login with wrong password")
    void shouldRejectInvalidPassword() {
        LoginRequestDTO request = LoginRequestDTO.builder()
                .email("carlos@signalhire.dev")
                .password("senhaErrada")
                .build();

        User user = User.builder()
                .id(UUID.randomUUID())
                .name("Carlos Silva")
                .email("carlos@signalhire.dev")
                .passwordHash(passwordEncoder.encode("senhaForte123"))
                .role("USER")
                .active(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("carlos@signalhire.dev")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> loginUseCase.execute(request, "Agent", "127.0.0.1"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("incorretos");
    }

    @Test
    @DisplayName("Should rotate refresh token when refreshing")
    void shouldRotateRefreshToken() {
        String rawToken = "sample-token-string";
        String hash = jwtService.hashToken(rawToken);
        UUID familyId = UUID.randomUUID();

        User user = User.builder()
                .id(UUID.randomUUID())
                .name("Carlos Silva")
                .email("carlos@signalhire.dev")
                .role("USER")
                .active(true)
                .build();

        RefreshToken oldToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(user)
                .tokenHash(hash)
                .familyId(familyId)
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(oldToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RegisterUseCase.AuthResult result = refreshTokenUseCase.execute(rawToken, "Agent", "127.0.0.1");

        assertThat(result).isNotNull();
        assertThat(result.response().accessToken()).isNotBlank();
        assertThat(oldToken.isRevoked()).isTrue();
        assertThat(result.rawRefreshToken()).isNotEqualTo(rawToken);
    }

    @Test
    @DisplayName("Should revoke token family when revoked token reuse is attempted")
    void shouldRevokeFamilyOnReuse() {
        String rawToken = "stolen-reused-token";
        String hash = jwtService.hashToken(rawToken);
        UUID familyId = UUID.randomUUID();

        RefreshToken revokedToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .tokenHash(hash)
                .familyId(familyId)
                .expiresAt(Instant.now().plusSeconds(3600))
                .revoked(true)
                .build();

        when(refreshTokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(revokedToken));

        assertThatThrownBy(() -> refreshTokenUseCase.execute(rawToken, "Agent", "127.0.0.1"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("reutilização");

        verify(refreshTokenRepository).revokeFamily(eq(familyId), any(Instant.class));
    }
}
