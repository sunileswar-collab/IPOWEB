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

# PHASE 5 — React Frontend Migration

## What Was Built
- `AuthContext.js` — global auth state (token, user, role) using React Context API
- `api.js` — rewritten for Spring Boot endpoints, JWT interceptor, auto-logout on 401
- `Navbar.js` — email login/register modals, notification bell with unread badge, user role badge, WebSocket subscription
- `IPOCard.js` — camelCase fields, risk score badge, watchlist star toggle
- `HomePage.js` — stats from `/api/ipos/stats`, featured ongoing IPOs
- `IPOListPage.js` — UPPERCASE status filters matching Spring Boot enums
- `IPODetailPage.js` — full detail with watchlist toggle, risk score, performance section
- `WatchlistPage.js` — new: user's watchlisted IPOs
- `NotificationsPage.js` — new: full notification history with mark-read
- `App.js` — AuthProvider wrapper, ProtectedRoute, all routes

---

## Key Changes from Django Version
| Old (Django) | New (Spring Boot) |
|---|---|
| `company_name` | `companyName` |
| `open_date` | `openDate` |
| `price_band` | `priceBand` |
| `logo` | `logoUrl` |
| `rhp_pdf` | `rhpPdfUrl` |
| `status: 'upcoming'` | `status: 'UPCOMING'` |
| proxy port 8000 | proxy port 8080 |
| `/api/ipo/` | `/api/ipos` |

---

## Concepts & Interview Questions

### 1. React Context API

**What it is:** Built-in React state management for sharing data across components without prop drilling.

**Q: What is React Context and when do you use it?**
> Context provides a way to share values (like auth state) across the component tree
> without passing props through every level.
> Use it for global state: auth, theme, language.
> For complex state with many actions, prefer Redux or Zustand.

**Q: What is the difference between Context and props?**
> Props = explicit, parent passes to child directly — good for local state.
> Context = implicit, any component in the tree can consume it — good for global state.
> Overusing Context causes unnecessary re-renders — only use for truly global data.

**Q: What is `useCallback` and why use it in AuthContext?**
> `useCallback` memoizes a function so it's not recreated on every render.
> `login` and `logout` are passed as context values — without `useCallback`,
> every render creates new function references, causing all consumers to re-render.

---

### 2. Axios Interceptors

**What it is:** Middleware that runs before every request or after every response.

