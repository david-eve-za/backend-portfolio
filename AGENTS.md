# AGENTS.md — Backend Portfolio Project

Multi-module Spring Boot 4.x microservices project (Java 21, Maven). This file captures non-obvious conventions and commands for AI agents.

## Project Structure

```
backend-portfolio/              # Root pom.xml (parent)
├── eureka-server/              # Service discovery (port 8761)
├── api-gateway/                # Spring Cloud Gateway WebFlux (port 8080)
├── security-module/            # JWT auth + user mgmt (port 8080/8081)
├── config-server/              # Git-backed config (port 8888)
├── crud-service/               # Example service (port 8082)
├── config-repo/                # Git repo backing config-server
├── monitoring/                 # Grafana/Prometheus/Loki stack
├── docker-compose.yml          # Zipkin + all services (Docker)
└── .github/workflows/          # SonarQube + AI SDLC Agent
```

**Module dependency order**: eureka-server → config-server → (api-gateway, security-module, crud-service)

## Developer Commands

### Build & Test (from root)
```bash
mvn clean install          # Build all modules
mvn test                   # Run all tests
mvn verify                 # Build + test + JaCoCo report
mvn checkstyle:check       # Lint (if configured per-module)
```

### Run Single Module Tests
```bash
cd security-module && mvn test
cd api-gateway && mvn test
# etc.
```

### Run Specific Test Class
```bash
cd security-module && mvn test -Dtest=AuthControllerTest
cd security-module && mvn test -Dtest=*IntegrationTest
```

### Local Development (start order matters)
```bash
# Terminal 1
cd eureka-server && mvn spring-boot:run

# Terminal 2
cd config-server && mvn spring-boot:run

# Terminal 3
cd security-module && mvn spring-boot:run   # or port 8081 via -Dserver.port=8081

# Terminal 4
cd api-gateway && mvn spring-boot:run
```

### Docker (full stack)
```bash
docker-compose up -d              # Zipkin + all services
cd monitoring && docker-compose up -d   # Grafana/Prometheus/Loki
```

## Key Technical Details

### Spring Boot 4.x / Java 21 Migration Notes
- Gateway artifact: `spring-cloud-starter-gateway-server-webflux` (not `spring-cloud-starter-gateway`)
- Bucket4j artifacts: `bucket4j_jdk17-core` / `bucket4j_jdk17-jcache` (JDK-targeted)
- jjwt 0.13.0: fluent signing API, no `SignatureAlgorithm` enum
- All `javax.*` → `jakarta.*` (Jakarta EE 11)
- Test imports moved:
  - `@AutoConfigureMockMvc` / `@WebMvcTest` → `org.springframework.boot.webmvc.test.autoconfigure`
  - `spring-boot-starter-webmvc-test` starter required
  - `@MockitoBean` → `org.springframework.test.context.bean.override.mockito.MockitoBean`
  - `@WithMockUser` requires `spring-boot-starter-security-test`

### Security Module Structure (SOLID)
```
config/       SecurityConfig, AuthenticationConfig, CorsConfig, RateLimitConfig, SecurityProperties, DataInitializer
service/
  port/       UserService, AuthService, JwtService (interfaces)
  adapter/    UserServiceImpl, AuthServiceImpl, JwtServiceImpl
mapper/       UserMapper
filter/       JwtAuthenticationFilter, RateLimitingFilter
controller/   AuthController, UserController
repository/   UserRepository, RoleRepository
model/        User, Role, AuthRequest, AuthResponse
dto/          UserDto, UpdateUserDto
```

### Testing Patterns
- **Unit**: Mockito + `@InjectMocks`/`@Mock` (see `UserServiceTest`, `AuthControllerTest`)
- **Integration**: `@SpringBootTest` + `@AutoConfigureMockMvc` + `@TestPropertySource` (see `AuthControllerIntegrationTest`)
- Disable config server in tests: `spring.cloud.config.enabled=false`
- JaCoCo reports: `target/site/jacoco/jacoco.xml` per module

### CI/CD (GitHub Actions)
- **SonarQube**: Runs on push to main + PRs. Requires secrets: `SONAR_TOKEN`, `SONAR_HOST_URL`, `SONAR_ORGANIZATION`, `SONAR_PROJECT_KEY`
- **AI SDLC Agent**: Triggered by issue labels (`enhancement`, `bug`, `security`, `performance`, `refactor`) or manual dispatch. Uses Aider + NVIDIA models.
- Test command for Maven: `mvn test -q` (defined in `.github/ai-agent-config.yml`)

### Configuration
- Config server backed by `config-repo/` (Git)
- Profiles: `docker` for containerized runs
- Eureka registration: `eureka.client.service-url.defaultZone`
- Distributed tracing: Micrometer + Zipkin (Brave bridge), port 9411

## Non-Obvious Gotchas

1. **Port conflicts**: api-gateway and security-module both default to 8080. Override with `-Dserver.port=8081` or use docker-compose (security-module → 8081).
2. **Eureka first**: Services won't register/discover without Eureka running.
3. **Config server dependency**: api-gateway, security-module, crud-service need config-server for externalized config.
4. **Test annotations**: Use `@AutoConfigureMockMvc` from `spring-boot-webmvc-test`, not old `spring-boot-test-autoconfigure`.
5. **Lombok**: Requires annotation processor config in each module's pom.xml (already present).
6. **H2 database**: In-memory, only in security-module (dev/test).

## File References

- Root `pom.xml` — versions, dependency management, module list
- `README.md` — architecture diagram, API usage, startup instructions
- `.github/ai-agent-config.yml` — AI agent model selection, test commands, safety rules
- `.github/workflows/sonarqube.yml` — coverage paths per module
- `docker-compose.yml` — full stack with service dependencies

## Quick Verification Checklist

Before committing:
- [ ] `mvn clean verify` passes from root
- [ ] All modules compile
- [ ] JaCoCo reports generated in each `target/site/jacoco/`
- [ ] No Checkstyle violations (if configured)