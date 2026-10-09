# 08 — CMS Security, Governance & Audit Architecture

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 5: CMS + Site Settings Engine

---

## 1. Threat Modeling & Security Posture

As a legal authority platform representing a Supreme Court Advocate, public trust, content integrity, and resilience against defamation, defacement, or stored payloads are paramount.

The Phase 5 CMS implements comprehensive security protections covering:
1. **Role-Based Access Control (RBAC)** enforcement on all endpoints.
2. **Defense-in-Depth Stored XSS Mitigation** across all rich text and bilingual inputs.
3. **Mass-Assignment & Payload Tampering Shields**.
4. **Information Disclosure Prevention** (strict separation of public vs internal settings and draft suppression).
5. **Open Redirect & Malicious Protocol Safeguards**.
6. **Immutable Audit Logging**.

---

## 2. RBAC Enforcement Matrix

All administrative CMS endpoints reside behind `auth:sanctum` and enforce granular Spatie permissions matching the approved Phase 4 RBAC matrix:

| CMS Resource | Required Permission | Allowed Roles |
| :--- | :--- | :--- |
| Site Settings View/Edit | `manage_settings` | `super_admin`, `admin` |
| Static Pages CRUD | `manage_pages` | `super_admin`, `admin`, `editor` |
| Navigation Menus CRUD | `manage_menus` | `super_admin`, `admin` |
| Homepage Sections Edit | `manage_homepage` | `super_admin`, `admin`, `editor` |
| URL Redirects CRUD | `manage_redirects` | `super_admin`, `admin` |

### Denial Behavior
- **Unauthenticated requests** receive `401 Unauthorized` (`App\Http\Middleware\Authenticate`).
- **Authenticated users lacking the required permission** receive `403 Forbidden` (`Spatie\Permission\Middleware\PermissionMiddleware`).

---

## 3. Defense-in-Depth XSS Sanitization

To ensure that neither compromised admin accounts nor client-side bypasses can inject stored XSS attacks into the database, all rich text content is sanitized on the server before storage via `App\Services\HtmlSanitizer`:

```php
namespace App\Services;

class HtmlSanitizer
{
    protected static array $allowedTags = [
        'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'h1', 'h2', 'h3',
        'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre',
        'hr', 'span', 'div',
    ];

    public static function clean(?string $html): string
    {
        // 1. Strip script, iframe, object, embed tags
        // 2. Strip event handlers (onclick, onload, onerror, etc.)
        // 3. Strip javascript: and data: pseudo-protocols
        // 4. Return sanitized HTML
    }
}
```

---

## 4. Draft & Unpublished Content Protection

The public CMS endpoint `GET /api/v1/pages/{slug}` strictly scopes content:
```php
$page = Page::query()
    ->where('slug', $slug)
    ->where('status', 'published')
    ->where('published_at', '<=', now())
    ->first();

if (!$page) {
    return ApiResponse::notFound('Page not found');
}
```
This guarantees that work-in-progress drafts, scheduled posts, and archived pages cannot be retrieved by unauthorized actors, search engine spiders, or automated scrapers.

---

## 5. Audit Logging Architecture

Every write, update, state transition, and delete action in the CMS pipeline is recorded into `audit_logs`:
- **Model**: `App\Models\AuditLog`
- **Fields Logged**:
  - `user_id`: Authenticated user who performed the action.
  - `action`: Specific CMS verb (`settings_updated`, `page_created`, `page_updated`, `page_published`, `page_deleted`, `menu_updated`, `homepage_section_updated`, etc.).
  - `auditable_type` & `auditable_id`: Target entity polymorphic identifiers.
  - `ip_address`: Remote IP address of the client.
  - `user_agent`: Browser / client signature.
  - `old_values`: JSON snapshot of attributes before the mutation.
  - `new_values`: JSON snapshot of attributes after the mutation.

---

## 6. Safe Redirects & URL Validation

1. **Protocol Blacklisting**: URLs containing `javascript:`, `vbscript:`, or `data:` are rejected by Form Request rules.
2. **Self-Loop Prevention**: Redirect rules where `source_path == target_path` are rejected with HTTP 422.
3. **Open Redirect Defenses**: Redirect target destinations must either begin with a relative slash `/` or use a secure HTTPS scheme.
