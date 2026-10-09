# 08. Security Architecture & Threat Defense Specification

**Security Standard:** OWASP Top 10 (2021/2026 Edition) & NIST SP 800-63  
**Lead Coordinator:** Security Engineer & Backend Architect  

---

## 1. Threat Modeling for Legal Authority Systems

| Threat Category | Potential Attack Vector | Engineered Countermeasure |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | Unauthorized access to confidential client case files or unreleased drafts. | Spatie RBAC + Laravel Model Policies. Confidential documents stored on private disk and streamed only after checking `view_confidential_cases`. |
| **A02: Cryptographic Failures** | Eavesdropping on client consultation inquiries. | Enforced TLS 1.3 in production; passwords hashed with `bcrypt` (work factor 12); Sanctum API tokens SHA-256 hashed. |
| **A03: Injection (SQL / XSS)** | Malicious SQL in search queries; Stored XSS in Rich Text research editor. | PDO parameter binding via Eloquent ORM; `HTMLPurifier` sanitization stripping all executable tags (`<script>`, `<object>`, inline JS handlers). |
| **A04: Insecure Design** | Automated bots spamming consultation requests and choking email notification channels. | Dual layer: Backend Rate Limiting (`throttle:3,10`) + Client Honeypot (`_honeypot` trap). |
| **A05: Security Misconfiguration** | Debug mode exposed, sensitive environment variables leaked. | Strict CI/CD audit verifying `APP_DEBUG=false`, directory listing disabled, secure file permissions. |
| **A07: Auth Failures** | Brute force attacks against the administrative login endpoint. | Rate-limited login (max 5 attempts per min), automated account throttling, mandatory 12+ character complex passwords. |
| **A08: Software & Data Integrity** | Web shell upload disguised as an image (`shell.php.jpg`). | Server-side MIME sniffing with `finfo`, UUID filename remapping, stripping EXIF, re-encoding images via WebP pipeline. |
| **A09: Logging & Monitoring** | Silent tampering with published case outcomes or settings. | Immutable `activity_logs` recording User ID, IP, Action, Entity, and before/after JSON diffs. |

---

## 2. Authentication & Session Strategy

- **Token Engine:** Laravel Sanctum Bearer Tokens.
- **Token Format:** `[id]|[random_64_char_secret]`. The plaintext secret is revealed exactly once at login and transmitted over TLS. The database stores only the SHA-256 hash.
- **Revocation Lifecycle:**
  - Token is explicitly deleted on `POST /api/v1/auth/logout`.
  - Automatic invalidation of all existing tokens upon password reset.
  - Optional session idle timeout of 8 hours for administrative sessions.

---

## 3. Strict Input Validation & Sanitization Pipeline

```
HTTP Request
     |
     v
[1. Global Middleware] -> Rate Limiter (Throttle) & CORS Whitelist
     |
     v
[2. FormRequest Layer] -> Type, regex, length & presence validation (Returns 422 if invalid)
     |
     v
[3. HTML Sanitizer]   -> RichText fields run through HTMLPurifier (Strips malicious tags/scripts)
     |
     v
[4. Eloquent Model]   -> Parameterized PDO Query (Zero raw SQL interpolation)
```

### 3.1 HTMLPurifier Configuration for Legal Editors
Allowed HTML elements are strictly bounded:
- Structural: `<p>`, `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<blockquote>`, `<ul>`, `<ol>`, `<li>`, `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- Formatting: `<strong>`, `<em>`, `<u>`, `<strike>`, `<sub>`, `<sup>`
- Links: `<a href="..." target="_blank" rel="noopener noreferrer">` (URLs validated for `http` / `https` protocols; `javascript:` scheme is rejected)
- Media: `<img>` tags must point to verified `/storage/media/` URLs. Embedded iframes are restricted to validated YouTube and Vimeo domains.

---

## 4. HTTP Security Headers Specification

Every response issued by the Laravel application includes the following defense headers:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.google.com;
```

---

## 5. Client Intake Anti-Abuse (Honeypot & Rate Limiting)

Public submission endpoints (`/api/v1/contact` and `/api/v1/consultation`) are protected by a zero-friction honeypot mechanism:
1. The frontend form contains an invisible input: `<input type="text" name="_honeypot" style="display:none" tabIndex="-1" autocomplete="off" />`.
2. Human users do not see or fill this field.
3. Automated scraping bots greedily populate every form input.
4. If `_honeypot` is non-empty, the backend immediately intercepts the request, simulates a successful response with a random delay (tarpit), but permanently drops the database insert and records the IP address under the `spam` filter.
