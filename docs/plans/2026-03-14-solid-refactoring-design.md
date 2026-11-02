# SOLID Refactoring Design - Backend Portfolio

**Fecha:** 2026-03-14  
**Autor:** AI Assistant  
**Estado:** Pendiente de aprobación

---

## 1. Resumen Ejecutivo

Este documento propone una refactorización completa del proyecto `backend-portfolio` aplicando los principios SOLID. El objetivo es mejorar la mantenibilidad, escalabilidad y testeabilidad del código.

### Alcance
- **Módulo principal:** `security-module`
- **Módulos secundarios:** Revisión arquitectónica de `api-gateway`, `eureka-server`, `config-server`

---

## 2. Análisis de Violaciones SOLID Actuales

### 2.1 Single Responsibility Principle (SRP)

| Archivo | Violación | Impacto |
|---------|-----------|---------|
| `SecurityConfig.java` | Configura CORS, CSRF, Rate Limiting, Authentication Provider, Session Management | Alta - Configuración monolítica difícil de mantener |
| `UserController.java` | Contiene método `convertToDto()` - lógica de mapeo | Media - Viola separación de responsabilidades |
| `DataInitializer.java` | Mezcla configuración con lógica de negocio (creación de usuarios/roles) | Media - Difícil de testear y extender |
| `JwtUtil.java` | Genera tokens Y valida tokens Y extrae claims | Baja - Cohesión aceptable para utilidad |

### 2.2 Open/Closed Principle (OCP)

| Ubicación | Violación | Solución Propuesta |
|-----------|-----------|-------------------|
| `SecurityConfig.java:47-51` | Rate limiting hardcodeado (10 req/min) | `RateLimitProperties` configurable |
| `SecurityConfig.java:57` | CORS origins hardcodeados | `CorsProperties` configurable |
| `DataInitializer.java:26-34` | Roles hardcodeados | `DataInitializationStrategy` |
| `JwtUtil.java:118` | Algoritmo HS256 hardcodeado | Configurable via properties |

### 2.3 Liskov Substitution Principle (LSP)

**Estado:** ✅ Sin violaciones significativas detectadas.

### 2.4 Interface Segregation Principle (ISP)

| Violación | Ubicación | Solución |
|-----------|-----------|----------|
| `UserService` sin interfaz | `service/UserService.java` | Crear interfaz `UserService` |
| `JwtUtil` es una clase concreta | `util/JwtUtil.java` | Crear interfaz `JwtService` |
| Controllers acoplados a implementaciones | `UserController`, `AuthController` | Inyectar interfaces |

### 2.5 Dependency Inversion Principle (DIP)

| Archivo | Violación | Corrección |
|---------|-----------|------------|
| `JwtRequestFilter.java:27` | Depende de `UserDetailsServiceImpl` | Depender de `UserDetailsService` (interfaz Spring) |
| `UserController.java:22` | Depende de `UserService` (clase concreta) | Crear e inyectar interfaz |
| `AuthController.java:17` | Depende de `JwtUtil` (clase concreta) | Crear interfaz `JwtService` |

---

## 3. Diseño Propuesto

### 3.1 Nueva Estructura de Paquetes

```
security-module/src/main/java/gon/cue/security/
│
├── config/                          # Configuraciones separadas (SRP)
│   ├── SecurityConfig.java          # Filtro chain principal
│   ├── AuthenticationConfig.java    # AuthenticationProvider, PasswordEncoder
│   ├── CorsConfig.java              # CORS configuration bean
│   ├── RateLimitConfig.java         # Rate limiting beans
│   ├── JwtConfig.java               # JWT properties
│   └── SecurityProperties.java      # Properties unificadas
│
├── controller/                       # Solo manejo HTTP
│   ├── AuthController.java
│   └── UserController.java
│
├── service/
│   ├── port/                        # Interfaces/Contratos (ISP, DIP)
│   │   ├── UserService.java
│   │   ├── AuthService.java
│   │   └── JwtService.java
│   │
│   └── adapter/                     # Implementaciones
│       ├── UserServiceImpl.java
│       ├── AuthServiceImpl.java
│       ├── JwtServiceImpl.java
│       └── UserDetailsServiceImpl.java
│
├── mapper/                          # Conversión DTO-Entity (SRP)
│   └── UserMapper.java
│
├── filter/                          # Filtros separados
│   ├── JwtAuthenticationFilter.java
│   └── RateLimitingFilter.java
│
├── model/                           # Entities
├── dto/                             # DTOs
├── repository/                      # Repositories
└── initialization/                  # Inicialización de datos
    ├── DataInitializer.java
    └── DefaultDataLoader.java
```

