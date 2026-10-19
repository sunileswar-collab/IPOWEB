# IPO Listing Platform — Error Log & Lessons Learned

> Every error hit during this project is documented here with:
> - What the error was
> - Why it happened
> - How we resolved it (step by step)
> - Interview questions with answers based on that error

---

# ERROR 1 — DaoAuthenticationProvider Constructor Changed

## Error Message
```
constructor DaoAuthenticationProvider in class DaoAuthenticationProvider
cannot be applied to given types;
required: org.springframework.security.core.userdetails.UserDetailsService
found: no arguments
```

## When It Happened
Phase 2 — Setting up Spring Security config

## Why It Happened
Spring Security changed its API between major versions:

| Version | Constructor |
|---|---|
| Spring Security 6.x | `new DaoAuthenticationProvider()` → then setters |
| Spring Security 7.x | `new DaoAuthenticationProvider(userDetailsService)` → then setters |

Spring Boot 4.1.1 ships with Spring Security 7.1.1 — a very new version.
Most online tutorials still show the old 6.x API.

## Wrong Attempts
```java
// Attempt 1 — Old API (wrong for 7.x)
DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
provider.setUserDetailsService(userDetailsService); // ❌ method removed in 7.x
provider.setPasswordEncoder(passwordEncoder);

// Attempt 2 — Wrong argument type
DaoAuthenticationProvider provider = new DaoAuthenticationProvider(passwordEncoder); // ❌ wrong type
provider.setUserDetailsService(userDetailsService); // ❌ still removed
```

## Resolution
```java
// Correct for Spring Security 7.x
DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService); // ✅
provider.setPasswordEncoder(passwordEncoder()); // ✅ setter still works
```
Root cause was not checking the exact Spring Security version before writing code.
Always run `mvn dependency:tree` to check exact library versions.

## Interview Questions & Answers

**Q: How do you handle breaking changes when upgrading Spring Boot versions?**
> Check the official Spring Boot migration guide for the version you're upgrading to.
> Run `mvn dependency:tree` to see exact transitive dependency versions.
> Read the release notes of major dependencies like Spring Security.
> Test thoroughly after upgrade — especially security config which changes often.

**Q: What is a transitive dependency?**
> A dependency pulled in automatically by another dependency.
> Spring Boot pulls in Spring Security 7.1.1 automatically when you add
> `spring-boot-starter-security`. You don't declare it directly but it's there.
> `mvn dependency:tree` shows all transitive dependencies and their versions.

**Q: What is a breaking change in an API?**
> A change that makes existing code stop compiling or working.
> Examples: removing a method, changing constructor signature, renaming a class.
> Non-breaking change = adding a new method (existing code still works).

**Q: How do you check which version of Spring Security your project uses?**
> Run `mvn dependency:tree` and look for spring-security entries.
> Or check the downloaded jars in `~/.m2/repository/org/springframework/security/`.
> Or look in `target/` folder for the jar file names after build.

---

# ERROR 2 — Flyway Dependency Missing (spring-boot-starter-flyway)

## Error Message
```
No Flyway log lines appeared at all during startup.
SHOW TABLES returned empty set — tables never created.
```

## When It Happened
Phase 2 — First time running the server after adding Flyway migration SQL

## Why It Happened
`pom.xml` had `flyway-mysql` (MySQL dialect support) but was missing
`spring-boot-starter-flyway` (the core Spring Boot Flyway integration).
Without the starter, Spring Boot never auto-configured Flyway at all —
no error, just silent skip.

## Resolution
Added both dependencies to `pom.xml`:
```xml
<!-- Core Flyway + Spring Boot auto-configuration -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-flyway</artifactId>
</dependency>
<!-- MySQL-specific dialect support -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
```
You need BOTH — starter for Spring integration, mysql jar for MySQL compatibility.

## Interview Questions & Answers

**Q: What is the difference between `flyway-mysql` and `spring-boot-starter-flyway`?**
> `spring-boot-starter-flyway` = core Flyway + Spring Boot auto-configuration.
> It wires Flyway into the Spring lifecycle so it runs on startup automatically.
> `flyway-mysql` = MySQL-specific dialect support for Flyway.
> You need BOTH — starter for integration, mysql for MySQL compatibility.