**Our interceptors:**
```js
// Request interceptor — attach JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

**Q: What is an Axios interceptor?**
> A function that intercepts every request or response globally.
> Request interceptor = runs before request is sent (attach auth headers).
> Response interceptor = runs after response received (handle errors globally).
> Avoids repeating auth header logic in every API call.

**Q: Why use optional chaining `err.response?.status`?**
> Network errors (no internet, server down) don't have a `response` object.
> Without `?.`, accessing `.status` on undefined throws a TypeError.
> Optional chaining safely returns `undefined` instead of crashing.

---

### 3. Protected Routes

**What it is:** A wrapper component that redirects unauthenticated users away from private pages.

```jsx
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/" replace />;
};
```

**Q: How do you protect routes in React Router v6?**
> Wrap the route element in a component that checks auth state.
> If not authenticated, use `<Navigate>` to redirect.
> `replace` prop replaces history entry so back button doesn't return to protected page.

**Q: What is the difference between `<Navigate>` and `useNavigate()`?**
> `<Navigate>` is a component — used in JSX for declarative redirects.
> `useNavigate()` is a hook — used in event handlers for imperative navigation.
> Use `<Navigate>` in render logic, `useNavigate()` in button click handlers.

---

### 4. WebSocket in React (STOMP + SockJS)

**Connection flow:**
```js
const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  connectHeaders: { Authorization: `Bearer ${token}` },
  onConnect: () => {
    client.subscribe('/user/queue/notifications', msg => {
      const n = JSON.parse(msg.body);
      setUnreadCount(c => c + 1);
    });
  },
});
client.activate();
```

**Q: Why use `useRef` for the STOMP client?**
> `useRef` holds a value that persists across renders without causing re-renders.
> The STOMP client object doesn't need to trigger UI updates — it's just a connection handle.
> Storing it in state would cause unnecessary re-renders every time it's set.

**Q: Why return a cleanup function from `useEffect` for WebSocket?**
> When the component unmounts (user logs out, navigates away), the WebSocket
> connection must be closed to prevent memory leaks and ghost subscriptions.
> The cleanup function `return () => client.deactivate()` runs on unmount.

---

## Phase 5 Summary (Say in interview)

> "I migrated the React frontend from Django to Spring Boot by updating all API
> endpoints, field names from snake_case to camelCase, and status values to uppercase enums.
> I implemented global auth state using React Context API with JWT stored in localStorage.
> Axios interceptors automatically attach the JWT to every request and redirect to home
> on 401 responses. The notification bell uses STOMP over SockJS to receive real-time
> push notifications from the Spring Boot WebSocket server. Protected routes redirect
> unauthenticated users away from watchlist and notification pages."

---

---

# PHASE 6 — Admin Dashboard + Charts

## What Was Built

### Backend
- `IpoRepository` — added `countByRiskScore()` and `findTopPerformersByListingGain()` queries
- `IpoService` — added `getRiskStats()` and `getTopPerformers()` methods
- `UserRepository` — added `countByRole()` query
- `AdminService` — extended `getDashboardStats()` to return users by role, risk distribution, top performers

### Frontend
- `AdminDashboard.js` — new page with:
  - 4 stat cards (total users, total IPOs, ongoing, listed)
  - Pie chart — IPOs by status (Recharts PieChart)
  - Bar chart — IPOs by risk score (Recharts BarChart)
  - Bar chart — Users by role (Recharts BarChart)
  - Top performers table (listing gain, current return)
  - User management table (change role inline, toggle enable/disable, delete)
- `App.js` — added `/admin` protected route
- `Navbar.js` — Dashboard link visible only to ADMIN role

---

## API Changes

`GET /api/admin/stats` now returns:
```json
{
  "totalUsers": 5,
  "usersByRole": { "ADMIN": 1, "ANALYST": 1, "VIEWER": 3 },
  "ipoStats": { "UPCOMING": 3, "ONGOING": 2, "LISTED": 5 },
  "riskStats": { "LOW": 4, "MEDIUM": 3, "HIGH": 3 },
  "topPerformers": [ { "companyName": "...", "listingGain": 42.5, ... } ]
}
```

---

## Concepts & Interview Questions

### 1. Recharts

**What it is:** A composable charting library for React built on D3.

**Q: Why Recharts over Chart.js in a React project?**
> Recharts is built specifically for React — components are declarative JSX.
> Chart.js requires imperative DOM manipulation via `useRef` and `useEffect`.
> Recharts integrates naturally with React state — pass data as props, chart re-renders automatically.

**Q: What is `ResponsiveContainer` in Recharts?**
> A wrapper that makes charts responsive to their parent container's width.
> Without it, charts have fixed pixel dimensions and break on mobile.
> Always wrap charts in `ResponsiveContainer width="100%"`.

**Q: What is the difference between PieChart and BarChart use cases?**
> PieChart — shows proportions of a whole (IPO status distribution).
> BarChart — compares values across categories (risk scores, user roles).
> Use pie for "what percentage", bar for "how many in each category".

---

### 2. JPQL Queries with LIMIT

**Our top performers query:**
```java
@Query("SELECT i FROM Ipo i WHERE i.status = 'LISTED' AND i.listingGain IS NOT NULL ORDER BY i.listingGain DESC LIMIT 5")
List<Ipo> findTopPerformersByListingGain();
```

**Q: What is JPQL and how is it different from SQL?**
> JPQL (Java Persistence Query Language) operates on entity objects, not tables.
> `SELECT i FROM Ipo i` — `Ipo` is the entity class, not the table name.
> `i.companyName` — Java field name, not column name.
> Hibernate translates JPQL to SQL for the specific database dialect.

**Q: What is `@Query` annotation in Spring Data JPA?**
> Allows writing custom JPQL or native SQL queries on repository methods.
> Use when Spring Data's method name conventions aren't expressive enough.
> `nativeQuery = true` for raw SQL: `@Query(value = "SELECT * FROM ipos", nativeQuery = true)`

**Q: What is the difference between derived queries and `@Query`?**
> Derived: `findByStatusAndRiskScore(Status s, RiskScore r)` — Spring generates SQL from method name.
> `@Query`: explicit JPQL/SQL — use for complex queries, aggregations, joins.
> Derived queries are readable for simple cases; `@Query` for anything complex.

---

### 3. Role-Based UI Rendering

**What it is:** Showing/hiding UI elements based on the logged-in user's role.

```jsx
// Only ADMIN sees Dashboard link
{user?.role === 'ADMIN' && <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>}

