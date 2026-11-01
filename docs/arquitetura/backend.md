# Arquitetura Backend: Monólito Modular com Spring Boot, PostgreSQL e S3 LocalStack

## 1. Visão Geral

Este documento descreve a arquitetura oficial do backend do projeto **SignalHire**. O sistema adota o padrão de **Monólito Modular** (_Modular Monolith_), orientado a conceitos de **Arquitetura Hexagonal (Ports & Adapters)** com **Spring Boot**, **PostgreSQL** como banco de dados relacional e **AWS S3 / LocalStack** para armazenamento de arquivos e fotos de perfil via Docker Compose.

A meta desta arquitetura é garantir:

- **Alta Coesão e Baixo Acoplamento:** Cada módulo de negócio é autônomo, organizado por domínios bem delimitados.
- **Simplicidade de Operação:** Único artefato de deploy e infraestrutura conteinerizada via Docker Compose.
- **Flexibilidade de Provedores Externos:** Integrações com serviços de infraestrutura (armazenamento em nuvem S3, IA generativa Gemini, mensageria RabbitMQ) desacopladas por interfaces e alternáveis via `application.yaml`.
- **Produtividade com Lombok e Spring Data JPA:** Eliminação de código boilerplate em entidades, DTOs e serviços, mantendo tipagem estrita e validação declarativa com `jakarta.validation`.
- **Respostas de Erro Padronizadas:** Tratamento uniforme e consistente para exceções de negócio, validação e segurança sem dependência do padrão RFC 7807 (Problem Details).

---

## 2. Estrutura Geral de Pastas e Pacotes

A aplicação reside no diretório `backend` e tem como pacote raiz `dev.matias.signalhire`. Ela é dividida em dois grandes blocos: **`modules/`** (funcionalidades de negócio) e **`shared/`** (recursos transversais e infraestrutura compartilhada).

```text
backend/src/main/java/dev/matias/signalhire/
│
├── BackendApplication.java                      # Inicializador do Spring Boot
│
├── modules/                                     # Domínios de Negócio (Bounded Contexts)
│   │
│   └── auth/                                    # Módulo de Autenticação e Usuário
│       ├── application/                         # Casos de Uso (Orquestração de regras de negócio)
│       │   ├── RegisterUseCase.java             # Registro de usuário e upload de foto
│       │   ├── LoginUseCase.java                # Autenticação e emissão de tokens
│       │   ├── RefreshTokenUseCase.java         # Rotação de refresh token com detecção de reuso
│       │   ├── LogoutUseCase.java               # Revogação de sessão ativa
│       │   ├── GetUserProfileUseCase.java       # Consulta do perfil do usuário autenticado
│       │   └── UpdateUserProfileUseCase.java    # Atualização de nome e foto de perfil no S3
│       │
│       ├── domain/                              # Núcleo de Domínio
│       │   ├── enums/                           # Enums de negócio (ex: UserRole)
│       │   ├── model/                           # Entidades JPA com Lombok (User, RefreshToken)
│       │   └── repository/                      # Interfaces Spring Data JPA (UserRepository, RefreshTokenRepository)
│       │
│       ├── infrastructure/                      # Adaptadores específicos do módulo (eventos, listeners)
│       │
│       └── presentation/                        # Porta de entrada HTTP
│           ├── controller/                      # Controladores REST (@RestController: AuthController)
│           └── dtos/                            # DTOs tipados (RegisterRequestDTO, LoginRequestDTO, AuthResponseDTO, etc.)
│
└── shared/                                      # Recursos Transversais e Infraestrutura
    ├── config/                                  # Configurações globais (SecurityConfig, CORS)
    ├── exception/                               # Tratamento global com resposta padronizada (ApiErrorResponse)
    ├── security/                                # Filtros JWT, propriedades e contexto de usuário (JwtService, UserPrincipal)
    └── infrastructure/                          # Portas e Adaptadores de Nuvem / Serviços Externos
        └── storage/                             # Provedor de Armazenamento/Upload (S3 LocalStack / Local)
            ├── contract/                        # Interface da Porta (StorageService)
            ├── impl/                            # Implementação S3 (S3StorageService, S3Config, S3StorageProperties)
            └── presentation/                    # Controlador de streaming de avatar (AvatarController)
```

