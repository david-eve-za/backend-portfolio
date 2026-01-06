# Backend Portfolio Project

This is a multi-module Spring Boot project designed to showcase various backend services and architectural patterns, including a Eureka Discovery Server, an API Gateway, and a Security Module for authentication and authorization using JWTs.

## Project Structure

The project is composed of the following modules:

*   **`eureka-server`**: Service Discovery using Netflix Eureka.
*   **`api-gateway`**: API Gateway implemented with Spring Cloud Gateway.
*   **`security-module`**: Handles user authentication and authorization with Spring Security and JWT.

## Technologies Used

*   Java 17
*   Spring Boot 3.x
*   Spring Cloud (Eureka, Gateway)
*   Maven
*   JWT (JSON Web Tokens)
*   BCrypt (for password encoding)
*   SonarQube (for code quality and security analysis)
*   GitHub Actions (for CI/CD)
*   Zipkin (for distributed tracing)

## Service Discovery

This project utilizes **Spring Cloud Netflix Eureka** for service registration and discovery, with a dedicated `eureka-server` module. Each microservice registers itself with Eureka, allowing other services to discover and communicate with it.

For deployments within a Kubernetes environment, **Kubernetes DNS** provides an additional layer of service discovery, enabling communication between services using their service names.

### Key Aspects:

*   **Registration & Discovery:** Microservices automatically register with the Eureka server upon startup and can discover other registered services.
*   **Health Checks:** Eureka clients leverage Spring Boot Actuator's health endpoints to report their status, ensuring only healthy instances are routed to.
*   **Load Balancing:** Client-side load balancing is implicitly handled when using Eureka-aware clients (e.g., `RestTemplate` with `@LoadBalanced` or Feign clients), distributing requests across available service instances.

## Getting Started

### Prerequisites

*   Java 17 JDK
*   Maven 3.x
*   Git
*   Docker and Docker Compose

### Distributed Tracing with Zipkin

This project uses Zipkin for distributed tracing. To start Zipkin, run the following command from the root directory:

```bash
docker-compose up -d
```

You can then access the Zipkin UI at [http://localhost:9411](http://localhost:9411).

### Building the Project

To build all modules, navigate to the root directory of the project (`backend-portfolio`) and run:

```bash
mvn clean install
```

### Running the Services

Each module is a Spring Boot application and can be run independently after building.

#### 1. Eureka Server

Navigate to the `eureka-server` directory and run:

```bash
mvn spring-boot:run
```

#### 2. Security Module

Navigate to the `security-module` directory and run:

```bash
mvn spring-boot:run
```

#### 3. API Gateway

Navigate to the `api-gateway` directory and run:

```bash
mvn spring-boot:run
```

### SonarQube Analysis

This project integrates with SonarQube for continuous code quality and security analysis via GitHub Actions.

**Configuration:**

Ensure the following GitHub Secrets are set in your repository:
*   `SONAR_TOKEN`: Your SonarQube user token.
*   `SONAR_HOST_URL`: The URL of your SonarQube instance (e.g., `https://sonarcloud.io`).
*   `SONAR_ORGANIZATION`: Your SonarQube organization key.

The SonarQube analysis will automatically run on pushes to `main` and on pull requests. The `sonar.projectKey` is configured as `backend-portfolio`.

## Contributing

Please adhere to the existing code style and conventions.
If you find any issues or have suggestions, please open an issue or a pull request.