**Q: Why did Flyway fail silently instead of throwing an error?**
> Because without the starter, Flyway was never registered as a Spring bean at all.
> Spring Boot only auto-configures Flyway when it detects `spring-boot-starter-flyway`
> on the classpath. Without it, Spring doesn't know Flyway should run.
> This is called conditional auto-configuration — `@ConditionalOnClass`.

**Q: What is Spring Boot auto-configuration?**
> Spring Boot automatically configures beans based on what's on the classpath.
> If it sees `flyway-core` jar → it auto-configures a Flyway bean.
> If it sees `mysql-connector` jar → it auto-configures a MySQL DataSource.
> You can see all auto-configurations by running with `--debug` flag.

**Q: How do you debug Spring Boot auto-configuration issues?**
> Run the app with `--debug` flag: `mvn spring-boot:run -Dspring-boot.run.arguments=--debug`
> It prints a "CONDITIONS EVALUATION REPORT" showing which auto-configurations
> were applied and which were skipped and why.

---

# ERROR 3 — Schema Validation Failed (missing table [ipos])

## Error Message
```
Schema validation: missing table [ipos]
Failed to initialize JPA EntityManagerFactory
```

## When It Happened
Phase 2 — First server startup after writing entity classes

## Why It Happened
`application.properties` had `spring.jpa.hibernate.ddl-auto=validate`.
`validate` tells Hibernate to check all tables exist before starting.
But tables didn't exist yet — Flyway hadn't run yet.

Spring Boot startup order (broken):
```
1. Spring context starts
2. Hibernate validates schema ← CRASHED HERE (tables don't exist)
3. Flyway runs migrations    ← Never reached
```

## Resolution
Changed `application.properties`:
```properties
# Before (broken)
spring.jpa.hibernate.ddl-auto=validate

# After (correct)
spring.jpa.hibernate.ddl-auto=none
```
`none` means Hibernate does nothing to schema — Flyway handles it completely.
Now startup order works correctly:
```
1. Spring context starts
2. Flyway runs migrations   ← Creates all tables
3. Hibernate starts         ← Tables exist, no crash
```

## Interview Questions & Answers

**Q: What are the different values of `spring.jpa.hibernate.ddl-auto`?**
> - `none` — do nothing to schema (use with Flyway/Liquibase)
> - `validate` — check tables exist, throw error if not (safe for production)
> - `update` — add missing columns/tables but never drop (risky in production)
> - `create` — drop and recreate all tables on startup (destroys data!)
> - `create-drop` — create on startup, drop on shutdown (for testing only)

**Q: Which `ddl-auto` value should you use in production?**
> `none` when using Flyway/Liquibase for migrations.
> `validate` as an extra safety check that schema matches entities.
> Never use `create` or `update` in production — risk of data loss.

**Q: What is the correct startup order for Flyway and Hibernate?**
> Flyway must run BEFORE Hibernate validates the schema.
> Spring Boot handles this automatically — Flyway bean is initialized
> before EntityManagerFactory bean by design.
> Problem occurs only when `ddl-auto=validate` is set on a fresh empty DB.

**Q: Why is `ddl-auto=update` dangerous in production?**
> It can add columns but never removes them.
> If you rename a column in your entity, `update` adds the new column
> but leaves the old one — data inconsistency.
> Flyway gives you full control with explicit versioned SQL scripts.

---

# ERROR 4 — MySQL Service Stopped (ERROR 2003 Can't connect)

## Error Message
```
ERROR 2003 (HY000): Can't connect to MySQL server on 'localhost:3306' (10061)
```

## When It Happened
Phase 2 — Trying to connect to MySQL after installation

## Why It Happened
MySQL Windows service (`MySQL80`) was in STOPPED state.
The service was installed correctly but not running.

## Resolution
1. Diagnosed using: `sc query MySQL80` → showed `STATE: 1 STOPPED`
2. Opened CMD as Administrator
3. Ran: `net start MySQL80`
4. Verified: `mysql -u root -p` connected successfully

Admin rights were needed because Windows services can only be
started/stopped by Administrator accounts.

## Interview Questions & Answers

**Q: What is a Windows Service?**
> A background process that runs independently of user login.
> MySQL runs as a Windows service so it starts automatically with Windows
> and runs even when no user is logged in.
> Similar to Linux daemons managed by systemd.

