# CORS & CSRF Defense Architecture

## 1. Executive Summary
Cross-Origin Resource Sharing (CORS) and Cross-Site Request Forgery (CSRF) are fundamental web security controls. A misconfigured CORS header (`Access-Control-Allow-Origin: *` with `credentials: true`) or disabled CSRF tokens create direct account takeover vulnerabilities.

Phase 18 audited the authentication transport architecture and hardened both controls across the application.

---

## 2. CORS Hardening

### 2.1 Configuration (`config/cors.php`)
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173')),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 86400,
    'supports_credentials' => true,
];
```

### 2.2 Security Rules Enforced
1. **Never Reflect Arbitrary Origins:** The backend does not reflect incoming `Origin` headers when they are untrusted. Unauthorized origins do not receive `Access-Control-Allow-Origin`.
2. **No Wildcards with Credentials:** When `supports_credentials` is `true`, `allowed_origins` is strictly enumerated and never `*`.
3. **Environment Separation:** Allowed origins are configurable via `CORS_ALLOWED_ORIGINS` in `.env`, ensuring that development hosts (`localhost:5173`) are never allowed on production environments.

---

## 3. CSRF Protection Architecture

### 3.1 Dual-Mode Authentication Pattern
The Advocate Nijam Uddin platform supports two primary consumption channels:
1. **First-Party SPA Web Frontend (React):** Uses Laravel Sanctum's stateful cookie authentication.
2. **REST API / Third-Party Integrations:** Uses Sanctum Bearer tokens (`Authorization: Bearer <token>`).

### 3.2 First-Party SPA CSRF Flow
```
Browser                     Laravel Backend
   |                               |
   |─── GET /sanctum/csrf-cookie ─►| (Sets XSRF-TOKEN cookie: HttpOnly=false, SameSite=Lax, Secure=true)
   |◄── 204 No Content ────────────|
   |                               |
   |─── POST /api/v1/auth/login ──►| (Axios/Fetch automatically reads XSRF-TOKEN and sends X-XSRF-TOKEN header)
   |    (with X-XSRF-TOKEN)        | Verified by ValidateCsrfToken middleware
   |◄── 200 OK (Auth Session) ─────|
```

### 3.3 CSRF Protection on State-Changing Endpoints
All non-GET web requests (`POST`, `PUT`, `PATCH`, `DELETE`) are subject to CSRF validation.
For pure API clients using Bearer tokens, the presence of the `Authorization: Bearer ...` header eliminates the CSRF vulnerability vector because browsers never attach Authorization headers automatically to cross-site requests.

---

## 4. Verification & Test Evidence
Validated by automated test suite `backend/tests/Feature/Security/HeadersAndCorsSecurityTest.php`:
1. `it_blocks_cors_wildcard_with_credentials_and_rejects_untrusted_origins` -> PASS
   - Verifies that requests with `Origin: https://evil-attacker.com` do NOT receive `Access-Control-Allow-Origin: https://evil-attacker.com`.
