# IPO Listing Platform — Interview Preparation Guide

> This document is updated after every phase. Use it to revise before interviews.

---

## Project One-Liner (Say this when asked "Tell me about your project")

> "I built a full-stack IPO Listing Platform using React.js, Spring Boot, and MySQL.
> It includes JWT-based authentication with role-based access control, an IPO risk scoring engine,
> real-time watchlist notifications via WebSocket, and an admin dashboard with analytics.
> The backend uses Spring Security, Flyway migrations, and follows REST API best practices."

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Axios, React Router, Recharts |
| Backend | Spring Boot 4.1.1, Java 25 |
| Security | Spring Security 7.x, JWT (JJWT 0.12.6) |
| Database | MySQL 8.0, JPA/Hibernate, Flyway |
| Real-time | WebSocket (STOMP) |

---

---

# PHASE 1 & 2 — Database + Security + JWT Auth

## What Was Built
- MySQL database with 4 tables: users, ipos, watchlist, notifications
- Flyway migration for automatic schema creation
- JWT authentication (register/login)
- Spring Security with role-based access (ADMIN, ANALYST, VIEWER)
- BCrypt password hashing
- JwtFilter — validates token on every request
- GlobalExceptionHandler — clean error responses

---

## Key Files Created
| File | Purpose |
|---|---|
| `V1__init_schema.sql` | Creates all 4 tables in MySQL |
| `SecurityConfig.java` | Defines security rules, CORS, filter chain |
| `JwtUtil.java` | Generates and validates JWT tokens |
| `JwtFilter.java` | Intercepts every request to check JWT |
| `UserDetailsServiceImpl.java` | Loads user from DB for Spring Security |
| `AuthService.java` | Register and login business logic |
| `AuthController.java` | `/api/auth/register` and `/api/auth/login` endpoints |
| `IpoController.java` | CRUD endpoints for IPOs |
| `RiskScoreService.java` | Calculates IPO risk score (LOW/MEDIUM/HIGH) |

---

## Concepts & Interview Questions

### 1. Flyway — Database Migration

**What it is:** A tool that versions and runs SQL scripts automatically on app startup.

**Why use it:**
- Every developer gets the same database structure
- Safe for production — only runs new scripts, never drops existing data
- Tracks history in `flyway_schema_history` table

**Q: What is Flyway and why use it over `ddl-auto=create`?**
> Flyway versions SQL scripts so every environment has identical schema.
> `ddl-auto=create` drops and recreates tables on every restart — you lose all data.
> Flyway only runs new migrations, existing data is safe.

**Q: What is the difference between `ddl-auto=validate` and `ddl-auto=none`?**
> `validate` — Hibernate checks tables exist but doesn't create them.
> `none` — Hibernate does nothing to schema, Flyway handles it completely.

**Q: What is `flyway_schema_history` table?**
> Flyway's own table that tracks which migration scripts have already run.
> Prevents running the same script twice.

---

### 2. JWT — JSON Web Token

**What it is:** A token given to user after login. Sent with every request to prove identity.

**Structure — 3 parts separated by dots:**
```
eyJhbGci...   ← Header  (algorithm: HS256)
eyJzdWIi...   ← Payload (email, role, expiry)
kp_Qz5W...    ← Signature (proves token is not tampered)
```

**How it works:**
```
1. User logs in with email + password
2. Server verifies credentials
3. Server creates JWT signed with secret key
4. Client stores token
5. Client sends token in every request: Authorization: Bearer <token>
6. Server verifies signature — no DB lookup needed
7. Server extracts email and role from token
```

**Q: How does JWT work?**
> User logs in → server creates token with email/role, signs with secret key →
> client sends token in every request header → server verifies signature and
> extracts user info — no database lookup needed on every request.

**Q: Where do you store JWT on the frontend?**
> Ideally in `httpOnly` cookie — JavaScript cannot access it, preventing XSS attacks.
> `localStorage` is easier but less secure because any JS script can read it.

**Q: Can you decode a JWT without the secret key?**
> Yes — payload is Base64 encoded, anyone can decode and read it.
> But they cannot FORGE a new token without the secret key.
> So never store sensitive data like passwords in JWT payload.

