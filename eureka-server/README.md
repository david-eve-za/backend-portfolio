# Eureka Server Module

This module implements a Eureka Discovery Server (Spring Cloud Netflix Eureka 5.x), the
central registry for service registration and discovery in the architecture. Microservices
register with this server on startup, making their location and status known so others can
look them up dynamically — no hardcoded addresses.

## Role in the Architecture

The Eureka Server is the central component for service registration and discovery. Other
microservices (the API Gateway, Security Module, Config Server, and future services)
register with this server upon startup, enabling dynamic service lookup without hardcoding
service addresses. Client-side load balancing distributes requests across registered
instances.

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Spring Boot | 4.1.0 |
| Service Discovery | Spring Cloud Netflix Eureka Server | 5.x |
| Distributed tracing | Micrometer + Zipkin (Brave bridge) | BOM-managed |
| Actuator | Spring Boot Actuator | BOM-managed |
| Language | Java | 21 (LTS) |

## Getting Started

### Running the Eureka Server

**Start this module first** — other services depend on it for registration.

1.  Ensure the parent project has been built (`mvn clean install` from the root directory).
2.  Navigate to the `eureka-server` directory:
    ```bash
    cd eureka-server
    ```
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```

The Eureka Server starts on port `8761` (the Eureka default). Access its dashboard at
[http://localhost:8761](http://localhost:8761) to see registered services and their status.

## Configuration

The `application.yml` in this module contains key Eureka settings:

*   **`server.port`** — `8761` (Eureka default).
*   **`eureka.client.register-with-eureka`** — `false` (standalone server; it does not
    register with itself).
*   **`eureka.client.fetch-registry`** — `false` (standalone server; no need to fetch the
    registry).
*   **`spring.cloud.config.enabled`** — `false` (this server does not fetch config from the
    config-server, breaking a startup-order dependency).

### Verifying Registration

Once the Eureka Server is running and other services are started, open the dashboard at
[http://localhost:8761](http://localhost:8761). Registered instances (`SECURITY-SERVICE`,
`API-GATEWAY`, `CONFIG-SERVER`) appear under "Instances currently registered with Eureka."
