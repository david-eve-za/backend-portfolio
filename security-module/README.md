# Security Module

This module provides robust authentication and authorization services for the backend microservices using Spring Security and JSON Web Tokens (JWTs). It acts as an OAuth2/JWT authentication server, responsible for issuing, validating, and managing JWTs.

## Role in the Architecture

The Security Module handles:
*   **User Authentication**: Verifies user credentials (username/password).
*   **JWT Generation**: Issues signed JWTs upon successful authentication.
*   **JWT Validation**: Provides functionality to validate incoming JWTs from clients or other services.
*   **Authorization**: Protects API endpoints based on authenticated user roles or permissions.

## Technologies Used

*   Spring Boot
*   Spring Security
*   JWT (jjwt library)
*   BCrypt (for secure password hashing)
*   Java 17

## Getting Started

### Running the Security Module

1.  Ensure the parent project has been built (`mvn clean install` from the root directory).
2.  Navigate to the `security-module` directory:
    ```bash
    cd security-module
    ```
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```

The Security Module will typically start on port `8080` (unless configured differently). Its API endpoints for authentication (`/auth/authenticate`) and secured resources (`/auth/user/**`) will be available.

## Configuration

The `application.properties` (or `application.yml`) in this module is crucial:
*   **`jwt.secret`**: This property stores the secret key used to sign and verify JWTs. **It is critical that this key is strong, randomly generated, and securely managed (e.g., via environment variables in production).** A placeholder is provided, but it **must** be replaced with a secure key in any deployment.
*   Spring Security configurations (e.g., filter chains, password encoders, user details service).

### Example Usage (Conceptual)

1.  **Authenticate**: Send a POST request to `/auth/authenticate` with username and password.
    *   Example Request Body: `{"username": "user", "password": "password"}` (Note: The default `UserDetailsServiceImpl` has a hardcoded user "user" with password "password" for demonstration purposes. In a real application, this would integrate with a database).
    *   The response will be a JWT.
2.  **Access Protected Resource**: Include the received JWT in the `Authorization` header of subsequent requests to protected endpoints (e.g., `/auth/user/profile`).
    *   Example Header: `Authorization: Bearer <YOUR_JWT_TOKEN>`
