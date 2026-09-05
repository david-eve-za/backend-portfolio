# Plan: Fix Frontend-Service Filter Registration

## Objetivo
Registrar correctamente `ApiProxyFilter` en frontend-service para que quite el header `Authorization` en endpoints públicos (`/api/auth/authenticate`) y evite el error 403 en login.

## Contexto
- Login funciona via gateway (8080) pero falla en frontend-service directo (8083)
- Error: 403 en POST `/api/auth/authenticate` porque el navegador envía `Authorization: Bearer <old_token>`
- `ApiProxyFilter` ya implementado y compila, pero **NO se registra** en Spring

## Root Cause
El `@Configuration` class `FilterRegistrationConfig` no se carga. Spring Boot no detecta `@Configuration` via `@ComponentScan` ni `@Import` en este proyecto.

## Plan de Acción

### Paso 1: Registrar filtro via WebApplicationInitializer (PRIORIDAD ALTA)
```java
// En FrontendServiceApplication o clase dedicada
public class FilterInitializer implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext servletContext) {
        FilterRegistration dynamic = servletContext.addFilter("apiProxyFilter", new ApiProxyFilter());
        dynamic.addMappingForUrlPatterns(
            EnumSet.of(DispatcherType.REQUEST, DispatcherType.ASYNC, DispatcherType.ERROR),
            true,
            "/api/*"
        );
    }
}
```
Registrar como `@Bean` o via `META-INF/services`.

### Paso 2: Verificar registro en logs
Buscar: "apiProxyFilter registered" o "FilterRegistrationBean created"

### Paso 3: Test login end-to-end
- `curl -X POST http://localhost:8083/api/auth/authenticate` → 200
- Chrome-devtools login en `http://localhost:8083/login` → éxito

### Paso 4: Commit y documentar
- Commit con mensaje descriptivo
- Actualizar AGENTS.md si hay convención nueva

## Criterios de Aceptación
- [ ] Log aparece: "apiProxyFilter registered" al iniciar
- [ ] POST `/api/auth/authenticate` retorna 200 sin header Authorization
- [ ] Login en `http://localhost:8083/login` navega a `/collections`
- [ ] Tests pasan: `mvn test`

## Archivos Clave
- `frontend-service/src/main/java/gon/cue/frontendservice/config/ApiProxyFilter.java`
- `frontend-service/src/main/java/gon/cue/frontendservice/config/FilterRegistrationConfig.java`
- `frontend-service/src/main/java/gon/cue/frontendservice/FrontendServiceApplication.java`

## Riesgo
Si `WebApplicationInitializer` tampoco funciona, fallback: registrar filtro manualmente en `web.xml` (no recomendado) o usar `ServletContextInitializer` como bean explícito.