# Design Spec: Spring Boot 4.1 + OAuth2/JWT Microservices Reconciliation

**Date:** 2026-08-15
**Status:** Draft — pending user review
**Repo:** `/Volumes/Elements2/IdeaProjects/backend-project` (branch `integration-setup`)
**Stack:** Spring Boot 4.1.0 · Spring Cloud 2025.1.2 · Java 21

---

## 0. Context & Mode (decisions locked via brainstorming)

This repo is **not greenfield**. It is a live 4-module Spring Boot 4.1 / Spring Cloud 2025.1 / Java 21 project mid-migration, with an **approved, half-finished plan** ("Commits A–G", discovery-first config) interrupted inside Commit A.

**Reconciliation mode (locked):** Validate & finish the in-flight plan, then gap-fill against the pasted "Senior Architect" spec — keeping the **existing module names** (`eureka-server`, `api-gateway`, `security-module`, `config-server`) and the **current SB 4.1 / Cloud 2025 stack** (already newer than the spec's "3.3+ / 2023.x+"). The spec was written generically and diverges from reality.

**Decisions locked during brainstorming (2026-08-15):**

1. **Mode** — finish in-flight (discovery-first config, Commits B–G) → migrate security → gap-fill platform. Keep module names + SB 4.1/Cloud 2025 stack.
2. **Security model** — Full **Spring Authorization Server** + **RSA/JWKS** (the literal spec ask). The half-done Commit A (HMAC `JwtServiceImpl` SecurityProperties refactor) is **throwaway** — reverted, not finished.
3. **Grants / user store** — keep H2+JPA `User`/`Role`/`UserDetailsServiceImpl`/`DataInitializer`; grant = **`client_credentials` + refresh_token**; `sub=client` (not user — see §2 tension note); roles injected as an `authorities` claim via `OAuth2TokenCustomizer`; `UserDetailsService` retained for the auth server's own authentication / future OIDC (not as token subject).
4. **Observability** — keep **Brave → Zipkin** (finish in-flight normalization across all 4 modules). JSON logging via `logstash-logback-encoder` (or SB 4.1 built-in structured logging). **No OTLP/OpenTelemetry migration.**
5. **Docker/build** — **per-module multi-stage Dockerfile** (`maven:3.9-eclipse-temurin-21` builder → `eclipse-temurin:21-jre` runtime) + rewritten root `docker-compose.yml` with healthchecks, `depends_on: service_healthy`, shared network. No `mvnw` required (system `mvn` in CI).

**Execution sequence (locked, Approach A — linear):**
- **Phase 1** — finish discovery-first config trunk (Commits B–G), 4 modules green on current HMAC security.
- **Phase 2** — migrate `security-module` → Spring Authorization Server (RSA/JWKS); `api-gateway` → reactive OAuth2 Resource Server.
- **Phase 3** — gap-fill platform: root `docker-compose.yml` + per-module Dockerfiles + `dependabot.yml` + Dependabot CI + JSON logging normalization.

**Authors/verified via:** Spring Security 7.0 reactive OAuth2 resource-server docs + Spring Authorization Server getting-started (Context7, 2026-08-15) — `@EnableWebFluxSecurity`, `ServerHttpSecurity.oauth2ResourceServer().jwt()`, `issuer-uri` auto-resolves JWKS; `OAuth2AuthorizationServerConfigurer.authorizationServer()` with two `@Order`-ed `SecurityFilterChain`s + `JWKSource` RSA-2048.

---

## 1. Target Architecture & Module Map

Four modules, no renames. Single parent POM (`gon.cue:backend-portfolio`, `dependencyManagement` + `pluginManagement`) already in place and retained.

| Module | Role today | Role after design |
|---|---|---|
| `eureka-server` | Service registry, standalone (`@EnableEurekaServer`, config disabled) | **Unchanged** — registry root |
| `config-server` | Central config, clones `config-repo` from GitHub | **Unchanged** — `@EnableConfigServer`, `spring.application.name=configserver`, discovery-first source (no self-import) |
| `security-module` | Custom `AuthController` + HMAC JJWT issuer (jjwt 0.13.0) | **Spring Authorization Server** — RSA keypair, standard endpoints `/oauth2/authorize` `/oauth2/token` `/oauth2/jwks`, `client_credentials`+refresh, keeps H2+JPA+UserDetailsService (roles→authorities). Eureka client + config consumer. |
| `api-gateway` | Reactive router (WebFlux), discovery locator | **Reactive OAuth2 Resource Server** — validates JWT via JWKS (issuer-uri → security-module `/oauth2/jwks`), extracts authorities, propagates `Authorization` downstream, route-level authorization |

**Boot/topology (Docker `depends_on: service_healthy` via `/actuator/health`):**
```
eureka-server (:8761) ─► config-server (:8888, name=configserver) ─► ┬─ api-gateway (:8080, reactive Resource Server)
                                                                     └─ security-module (:8081, Authorization Server)
zipkin (:9411) ── parallel, no deps
```

**Config topology (discovery-first, locked):** clients resolve `configserver` through Eureka; import via `spring.config.import: "optional:configserver:"`. Eureka is **not** a config consumer; config-server is the **source** (no self-import). The separate `config-repo` GitHub repo (`github.com/david-eve-za/config-repository`) is cleaned to the current architecture.

**Reverted/throwaway from the interrupted work:** the uncommitted `JwtServiceImpl.java` HMAC→SecurityProperties refactor (Commit A) and related `security-module/application.yml`/`bootstrap.yml` HMAC-secret changes. These are reverted at the start of Phase 1 (or shortly after) because Phase 2 replaces the issuer wholesale. Non-security edits in those files (port → 8081, etc.) are preserved into `security-service.yml`/config-repo.

---

## 2. Security — Authorization Server & Resource Server (Phase 2)

### 2.1 Issuer — `security-module` → Spring Authorization Server

**POM changes:**
- ADD `spring-boot-starter-oauth2-authorization-server` (BOM-managed, no version).
- REMOVE `jjwt-api`, `jjwt-impl`, `jjwt-jackson`, `nimbus-jose-jwt` (AuthZ Server uses nimbus internally; jjwt emission path is gone).
- REMOVE bucket4j artifacts (`bucket4j_jdk17-core`, `bucket4j_jdk17-jcache`, `cache-api`) from the *issuer* — rate limiting belongs at the gateway, not the auth server.
- KEEP `spring-boot-starter-data-jpa`, `h2`, `spring-boot-starter-validation`, `spring-boot-starter-security`, `spring-boot-starter-web`, `spring-boot-starter-actuator`, `spring-cloud-starter-netflix-eureka-client`, `spring-cloud-starter-config`, tracing.

**New config class `AuthorizationServerConfig`** (replaces emission behavior of current `SecurityConfig`):
- `@Order(1)` `SecurityFilterChain` using `OAuth2AuthorizationServerConfigurer.authorizationServer()`, securing `/oauth2/**` + `.oidc(Customizer.withDefaults())`.
- `@Order(2)` default `SecurityFilterChain`: permit `/actuator/**` + auth endpoints, authenticate otherwise, CSRF stateless (sessions STATELESS for API).
- `JWKSource<SecurityContext>`: RSA-2048 keypair generated at startup (`KeyPairGenerator`), wrapped in `RSAKey` + `ImmutableJWKSet`. **Prod note:** load RSA from a secret/volume rather than generating (in-memory means new `kid`/signature after restart → prior tokens invalidated). For a portfolio, generated RSA is acceptable with this documented limitation + JWK rotation path.
- `JwtDecoder` bean via `OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource)`.
- `AuthorizationServerSettings` — issuer from config (`http://localhost:8081` in dev; the service URI as resolved).
- `RegisteredClientRepository`: in-memory, e.g. `clientId="portfolio-client"`, `clientSecret="{bcrypt}..."` (not plaintext), `ClientAuthenticationMethod.CLIENT_SECRET_BASIC`, grants `CLIENT_CREDENTIALS` + `REFRESH_TOKEN`, scopes `read`/`write`/`admin`.
- `OAuth2TokenCustomizer<JwtEncodingContext>` — injects an `authorities` claim into the access token derived from scopes/client config. (This is how roles reach the token under `client_credentials`.)

**User store retained:** H2+JPA `User`/`Role`/`UserDetailsServiceImpl`/`DataInitializer` feed the auth server's own default security chain (console/self-authentication, basis for future OIDC userinfo). They are **not** the subject of `client_credentials` tokens (see tension note).

**`AuthController`:** `/auth/authenticate` kept as a convenience password-login endpoint (validates via `AuthenticationManager` → `UserDetailsService`); the canonical OAuth2 token comes from `/oauth2/token`. `JwtServiceImpl`/`JwtService` emission removed (throwaway). `JwtAuthenticationFilter` (manual HMAC validation) removed.

### 2.2 Resource Server (reactive) — `api-gateway`

**POM:** ADD `spring-boot-starter-oauth2-resource-server` (BOM-managed). Gateway is already reactive (`spring-cloud-starter-gateway-server-webflux`).

**New reactive `SecurityConfig` (`@EnableWebFluxSecurity`)** — one `SecurityWebFilterChain(ServerHttpSecurity)`:
- CSRF disabled (stateless), permit `/actuator/**` + specific public paths, `.oauth2ResourceServer(oauth -> oauth.jwt(...))` with `issuer-uri: http://localhost:8081`. Spring Security auto-fetches `/oauth2/jwks` from the issuer's openid-config.
- `Converter<Jwt, Mono<AbstractAuthenticationToken>>`: map `scope` claim → `SCOPE_*` authorities (standard) **and** map the `authorities` claim (injected by the issuer's `OAuth2TokenCustomizer`) → `ROLE_*`, so downstream `@PreAuthorize("hasRole('ADMIN')")` works.
- **Propagation:** gateway forwards `Authorization: Bearer <jwt>` to downstream unmodified. **security-module is also configured as a Resource Server** (Phase 2) so its own non-auth-server endpoints (`UserController`, etc.) validate the propagated JWT via its own issuer JWKS and `@PreAuthorize` works. The gateway is the validated edge resource *and* security-module self-validates propagated tokens.

### 2.3 `client_credentials` vs users — tension & resolution (flagged)

`client_credentials` produces `sub=client` (no resource owner), so "roles→authorities via user" does not apply naturally. **Resolution:** roles/authorities travel via an `authorities` claim injected by an `OAuth2TokenCustomizer` from scopes/RegisteredClient config; the `Converter` at the gateway reads `authorities` → `ROLE_*`. The retained `UserDetailsService` serves the auth server's own auth and future OIDC enablement, not as token subject. If user-scoped tokens are wanted later, add `password`/`authorization_code` grants — **out of scope now**.

### 2.4 Migration of replaced code

Removed/rewritten during Phase 2: `JwtServiceImpl`, `JwtService` (port), `JwtAuthenticationFilter` (manual HMAC validation), HMAC-based filter paths in `SecurityConfig`, jjwt deps. Tests touching HMAC emission (`JwtUtilTest`, the token portions of `AuthControllerIntegrationTest`) are **rewritten** against the auth-server `/oauth2/token` endpoint; the jjwt-builder `JwtUtilTest` is deleted (no `Jwts.builder()` remains). `RateLimitingFilter`/bucket4j move **only** to the gateway. **Both `api-gateway` and `security-module` get a Resource Server config** — the gateway via reactive `issuer-uri` + `jwk-set-uri`; security-module validates its own propagated tokens (issuer = itself) so `@PreAuthorize` on `UserController` is enforced.

---

## 3. Discovery-first Config Trunk (Phase 1)

Goal: bring the 4 modules green on the locked discovery-first config, completing the interrupted work. Each item is one commit; `mvn` green at each step.

- **B — Prometheus (all 4 POMs):** add `micrometer-registry-prometheus` to each `<dependencies>`; expose in each `application.yml`:
  ```yaml
  management:
    endpoints:
      web:
        exposure:
          include: health,prometheus,info
  ```
  Re-add `config-server` as a scrape target in `monitoring/prometheus/prometheus.yml` (besides security-module, api-gateway). Fixes the "every Prometheus scrape 404s" root cause.

- **C — Tracing enabled normalized (all 4):** set `management.tracing.enabled: true` + `tracing.sampling.probability: 1.0` in dev across all 4 (eureka/api-gateway/security/config), removing the current inconsistency (3 disabled, config-server enabled). Zipkin endpoint `http://zipkin:9411` in Docker / `http://localhost:9411` locally.

- **D — Eureka standalone:** eureka-server already has `spring.cloud.config.enabled: false` + `register-with-eureka/fetch-registry: false`. Remove the residual `spring-cloud-starter-config` dependency from its POM (audit flagged it as wrongly present) and clean any `bootstrap.yml`. Eureka is root, not a config consumer.

- **E — config-server → `configserver`:** set `spring.application.name: configserver` in `config-server/application.yml` (currently `config-server`) so clients resolve the default via Eureka. config-server is the **source** — no `spring.config.import` of itself. Keeps `@EnableConfigServer` + git config clone.

- **F — discovery-first clients (api-gateway, security-module):** in each `application.yml` add:
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
  `git rm` the dead `bootstrap.yml` (api-gateway + security-module) — Spring Cloud 2025 disables bootstrap by default, no module has the bootstrap starter, so they are inert. `optional:` tolerates temporary Eureka+config unavailability in dev; `fail-fast`+`retry` give strong failure / clean DAG in prod.

- **G — docs + config-repo cleanup** (separate GitHub repo, push authorized to `github.com/david-eve-za/config-repository`): delete `accounts-service.yml`, `expenses-service.yml`, `authorization-service.yml` (stale, older architecture); align `api-gateway.yml`/`eureka-server.yml` to the discovery-first shape; **add `security-service.yml`** (currently missing) — its skeleton added here so the service name matches `security-module`'s `spring.application.name`; after Phase 2 it carries oauth2/issuer/rsa settings. Update root/module READMEs.

**Reverted from the interrupted plan (Commit A):** the `JwtServiceImpl` SecurityProperties-injection refactor and the `security-module/application.yml`/`bootstrap.yml` HMAC-secret edits are **not finished** — they are throwaway under Phase 2. Revert at/early in Phase 1, preserving any orthogonal port/secret settings into `security-service.yml`/config-repo.

---

## 4. Data Flow & Boot Topology

**Startup order (Docker `depends_on: service_healthy` via `/actuator/health`):**
```
eureka-server (:8761) ─► config-server (:8888) ─► ┬─ api-gateway (:8080)
                                                   └─ security-module (:8081)
zipkin (:9411) ── parallel, no deps
```
Eureka registers config-server as `configserver`; clients locate it via Eureka and import config with `optional:configserver:`. DAG: eureka → configserver → clients (no deadlock).

**Auth flow (runtime):**
1. Client → `POST .../oauth2/token` (gateway `:8080` or direct `:8081`) with HTTP Basic of `RegisteredClient` (`portfolio-client`/secret) + `grant_type=client_credentials&scope=read write`.
2. security-module validates client creds → `OAuth2TokenCustomizer` injects `authorities` from scopes/client → returns JWT signed with RSA (RS256), `kid` in header.
3. Client → `GET .../...` with `Authorization: Bearer <jwt>`.
4. **api-gateway** (reactive Resource Server) decodes JWT via `issuer-uri` → fetches JWKS from `http://security-module/oauth2/jwks` (Eureka-resolved), verifiesRSA signature + exp + issuer; `Converter` maps `scope`→`SCOPE_*` and `authorities`→`ROLE_*`.
5. Gateway **propagates** `Authorization` intact to downstream (lb://security-module), routes via discovery locator.
6. zipkin receives spans across all hops (same `traceId`); JSON logs carry `traceId`/`spanId` injected by Micrometer Tracing.

**Config flow (discovery-first, locked):** config-server clones `config-repo` from GitHub → clients locate it via `service-id: configserver` in Eureka → `dev`/`prod` profile overlays.

---

## 5. Errors, Security & Testing

**Errors / resilience:**
- `fail-fast: true` + `retry.*` on config clients (dev: `optional:` tolerates transient failure; prod: non-optional).
- Token expired/invalid → gateway returns standard OAuth2 `401`.
- JWKS fetch failure → Nimbus internal cache with auto-refresh on `kid` rotation.
- Healthchecks: `/actuator/health` per module for `depends_on` (real startup, not just container up).
- Eureka self-preservation/registry cache covers gaps; discovery locator uses LB round-robin.

**Security considerations:**
- HMAC dev fallback removed → RSA generated at runtime. **Prod limitation:** in-memory RSA ⇒ new `kid`/signature after restart invalidates prior tokens. Acceptable for portfolio; documented with improvement path (RSA from volume/secret + JWK rotation).
- Secrets externalized to `${...}` env-var everywhere except the `RegisteredClient` secret (stored bcrypt-hashed `{bcrypt}...`, never plaintext).
- Gateway stateless, CSRF disabled (API), CORS controlled.
- `@EnableMethodSecurity` retained in security-module for internal `@PreAuthorize`.

**Testing (green per module):**
- **security-module:** `AuthZServerWebTest` — call `/oauth2/token` with client_credentials and validate the returned JWT decodes via internal JWKS; keep `UserControllerTest` with roles. Rewrite `AuthControllerTest`/`AuthControllerIntegrationTest` (formerly HMAC) to spin up the AuthZ Server + assert the standard endpoint. Delete `JwtUtilTest` (jjwt builder no longer present).
- **api-gateway:** reactive `WebTestClient` — protected route without token → `401`; with valid token decoded via `issuer-uri` to mock JWKS → `200`.
- **CI:** runners cover JDK 21 (commit `913c313`). No `mvnw` → CI uses system `mvn` (Fase 3 may add mvnw optionally).
- **Green criterion:** `mvn -q -pl <module> test` and `mvn clean verify` pass per commit.

---

## 6. Spec Deliverables Summary

Mapping the pasted spec → deliverables, status, where covered:

| # | Spec deliverable | Status | Covered in |
|---|---|---|---|
| 1 | Multimodule directory tree | exists (4 modules) | §1 |
| 2 | Parent POM with `dependencyManagement`/`pluginManagement` | exists (add oauth2-authorization-server BOM) | Phases 1–2 |
| 3 | Clean sub-module POMs inheriting from parent | exists/partial (clean styles, drop obsolete deps) | Phases 1–2 |
| 4 | OAuth2/JWT: `SecurityConfig`, JWT issuance, Resource Server filters/validators | Phase 2 — `AuthorizationServerConfig` + reactive `SecurityConfig`, RSA/JWKS, `OAuth2TokenCustomizer`, authorities Converter | §2 |
| 5 | API Gateway reactive routes + JWT/OAuth2 filter | Phase 2 — gateway-server-webflux + reactive Resource Server + propagation | §2 |
| 6 | `docker-compose.yml` complete + healthchecks | Phase 3 — rewrite root compose + 4 multi-stage Dockerfiles + `depends_on` + shared net | §4–5 |
| 7 | `.github/dependabot.yml` + Dependabot CI | Phase 3 — both net-new | §3 (gap) |
| 8 | Validation guide (compile, compose up, OAuth2+JWT flow) | final doc + README | §5 + docs |

**Explicitly out of scope / discarded per locked decisions:** renaming to `discovery-server`/`auth-service`/`logging-setup`; OTLP/OpenTelemetry; keeping HMAC/shared-secret; `mvnw` (optional Phase 3); `authorization_code`+PKCE for now.

**Risks to watch:** reactive Resource Server on Spring Boot 4.1 / Spring Security 7.0 is less-trodden → validate with `WebTestClient`; in-memory RSA rotation invalidates tokens after restart.

---

## 7. Phased Implementation Order (Approach A — linear)

**Pre-step — revert throwaway Commit A** (HMAC `JwtServiceImpl` refactor + HMAC-secret `application.yml`/`bootstrap.yml` edits), preserving orthogonal port/secret settings into `security-service.yml`/config-repo.

**Phase 1 — Discovery-first config trunk (Commits B–G):** B (prometheus deps+exposure+scrape target), C (tracing enabled normalized), D (eureka standalone POM cleanup), E (config-server name=`configserver`), F (discovery-first clients + `git rm` bootstrap.yml), G (config-repo cleanup+push + docs). One commit each, `mvn` green each.

**Phase 2 — Security migration:** security-module POM edits (add AuthZ Server starter + resource-server starter, remove jjwt/nimbus/bucket4j) → `AuthorizationServerConfig` (RSA keypair, `JWKSource`, `RegisteredClientRepository`, `OAuth2TokenCustomizer`, `JwtDecoder`, `AuthorizationServerSettings`) → simplify `SecurityConfig` AND add a `@Order(3)` servlet Resource Server chain validating propagated tokens (issuer=self) so `@PreAuthorize` on `UserController` is enforced → trim `AuthController` → remove `JwtServiceImpl`/`JwtService`/`JwtAuthenticationFilter` → api-gateway POM (add resource-server starter) → reactive resource-server `SecurityConfig` (issuer-uri, jwt, authorities Converter) → rewrite tests → `mvn verify` green.

**Phase 3 — Platform gap-fill:** rewrite root `docker-compose.yml` (4 modules + zipkin + healthchecks + `depends_on: service_healthy` + `microservices-net`) → per-module multi-stage `Dockerfile` (maven builder → temurin:21-jre runtime) → `.github/dependabot.yml` (maven + github-actions weekly) → `.github/workflows/dependabot-ci.yml` (`mvn clean verify` on Dependabot PRs) → JSON logging normalization (`logback-spring.xml` + `logstash-logback-encoder` or SB 4.1 structured logging) → validation guide doc/README.

---

*Drafted 2026-08-15. Pending user review; then → writing-plans skill for the implementation plan.*
