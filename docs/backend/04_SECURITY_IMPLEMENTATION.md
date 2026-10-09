# 04. Security Implementation & Defensive Architecture

**Standard:** OWASP Top 10 (2021/2026 Edition) & NIST SP 800-63  
**Framework Security:** Laravel 11 + Sanctum + Spatie Permission  

---

## 1. Defensive HTTP Security Headers

Injected automatically by `App\Http\Middleware\SecurityHeaders` on every request:

```http
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload (when HTTPS or production)
```

---

## 2. Cross-Origin Resource Sharing (CORS)

Configured inside `backend/config/cors.php`:
- Paths: `['api/*', 'sanctum/csrf-cookie', 'storage/*']`
- Origins: Dynamically parsed from `CORS_ALLOWED_ORIGINS` in `.env` (defaults to `http://localhost:5173`)
- Credentials: Enabled (`supports_credentials => true`) for cookie-based CSRF protection.
- Production restriction: Disallows wildcards `*` in production mode.

---

## 3. Rate Limiting Defense Architecture

Registered in `App\Providers\AppServiceProvider`:

| Limiter Key | Limit | Scope | Target Routes |
| :--- | :---: | :--- | :--- |
| `api` | 60 req/min | By User ID or Client IP | Public content queries, general API endpoints |
| `intake` | 5 req/min | By Client IP | `/api/v1/contact`, `/api/v1/consultation` (Anti-spam) |
| `auth` | 5 req/min | By Client IP | Login and authentication attempts (Brute-force protection) |

---

## 4. Media Storage Isolation

Separated into distinct disk boundaries:
1. `public` disk (`storage/app/public` symlinked to `public/storage`):
   - Stores publicly viewable assets (web images, public PDF research papers).
2. `secure` disk (`storage/app/secure` with no public web server route):
   - Stores confidential courtroom pleadings, sealed judicial orders, and client evidence.
   - Files are never directly accessible by URL.
   - Streamed strictly via authenticated controller after verifying `view_confidential_cases` permission.

---

## 5. Information Disclosure Defense

Centralized exception handling (`bootstrap/app.php`) guarantees that:
- Production environments (`APP_DEBUG=false`) never expose database credentials, file paths, stack traces, or SQL queries.
- SQL error messages are converted to uniform `SERVER_ERROR` with HTTP 500 status.
- Admin notes (`admin_notes`), IP addresses, and user agent strings on intake forms are protected via Eloquent `$hidden` properties.