### 3.2 Interfaces de Servicio (ISP + DIP)

```java
// service/port/UserService.java
public interface UserService {
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    List<User> findAll();
    User save(User user);
    void deleteById(Long id);
    User updateUsername(Long id, String newUsername);
}

// service/port/AuthService.java
public interface AuthService {
    AuthResponse authenticate(AuthRequest request);
}

// service/port/JwtService.java
public interface JwtService {
    String generateToken(String username);
    boolean validateToken(String token, UserDetails userDetails);
    String extractUsername(String token);
    boolean isTokenExpired(String token);
}
```

### 3.3 Configuraciones Separadas (SRP + OCP)

```java
// config/SecurityProperties.java
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {
    private CorsProperties cors = new CorsProperties();
    private RateLimitProperties rateLimit = new RateLimitProperties();
    private JwtProperties jwt = new JwtProperties();
    
    // Inner classes para cada configuración
    public static class CorsProperties {
        private List<String> allowedOrigins = List.of("http://localhost:3000");
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE");
        private List<String> allowedHeaders = List.of("Authorization", "Content-Type");
        private boolean allowCredentials = true;
    }
    
    public static class RateLimitProperties {
        private int capacity = 10;
        private int refillTokens = 10;
        private Duration refillDuration = Duration.ofMinutes(1);
    }
    
    public static class JwtProperties {
        private String secret;
        private long expiration = 36000000;
        private String algorithm = "HS256";
    }
}
```

```java
// config/CorsConfig.java
@Configuration
public class CorsConfig {
    
    private final SecurityProperties securityProperties;
    
    public CorsConfig(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        SecurityProperties.CorsProperties cors = securityProperties.getCors();
        
        config.setAllowedOrigins(cors.getAllowedOrigins());
        config.setAllowedMethods(cors.getAllowedMethods());
        config.setAllowedHeaders(cors.getAllowedHeaders());
        config.setAllowCredentials(cors.isAllowCredentials());
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### 3.4 Mapper Separado (SRP)

```java
// mapper/UserMapper.java
@Component
public class UserMapper {
    
    public UserDto toDto(User user) {
        if (user == null) return null;
        return new UserDto(user.getId(), user.getUsername());
    }
    
    public List<UserDto> toDtoList(List<User> users) {
        return users.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
    
    public User toEntity(UserDto dto) {
        if (dto == null) return null;
        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        return user;
    }
    
    public void updateEntity(User entity, UpdateUserDto dto) {
        if (dto.getUsername() != null) {
            entity.setUsername(dto.getUsername());
        }
    }
}
```

### 3.5 Filtro Refactorizado (DIP)

```java
// filter/JwtAuthenticationFilter.java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final UserDetailsService userDetailsService;  // Interfaz, no implementación
    private final JwtService jwtService;                   // Nueva interfaz
    
