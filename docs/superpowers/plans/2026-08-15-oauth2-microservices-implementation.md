# OAuth2/RSA-JWKS Microservices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the existing Spring Boot 4.1 / Spring Cloud 2025.1 / Java 21 four-module repo against the OAuth2/JWT spec — finish the discovery-first config trunk, migrate the issuer to Spring Authorization Server (RSA/JWKS), and gap-fill Docker/CI/logging.

**Architecture:** Discovery-first config (config-server registers as `configserver`, clients locate via Eureka). `security-module` becomes a Spring Authorization Server (RSA keypair, `/oauth2/token` + `/oauth2/jwks`, `client_credentials`+refresh) AND an OAuth2 Resource Server for its own endpoints. `api-gateway` becomes a reactive (WebFlux) OAuth2 Resource Server validating via JWKS and propagating tokens. Brave→Zipkin tracing. Per-module multi-stage Docker images on `eclipse-temurin:21-jre`.

**Tech Stack:** Java 21, Spring Boot 4.1.0, Spring Cloud 2025.1.2, Spring Security 7.0, Spring Authorization Server (BOM-managed), micrometer+brave+zipkin, micrometer-registry-prometheus, H2+JPA, logstash-logback-encoder, Docker Compose, GitHub Actions.

## Global Constraints

- **Java 21**, **Spring Boot 4.1.0**, **Spring Cloud 2025.1.2** (already set in root `pom.xml` properties — do not change).
- BOM-managed versions only: starter deps declare **no `<version>`** (they inherit from spring-boot-dependencies / spring-cloud-dependencies / spring-authorization-server BOM).
- Keep module names exactly: `eureka-server`, `config-server`, `api-gateway`, `security-module`. Do NOT rename to `discovery-server`/`auth-service`.
- Ports: eureka `8761`, config-server `8888`, api-gateway `8080`, security-module `8081`.
- Every task ends with `mvn -q -pl <module> test` (or `mvn -q -pl <module> -am verify` for cross-module) green, then a single focused commit.
- jakarta.* namespace (not javax) — already migrated.
- **Worktree note:** This plan was re-based onto `integration-setup` tip `913c313` (Spring Boot 4.1.0 lineage). On this lineage `security-module` DOES have: `config/SecurityProperties.java` (with `CorsProperties`, `RateLimitProperties`, `JwtProperties`), `service/adapter/JwtServiceImpl.java`, `service/port/JwtService.java`, `filter/JwtAuthenticationFilter.java` (uses jjwt 0.13.0), `service/adapter/AuthServiceImpl.java`, `mapper/UserMapper.java`. It does NOT have `util/JwtUtil.java` or `config/JwtRequestFilter.java` (those were a stale pre-upgrade lineage). Phase 2 deletes the real HMAC throwaway files: `JwtServiceImpl`, `JwtService` (port), `filter/JwtAuthenticationFilter`, and trims the `JwtProperties` block from `SecurityProperties`.
- config-repo is a SEPARATE git repo (origin `github.com/david-eve-za/config-repository`); push is authorized.
- No `mvnw` in repo — use system `mvn` locally and in CI.

---

## File Structure (what changes per phase)

**Pre-step:** revert uncommitted HMAC edits to `JwtServiceImpl`/`application.yml`/`bootstrap.yml` **only if they exist in your working tree** — in the clean worktree they don't, so verify `git status` first.

**Phase 1 — config trunk:**
- `*/pom.xml` — add `micrometer-registry-prometheus` (4 modules); remove `spring-cloud-starter-config` from `eureka-server/pom.xml`.
- `*/src/main/resources/application.yml` — expose `health,prometheus,info`; set `management.tracing.enabled: true` + sampling `1.0`; fix config-client imports (api-gateway, security-module).
- `config-server/.../application.yml` — `spring.application.name: configserver`.
- `api-gateway/.../bootstrap.yml`, `security-module/.../bootstrap.yml` — `git rm`.
- `monitoring/prometheus/prometheus.yml` — re-add config-server scrape, fix others.
- `config-repo/*.yml` — delete stale empties, align `api-gateway.yml`/`eureka-server.yml`, add `security-service.yml`.

**Phase 2 — security migration:**
- `security-module/pom.xml` — add `spring-boot-starter-oauth2-authorization-server` + `spring-boot-starter-oauth2-resource-server`; remove jjwt trio, bucket4j trio, `javax.cache`, jjwt version property.
- `security-module/.../config/AuthorizationServerConfig.java` — NEW (RSA keypair, JWKSource, RegisteredClientRepository, OAuth2TokenCustomizer, JwtDecoder, AuthorizationServerSettings).
- `security-module/.../config/ResourceServerConfig.java` — NEW (`@Order(3)` servlet chain validating propagated JWT via issuer=self so `@PreAuthorize` works).
- `security-module/.../config/SecurityConfig.java` — MODIFY (simplify to default chain, drop HMAC `JwtAuthenticationFilter` wiring, keep `@EnableMethodSecurity`).
- `security-module/.../service/adapter/JwtServiceImpl.java` — DELETE (HMAC issuer; replaced by AuthZ Server).
- `security-module/.../service/port/JwtService.java` — DELETE (interface whose only impl is removed).
- `security-module/.../filter/JwtAuthenticationFilter.java` — DELETE (manual HMAC validation; replaced by resource-server chain).
- `security-module/.../config/SecurityProperties.java` — MODIFY: remove the `JwtProperties` inner class and the `jwt` field (HMAC secret/expiration no longer used). Keep `CorsProperties` + `RateLimitProperties`.
- `security-module/.../controller/AuthController.java` — MODIFY (drop the `JwtService`/`AuthService` token-emission path; `/auth/authenticate` uses `AuthenticationManager` only or is removed). Verify exact current imports against the integration-setup `AuthController` before editing.
- `security-module/.../service/adapter/AuthServiceImpl.java`, `service/port/AuthService.java`, `mapper/UserMapper.java` — REVIEW: if they only wrap the HMAC `JwtService` token emission, simplify or delete; keep user/DTO logic. Confirm per-file before deleting.
- `security-module/.../application.yml` — MODIFY (remove root `jwt.*` block and any `security.jwt.*` override; add `security.oauth2.issuer` config).
- `security-module/src/test/.../util/JwtUtilTest.java` — DELETE (orphaned HMAC test on SB4 lineage; references `JwtServiceImpl` + jjwt `SignatureAlgorithm`). The class `JwtUtil` does NOT exist here, but this test class still does and must be removed.
- `security-module/src/test/.../service/*`, `controller/AuthControllerTest.java`, `AuthControllerIntegrationTest.java` — REWRITE/trim against `/oauth2/token`; remove tests of the deleted `JwtService`/`JwtServiceImpl`.
- `api-gateway/pom.xml` — add `spring-boot-starter-oauth2-resource-server`.
- `api-gateway/.../config/SecurityConfig.java` (reactive) — NEW.
- `api-gateway/.../application.yml` — add `spring.security.oauth2.resourceserver.jwt.issuer-uri`.

