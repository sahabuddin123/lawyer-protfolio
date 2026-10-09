# 05 — Homepage Section Management

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 5: CMS + Site Settings Engine

---

## 1. Overview

The Homepage Section Management subsystem controls the structure, sequence, visibility, and presentation copy of the homepage blocks. In strict accordance with the Phase 5 boundaries:
- **This module governs configuration containers only.**
- **No domain CRUD** (Practice Areas, Courtroom cases, Publications, Research, Gallery, etc.) has been implemented in Phase 5.
- The sections act as structured envelopes that specify titles, subtitles, call-to-action (CTA) buttons, layout variants, and display ranks. Future domain phases will feed their dynamic data directly into these section containers.

---

## 2. Approved Section Types

The system provides 12 approved section containers matching the architecture:

| Key | Section Name | Role & Content |
| :--- | :--- | :--- |
| `hero` | Hero Authority Section | Supreme Court Advocate credentials, portrait banner, primary CTA |
| `credentials` | Bar & Judicial Credentials | High Court Division enrolment, legal qualifications bar |
| `about_preview` | Judicial Philosophy Preview | Executive overview of legal career and advocacy ethos |
| `practice_areas` | Core Practice Areas | Constitutional, Criminal, Civil, and Corporate law previews |
| `courtroom` | Landmark Cases & Courtroom | Preview container for Supreme Court & Appellate Division advocacy |
| `judgment_reviews`| Judicial Precedents & Reviews | Scholarly analysis and commentary on landmark rulings |
| `research` | Legal Research & Insights | Constitutional doctrine papers and legal essays |
| `publications` | Books & Judicial Treatises | Published volumes and institutional publications |
| `videos` | Keynote Speeches & Debates | Video lectures and television legal analyses |
| `media` | Press & Editorial Coverage | National daily interviews and legal press quotes |
| `gallery` | Judicial Events & Chambers | High Court ceremonies, bar association conferences |
| `consultation_cta` | Chamber Consultation CTA | Formal chamber appointment and protocol gateway |

---

## 3. Database Schema

### `homepage_sections`
- `id` (bigint unsigned, PK)
- `key` (varchar, UNIQUE): Machine key from the approved 12 section types
- `title` (json): Bilingual titles `{"en": "...", "bn": "..."}`
- `subtitle` (json, NULLABLE): Bilingual subtitles `{"en": "...", "bn": "..."}`
- `content` (json, NULLABLE): Custom JSON configuration (layout presets, badge text, item limit)
- `cta_text` (json, NULLABLE): Bilingual CTA button labels `{"en": "...", "bn": "..."}`
- `cta_url` (varchar, NULLABLE): Target internal route or URL
- `is_enabled` (boolean): Visibility toggle on public homepage
- `sort_order` (integer): Display order (ascending)
- `created_at`, `updated_at` (timestamps)

---

## 4. Reordering & Layout Governance

1. **Sort Order Integrity**: Sections are ordered via an integer `sort_order` column.
2. **Batch Reordering API**: Admin users can reorder sections via a single batch request `POST /api/v1/admin/homepage/sections/reorder` by providing an ordered array of IDs.
3. **Public Exposure**: The public endpoint `GET /api/v1/home` retrieves only sections where `is_enabled = 1` ordered strictly by `sort_order ASC`.
4. **Cache Invalidation**: Any section modification or reordering event immediately triggers `CmsCacheService::purgeHomepage()`.

---

## 5. API Reference

### Public API
- `GET /api/v1/home`
  - Returns array of active homepage sections sorted by `sort_order ASC`.
  - Cached for 24 hours under `cms.public.home.{lang}`.

### Admin API
- `GET /api/v1/admin/homepage/sections`: List all 12 sections with full configuration.
- `GET /api/v1/admin/homepage/sections/{id}`: Detailed section configuration.
- `PUT /api/v1/admin/homepage/sections/{id}`: Update section copy, subtitles, CTAs, and visibility.
- `POST /api/v1/admin/homepage/sections/reorder`: Update display sequence across all sections.