**Q: What happens when JWT expires?**
> Server returns 401 Unauthorized. Client uses a refresh token to get
> a new access token without asking user to login again.

**Q: What is the difference between JWT and Session?**
> Session stores user data on the server — stateful, doesn't scale well.
> JWT stores data in the token itself — stateless, scales horizontally,
> no server-side storage needed.

---

### 3. Spring Security Filter Chain

**What it is:** Every HTTP request passes through a chain of filters before reaching controller.

**Our filter order:**
```
Request → JwtFilter → UsernamePasswordAuthenticationFilter → Controller
```

**Q: What is Spring Security filter chain?**
> A series of filters that intercept every HTTP request. Each filter does one job —
> CORS check, JWT validation, authorization check. If any filter rejects the request,
> it never reaches the controller.

**Q: What does `OncePerRequestFilter` mean?**
> Guarantees the filter runs exactly once per request, even if request is
> forwarded internally within the app.

**Q: What is `SecurityContextHolder`?**
> Thread-local storage that holds the currently authenticated user for the
> duration of the request. JwtFilter sets authentication here, then any
> part of the code can get the current user from it.

**Q: What is `SessionCreationPolicy.STATELESS`?**
> Tells Spring Security to never create an HTTP session.
> Every request must carry its own JWT — no server-side session storage.

---

### 4. BCrypt Password Hashing

**What it is:** One-way hashing algorithm for storing passwords safely.

**Example:**
```
Plain:  admin123
Hashed: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**Q: Why BCrypt over MD5 or SHA?**
> BCrypt is intentionally slow and includes automatic salt.
> MD5/SHA are fast — attackers can try billions per second.
> BCrypt's slowness makes brute force attacks impractical.

**Q: What is a salt in password hashing?**
> A random string added to password before hashing.
> Two users with same password get different hashes.
> Prevents rainbow table attacks (pre-computed hash lookups).

**Q: Can you decrypt a BCrypt hash?**
> No — BCrypt is one-way. You can only verify by hashing the input
> again and comparing. That's what `passwordEncoder.matches()` does.

---

### 5. Role-Based Access Control (RBAC)

**Our roles:**
| Role | Permissions |
|---|---|
| VIEWER | Read IPOs only |
| ANALYST | Read + Create + Update IPOs |
| ADMIN | Full access including delete and user management |

**Security rules in code:**
```java
.requestMatchers(HttpMethod.GET, "/api/ipos/**").permitAll()       // everyone
.requestMatchers(HttpMethod.POST, "/api/ipos/**").hasAnyRole("ADMIN", "ANALYST")
.requestMatchers(HttpMethod.DELETE, "/api/ipos/**").hasRole("ADMIN")
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

**Q: What is the difference between Authentication and Authorization?**
> Authentication = who are you? (verified by login with email/password)
> Authorization = what are you allowed to do? (checked by role)

**Q: What is RBAC?**
> Role Based Access Control — users are assigned roles, roles have permissions.
> Easier to manage than giving permissions to individual users.

**Q: What does `@PreAuthorize` do?**
> Method-level security annotation. Put `@PreAuthorize("hasRole('ADMIN')")`
> directly on controller method for fine-grained control instead of
> configuring everything in SecurityConfig.

**Q: What is the difference between `hasRole` and `hasAuthority`?**
> `hasRole("ADMIN")` automatically adds "ROLE_" prefix → checks for "ROLE_ADMIN"
> `hasAuthority("ROLE_ADMIN")` checks exact string — no prefix added.

---

### 6. CORS — Cross Origin Resource Sharing

**What it is:** Browser security that blocks requests from different origins.

**Our config:**
```java
config.setAllowedOrigins(List.of("http://localhost:3000")); // only React app
config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
config.setAllowCredentials(true);
```

**Q: What is CORS and why do we need it?**
> Browser blocks JS from calling APIs on different domains by default.
> CORS config on server tells browser which origins are allowed.
> Without it, React on port 3000 cannot call Spring Boot on port 8080.