---

## 3. Responsabilidades das Camadas nos Módulos (`modules/{nomeModulo}`)

### 3.1. `domain/` (Entidades e Repositórios com Spring Data JPA e Lombok)

- **Modelos (`@Entity`):** As entidades de domínio utilizam anotações JPA para mapeamento das tabelas relacionais do PostgreSQL e anotações do Lombok (`@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@EqualsAndHashCode`).
- **Repositórios:** Interfaces que estendem `JpaRepository<T, ID>`, permitindo queries por convenção e consultas `@Query`.
- **Enums:** Estados e perfis do domínio (ex: `UserRole`).

**Exemplo (`domain/model/User.java`):**

```java
package dev.matias.signalhire.modules.auth.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Builder.Default
    @Column(name = "role", nullable = false, length = 50)
    private String role = "USER";

    @Builder.Default
    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "profile_picture_url", length = 1024)
    private String profilePictureUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) this.id = UUID.randomUUID();
        Instant now = Instant.now();
        if (this.createdAt == null) this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
```

**Exemplo (`domain/repository/UserRepository.java`):**

```java
package dev.matias.signalhire.modules.auth.domain.repository;

import dev.matias.signalhire.modules.auth.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
```

---

### 3.2. `application/` (Casos de Uso)

- Orquestra as regras de negócio de cada fluxo.
- Não lida diretamente com detalhes de protocolo HTTP (como manipulação de cookies ou status code).
- Injeta o `Repository` do módulo e a interface de infraestrutura `StorageService` para persistência de fotos no S3 / LocalStack.

**Exemplo (`application/RegisterUseCase.java`):**

```java
package dev.matias.signalhire.modules.auth.application;

import dev.matias.signalhire.modules.auth.domain.model.User;
import dev.matias.signalhire.modules.auth.domain.repository.UserRepository;
import dev.matias.signalhire.modules.auth.presentation.dtos.RegisterRequestDTO;
import dev.matias.signalhire.shared.exception.BusinessException;
import dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;

    @Transactional
    public User execute(RegisterRequestDTO request, MultipartFile profilePicture) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("O e-mail informado já está em uso na plataforma.", "EMAIL_ALREADY_EXISTS");
        }

        UUID userId = UUID.randomUUID();
        String avatarUrl = null;

        if (profilePicture != null && !profilePicture.isEmpty()) {
            avatarUrl = storageService.uploadAvatar(userId, profilePicture);
        }

        User user = User.builder()
                .id(userId)
                .name(request.name().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .profilePictureUrl(avatarUrl)
                .build();

        return userRepository.save(user);
    }
}
```

---

### 3.3. `presentation/` (Controllers e DTOs)

- Ponto de contato com a camada externa (Frontend React / Web Clients).
- **`dtos/`**: Records Java com anotações de validação (`jakarta.validation.constraints.*`) e anotações `@Builder` do Lombok.
- **`controller/`**: Endpoints REST anotados com `@RestController` que recebem os dados, delegam a execução aos Casos de Uso e retornam os DTOs de resposta tipados.

**Exemplo (`presentation/dtos/RegisterRequestDTO.java`):**

```java
package dev.matias.signalhire.modules.auth.presentation.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record RegisterRequestDTO(
    @NotBlank(message = "O nome é obrigatório.")
    @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres.")
    String name,

    @NotBlank(message = "O email é obrigatório.")
    @Email(message = "O email informado é inválido.")
    String email,

    @NotBlank(message = "A senha é obrigatória.")
    @Size(min = 6, max = 100, message = "A senha deve ter no mínimo 6 caracteres.")
    String password
) {}
```

**Exemplo (`presentation/controller/AuthController.java`):**

```java
package dev.matias.signalhire.modules.auth.presentation.controller;

import dev.matias.signalhire.modules.auth.application.RegisterUseCase;
import dev.matias.signalhire.modules.auth.presentation.dtos.AuthResponseDTO;
import dev.matias.signalhire.modules.auth.presentation.dtos.RegisterRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUseCase registerUseCase;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponseDTO> register(
            @Valid @ModelAttribute RegisterRequestDTO request,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture
    ) {
        // Execução do caso de uso e emissão de tokens
        ...
    }
}
```

