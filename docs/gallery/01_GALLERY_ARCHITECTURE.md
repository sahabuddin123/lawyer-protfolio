# 01. Gallery Module Architecture

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** Solution Architect & Senior Laravel Engineer  
**System Classification:** Premium Judicial Visual Archive & Album CMS  

---

## 1. Executive Architectural Overview

The **Gallery Module** provides a dynamic, bilingual photographic library for the Advocate Nijam Uddin (Haq) platform. It documents visual evidence of the Advocate's institutional career: Supreme Court ceremonies, bar association convocations, national judicial seminars, chamber receptions, and community engagements.

### 1.1 Strict Separation of Concerns
- **Media Module (Phase 12):** Newspaper features (`media_press`) and television appearances (`media_appearances`) representing external journalistic citations.
- **Videos Module (Phase 13):** Audio-visual broadcast library with streaming players (`youtube`, `vimeo`, `external`).
- **Gallery Module (Phase 14):** Curated photographic albums with multi-image collections, custom sort orders, captions, alt texts, cover image logic, and responsive lightboxes.

Photographs from TV appearances or conferences do NOT automatically duplicate into Media or Video records. Relationships are explicit, distinct, and administrator-curated.

---

## 2. Multi-Tier Subsystem Layout

```
Client Browser (React 19 / Vite / Tailwind)
   ├── Public Gallery Archive (/gallery)
   │     ├── Page Header & Judicial Eyebrow
   │     ├── Featured Album Hero Card
   │     ├── Category Filter Pills
   │     ├── Responsive Album Grid with Image Count Badges
   │     └── Accessible Pagination
   │
   ├── Public Album Detail (/gallery/:slug)
   │     ├── Breadcrumb Navigation
   │     ├── Bilingual Album Metadata & Summary
   │     ├── Responsive Photo Grid / Masonry with Hover Captions
   │     ├── Accessible Lightbox (Fullscreen, Keyboard Nav, Touch Swipe)
   │     └── Related Albums Carousel
   │
   └── Admin CMS Console (/admin/gallery)
         ├── GalleryManager Datagrid with Filters & Real-Time Search
         ├── Tabbed Album Modal (General, Content, Photos, Publishing, SEO)
         ├── In-Modal Photo Manager (Upload, Reorder, Captions, Set Cover)
         └── Sandboxed Draft Preview (X-Robots-Tag: noindex)
```

---

## 3. Core Architectural Highlights

1. **Centralized Media Library Integration:**
   - Gallery images reference the centralized `media` table via `media_id` foreign keys.
   - Albums and images never store raw binary image files directly in gallery tables.
   - Deleting a gallery image or album removes only the gallery relational record; underlying assets in `media` are never accidentally destroyed.
2. **Deterministic Cover Image Hierarchy:**
   - Administrators can explicitly assign an album cover (`cover_image_id`).
   - If unassigned, the system deterministically resolves the cover image from the first public image in the album (`images()->ordered()->first()`).
3. **High-Performance Image Loading & Prevention of Layout Shifts (CLS):**
   - Public thumbnails and album cards render using CSS aspect ratios (`aspect-video`, `aspect-[4/3]`, `aspect-square`).
   - Image cards load lazily with `loading="lazy"`.
   - Lightbox only loads full-resolution assets upon active interaction.
4. **Collision-Safe Slugs & Automated 301 Redirects:**
   - Slugs are lowercase, URL-safe strings generated from the English title.
   - When a published album's slug changes, a permanent 301 redirect is automatically recorded in the `redirects` table.
5. **Zero Synthetic Production Content:**
   - Test fixtures are explicitly prefixed with `TEST — ...`.
   - Production database is strictly populating administrator-verified content.