**Q: What does error code 10061 mean?**
> "Connection refused" — the target machine actively refused the connection.
> Means nothing is listening on that port (3306).
> Different from 10060 "Connection timed out" — means firewall blocking.
> 10061 = service not running. 10060 = firewall/network issue.

**Q: How do you check if a port is in use on Windows?**
> `netstat -ano | findstr :3306`
> Shows process ID using port 3306.
> If empty — nothing is listening on that port.

**Q: What is the difference between "Connection refused" and "Connection timed out"?**
> Refused (10061) = server is reachable but nothing listening on that port.
> Timed out (10060) = server is not reachable at all (firewall, wrong IP).
> Refused is actually better — means you reached the machine but service is down.

---

# ERROR 5 — MySQL Root Password Unknown

## Error Message
```
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
```

## When It Happened
Phase 2 — Trying to connect to MySQL after starting the service

## Why It Happened
The password hardcoded in `application.properties` (`root1234`) was assumed
but not confirmed. The actual password set during MySQL installation was different.

## Resolution
1. Tried connecting with different common passwords
2. Found the correct password that was set during installation
3. Updated `application.properties` with the correct password

Lesson: Never assume default passwords. Always confirm credentials.
Use environment variables for credentials — never hardcode in config files.

## Interview Questions & Answers

**Q: How should you store database credentials in a Spring Boot app?**
> Never hardcode in `application.properties` committed to Git.
> Use environment variables:
> ```properties
> spring.datasource.password=${DB_PASSWORD}
> ```
> Or use Spring Cloud Config, AWS Secrets Manager, or HashiCorp Vault
> for production secrets management.

**Q: What is the risk of committing credentials to Git?**
> Once committed, credentials are in Git history forever — even if you delete the file later.
> Attackers scan GitHub for exposed credentials automatically (tools like truffleHog).
> Always add `.env` and `application-prod.properties` to `.gitignore`.

**Q: What is `application-prod.properties` in Spring Boot?**
> Spring Boot supports profile-specific property files.
> `application-dev.properties` — development config
> `application-prod.properties` — production config (never committed to Git)
> Activated with: `spring.profiles.active=prod`

---

# ERROR 6 — PowerShell `--` Flag Parsing Issue

## Error Message
```
Unexpected token 'skip-grant-tables' in expression or statement.
The '--' operator works only on variables or on properties.
```

## When It Happened
Phase 2 — Trying to reset MySQL root password using skip-grant-tables

## Why It Happened
PowerShell treats `--` as a special operator (pipeline stop operator).
So `mysqld --skip-grant-tables` was parsed as PowerShell syntax, not
as a command with flags — causing a parse error.

