# Config Server Module

This document outlines the requirements for the new `config-server` module.

## 1. Overview

The `config-server` module will be responsible for managing and serving configuration data to other microservices in the system. It will provide a centralized way to manage configuration properties for all environments (development, staging, production).

## 2. Requirements

### 2.1. API Endpoints (CRUD Operations)

The `config-server` will expose a REST API for managing configuration properties. The following endpoints should be implemented:

*   **`GET /config/{application}/{profile}`**: Retrieve the configuration for a specific application and profile (e.g., `development`, `production`).
*   **`GET /config/{application}/{profile}/{key}`**: Retrieve a specific configuration property for an application and profile.
*   **`POST /config/{application}/{profile}`**: Create or update the entire configuration for an application and profile. The request body will contain the configuration properties in JSON format.
*   **`PUT /config/{application}/{profile}`**: Update specific configuration properties for an application and profile. The request body will contain the properties to be updated.
*   **`DELETE /config/{application}/{profile}`**: Delete the entire configuration for an application and profile.
*   **`DELETE /config/{application}/{profile}/{key}`**: Delete a specific configuration property.

### 2.2. Data Persistence Strategy

The configuration data needs to be persisted in a database. The following should be considered:

*   **Database:** A relational database like PostgreSQL or MySQL is recommended for production. For development and testing, an in-memory database like H2 can be used.
*   **Data Model:** A simple data model is required to store the configuration properties. A table with columns like `id`, `application`, `profile`, `key`, and `value` would be sufficient.
*   **Spring Data JPA:** Spring Data JPA should be used to interact with the database.

### 2.3. Security Protocols

The `config-server` API must be secured to prevent unauthorized access. The following security protocols should be implemented:

*   **Authentication:** All requests to the `config-server` API must be authenticated. The existing `security-module` should be used to secure the endpoints. This means the `config-server` will be a resource server.
*   **Authorization:** Only authorized users or services should be able to modify the configuration. Role-based access control (RBAC) should be implemented. For example, an `ADMIN` role could be required for all `POST`, `PUT`, and `DELETE` operations.

### 2.4. Integration Points

The `config-server` will integrate with other modules in the system:

*   **Microservices:** All microservices (e.g., `api-gateway`, `security-module`, etc.) will fetch their configuration from the `config-server` on startup. They will need to be configured to connect to the `config-server`.
*   **Eureka Server:** The `config-server` should register itself with the `eureka-server` to be discoverable by other services.
*   **API Gateway:** The `api-gateway` will route requests to the `config-server`. The gateway should be configured with the appropriate routes.

## 3. Technology Stack

*   **Language:** Java 17
*   **Framework:** Spring Boot
*   **Database:** PostgreSQL (production), H2 (development/testing)
*   **Build Tool:** Maven
*   **Security:** Spring Security with JWT (from `security-module`)
*   **Service Discovery:** Eureka
