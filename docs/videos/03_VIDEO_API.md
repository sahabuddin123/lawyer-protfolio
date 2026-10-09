# 03. Videos REST API Specification

**Base URL:** `/api/v1`  
**Authentication:** Bearer token (Sanctum) for Admin endpoints; None for Public endpoints  

---

## 1. Public Endpoints

### 1.1 List Published Videos
- **Route:** `GET /api/v1/videos`
- **Query Parameters:**
  - `search` / `q`: Keyword search against bilingual titles, descriptions, and slugs.
  - `platform`: Filter by `youtube`, `vimeo`, or `external`.
  - `category`: Filter by category slug or ID.
  - `tag`: Filter by tag slug or ID.
  - `featured`: Filter by boolean (`1` or `0`).
  - `page`: Page number (default: 1).
  - `per_page`: Items per page (default: 12, max: 50).
- **Protection:** Exposes ONLY `status = 'published'` AND `visibility = 'public'` records.
- **Cache:** Keyed by `cms:videos:list:{locale}:p{page}:f{hash}` with 24-hour TTL.

### 1.2 Show Video Detail
- **Route:** `GET /api/v1/videos/{slug}`
- **Response:** Detailed payload containing localized title, description, safe embed URL, structured Schema.org `VideoObject`, and related broadcasts.
- **Handling of Moved Records:** If a slug was modified, returns `HTTP 301` with `Location` header pointing to the updated slug.
- **Protection:** Returns `HTTP 404` for draft or private videos.

---

## 2. Admin Endpoints

Protected by `auth:sanctum` and Spatie permission guard `manage_videos`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/videos` | List all videos with search, filters, and pagination |
| `POST` | `/api/v1/admin/videos` | Create new video record (auto platform/id parsing) |
| `GET` | `/api/v1/admin/videos/{video}` | Show single video record for editing |
| `PUT` | `/api/v1/admin/videos/{video}` | Update video record (301 redirect logging) |
| `DELETE` | `/api/v1/admin/videos/{video}` | Soft delete video record |
| `GET` | `/api/v1/admin/videos/{video}/preview` | Preview draft video (`X-Robots-Tag: noindex`) |
| `POST` | `/api/v1/admin/videos/reorder` | Update display order in bulk |
