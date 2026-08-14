# Backend Portfolio Project

A multi-module Spring Boot microservices project demonstrating cloud-native backend
patterns: service discovery, API gateway routing, centralized configuration, and JWT-based
authentication/authorization — built on the latest Spring Boot 4.x and Java 21.

## Project Structure

The project is a Maven multi-module build composed of the following modules:

| Module | Port | Role |
|--------|------|------|
| **`eureka-server`** | `8761` | Service Discovery using Netflix Eureka |
| **`api-gateway`** | `8080` | API Gateway implemented with Spring Cloud Gateway (WebFlux) |
| **`security-module`** | `8080`\* | Authentication & authorization with Spring Security and JWT |
| **`config-server`** | `8888` | Spring Cloud Config Server (Git backend) |

\* The security-module and api-gateway both default to `8080`; run only one per host, or
override `server.port` when running them together.

Additional directories:

*   **`config-repo/`** — the Git repository that backs `config-server`.
*   **`monitoring/`** — Grafana + Prometheus + Loki stack via Docker Compose.
*   **`docker-compose.yml`** — Zipkin for distributed tracing.

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Language | Java | **21 (LTS)** |
| Framework | Spring Boot | **4.1.0** |
| Cloud | Spring Cloud | **2025.1.2** (Oakwood) |
| Base | Spring Framework | **7.x** |
| Spec baseline | Jakarta EE | **11** (Servlet 6.1) |
| Build | Maven | **3.9.6+** / compiler plugin 3.15.0 |
| Code generation | Lombok | **1.18.46** |
| JWT | jjwt | **0.13.0** (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`) |
| JOSE/JWT (signing) | Nimbus JOSE+JWT | **10.9.1** |
| Rate limiting | Bucket4j | **8.14.0** (`bucket4j_jdk17-*` artifacts) |
| Coverage | JaCoCo | **0.8.15** |
| Distributed tracing | Micrometer + Zipkin | Brave bridge |
| Service discovery | Spring Cloud Netflix Eureka | 5.x |
| API gateway | Spring Cloud Gateway Server WebFlux | 5.x |
| Database | H2 (dev/test, security-module) | BOM-managed |
| CI/CD | GitHub Actions | SonarQube analysis |
| Observability | Grafana, Prometheus, Loki | Docker Compose |

## Architecture

### Microservices Topology

```
                    ┌──────────────┐
                    │   Client     │
                    └──────┬───────┘
                           │
                  ┌────────▼────────┐
                  │   api-gateway   │ :8080
                  │ (Gateway/Route) │
                  └────────┬────────┘
                           │ discovers via Eureka
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
   ┌────────────────┐ ┌──────────┐ ┌─────────────┐
   │ security-module│ │ config-  │ │  (future)  │
   │    :8080       │ │ server   │ │  services   │
   │  auth + JWT    │ │  :8888   │ │             │
   └────────────────┘ └──────────┘ └─────────────┘
            │              │
            └──────┬───────┘
                   │ register / discover
            ┌──────▼───────┐
            │ eureka-server│ :8761
            │  (registry)  │
            └──────────────┘
                   │
            ┌──────▼───────┐
            │   Zipkin     │ :9411
            │  (tracing)   │
            └──────────────┘
```

### Service Discovery

This project uses **Spring Cloud Netflix Eureka** (5.x) for service registration and
discovery, hosted in the dedicated `eureka-server` module. Each microservice registers with
Eureka on startup, allowing others to discover and communicate with it using service names
instead of hardcoded addresses.

For Kubernetes deployments, **Kubernetes DNS** can provide an additional layer of service
discovery, enabling communication via service names.

**Key aspects:**
*   **Registration & Discovery:** Microservices auto-register with the Eureka server on
    startup and can discover other registered services.
*   **Health Checks:** Eureka clients leverage Spring Boot Actuator health endpoints to
    report status, ensuring only healthy instances receive traffic.
*   **Load Balancing:** Client-side load balancing is handled implicitly by Eureka-aware
    clients (`RestTemplate` with `@LoadBalanced` or OpenFeign), distributing requests
    across available instances.

### Centralized Configuration

The `config-server` module backs configuration with a Git repository
(`config-repo/`). All microservices can fetch their configuration from this server on
startup, externalizing environment-specific properties (development, staging, production).

### Package Structure (SOLID Principles)

The `security-module` follows SOLID principles with this structure:

- **`config/`** — Configuration classes separated by responsibility (SRP)
  - `SecurityConfig` — Main security filter chain
  - `AuthenticationConfig` — Authentication providers and password encoder
  - `CorsConfig` — CORS configuration
  - `RateLimitConfig` — Rate limiting configuration
  - `SecurityProperties` — Externalized configuration (OCP)
  - `DataInitializer` — Seed data
- **`service/`** — Business logic layer
  - **`port/`** — Service interfaces (ISP, DIP): `UserService`, `AuthService`, `JwtService`
  - **`adapter/`** — Service implementations: `UserServiceImpl`, `AuthServiceImpl`, `JwtServiceImpl`
  - `UserDetailsServiceImpl` — Spring Security `UserDetailsService`
- **`mapper/`** — DTO ↔ Entity mapping (SRP): `UserMapper`
- **`filter/`** — Security filters: `JwtAuthenticationFilter`, `RateLimitingFilter`
- **`controller/`** — HTTP request handlers: `AuthController`, `UserController`
- **`repository/`** — Data access: `UserRepository`, `RoleRepository`
- **`model/`** — JPA entities: `User`, `Role`, `AuthRequest`, `AuthResponse`
- **`dto/`** — Data transfer objects: `UserDto`, `UpdateUserDto`

## Upgrade Notes (to Spring Boot 4.x / Java 21)

This project was upgraded from Spring Boot 3.1.0 / Spring Cloud 2022.0.3 / Java 17 to
the current stack. Key breaking changes resolved during the migration:

1.  **Spring Cloud Gateway artifact rename:** `spring-cloud-starter-gateway` →
    `spring-cloud-starter-gateway-server-webflux` (Spring Cloud 2025.x).
2.  **Bucket4j artifact rename:** `bucket4j-core`/`bucket4j-jcache` →
    `bucket4j_jdk17-core`/`bucket4j_jdk17-jcache` (JDK-targeted artifacts).
3.  **jjwt 0.13.0 API:** `SignatureAlgorithm` enum removed; signing is now fluent
    (`Jwts.builder().signWith(key)` without an explicit algorithm enum).
4.  **jakarta namespace:** all `javax.*` → `jakarta.*` (Jakarta EE 11 baseline).
5.  **Spring Boot 4 test APIs:** `AutoConfigureMockMvc`/`@WebMvcTest` moved to
    `org.springframework.boot.webmvc.test.autoconfigure` (new
    `spring-boot-starter-webmvc-test` starter); `MockitoBean` moved to
    `org.springframework.test.context.bean.override.mockito`; `@WithMockUser` now requires
    `spring-boot-starter-security-test` instead of raw `spring-security-test`.

## Getting Started

### Prerequisites

*   **Java 21 JDK** (LTS)
*   **Maven 3.9.6+**
*   Git
*   Docker and Docker Compose (for Zipkin, Grafana, Prometheus, Loki)

### Quick Start

Build all modules from the root directory:

```bash
mvn clean install
```

Run the full test suite:

```bash
mvn test
```

### Distributed Tracing with Zipkin

Start Zipkin from the root directory:

```bash
docker-compose up -d
```

Access the Zipkin UI at [http://localhost:9411](http://localhost:9411).

### Monitoring (Grafana / Prometheus / Loki)

```bash
cd monitoring
docker-compose up -d
```

Access:
*   **Grafana:** [http://localhost:3000](http://localhost:3000) (`admin` / `admin`)
*   **Prometheus:** [http://localhost:9090](http://localhost:9090)
*   **Loki:** [http://localhost:3100](http://localhost:3100)

### Running the Services

Each module is a Spring Boot application and can be run independently after building.
**Start order matters** — Eureka first, then config-server, then the rest:

```bash
# Terminal 1 — Service Discovery
cd eureka-server && mvn spring-boot:run

# Terminal 2 — Config Server
cd config-server && mvn spring-boot:run

# Terminal 3 — Security Module
cd security-module && mvn spring-boot:run

# Terminal 4 — API Gateway
cd api-gateway && mvn spring-boot:run
```

Verify the services are registered in the Eureka dashboard:
[http://localhost:8761](http://localhost:8761).

### API Usage

1.  **Authenticate** — POST to `/auth/authenticate` with credentials:
    ```bash
    curl -X POST http://localhost:8080/auth/authenticate \
      -H "Content-Type: application/json" \
      -d '{"username":"user","password":"password"}'
    ```
    Returns a JWT in the `AuthResponse`.

2.  **Access a protected resource** — include the JWT in the `Authorization` header:
    ```bash
    curl http://localhost:8080/auth/user/profile \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```

3.  **User management (ADMIN role)** — endpoints under `/api/users`:
    *   `GET /api/users/me` — current user profile (any authenticated user)
    *   `PUT /api/users/me` — update current user profile
    *   `GET /api/users/{id}` — get user by id (`ADMIN`)
    *   `GET /api/users` — list all users (`ADMIN`)
    *   `DELETE /api/users/{id}` — delete user (`ADMIN`)

## SonarQube Analysis

The project integrates with SonarQube for continuous code quality and security analysis via
GitHub Actions (`.github/workflows/sonarqube.yml`). The pipeline runs on pushes to `main`
and on pull requests, using JDK 21 and JaCoCo coverage reports.

**Required GitHub Secrets:**
*   `SONAR_TOKEN` — your SonarQube user token
*   `SONAR_HOST_URL` — your SonarQube instance URL (e.g., `https://sonarcloud.io`)
*   `SONAR_ORGANIZATION` — your SonarQube organization key
*   `SONAR_PROJECT_KEY` — the project key (`backend-portfolio`)

## Contributing

Please adhere to the existing code style and conventions. If you find issues or have
suggestions, open an issue or a pull request.