## Resolution
Switched from PowerShell to Command Prompt (cmd.exe):
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld" --skip-grant-tables --datadir="C:\ProgramData\MySQL\MySQL Server 8.0\Data"
```
CMD does not treat `--` as a special operator — passes it directly to the program.

## Interview Questions & Answers

**Q: What is the difference between PowerShell and Command Prompt?**
> CMD (cmd.exe) = simple Windows shell, runs .bat files, basic commands.
> PowerShell = advanced shell with scripting language, object-oriented pipeline.
> PowerShell has special meaning for `--`, `$`, `@` etc. which can conflict
> with program arguments that use those characters.

**Q: How do you run a command with `--` flags in PowerShell?**
> Use `&` operator and quote the flags:
> ```powershell
> & "C:\path\to\program.exe" "--flag-name" "value"
> ```
> Or switch to cmd: `cmd /c "program.exe --flag-name value"`

---

# ERROR 7 — Silent JWT Exception Causing 403 on Watchlist

## Error Message
```
403 Forbidden on POST /api/watchlist/1
(with a valid ADMIN token)
```

## When It Happened
Phase 3 — Testing watchlist endpoint with valid ADMIN token in Postman

## Why It Happened
JwtFilter had no exception handling around token parsing.
When `jwtUtil.extractEmail(token)` threw a `JwtException` internally,
the filter silently swallowed it — execution jumped past
`SecurityContextHolder.setAuthentication()`.

Result: request reached the controller with NO authentication set →
Spring Security saw unauthenticated request → returned 403.

## Resolution
Added try-catch around JWT parsing in JwtFilter:
```java
try {
    String token = authHeader.substring(7);
    String email = jwtUtil.extractEmail(token);
    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (jwtUtil.isTokenValid(token, userDetails)) {
            // set authentication
        }
    }
} catch (JwtException | IllegalArgumentException e) {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
    return; // stop filter chain
}
```
Now invalid tokens return 401 with a clear message instead of silently failing.

## Interview Questions & Answers

**Q: What is the difference between 401 and 403?**
> 401 Unauthorized = not authenticated (no token, invalid token, expired token)
> 403 Forbidden = authenticated but not authorized (valid token, wrong role)
> Getting 403 when you expect 401 usually means authentication silently failed.

**Q: Why should you never log JWT tokens?**
> JWT tokens are credentials — logging them exposes them in log files.
> Log files are often stored insecurely, shared with monitoring tools,
> or accessible to multiple team members.
> Only log non-sensitive identifiers like user ID or email.

**Q: What is a silent failure in security code?**
> When an exception is swallowed without proper handling, causing
> security checks to be bypassed silently.
> Very dangerous — no error is thrown, no log is written,
> but the security check simply didn't run.
> Always wrap security-critical code in try-catch with explicit handling.

**Q: Why return 401 instead of 403 for invalid tokens?**
> 401 = "you need to authenticate" — client should redirect to login page.
> 403 = "you are authenticated but not allowed" — client should show access denied.
> Returning wrong status code confuses the frontend about what action to take.

---

# ERROR 8 — Lombok VerifyError on Java 25 (SecurityConfig)

## Error Message
```
java.lang.VerifyError: Constructor must call super() or this() before return
Caused by: Failed to introspect Class [SecurityConfig]
```

## When It Happened
Phase 3 — After adding JwtFilter exception handling and restarting server

## Why It Happened
Lombok's `@RequiredArgsConstructor` generates constructors at compile time.
On Java 25, Lombok generated invalid bytecode — the constructor didn't
properly call `super()` before returning.
Java 25 has stricter bytecode verification rules that rejected this.

`@Configuration` classes are especially sensitive because Spring subclasses
them using CGLIB (proxy mechanism) which requires strictly valid bytecode.

## Resolution
Replaced `@RequiredArgsConstructor` with a manual constructor in SecurityConfig:
```java
// Before (broken on Java 25)
@RequiredArgsConstructor
public class SecurityConfig { ... }