**Phase 3 — platform gap-fill:**
- `docker-compose.yml` — full rewrite (5 services + network + healthchecks + depends_on).
- `*/Dockerfile` — NEW per module (multi-stage).
- `.github/dependabot.yml` — NEW.
- `.github/workflows/dependabot-ci.yml` — NEW.
- `.github/workflows/sonarqube.yml` — MODIFY (JDK 17 → 21).
- `*/src/main/resources/logback-spring.xml` — NEW (JSON logging).
- `*/pom.xml` — add `net.logstash.logback:logstash-logback-encoder` where chosen.
- `docs/` — validation guide + README updates.

---

## Pre-Step: Verify working tree is clean baseline

> Skip light reversal: the clean worktree already reflects pre-Commit-A state. Confirm, then proceed.

- [ ] **Step 1: Confirm worktree has no half-done Commit A**

Run: `git status --short`
Expected: only `docs/superpowers/*` (the spec/plan) tracked-new; no modified `JwtServiceImpl.java`/`application.yml`/`bootstrap.yml` beyond the baseline.

- [ ] **Step 2: Confirm throwaway files are the OLD-HMAC versions**

Run: `git show HEAD:security-module/src/main/java/gon/cue/security/service/adapter/JwtServiceImpl.java | grep -c 'Jwts.builder()\|Jwts.SIG.HS256'`
Expected: `2` (confirms jjwt 0.13.0 HMAC issuer present — to be deleted in Phase 2, NOT migrated).

- [ ] **Step 3: Confirm spring.application.name values**

Run: `grep -H 'name:' config-server/src/main/resources/application.yml security-module/src/main/resources/application.yml api-gateway/src/main/resources/application.yml eureka-server/src/main/resources/application.yml`
Expected: `config-server` (to be fixed in Task E), `security-module`/`api-gateway`/`eureka-server` as-is.

---

## Phase 1 — Discovery-first Config Trunk (finish in-flight)

### Task B: Prometheus registry + exposure across 4 modules

**Files:**
- Modify: `eureka-server/pom.xml`, `api-gateway/pom.xml`, `security-module/pom.xml`, `config-server/pom.xml`
- Modify: `*/src/main/resources/application.yml` (4 modules)
- Modify: `monitoring/prometheus/prometheus.yml`

**Interfaces:**
- Produces: `/actuator/prometheus` endpoint on every module; Prometheus scrape targets for all 4.

- [ ] **Step 1: Add micrometer-registry-prometheus to each module POM**

In each of the 4 module `pom.xml`, within `<dependencies>` add (no version — BOM-managed):
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

- [ ] **Step 2: Expose actuator endpoints in each application.yml**

In each module's `src/main/resources/application.yml`, add (merge into existing `management:` block, do not duplicate keys):
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,info
  tracing:
    enabled: true
    sampling:
      probability: 1.0
```
(If a module already has `management.tracing.sampling.probability`, leave it; ensure `enabled: true` is present and `endpoints.web.exposure.include` is added.)

- [ ] **Step 3: Fix prometheus.yml scrape targets**

Read `monitoring/prometheus/prometheus.yml`, then set scrape targets for all 4 services on their actuator prometheus port (eureka 8761, config-server 8888, api-gateway 8080, security-module 8081), each path `/actuator/prometheus`. Example per target:
```yaml
- job_name: 'security-module'
  metrics_path: '/actuator/prometheus'
  static_configs:
    - targets: ['host.docker.internal:8081']
```

- [ ] **Step 4: Build all modules**

Run: `mvn -q -pl eureka-server,api-gateway,security-module,config-server -am clean install -DskipTests`
Expected: BUILD SUCCESS for all 4.

- [ ] **Step 5: Commit**

```bash
git add */pom.xml */src/main/resources/application.yml monitoring/prometheus/prometheus.yml
git commit -m "feat: add micrometer-registry-prometheus and expose /actuator/prometheus on all modules"
```

---

### Task C: Normalize tracing enabled across 4 modules

> Folding into Task B exposure changes where `management.tracing.enabled: true` was added. Verify consistency here.

- [ ] **Step 1: Verify all 4 application.yml have tracing enabled**

Run: `for m in eureka-server api-gateway security-module config-server; do echo "=$m="; grep -A3 'tracing:' $m/src/main/resources/application.yml; done`
Expected: each shows `enabled: true` and `sampling.probability` present. If Task B already set this, no edit needed.

- [ ] **Step 2: Verify zipkin endpoint consistent**

Each module's `management.zipkin.tracing.endpoint` should be `http://localhost:9411/api/v2/spans` (local) — for Docker it resolves via service name `zipkin` (handled in Phase 3 compose env). No change needed now; confirm present.

- [ ] **Step 3: If any module missing enabled:true, add it and commit; else no-op commit not needed**

If edits were needed:
```bash
git add */src/main/resources/application.yml
git commit -m "chore: normalize tracing enabled across all modules"
```

---

### Task D: eureka-server standalone (remove config client)

**Files:**
- Modify: `eureka-server/pom.xml:23-26`
- Modify: `eureka-server/src/main/resources/application.yml` (confirm `spring.cloud.config.enabled: false`)

**Interfaces:**
- Produces: eureka-server with NO spring-cloud-config dependency (root of topology, not a config consumer).

- [ ] **Step 1: Remove spring-cloud-starter-config from eureka POM**

Delete lines 23-26 of `eureka-server/pom.xml`:
```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
```

