# 04. Gallery API Specification

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** API Architect & Senior Laravel Engineer  
**Authentication:** Laravel Sanctum (Admin routes)  
**Permission:** `manage_gallery` (Admin routes)  

---

## 1. Public API Endpoints

### 1.1 List Albums
- **Endpoint:** `GET /api/v1/gallery`
- **Authentication:** Public
- **Caching:** 24 Hours (`TTL_GALLERY = 86400`)
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `per_page` (integer, default: 12, max: 36)
  - `search` / `q` (string, searches title and description)
  - `category` (string, category slug or ID)
  - `featured` (boolean: 1 / 0)
- **Response Shape:**
  ```json
  {
    "success": true,
    "message": "Gallery albums retrieved successfully.",
    "data": [
      {
        "id": 1,
        "slug": "supreme-court-bar-centenary",
        "title": "Supreme Court Bar Centenary",
        "description": "Historic gathering at Supreme Court premises.",
        "cover_image_url": "https://nijamuddin.com/storage/media/gallery/2026/06/photo1.webp",
        "cover_image": {
          "url": "https://nijamuddin.com/storage/media/gallery/2026/06/photo1.webp",
          "variants": {},
          "width": 1920,
          "height": 1080
        },
        "category": {
          "id": 2,
          "name": "Conferences",
          "slug": "conferences"
        },
        "event_date": "2026-06-20",
        "is_featured": true,
        "sort_order": 1,
        "image_count": 14,
        "published_at": "2026-06-21T10:00:00+06:00"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 12,
      "total": 1,
      "has_more_pages": false,
      "locale": "en",
      "timestamp": "2026-10-09T12:00:00+06:00"
    }
  }
  ```

### 1.2 View Album Detail
- **Endpoint:** `GET /api/v1/gallery/{slug}`
- **Authentication:** Public
- **Caching:** 24 Hours
- **Status Codes:**
  - `200 OK`: Published and public album returned.
  - `301 Moved Permanently`: Album slug was changed; legacy slug redirects with `Location: /gallery/{new_slug}`.
  - `404 Not Found`: Draft, private, or non-existent album.
- **Response Shape:** Includes `images` array with ordered public photos, `related_albums`, and `seo`.

---

## 2. Admin API Endpoints

All admin endpoints require `auth:sanctum` and permission `manage_gallery`.

| HTTP Verb | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/gallery` | Paginated admin datagrid with search and filters |
| `POST` | `/api/v1/admin/gallery` | Create a new gallery album |
| `GET` | `/api/v1/admin/gallery/{id}` | Retrieve album with complete bilingual fields and images |
| `PUT` | `/api/v1/admin/gallery/{id}` | Update album; creates 301 redirect if slug changes |
| `DELETE` | `/api/v1/admin/gallery/{id}` | Soft-delete album without deleting media assets |
| `POST` | `/api/v1/admin/gallery/reorder` | Batch update album sort orders |
| `GET` | `/api/v1/admin/gallery/{id}/preview` | Draft preview with `X-Robots-Tag: noindex` |
| `POST` | `/api/v1/admin/gallery/{id}/images` | Attach existing media asset as album image |
| `POST` | `/api/v1/admin/gallery/{id}/images/upload` | Upload new image file and attach to album |
| `PUT` | `/api/v1/admin/gallery/{id}/images/{imageId}` | Update photo caption, alt text, visibility |
| `DELETE` | `/api/v1/admin/gallery/{id}/images/{imageId}` | Remove photo from album (preserves media) |
| `POST` | `/api/v1/admin/gallery/{id}/images/reorder` | Reorder photos within album |
| `POST` | `/api/v1/admin/gallery/{id}/images/{imageId}/set-cover` | Set specific photo as album cover |