// After (works on all Java versions)
public class SecurityConfig {
    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtFilter jwtFilter, UserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }
}
```

## Interview Questions & Answers

**Q: What is Lombok and what does `@RequiredArgsConstructor` do?**
> Lombok is a Java library that generates boilerplate code at compile time
> using annotations. `@RequiredArgsConstructor` generates a constructor
> for all `final` fields automatically — saves writing repetitive constructor code.

**Q: What is bytecode verification in Java?**
> The JVM verifies bytecode before executing it to ensure it's safe and valid.
> Java 25 has stricter verification rules than older versions.
> `VerifyError` means the bytecode failed this verification check —
> usually caused by code generation tools (Lombok, CGLIB) not keeping up
> with new Java versions.

**Q: What is CGLIB and why does Spring use it?**
> CGLIB is a bytecode generation library. Spring uses it to create
> subclasses of `@Configuration` classes at runtime to manage bean
> lifecycle and singleton behavior. This is called Spring's proxy mechanism.
> Because CGLIB subclasses your config class, the constructor bytecode
> must be strictly valid.

**Q: What is constructor injection and why is it preferred over field injection?**
> Constructor injection = dependencies passed via constructor.
> Field injection = `@Autowired` directly on fields.
> Constructor injection is preferred because:
> 1. Dependencies are explicit and required
> 2. Fields can be `final` — immutable after construction
> 3. Works without Spring — easy to unit test
> 4. Fails fast at startup if dependency is missing

---

# ERROR 9 — Lombok @RequiredArgsConstructor Incompatible with Java 25 (All Classes)

## Error Message
```
VerifyError: Constructor must call super() or this() before return
Failed to introspect Class [JwtFilter]
```

## When It Happened
Phase 3 — After fixing SecurityConfig, same error appeared in JwtFilter
and then all other classes one by one

## Why It Happened
Same root cause as Error 8 — Lombok's `@RequiredArgsConstructor` is
incompatible with Java 25 across ALL classes, not just `@Configuration`.
The issue spread because every class in the project used `@RequiredArgsConstructor`.

## Resolution
Replaced `@RequiredArgsConstructor` with manual constructors in ALL classes:
- SecurityConfig, JwtFilter, UserDetailsServiceImpl
- AuthService, IpoService, AdminService, WatchlistService
- AuthController, IpoController, AdminController, WatchlistController

Rule going forward: Do NOT use `@RequiredArgsConstructor` in this project.
`@Data`, `@Getter`, `@Setter` on entities still work fine —
only constructor generation annotations are broken on Java 25.

## Interview Questions & Answers

**Q: What is the difference between `@Data`, `@Getter/@Setter` and `@RequiredArgsConstructor` in Lombok?**
> `@Getter/@Setter` — generates getters and setters for fields
> `@Data` — generates getters, setters, equals, hashCode, toString
> `@RequiredArgsConstructor` — generates constructor for all final fields
> In Java 25, only constructor generation is broken — getters/setters work fine.

**Q: Why is constructor injection preferred over `@Autowired` field injection?**
> Constructor injection:
> - Dependencies are explicit — visible in constructor signature
> - Fields can be `final` — immutable after construction
> - Works without Spring — easy to unit test
> - Fails fast at startup if dependency is missing
> `@Autowired` field injection hides dependencies and requires Spring to work.

**Q: How do you handle library incompatibilities in a project?**
> 1. Check the library's GitHub issues/release notes for known Java version issues
> 2. Try upgrading the library version
> 3. If no fix available, replace the library feature with manual code
> 4. Document the workaround for the team
> In this case: replaced Lombok constructor generation with manual constructors.

---

# ERROR 10 — N+1 Query Problem (User fetched multiple times per request)

## Error Message
```
No error — but logs showed:
Hibernate: select u1_0.id,...from users where email=?
Hibernate: select u1_0.id,...from users where email=?
(repeated 8 times for a single request)
```

## When It Happened
Phase 3 — After server started successfully, on first API call

## Why It Happened
Every request goes through JwtFilter which calls `loadUserByUsername(email)`.
This hits the database every single time — no caching.
Multiple internal Spring Security checks also triggered the same call
resulting in 8 DB queries for a single HTTP request.

## Resolution
1. Added `@Transactional(readOnly = true)` to `loadUserByUsername` for efficiency
2. The core fix is Spring Security's `SecurityContextHolder` — once JwtFilter
   sets authentication, all subsequent checks in the same request use the
   cached SecurityContext — no additional DB calls.

## Interview Questions & Answers

**Q: What is the N+1 query problem?**
> When fetching a list of N items triggers N additional queries for related data.
> Example: fetch 10 IPOs (1 query) then fetch each IPO's company (10 queries) = 11 total.
> Fix: use JOIN FETCH in JPQL or `@EntityGraph` to load related data in one query.

**Q: What is `@Transactional(readOnly = true)`?**
> Marks a transaction as read-only — no data will be modified.
> Allows Hibernate optimizations:
> - Skips dirty checking (no need to track entity changes)
> - Some databases use read replicas for read-only transactions
> - Slightly better performance for SELECT-only operations.

**Q: How does Spring Security avoid repeated DB lookups per request?**
> Once JwtFilter sets authentication in `SecurityContextHolder`,
> all subsequent security checks in the same request use that cached
> authentication object — no additional DB calls needed.
> `SecurityContextHolder` is thread-local — each request thread has its own context.

---

# ERROR 11 — 405 Method Not Allowed on Watchlist

## Error Message
```
Request method 'GET' is not supported
```

## When It Happened
Phase 3 — Testing watchlist endpoint in Postman

## Why It Happened
Sent `GET` request to `POST /api/watchlist/1` endpoint.
Simple user error — wrong HTTP method selected in Postman dropdown.

## Resolution
Changed Postman request method from GET to POST.
The endpoint `POST /api/watchlist/{ipoId}` only accepts POST — not GET.

## Interview Questions & Answers

**Q: What are the HTTP methods and when do you use each?**
> - `GET` — retrieve data, no body, idempotent, safe
> - `POST` — create new resource, has body, not idempotent
> - `PUT` — replace entire resource, idempotent
> - `PATCH` — partial update, not always idempotent
> - `DELETE` — remove resource, idempotent

**Q: What does idempotent mean in REST?**
> Calling the same request multiple times produces the same result.
> GET, PUT, DELETE are idempotent — calling them 10 times = same as calling once.
> POST is not idempotent — calling it 10 times creates 10 resources.

**Q: What is the difference between 405 and 404?**
> 404 Not Found = the URL/endpoint doesn't exist at all
> 405 Method Not Allowed = the URL exists but doesn't support that HTTP method
> Getting 405 is actually good — it means your URL is correct, just wrong method.

---

# ERROR 12 — Password Hash Exposed in Watchlist Response

## Error Message
```
No error — but API response contained:
"user": {
    "password": "$2a$10$MmdrsFQkCpEWx5X26viYuuUF..."
}
```

## When It Happened
Phase 3 — First successful watchlist API response

## Why It Happened
`Watchlist` entity has a `User` relationship. When Jackson (JSON serializer)
serialized the `Watchlist` object, it serialized the entire `User` object
including the `password` field. BCrypt hash is not the plain password but
it's still sensitive — exposing it helps attackers with offline brute force.

## Resolution
Added `@JsonIgnoreProperties({"password", ...})` on the User relationship
in the Watchlist entity:
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
@JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
private User user;
```
Better long-term fix: create a `WatchlistDTO` that uses `UserDTO`
(which has no password field) instead of returning the entity directly.

