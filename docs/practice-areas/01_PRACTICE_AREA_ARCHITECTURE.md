# 01. Practice Area Architecture

**Module:** Practice Areas & Jurisdictions  
**Phase:** 7  
**Lead Coordinator:** Senior Solution Architect & Legal Content Structure Specialist  
**Framework:** Laravel 11 (REST API, Sanctum, Spatie Permission) + React 19 / TypeScript / Vite  

---

## 1. Executive Architecture Summary

The Practice Areas module provides the dynamic jurisdictional catalog for the **Advocate Nijam Uddin (Haq)** judicial platform. It structures Supreme Court advocacy domains, High Court writ scopes, appellate procedures, and specialized advisory fields.

### Key Architectural Principles
1. **Legal Truth Enforcement:** The module enforces a strictly dynamic publication architecture. Zero unverified legal practice claims or marketing boasts (e.g., "500+ won cases", "leading criminal lawyer") are seeded or inferred. If no verified practice areas exist, the platform renders a dignified empty state.
2. **Bilingual JSON Storage:** All descriptive text (`title`, `short_description`, `full_description`) is persisted as bilingual JSON (`{"en": "...", "bn": "..."}`) using the established `HasTranslations` trait, avoiding fragile multi-table translation schemas.
3. **Controlled Icon Whitelist:** Icons are constrained to an approved whitelist (`scale`, `landmark`, `shield`, `briefcase`, `file-text`, `scroll`, `award`, `users`, `building`, `balance`, `gavel`, `book-open`, `globe`), rendered securely by the frontend Lucide registry to prevent XSS.
4. **URL Permalinks & 301 Redirect Preservation:** Slugs are lowercase, URL-safe strings. Whenever a published practice area's slug is updated, a `301 Moved Permanently` record is automatically inserted into the `redirects` table to preserve search engine rankings and bookmarks.
5. **Polymorphic SEO Metadata:** Each practice area morphs to `SeoMeta` (`seotable_type = App\Models\PracticeArea`), supporting bilingual meta titles, descriptions, canonical URLs, and OpenGraph parameters.
6. **High-Performance Multi-Level Caching:** Public listings and detail lookups are cached via `CmsCacheService::TTL_PRACTICE_AREAS` (24h) and automatically invalidated upon administrative create, update, reorder, or delete operations.

---

## 2. Component Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  BROWSER CLIENT                                    |
|  - Public Listing: /practice-areas (Cards, search, featured filter, pagination)   |
|  - Public Detail:  /practice-areas/:slug (Full brief, chamber card, sidebar)     |
|  - Admin Manager:  /admin/practice-areas (Table, visual icon picker, tabs, SEO)   |
+-----------------------------------------+-----------------------------------------+
                                          |
                         HTTP REST API (/api/v1)
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
+-------v-------------------------+               +-------------------------v-------+
|   PUBLIC PRACTICE CONTROLLER    |               |    ADMIN PRACTICE CONTROLLER    |
| - index: Paginated, filtered    |               | - CRUD operations               |
| - show: Lookup by unique slug   |               | - Reorder items batch           |
| - Cache: CmsCacheService (24h)  |               | - RBAC Guard: Spatie Permissions|
| - Resource: PracticeAreaResource|               | - HtmlSanitizer for HTML/XSS    |
+---------------+-----------------+               +-----------------+---------------+
                |                                                   |
                +-------------------------+-------------------------+
                                          |
                               +----------v----------+
                               |  PracticeArea Model |
                               +----------+----------+
                                          |
                   +----------------------+----------------------+
                   |                      |                      |
         +---------v--------+   +---------v--------+   +---------v--------+
         |     MediaAsset   |   |     SeoMeta      |   |   ActivityLog    |
         | (featured_image) |   | (morphOne: seo)  |   | (audit trail)    |
         +------------------+   +------------------+   +------------------+
```

---

## 3. Directory Layout & Boundaries

- **Backend Entities:**
  - `backend/app/Models/PracticeArea.php`
  - `backend/app/Http/Requests/Admin/PracticeAreaRequest.php`
  - `backend/app/Http/Requests/Admin/ReorderItemsRequest.php`
  - `backend/app/Http/Resources/V1/PracticeAreaResource.php`
  - `backend/app/Http/Resources/V1/PracticeAreaDetailResource.php`
  - `backend/app/Http/Controllers/Api/V1/Public/PracticeAreaController.php`
  - `backend/app/Http/Controllers/Api/V1/Admin/AdminPracticeAreaController.php`
- **Frontend Entities:**
  - `frontend/src/types/practiceArea.ts`
  - `frontend/src/api/practiceAreas.ts`
  - `frontend/src/components/icons/PracticeAreaIcon.tsx`
  - `frontend/src/pages/PracticeAreasPage.tsx`
  - `frontend/src/pages/PracticeAreaDetailPage.tsx`
  - `frontend/src/features/practice-areas/PracticeAreasManager.tsx`
