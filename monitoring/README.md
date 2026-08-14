# Monitoring Service

This directory contains the observability stack for the backend portfolio project —
**Grafana**, **Prometheus**, and **Loki** orchestrated via Docker Compose, plus
**node_exporter** for host metrics. It collects and visualizes metrics and logs from the
Spring Boot microservices (Spring Boot 4.1.0 / Java 21) which expose
`/actuator/prometheus`.

> **Scope:** This stack is independent of the Spring Boot modules — it runs entirely in
> Docker. The microservices themselves must expose a `/actuator/prometheus` endpoint (see
> **Wiring Spring Boot apps** below) to appear as scrape targets here.

## Stack Components

| Component | Image | Port | Role |
|-----------|-------|------|------|
| Prometheus | `prom/prometheus:latest` | `9090` | Metrics scraping & storage |
| node_exporter | `prom/node-exporter:latest` | `9100` | Host-level (machine) metrics |
| Loki | `grafana/loki:latest` | `3100` | Log aggregation |
| Grafana | `grafana/grafana:latest` | `3000` | Dashboards & visualization (UI on top of Prometheus + Loki) |

Docker volumes (`prometheus_data`, `loki_data`, `grafana_data`) persist each component's
data across restarts.

## How to Use

1.  **Start the stack:**
    ```bash
    docker-compose up -d
    ```

2.  **Access the services:**
    *   **Grafana:** [http://localhost:3000](http://localhost:3000) (user `admin`, password `admin`)
    *   **Prometheus:** [http://localhost:9090](http://localhost:9090)
    *   **Loki:** [http://localhost:3100](http://localhost:3100)

3.  **Stop the stack:**
    ```bash
    docker-compose down
    ```

## Dashboards

A default dashboard for system metrics is provisioned automatically. You can create more
dashboards in the Grafana UI. Grafana is pre-configured with Prometheus and Loki as data
sources so that metrics and logs can be queried and correlated on the same panels.

## Prometheus Scrape Targets

Defined in `prometheus/prometheus.yml`:

| Job name | Scrape target | Metrics path |
|----------|---------------|--------------|
| `prometheus` | `localhost:9090` | (self) |
| `node_exporter` | `node_exporter:9100` | (host metrics) |
| `api-gateway` | `host.docker.internal:8080` | `/actuator/prometheus` |
| `security-module` | `host.docker.internal:8081` | `/actuator/prometheus` |
| `eureka-server` | `host.docker.internal:8761` | `/actuator/prometheus` |

The microservices are reached from inside the Docker network via `host.docker.internal`,
so the Spring Boot apps must be running on the host on their configured ports for
Prometheus to scrape them.

> **Port note:** The `security-module` scrape target uses port `8081` (see
> `prometheus.yml`), distinct from the `api-gateway` which uses `8080`. If you launch
> `security-module` on a different port, update this target accordingly.

## Wiring Spring Boot Apps

To get application metrics from a Spring Boot 4.x service, it must expose the
`/actuator/prometheus` endpoint. Add these to the service's `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

And add the following to the service's `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "prometheus"
```

Every module in this project (`eureka-server`, `api-gateway`, `security-module`,
`config-server`) already includes `spring-boot-starter-actuator` and the Micrometer Brave
tracing bridge; add the `micrometer-registry-prometheus` dependency and the
`management.endpoints` exposure above to make its metrics visible in Prometheus.

## Security

The default Grafana admin user and password are `admin`/`admin`. It is **highly
recommended** to change these in any non-local environment. You can configure Grafana to
use other authentication providers like OAuth or LDAP by editing the `grafana.ini` file.
For more information, see the
[Grafana documentation](https://grafana.com/docs/grafana/latest/auth/).

## Deployment

The deployment is automated using Docker Compose. You can integrate this into a CI/CD
pipeline by running `docker-compose up -d` in a deployment script.

## Maintenance

### Backup

The data for Grafana, Prometheus, and Loki is stored in Docker volumes. You can back up
these volumes by stopping the containers and copying the volume data to a safe location.

### Update

To update the services, pull the latest Docker images and restart the containers:

```bash
docker-compose pull
docker-compose up -d
```

It is recommended to back up the data before updating.
