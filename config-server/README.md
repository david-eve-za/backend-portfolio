# Config Server Module

This module provides **centralized, externalized configuration** for the microservices
system using **Spring Cloud Config Server** (`@EnableConfigServer`) backed by a **Git
repository**. It is the single source of truth for environment-specific properties
(development, staging, production): on startup, every other microservice fetches the
configuration that matches its `spring.application.name` and active profile from this
server, instead of bundling those properties locally.

> **Implementation status note:** This module is implemented as a standard, production-ready
> **Spring Cloud Config Server with a Git backend** — there is **no** custom REST CRUD API,
> database, or JPA layer. The HTTP endpoints listed below under "Built-in Endpoints" are
> provided automatically by `@EnableConfigServer`. See the **Planned Enhancements** section
> for the originally-specified future work (a database-backed CRUD config API secured by the
> security-module) that has **not** been built.

## Role in the Architecture

The Config Server is the configuration authority for the system:

*   **Centralized Configuration** — All environment-specific properties live in the
    backing Git repository (`config-repo` / the configured `uri`). Microservices pull their
    configuration from this server on startup, externalizing config out of the artifacts.
*   **Profile Resolution** — A service requesting `security-module` with the `prod`
    profile receives the merged result of `security-module.yml` and
    `security-module-prod.yml` (and `application.yml` / `application-prod.yml` shared
    files), with profile-specific values overriding shared ones.
*   **Service Discovery Integration** — Registers itself with the Eureka Server
    (`spring-cloud-starter-netflix-eureka-client`) so other services discover it by name
    rather than by hardcoded URL.
*   **Distributed Tracing** — Exports spans to Zipkin (Brave bridge) so config fetches can
    be traced end-to-end.

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Spring Boot | 4.1.0 |
| Config server | Spring Cloud Config Server | BOM-managed (Spring Cloud 2025.1.2) |
| Backend | Git (remote repository `uri`) | — |
| Service discovery | Spring Cloud Netflix Eureka Client | 5.x |
| Actuator | Spring Boot Actuator + Micrometer | BOM-managed |
| Distributed tracing | Micrometer + Zipkin (Brave bridge) | BOM-managed |
| Language | Java | 21 (LTS) |

## How It Works

`ConfigServerApplication` is annotated with `@SpringBootApplication` and
`@EnableConfigServer`:

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

`@EnableConfigServer` turns the application into a Spring Cloud Config Server. With the
`git` profile active (`spring.profiles.active: git`), the server clones/pulls the
configured remote repository and serves any property file found there as configuration
resources over HTTP. No custom controllers, repositories, or entities are involved.

When a client service starts with `spring-cloud-starter-config` on its classpath and its
`spring.application.name` set, it issues a request to the config server — by default
`http://localhost:8888` — for its configuration. The server reads the matching files from
the Git backend, merges profiles, and returns the resolved `PropertySource` set.

## Built-in Endpoints

Spring Cloud Config Server exposes these endpoints automatically (all paths are relative
to the server root, port `8888`):

| Method & Path | Description |
|--------------|-------------|
| `GET /{application}/{profile}[/{label}]` | Full configuration (all property sources) for an app + profile, optionally a Git label |
| `GET /{application}/{profile}.yml` | Merged configuration in YAML format |
| `GET /{application}/{profile}.properties` | Merged configuration in `.properties` format |
| `GET /{application}/{profile}/{path}**` | A specific file (e.g. a plaintext config file) for the app + profile |
| `POST /encrypt` / `POST /decrypt` | Server-side encryption/decryption of property values (requires a configured encrypt key) |

Where:

*   **`application`** — the `spring.application.name` of the requesting client (or
    `application` for shared files). Prefix wildcards (`*`) are supported.
*   **`profile`** — the active Spring profile of the client (comma-separated for several).
*   **`label`** — an optional Git branch/tag/commit (defaults to `main`).

Example — fetch the full configuration for `security-module` running under the `default`
profile:

```bash
curl http://localhost:8888/security-module/default
```

## Getting Started

### Prerequisites

*   **Java 21 JDK** (LTS) and **Maven 3.9.6+**.
*   Read access to the configured **Git backend repository**
    (`spring.cloud.config.server.git.uri`).
*   The **Eureka Server** should be running first so the config-server can register.

### Running the Config Server

1.  Build the parent project from the root directory:
    ```bash
    mvn clean install
    ```
2.  Navigate to the `config-server` directory and run:
    ```bash
    cd config-server
    mvn spring-boot:run
    ```

The Config Server starts on port **`8888`**. It should be started **before** the services
that fetch their config from it (see the root README's startup order: Eureka → config-server
→ security-module → api-gateway).

### Verification

*   Browse to `http://localhost:8888/security-module/default` to confirm it serves
    configuration from the Git backend.
*   Open the Eureka dashboard at [http://localhost:8761](http://localhost:8761) and confirm
    `CONFIG-SERVER` appears under registered instances.

## Configuration

### `application.yml`

```yaml
server:
  port: '8888'
spring:
  application:
    name: config-server
  profiles:
    active: git
  cloud:
    config:
      server:
        git:
          uri: https://github.com/david-eve-za/config-repository

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/

management:
  tracing:
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans
```

Key settings:

*   **`server.port`** — `8888` (the conventional Spring Cloud Config Server port).
*   **`spring.profiles.active`** — `git`; selects the Git-backed config environment.
  *   **`spring.cloud.config.server.git.uri`** — the remote Git repository containing the
      `{application}.yml` / `{application}-{profile}.yml` files. Replace this with your own
      repository to serve your own configuration.
*   **`eureka.client.service-url.defaultZone`** — the Eureka server URL to register with.
*   **`management.tracing.sampling.probability`** — `1.0` (sample 100% of traces); the
    **`management.zipkin.tracing.endpoint`** exports those spans to Zipkin at `:9411`.

> **Production hardening:** When exposing the config server beyond a trusted network, add
> an `encrypt.key` (or a keystore) for the `/encrypt`-`/decrypt` endpoints, secure the
> server with Spring Security (or sit it behind the `security-module`/api-gateway), and
> consider `spring.cloud.config.server.git.username`/`password` or deploy keys for private
> repositories.

## Planned Enhancements (Not Implemented)

The original specification for this module described additional functionality that is
**not** part of the current implementation. It is captured here as a roadmap:

*   **Database-backed configuration store** — persist configuration properties in a
    relational database (PostgreSQL for production, H2 for dev/test) using **Spring Data
    JPA**, with a simple data model (`id`, `application`, `profile`, `key`, `value`).
*   **CRUD REST API** for managing configuration properties:
    *   `GET /config/{application}/{profile}` — retrieve config for an app + profile
    *   `GET /config/{application}/{profile}/{key}` — retrieve a specific property
    *   `POST /config/{application}/{profile}` — create/replace full config
    *   `PUT /config/{application}/{profile}` — update specific properties
    *   `DELETE /config/{application}/{profile}` — delete full config
    *   `DELETE /config/{application}/{profile}/{key}` — delete a specific property
*   **Security integration** — secure the CRUD API using the `security-module` as a JWT
    resource server, with **role-based access control** (RBAC), e.g. requiring an `ADMIN`
    role for all `POST`/`PUT`/`DELETE` operations.

These would add a `config/`, `service/`, `repository/`, and `model/` package layer on top
of (or alongside) the current `@EnableConfigServer` Git backend, following the same
SOLID/port-adapter convention used in the `security-module`.
