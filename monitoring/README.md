# Monitoring Service

This directory contains the configuration for a monitoring service using Grafana, Prometheus, and Loki.

## How to Use

1.  **Start the service:**
    ```bash
    docker-compose up -d
    ```

2.  **Access the services:**
    *   **Grafana:** [http://localhost:3000](http://localhost:3000) (user: `admin`, password: `admin`)
    *   **Prometheus:** [http://localhost:9090](http://localhost:9090)
    *   **Loki:** [http://localhost:3100](http://localhost:3100)

## Dashboards

A default dashboard for system metrics is provisioned automatically. You can create more dashboards in the Grafana UI.

To get application metrics, you need to expose a `/actuator/prometheus` endpoint in your Spring Boot applications. This can be done by adding the following dependency to your `pom.xml`:

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

And adding the following to your `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "prometheus"
```

## Security

The default Grafana admin user and password are `admin`/`admin`. It is **highly recommended** to change this in a production environment.

You can configure Grafana to use other authentication providers like OAuth or LDAP by editing the `grafana.ini` file. For more information, see the [Grafana documentation](https://grafana.com/docs/grafana/latest/auth/).

## Deployment

The deployment is automated using Docker Compose. You can integrate this into your CI/CD pipeline by running `docker-compose up -d` in a deployment script.

## Maintenance

### Backup

The data for Grafana, Prometheus, and Loki is stored in Docker volumes. You can back up these volumes by stopping the containers and copying the volume data to a safe location.

### Update

To update the services, you can pull the latest Docker images and restart the containers:

```bash
docker-compose pull
docker-compose up -d
```

It is recommended to back up the data before updating.
