# 03. Judgment Reviews — API Specification & Contracts

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis  
**Protocol:** RESTful JSON over HTTPS

---

## 1. Route Registry

### Public Endpoints (`/api/v1/judgments`)

| Method | Endpoint | Description | Cache Policy |
|---|---|---|---|
| `GET` | `/api/v1/judgments` | Paginated listing of published, public reviews. Supports filtering by search, court, legal_area, practice_area_id, category_id, tag_id, year. | 24 Hours (`TTL_JUDGMENTS`) |
| `GET` | `/api/v1/judgments/{slug}` | Full dossier of a single judgment review by slug. Returns 404 for drafts/private records. | 24 Hours (`TTL_JUDGMENTS`) |
| `GET` | `/api/v1/judgments/{slug}/download` | Direct streaming download of the attached judgment PDF. Returns 404/403 for private/draft files. | Dynamic / No-Cache |

### Admin Endpoints (`/api/v1/admin/judgments`) — Requires `auth:sanctum` & Permissions

| Method | Endpoint | Required Permission | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/judgments` | `view_cms` or `edit_judgments` | Administrative directory with full filtering and internal metrics. |
| `POST` | `/api/v1/admin/judgments` | `create_judgments` | Create a new judgment review with bilingual payload. |
| `GET` | `/api/v1/admin/judgments/{id}` | `view_cms` or `edit_judgments` | Retrieve raw model data for editorial editing. |
| `PUT` | `/api/v1/admin/judgments/{id}` | `edit_judgments` | Update existing review, handling automated 301 slug redirect generation. |
| `DELETE` | `/api/v1/admin/judgments/{id}` | `delete_judgments` | Soft delete the judgment review record. |
| `POST` | `/api/v1/admin/judgments/reorder` | `edit_judgments` | Batch update `sort_order` for reviews. |
| `GET` | `/api/v1/admin/judgments/{id}/preview` | `edit_judgments` | Securely preview draft or private review. Serves `X-Robots-Tag: noindex, nofollow`. |
| `GET` | `/api/v1/admin/judgments/{id}/download` | `view_cms` or `edit_judgments` | Secure download of judgment PDF for staff/reviewers. |

---

## 2. Public API Response Contract

### `GET /api/v1/judgments`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "case_name": "Dr. Kamal Hossain & Others v. Bangladesh & Others",
      "slug": "kamal-hossain-v-bangladesh-writ-841",
      "citation": "71 DLR (HCD) 345",
      "court": "High Court Division, Supreme Court of Bangladesh",
      "judgment_date": "2019-04-18",
      "legal_area": "Constitutional Law & Judicial Review",
      "summary": "Administrative overview of public interest litigation on fundamental rights...",
      "practice_area": {
        "id": 2,
        "title": "Constitutional & Administrative Law",
        "slug": "constitutional-law"
      },
      "category": {
        "id": 5,
        "name": "Appellate Decisions",
        "slug": "appellate-decisions"
      },
      "tags": [
        { "id": 12, "name": "Article 102", "slug": "article-102" }
      ],
      "featured_image": {
        "id": 40,
        "url": "/storage/media/supreme-court-bench.webp",
        "alt_text": "Supreme Court Bench"
      },
      "pdf_url": "/api/v1/judgments/kamal-hossain-v-bangladesh-writ-841/download",
      "is_featured": true,
      "sort_order": 1,
      "published_at": "2026-10-06T10:00:00.000000Z"
    }
  ],
  "links": { ... },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 12,
    "total": 1
  }
}
```

### `GET /api/v1/judgments/{slug}`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "case_name": "Dr. Kamal Hossain & Others v. Bangladesh & Others",
    "slug": "kamal-hossain-v-bangladesh-writ-841",
    "citation": "71 DLR (HCD) 345",
    "court": "High Court Division, Supreme Court of Bangladesh",
    "judgment_date": "2019-04-18",
    "legal_area": "Constitutional Law & Judicial Review",
    "summary": "Administrative overview of public interest litigation on fundamental rights...",
    "key_issues": "1. Maintainability of writ under Article 102(2)(a).\n2. Scope of locus standi...",
    "court_decision": "The Special Bench held that bona fide public interest litigants possess locus standi to question arbitrary executive actions...",
    "author_analysis": "The ruling marks a decisive reaffirmation of public interest litigation jurisprudence in Bangladesh, expanding the horizon of constitutional redress...",
    "practical_significance": "Litigants are no longer burdened with demonstrating direct personal injury when asserting breaches of public statutory duties...",
    "author": "Advocate Nijam Uddin (Haq)",
    "practice_area": { ... },
    "category": { ... },
    "tags": [ ... ],
    "featured_image": { ... },
    "pdf_document": {
      "id": 92,
      "title": "Certified Copy - Writ Petition 841",
      "file_name": "writ-841-certified.pdf",
      "file_size": 1428590,
      "download_url": "/api/v1/judgments/kamal-hossain-v-bangladesh-writ-841/download"
    },
    "legal_research": {
      "id": 4,
      "title": "Locus Standi & The Evolution of Public Interest Litigation in Bangladesh",
      "slug": "locus-standi-evolution-pil-bangladesh"
    },
    "related_judgments": [ ... ],
    "seo": {
      "meta_title": "Dr. Kamal Hossain v. Bangladesh | Judgment Review & Legal Analysis",
      "meta_description": "Comprehensive doctrinal analysis of 71 DLR (HCD) 345 regarding locus standi under Article 102...",
      "canonical_url": "https://nijamuddin.com/judgments/kamal-hossain-v-bangladesh-writ-841"
    }
  }
}
```
