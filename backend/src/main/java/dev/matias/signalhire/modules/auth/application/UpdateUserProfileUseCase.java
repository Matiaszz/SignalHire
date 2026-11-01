package dev.matias.signalhire.modules.auth.application;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.auth.presentation.dto.UpdateProfileRequestDTO;
import dev.matias.signalhire.modules.auth.presentation.dto.UserResponseDTO;
import dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateUserProfileUseCase {

    private final UserRepository userRepository;
    private final StorageService storageService;

    @Transactional
    public UserResponseDTO execute(UUID userId, UpdateProfileRequestDTO request, MultipartFile profilePicture) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));

        if (request != null && StringUtils.hasText(request.name())) {
            user.setName(request.name().trim());
        }

        if (profilePicture != null && !profilePicture.isEmpty()) {
            String newAvatarUrl = storageService.uploadAvatar(user.getId(), profilePicture);
            user.setProfilePictureUrl(newAvatarUrl);
        }

        user = userRepository.save(user);
        log.info("Perfil atualizado com sucesso para o usuário ID {}", userId);
        return UserResponseDTO.from(user);
    }
}
