# Design Specification: crud-service Module

**Date:** 2026-08-17
**Project:** backend-portfolio (Spring Boot 4.1.0 / Spring Cloud 2025.1.2 / Java 21)
**Status:** Approved

---

## 1. Overview

Add a new microservice module `crud-service` that provides CRUD operations via REST API, backed by a physical H2 database. The service integrates with the existing Spring Cloud ecosystem: Eureka service discovery, Config Server for configuration, API Gateway for routing, and Security Module for JWT-based authentication.

### 1.1 Purpose

- Serve as the foundational data service for the microservices platform
- Provide a template for future entity-specific services
- Demonstrate complete Spring Cloud integration pattern
- Enable API documentation via Swagger/OpenAPI 3

### 1.2 Scope

**In Scope:**
- New Maven module `crud-service` added to parent POM
- Physical H2 file-based database (`./data/cruddb`)
- Sample `Item` entity with full CRUD REST endpoints
- JWT Resource Server security (validates tokens from security-module)
- Springdoc OpenAPI 3 / Swagger UI integration
- Eureka registration, Config Server discovery, Gateway routing
- Actuator health/metrics endpoints
- Unit and integration tests

**Out of Scope:**
- Business domain entities beyond sample `Item`
- Flyway/Liquibase migrations (use `ddl-auto: update` for dev)
- Event-driven architecture (async messaging)
- Multi-tenancy
- Caching layer (Redis)

---

## 2. Architecture

### 2.1 System Context

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   API Gateway   │────▶│   crud-service   │────▶│   H2 Database      │
│   (port 8080)   │     │   (port 8082)    │     │   ./data/cruddb    │
└────────┬────────┘     └────────┬─────────┘     └────────────────────┘
         │                       │
         │           ┌───────────┴───────────┐
         │           │                       │
         ▼           ▼                       ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│  Eureka Server  │ │ Config Server│ │ Security Module │
│  (port 8761)    │ │ (port 8888)  │ │  (port 8081)    │
└─────────────────┘ └──────────────┘ └─────────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       └───────────────────┴───────────────────┘
                    Service Discovery
```

### 2.2 Module Structure

```
crud-service/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── gon/cue/crud/
│   │   │       ├── CrudServiceApplication.java
│   │   │       ├── config/
│   │   │       │   ├── DataSourceConfig.java
│   │   │       │   ├── JpaConfig.java
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── SwaggerConfig.java
│   │   │       │   └── WebConfig.java
│   │   │       ├── controller/
│   │   │       │   └── ItemController.java
│   │   │       ├── model/
│   │   │       │   └── Item.java
│   │   │       ├── repository/
│   │   │       │   └── ItemRepository.java
│   │   │       ├── service/
│   │   │       │   └── ItemService.java
│   │   │       └── dto/
│   │   │           ├── ItemRequest.java
│   │   │           └── ItemResponse.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── bootstrap.yml
│   └── test/
│       └── java/gon/cue/crud/
│           ├── CrudServiceApplicationTests.java
│           └── controller/ItemControllerTest.java
└── target/
```

---

## 3. Configuration

### 3.1 bootstrap.yml

```yaml
spring:
  application:
    name: crud-service
  cloud:
    config:
      discovery:
        enabled: true
        service-id: configserver
      fail-fast: true
      retry:
        initial-interval: 2000
        max-attempts: 6
        multiplier: 1.5
```

### 3.2 application.yml

```yaml
server:
  port: 8082

