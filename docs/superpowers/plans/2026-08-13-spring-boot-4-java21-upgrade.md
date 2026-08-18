# Spring Boot 4.x + Java 21 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade a Spring Boot microservices project from Spring Boot 3.1.0 to 4.1.0, Spring Cloud 2022.0.3 to 2025.1.2, and Java 17 to 21 across 4 modules (eureka-server, api-gateway, security-module, config-server) plus parent POM.

**Architecture:** Multi-module Maven project with parent POM managing dependency versions. Each service module inherits from parent and declares its own dependencies. Upgrade will be done bottom-up: parent POM first, then each module's POM, then source code fixes for javax→jakarta migration and deprecated API removal.

**Tech Stack:** Spring Boot 4.1.0, Spring Cloud 2025.1.2, Java 21, Maven 3.9+, Lombok 1.18.46, jjwt 0.13.0, Nimbus JOSE+JWT 10.9.1, Bucket4j JDK17 artifacts.

## Global Constraints

- **Java Version:** 21 (LTS) - REQUIRED
- **Spring Boot:** 4.1.0 - REQUIRED
- **Spring Cloud:** 2025.1.2 - REQUIRED
- **Maven:** 3.9.6+ - REQUIRED
- **Jakarta EE:** 11 baseline (Servlet 6.1) - ALL javax.* → jakarta.* migrations mandatory
- **No new dependencies** unless required for migration
- **Single commit per module** - clean history
- **All tests must pass** before marking task complete

---

### Task 1: Update Parent POM (pom.xml) - Version Properties & Dependency Management

**Files:**
- Modify: `pom.xml:1-84`

**Interfaces:**
- Produces: Version properties used by all child modules (`spring-boot.version`, `spring-cloud.version`, `java.version`, `lombok.version`, `jjwt.version`, `nimbus-jwt.version`, `bucket4j.version`, `maven-compiler-plugin.version`, `jacoco.version`)

- [ ] **Step 1: Update version properties**

```xml
<properties>
  <spring-boot.version>4.1.0</spring-boot.version>
  <spring-cloud.version>2025.1.2</spring-cloud.version>
  <java.version>21</java.version>
  <maven.compiler.source>21</maven.compiler.source>
  <maven.compiler.target>21</maven.compiler.target>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
  <lombok.version>1.18.46</lombok.version>
  <jjwt.version>0.13.0</jjwt.version>
  <nimbus-jwt.version>10.9.1</nimbus-jwt.version>
  <bucket4j.version>8.14.0</bucket4j.version>
  <maven-compiler-plugin.version>3.15.0</maven-compiler-plugin.version>
  <jacoco.version>0.8.15</jacoco.version>
  <sonar.projectKey>backend-portfolio</sonar.projectKey>
</properties>
```

