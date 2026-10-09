# 09. Gallery Search Engine Optimization & Indexing Safety

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** SEO Specialist & Senior Solution Architect  
**Controllers:** `PublicGalleryController.php`, `AdminGalleryAlbumController.php`

---

## 1. SEO Metadata Architecture

The Gallery module leverages the platform's unified `SeoMeta` polymorphic relationship (`HasSeo` trait) on `GalleryAlbum`.

### 1.1 Supported Metadata Fields
- **Meta Title:** Bilingual (`en`/`bn`), defaulting to `[Album Title] | Advocate Nijam Uddin`.
- **Meta Description:** Bilingual (`en`/`bn`), defaulting to excerpt of album description.
- **Canonical URL:** Configurable, defaulting to `/gallery/[slug]`.
- **OpenGraph & Twitter Card:**
  - `og:type`: `article`
  - `og:title`: Album title.
  - `og:image`: Resolved album cover image URL (original or card variant).
  - `og:description`: Album narrative summary.

---

## 2. Indexing Safety & Draft Protection

1. **Strict 404 for Unpublished Records:**
   - Albums with status `draft` or `archived` return HTTP `404 Not Found` on public endpoints (`/api/v1/gallery/{slug}`).
   - Albums with visibility `private` return HTTP `404 Not Found`.
2. **Admin Draft Preview Security:**
   - Admin preview endpoint (`/api/v1/admin/gallery/{id}/preview`) allows authenticated chamber administrators to review draft albums before public release.
   - **Mandatory Header:** Always returns header `X-Robots-Tag: noindex, nofollow, noarchive` to prevent search crawlers from accidentally indexing unpublished photographic collections.
3. **Automated 301 Permanent Redirects:**
   - When an administrator modifies the slug of a previously published album, the system writes a permanent redirect record in the `redirects` table (`/gallery/{old_slug}` ➔ `/gallery/{new_slug}`).
   - Public requests to `/gallery/{old_slug}` receive HTTP `301 Moved Permanently` pointing to the canonical new slug.
