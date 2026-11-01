package dev.matias.signalhire.modules.auth.application;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.auth.presentation.dto.UserResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetUserProfileUseCase {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponseDTO execute(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));
        return UserResponseDTO.from(user);
    }
}
