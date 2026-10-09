# 04. Practice Area Admin Management & UX

**Component:** `PracticeAreasManager.tsx`  
**Route:** `/admin/practice-areas` & Embedded in `/admin/cms`  
**Guard:** `auth:sanctum` + `can('edit_practice_area')` / `can('create_practice_area')`  

---

## 1. Operational Overview

The Practice Areas administrative interface provides judicial back-office personnel with full lifecycle control over specializations. It includes:
- **Interactive Data Table:** Displays display order, bilingual titles, permalinks, icon indicators, publication badges, and featured star highlights.
- **Instant Filtering & Search:** Debounced keyword search across titles and descriptions, status dropdown filter (`All`, `Published`, `Draft`, `Archived`), and featured filter.
- **Single-Click Ordering:** Intuitive up/down row controls execute immediate asynchronous batch reordering via `POST /api/v1/admin/practice-areas/reorder`.
- **Comprehensive 3-Tab Editor Modal:**
  1. **Basic Information:** English and Bengali titles, collision-safe slug with auto-slug generation, visual grid icon selector with approved Lucide tokens, status selector, sort order, and featured toggle.
  2. **Descriptions & Content:** Tabbed English and Bengali editing for both short card excerpts and full jurisdictional HTML treatises.
  3. **SEO Metadata:** Granular search engine tags including bilingual meta titles, meta descriptions, canonical URLs, and indexation instructions.
- **Destructive Action Safety:** Soft-deletion confirmation modal ensures records are preserved in the database for auditing and recovery.

---

## 2. Slug Mutation & 301 Permanent Redirect Safety

When updating an existing practice area, if the record was previously in `'published'` status and the slug is modified:
1. The backend automatically records a permanent redirect in the `redirects` table:
   - `source_url`: `/practice-areas/{oldSlug}`
   - `target_url`: `/practice-areas/{newSlug}`
   - `status_code`: `301`
   - `is_active`: `true`
2. An audit event `redirect_created` is logged in `activity_logs`.
3. The frontend displays an amber advisory warning in the editor if a published slug is altered, informing the administrator of the automatic redirect creation.
