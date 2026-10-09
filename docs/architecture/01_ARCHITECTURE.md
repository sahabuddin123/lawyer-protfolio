# 01. System Architecture Specification

**Project:** Nijam Uddin (Haq) — Premium Legal Authority & Portfolio Platform  
**Target Professional:** Nijam Uddin (Haq), Advocate, Supreme Court of Bangladesh  
**Architecture Classification:** Decoupled Monorepo (REST API + Reactive Client SPA)  
**Document Version:** 1.0.0 (Phase 1 Final)  
**Lead Coordinator:** Senior Solution Architect & Project Director  

---

## 1. Architectural Vision & Core Principles

The platform is designed as an institutional-grade legal authority showcase, personal brand repository, and client intake portal for Advocate Nijam Uddin. The architecture guarantees:
- **Absolute Separation of Concerns:** Zero blending of presentation logic and database operations.
- **Enterprise-Grade Security:** Strict protection of confidential legal documentation, defense against OWASP Top 10 vulnerabilities, and robust role-based access control (RBAC).
- **Sub-Second Performance & Core Web Vitals:** Static hydration patterns, client-side caching with TanStack Query, and optimized asset pipelines (WebP transformation of raw DSLR assets).
- **First-Class Bilingualism:** Native English and Bengali data handling at both database, API, and frontend levels.
- **Editorial Dignity:** Visual and functional alignment with high-status legal chamber standards, strictly adhering to Bangladesh Bar Council Canons of Professional Conduct.

---

## 2. High-Level System Architecture Diagram

```
+---------------------------------------------------------------------------------------------------------+
|                                              CLIENT TIER                                                |
|                                                                                                         |
|  +--------------------------------------------+       +-----------------------------------------------+ |
|  |           PUBLIC WEB PORTAL                |       |             ADMIN CONTROL CENTER              | |
|  |  React 19 + TypeScript + Vite + Tailwind   |       |   React 19 + TanStack Query + Form Engine     | |
|  |  Dual Language (EN / BN)                   |       |   Role-Based View & Module Guards             | |
|  |  Framer Motion Editorial Transitions       |       |   Rich Text & Media Asset Management          | |
|  +--------------------------------------------+       +-----------------------------------------------+ |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                   HTTPS / TLS 1.3   | JSON REST API (/api/v1)
                                   Bearer Token Auth | CORS Whitelisted
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                              SERVER TIER                                                |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                                      LARAVEL 11 REST API                                          |  |
|  |                                                                                                   |  |
|  |  [HTTP / Middleware Pipeline]                                                                     |  |
|  |   - Rate Limiting (Throttle)      - CORS Policy              - Sanctum Token Auth                 |  |
|  |   - Security Headers (CSP, HSTS)  - Localization Resolver    - Maintenance Mode Guard             |  |
|  |                                                                                                   |  |
|  |  [Controller Layer]               --> [Validation Layer]                                          |  |
|  |   - Thin RESTful Controllers           - Strict FormRequest Rules & Sanitization                  |  |
|  |                                                                                                   |  |
|  |  [Service & Business Layer]       --> [Authorization & RBAC]                                      |  |
|  |   - Domain Services                    - Spatie RBAC & Model Policies                             |  |
|  |   - Media Variant Pipeline             - Audit Logging Interceptor                                |  |
|  |   - Notification & Mail Service                                                                   |  |
|  |                                                                                                   |  |
|  |  [Transformation Layer]                                                                           |  |
|  |   - Uniform API Resources & JSON Envelopes                                                        |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                         PERSISTENCE & STORAGE TIER                                      |
|                                                                                                         |
|  +-----------------------------------------------+     +---------------------------------------------+  |
|  |             MYSQL 8.0.31 DATABASE             |     |              FILE SYSTEM STORAGE            |  |
|  |  nijamuddin_db                                |     |  storage/app/public/ (WebP/AVIF Variants)   |  |
|  |  Charset: utf8mb4, Collation: utf8mb4_unicode_ci |     |  storage/app/secure/ (Private Case Briefs)  |  |
|  |  22+ Normalized Tables, Composite Indexes     |     |  Streaming Controller with ACL Verification |  |
|  +-----------------------------------------------+     +---------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Directory & Repository Structure

The project uses a structured decoupled monorepo layout within `c:\wamp64\www\nijamuddin.com`:

```
c:\wamp64\www\nijamuddin.com\
├── backend/                       # Laravel 11 REST API Root
│   ├── app/
│   │   ├── Enums/                 # PHP 8.3 Backed Enums (ContentStatus, RoleType, etc.)
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   │       └── V1/        # Versioned Controllers (Public & Admin)
│   │   │   ├── Middleware/        # Security, i18n resolver, AuditLogger
│   │   │   ├── Requests/          # Dedicated FormRequests per endpoint
│   │   │   └── Resources/V1/      # API Transformer Resources
│   │   ├── Models/                # Eloquent Models with soft deletes & relationships
│   │   ├── Policies/              # Granular authorization policies
│   │   └── Services/              # Domain logic (MediaService, ContentService, etc.)
│   ├── config/                    # Sanctum, CORS, Purifier, Filesystems
│   ├── database/
│   │   ├── migrations/            # Ordered database migrations
│   │   ├── seeders/               # RBAC, Admin user, Initial CMS defaults
│   │   └── factories/             # Testing data factories
│   ├── routes/
│   │   ├── api.php                # /api/v1/ public and authenticated routes
│   │   └── console.php
│   └── tests/                     # Pest / PHPUnit Feature & Unit tests
│
├── frontend/                      # React 19 + TypeScript + Vite SPA
│   ├── public/                    # Favicon, robots.txt, static assets
│   ├── src/
│   │   ├── api/                   # Axios client instance, interceptors, query keys
│   │   ├── assets/                # Logos, static icons, editorial styling
│   │   ├── components/            # Reusable UI library (Atoms, Molecules, Organisms)
│   │   ├── context/               # AuthContext, ThemeContext, LocaleContext
│   │   ├── features/              # Feature modules (courtroom, research, admin, etc.)
│   │   ├── hooks/                 # Custom reusable hooks (useMedia, useDebounce, etc.)
│   │   ├── i18n/                  # Dictionary files (en.ts, bn.ts) & translation hook
│   │   ├── layouts/               # PublicLayout, AdminLayout, AuthLayout
│   │   ├── pages/                 # Route entry pages (Public & Admin)
│   │   ├── routes/                # React Router v7 configuration with guards
│   │   ├── schemas/               # Zod validation schemas matching backend requests
│   │   ├── types/                 # Strict TypeScript API & entity models
│   │   └── utils/                 # Formatting, date parsing, classname mergers
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── docs/                          # Comprehensive Architectural & Engineering Documentation
    └── architecture/              # 10 Phase 1 Specifications
