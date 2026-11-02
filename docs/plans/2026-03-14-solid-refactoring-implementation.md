# SOLID Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactorizar el security-module aplicando principios SOLID para mejorar mantenibilidad, escalabilidad y testeabilidad.

**Architecture:** Separar configuraciones monolíticas, crear interfaces de servicio para desacoplar dependencias, implementar patrón Mapper para conversión DTO-Entity, y externalizar configuraciones hardcodeadas.

**Tech Stack:** Java 17, Spring Boot 3.1, Spring Security 6, Spring Data JPA, Lombok, JWT (jjwt), Bucket4j

---

## Task 1: Crear Interfaz UserService (ISP + DIP)

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/service/port/UserService.java`
- Modify: `security-module/src/main/java/gon/cue/security/service/UserService.java` → rename to `UserServiceImpl.java`

**Step 1: Crear interfaz UserService**
```java
package gon.cue.security.service.port;

import gon.cue.security.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    List<User> findAll();
    User save(User user);
    void deleteById(Long id);
    User updateUsername(Long id, String newUsername);
}
```

**Step 2: Renombrar UserService.java a UserServiceImpl.java**
```bash
mv security-module/src/main/java/gon/cue/security/service/UserService.java \
   security-module/src/main/java/gon/cue/security/service/adapter/UserServiceImpl.java
```

**Step 3: Modificar UserServiceImpl para implementar la interfaz**
```java
package gon.cue.security.service.adapter;

import gon.cue.security.model.User;
import gon.cue.security.repository.UserRepository;
import gon.cue.security.service.port.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User updateUsername(Long id, String newUsername) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        user.setUsername(newUsername);
        return userRepository.save(user);
    }
}
```

**Step 4: Actualizar imports en UserController**
Modificar `security-module/src/main/java/gon/cue/security/controller/UserController.java`:
- Cambiar import de `gon.cue.security.service.UserService` a `gon.cue.security.service.port.UserService`

**Step 5: Verificar compilación**
```bash
cd security-module && mvn compile -q
```
Expected: BUILD SUCCESS

**Step 6: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/service/
git commit -m "refactor: Extract UserService interface (ISP + DIP)

- Create UserService interface in service/port package
- Rename UserService to UserServiceImpl in service/adapter
- Implement interface in UserServiceImpl
- Update imports in UserController"
```

---

## Task 2: Crear Interfaz JwtService (ISP + DIP)

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/service/port/JwtService.java`
- Modify: `security-module/src/main/java/gon/cue/security/util/JwtUtil.java` → rename to `JwtServiceImpl.java`

**Step 1: Crear interfaz JwtService**
```java
package gon.cue.security.service.port;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(String username);
    boolean validateToken(String token, UserDetails userDetails);
    String extractUsername(String token);
    boolean isTokenExpired(String token);
}
```

**Step 2: Crear directorio adapter si no existe**
```bash
mkdir -p security-module/src/main/java/gon/cue/security/service/adapter
```

**Step 3: Crear JwtServiceImpl**
```java
package gon.cue.security.service.adapter;

import gon.cue.security.service.port.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expiration;

    @Override
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    @Override
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (ExpiredJwtException e) {
            return false;
        }
    }

    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @Override
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSignKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private String createToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(username)
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSignKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

**Step 4: Eliminar JwtUtil.java original**
```bash
rm security-module/src/main/java/gon/cue/security/util/JwtUtil.java
```

**Step 5: Actualizar imports en AuthController**
Modificar `AuthController.java`:
- Cambiar `import gon.cue.security.util.JwtUtil;` a `import gon.cue.security.service.port.JwtService;`
- Cambiar campo `private final JwtUtil jwtUtil;` a `private final JwtService jwtService;`
- Cambiar `jwtUtil.generateToken(...)` a `jwtService.generateToken(...)`

**Step 6: Verificar compilación**
```bash
cd security-module && mvn compile -q
```
Expected: BUILD SUCCESS

