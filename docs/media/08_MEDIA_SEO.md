# Media Module SEO Architecture (Phase 12)

## 1. Overview
The Media Module integrates with the platform's core SEO architecture (`HasSeo` trait, `seo_meta` polymorphic table, and `SeoMetaResource`).

---

## 2. SEO Metadata Attributes
Each `MediaPress` and `MediaAppearance` record supports:
- **`seo_title`**: Bilingual title tag optimized for judicial and legal search intent.
- **`meta_description`**: Concise bilingual summary (150–160 characters).
- **`canonical_url`**: Canonical URL declaration to prevent duplicate content flags.
- **`og_title` & `og_description`**: Social sharing card metadata.
- **`og_image_id`**: Associated high-resolution preview image.
- **`robots`**: Standard indexing directives (e.g., `index, follow` for public articles).

---

## 3. Indexing Safety & Preview Controls
- **Draft & Private Exclusion**: Draft and private media items are strictly excluded from public listings, public APIs, and XML sitemaps.
- **Preview Robots Header**: The administrative preview endpoints (`/api/v1/admin/media/press/{id}/preview` and `/api/v1/admin/media/appearances/{id}/preview`) inject the strict header:
  ```http
  X-Robots-Tag: noindex, nofollow
  ```
  This ensures staging, draft, or administrative review URLs are never indexed by Googlebot or other web crawlers.

---

## 4. Automatic 301 Redirect Architecture
When a published media item's slug is updated by an administrator:
1. An entry is automatically created or updated in the `redirects` table:
   - `source_url`: `/media/press/{oldSlug}` or `/media/appearances/{oldSlug}`
   - `target_url`: `/media/press/{newSlug}` or `/media/appearances/{newSlug}`
   - `status_code`: `301`
   - `is_active`: `true`
2. Caches for both old and new slugs are instantly invalidated.
3. Search engines and external backlinks are safely redirected without broken links (404) or link equity loss.

---

## 5. Structured Data Semantics
- Press coverage utilizes `NewsArticle` / `Article` schema types where applicable.
- Electronic appearances maintain broadcast commentary semantics without confusing standalone video content (which belongs to Phase 13 Videos).
