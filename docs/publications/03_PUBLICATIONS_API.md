# Publications API Specification (Phase 11)

## 1. Overview
All endpoints return standard envelope responses:
```json
{
  "success": true,
  "data": { ... },
  "message": "...",
  "meta": { ... }
}
```

## 2. Public Endpoints (Unauthenticated)

### `GET /api/v1/publications`
List published and public publications. Cached for 24 hours (86,400 seconds).

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Records per page (default: 12, max: 50)
- `search` / `q`: Keyword search against title, publication name, author, excerpt, and tags.
- `type`: Publication type filter (`book`, `journal_article`, `research_paper`, etc.)
- `category`: Category slug or ID.
- `tag`: Tag slug or name.
- `author`: Author name substring.
- `year`: Publication year.
- `featured`: Filter by `is_featured` (`1` / `true`).
- `sort_by`: Sort column (`publication_date`, `created_at`, `sort_order`, `title`).
- `sort_dir`: Sort direction (`asc`, `desc`).

**Response Schema (`PublicPublicationResource`):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "treatise-on-constitutional-jurisprudence",
      "publication_type": "book",
      "title": "Treatise on Constitutional Jurisprudence",
      "publication_name": "Supreme Court Bar Journal",
      "publication_date": "2024-05-15",
      "author": "Advocate Nijam Uddin",
      "excerpt": "Comprehensive analysis of constitutional review...",
      "category": { "id": 1, "name": "Constitutional Law", "slug": "constitutional-law" },
      "tags": [ { "id": 4, "name": "Fundamental Rights", "slug": "fundamental-rights" } ],
      "cover_image": { "id": 10, "url": "https://.../cover.jpg", "alt_text": "Cover" },
      "has_pdf": true,
      "pdf_url": "https://.../api/v1/publications/treatise-on-constitutional-jurisprudence/download",
      "external_url": "https://doi.org/...",
      "is_featured": true,
      "sort_order": 0,
      "published_at": "2024-05-15T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 12,
    "total": 35
  }
}
```

### `GET /api/v1/publications/{slug}`
Retrieve complete publication dossier by unique slug.
Returns `404 Not Found` if status is draft/archived or visibility is private.

**Response Schema (`PublicPublicationDetailResource`):**
Includes everything in the list response plus:
- `content`: Sanitized HTML or long-form narrative.
- `pdf_media`: Attached PDF metadata (file name, size bytes, MIME type, download URL).
- `related_publications`: Deterministically related published items (by category, type, or tags).
- `seo`: Comprehensive meta tags, canonical URL, OG tags, and structured data.

### `GET /api/v1/publications/{slug}/download`
Secure download endpoint for public attached PDFs.
- Strictly validates that the publication is published and public.
- Streams the document via Laravel Storage with `Content-Type: application/pdf` and `Content-Disposition: inline/attachment`.
- Throws `404 Not Found` if the document is absent or publication is restricted.

---

## 3. Admin Endpoints (Authenticated — Sanctum + Spatie RBAC)

All admin routes are prefixed with `/api/v1/admin/publications`.

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `GET` | `/admin/publications` | `edit_publications` or `create_publications` | Full admin list with draft/private filtering |
| `POST` | `/admin/publications` | `create_publications` | Create new publication |
| `GET` | `/admin/publications/{id}` | `edit_publications` or `create_publications` | Admin detailed view with full raw JSON |
| `PUT` | `/admin/publications/{id}` | `edit_publications` | Update publication (creates 301 on slug change) |
| `DELETE` | `/admin/publications/{id}` | `delete_publications` | Soft delete publication |
| `POST` | `/admin/publications/reorder` | `edit_publications` | Batch reorder publication ranks |
| `GET` | `/admin/publications/{id}/preview` | `edit_publications` or `view_cms` | Preview draft with `X-Robots-Tag: noindex, nofollow` |
| `GET` | `/admin/publications/{id}/download` | `edit_publications` or `create_publications` | Download attached document in back-office |