    public JwtAuthenticationFilter(
            UserDetailsService userDetailsService,
            JwtService jwtService) {
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain) throws ServletException, IOException {
        
        String token = extractToken(request);
        
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            if (jwtService.validateToken(token, userDetails)) {
                setAuthentication(userDetails, request);
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
    
    private void setAuthentication(UserDetails userDetails, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken = 
            new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
```

### 3.6 Controller Refactorizado (SRP + DIP)

```java
// controller/UserController.java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;  // Interfaz
    private final UserMapper userMapper;    // Mapper separado
    
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return userService.findByUsername(userDetails.getUsername())
            .map(userMapper::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UpdateUserDto updateUserDto) {
        return userService.findByUsername(userDetails.getUsername())
            .map(user -> {
                userMapper.updateEntity(user, updateUserDto);
                return userService.save(user);
            })
            .map(userMapper::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserProfileById(@PathVariable Long id) {
        return userService.findById(id)
            .map(userMapper::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(
            userMapper.toDtoList(userService.findAll())
        );
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 4. Archivos de Configuración

### 4.1 application.yml Actualizado

```yaml
# security-module/src/main/resources/application.yml
security:
  cors:
    allowed-origins:
      - http://localhost:3000
      - http://localhost:8080
    allowed-methods:
      - GET
      - POST
      - PUT
      - DELETE
      - OPTIONS
    allowed-headers:
      - Authorization
      - Content-Type
      - X-XSRF-TOKEN
    allow-credentials: true
  
  rate-limit:
    capacity: 10
    refill-tokens: 10
    refill-duration: 1m
  
  jwt:
    secret: bllRbxCOXTiYhFGAapfUb4ob3bglSuz7QJ8xUpmTV9M=
    expiration: 36000000
    algorithm: HS256

spring:
  application:
    name: security-service
  config:
    import: optional:configserver:http://localhost:8888

management:
  tracing:
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

---

## 5. Plan de Implementación

### Fase 1: Crear Interfaces (ISP + DIP)
1. Crear `service/port/UserService.java`
2. Crear `service/port/AuthService.java`
3. Crear `service/port/JwtService.java`
4. Renombrar `UserService.java` a `UserServiceImpl.java` e implementar interfaz

### Fase 2: Separar Configuraciones (SRP)
1. Crear `SecurityProperties.java`
2. Crear `CorsConfig.java`
3. Crear `RateLimitConfig.java`
4. Crear `AuthenticationConfig.java`
5. Simplificar `SecurityConfig.java`

### Fase 3: Crear Mapper (SRP)
1. Crear `mapper/UserMapper.java`
2. Refactorizar `UserController.java` para usar mapper

### Fase 4: Refactorizar Filtros (DIP)
1. Renombrar `JwtRequestFilter.java` a `JwtAuthenticationFilter.java`
2. Inyectar interfaces en lugar de implementaciones

### Fase 5: Refactorizar Controllers (DIP)
1. Actualizar `AuthController.java` para usar `AuthService` y `JwtService`
2. Actualizar `UserController.java` para usar interfaces

### Fase 6: Separar Inicialización
1. Crear `initialization/DefaultDataLoader.java`
2. Refactorizar `DataInitializer.java`

---

## 6. Beneficios Esperados

| Principio | Beneficio |
|-----------|-----------|
| SRP | Código más mantenible, cada clase tiene una razón para cambiar |
| OCP | Fácil agregar nuevas configuraciones sin modificar código existente |
| LSP | Comportamiento consistente en jerarquías de clases |
| ISP | Interfaces específicas, clientes no dependen de métodos que no usan |
| DIP | Código desacoplado, fácil de testear con mocks |

---

## 7. Pruebas Requeridas

- [ ] Tests unitarios para cada servicio implementando interfaces
- [ ] Tests de integración para controllers refactorizados
- [ ] Tests de configuración para properties
- [ ] Verificar que todas las pruebas existentes pasan después de refactorización

---

## 8. Riesgos y Mitigación

| Riesgo | Mitigación |
|--------|------------|
| Romper funcionalidad existente | Ejecutar tests antes/después de cada cambio |
| Configuración incorrecta | Usar valores por defecto en properties |
| Inyección de dependencias incorrecta | Verificar contexto de Spring en cada refactorización |

---

## 9. Aprobación

**Este diseño ha sido aprobado para implementación.**

- [ ] Diseño aprobado
- [ ] Listo para crear plan de implementación

---

*Documento generado automáticamente. Revisar antes de proceder con la implementación.*