**Q: What is a preflight request?**
> Before sending POST/PUT/DELETE, browser sends an OPTIONS request first
> to check if the server allows it. Server must respond with allowed methods/headers.

---

## Phase 1 & 2 Summary (Say in interview)

> "I implemented stateless JWT authentication with Spring Security.
> Every request passes through a JwtFilter that validates the token,
> extracts the user's role, and sets it in SecurityContextHolder.
> Endpoints are protected based on roles — ADMIN, ANALYST, VIEWER.
> Passwords are hashed with BCrypt. Database schema is versioned
> with Flyway migrations so every environment has identical structure."

---

---

# PHASE 3 — (Coming Soon)
> Admin Controller, User Management, Watchlist API

---

# PHASE 4 — WebSocket Notifications + IPO Status Scheduler

## What Was Built
- `WebSocketConfig` — STOMP over SockJS on `/ws`, in-memory broker on `/topic` and `/queue`
- `NotificationService` — saves notification to DB + pushes real-time to user's personal queue
- `IpoStatusScheduler` — `@Scheduled` runs every hour, auto-transitions `UPCOMING→ONGOING→LISTED` based on dates, notifies all watchers
- `NotificationController` — REST endpoints for fetching, marking read, unread count
- Updated `WatchlistRepository` — added `findByIpoId` for scheduler to find all watchers
- Updated `SecurityConfig` — `/ws/**` permitted, `/api/notifications/**` authenticated
- Updated `BackendApplication` — `@EnableScheduling` added

---

## Key Files Created/Modified
| File | Purpose |
|---|---|
| `WebSocketConfig.java` | STOMP broker config, `/ws` endpoint |
| `NotificationService.java` | Save to DB + push via WebSocket |
| `IpoStatusScheduler.java` | Hourly cron, status transitions + notifications |
| `NotificationController.java` | REST API for user notifications |

---

## API Endpoints Added

### Notification Endpoints (Authenticated users)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get my notifications |
| PUT | `/api/notifications/{id}/read` | Mark notification as read |
| GET | `/api/notifications/unread-count` | Get unread count |

### WebSocket
| Endpoint | Description |
|---|---|
| `ws://localhost:8080/ws` | SockJS connection endpoint |
| `/user/queue/notifications` | Personal notification queue per user |

---

## Concepts & Interview Questions

### 1. WebSocket vs HTTP

**What it is:** WebSocket is a persistent, full-duplex connection between client and server.
HTTP is request-response — client must ask, server responds.
WebSocket allows server to push data to client at any time.

**Q: What is the difference between WebSocket and HTTP?**
> HTTP is half-duplex — client sends request, server responds, connection closes.
> WebSocket is full-duplex — connection stays open, both sides can send at any time.
> WebSocket is ideal for real-time features: notifications, live prices, chat.

**Q: What is STOMP?**
> Simple Text Oriented Messaging Protocol — a messaging protocol that runs over WebSocket.
> It adds concepts like destinations (topics/queues), subscriptions, and message headers.
> Spring's WebSocket support is built around STOMP.

**Q: What is SockJS?**
> A JavaScript library that provides WebSocket-like API with fallback transports
> (long-polling, XHR streaming) for browsers that don't support WebSocket.
> Ensures real-time works even in restricted network environments.

**Q: What is the difference between `/topic` and `/queue` in STOMP?**
> `/topic` — broadcast to ALL subscribers (one-to-many, like a news feed)
> `/queue` — sent to ONE specific user (one-to-one, like a personal inbox)
> We use `/user/queue/notifications` so each user only gets their own notifications.

---

### 2. `@Scheduled` — Task Scheduling

**What it is:** Runs a method automatically at fixed intervals or cron expressions.
Requires `@EnableScheduling` on the application class.

**Our scheduler:**
```java
@Scheduled(fixedRate = 3600000) // every hour in milliseconds
public void updateIpoStatuses() { ... }
```