**Step 7: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/
git commit -m "refactor: Extract JwtService interface (ISP + DIP)

- Create JwtService interface in service/port package
- Create JwtServiceImpl in service/adapter
- Remove old JwtUtil class
- Update AuthController to use JwtService"
```

---

## Task 3: Crear Interfaz AuthService (ISP + DIP)

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/service/port/AuthService.java`
- Create: `security-module/src/main/java/gon/cue/security/service/adapter/AuthServiceImpl.java`

**Step 1: Crear interfaz AuthService**
```java
package gon.cue.security.service.port;

import gon.cue.security.model.AuthRequest;
import gon.cue.security.model.AuthResponse;

public interface AuthService {
    AuthResponse authenticate(AuthRequest authRequest);
}
```

**Step 2: Crear AuthServiceImpl**
```java
package gon.cue.security.service.adapter;

import gon.cue.security.model.AuthRequest;
import gon.cue.security.model.AuthResponse;
import gon.cue.security.service.port.AuthService;
import gon.cue.security.service.port.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse authenticate(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                authRequest.getUsername(),
                authRequest.getPassword()
            )
        );
        
        String token = jwtService.generateToken(authRequest.getUsername());
        return new AuthResponse(token);
    }
}
```

**Step 3: Refactorizar AuthController para usar AuthService**
```java
package gon.cue.security.controller;

import gon.cue.security.model.AuthRequest;
import gon.cue.security.model.AuthResponse;
import gon.cue.security.service.port.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to Security Module!";
    }

    @PostMapping("/authenticate")
    public AuthResponse authenticateAndGetToken(@RequestBody @Valid AuthRequest authRequest) {
        return authService.authenticate(authRequest);
    }

    @GetMapping("/user/profile")
    public String userProfile() {
        return "Welcome, authenticated user!";
    }
}
```

**Step 4: Verificar compilación**
```bash
cd security-module && mvn compile -q
```
Expected: BUILD SUCCESS

**Step 5: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/
git commit -m "refactor: Extract AuthService interface and implementation

- Create AuthService interface in service/port
- Create AuthServiceImpl with authentication logic
- Refactor AuthController to use AuthService
- Remove direct dependencies on JwtService and AuthenticationManager from controller"
```

---

## Task 4: Crear UserMapper (SRP)

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/mapper/UserMapper.java`

**Step 1: Crear UserMapper**
```java
package gon.cue.security.mapper;

import gon.cue.security.dto.UpdateUserDto;
import gon.cue.security.dto.UserDto;
import gon.cue.security.model.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(user.getId(), user.getUsername());
    }

    public List<UserDto> toDtoList(List<User> users) {
        return users.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public void updateEntity(User entity, UpdateUserDto dto) {
        if (dto != null && dto.getUsername() != null) {
            entity.setUsername(dto.getUsername());
        }
    }
}
```

**Step 2: Refactorizar UserController para usar UserMapper**
```java
package gon.cue.security.controller;

import gon.cue.security.dto.UpdateUserDto;
import gon.cue.security.dto.UserDto;
import gon.cue.security.mapper.UserMapper;
import gon.cue.security.service.port.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
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

**Step 3: Verificar compilación**
```bash
cd security-module && mvn compile -q
```
Expected: BUILD SUCCESS

**Step 4: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/
git commit -m "refactor: Extract UserMapper for DTO conversion (SRP)

- Create UserMapper component for User <-> UserDto conversion
- Remove convertToDto method from UserController
- Update UserController to use UserMapper"
```

---

