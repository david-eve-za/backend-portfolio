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

## Getting Started

### Prerequisites

*   Java 17 JDK
*   Maven 3.x
*   Git

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
