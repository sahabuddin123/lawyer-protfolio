# Performance Architecture — Advocate Nijam Uddin (Haq)

### 1. Overview
The performance architecture balances deep editorial content with sub-second page delivery across desktop and mobile devices.

Key Architectural Principles:
1. **Zero Monolithic Bloat**: Strict code-splitting between public visitor routes and administrative management interfaces.
2. **Lean Initial Bundles**: Public JavaScript payload reduced to minimal critical execution requirements.
3. **Database Efficiency**: Eager-loading of polymorphic relations and indexed status queries eliminating N+1 queries.
4. **Cache-First Public APIs**: Cached summary payloads for frequently accessed landing views.

---

### 2. Frontend Bundle Breakdown (Phase 17 Results)

| Asset Chunk | Pre-Optimization | Post-Optimization | Delta | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Main Public Entry JS** | 772.46 kB (135.37 kB gzip) | **123.07 kB** (29.11 kB gzip) | **-84.1%** | Admin panels and secondary pages isolated into dynamic imports |
| **Admin Module (`cms-*.js`)** | Inlined into main bundle | **68.03 kB** (12.38 kB gzip) | **Isolated** | Only fetched when navigating to `/admin/*` |
| **Secondary Public Pages** | Inlined into main bundle | **9.1 kB – 19.9 kB** | **Code-Split**| Dynamically loaded on route navigation |
| **CSS Bundle** | 75.18 kB (12.86 kB gzip) | **75.25 kB** (12.87 kB gzip) | Constant | Clean Tailwind utility tokens without redundant styles |

---

### 3. Backend & API Optimization
- **Eager Loading**: Endpoints query relations explicitly (e.g., `with(['category', 'tags', 'media', 'seo'])`) to eliminate N+1 database queries.
- **Selective Columns**: Summary APIs select only public editorial columns (`id`, `title`, `slug`, `excerpt`, `published_at`, `status`), avoiding large serialized blobs or internal admin fields.
- **Cache Tags & Fallback**: Cache keys (`cms:home:public`, `cms:sitemap:xml`, `cms:settings`) are managed via `CmsCacheService`. On file/redis cache drivers, automatic key-invalidation triggers on every update.
- **Sitemap Compression**: Dynamic XML responses utilize stream output and caching to yield TTFB under 120ms.
