# 01 — Profile & Pedigree Architecture

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 6: Profile & About Module

---

## 1. Executive Summary

The Profile & Pedigree subsystem establishes the authoritative institutional identity for **Advocate Nijam Uddin (Haq)**. It is engineered as a decoupled, bilingual, and highly auditable domain covering:
- Professional executive profile and title declarations.
- Verified academic qualifications (LL.B. Honours, LL.M. from University of Chittagong).
- Professional admissions and bar council enrollments (Advocate, Supreme Court of Bangladesh; Enrolled / Certified with Bangladesh Bar Council).
- Chronological career milestones and bar association memberships.
- Polymorphic SEO metadata and structured JSON-LD (`Person` schema).
- Responsive, editorial public presentation following the Phase 2 design system.

In strict compliance with project governance and professional legal ethics:
- **No unverified credentials, enrollment numbers, seniority claims ("Senior Advocate"), court levels ("Appellate Division"), or case achievements have been inferred or fabricated.**
- Content is strictly driven by the Project Director's approved baseline and authenticated administrator input.

---

## 2. Decoupled Architecture & System Flow

```
+-----------------------------------------------------------------------------------+
|                           CLIENT INTERFACES (React 18)                            |
|   - Public AboutPage (/about)            - Admin ProfileManager (/admin/profile)  |
|   - Dark Editorial Legal Aesthetic       - 7-Subtab Administrative Control Center |
|   - Multilingual Toggle (EN / BN)        - Responsive Desktop, Laptop, Mobile     |
+-----------------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   | HTTPS                             | HTTPS + Sanctum Bearer Token
                   v                                   v
+-------------------------------------+ +-------------------------------------------+
|      PUBLIC API (/api/v1/*)         | |       ADMIN API (/api/v1/admin/*)         |
|   - GET /api/v1/profile             | |   - GET|PUT /admin/profile                |
|   - GET /api/v1/credentials         | |   - GET|POST|PUT|DELETE /admin/credentials|
|   - GET /api/v1/timeline            | |   - GET|POST|PUT|DELETE /admin/educations |
|   - 24h Deterministic File/Redis    | |   - GET|POST|PUT|DELETE /admin/timeline   |
|     Cache Layer via CmsCacheService | |   - GET|POST|PUT|DELETE /admin/memberships|
|   - Published & Active records only | |   - Spatie Permissions Guard              |
|   - 404 for Draft / Hidden profiles | |   - HtmlSanitizer & Activity Logging      |
+-------------------------------------+ +-------------------------------------------+
                   |                                   |
                   +-------------------+---------------+
                                       v
+-----------------------------------------------------------------------------------+
|                            DATABASE STORAGE (MySQL 8)                             |
|   - `profiles`                  - `credentials`            - `educations`         |
|   - `career_timelines`          - `professional_memberships`                      |
|   - `seo_meta` (Polymorphic)    - `activity_logs`          - `media`              |
+-----------------------------------------------------------------------------------+
```

---

## 3. Relational Entities & Data Integrity

| Table Name | Model Class | Domain Responsibility | Relationships |
| :--- | :--- | :--- | :--- |
| `profiles` | `App\Models\Profile` | Core advocate identity, executive bio, addresses, enrollments, philosophy | `profilePhoto`, `courtRobesPhoto`, `signaturePhoto`, `seo` (morphOne) |
| `credentials` | `App\Models\Credential` | Verified bar admissions, degrees, awards, certifications | `certificate` (belongsTo Media) |
| `educations` | `App\Models\Education` | University degree chronology | None (Standalone domain) |
| `career_timelines` | `App\Models\CareerTimeline` | Curated career milestones & positions | None (Standalone domain) |
| `professional_memberships` | `App\Models\ProfessionalMembership` | Legal societies & bar affiliations | None (Standalone domain) |
| `seo_meta` | `App\Models\SeoMeta` | Polymorphic SEO & JSON-LD `Person` metadata | `seotable` (morphTo) |

---

## 4. Internationalization (i18n) Engine

Every user-facing attribute (names, titles, subtitles, bios, addresses, credentials, and degrees) is stored in native MySQL JSON columns supporting:
- **English (`en`)**: Authoritative international legal terminology.
- **Bangla (`bn`)**: Supreme Court of Bangladesh legal terminology.

The platform uses `App\Traits\HasTranslations` and frontend locale contexts to automatically present the appropriate language based on `Accept-Language` headers and user toggles, falling back to English when a Bengali translation is pending.

---

## 5. Caching & Low-Latency Delivery

Public profile endpoints are cached via `App\Services\CmsCacheService`:
- `cms:profile:public:{locale}` (24 hours)
- `cms:credentials:public:{locale}` (24 hours)
- `cms:timeline:public:{locale}` (24 hours)

Any administrative update across Profile, Credentials, Education, Timeline, or Memberships immediately triggers `CmsCacheService::forgetProfile()`, purging both `en` and `bn` keys to prevent stale information from being served.