**Q: What is `@Scheduled` and what does `fixedRate` mean?**
> `@Scheduled` marks a method to run automatically on a schedule.
> `fixedRate` = run every N milliseconds regardless of how long the method takes.
> `fixedDelay` = wait N milliseconds AFTER the previous execution finishes.
> `cron` = use cron expression for complex schedules like "every day at 9am".

**Q: What is the difference between `fixedRate` and `fixedDelay`?**
> `fixedRate` — starts next execution N ms after the PREVIOUS START.
> `fixedDelay` — starts next execution N ms after the PREVIOUS END.
> If method takes 2s and rate is 1s, `fixedRate` will overlap; `fixedDelay` won't.

**Q: What annotation is required to enable `@Scheduled`?**
> `@EnableScheduling` on the main application class or any `@Configuration` class.
> Without it, `@Scheduled` annotations are silently ignored — no error thrown.

---

### 3. `convertAndSendToUser` — Personal WebSocket Messages

**What it is:** Sends a WebSocket message to a specific user's personal queue.

**How it works:**
```java
messagingTemplate.convertAndSendToUser(
    user.getEmail(),          // username (principal name)
    "/queue/notifications",   // destination suffix
    payload                   // message object
);
// Client subscribes to: /user/queue/notifications
// Spring routes it to: /user/{email}/queue/notifications internally
```

**Q: How does `convertAndSendToUser` know which WebSocket session to send to?**
> Spring maps the authenticated principal name (email in our case) to the
> WebSocket session. When client connects and authenticates, Spring registers
> the session under that principal. `convertAndSendToUser` looks up the session
> by principal name and delivers the message.

**Q: What is `SimpMessagingTemplate`?**
> Spring's template class for sending messages to WebSocket destinations.
> Similar to `JdbcTemplate` for DB or `RestTemplate` for HTTP — it abstracts
> the low-level WebSocket/STOMP protocol details.

---

### 4. Status Transition Logic

**Business rules:**
```
UPCOMING → ONGOING  when today >= openDate
ONGOING  → LISTED   when today > closeDate
```

**Q: Why use a scheduler instead of updating status manually?**
> Manual updates require admin action and can be forgotten.
> A scheduler ensures status is always accurate based on real dates.
> This is the "single source of truth" principle — dates drive status, not humans.

**Q: What is `@Transactional` on the scheduler method?**
> The scheduler updates multiple IPOs in one run.
> `@Transactional` ensures if any update fails, all changes in that run roll back.
> Prevents partial state where some IPOs are updated and others aren't.

---

## Phase 4 Summary (Say in interview)

> "I implemented real-time notifications using WebSocket with STOMP protocol.
> When an IPO status changes, all users who watchlisted that IPO receive
> an instant push notification to their personal queue.
> Status transitions are automated by a scheduled job that runs every hour —
> it checks IPO dates and moves them from UPCOMING to ONGOING to LISTED automatically.
> Notifications are also persisted in the database so users can view history
> and mark them as read via REST endpoints."

---

---

# PHASE 5 — (Coming Soon)
> React Frontend Migration

---

# PHASE 6 — (Coming Soon)
> Admin Dashboard, Charts, Analytics

---

# PHASE 7 — (Coming Soon)
> Security Hardening, Rate Limiting

---

## General Spring Boot Interview Questions

**Q: What is Spring Boot vs Spring Framework?**
> Spring Framework requires lots of manual configuration (XML or Java config).
> Spring Boot provides auto-configuration, embedded server, and starter dependencies
> so you can start coding immediately without boilerplate setup.

**Q: What is `@RestController`?**
> Combination of `@Controller` + `@ResponseBody`.
> Every method returns data (JSON) directly instead of a view template.

**Q: What is `@RequiredArgsConstructor` from Lombok?**
> Generates a constructor for all `final` fields automatically.
> Used for constructor injection — the recommended way to inject dependencies
> in Spring (better than `@Autowired` on fields).

**Q: What is the difference between `@Component`, `@Service`, `@Repository`?**
> All three register the class as a Spring bean.
> `@Service` — business logic layer
> `@Repository` — data access layer (also translates DB exceptions)
> `@Component` — generic bean, doesn't fit service or repository