## Task 5: Crear SecurityProperties (OCP)

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/config/SecurityProperties.java`

**Step 1: Crear SecurityProperties**
```java
package gon.cue.security.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {

    private CorsProperties cors = new CorsProperties();
    private RateLimitProperties rateLimit = new RateLimitProperties();
    private JwtProperties jwt = new JwtProperties();

    @Data
    public static class CorsProperties {
        private List<String> allowedOrigins = List.of("http://localhost:3000");
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS");
        private List<String> allowedHeaders = List.of("Authorization", "Content-Type", "X-XSRF-TOKEN");
        private boolean allowCredentials = true;
    }

    @Data
    public static class RateLimitProperties {
        private int capacity = 10;
        private int refillTokens = 10;
        private Duration refillDuration = Duration.ofMinutes(1);
    }

    @Data
    public static class JwtProperties {
        private String secret;
        private long expiration = 36000000;
        private String algorithm = "HS256";
    }
}
```

**Step 2: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/config/SecurityProperties.java
git commit -m "feat: Add SecurityProperties for externalized configuration (OCP)

- Create SecurityProperties with nested configuration classes
- Support for CORS, Rate Limit, and JWT configuration
- Enable runtime configuration via application.yml"
```

---

## Task 6: Separar CorsConfig (SRP)

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/config/CorsConfig.java`

**Step 1: Crear CorsConfig**
```java
package gon.cue.security.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@RequiredArgsConstructor
public class CorsConfig {

    private final SecurityProperties securityProperties;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        SecurityProperties.CorsProperties cors = securityProperties.getCors();