// Route also protected server-side
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<...> getDashboardStats() { ... }
```

**Q: Is hiding UI elements enough for security?**
> No — UI hiding is UX, not security.
> A user can manually navigate to `/admin` or call `/api/admin/stats` directly.
> Security must be enforced on the SERVER — `@PreAuthorize` on the backend.
> Frontend role checks are only for better user experience.

**Q: What is defense in depth?**
> Applying security at multiple layers — not relying on a single control.
> In our app:
> 1. Frontend hides admin UI from non-admins (UX layer)
> 2. React ProtectedRoute redirects unauthenticated users (client routing layer)
> 3. Spring Security `@PreAuthorize` rejects unauthorized API calls (server layer)
> If any one layer fails, the others still protect the system.

---

### 4. Inline Editing Pattern

**What it is:** Editing data directly in a table row without navigating to a separate page.

```jsx
<Form.Select size="sm" value={u.role}
  onChange={e => handleRoleChange(u.id, e.target.value)}>
  <option value="VIEWER">VIEWER</option>
  <option value="ANALYST">ANALYST</option>
  <option value="ADMIN">ADMIN</option>
</Form.Select>
```

**Q: What is optimistic vs pessimistic UI update?**
> Optimistic: update UI immediately, then call API. Rollback if API fails.
> Pessimistic: wait for API response, then update UI.
> Our dashboard uses pessimistic — `setUsers(prev => ...)` runs after `await api.put()`.
> Optimistic is faster UX but needs rollback logic on error.

---

## Phase 6 Summary (Say in interview)

> "I built an admin dashboard with three Recharts visualizations — a pie chart
> for IPO status distribution, a bar chart for risk score breakdown, and a bar chart
> for user role distribution. The dashboard also shows top performing IPOs by listing gain
> and a full user management table where admins can change roles inline, toggle
> account status, and delete users. The backend was extended with three new JPQL
> queries for risk aggregation, role counting, and top performers.
> The dashboard route is protected both on the frontend with a role check
> and on the backend with `@PreAuthorize('hasRole(ADMIN)')`."

---

---

# PHASE 7 — Security Hardening + Rate Limiting

## What Was Built

### New Files
| File | Purpose |
|---|---|
| `RateLimitFilter.java` | Per-IP sliding window rate limiter — 20 req/min on `/api/auth/**`, 100 req/min globally |
| `SecurityHeadersFilter.java` | Adds OWASP security headers to every response |

### Modified Files
| File | Change |
|---|---|
| `SecurityConfig.java` | Registered both new filters before JwtFilter in chain |
| `GlobalExceptionHandler.java` | Added `AccessDeniedException` handler — returns clean 403 JSON |
| `AuthService.java` | Added disabled user check on login |
| `application.properties` | Disabled SQL logging, locked Actuator to health-only |

---

## Security Headers Added
| Header | Value | Protects Against |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | MIME type sniffing attacks |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `Content-Security-Policy` | `default-src 'self'` | XSS, data injection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage |
| `Permissions-Policy` | `geolocation=(), microphone=()` | Browser feature abuse |

---

## Rate Limits
| Endpoint | Limit | Window |
|---|---|---|
| `/api/auth/**` | 20 requests | per IP per minute |
| All other `/api/**` | 100 requests | per IP per minute |
| Exceeded response | HTTP 429 Too Many Requests | JSON error message |

---

## Concepts & Interview Questions

### 1. Rate Limiting

**What it is:** Restricting how many requests a client can make in a time window.

**Our implementation — sliding window per IP:**
```java
// Store: IP -> [windowStartTime, requestCount]
private final ConcurrentHashMap<String, long[]> authWindows = new ConcurrentHashMap();

// On each request:
// - If window expired (>60s ago): reset count to 1
// - Else: increment count
// - If count > limit: return 429
```

**Q: What is rate limiting and why is it important?**
> Rate limiting restricts how many requests a client can make in a time window.
> Without it, attackers can:
> 1. Brute force passwords by trying thousands of combinations
> 2. DDoS the server by flooding it with requests
> 3. Scrape all data by making rapid sequential requests
> Rate limiting on `/api/auth/**` specifically prevents brute force attacks.

**Q: What is the difference between rate limiting and throttling?**
> Rate limiting = hard block after limit exceeded (return 429, reject request).
> Throttling = slow down responses as load increases (add delays, queue requests).
> Rate limiting is binary — allowed or blocked.
> Throttling is gradual — degrades gracefully under load.

**Q: What is a sliding window vs fixed window rate limiter?**
> Fixed window: count resets at fixed intervals (e.g., every minute on the clock).
> Problem: 20 requests at 0:59 + 20 at 1:01 = 40 requests in 2 seconds.
> Sliding window: window moves with each request — always looks back exactly 60s.
> Our implementation uses sliding window — more accurate protection.

**Q: What is `ConcurrentHashMap` and why use it for rate limiting?**
> `ConcurrentHashMap` is thread-safe — multiple threads can read/write simultaneously.
> Regular `HashMap` is not thread-safe — concurrent writes cause data corruption.
> Spring handles each HTTP request in a separate thread — must use thread-safe collections.

**Q: What is HTTP 429 status code?**
> `429 Too Many Requests` — the standard response for rate limit exceeded.
> Should include `Retry-After` header telling client when to retry.
> Client should back off and retry after the specified time.

---

### 2. Security Headers

**Q: What is `X-Content-Type-Options: nosniff`?**
> Prevents browsers from guessing (sniffing) the content type of a response.
> Without it, a browser might execute a text file as JavaScript if it looks like JS.
> `nosniff` forces browser to use the declared `Content-Type` header.

**Q: What is `X-Frame-Options: DENY`?**
> Prevents the page from being embedded in an `<iframe>` on another site.
> Protects against clickjacking — attacker overlays invisible iframe over their page
> to trick users into clicking buttons on your site.

**Q: What is Content Security Policy (CSP)?**
> A header that tells the browser which sources are allowed to load resources.
> `default-src 'self'` = only load scripts/styles/images from same origin.
> Prevents XSS attacks — even if attacker injects a `<script>` tag,
> the browser blocks it if the source isn't in the CSP whitelist.

**Q: What is the difference between XSS and CSRF?**
> XSS (Cross-Site Scripting) = attacker injects malicious JS into your page.
> CSRF (Cross-Site Request Forgery) = attacker tricks user's browser into making
> requests to your API using the user's existing session/cookies.
> CSP headers protect against XSS. CSRF tokens protect against CSRF.
> We disabled CSRF because we use JWT (stateless) — no session cookies to forge.

---

### 3. Actuator Security

**What it is:** Spring Boot Actuator exposes management endpoints like `/actuator/env`,
`/actuator/beans`, `/actuator/mappings` that reveal internal app details.

**Default (dangerous):** All endpoints exposed — attacker can see env vars, beans, DB config.

**Our config:**
```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never
```

**Q: Why is Spring Boot Actuator a security risk if misconfigured?**
> `/actuator/env` exposes all environment variables including DB passwords and JWT secrets.
> `/actuator/heapdump` dumps the entire JVM heap — contains all in-memory data.
> `/actuator/beans` reveals the entire Spring application structure.
> Always restrict to `health` only in production. Never expose `env` or `heapdump`.

**Q: What does `management.endpoint.health.show-details=never` do?**
> The health endpoint by default shows DB connection status, disk space, etc.
> `show-details=never` returns only `{"status": "UP"}` — no internal details.
> Prevents attackers from learning about your infrastructure from health checks.

---

### 4. Disabled User Check

**The gap we fixed:**
```java
// Before: disabled users could still login and get a JWT
authenticationManager.authenticate(...);
User user = userRepository.findByEmail(email).orElseThrow();
// Missing: check if user.isEnabled()
String token = jwtUtil.generateToken(userDetails); // ❌ issued to disabled user

// After: disabled users are blocked
if (!user.isEnabled())
    throw new RuntimeException("Account is disabled. Contact administrator.");
```

**Q: Why does Spring Security's `authenticationManager.authenticate()` not check `enabled`?**
> It does check `enabled` — but only if `UserDetailsService` returns a `UserDetails`
> with `isEnabled() = false`. Our `UserDetailsServiceImpl` was returning
> `User.builder().disabled(false)` hardcoded. The fix ensures the DB value is used.
> Always map all `UserDetails` fields from the actual entity.

**Q: What is the principle of defense in depth applied here?**
> Even if an admin disables a user account, without this check the user could
> still login and get a valid JWT. The JWT would work until expiry (24 hours).
> Defense in depth = check at every layer: DB flag + login check + token validation.

---

## Phase 7 Summary (Say in interview)

> "I hardened the application with three layers of security.
> First, a rate limiting filter blocks brute force attacks — 20 requests per minute
> on auth endpoints per IP using a sliding window with ConcurrentHashMap.
> Second, a security headers filter adds OWASP-recommended headers including
> Content-Security-Policy, X-Frame-Options, and X-Content-Type-Options to every response.
> Third, I locked down Spring Boot Actuator to expose only the health endpoint
> with no internal details, disabled SQL query logging to prevent schema leakage,
> and added a disabled-user check on login so deactivated accounts cannot obtain JWT tokens."

---

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