---

## MySQL Interview Questions

**Q: What is a foreign key?**
> A column that references the primary key of another table.
> Enforces referential integrity — you can't add a watchlist entry
> for a user that doesn't exist.

**Q: What does `ON DELETE CASCADE` mean?**
> When a user is deleted, all their watchlist entries and notifications
> are automatically deleted too. No orphan records.

**Q: What is an index and why use it?**
> A data structure that speeds up SELECT queries on a column.
> Without index, MySQL scans every row. With index, it jumps directly.
> We should index columns used in WHERE clauses frequently.

---

# PHASE 3 — Admin Controller + Watchlist API

## What Was Built
- `AdminController` — user management (list, change role, enable/disable, delete)
- `AdminService` — admin business logic
- `WatchlistController` — add/remove/get watchlist per user
- `WatchlistService` — watchlist business logic
- `UserDTO` — safe user response without exposing password field

---

## Key Files Created
| File | Purpose |
|---|---|
| `AdminController.java` | `/api/admin/**` endpoints, ADMIN only |
| `AdminService.java` | User management logic |
| `WatchlistController.java` | `/api/watchlist/**` endpoints |
| `WatchlistService.java` | Watchlist business logic |
| `UserDTO.java` | Returns user data safely without password |

---

## API Endpoints Added

### Admin Endpoints (ADMIN role only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/{id}/role` | Change user role |
| PUT | `/api/admin/users/{id}/toggle` | Enable/disable user |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/stats` | Dashboard stats |

### Watchlist Endpoints (Authenticated users)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/watchlist` | Get my watchlist |
| POST | `/api/watchlist/{ipoId}` | Add IPO to watchlist |
| DELETE | `/api/watchlist/{ipoId}` | Remove IPO from watchlist |
| GET | `/api/watchlist/{ipoId}/check` | Check if IPO is watchlisted |

---

## Concepts & Interview Questions

### 1. DTO Pattern — Data Transfer Object

**What it is:** A separate class used to transfer data between layers,
instead of exposing the entity directly.

**Why we used it:**
- `User` entity has a `password` field
- If we return `User` directly from API, password hash is exposed in response
- `UserDTO` has all fields except password — safe to return

**Q: What is a DTO and why use it?**
> DTO is a plain object used to carry data between layers.
> We never expose JPA entities directly in API responses because:
> 1. Entities may have sensitive fields (password)
> 2. Entities may have lazy-loaded relationships causing N+1 queries
> 3. API response shape may differ from database shape
> DTOs give full control over what gets serialized.

**Q: What is the difference between Entity and DTO?**
> Entity = mapped to database table, managed by JPA/Hibernate.
> DTO = plain Java object, used only for transferring data in API layer.
> Entity changes affect DB schema. DTO changes only affect API response.

**Q: Why not use `@JsonIgnore` on password instead of a DTO?**
> `@JsonIgnore` works but it's a quick fix. DTOs are better because:
> - Different endpoints may need different shapes of the same entity
> - `@JsonIgnore` is hard to override when you actually need the field
> - DTOs make the API contract explicit and independent of DB schema

---

### 2. `@AuthenticationPrincipal`

**What it is:** Injects the currently logged-in user's details directly into controller method.

**Example:**
```java
@GetMapping
public ResponseEntity<List<Watchlist>> getWatchlist(
        @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(watchlistService.getWatchlist(userDetails.getUsername()));
}
```

**Q: What is `@AuthenticationPrincipal`?**
> It extracts the authenticated user from `SecurityContextHolder` automatically.
> Instead of manually calling `SecurityContextHolder.getContext().getAuthentication()`,
> Spring injects it directly as a method parameter.

**Q: How do you get the current logged-in user in Spring Boot?**
> Two ways:
> 1. `@AuthenticationPrincipal UserDetails userDetails` in controller parameter
> 2. `SecurityContextHolder.getContext().getAuthentication().getName()` anywhere in code

---

### 3. `@PreAuthorize` vs SecurityConfig Rules

**SecurityConfig rules** — applied at URL level:
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