- [ ] **Step 2: Update dependencyManagement with new BOMs**

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-parent</artifactId>
      <version>${spring-boot.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>${spring-cloud.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <version>${lombok.version}</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-bom</artifactId>
      <version>${jjwt.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

- [ ] **Step 3: Update plugin versions**

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>${maven-compiler-plugin.version}</version>
      <configuration>
        <release>${java.version}</release>
        <parameters>true</parameters>
      </configuration>
    </plugin>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>${jacoco.version}</version>
      <executions>
        <execution>
          <id>prepare-agent</id>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
        </execution>
        <execution>
          <id>report</id>
          <goals>
            <goal>report</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

- [ ] **Step 4: Verify parent POM compiles**

Run: `mvn validate -f pom.xml`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit parent POM**

```bash
git add pom.xml
git commit -m "chore: upgrade parent POM to Spring Boot 4.1.0, Spring Cloud 2025.1.2, Java 21"
```

---

### Task 2: Update eureka-server/pom.xml

**Files:**
- Modify: `eureka-server/pom.xml:1-55`

**Interfaces:**
- Consumes: Parent POM version properties
- Produces: Updated module POM ready for compilation

- [ ] **Step 1: Verify current dependencies (no version changes needed - inherited)**

```xml
<!-- All dependencies managed by parent - just verify structure -->
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
  </dependency>
  <dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
  </dependency>
  <dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

- [ ] **Step 2: Update spring-boot-maven-plugin (uses parent property)**

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <version>${spring-boot.version}</version>
    </plugin>
  </plugins>
</build>
```

- [ ] **Step 3: Compile module**

Run: `mvn clean compile -pl eureka-server -am`
Expected: BUILD SUCCESS (or source code errors to fix in later tasks)

- [ ] **Step 4: Commit**

```bash
git add eureka-server/pom.xml
git commit -m "chore: update eureka-server POM for Spring Boot 4.x"
```

---

### Task 3: Update api-gateway/pom.xml

**Files:**
- Modify: `api-gateway/pom.xml:1-59`

**Interfaces:**
- Consumes: Parent POM version properties
- Produces: Updated module POM

- [ ] **Step 1: Verify dependencies (inherited versions)**

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
  </dependency>
  <dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
  </dependency>
  <dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

- [ ] **Step 2: Update plugin version**

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <version>${spring-boot.version}</version>
    </plugin>
  </plugins>
</build>
```

- [ ] **Step 3: Compile module**

Run: `mvn clean compile -pl api-gateway -am`
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```bash
git add api-gateway/pom.xml
git commit -m "chore: update api-gateway POM for Spring Boot 4.x"
```

---

### Task 4: Update config-server/pom.xml

**Files:**
- Modify: `config-server/pom.xml:1-53`

**Interfaces:**
- Consumes: Parent POM version properties
- Produces: Updated module POM

- [ ] **Step 1: Verify dependencies**

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>
  <dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
  </dependency>
  <dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

- [ ] **Step 2: Update plugin**

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <version>${spring-boot.version}</version>
    </plugin>
  </plugins>
</build>
```

- [ ] **Step 3: Compile module**

Run: `mvn clean compile -pl config-server -am`
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```bash
git add config-server/pom.xml
git commit -m "chore: update config-server POM for Spring Boot 4.x"
```

---

### Task 5: Update security-module/pom.xml - Dependency Versions & Artifact Names

**Files:**
- Modify: `security-module/pom.xml:1-137`

**Interfaces:**
- Consumes: Parent POM version properties (jjwt.version, nimbus-jwt.version, bucket4j.version)
- Produces: Updated module POM with correct artifact names for bucket4j

- [ ] **Step 1: Update properties section**

```xml
<properties>
  <jjwt.version>0.13.0</jjwt.version>
  <nimbus-jwt.version>10.9.1</nimbus-jwt.version>
  <bucket4j.version>8.14.0</bucket4j.version>
</properties>
```

- [ ] **Step 2: Update jjwt dependencies (already correct structure, just version)**

```xml
<!-- JWT Libraries - already using correct multi-artifact structure -->
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-api</artifactId>
  <version>${jjwt.version}</version>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-impl</artifactId>
  <version>${jjwt.version}</version>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-jackson</artifactId>
  <version>${jjwt.version}</version>
  <scope>runtime</scope>
</dependency>
```

- [ ] **Step 3: Update nimbus-jose-jwt version**

```xml
<dependency>
  <groupId>com.nimbusds</groupId>
  <artifactId>nimbus-jose-jwt</artifactId>
  <version>${nimbus-jwt.version}</version>
</dependency>
```

- [ ] **Step 4: FIX bucket4j artifact names (BREAKING CHANGE)**

```xml
<!-- Rate limiting - NEW artifact names for JDK 21 (using JDK 17 artifacts compatible with 21) -->
<dependency>
  <groupId>com.bucket4j</groupId>
  <artifactId>bucket4j_jdk17-core</artifactId>
  <version>${bucket4j.version}</version>
</dependency>
<dependency>
  <groupId>com.bucket4j</groupId>
  <artifactId>bucket4j_jdk17-jcache</artifactId>
  <version>${bucket4j.version}</version>
</dependency>
<dependency>
  <groupId>javax.cache</groupId>
  <artifactId>cache-api</artifactId>
  <version>1.1.1</version>
</dependency>
```

- [ ] **Step 5: Update plugin configuration**

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <version>${spring-boot.version}</version>
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <annotationProcessorPaths>
          <path>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
          </path>
        </annotationProcessorPaths>
      </configuration>
    </plugin>
  </plugins>
</build>
```

- [ ] **Step 6: Compile module**

Run: `mvn clean compile -pl security-module -am`
Expected: BUILD SUCCESS (may need source code fixes in next tasks)

- [ ] **Step 7: Commit**

```bash
git add security-module/pom.xml
git commit -m "chore: update security-module POM for Spring Boot 4.x, fix bucket4j artifacts"
```

---

### Task 6: Fix javax → jakarta namespace in security-module source code

**Files:**
- Search: `security-module/src/main/java/**/*.java`
- Modify: All files with javax imports

**Interfaces:**
- Consumes: Updated POM with jakarta dependencies
- Produces: Compilable source code

- [ ] **Step 1: Search for javax imports**

Run: `grep -r "import javax\." security-module/src/main/java/`
Expected: List of files requiring migration

- [ ] **Step 2: Fix common javax → jakarta mappings**

```bash
# javax.persistence → jakarta.persistence
# javax.validation → jakarta.validation
# javax.cache → jakarta.cache (if using jakarta.cache-api)
# javax.servlet → jakarta.servlet
# javax.annotation → jakarta.annotation
```

- [ ] **Step 3: Update cache-api dependency to jakarta equivalent (if needed)**

```xml
<!-- If cache-api is actively used with javax.cache annotations -->
<!-- Replace javax.cache:cache-api with jakarta.cache:jakarta.cache-api OR keep javax.cache if bucket4j_jdk17-jcache compatible -->
```

- [ ] **Step 4: Compile and verify**

Run: `mvn clean compile -pl security-module -am`
Expected: BUILD SUCCESS

- [ ] **Step 5: Run tests**

Run: `mvn test -pl security-module`
Expected: Tests PASS

- [ ] **Step 6: Commit**

```bash
git add security-module/src/
git commit -m "fix: migrate javax to jakarta namespace in security-module"
```

---

### Task 7: Fix javax → jakarta namespace in eureka-server source code

**Files:**
- Search: `eureka-server/src/main/java/**/*.java`
- Modify: All files with javax imports

- [ ] **Step 1: Search for javax imports**

Run: `grep -r "import javax\." eureka-server/src/main/java/`

- [ ] **Step 2: Fix imports**

Apply same javax → jakarta mappings as Task 6

- [ ] **Step 3: Compile and test**

Run: `mvn clean compile test -pl eureka-server -am`
Expected: BUILD SUCCESS, Tests PASS

- [ ] **Step 4: Commit**

```bash
git add eureka-server/src/
git commit -m "fix: migrate javax to jakarta namespace in eureka-server"
```

---

### Task 8: Fix javax → jakarta namespace in api-gateway source code

**Files:**
- Search: `api-gateway/src/main/java/**/*.java`
- Modify: All files with javax imports

- [ ] **Step 1: Search for javax imports**

Run: `grep -r "import javax\." api-gateway/src/main/java/`

- [ ] **Step 2: Fix imports + Spring Cloud Gateway 5.x API changes**

```java
// Spring Cloud Gateway 5.x changes:
// - RouteLocatorBuilder API may have changed
// - GatewayFilter factories may have moved packages
// - Check Spring Cloud Gateway 5.x migration guide
```

- [ ] **Step 3: Compile and test**

Run: `mvn clean compile test -pl api-gateway -am`
Expected: BUILD SUCCESS, Tests PASS

- [ ] **Step 4: Commit**

```bash
git add api-gateway/src/
git commit -m "fix: migrate javax to jakarta namespace in api-gateway, update Gateway 5.x APIs"
```

---

### Task 9: Fix javax → jakarta namespace in config-server source code

**Files:**
- Search: `config-server/src/main/java/**/*.java`
- Modify: All files with javax imports

- [ ] **Step 1: Search for javax imports**

Run: `grep -r "import javax\." config-server/src/main/java/`

- [ ] **Step 2: Fix imports**

Apply same javax → jakarta mappings

- [ ] **Step 3: Compile and test**

Run: `mvn clean compile test -pl config-server -am`
Expected: BUILD SUCCESS, Tests PASS

- [ ] **Step 4: Commit**

```bash
git add config-server/src/
git commit -m "fix: migrate javax to jakarta namespace in config-server"
```

---

### Task 10: Fix Spring Boot 4.x deprecated API removals across all modules

**Files:**
- Search: All modules `**/src/main/java/**/*.java`
- Modify: Code using deprecated APIs removed in Spring Boot 4.x

**Interfaces:**
- Consumes: Compiled modules from Tasks 6-9
- Produces: Fully compilable project

- [ ] **Step 1: Check Spring Boot 4.0 migration guide for removed APIs**

Key areas to check:
- `WebMvcConfigurer` methods removed
- `@Enable*` annotations changes
- Property name changes (e.g., `spring.main.allow-bean-definition-overriding`)
- `SpringApplicationBuilder` changes
- `ConfigurableEnvironment` changes

- [ ] **Step 2: Run full build to identify errors**

Run: `mvn clean compile -DskipTests`
Expected: List of compilation errors from removed APIs

- [ ] **Step 3: Fix each error systematically**

Common fixes:
```java
// Replace deprecated WebSecurityConfigurerAdapter with SecurityFilterChain beans
// Update @ConfigurationProperties binding
// Fix actuator endpoint changes
// Update Spring Data repository method signatures if needed
```

- [ ] **Step 4: Full build verification**

Run: `mvn clean install -DskipTests`
Expected: BUILD SUCCESS for all modules

- [ ] **Step 5: Commit**

```bash
git add */src/main/java/
git commit -m "fix: resolve Spring Boot 4.x deprecated API removals"
```

---

### Task 11: Run full test suite and verify

**Files:**
- All test files across modules

- [ ] **Step 1: Run all tests**

Run: `mvn clean test`
Expected: All tests PASS

- [ ] **Step 2: Run with code coverage**

Run: `mvn clean verify`
Expected: BUILD SUCCESS, coverage reports generated

- [ ] **Step 3: Verify application startup (smoke test)**

Run each module:
```bash
mvn spring-boot:run -pl eureka-server &
mvn spring-boot:run -pl api-gateway &
mvn spring-boot:run -pl security-module &
mvn spring-boot:run -pl config-server &
```
Expected: All services start without errors (check actuator/health endpoints)

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "test: verify full build and test suite passes after Spring Boot 4.x upgrade"
```

---

### Task 12: Update documentation and configuration files

**Files:**
- `README.md` - if exists
- Application.yml/yml files in each module
- Dockerfiles - if any

- [ ] **Step 1: Update Java version in Dockerfiles**

```dockerfile
FROM eclipse-temurin:21-jdk
```

- [ ] **Step 2: Update application.yml for Spring Boot 4.x config changes**

Check for:
- Property name changes
- Actuator endpoint configuration
- Spring Cloud Config client/server properties

- [ ] **Step 3: Commit**

```bash
git add *.md */src/main/resources/ Dockerfile* 2>/dev/null || true
git commit -m "docs: update documentation and configs for Java 21 / Spring Boot 4.x"
```

---

## Plan Summary

| Task | Module | Type | Est. Time |
|------|--------|------|-----------|
| 1 | Parent POM | Version upgrades | 10 min |
| 2 | eureka-server | POM update | 5 min |
| 3 | api-gateway | POM update | 5 min |
| 4 | config-server | POM update | 5 min |
| 5 | security-module | POM + artifact fixes | 15 min |
| 6 | security-module | Source: javax→jakarta | 30 min |
| 7 | eureka-server | Source: javax→jakarta | 20 min |
| 8 | api-gateway | Source: javax→jakarta + Gateway 5.x | 30 min |
| 9 | config-server | Source: javax→jakarta | 20 min |
| 10 | All modules | Source: SB 4.x API removals | 45 min |
| 11 | All modules | Testing & verification | 20 min |
| 12 | Project | Docs & configs | 10 min |

**Total Estimated Time:** ~3.5 hours

---

**Execution Options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**