---

## 4. Camada Compartilhada (`shared/`) e Suporte a Múltiplos Provedores de Armazenamento

Para viabilizar a troca entre provedores de armazenamento em nuvem (AWS S3) e ambiente local (LocalStack / Disco) alterando apenas o arquivo `application.yaml`, adota-se o padrão **Ports & Adapters** com a anotação `@ConditionalOnProperty`.

### 4.1. A Porta / Interface (`shared/infrastructure/storage/contract/StorageService.java`):

```java
package dev.matias.signalhire.shared.infrastructure.storage.contract;

import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.UUID;

public interface StorageService {
    String uploadAvatar(UUID userId, MultipartFile file);
    StoredObject getObject(String key);
    void deleteObject(String key);

    record StoredObject(InputStream inputStream, String contentType, Long contentLength) {}
}
```

### 4.2. Implementação S3 / LocalStack (`shared/infrastructure/storage/impl/S3StorageService.java`):

Ativada quando `app.storage.provider=s3` ou como provedor padrão (`matchIfMissing = true`):

```java
package dev.matias.signalhire.shared.infrastructure.storage.impl;

import dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "s3", matchIfMissing = true)
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final S3StorageProperties properties;

    // Métodos de upload, download e verificação de bucket
}
```

---

## 5. Tratamento de Exceções Global com Resposta Padronizada (`shared/exception`)

O backend **não utiliza** a especificação RFC 7807 (Problem Details). Em vez disso, adota um modelo de **Resposta Padronizada de Erro** estruturada e consistente (`ApiErrorResponse`), facilitando a desserialização e o consumo no frontend.

### 5.1. DTO de Erro Padronizado (`shared/exception/ApiErrorResponse.java`):

```java
package dev.matias.signalhire.shared.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private String code;
    private Map<String, String> errors;
}
```

### 5.2. Manipulador Global com `@RestControllerAdvice`

```java
package dev.matias.signalhire.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Violação de Regra de Negócio")
                .message(ex.getMessage())
                .code(ex.getCode())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Dados Inválidos")
                .message("Erro de validação nos campos informados.")
                .code("VALIDATION_FAILED")
                .path(request.getRequestURI())
                .errors(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Não Autorizado")
                .message(ex.getMessage())
                .code("INVALID_CREDENTIALS")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
}
```

---

## 6. Configuração no `application.yaml` e Docker Compose

O arquivo `compose.yaml` provisiona o ecossistema com PostgreSQL, RabbitMQ e LocalStack S3:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: signalhire-postgres
    ports:
      - "5432:5432"

  localstack:
    image: localstack/localstack:latest
    container_name: signalhire-localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3
      - AWS_DEFAULT_REGION=us-east-1
```

E no `application.yaml`:

```yaml
spring:
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 15MB

app:
  storage:
    provider: s3 # 's3' (LocalStack ou AWS)

aws:
  region: ${AWS_REGION:us-east-1}
  access-key-id: ${AWS_ACCESS_KEY_ID:test}
  secret-access-key: ${AWS_SECRET_ACCESS_KEY:test}
  s3:
    endpoint: ${AWS_S3_ENDPOINT:http://localhost:4566}
    bucket: ${AWS_S3_BUCKET:signalhire-avatars}
    path-style-access: true
```

---

## 7. Checklist para Criação de um Novo Módulo

Ao criar um novo domínio no SignalHire:

1. Criar o pacote do módulo em `backend/src/main/java/dev/matias/signalhire/modules/{novoModulo}/`.
2. Estruturar os subpacotes:
   - `application/` para os Casos de Uso orquestradores.
   - `domain/model/` para entidades JPA anotadas com Lombok.
   - `domain/repository/` estendendo `JpaRepository`.
   - `domain/enums/` para enums de negócio.
   - `presentation/controller/` para os controladores REST.
   - `presentation/dtos/` para Requests e Responses tipados.
3. Se necessitar de armazenamento de arquivos, injetar a porta `dev.matias.signalhire.shared.infrastructure.storage.contract.StorageService`.
4. Lançar `BusinessException` para falhas de regras de negócio, capturadas automaticamente pelo `GlobalExceptionHandler`.
