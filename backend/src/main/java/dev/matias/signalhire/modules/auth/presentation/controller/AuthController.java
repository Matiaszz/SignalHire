package dev.matias.signalhire.modules.auth.presentation.controller;

import dev.matias.signalhire.modules.auth.application.GetUserProfileUseCase;
import dev.matias.signalhire.modules.auth.application.LoginUseCase;
import dev.matias.signalhire.modules.auth.application.LogoutUseCase;
import dev.matias.signalhire.modules.auth.application.RefreshTokenUseCase;
import dev.matias.signalhire.modules.auth.application.RegisterUseCase;
import dev.matias.signalhire.modules.auth.application.UpdateUserProfileUseCase;
import dev.matias.signalhire.modules.auth.presentation.dto.AuthResponseDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.LoginRequestDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.RegisterRequestDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.UpdateProfileRequestDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.UserResponseDTO;
import dev.matias.signalhire.shared.security.JwtProperties;
import dev.matias.signalhire.shared.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;
    private final UpdateUserProfileUseCase updateUserProfileUseCase;
    private final JwtProperties jwtProperties;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponseDTO> register(
            @Valid @ModelAttribute RegisterRequestDTO request,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        RegisterUseCase.AuthResult result = registerUseCase.execute(
                request,
                profilePicture,
                extractUserAgent(httpRequest),
                extractIpAddress(httpRequest)
        );

        setRefreshTokenCookie(httpResponse, result.rawRefreshToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(result.response());
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuthResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        RegisterUseCase.AuthResult result = loginUseCase.execute(
                request,
                extractUserAgent(httpRequest),
                extractIpAddress(httpRequest)
        );

        setRefreshTokenCookie(httpResponse, result.rawRefreshToken());
        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
            @CookieValue(name = "${app.security.jwt.cookie-name:signalhire_refresh_token}", required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        RegisterUseCase.AuthResult result = refreshTokenUseCase.execute(
                refreshToken,
                extractUserAgent(httpRequest),
                extractIpAddress(httpRequest)
        );

        setRefreshTokenCookie(httpResponse, result.rawRefreshToken());
        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "${app.security.jwt.cookie-name:signalhire_refresh_token}", required = false) String refreshToken,
            HttpServletResponse httpResponse
    ) {
        logoutUseCase.execute(refreshToken);
        clearRefreshTokenCookie(httpResponse);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponseDTO profile = getUserProfileUseCase.execute(principal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDTO> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute UpdateProfileRequestDTO request,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture
    ) {
        UserResponseDTO updated = updateUserProfileUseCase.execute(principal.getId(), request, profilePicture);
        return ResponseEntity.ok(updated);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String rawRefreshToken) {
        ResponseCookie cookie = ResponseCookie.from(jwtProperties.getCookieName(), rawRefreshToken)
                .httpOnly(true)
                .secure(jwtProperties.isCookieSecure())
                .path("/")
                .maxAge(Duration.ofMillis(jwtProperties.getRefreshExpirationMs()))
                .sameSite(jwtProperties.getCookieSameSite())
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(jwtProperties.getCookieName(), "")
                .httpOnly(true)
                .secure(jwtProperties.isCookieSecure())
                .path("/")
                .maxAge(0)
                .sameSite(jwtProperties.getCookieSameSite())
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractIpAddress(HttpServletRequest request) {
        if (request == null) return "unknown";
        String ip = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(ip)) {
            return ip.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private String extractUserAgent(HttpServletRequest request) {
        if (request == null) return "unknown";
        String ua = request.getHeader("User-Agent");
        return StringUtils.hasText(ua) ? (ua.length() > 500 ? ua.substring(0, 500) : ua) : "unknown";
    }
}