## Security Rule
Never expose password hashes in API responses — even BCrypt hashes.
A BCrypt hash can be used in offline brute force attacks without rate limiting.

## Interview Questions & Answers

**Q: Is it safe to expose a BCrypt password hash in an API response?**
> No. Even though BCrypt is one-way and slow, exposing the hash allows
> attackers to perform offline brute force attacks at their own pace
> without rate limiting. Always hide password fields completely from responses.

**Q: What is `@JsonIgnoreProperties` vs `@JsonIgnore`?**
> `@JsonIgnore` on a field — always ignores that field everywhere in the app.
> `@JsonIgnoreProperties` on a relationship — ignores specific fields
> only when serializing that related object in this specific context.
> More flexible — same User class can show password in one context (never)
> and hide it in another.

**Q: What is the difference between authentication data and authorization data?**
> Authentication data (password, tokens) — never expose, used to verify identity.
> Authorization data (role, permissions) — can expose, used to control access.
> In our response: `role: "ADMIN"` is fine to expose, `password` is never ok.

**Q: What is Jackson and how does it work in Spring Boot?**
> Jackson is the default JSON serialization library in Spring Boot.
> When a controller returns an object, Jackson automatically converts it to JSON.
> It serializes all public fields and getter methods by default.
> You control what gets serialized using `@JsonIgnore`, `@JsonIgnoreProperties`,
> `@JsonProperty`, or by using DTOs.

---

## Key Lessons Summary

| # | Error | Root Cause | Resolution |
|---|---|---|---|
| 1 | DaoAuthenticationProvider constructor | Spring Security 7.x API change | Pass UserDetailsService to constructor |
| 2 | Flyway silent failure | Missing spring-boot-starter-flyway | Add both flyway starter and flyway-mysql |
| 3 | Schema validation crash | ddl-auto=validate on empty DB | Change to ddl-auto=none |
| 4 | MySQL connection refused | MySQL service stopped | net start MySQL80 as Administrator |
| 5 | MySQL access denied | Wrong password in properties | Confirm password, update properties |
| 6 | PowerShell -- flag error | PowerShell parses -- as operator | Use CMD instead of PowerShell |
| 7 | 403 on valid token | Silent JWT exception in filter | Add try-catch in JwtFilter |
| 8 | VerifyError in SecurityConfig | Lombok incompatible with Java 25 | Manual constructor in SecurityConfig |
| 9 | VerifyError in all classes | Lombok incompatible with Java 25 | Manual constructors in all classes |
| 10 | N+1 DB queries per request | No caching in UserDetailsService | @Transactional(readOnly=true) + SecurityContextHolder |
| 11 | 405 Method Not Allowed | Wrong HTTP method in Postman | Use POST not GET for watchlist |
| 12 | Password hash in response | Entity serialized directly | @JsonIgnoreProperties on relationship |
