# Publications Administration & Back-Office Manual (Phase 11)

## 1. Overview
The Publications Management interface is accessible via the **Judicial Back-Office** (`/admin/cms`, tab: **Publications**) or directly via `/admin/publications`.

It provides a comprehensive editorial workspace built with React and TypeScript, fully integrated with Sanctum authentication and Spatie RBAC.

## 2. RBAC Permissions
In accordance with `docs/architecture/09_RBAC_MATRIX.md`:
- `create_publications`: Allows drafting and submitting new publication records.
- `edit_publications`: Allows editing existing publications, updating metadata, and batch reordering.
- `delete_publications`: Allows soft deletion of publications.
- `publish_publications`: Governs promoting drafts to live published status.

## 3. Back-Office Features

### 3.1 Publication Grid & Filters
- **Search Bar**: Instant keyword search matching titles, authors, publishers, or slugs.
- **Type Filter**: Filter by `book`, `journal_article`, `research_paper`, `conference_paper`, etc.
- **Category Filter**: Filter by assigned legal domain.
- **Status Filter**: View `all`, `published`, `draft`, or `archived`.
- **Visibility Filter**: Segregate `public` from internal `private` records.
- **Rank Ordering**: Move rows up/down using order buttons and persist rankings via **Save Order**.

### 3.2 Modal Form Sections
The creation and editing modal organizes fields into six focused tabs:
1. **Basic Info**: Title (EN & BN), Slug (auto-derived, collision-checked), Publication Type, Category, Author (EN & BN), Publication Date, and Subject Tags.
2. **Editorial Content**: Excerpt/Abstract (EN & BN), Full Content / Table of Contents / Chapters (EN & BN HTML/Text).
3. **Source & Publisher**: Publication / Journal / Publisher name (EN & BN), External URL / DOI Link.
4. **Documents & Media**: Cover Image Media ID, Downloadable PDF Media ID.
5. **Publishing**: Status (`draft`, `published`, `archived`), Visibility (`public`, `private`), Sort Order, and Featured toggle.
6. **SEO Metadata**: SEO Title (EN & BN), Meta Description (EN & BN), and Canonical URL.

### 3.3 Draft Preview System
- Back-office administrators can view draft or private publications in a simulated dossier modal before release.
- The preview response explicitly issues `X-Robots-Tag: noindex, nofollow` to prevent accidental crawler indexing.

### 3.4 Soft Deletion & Audit Logging
- Deletions are strictly non-destructive (`SoftDeletes`).
- Every administrative action (create, update, delete, reorder, slug redirect) generates an immutable entry in `activity_logs`.
