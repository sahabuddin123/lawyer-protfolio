# 01 — CMS Architecture & System Overview

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 5: CMS + Site Settings Engine

---

## 1. Executive Overview

The Content Management System (CMS) and Site Settings Engine in Phase 5 provides a robust, decoupled, and bilingual foundation for governing static institutional pages, dynamic navigation hierarchies, configurable homepage layout sections, global site settings, polymorphic SEO metadata, and 301/302 HTTP redirects.

The CMS is built strictly according to the architecture documents approved in Phase 1 and the engineering foundation established in Phase 3 and Phase 4. It maintains an air-tight boundary: **no future domain modules** (such as Practice Areas, Courtroom, Research, Judgments, Publications, or Consultations) have been introduced, keeping the architecture focused entirely on governance, presentation configuration, and metadata.

---

## 2. Decoupled Architecture & Data Flow

The platform utilizes a modern headless / decoupled architecture:
1. **Headless Laravel 11 Backend**: Exposes high-performance RESTful APIs governed by Laravel Sanctum and Spatie RBAC.
2. **React 18 + TypeScript Admin SPA**: Provides an editorial UI tailored specifically to legal authority presentation, using the Phase 2 design system.
3. **Public API Consumers**: Public website components consume cached, sanitised JSON payloads with zero administrative leakage.

```
+-----------------------------------------------------------------------------------+
|                                 ADMIN SPA (React)                                 |
|   - SettingsManager      - NavigationManager     - PagesManager                   |
|   - HomepageManager      - RedirectsManager                                       |
+-----------------------------------------------------------------------------------+
                                       |
                                       | HTTPS / Bearer Token (Sanctum)
                                       v
+-----------------------------------------------------------------------------------+
|                        ADMIN CMS API (/api/v1/admin/*)                            |
|   - RBAC Policies & Permissions ('manage_settings', 'manage_pages', etc.)         |
|   - Form Request Validation & Protocol Filtering                                  |
|   - HtmlSanitizer (Defense-in-Depth against Stored XSS)                            |
|   - Audit Logging Engine ('settings_updated', 'page_published', etc.)             |
|   - CmsCacheService (Automatic tagless eviction on write)                         |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                             DATABASE STORAGE (MySQL 8)                            |
|   - site_settings        - pages                 - menus & menu_items             |
|   - homepage_sections    - redirects             - seo_meta (Polymorphic)         |
+-----------------------------------------------------------------------------------+
                                       ^
                                       |
+-----------------------------------------------------------------------------------+
|                         PUBLIC CMS API (/api/v1/*)                                |
|   - GET /api/v1/settings       (Public grouped settings only)                     |
|   - GET /api/v1/navigation     (Hierarchical menus & tree items)                  |
|   - GET /api/v1/pages/{slug}   (Published pages only, 404 on drafts)              |
|   - GET /api/v1/home           (Enabled sections, sorted by sort_order)           |
|   - Fast Caching Layer (File/Redis via CmsCacheService, 24h default TTL)          |
+-----------------------------------------------------------------------------------+
```

---

## 3. Core Database Entities

| Entity / Table | Model Class | Purpose | Key Relations |
| :--- | :--- | :--- | :--- |
| `site_settings` | `App\Models\SiteSetting` | Central key-value store grouped by category | None (Flat / Grouped) |
| `pages` | `App\Models\Page` | Static informational / institutional pages | `seoMeta()` polymorphic, `media()` |
| `menus` | `App\Models\Menu` | Named menu containers (`header`, `footer`, `legal`) | `items()` hasMany |
| `menu_items` | `App\Models\MenuItem` | Hierarchical menu entries with order and targets | `menu()`, `parent()`, `children()` |
| `homepage_sections`| `App\Models\HomepageSection` | 12 configurable homepage block layouts | None |
| `redirects` | `App\Models\Redirect` | URL migration and redirect rules (301/302) | None |
| `seo_meta` | `App\Models\SeoMeta` | Polymorphic metadata (OpenGraph, Twitter, canonical)| `seoable()` morphTo |

---

## 4. Internationalization (i18n) Engine

Every user-facing content attribute supports bilingual values in **English (`en`)** and **Bangla (`bn`)**.
- Stored as native JSON columns in MySQL 8.0:
  ```json
  {
    "en": "Supreme Court of Bangladesh",
    "bn": "বাংলাদেশ সুপ্রিম কোর্ট"
  }
  ```
- Public API responses dynamically extract localized values or return the full dual-language object for isomorphic client-side switching based on standard `Accept-Language` headers and `?lang=en|bn` query parameters.
- Text truncation and excerpt generation safely use multibyte PHP functions (`mb_substr`, `Str::limit`) to prevent multibyte UTF-8 boundary slicing in Bengali script.

---

## 5. Cache Strategy & Invalidation

The public CMS endpoints are optimized for ultra-low latency (< 50ms) via `App\Services\CmsCacheService`:
- **Cache Keys**: Explicit, structured naming conventions:
  - `cms.public.settings.{lang}`
  - `cms.public.navigation.{lang}`
  - `cms.public.pages.{slug}.{lang}`
  - `cms.public.home.{lang}`
- **TTL**: 86,400 seconds (24 hours).
- **Eviction Triggers**: The cache is evicted immediately upon write, update, or deletion in admin controllers:
  - Settings update -> `CmsCacheService::purgeSettings()`
  - Navigation change -> `CmsCacheService::purgeNavigation()`
  - Page create/update/delete -> `CmsCacheService::purgePage($slug)`
  - Homepage reorder/edit -> `CmsCacheService::purgeHomepage()`
  - Master invalidation -> `CmsCacheService::purgeAll()`

---

## 6. Audit Trail & Governance

Every state modification across the CMS pipeline records an audit log through `App\Models\AuditLog`:
- Events recorded: `settings_updated`, `page_created`, `page_updated`, `page_published`, `page_unpublished`, `page_deleted`, `menu_created`, `menu_updated`, `menu_deleted`, `homepage_section_updated`, `homepage_sections_reordered`, `redirect_created`, `redirect_updated`, `redirect_deleted`.
- Captured metadata: `user_id`, `ip_address`, `user_agent`, `old_values`, `new_values`.
- Passwords, access tokens, and sensitive system parameters are strictly masked before logging.