        configuration.setAllowedOrigins(cors.getAllowedOrigins());
        configuration.setAllowedMethods(cors.getAllowedMethods());
        configuration.setAllowedHeaders(cors.getAllowedHeaders());
        configuration.setAllowCredentials(cors.isAllowCredentials());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**Step 2: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/config/CorsConfig.java
git commit -m "refactor: Extract CorsConfig from SecurityConfig (SRP)

- Create dedicated CorsConfig class
- Use SecurityProperties for configuration
- Remove CORS configuration from SecurityConfig"
```

---

## Task 7: Separar RateLimitConfig (SRP)

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/config/RateLimitConfig.java`
- Modify: `security-module/src/main/java/gon/cue/security/config/RateLimitingFilter.java` → move to `filter/` package

**Step 1: Crear RateLimitConfig**
```java
package gon.cue.security.config;

import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@RequiredArgsConstructor
public class RateLimitConfig {

    private final SecurityProperties securityProperties;

    @Bean
    public Bucket bucket() {
        SecurityProperties.RateLimitProperties props = securityProperties.getRateLimit();
        return Bucket.builder()
            .addLimit(limit -> limit
                .capacity(props.getCapacity())
                .refillGreedy(props.getRefillTokens(), props.getRefillDuration()))
            .build();
    }
}
```

**Step 2: Crear directorio filter**
```bash
mkdir -p security-module/src/main/java/gon/cue/security/filter
```

**Step 3: Mover y actualizar RateLimitingFilter**
```java
package gon.cue.security.filter;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import java.io.IOException;

@RequiredArgsConstructor
public class RateLimitingFilter implements Filter {

    private final Bucket bucket;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            chain.doFilter(request, response);
        } else {
            HttpServletResponse httpServletResponse = (HttpServletResponse) response;
            httpServletResponse.setContentType("text/plain");
            httpServletResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpServletResponse.getWriter().append("Too many requests");
        }
    }
}
```

**Step 4: Eliminar archivo antiguo**
```bash
rm security-module/src/main/java/gon/cue/security/config/RateLimitingFilter.java
```

**Step 5: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/
git commit -m "refactor: Extract RateLimitConfig and move filter (SRP)

- Create dedicated RateLimitConfig class
- Use SecurityProperties for rate limit configuration
- Move RateLimitingFilter to filter package"
```

---

## Task 8: Separar AuthenticationConfig (SRP)

**Files:**
- Create: `security-module/src/main/java/gon/cue/security/config/AuthenticationConfig.java`

**Step 1: Crear AuthenticationConfig**
```java
package gon.cue.security.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AuthenticationConfig {

    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

**Step 2: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/config/AuthenticationConfig.java
git commit -m "refactor: Extract AuthenticationConfig from SecurityConfig (SRP)

- Create dedicated AuthenticationConfig class
- Configure PasswordEncoder, AuthenticationProvider, AuthenticationManager
- Prepare for SecurityConfig simplification"
```

---

## Task 9: Refactorizar SecurityConfig (SRP)

**Files:**
- Modify: `security-module/src/main/java/gon/cue/security/config/SecurityConfig.java`

**Step 1: Simplificar SecurityConfig**
```java
package gon.cue.security.config;

import gon.cue.security.filter.JwtAuthenticationFilter;
import gon.cue.security.filter.RateLimitingFilter;
import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final Bucket bucket;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            )
            .cors(cors -> {})
            .headers(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/authenticate").permitAll()
                .requestMatchers(HttpMethod.GET, "/auth/welcome").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(new RateLimitingFilter(bucket), UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

**Step 2: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/config/SecurityConfig.java
git commit -m "refactor: Simplify SecurityConfig (SRP)

- Remove CORS, Authentication, Rate Limit configuration
- Delegate to dedicated configuration classes
- Keep only SecurityFilterChain definition"
```

---

## Task 10: Refactorizar JwtRequestFilter a JwtAuthenticationFilter (DIP)

**Files:**
- Modify: `security-module/src/main/java/gon/cue/security/config/JwtRequestFilter.java` → move to `filter/JwtAuthenticationFilter.java`

**Step 1: Crear JwtAuthenticationFilter**
```java
package gon.cue.security.filter;

import gon.cue.security.service.port.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String token = extractToken(request);

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
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private void setAuthentication(UserDetails userDetails, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            userDetails.getAuthorities()
        );
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
```

**Step 2: Eliminar archivo antiguo**
```bash
rm security-module/src/main/java/gon/cue/security/config/JwtRequestFilter.java
```

**Step 3: Commit**
```bash
git add security-module/src/main/java/gon/cue/security/
git commit -m "refactor: Rename and improve JwtAuthenticationFilter (DIP)

- Rename JwtRequestFilter to JwtAuthenticationFilter
- Move to filter package
- Inject UserDetailsService interface instead of implementation
- Inject JwtService interface instead of JwtUtil"
```

---

## Task 11: Actualizar application.yml

**Files:**
- Modify: `security-module/src/main/resources/application.yml`

**Step 1: Actualizar application.yml**
```yaml
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

jwt:
  secret: bllRbxCOXTiYhFGAapfUb4ob3bglSuz7QJ8xUpmTV9M=
  expiration: '36000000'

spring:
  application:
    name: security-service

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

**Step 2: Commit**
```bash
git add security-module/src/main/resources/application.yml
git commit -m "feat: Update application.yml with security properties

- Add security.cors configuration
- Add security.rate-limit configuration
- Add security.jwt configuration
- Keep backward compatibility with jwt.* properties"
```

---

## Task 12: Actualizar Tests

**Files:**
- Modify: `security-module/src/test/java/gon/cue/security/service/UserServiceTest.java`
- Modify: `security-module/src/test/java/gon/cue/security/controller/UserControllerTest.java`
- Modify: `security-module/src/test/java/gon/cue/security/controller/AuthControllerTest.java`

**Step 1: Actualizar UserServiceTest**
```java
package gon.cue.security.service;

import gon.cue.security.model.User;
import gon.cue.security.repository.UserRepository;
import gon.cue.security.service.adapter.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userRepository);
    }

    @Test
    void findById_ShouldReturnUser_WhenUserExists() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<User> result = userService.findById(1L);

        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
        verify(userRepository).findById(1L);
    }

    @Test
    void findByUsername_ShouldReturnUser_WhenUserExists() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByUsername("testuser");

        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void save_ShouldReturnSavedUser() {
        User user = new User();
        user.setUsername("newuser");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("newuser");

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.save(user);

        assertNotNull(result.getId());
        assertEquals("newuser", result.getUsername());
        verify(userRepository).save(user);
    }
}
```

**Step 2: Actualizar UserControllerTest**
```java
package gon.cue.security.controller;

import gon.cue.security.dto.UpdateUserDto;
import gon.cue.security.dto.UserDto;
import gon.cue.security.mapper.UserMapper;
import gon.cue.security.model.User;
import gon.cue.security.service.port.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserMapper userMapper;

    @Test
    @WithMockUser(username = "testuser")
    void getCurrentUserProfile_ShouldReturnUser() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        UserDto userDto = new UserDto(1L, "testuser");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(userDto);

        mockMvc.perform(get("/api/users/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("testuser"));
    }
}
```

**Step 3: Ejecutar tests**
```bash
cd security-module && mvn test -q
```
Expected: Tests run, Failures: 0

**Step 4: Commit**
```bash
git add security-module/src/test/
git commit -m "test: Update tests for SOLID refactoring

- Update UserServiceTest for UserServiceImpl
- Update UserControllerTest for UserMapper
- Update imports for new package structure"
```

---

## Task 13: Verificar Compilación y Tests

**Step 1: Compilar proyecto completo**
```bash
cd security-module && mvn clean compile
```
Expected: BUILD SUCCESS

**Step 2: Ejecutar todos los tests**
```bash
cd security-module && mvn test
```
Expected: Tests run: X, Failures: 0, Errors: 0

**Step 3: Ejecutar tests de integración**
```bash
cd security-module && mvn verify
```
Expected: BUILD SUCCESS

**Step 4: Commit final**
```bash
git add .
git commit -m "chore: Verify all tests pass after SOLID refactoring

- All unit tests passing
- All integration tests passing
- Build successful"
```

---

## Task 14: Actualizar README

**Files:**
- Modify: `README.md`

**Step 1: Actualizar README con nueva arquitectura**
Agregar sección de arquitectura:

```markdown
## Architecture

### Package Structure (SOLID Principles)

The security-module follows SOLID principles with this structure:

- **config/** - Configuration classes separated by responsibility (SRP)
  - SecurityConfig - Main security filter chain
  - AuthenticationConfig - Authentication providers and password encoder
  - CorsConfig - CORS configuration
  - RateLimitConfig - Rate limiting configuration
  - SecurityProperties - Externalized configuration (OCP)

- **service/**
  - **port/** - Service interfaces (ISP, DIP)
    - UserService
    - AuthService
    - JwtService
  - **adapter/** - Service implementations
    - UserServiceImpl
    - AuthServiceImpl
    - JwtServiceImpl

- **mapper/** - DTO-Entity mapping (SRP)
  - UserMapper

- **filter/** - Security filters
  - JwtAuthenticationFilter
  - RateLimitingFilter

- **controller/** - HTTP request handlers
- **repository/** - Data access
- **model/** - JPA entities
- **dto/** - Data transfer objects
```

**Step 2: Commit**
```bash
git add README.md
git commit -m "docs: Update README with SOLID architecture

- Document package structure
- Explain SOLID principles applied
- Update architecture section"
```

---

## Summary

| Task | Principle | Description |
|------|-----------|-------------|
| 1 | ISP + DIP | Extract UserService interface |
| 2 | ISP + DIP | Extract JwtService interface |
| 3 | ISP + DIP | Extract AuthService interface |
| 4 | SRP | Create UserMapper |
| 5 | OCP | Create SecurityProperties |
| 6 | SRP | Extract CorsConfig |
| 7 | SRP | Extract RateLimitConfig |
| 8 | SRP | Extract AuthenticationConfig |
| 9 | SRP | Simplify SecurityConfig |
| 10 | DIP | Refactor JwtAuthenticationFilter |
| 11 | OCP | Update application.yml |
| 12 | - | Update tests |
| 13 | - | Verify compilation and tests |
| 14 | - | Update documentation |

---

*Plan generated for SOLID refactoring implementation*