- [ ] **Step 2: Confirm eureka application.yml disables config**

Read `eureka-server/src/main/resources/application.yml`; ensure it contains:
```yaml
spring:
  cloud:
    config:
      enabled: false
eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
```
(Already present on integration-setup — verify, don't add if present.)

- [ ] **Step 3: Build eureka-server**

Run: `mvn -q -pl eureka-server -am clean install -DskipTests`
Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add eureka-server/pom.xml eureka-server/src/main/resources/application.yml
git commit -m "chore: make eureka-server standalone (remove spring-cloud-starter-config)"
```

---

### Task E: config-server → spring.application.name=configserver

**Files:**
- Modify: `config-server/src/main/resources/application.yml:5`
- Modify: `config-repo/eureka-server.yml` (if it references config-server by name)

**Interfaces:**
- Produces: config-server registered as Eureka service id `configserver` so discovery-first clients resolve it with default `spring.cloud.config.discovery.service-id: configserver`.

- [ ] **Step 1: Rename application name in config-server**

In `config-server/src/main/resources/application.yml`, change:
```yaml
spring:
  application:
    name: config-server
```
to:
```yaml
spring:
  application:
    name: configserver
```

- [ ] **Step 2: Build config-server**

Run: `mvn -q -pl config-server -am clean install -DskipTests`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add config-server/src/main/resources/application.yml
git commit -m "chore: rename config-server application name to configserver for discovery-first"
```

---

### Task F: discovery-first config clients + remove dead bootstrap.yml

**Files:**
- Delete: `api-gateway/src/main/resources/bootstrap.yml`
- Delete: `security-module/src/main/resources/bootstrap.yml`
- Modify: `api-gateway/src/main/resources/application.yml`
- Modify: `security-module/src/main/resources/application.yml`

**Interfaces:**
- Consumes: `configserver` Eureka service id from Task E.
- Produces: api-gateway + security-module import config via `spring.config.import: optional:configserver:` and locate it through Eureka.

- [ ] **Step 1: git rm dead bootstrap.yml files**

Run: `git rm api-gateway/src/main/resources/bootstrap.yml security-module/src/main/resources/bootstrap.yml`

- [ ] **Step 2: Add discovery-first config import to api-gateway application.yml**

In `api-gateway/src/main/resources/application.yml`, add under `spring:`:
```yaml
spring:
  config:
    import: "optional:configserver:"
  cloud:
    config:
      discovery:
        enabled: true
        service-id: configserver
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        max-attempts: 6
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: 'true'
```
(Keep existing `spring.cloud.gateway` and `spring.application.name`; the import/discovery keys are additions.)

- [ ] **Step 3: Add discovery-first config import to security-module application.yml**

In `security-module/src/main/resources/application.yml`, add under `spring:` (keep existing `application.name: security-module`):
```yaml
spring:
  config:
    import: "optional:configserver:"
  cloud:
    config:
      discovery:
        enabled: true
        service-id: configserver
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        max-attempts: 6
```
NOTE: leave the root `jwt:` block for now — Phase 2 removes it. Do NOT touch `jwt.*` here.

- [ ] **Step 4: Build both clients**

Run: `mvn -q -pl api-gateway,security-module -am clean install -DskipTests`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add api-gateway/src/main/resources/application.yml security-module/src/main/resources/application.yml
git commit -m "feat: discovery-first config clients (spring.config.import) and remove dead bootstrap.yml"
```

---

### Task G: config-repo cleanup + push + add security-service.yml

**Files (in `config-repo/`, a SEPARATE git repo — push to github.com/david-eve-za/config-repository):**
- Delete: `config-repo/accounts-service.yml`, `config-repo/authorization-service.yml`, `config-repo/expenses-service.yml` (all 0 bytes)
- Modify: `config-repo/api-gateway.yml`, `config-repo/eureka-server.yml`
- Create: `config-repo/security-service.yml`

**Interfaces:**
- Produces: a config-repo matching the current architecture, served by config-server.

- [ ] **Step 1: Delete stale empty config files**

Run: `cd config-repo && git rm accounts-service.yml authorization-service.yml expenses-service.yml`

- [ ] **Step 2: Write config-repo/eureka-server.yml**

Write `config-repo/eureka-server.yml`:
```yaml
server:
  port: 8761
spring:
  cloud:
    config:
      enabled: false
eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,info
  tracing:
    enabled: true
    sampling:
      probability: 1.0
```

- [ ] **Step 3: Write config-repo/api-gateway.yml**

Write `config-repo/api-gateway.yml`:
```yaml
server:
  port: 8080
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,info
  tracing:
    enabled: true
    sampling:
      probability: 1.0
```

- [ ] **Step 4: Write config-repo/security-service.yml skeleton**

Write `config-repo/security-service.yml` (skeleton; oauth2 settings filled in Phase 2):
```yaml
server:
  port: 8081
spring:
  application:
    name: security-service
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,info
  tracing:
    enabled: true
    sampling:
      probability: 1.0
# Phase 2 will add: security-module oauth2 / authorization-server settings here
```

- [ ] **Step 5: Commit and push config-repo**

Run:
```bash
cd config-repo
git add -A
git commit -m "chore: align config-repo to current architecture (remove stale, add security-service)"
git push origin main
cd ..
```
Expected: push to `github.com/david-eve-za/config-repository` succeeds.

- [ ] **Step 6: Verify config-server can serve the new files (manual smoke)**

Start eureka + config-server locally, then:
`curl -s http://localhost:8888/security-service/default | head`
Expected: YAML content from `security-service.yml`. (If环境 not readily available, defer to Phase 3 compose smoke test.)

- [ ] **Step 7: Commit parent repo pointer note (config-repo is separate; nothing to commit in parent unless README updated)**

Update root `README.md` "Config" section to state config-repo is separate + pushed. Commit in parent:
```bash
git add README.md
git commit -m "docs: note config-repo is a separate published repo"
```

---

## Phase 2 — Security Migration (Authorization Server + Resource Server)

> Verify exact starter + config syntax for Spring Authorization Server on Spring Boot 4.1 via context7 before coding (see Step 1 of Task 2.1). Configs below match Context7-verified Spring Security 7.0 / AuthZ Server APIs retrieved 2026-08-15.

### Task 2.1: research AuthZ Server APIs for SB 4.1 (gate before coding)

- [ ] **Step 1: Confirm starter + key beans via context7**

Run via MCP context7 `query-docs` on `/spring-projects/spring-authorization-server`, query: "SecurityFilterChain @Order OAuth2AuthorizationServerConfigurer authorizationServer JWKSource RSA RegisteredClientRepository client_credentials refresh_token OAuth2TokenCustomizer JwtDecoder AuthorizationServerSettings issuer".

Expected confirmation (already retrieved once this session): starter `spring-boot-starter-oauth2-authorization-server`; two `@Order`-ed `SecurityFilterChain` beans; `JWKSource<SecurityContext>` with RSA `RSAKey`; `OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource)`; `AuthorizationServerSettings.builder().issuer(...).build()`.

- [ ] **Step 2: Confirm reactive resource-server config via context7**

Run context7 `query-docs` on `/websites/spring_io_spring-security_reference_7_0`, query: "reactive OAuth2 resource server WebFlux EnableWebFluxSecurity ServerHttpSecurity oauth2ResourceServer jwt issuer-uri ReactiveJwtDecoder converter authorities".

Expected confirmation (already retrieved): `@EnableWebFluxSecurity`, `ServerHttpSecurity.oauth2ResourceServer(oauth -> oauth.jwt(...))`, `spring.security.oauth2.resourceserver.jwt.issuer-uri` auto-resolves JWKS, `Converter<Jwt, Mono<AbstractAuthenticationToken>>`.

- [ ] **Step 3: Confirm servlet resource-server for security-module self-validation**

Run context7 query: "servlet OAuth2 resource server JwtDecoder issuer-uri SecurityFilterChain oauth2ResourceServer jwt converter JwtAuthenticationConverter authorities roles". Confirm `JwtAuthenticationConverter` + `Converter<Jwt, JwtAuthenticationToken>` pattern for `@PreAuthorize`.

> If context7 returns anything contradicting the configs below, STOP and update the task code blocks before implementing.

---

### Task 2.2: security-module POM — swap security starters

**Files:**
- Modify: `security-module/pom.xml`

- [ ] **Step 1: Remove jjwt deps + version property + bucket4j/cache deps**

In `security-module/pom.xml` delete:
- `<properties><jjwt.version>0.11.5</jjwt.version></properties>` (lines 14-16)
- jjwt trio: `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (lines 62-79)
- bucket4j trio + cache: `bucket4j-core`, `bucket4j-jcache`, `cache-api` (lines 46-61)

- [ ] **Step 2: Add authorization-server + resource-server starters**

In `<dependencies>` add (BOM-managed, no version):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-authorization-server</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

- [ ] **Step 3: Build security-module (will fail on missing JwtServiceImpl/JwtService refs — expected until 2.4)**

Run: `mvn -q -pl security-module clean compile`
Expected: COMPILE FAILURE — the old HMAC `JwtServiceImpl`/`JwtService` port are referenced by `AuthController`, `JwtAuthenticationFilter`, and `AuthControllerTest`; they are deleted in 2.4. This is expected mid-migration; proceed to 2.3-2.6 before re-building.

- [ ] **Step 4: Do NOT commit yet — commit after Task 2.6 (whole security migration is one logical commit)**

---

### Task 2.3: AuthorizationServerConfig (issuer) — RSA/JWKS/token/client

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/config/AuthorizationServerConfig.java`

**Interfaces:**
- Produces: RSA `JWKSource`, `JwtDecoder`, `RegisteredClientRepository` (client `portfolio-client`), `OAuth2TokenCustomizer` (injects `authorities` claim), `AuthorizationServerSettings` (issuer from `security.oauth2.issuer` property, default `http://localhost:8081`), `@Order(1)` auth-server `SecurityFilterChain`, `@Order(2)` default servlet chain (form/stateless).

- [ ] **Step 1: Write AuthorizationServerConfig.java**

Write `security-module/src/main/java/gon/cue/security/config/AuthorizationServerConfig.java`:
```java
package gon.cue.security.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.List;
import java.util.UUID;

@Configuration
@EnableWebSecurity
public class AuthorizationServerConfig {

    @Value("${security.oauth2.issuer:http://localhost:8081}")
    private String issuer;

    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer =
                OAuth2AuthorizationServerConfigurer.authorizationServer();
        http
            .securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
            .with(authorizationServerConfigurer, (as) -> as.oidc(Customizer.withDefaults()))
            .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                    new LoginUrlAuthenticationEntryPoint("/login"),
                    new org.springframework.security.web.util.matcher.MediaTypeRequestMatcher(
                        org.springframework.http.MediaType.TEXT_HTML)));
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/auth/**").permitAll()
                .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient client = RegisteredClient.withId(UUID.randomUUID().toString())
            .clientId("portfolio-client")
            .clientSecret("{noop}portfolio-secret")   // replace with bcrypt in prod
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .scope("read")
            .scope("write")
            .scope("admin")
            .clientSettings(ClientSettings.builder().requireAuthorizationConsent(false).build())
            .build();
        return new InMemoryRegisteredClientRepository(client);
    }

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer() {
        return context -> {
            if (context.getTokenType().getValue().equals("access_token")) {
                var claims = context.getClaims();
                List<String> scopes = context.getAuthorizedScopes().stream().toList();
                MultiValueMap<String, String> authorities = new LinkedMultiValueMap<>();
                // map scopes -> ROLE_* authorities
                scopes.forEach(s -> authorities.add("authorities",
                    "ROLE_" + s.toUpperCase()));
                claims.claims().put("authorities", authorities.get("authorities"));
            }
        };
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAKey rsaKey = new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
            .privateKey((RSAPrivateKey) keyPair.getPrivate())
            .keyID(UUID.randomUUID().toString())
            .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    private static KeyPair generateRsaKey() {
        try {
            KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
            g.initialize(2048);
            return g.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder().issuer(issuer).build();
    }
}
```

> If context7 in 2.1 disagrees on any class/import, update this block before using it.

- [ ] **Step 2: (no build yet — continues in 2.4-2.6)**

---

### Task 2.4: ResourceServerConfig (security-module self-validation) + simplify SecurityConfig + delete HMAC files

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/config/ResourceServerConfig.java`
- Modify: `security-module/src/main/java/gon/cue/security/config/SecurityConfig.java`
- Delete: `security-module/src/main/java/gon/cue/security/service/adapter/JwtServiceImpl.java` (HMAC issuer, jjwt 0.13.0)
- Delete: `security-module/src/main/java/gon/cue/security/service/port/JwtService.java` (HMAC port)
- Delete: `security-module/src/main/java/gon/cue/security/filter/JwtAuthenticationFilter.java` (manual validation filter consumed by the old `SecurityConfig`)
- Delete: `security-module/src/test/java/gon/cue/security/util/JwtUtilTest.java` (orphaned HMAC test importing `JwtServiceImpl` + jjwt)
- Modify: `security-module/src/main/java/gon/cue/security/config/SecurityProperties.java` — trim the `JwtProperties` inner class + `jwt` field (HMAC no longer used)

**Interfaces:**
- Produces: `@Order(3)` servlet `SecurityFilterChain` validating propagated JWT via `issuer-uri` (self), mapping `scope`→`SCOPE_*` and `authorities`→`ROLE_*`; enables `@EnableMethodSecurity` so `@PreAuthorize` on `UserController` applies.

- [ ] **Step 1: Write ResourceServerConfig.java**

Write `security-module/src/main/java/gon/cue/security/config/ResourceServerConfig.java`:
```java
package gon.cue.security.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class ResourceServerConfig {

    @Value("${security.oauth2.issuer:http://localhost:8081}")
    private String issuer;

    @Bean
    @Order(3)
    public SecurityFilterChain resourceServerSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/users/**", "/api/**")
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt
                .jwtAuthenticationConverter(authoritiesConverter())));
        return http.build();
    }

    @Bean
    public JwtDecoder selfJwtDecoder() {
        return NimbusJwtDecoder.withIssuerLocation(issuer).build();
    }

    private Converter<Jwt, JwtAuthenticationToken> authoritiesConverter() {
        JwtAuthenticationConverter conv = new JwtAuthenticationConverter();
        conv.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> auths = new ArrayList<>();
            // scope -> SCOPE_*
            Object scope = jwt.getClaim("scope");
            if (scope instanceof String s) {
                for (String sc : s.split(" ")) auths.add(new SimpleGrantedAuthority("SCOPE_" + sc));
            }
            // authorities claim -> ROLE_*
            Object authorities = jwt.getClaim("authorities");
            if (authorities instanceof List<?> list) {
                for (Object a : list) auths.add(new SimpleGrantedAuthority(a.toString()));
            }
            return auths;
        });
        return conv;
    }
}
```

- [ ] **Step 2: Simplify SecurityConfig.java (remove HMAC filter wiring)**

Replace `security-module/src/main/java/gon/cue/security/config/SecurityConfig.java` content with:
```java
package gon.cue.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Order(1) and Order(2) come from AuthorizationServerConfig.
    // Order(3) resource-server chain comes from ResourceServerConfig.
    // A minimal permit-all for /auth/** + /actuator/** is owned by Order(2)/Order(3).
    // This class retained as a home for shared security beans if needed.
}
```
(If the old `SecurityConfig` had the Bucket/RateLimitingFilter wiring, that moves ONLY to the gateway in Phase 3 — not here.)

- [ ] **Step 3: Delete HMAC throwaway files**

Run:
```bash
git rm security-module/src/main/java/gon/cue/security/service/adapter/JwtServiceImpl.java
git rm security-module/src/main/java/gon/cue/security/service/port/JwtService.java
git rm security-module/src/main/java/gon/cue/security/filter/JwtAuthenticationFilter.java
git rm security-module/src/test/java/gon/cue/security/util/JwtUtilTest.java
```
Then edit `config/SecurityProperties.java` to remove the `JwtProperties` inner class + the `jwt` field (HMAC secret/expiration no longer used).

- [ ] **Step 4: (no build until AuthController trimmed in 2.5)**

---

### Task 2.5: Trim AuthController (remove JwtService/HMAC dependency)

**Files:**
- Modify: `security-module/src/main/java/gon/cue/security/controller/AuthController.java`
- Modify: `security-module/src/main/java/gon/cue/security/model/AuthResponse.java` (keep if used)

- [ ] **Step 1: Replace AuthController to drop the JwtService port + HMAC token emission**

Write `security-module/src/main/java/gon/cue/security/controller/AuthController.java`:
```java
package gon.cue.security.controller;

import gon.cue.security.model.AuthRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to Security Module!";
    }

    /**
     * Convenience username/password login that validates credentials via the auth manager.
     * The canonical OAuth2 token is obtained from POST /oauth2/token (client_credentials).
     * This endpoint returns 200 on valid credentials and 401 otherwise; it does NOT mint a JWT.
     */
    @PostMapping("/authenticate")
    public ResponseEntity<Void> authenticate(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        return authentication.isAuthenticated() ? ResponseEntity.ok().build() : ResponseEntity.status(401).build();
    }
}
```
If `AuthResponse` is now unused (grep `AuthResponse` across module), `git rm` it too.

- [ ] **Step 2: Check for other HMAC/JwtService references**

Run: `grep -rn "JwtService\|JwtServiceImpl\|JwtAuthenticationFilter\|model.AuthResponse" security-module/src`
Expected: no main-source references (only in tests to rewrite in 2.6). If `AuthResponse` is now unused, `git rm` it.

- [ ] **Step 3: Build security-module**

Run: `mvn -q -pl security-module clean compile -DskipTests`
Expected: BUILD SUCCESS (main compiles). Tests still failing is OK until 2.6.

---

### Task 2.6: Rewrite security-module tests against /oauth2/token; update application.yml; commit whole migration

**Files:**
- Rewrite: `security-module/src/test/java/gon/cue/security/controller/AuthControllerTest.java`
- Rewrite: `security-module/src/test/java/gon/cue/security/controller/AuthControllerIntegrationTest.java`
- Modify: `security-module/src/main/resources/application.yml`
- Verify: `security-module/src/test/java/gon/cue/security/controller/UserControllerTest.java` still passes

**Interfaces:**
- Produces: green `mvn -pl security-module test`; `/oauth2/token` client_credentials issues a JWT decodable via JWKS; a route secured with `@PreAuthorize("hasRole('ADMIN')")` returns 200 with an `admin`-scope token, 403 without.

- [ ] **Step 1: Update security-module application.yml (remove root jwt.*, add issuer)**

Edit `security-module/src/main/resources/application.yml` to:
```yaml
server:
  port: 8081

spring:
  application:
    name: security-module
  config:
    import: "optional:configserver:"
  cloud:
    config:
      discovery:
        enabled: true
        service-id: configserver
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        max-attempts: 6

security:
  oauth2:
    issuer: http://localhost:8081

management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,info
  tracing:
    enabled: true
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```
(Removes the old root `jwt:` block.)

- [ ] **Step 2: Write AuthControllerTest (no JWT emission)**

Replace `security-module/src/test/java/gon/cue/security/controller/AuthControllerTest.java` with a test that calls `/auth/welcome` (permitAll) and `/auth/authenticate` via MockMvc with mocked `AuthenticationManager`. Minimal:
```java
package gon.cue.security.controller;

import gon.cue.security.model.AuthRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {
    @Autowired MockMvc mvc;
    @MockBean AuthenticationManager authenticationManager;

    @Test
    void welcomeIsPublic() throws Exception {
        mvc.perform(get("/auth/welcome")).andExpect(status().isOk());
    }

    @Test
    void authenticateReturns200OnValidCredentials() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken("user", "pwd",
            java.util.List.of(() -> "ROLE_USER"));
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        mvc.perform(post("/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"user\",\"password\":\"pwd\"}"))
            .andExpect(status().isOk());
    }
}
```
> Note SB 4.x test: use `spring-boot-starter-test` + `spring-security-test` (already present). If `@AutoConfigureMockMvc` import path differs on SB 4.1 (modular split), adjust per the security-module test starter already working (commit f33e40f fixed these).

- [ ] **Step 3: Write AuthControllerIntegrationTest (real /oauth2/token flow)**

Replace `security-module/src/test/java/gon/cue/security/controller/AuthControllerIntegrationTest.java` with a test that hits `POST /oauth2/token` with Basic auth of `portfolio-client:portfolio-secret` and `grant_type=client_credentials&scope=admin`, decodes the returned JWT via the `JwtDecoder` bean, and asserts the `authorities` claim contains `ROLE_ADMIN`. Use `WebMvcClient`/MockMvc to `/oauth2/token`. Skeleton:
```java
package gon.cue.security.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JwtDecoder jwtDecoder;

    @Test
    void clientCredentialsIssuesJwtWithAuthorities() throws Exception {
        String basic = Base64.getEncoder().encodeToString("portfolio-client:portfolio-secret".getBytes(StandardCharsets.UTF_8));
        var result = mvc.perform(post("/oauth2/token")
                .header("Authorization", "Basic " + basic)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("grant_type", "client_credentials")
                .param("scope", "admin"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.access_token").exists())
            .andReturn();
        String body = result.getResponse().getContentAsString();
        String token = new com.fasterxml.jackson.databind.ObjectMapper().readTree(body).get("access_token").asText();
        var jwt = jwtDecoder.decode(token);
        assert ((java.util.List<?>) jwt.getClaim("authorities")).contains("ROLE_ADMIN");
    }
}
```
> If MockMvc cannot drive the AuthZ Server token endpoint (it's an MVC framework endpoint), switch to `WebTestClient` or `RestAssured`/HTTP to `localhost:8081`. Capture the actual mechanism that compiles+passes; the assertion intent is unchanged.

- [ ] **Step 4: Run security-module tests and fix all**

Run: `mvn -pl security-module test`
Iterate until BUILD SUCCESS (all tests green). If `UserControllerTest` fails due to security chain changes, fix its `@WithMockUser` authorities to match the new `ROLE_*` authorities.

- [ ] **Step 5: Commit the whole security migration**

```bash
git add security-module/
git commit -m "feat: migrate security-module to Spring Authorization Server (RSA/JWKS) + self Resource Server

- Add spring-boot-starter-oauth2-authorization-server + oauth2-resource-server
- AuthorizationServerConfig: RSA keypair, JWKSource, RegisteredClientRepository
  (portfolio-client, client_credentials+refresh), OAuth2TokenCustomizer
  injecting 'authorities' claim from scopes
- ResourceServerConfig (@Order 3): self-validate propagated JWT, map
  scope->SCOPE_* and authorities->ROLE_* so @PreAuthorize applies
- Delete HMAC throwaway: JwtServiceImpl, JwtService (port), filter/JwtAuthenticationFilter, util/JwtUtilTest
- Simplify SecurityConfig; trim SecurityProperties (drop JwtProperties block); trim AuthController (drop JwtService emission)
- Rewrite AuthControllerTest + AuthControllerIntegrationTest against /oauth2/token
- application.yml: remove root jwt.*, add security.oauth2.issuer"
```

---

### Task 2.7: api-gateway reactive Resource Server

**Files:**
- Modify: `api-gateway/pom.xml`
- Create: `api-gateway/src/main/java/gon/cue/apigateway/config/SecurityConfig.java`
- Modify: `api-gateway/src/main/resources/application.yml`

**Interfaces:**
- Consumes: security-module `/oauth2/jwks` (auto-resolved from `issuer-uri` `http://localhost:8081`).
- Produces: gateway validates JWT signature/expiry/issuer, maps authorities, propagates `Authorization` header downstream, permits `/actuator/**` + token endpoints.

- [ ] **Step 1: Add resource-server starter to api-gateway POM**

In `api-gateway/pom.xml` `<dependencies>` add:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

- [ ] **Step 2: Create reactive SecurityConfig.java**

Write `api-gateway/src/main/java/gon/cue/apigateway/config/SecurityConfig.java`:
```java
package gon.cue.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity::disable)
            .authorizeExchange(ex -> ex
                .pathMatchers("/actuator/**", "/oauth2/**").permitAll()
                .anyExchange().authenticated())
            .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));
        return http.build();
    }
}
```
(Spring auto-resolves JWKS from `spring.security.oauth2.resourceserver.jwt.issuer-uri`.)

- [ ] **Step 3: Add issuer-uri to api-gateway application.yml**

In `api-gateway/src/main/resources/application.yml` add:
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8081
```

- [ ] **Step 4: Build api-gateway**

Run: `mvn -q -pl api-gateway -am clean install -DskipTests`
Expected: BUILD SUCCESS.

- [ ] **Step 5: (optional) add a gateway route test with WebTestClient**

If time permits, add `api-gateway/src/test/java/gon/cue/apigateway/SecurityConfigTest.java` using `WebTestClient`: a protected route without token → 401; with a signed JWT (minted with the same RSA test key inline) via mock issuer → 200. If setting up a mock JWKS server in a unit test is too heavy on SB 4.1, skip and rely on the Phase 3 compose end-to-end smoke. Document the skip.

- [ ] **Step 6: Commit**

```bash
git add api-gateway/
git commit -m "feat: api-gateway reactive OAuth2 Resource Server (JWT via JWKS issuer-uri, authority extraction)"
```

---

## Phase 3 — Platform Gap-Fill (Docker, CI, logging)

### Task 3.1: per-module multi-stage Dockerfiles

**Files:**
- Create: `eureka-server/Dockerfile`, `config-server/Dockerfile`, `api-gateway/Dockerfile`, `security-module/Dockerfile`

- [ ] **Step 1: Write a Dockerfile per module**

Each module `Dockerfile` (identical pattern, only the jar name differs):
```dockerfile
# build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
# copy parent + module
COPY pom.xml ./
COPY <module>/pom.xml <module>/
COPY <module>/src <module>/src
RUN mvn -q -pl <module> -am -DskipTests clean package

# runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/<module>/target/<module>-*.jar app.jar
EXPOSE <port>
ENTRYPOINT ["java","-jar","/app/app.jar"]
```
Per module: `<module>` → `eureka-server`(port 8761), `config-server`(8888), `api-gateway`(8080), `security-module`(8081). The jar artifactId matches the module dir name.

> If the build needs sibling modules for `-am`, the COPY must include them. For 4 independently-buildable modules, `-pl <module> -am` resolves parent only (no inter-module deps today), so parent + single module copy suffices. Verify with a docker build in Step 2.

- [ ] **Step 2: Build one image to validate the pattern**

Run: `docker build -t bp/security-module security-module/`
Expected: image builds, `java -jar` runs (check with `docker run --rm -p 8081:8081 bp/security-module` briefly then Ctrl-C — only validate startup, no full eureka wiring).

- [ ] **Step 3: Build the other 3**

Run each: `docker build -t bp/eureka-server eureka-server/`, `bp/config-server config-server/`, `bp/api-gateway api-gateway/`. All build.

- [ ] **Step 4: Commit**

```bash
git add */Dockerfile
git commit -m " feat: add per-module multi-stage Dockerfiles (maven builder + temurin:21-jre)"
```

---

### Task 3.2: root docker-compose.yml (all services + healthchecks + network)

**Files:**
- Modify (rewrite): `docker-compose.yml`

**Interfaces:**
- Produces: `docker compose up --build` brings eureka → config-server → api-gateway/security-module, with `/actuator/health` healthchecks, on shared network `microservices-net`.

- [ ] **Step 1: Rewrite docker-compose.yml**

Write `docker-compose.yml`:
```yaml
version: '3.8'
services:
  zipkin:
    image: openzipkin/zipkin
    container_name: zipkin
    ports: ["9411:9411"]
    networks: [microservices-net]

  eureka-server:
    build: ./eureka-server
    container_name: eureka-server
    ports: ["8761:8761"]
    environment:
      - MANAGEMENT_ZIPKIN_TRACING_ENDPOINT=http://zipkin:9411/api/v2/spans
    healthcheck:
      test: ["CMD-SHELL","curl -f http://localhost:8761/actuator/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks: [microservices-net]

  config-server:
    build: ./config-server
    container_name: config-server
    depends_on:
      eureka-server: { condition: service_healthy }
    ports: ["8888:8888"]
    environment:
      - MANAGEMENT_ZIPKIN_TRACING_ENDPOINT=http://zipkin:9411/api/v2/spans
      - EUREKA_CLIENT_SERVICE-URL_DEFAULTZONE=http://eureka-server:8761/eureka/
    healthcheck:
      test: ["CMD-SHELL","curl -f http://localhost:8888/actuator/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 40s
    networks: [microservices-net]

  security-module:
    build: ./security-module
    container_name: security-module
    depends_on:
      config-server: { condition: service_healthy }
      eureka-server: { condition: service_healthy }
    ports: ["8081:8081"]
    environment:
      - MANAGEMENT_ZIPKIN_TRACING_ENDPOINT=http://zipkin:9411/api/v2/spans
      - EUREKA_CLIENT_SERVICE-URL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - SECURITY_OAUTH2_ISSUER=http://security-module:8081
    healthcheck:
      test: ["CMD-SHELL","curl -f http://localhost:8081/actuator/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 50s
    networks: [microservices-net]

  api-gateway:
    build: ./api-gateway
    container_name: api-gateway
    depends_on:
      config-server: { condition: service_healthy }
      eureka-server: { condition: service_healthy }
      security-module: { condition: service_healthy }
    ports: ["8080:8080"]
    environment:
      - MANAGEMENT_ZIPKIN_TRACING_ENDPOINT=http://zipkin:9411/api/v2/spans
      - EUREKA_CLIENT_SERVICE-URL_DEFAULTZONE=http://eureka-server:8761/eureka/
      - SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER-URI=http://security-module:8081
    networks: [microservices-net]

networks:
  microservices-net:
    driver: bridge
```
> Spring Boot relaxed binding maps `SECURITY_OAUTH2_ISSUER` → `security.oauth2.issuer` and `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER-URI` → the issuer-uri. Verify exact env-var spelling works (Spring relaxed binding handles dashes); if `curl` is absent in temurin:21-jre (it is NOT by default), switch healthcheck `test` to a wget-free approach: use `java -jar` probing or add `curl` via a custom runtime layer — see Step 2 note.

- [ ] **Step 2: Resolve healthcheck command availability**

`eclipse-temurin:21-jre` does NOT include curl. Replace each `test` with a Java-based health probe using the actuator's supported approach, or add a tiny `wget` if available — simplest: install nothing and use:
```
test: ["CMD-SHELL","java -cp /app/app.jar -Dloader.main=org.springframework.boot.loader.tools.MainClassFinder ... "]
```
**Pragmatic alternative (PREFERRED):** add to each Dockerfile a single layer installing `curl`:
```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
```
Add this line to the runtime stage of all 4 Dockerfiles from Task 3.1 before `ENTRYPOINT`. Then the `curl` healthchecks above work.

- [ ] **Step 3: Validate compose**

Run: `docker compose up --build -d && sleep 60 && docker compose ps`
Expected: all services status `healthy` (eureka, config-server, security-module, api-gateway) + `zipkin` up.

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml */Dockerfile
git commit -m "feat: root docker-compose with healthchecks, depends_on ordering, microservices-net"
```

---

### Task 3.3: Dependabot + Dependabot CI workflow

**Files:**
- Create: `.github/dependabot.yml`
- Create: `.github/workflows/dependabot-ci.yml`
- Modify: `.github/workflows/sonarqube.yml` (JDK 17 → 21)

- [ ] **Step 1: Write dependabot.yml**

Write `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "maven"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

- [ ] **Step 2: Write dependabot-ci.yml**

Write `.github/workflows/dependabot-ci.yml`:
```yaml
name: Dependabot CI
on:
  pull_request:
    branches: [main, integration-setup]
jobs:
  verify:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven
      - name: Build & verify
        run: mvn -B clean verify
```

- [ ] **Step 3: Bump sonarqube.yml JDK 17 → 21**

In `.github/workflows/sonarqube.yml`, replace `java-version: 17` with `java-version: '21'` and `distribution: 'zulu'` with `distribution: 'temurin'`.

- [ ] **Step 4: Commit**

```bash
git add .github/
git commit -m "ci: add dependabot config + Dependabot CI workflow; bump sonarqube JDK to 21"
```

---

### Task 3.4: JSON structured logging (logback) + validation guide

**Files:**
- Create: `*/src/main/resources/logback-spring.xml` (4 modules) OR choose Spring Boot 4.1 built-in structured logging instead
- Modify: `*/pom.xml` if logstash-encoder chosen
- Create: `docs/VALIDATION.md`

- [ ] **Step 1: Choose logging approach (SB 4.1 built-in preferred — no new dep)**

Spring Boot 4.1 supports built-in structured JSON logging. Add to each module's `application.yml` under a `logging:` block:
```yaml
logging:
  structured:
    format:
      logframe: default
  format:
    console: json
```
**Verify exact property via context7** (`spring-boot` 4.1.0 docs, query: "structured logging JSON console logging.format.console") — if the key differs, use the verified key. If built-in is unavailable, fall back to `logstash-logback-encoder` with a `logback-spring.xml`.

- [ ] **Step 2: Apply verified logging config to all 4 application.yml**

Merge the verified `logging:` block into all 4 modules' `application.yml` (Phase 1 already edited these — edit in place, do not duplicate keys).

- [ ] **Step 3: Build all**

Run: `mvn -q -pl eureka-server,api-gateway,security-module,config-server -am clean install -DskipTests`
Expected: BUILD SUCCESS.

- [ ] **Step 4: Confirm traceId/spanId in logs (manual)**

Start one module locally, hit an endpoint, check stderr logs show JSON with `traceId`/`spanId` fields (Brave injects them).

- [ ] **Step 5: Write docs/VALIDATION.md**

Write `docs/VALIDATION.md` with: prerequisites (Docker, JDK 21, Maven), `mvn clean verify` instructions, `docker compose up --build`, then the OAuth2+JWT flow test (Basic-auth POST /oauth2/token → get JWT → call gateway with Bearer → expect routed response). Include curl snippets.

- [ ] **Step 6: Commit**

```bash
git add */src/main/resources/application.yml docs/VALIDATION.md
git commit -m "feat: JSON structured logging with traceId/spanId (SB 4.1 built-in) + validation guide"
```

---

### Task 3.5: Final full-stack verification + PR readiness

- [ ] **Step 1: Full clean verify**

Run: `mvn -B clean verify`
Expected: BUILD SUCCESS, all tests pass.

- [ ] **Step 2: End-to-end compose smoke**

Run: `docker compose up --build -d && sleep 90`
Then run the VALIDATION.md curl flow:
```
TOKEN=$(curl -s -u portfolio-client:portfolio-secret -d "grant_type=client_credentials&scope=admin" http://localhost:8080/oauth2/token | jq -r .access_token)
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/...
```
Expected: a 200 with routed content; protected route denied without token.

- [ ] **Step 3: Push branch and open/refresh the PR**

Run:
```bash
git push origin worktree-spec-design-oauth2
gh pr create --draft --title "feat: OAuth2/RSA-JWKS microservices reconciliation" --body "Implements docs/superpowers/specs/2026-08-15-oauth2-microservices-design.md: discovery-first config trunk, Spring Authorization Server + RSA/JWKS, reactive gateway Resource Server, Docker/compose, Dependabot CI, JSON logging." || gh pr edit --body "Updated with full implementation" 
```
Expected: PR opened/updated against `main`.

- [ ] **Step 4: Mark plan complete; summarize**

Update the worktree/PR with a final validation note (tests green, compose healthy). Report the result line.

---

## Notes for the implementer

- **TDD where tests exist**: this repo has an existing test suite; keep green per task. New security code gets tests (Task 2.6) before/with implementation.
- **One commit per task**; `mvn` green before each commit.
- **Throwaway files on this lineage** (integration-setup/SB4): `service/adapter/JwtServiceImpl.java`, `service/port/JwtService.java`, `filter/JwtAuthenticationFilter.java` (the HMAC issuer + manual validator, jjwt 0.13.0). Also trim the `JwtProperties` inner class + `jwt` field from `config/SecurityProperties.java`. The files `util/JwtUtil.java` / `config/JwtRequestFilter.java` named in an earlier draft DO NOT exist here — do not search for them.
- **config-repo is a separate repo** — Task G pushes to `github.com/david-eve-za/config-repository`, not the parent.
- **Spring Boot 4.1 is recent**: when context7 in Task 2.1 returns anything contradicting the code blocks, trust context7 and update the block before coding.
- **No `mvnw`** — use system `mvn`.
