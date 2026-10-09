# Media Module Security Architecture (Phase 12)

## 1. Overview
The Media Module enforces defense-in-depth security principles across authentication, authorization, data validation, sanitization, and asset streaming.

---

## 2. Threat Model & Mitigation Matrix

| Threat Category | Potential Attack Vector | Mitigation Strategy | Test Coverage |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | Unauthorized user attempting to access administrative CRUD endpoints | Sanctum token authentication + Spatie permission middleware (`permission:manage_press`, `permission:manage_appearances`) | `unauthenticated_request_is_rejected`, `user_without_permission_receives_403` |
| **IDOR / Data Leakage** | Modifying or accessing drafts/private records belonging to internal review | Public endpoints enforce `published()` and `publicVisibility()` scopes; draft records return 404 | `public_cannot_view_draft_or_private_press_detail`, `public_cannot_view_draft_or_private_appearance` |
| **Cross-Site Scripting (XSS)** | Injecting `<script>` or malicious event handlers in title, summary, or description | `HtmlSanitizer::cleanTranslations()` and Form Request regex stripping of script tags, event handlers, and javascript URIs | `press_creation_validates_required_fields_and_formats` |
| **Unsafe External URLs** | Submitting `javascript:`, `data:`, or `ftp:` schemes in article or video URLs | Form Request regex validation strictly requiring `regex:/^https?:\/\/[^\s]+$/i` | Tested with `javascript:alert(1)` rejection (422) |
| **Mass Assignment** | Malicious injection of unapproved attributes (e.g., overriding timestamps, role IDs) | Explicit `$fillable` arrays defined on `MediaPress` and `MediaAppearance` models | Verified via strict Eloquent fillable protection |
| **Path Traversal** | Specifying arbitrary filesystem paths in document download parameters | Download actions locate records strictly by ID/slug in database and retrieve file via `Storage::disk()->path()` | Verified via isolated storage mock feature tests |
| **Indexing Leaks** | Crawlers indexing unapproved draft preview pages | Injected `X-Robots-Tag: noindex, nofollow` HTTP header on preview endpoints | Verified in `test_admin_preview_endpoint_allows_viewing_draft_with_noindex` |

---

## 3. Comprehensive Audit Trail
Every significant state mutation in the Media Module is recorded in the `activity_logs` table via `ActivityLog::record()`:
- `media_press_created` / `media_appearance_created`
- `media_press_updated` / `media_appearance_updated`
- `media_press_deleted` / `media_appearance_deleted`
- `media_press_published` / `media_appearance_published`
- `media_press_reordered` / `media_appearance_reordered`
- `redirect_created` (upon slug modification)
- `media_document_added` / `media_document_updated`
