# API Gateway Module

This module implements the API Gateway using **Spring Cloud Gateway Server WebFlux**
(`spring-cloud-starter-gateway-server-webflux`), the reactive edge component of the
Spring Cloud 2025.x release. It is the single, externally exposed entry point for the
microservices system: it routes client requests to downstream services discovered through
Eureka, and is the natural place to enforce cross-cutting edge concerns (auth propagation,
rate limiting, circuit breaking, logging).

## Role in the Architecture

The API Gateway is the front door of the system:

*   **Request Routing** — Forwards incoming requests to the appropriate downstream
    microservice. With `spring.cloud.gateway.discovery.locator.enabled=true` (the current
    configuration), the gateway auto-generates a route for every service registered in
    Eureka, so a service registered as `SECURITY-SERVICE` is reachable at
    `http://<gateway>/SECURITY-SERVICE/**` out of the box — no per-service route config
    required.
*   **Dynamic Routing via Service Discovery** — Routes are resolved at runtime from the
    Eureka registry, so new service instances are picked up automatically with no redeploy.
*   **Client-side Load Balancing** — Requests to a registered service name are load
    balanced across its healthy instances by the load-balancer integrated into the
    gateway client.
*   **Config Consumer** — Fetches its own configuration from the `config-server`
    (`spring-cloud-starter-config`), externalizing environment-specific properties.
*   **Edge Functions** — The reactive WebFlux foundation allows non-blocking filters for
    cross-cutting concerns such as authentication header propagation, rate limiting,
    circuit breakers, and request logging.

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Spring Boot | 4.1.0 |
| Gateway | Spring Cloud Gateway Server WebFlux | 5.x |
| Service discovery | Spring Cloud Netflix Eureka Client | 5.x |
| Config client | Spring Cloud Config Client | BOM-managed |
| Actuator | Spring Boot Actuator + Micrometer | BOM-managed |
| Distributed tracing | Micrometer + Zipkin (Brave bridge) | BOM-managed *(disabled by default — see Configuration)* |
| Language | Java | 21 (LTS) |

## How It Works

The `ApiGatewayApplication` is annotated with `@SpringBootApplication` and
`@EnableDiscoveryClient`, which registers it with Eureka and enables it to look up peer
services. The WebFlux gateway runs on Netty (non-blocking). With the discovery locator
enabled, route resolution works as follows:

1.  A client sends a request to the gateway, e.g. `GET http://localhost:8080/SECURITY-SERVICE/auth/welcome`.
2.  The gateway matches the path prefix `SECURITY-SERVICE` to a service registered in
    Eureka under that name (case-insensitive).
3.  The load balancer selects a healthy instance URI from the Eureka registry.
4.  The gateway forwards the request to that instance and streams the response back
    reactively, without blocking a thread.

Custom routes, predicates, and filters can be added declaratively under
`spring.cloud.gateway.routes` in the configuration, but are not required for basic
discovery-based routing.

## Getting Started

### Prerequisites

*   **Java 21 JDK** (LTS) and **Maven 3.9.6+**.
*   The **Eureka Server** must be running first (`eureka-server`, port `8761`) — the
    gateway depends on it for service discovery.
*   The **Config Server** (`config-server`, port `8888`) should be running if you want the
    gateway to fetch externalized config; otherwise the local `application.yml` is used.

### Running the API Gateway

1.  Build the parent project from the root directory:
    ```bash
    mvn clean install
    ```
2.  Navigate to the `api-gateway` directory and run:
    ```bash
    cd api-gateway
    mvn spring-boot:run
    ```

The gateway starts on port `8080`.

### Verification

Once running alongside Eureka, open the Eureka dashboard at
[http://localhost:8761](http://localhost:8761) and confirm `API-GATEWAY` appears under
"Instances currently registered with Eureka". You can then reach any registered service
through the gateway, e.g.:

```bash
# Reach the security-module via the gateway (service name from Eureka)
curl http://localhost:8080/SECURITY-SERVICE/auth/welcome
```

## Configuration

### `application.yml`

```yaml
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: 'true'   # auto-route to every service registered in Eureka
server:
  port: '8080'
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
management:
  tracing:
    enabled: false
    sampling:
      probability: 0.0       # distributed tracing disabled at the gateway by default
```

Key settings:

*   **`server.port`** — `8080` (the edge port clients target). Note: this is the same
    default port as `security-module`; run only one per host or override `server.port`
    when running them together.
*   **`spring.cloud.gateway.discovery.locator.enabled`** — `true`; enables automatic,
    Eureka-driven routing with no per-service route declarations.
*   **`eureka.client.service-url.defaultZone`** — the Eureka server location to register
    against and fetch the registry from.
*   **`management.tracing.enabled` / `sampling.probability`** — Zipkin tracing is
    **disabled** at the gateway (`0.0` sampling). Set `probability: 1.0` and
    `enabled: true` to export spans to Zipkin (ensure the Zipkin endpoint is configured).

### `bootstrap.yml`

```yaml
spring:
  application:
    name: api-gateway
```

Declares the application name at bootstrap time so the
`spring-cloud-starter-config` client knows **which** application's configuration to fetch
from the `config-server` (by default `http://localhost:8888`). To point the gateway at a
different config server, or disable config fetching, set `spring.cloud.config.uri` /
`spring.cloud.config.enabled` in `bootstrap.yml`.

## Upgrade Note (to Spring Boot 4.x / Spring Cloud 2025.x)

The Spring Cloud Gateway starter was **renamed** during the Spring Cloud 2025.x upgrade:

*   **Before:** `org.springframework.cloud:spring-cloud-starter-gateway`
*   **After:** `org.springframework.cloud:spring-cloud-starter-gateway-server-webflux`

The dedicated server (reactive, WebFlux) and client starter names were split out in
Spring Cloud 2025.x; the gateway server module is now the explicit
`-server-webflux` artifact. No source changes were required — only the `pom.xml`
dependency declaration.
