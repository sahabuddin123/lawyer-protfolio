# 03. Legal Research — Public & Admin API Contracts

**Base URL:** `/api/v1`  
**Protocol:** REST over HTTPS / TLS 1.3  
**Localization:** `Accept-Language: en` | `Accept-Language: bn`

---

## 1. Public API Endpoints

### 1.1 List Published Legal Research
- **`GET /api/v1/research`**
- **Auth:** None (Public)
- **Query Parameters:**
  - `page`: Integer (default: 1)
  - `per_page`: Integer (min: 1, max: 50, default: 12)
  - `search` / `q`: String (searches title, author, excerpt, tags, category)
  - `category`: String (slug or ID)
  - `tag`: String (slug)
  - `type` / `research_type`: String (enum filter)
  - `featured`: Boolean (true / false)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Legal research monographs retrieved successfully.",
  "data": [
    {
      "id": 1,
      "slug": "constitutional-doctrine-writ-jurisdiction",
      "research_type": "constitutional_analysis",
      "title": "Constitutional Doctrine and Writ Jurisdiction",
      "author": "Advocate Nijam Uddin (Haq)",
      "excerpt": "A deep comparative study of Article 102...",
      "category_id": 3,
      "category": {
        "id": 3,
        "name": "Constitutional Law",
        "slug": "constitutional-law"
      },
      "tags": [
        { "id": 12, "name": "Fundamental Rights", "slug": "fundamental-rights" }
      ],
      "research_date": "2026-04-10",
      "read_time_minutes": 8,
      "has_pdf": true,
      "pdf_download_url": "/api/v1/research/constitutional-doctrine-writ-jurisdiction/download",
      "external_url": null,
      "view_count": 240,
      "is_featured": true,
      "published_at": "2026-04-12T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "total": 1,
    "last_page": 1,
    "locale": "en"
  }
}
```

### 1.2 Get Research Detail
- **`GET /api/v1/research/{slug}`**
- **Auth:** None (Public)
- **Response `200 OK`:** Full monograph payload including resolved rich-text `content`, full PDF media metadata, and related research array.
- **Response `404 Not Found`:** Returned if slug does not exist, or `status != 'published'`, or `visibility != 'public'`.

### 1.3 Download Attached PDF Document
- **`GET /api/v1/research/{slug}/download`**
- **Auth:** None (Public)
- **Headers:** `Content-Type: application/pdf`, `X-Content-Type-Options: nosniff`
- **Response `404 Not Found`:** Returned if research is unpublished, private, or has no attached document.

---

## 2. Administrative Control Endpoints

All admin endpoints require `auth:sanctum` and verified RBAC permissions.

| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/research` | `edit_research\|create_research` | Paginated listing with draft/visibility filters |
| `POST` | `/api/v1/admin/research` | `create_research` | Create monograph with bilingual fields & SEO |
| `GET` | `/api/v1/admin/research/{id}` | `edit_research\|create_research` | Full raw bilingual model for editing |
| `PUT` | `/api/v1/admin/research/{id}` | `edit_research` | Update monograph (auto 301 on published slug change) |
| `DELETE` | `/api/v1/admin/research/{id}` | `delete_research` | Soft-delete research record & flush cache |
| `POST` | `/api/v1/admin/research/reorder` | `edit_research` | Batch update `sort_order` array |
| `GET` | `/api/v1/admin/research/{id}/preview` | `edit_research\|create_research` | Preview draft with `X-Robots-Tag: noindex, nofollow` |
| `GET` | `/api/v1/admin/research/{id}/download` | `edit_research\|create_research` | Authenticated staff document download stream |
