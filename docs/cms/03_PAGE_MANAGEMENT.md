# 03 — Static Page Management

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 5: CMS + Site Settings Engine

---

## 1. Overview

The Static Page Management module provides an editorial workflow for managing institutional and legal pages on the platform (e.g., About, Disclaimer, Privacy Policy, Terms of Service, Chamber Information).

It enforces strict publication states, collision-resistant slug handling, automatic 301 redirect generation upon slug renaming, and defense-in-depth HTML sanitization.

---

## 2. Page Life Cycle & Statuses

Pages transition through four explicit states defined in the `Page` model and database enum:

```
                  +-----------------------------+
                  |            DRAFT            | <---+
                  +-----------------------------+     |
                     |                       |        |
        Published    |                       |        | Reverted to Draft
        Date <= Now  |                       |        |
                     v                       |        |
           +-------------------+             |        |
           |     PUBLISHED     |             |        |
           +-------------------+             |        |
                     |                       |        |
                     | Direct                |        |
                     | Archive               |        |
                     v                       v        |
           +------------------------------------+     |
           |             ARCHIVED               | ----+
           +------------------------------------+
```

1. **`draft`**: Visible only to authenticated administrators with `manage_pages` permission. Hidden from public routes (`404 Not Found`).
2. **`published`**: Publicly accessible via `/api/v1/pages/{slug}` provided `published_at <= NOW()`.
3. **`scheduled`**: Becomes published automatically once `published_at` passes.
4. **`archived`**: Hidden from public view, preserving content history without breaking editorial databases.

---

## 3. Safe Slug Management & Automatic Redirects

### Slug Format
Slugs are validated to be strictly lowercase, URL-safe alphanumeric characters and hyphens (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).

### Auto-Redirect on Slug Modification
When a page that has already been published undergoes a slug change (e.g. from `/disclaimer-old` to `/legal-disclaimer`):
1. `AdminPageController@update` detects the slug change.
2. An automatic **HTTP 301 Permanent Redirect** record is created in the `redirects` table mapping the old path `/pages/{old-slug}` to the new path `/pages/{new-slug}`.
3. This prevents broken bookmarks, search index degradation, or dead links.

### Slug Collision Prevention
The `slug` field is indexed with a `UNIQUE` constraint in the database. Form requests validate uniqueness with an exception for the current record ID.

---

## 4. Rich Text & XSS Sanitization

Content bodies for both English and Bangla (`content['en']` and `content['bn']`) are passed through `App\Services\HtmlSanitizer` before persistence:
- **Allowed Tags**: `p`, `br`, `b`, `strong`, `i`, `em`, `u`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `ul`, `ol`, `li`, `blockquote`, `a`, `img`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `code`, `pre`, `hr`, `span`, `div`.
- **Allowed Attributes**: `href`, `title`, `src`, `alt`, `width`, `height`, `class`, `id`, `target`, `rel`.
- **Stripped Elements**: `<script>`, `<style>`, `<iframe>`, `<embed>`, `<object>`, event handlers (`onclick`, `onload`, `onerror`, `onmouseover`), and dangerous URI schemes (`javascript:`, `vbscript:`, `data:`).

---

## 5. API Reference

### Public API
- `GET /api/v1/pages/{slug}`
  - Returns the requested page resource if `status = 'published'` and `published_at <= NOW()`.
  - Returns `404 Not Found` if the page is draft or archived.
  - Automatically eager-loads polymorphic `seoMeta`.
  - Caches response for 24 hours under `cms.public.pages.{slug}.{lang}`.

### Admin API
- `GET /api/v1/admin/pages`: Paginated list of all pages with search, status filter, and eager-loaded author.
- `POST /api/v1/admin/pages`: Create a new page with bilingual title, content, excerpt, and optional SEO metadata.
- `GET /api/v1/admin/pages/{id}`: Detailed page view including SEO metadata.
- `PUT /api/v1/admin/pages/{id}`: Update page, re-sanitize content, auto-generate redirect if slug altered, and purge caches.
- `DELETE /api/v1/admin/pages/{id}`: Delete page, purge cache, and log audit event.
