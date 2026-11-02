# Security Module

This module provides authentication and authorization services for the backend microservices
using Spring Security and JSON Web Tokens (JWTs). It acts as a JWT authentication server,
responsible for issuing, validating, and managing JWTs, and exposes user-management
endpoints with role-based access control (RBAC).

## Role in the Architecture

The Security Module handles:
*   **User Authentication** — Verifies user credentials (username/password) via Spring
    Security's `AuthenticationManager` and BCrypt password hashing.
*   **JWT Generation** — Issues signed JWTs upon successful authentication (jjwt 0.13.0,
    HS256 `/SHA256` by default).
*   **JWT Validation** — A `JwtAuthenticationFilter` validates incoming JWTs from clients
    or other services and sets the security context.
*   **Authorization** — Protects API endpoints based on authenticated user roles
    (`@PreAuthorize`, method security).
*   **Rate Limiting** — A `RateLimitingFilter` backed by Bucket4j throttles requests per
    client (default: 10 tokens, refill 10/min).

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Spring Boot | 4.1.0 |
| Security | Spring Security | 6.x (Spring Boot 4 managed) |
| JWT | jjwt (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`) | 0.13.0 |
| JOSE/JWT | Nimbus JOSE+JWT | 10.9.1 |
| Rate limiting | Bucket4j (`bucket4j_jdk17-core`, `bucket4j_jdk17-jcache`) | 8.14.0 |
| Cache API | `javax.cache:cache-api` | 1.1.1 |
| Persistence | Spring Data JPA + H2 (dev/test) | BOM-managed |
| Validation | Spring Boot Starter Validation (`jakarta.validation`) | BOM-managed |
| Code generation | Lombok | 1.18.46 |
| Language | Java | 21 (LTS) |

## Package Structure (SOLID)

```
security-module/src/main/java/gon/cue/security/
├── config/
│   ├── SecurityConfig.java          # SecurityFilterChain, CSRF, session policy
│   ├── AuthenticationConfig.java    # AuthenticationManager, DaoAuthenticationProvider, BCrypt
│   ├── CorsConfig.java              # CORS configuration (externalized)
│   ├── RateLimitConfig.java         # Bucket4j Bucket bean
│   ├── SecurityProperties.java      # @ConfigurationProperties (CORS, rate-limit, JWT)
│   └── DataInitializer.java         # Seed users/roles on startup
├── service/
│   ├── port/
│   │   ├── AuthService.java         # Authentication interface (ISP/DIP)
│   │   ├── JwtService.java          # JWT issue/validate interface
│   │   └── UserService.java          # User CRUD interface
│   ├── adapter/
│   │   ├── AuthServiceImpl.java
│   │   ├── JwtServiceImpl.java
│   │   └── UserServiceImpl.java
│   └── UserDetailsServiceImpl.java   # Spring Security UserDetailsService
├── mapper/
│   └── UserMapper.java              # DTO ↔ Entity mapping
├── filter/
│   ├── JwtAuthenticationFilter.java
│   └── RateLimitingFilter.java
├── controller/
│   ├── AuthController.java           # /auth/** endpoints
│   └── UserController.java          # /api/users/** endpoints
├── repository/
│   ├── UserRepository.java
│   └── RoleRepository.java
├── model/
│   ├── User.java                     # JPA entity
│   ├── Role.java                     # JPA entity (roles)
│   ├── AuthRequest.java              # Login request DTO
│   └── AuthResponse.java             # Login response DTO (token)
├── dto/
│   ├── UserDto.java                  # User response DTO
│   └── UpdateUserDto.java            # User update DTO
└── SecurityModuleApplication.java    # @SpringBootApplication entry point
```

## API Endpoints

### Authentication (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/auth/welcome` | Public | Health/welcome string |
| `POST` | `/auth/authenticate` | Public | Authenticate and receive a JWT |
| `GET` | `/auth/user/profile` | Authenticated | Simple authenticated-user greeting |

### User Management (`/api/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users/me` | Authenticated | Current user profile |
| `PUT` | `/api/users/me` | Authenticated | Update current user profile |
| `GET` | `/api/users/{id}` | `ADMIN` | Get user by id |
| `GET` | `/api/users` | `ADMIN` | List all users |
| `DELETE` | `/api/users/{id}` | `ADMIN` | Delete user by id |

## Getting Started

### Running the Security Module

1.  Ensure the parent project has been built (`mvn clean install` from the root directory).
2.  Navigate to the `security-module` directory:
    ```bash
    cd security-module
    ```
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```

The Security Module starts on port `8080` (unless configured differently). The Eureka
Server should be running first so the module can register.

### Running Tests

```bash
mvn test -pl security-module
```

The module has 26 integration/unit tests covering authentication, authorization (RBAC),
and user management.

## Configuration

The `application.yml` in this module is crucial:

*   **`security.jwt.secret`** / **`jwt.secret`** — Secret key used to sign and verify JWTs.
    **It is critical that this key is strong, randomly generated, and securely managed
    (e.g., via environment variables in production).** A placeholder is provided and
    **must** be replaced in any deployment.
*   **`security.jwt.expiration`** — Token expiration in milliseconds (default `36000000`).
*   **`security.jwt.algorithm`** — Signing algorithm (default `HS256`).
*   **`security.cors.*`** — CORS allowed origins, methods, headers, credentials.
*   **`security.rate-limit.*`** — Bucket capacity, refill tokens, refill duration.
*   **`eureka.client.service-url.defaultZone`** — Eureka server URL.

### Example Usage

1.  **Authenticate** — POST to `/auth/authenticate`:
    ```bash
    curl -X POST http://localhost:8080/auth/authenticate \
      -H "Content-Type: application/json" \
      -d '{"username":"user","password":"password"}'
    ```
    The response contains a JWT (`AuthResponse`).

2.  **Access a protected resource** — include the JWT in the `Authorization` header:
    ```bash
    curl http://localhost:8080/auth/user/profile \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```

3.  **Admin-only operation**:
    ```bash
    curl http://localhost:8080/api/users \
      -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
    ```