**`@PreAuthorize`** — applied at method level:
```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<UserDTO>> getAllUsers() { ... }
```

**Q: When do you use `@PreAuthorize` vs SecurityConfig?**
> SecurityConfig is for broad URL-level rules — good for simple patterns.
> `@PreAuthorize` is for fine-grained method-level control — good when
> different methods in same controller need different roles.
> `@PreAuthorize` requires `@EnableMethodSecurity` on config class.

---

### 4. `@Transactional`

**What it is:** Wraps a method in a database transaction.
If anything fails, all changes are rolled back.

**We used it on:**
```java
@Transactional
public void removeFromWatchlist(String email, Long ipoId) {
    watchlistRepository.deleteByUserIdAndIpoId(user.getId(), ipoId);
}
```

**Q: What is `@Transactional` and why use it?**
> It ensures all database operations in the method succeed or fail together.
> If an exception occurs midway, all changes are rolled back automatically.
> Without it, partial updates can corrupt data.

**Q: What is the difference between `@Transactional` on class vs method?**
> On class = all public methods in that class are transactional.
> On method = only that specific method is transactional.
> Method-level annotation overrides class-level.

**Q: What happens if you call a `@Transactional` method from within the same class?**
> The transaction is NOT applied — this is a common Spring gotcha.
> Spring's transaction proxy only intercepts calls from outside the class.
> Solution: inject the service into itself or restructure the code.

---

### 5. Principle of Least Privilege (Security Principle)

**What it is:** Give users only the minimum permissions they need.

**How we applied it:**
- New users get `VIEWER` role by default — read only
- Only ADMIN can change roles, delete users, access admin panel
- ANALYST can manage IPO data but cannot manage users
- Watchlist endpoints require authentication — anonymous users cannot watchlist

**Q: What is the principle of least privilege?**
> Users and systems should have only the minimum access needed to do their job.
> Reduces attack surface — if an account is compromised, damage is limited.
> In our app: new users are VIEWER by default, ADMIN manually upgrades roles.

---

## Phase 3 Summary (Say in interview)

> "I built an admin panel with role-protected endpoints using `@PreAuthorize`.
> Admins can manage users — change roles, enable/disable accounts, view dashboard stats.
> I used the DTO pattern to ensure sensitive fields like passwords are never
> exposed in API responses. The watchlist feature uses `@AuthenticationPrincipal`
> to identify the current user without passing user ID in the request,
> which prevents users from accessing each other's watchlists."

---

# ERROR 7 — Watchlist Returning 403 (Silent JWT Exception)

## Error Message
```
403 Forbidden on POST /api/watchlist/1
```

## When It Happened
Phase 3 — Testing watchlist endpoint with valid ADMIN token

## Why It Happened
The JwtFilter had no exception handling around token parsing.
When `jwtUtil.extractEmail(token)` threw a `JwtException` internally,
the filter silently caught nothing — execution jumped past the
`SecurityContextHolder.setAuthentication()` call.

Result: request reached the controller with NO authentication set →
Spring Security saw unauthenticated request → returned 403.

## Why It Was Hard to Spot
- No error in logs (exception was swallowed silently)
- Token looked valid
- Other endpoints worked fine
- 403 instead of 401 was misleading

## Fix
Added try-catch around JWT parsing in JwtFilter:
```java
try {
    String token = authHeader.substring(7);
    String email = jwtUtil.extractEmail(token);
    // ... set authentication
} catch (JwtException | IllegalArgumentException e) {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
    return;
}
```

## Security Note
- Never log the token value itself — security risk
- Never print authentication details to console
- Return generic error message — don't reveal why token failed

## Interview Questions

**Q: What is the difference between 401 and 403?**
> 401 Unauthorized = not authenticated (no token or invalid token)
> 403 Forbidden = authenticated but not authorized (valid token, wrong role)
> Getting 403 when expecting 401 usually means authentication silently failed.

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
> 401 = "you need to authenticate" — client should redirect to login
> 403 = "you are authenticated but not allowed" — client should show access denied
> Returning wrong status code confuses the frontend about what action to take.