spring:
  application:
    name: crud-service
  datasource:
    url: jdbc:h2:file:./data/cruddb;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      idle-timeout: 300000
      connection-timeout: 20000
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.H2Dialect
  h2:
    console:
      enabled: true
      path: /h2-console
      settings:
        web-allow-others: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
  instance:
    hostname: localhost
    prefer-ip-address: false
    lease-renewal-interval-in-seconds: 10
    lease-expiration-duration-in-seconds: 30

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
  tracing:
    enabled: true
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha
    disable-swagger-default-url: true
  packages-to-scan: gon.cue.crud.controller
  paths-to-match: /api/**
```

---

## 4. Security Design

### 4.1 Authentication Model: JWT Resource Server

The `crud-service` acts as an **OAuth2 Resource Server** that validates JWT tokens issued by the `security-module`.

### 4.2 SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${security.jwt.secret:bllRbxCOXTiYhFGAapfUb4ob3bglSuz7QJ8xUpmTV9M=}")
    private String jwtSecret;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            )
            .headers(h -> h.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            .build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecret)))
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
    }
}
```

---

## 5. Data Model

### 5.1 Sample Entity: Item

```java
@Entity
@Table(name = "items", uniqueConstraints = @UniqueConstraint(name = "uk_item_name", columnNames = "name"))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
```

---

## 6. REST API

### 6.1 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/items` | Create item |
| GET | `/api/items` | List all (paginated) |
| GET | `/api/items/{id}` | Get by ID |
| PUT | `/api/items/{id}` | Update item |
| DELETE | `/api/items/{id}` | Delete item |

### 6.2 Request/Response DTOs

```java
// ItemRequest.java
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemRequest {
    @NotBlank @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @Min(0)
    private Integer quantity;
}

// ItemResponse.java
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemResponse {
    private Long id;
    private String name;
    private String description;
    private Integer quantity;
    private Instant createdAt;
    private Instant updatedAt;
}
```

---

## 7. API Documentation (Swagger/OpenAPI 3)

### 7.1 SwaggerConfig.java

```java
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "CRUD Service API",
        version = "1.0.0",
        description = "CRUD operations for entity management",
        contact = @Contact(name = "Backend Portfolio", url = "https://github.com/david-eve-za"),
        license = @License(name = "MIT", url = "https://opensource.org/licenses/MIT")
    ),
    servers = {
        @Server(url = "http://localhost:8080/crud-service", description = "Via API Gateway"),
        @Server(url = "http://localhost:8082", description = "Direct access")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT token from security-module"
)
public class SwaggerConfig {
}
```

### 7.2 Access Points

| URL | Description |
|-----|-------------|
| `http://localhost:8082/swagger-ui.html` | Swagger UI (direct) |
| `http://localhost:8080/crud-service/swagger-ui.html` | Swagger UI (via Gateway) |
| `http://localhost:8082/v3/api-docs` | OpenAPI JSON (direct) |
| `http://localhost:8080/crud-service/v3/api-docs` | OpenAPI JSON (via Gateway) |

---

## 8. Integration Points

### 8.1 Eureka Registration
- Service ID: `crud-service`
- Registers on startup, heartbeats every 10s

### 8.2 Config Server Discovery
- Bootstrap config locates Config Server via Eureka (`service-id: configserver`)

### 8.3 API Gateway Routing
- Gateway has `spring.cloud.gateway.discovery.locator.enabled: true`
- Automatic route: `/crud-service/**` → `crud-service` service ID

### 8.4 Security Module Integration
- Validates JWT using shared secret
- Token issued by security-module `/auth/authenticate` endpoint

---

## 9. Observability

### 9.1 Actuator Endpoints
- `/actuator/health`, `/actuator/info`, `/actuator/metrics`, `/actuator/prometheus`

### 9.2 Distributed Tracing
- Brave → Zipkin (port 9411)
- Sampling: 100% (dev)

---

## 10. Testing Strategy

- Unit: JUnit 5, Mockito
- Integration: Spring Boot Test, Testcontainers (H2)
- Test profiles: `application-test.yml`

---

## 11. Build & Deployment

### 11.1 Maven Module Integration
Added to parent `pom.xml`:
```xml
<module>crud-service</module>
```

---

## 12. Future Extensibility

- Adding new entities: model → repository → dto → service → controller
- Migrations: Flyway (future)
- Caching: Redis (future)
- Events: Outbox pattern (future)

---

## 13. Acceptance Criteria

### 13.1 Functional
- [ ] Module builds: `./mvnw -pl crud-service clean install`
- [ ] Service starts on port 8082 and registers with Eureka
- [ ] Config Server loads configuration via discovery
- [ ] H2 database file created at `./data/cruddb.mv.db`
- [ ] Swagger UI accessible at `http://localhost:8082/swagger-ui.html`
- [ ] CRUD endpoints work via direct access (port 8082)
- [ ] CRUD endpoints work via Gateway (port 8080/crud-service)
- [ ] JWT validation works (401 without token, 200 with valid token)
- [ ] Actuator endpoints exposed and returning data
- [ ] Distributed traces appear in Zipkin

### 13.2 Non-Functional
- [ ] Unit tests pass
- [ ] Code coverage > 80% (JaCoCo)
- [ ] Startup time < 15 seconds
- [ ] Memory footprint < 512MB heap

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Config Server unavailable | Retry with exponential backoff |
| H2 file locking | `AUTO_SERVER=TRUE` |
| JWT secret mismatch | Shared secret via Config Server/env var |
| Gateway routing not working | Verify discovery locator enabled |

---

## 15. Appendix: File Checklist

### New Files to Create

| Path | Purpose |
|------|---------|
| `crud-service/pom.xml` | Maven build config |
| `crud-service/src/main/java/gon/cue/crud/CrudServiceApplication.java` | Main class |
| `crud-service/src/main/java/gon/cue/crud/config/DataSourceConfig.java` | H2 datasource setup |
| `crud-service/src/main/java/gon/cue/crud/config/JpaConfig.java` | JPA/Hibernate config |
| `crud-service/src/main/java/gon/cue/crud/config/SecurityConfig.java` | JWT Resource Server |
| `crud-service/src/main/java/gon/cue/crud/config/SwaggerConfig.java` | OpenAPI 3 config |
| `crud-service/src/main/java/gon/cue/crud/config/WebConfig.java` | CORS, WebMvc config |
| `crud-service/src/main/java/gon/cue/crud/controller/ItemController.java` | REST endpoints |
| `crud-service/src/main/java/gon/cue/crud/model/Item.java` | JPA entity |
| `crud-service/src/main/java/gon/cue/crud/repository/ItemRepository.java` | Spring Data repo |
| `crud-service/src/main/java/gon/cue/crud/service/ItemService.java` | Business logic |
| `crud-service/src/main/java/gon/cue/crud/dto/ItemRequest.java` | Request DTO |
| `crud-service/src/main/java/gon/cue/crud/dto/ItemResponse.java` | Response DTO |
| `crud-service/src/main/resources/application.yml` | Main configuration |
| `crud-service/src/main/resources/bootstrap.yml` | Bootstrap configuration |
| `crud-service/src/test/java/gon/cue/crud/CrudServiceApplicationTests.java` | Context load test |
| `crud-service/src/test/java/gon/cue/crud/controller/ItemControllerTest.java` | Integration tests |

### Modified Files

| Path | Change |
|------|--------|
| `pom.xml` (root) | Add `<module>crud-service</module>` |

---

**Document Version:** 1.0
**Next Step:** Invoke `writing-plans` skill to create implementation plan