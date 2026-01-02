# API Gateway Module

This module implements an API Gateway using Spring Cloud Gateway. The API Gateway acts as a single entry point for all clients, routing requests to the appropriate microservices, and potentially handling cross-cutting concerns like authentication, rate limiting, and load balancing.

## Role in the Architecture

The API Gateway provides:
*   **Request Routing**: Directs incoming requests to specific downstream microservices.
*   **Load Balancing**: Distributes requests across multiple instances of a service (when integrated with a discovery service like Eureka).
*   **Security Enforcement**: Can integrate with the Security Module for authentication and authorization before forwarding requests.
*   **Edge Functions**: Can implement other features like rate limiting, circuit breakers, and logging.

## Technologies Used

*   Spring Boot
*   Spring Cloud Gateway
*   Spring Cloud Netflix Eureka Client (for service discovery)
*   Java 17

## Getting Started

### Prerequisites

*   The Eureka Server must be running.
*   The Security Module should be running (if authentication is required).

### Running the API Gateway

1.  Ensure the parent project has been built (`mvn clean install` from the root directory).
2.  Navigate to the `api-gateway` directory:
    ```bash
    cd api-gateway
    ```
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```

The API Gateway will typically start on port `8080` (default for Spring Boot apps). You can then access your microservices through the gateway's configured routes (e.g., `http://localhost:8080/service-name/api-endpoint`).

## Configuration

The `application.properties` (or `application.yml`) in this module will define the routing rules, predicates, filters, and integration with the Eureka Server.
