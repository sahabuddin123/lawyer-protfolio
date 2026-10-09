# 04. Legal Research — Administrative Operations & Back-Office UI

**Module Component:** `ResearchManager.tsx` (`frontend/src/features/research/`)  
**Route:** `/admin/research` (and tab inside `/admin/cms`)  
**Guards:** Sanctum Authentication + Spatie RBAC Permissions

---

## 1. Back-Office Functional Specifications

The administrative workspace is designed for authorized legal editors and chambers administrators to oversee the lifecycle of academic treatises and legal monographs.

### 1.1 Management View
1. **Search & Multi-Filter Header:**
   - Real-time text search targeting titles (EN/BN), author identity, and URL slugs.
   - Status filters: `draft`, `published`, `archived`.
   - Visibility filters: `public`, `private`.
   - Classification filter: `article`, `case_analysis`, `research_paper`, `constitutional_analysis`, `statutory_analysis`, `legal_opinion`, `commentary`.
   - Dynamic Category dropdown: populated directly from `/api/v1/admin/taxonomies/categories?type=research`.
2. **Tabular Monograph Grid:**
   - Display columns: Title & Classification, Category, Author, Research Date, Status, Visibility, PDF indicator, and Actions.
   - Action controls: Preview Draft (Eye), Edit (Pencil), Delete (Trash), PDF Download (File icon).

---

## 2. Monograph Editor Modal Tabs

The editor modal (`Modal size="xl"`) is structured into four focused operational tabs:

1. **Tab 1: General & Author**
   - Title in English and Bengali.
   - Kebab-case URL slug (auto-slug generation on initial English title entry).
   - Research Classification enum selection.
   - Category dropdown with inline "+ New Category" quick creation drawer.
   - Research/Publication Date picker.
   - Author Name in English and Bengali (must be explicitly inputted; never assumed).
   - Multi-tag selector with inline "+ New Tag" quick creator.
2. **Tab 2: Excerpt & Content**
   - Interactive language switcher (`English` / `বাংলা`).
   - Executive Excerpt textarea for high-impact citations and abstracts.
   - Monograph Body textarea supporting semantic headings, styled blockquotes, statutory citations, and comparative tables.
3. **Tab 3: Media & PDF**
   - Featured Image Media ID.
   - PDF Document Media ID.
   - External Reference / Law Review URL.
4. **Tab 4: Publishing & SEO**
   - Editorial Status: Draft, Published, Archived.
   - Visibility Tier: Public, Private.
   - Featured Monograph toggle switch.
   - Sort Order weight integer.
   - Meta Title (EN/BN), Meta Description (EN/BN), and Canonical URL overrides.

---

## 3. Draft Preview Engine

- Authorized administrators can inspect draft monographs prior to public publication via the **Preview Draft** trigger (`GET /api/v1/admin/research/{id}/preview`).
- The preview engine sends the HTTP header `X-Robots-Tag: noindex, nofollow` to guarantee zero search crawler indexing or leakages.
