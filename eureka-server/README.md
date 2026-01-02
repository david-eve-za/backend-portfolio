# Eureka Server Module

This module implements a Eureka Discovery Server, which is part of the Netflix OSS stack for service discovery. It allows microservices to register themselves and discover other services in the architecture.

## Role in the Architecture

The Eureka Server is the central component for service registration and discovery. Other microservices (like the API Gateway or future services) will register with this server upon startup, making their location and status known. This enables dynamic service lookup without hardcoding service addresses.

## Technologies Used

*   Spring Boot
*   Spring Cloud Netflix Eureka Server
*   Java 17

## Getting Started

### Running the Eureka Server

1.  Ensure the parent project has been built (`mvn clean install` from the root directory).
2.  Navigate to the `eureka-server` directory:
    ```bash
    cd eureka-server
    ```
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```

The Eureka Server will typically start on port `8761` (default for Eureka). You can access its dashboard via `http://localhost:8761`.

## Configuration

The `application.properties` (or `application.yml`) in this module will contain specific configurations for the Eureka Server, such as port, hostname, and peer registration settings.
