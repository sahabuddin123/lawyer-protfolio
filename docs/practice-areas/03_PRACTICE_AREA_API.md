# 03. Practice Area API Specification

**Base URL:** `/api/v1`  
**Authentication:** Bearer token (Laravel Sanctum) for administrative endpoints.  
**Rate Limiting:** Public: 60 req/min; Admin: 120 req/min.  

---

## 1. Public Endpoints

### 1.1 List Practice Areas
- **Endpoint:** `GET /api/v1/practice-areas`
- **Visibility:** Returns published records only (`status = 'published'`).
- **Query Parameters:**
  - `page` (integer, default: 1): Page number.
  - `per_page` (integer, default: 12, max: 50): Items per page.
  - `search` / `q` (string, optional): Search keyword against bilingual title, short description, and slug.
  - `featured` (boolean, optional): Filter by `is_featured = true`.
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Practice areas retrieved successfully.",
    "data": [
      {
        "id": 1,
        "slug": "constitutional-writ-practice",
        "title": "Constitutional & Writ Practice",
        "short_description": "High Court Division writ petitions.",
        "icon_name": "scale",
        "featured_image": null,
        "is_featured": true,
        "sort_order": 1,
        "published_at": "2026-10-06T20:00:00+06:00"
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 12,
      "total": 1,
      "last_page": 1,
      "from": 1,
      "to": 1,
      "locale": "en",
      "timestamp": "2026-10-06T22:00:00+06:00"
    }
  }
  ```

### 1.2 Get Practice Area by Slug
- **Endpoint:** `GET /api/v1/practice-areas/{slug}`
- **Visibility:** Published records only. Draft/archived records return 404.
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Practice area retrieved successfully.",
    "data": {
      "id": 1,
      "slug": "constitutional-writ-practice",
      "title": "Constitutional & Writ Practice",
      "short_description": "High Court Division writ petitions.",
      "full_description": "<p>Detailed constitutional representation.</p>",
      "icon_name": "scale",
      "featured_image": null,
      "is_featured": true,
      "sort_order": 1,
      "published_at": "2026-10-06T20:00:00+06:00",
      "seo": {
        "id": 5,
        "seo_title": "Constitutional Law | Supreme Court",
        "meta_description": "Advocate Nijam Uddin constitutional writ advocacy.",
        "canonical_url": null,
        "og_title": null,
        "og_description": null,
        "og_image_id": null,
        "og_image_url": null,
        "robots": "index, follow",
        "schema_type": null,
        "structured_data": null
      },
      "created_at": "2026-10-06T20:00:00+06:00",
      "updated_at": "2026-10-06T20:00:00+06:00"
    },
    "meta": {
      "timestamp": "2026-10-06T22:00:00+06:00",
      "locale": "en"
    }
  }
  ```

---

## 2. Admin Endpoints

| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/practice-areas` | `edit_practice_area\|create_practice_area` | List all records with draft/archived filters. |
| `POST` | `/api/v1/admin/practice-areas` | `create_practice_area` | Create new practice area. |
| `POST` | `/api/v1/admin/practice-areas/reorder` | `edit_practice_area` | Batch reorder records by array of IDs. |
| `GET` | `/api/v1/admin/practice-areas/{id}` | `edit_practice_area` | Get raw bilingual record for edit form. |
| `PUT` | `/api/v1/admin/practice-areas/{id}` | `edit_practice_area` | Update record, handle slug redirect, update SEO. |
| `DELETE` | `/api/v1/admin/practice-areas/{id}` | `delete_practice_area` | Soft-delete record. |

### 2.1 Admin Store / Update Payload Example
```json
{
  "title": {
    "en": "Admiralty & Maritime Law",
    "bn": "নৌ ও সমুদ্র আইন"
  },
  "slug": "admiralty-maritime-law",
  "short_description": {
    "en": "Vessel arrest and maritime claims.",
    "bn": "জাহাজ আটক ও নৌ দাবি।"
  },
  "full_description": {
    "en": "<p>High Court Admiralty jurisdiction advocacy.</p>",
    "bn": "<p>হাইকোর্ট নৌ এখতিয়ার।</p>"
  },
  "icon_name": "scale",
  "featured_image_id": null,
  "status": "published",
  "is_featured": true,
  "sort_order": 1,
  "seo": {
    "seo_title": {
      "en": "Admiralty Law in Bangladesh",
      "bn": "বাংলাদেশে নৌ আইন"
    },
    "meta_description": {
      "en": "Maritime legal counsel.",
      "bn": "নৌ আইনি সহায়তা।"
    },
    "canonical_url": null,
    "robots": "index, follow"
  }
}
```
