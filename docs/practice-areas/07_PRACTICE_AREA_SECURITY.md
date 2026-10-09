# 07. Practice Area Security & Audit Architecture

**Frameworks:** Laravel Sanctum, Spatie Permission, OWASP Security Headers, HTML Purifier / HtmlSanitizer  

---

## 1. Security Safeguards

### 1.1 Server-Side Authorization (RBAC)
Frontend UI guards alone are never relied upon for security. Every API request is verified server-side:
- `create_practice_area`: Required to invoke `POST /api/v1/admin/practice-areas`.
- `edit_practice_area`: Required for `GET|PUT /api/v1/admin/practice-areas/{id}` and reorder operations.
- `publish_practice_area`: Explicitly verified if an update or creation attempts to set `status = 'published'`. Users without publication clearance cannot unilaterally publish drafts.
- `delete_practice_area`: Required to soft-delete practice area entities.

### 1.2 XSS Sanitization
All HTML submitted in `short_description` and `full_description` passes through `HtmlSanitizer::cleanTranslations()` before persisting to the database. Malicious `<script>`, `<iframe>`, `javascript:`, and dangerous inline event handlers (`onload`, `onerror`) are completely stripped.

### 1.3 Icon Key Injection Protection
The `icon_name` attribute is strictly validated against an approved PHP array whitelist (`PracticeArea::APPROVED_ICONS`). Attempts to submit arbitrary CSS classes or inline scripts via the icon field fail validation with HTTP 422.

### 1.4 Draft & Archived Record Privacy
Public endpoints (`GET /api/v1/practice-areas` and `GET /api/v1/practice-areas/{slug}`) filter queries using `PracticeArea::published()`. Unauthenticated requests for drafts or unlisted areas return HTTP 404, preventing information leakage.

---

## 2. Audit Trail Events

Meaningful practice area events are recorded in `activity_logs`:
- `practice_area_created`: Logged upon creation with complete initial payload snapshot.
- `practice_area_updated`: Logged with previous vs new values.
- `practice_area_published`: Logged when a draft or archived item transitions to `published`.
- `practice_area_unpublished`: Logged when a published domain is transitioned back to `draft` or `archived`.
- `practice_area_featured`: Logged when marked as featured.
- `practice_area_unfeatured`: Logged when featured flag is removed.
- `practice_area_deleted`: Logged upon soft-deletion.
- `practice_areas_reordered`: Logged upon batch sorting changes.
- `redirect_created`: Logged when a slug change generates an automated 301 redirect.