```

---

## 4. Layer Responsibilities & Design Patterns

### 4.1 Backend Architecture (Laravel 11)
1. **Routing Layer (`routes/api.php`):** Versioned under `/api/v1/`. Strictly routes requests to controllers. Zero inline closure logic.
2. **Form Request Layer (`app/Http/Requests`):** Every mutating request (POST, PUT, PATCH) is validated by a dedicated FormRequest before touching controller logic. Validates data types, lengths, MIME types, file sizes, and uniqueness.
3. **Controller Layer (`app/Http/Controllers/Api/V1`):** Thin controllers. Their only responsibility is:
   - Accept the validated FormRequest.
   - Delegate business logic to the corresponding Service.
   - Return a standardized API Resource response.
4. **Service Layer (`app/Services`):** Encapsulates all domain and business operations:
   - File uploads, checksum generation, image resizing into WebP variants.
   - Content publishing workflows, slug generation with collision prevention.
   - HTML sanitization through `HTMLPurifier`.
   - Dispatching notifications, audit log records, and cache busting.
5. **Model Layer (`app/Models`):** Pure Eloquent mapping. Contains relationships, query scopes (e.g. `scopePublished`, `scopeFeatured`), casts (including JSON cast for localized attributes), and soft delete flags.
6. **API Resource Layer (`app/Http/Resources/V1`):** Formats output strictly according to the API contract. Strips sensitive internal IDs, tokens, or private notes from public consumption.

### 4.2 Frontend Architecture (React 19 + Vite)
1. **Network Layer (`src/api`):** Configured Axios instance with baseURL `/api/v1`, bearer token attachment from secure storage, request cancellation, and automated 401 refresh/redirect handling.
2. **State Management:**
   - **Server State:** Handled exclusively via TanStack Query (React Query) with optimistic updates, background caching, and automatic invalidation.
   - **Client State:** React Context for Authentication (`user`, `token`, `permissions`), Locale (`locale: 'en' | 'bn'`), and UI states (modals, drawers).
3. **Component Hierarchy (Atomic Design):**
   - **Atoms:** `Button`, `Input`, `Badge`, `GoldDivider`, `Typography`, `LazyImage`.
   - **Molecules:** `SearchBar`, `FilterDropdown`, `PaginationBar`, `CardHeader`, `Breadcrumb`.
   - **Organisms:** `Navbar`, `Footer`, `HeroSection`, `PracticeGrid`, `CaseCard`, `VideoModal`, `Lightbox`.
   - **Templates / Layouts:** `PublicLayout` (sticky header, hero, footer), `AdminLayout` (collapsible sidebar, breadcrumb, header bar).
   - **Pages:** Routed components lazy-loaded via `React.lazy()` for code-splitting.

---

## 5. Security & Boundary Architecture

1. **Public Domain Boundary:** Read-only access to published content, public case studies, media, and submission access to rate-limited contact/consultation endpoints.
2. **Admin Domain Boundary:** Protected by `auth:sanctum` and permission middleware (`permission:manage_*`). All mutations trigger an immutable record in `activity_logs`.
3. **Private Document Boundary:** Case documents flagged as `is_confidential = true` or `visibility = 'private'` are stored outside the public document root and streamed exclusively via an authenticated controller validating user clearance.

---

## 6. Architectural Decision Summary (ADR)

| Decision Item | Decision | Rationale |
| :--- | :--- | :--- |
| **Monorepo vs Polyrepo** | Decoupled Monorepo in single workspace root | Simplifies local development on WAMP, unified Git history, and enables seamless CI/CD. |
| **API Protocol** | Versioned REST (`/api/v1/`) | Highly predictable, excellent browser caching, standard tooling, and native fit with TanStack Query. |
| **Authentication Engine** | Laravel Sanctum Bearer Tokens | Stateless token management ideal for modern decoupled SPAs, mobile readiness, and high security. |
| **Image Pipeline** | Local GD/Imagick WebP Generation | Avoids expensive external cloud dependencies while guaranteeing 80%+ file size reduction for raw DSLR images. |
