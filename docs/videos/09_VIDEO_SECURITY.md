# 09. Video Module Security Architecture & RBAC

**Module:** Videos & Broadcast Archive (Phase 13)  
**Lead Coordinator:** Senior Security Engineer & Solution Architect  
**Standards:** OWASP Top 10, Role-Based Access Control (RBAC), Anti-SSRF, HTML Sanitization

---

## 1. Security Architecture Summary

The Videos module implements defense-in-depth across six distinct security tiers:

```
[Client Request]
       │
       ▼
[1. Network & Routing Gateways] ── Reject malformed routes, enforce HTTPS
       │
       ▼
[2. RBAC & Gate Authorization] ── Check 'manage_videos' permission via Sanctum
       │
       ▼
[3. Form Request Sanitization] ── Strip XSS tags, trim whitespace, normalize JSON
       │
       ▼
[4. URL Protocol & SSRF Shield] ─ Block private IPs, file/data/javascript schemes
       │
       ▼
[5. Embed Allowlist Guard] ────── Restrict iframes strictly to youtube-nocookie/vimeo
       │
       ▼
[6. Response Shielding] ──────── Inject 'X-Robots-Tag: noindex' on draft previews
```

---

## 2. RBAC & Permission Matrix

Admin routes are secured via Sanctum session/token authentication and the permission middleware:

| Operation | Route | HTTP Verb | Required Permission | Policy Check |
| :--- | :--- | :--- | :--- | :--- |
| List Videos (Admin) | `/api/v1/admin/videos` | `GET` | `manage_videos` | `viewAny(Video::class)` |
| View Single Video | `/api/v1/admin/videos/{id}` | `GET` | `manage_videos` | `view(Video $video)` |
| Create Video | `/api/v1/admin/videos` | `POST` | `manage_videos` | `create(Video::class)` |
| Update Video | `/api/v1/admin/videos/{id}` | `PUT` | `manage_videos` | `update(Video $video)` |
| Delete Video | `/api/v1/admin/videos/{id}` | `DELETE` | `manage_videos` | `delete(Video $video)` |
| Reorder Videos | `/api/v1/admin/videos/reorder` | `POST` | `manage_videos` | `reorder(Video::class)` |
| Preview Draft Video | `/api/v1/admin/videos/{id}/preview` | `GET` | `manage_videos` | `view(Video $video)` |

---

## 3. Threat Mitigation Analysis

### 3.1 Insecure Direct Object References (IDOR)
- All modification endpoints (`update`, `delete`, `preview`) execute strict authorization checks against the authenticated user's permissions.
- Public detail lookups resolve exclusively by `slug` on scoped models (`status = published` AND `visibility = public`). Passing an unpublished ID or slug directly yields HTTP 404.

### 3.2 Cross-Site Scripting (XSS)
- All string and JSON inputs (`title`, `description`) are sanitized.
- Rich text descriptions (if HTML is rendered) are escaped or passed through strict DOMPurify sanitizers on the React frontend.
- Raw HTML in URL fields is impossible due to protocol regex validation (`^https?:\/\/`).

### 3.3 Server-Side Request Forgery (SSRF)
- If automated thumbnail retrieval or metadata scraping were added in the future, `VideoPlatformService::isAllowedHost()` strictly validates that target IPs do not resolve to loopback, link-local, or private RFC 1918 addresses.

### 3.4 Arbitrary Iframe / Phishing Injection
- Under no circumstances does the application inject an `<iframe>` with an arbitrary admin-supplied URL.
- The embed builder only returns embed URLs when the target matches `ALLOWED_EMBED_HOSTS`.
- External videos receive a text/button link with `target="_blank" rel="noopener noreferrer"`.
