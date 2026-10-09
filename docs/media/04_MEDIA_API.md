# Media Module API Specification (Phase 12)

## 1. Overview
The Media API exposes public and administrative endpoints formatted with standardized JSON response envelopes.

---

## 2. Public API Endpoints (`/api/v1`)

| Method | Endpoint | Description | Cache TTL |
| :--- | :--- | :--- | :--- |
| `GET` | `/media` | Unified overview (Featured Press & Appearances, Latest Press, Latest Appearances) | 86,400s |
| `GET` | `/media/{slug}` | Unified item lookup resolving either Press article or Appearance | 86,400s |
| `GET` | `/media/press` | Paginated listing of public Press articles with search & filters | 86,400s |
| `GET` | `/media/press/{slug}` | Detailed view of a single Press article with related articles | 86,400s |
| `GET` | `/media/press/{slug}/download` | Stream/download attached PDF document | Dynamic |
| `GET` | `/media/appearances` | Paginated listing of public Electronic Media appearances | 86,400s |
| `GET` | `/media/appearances/{slug}` | Detailed view of a single Appearance with related appearances | 86,400s |
| `GET` | `/media/appearances/{slug}/download`| Stream/download attached PDF document | Dynamic |

### Public Query Parameters:
- `search` / `q`: Keyword search string.
- `type` / `media_type`: Filter by taxonomy (`newspaper`, `magazine`, `tv`, `radio`, etc.).
- `channel` / `source`: Filter by network/publication name.
- `year`: 4-digit filter (`2024`, `2025`, etc.).
- `page`: Page index (default: 1).
- `per_page`: Items per page (default: 9 to 15, max: 100).

---

## 3. Administrative API Endpoints (`/api/v1/admin`)

Protected by `auth:sanctum` and permission gates (`manage_press`, `manage_appearances`).

### Press Media:
| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/media/press` | `manage_press` | Paginated listing with admin filters |
| `POST` | `/admin/media/press` | `manage_press` | Create press record with bilingual fields |
| `GET` | `/admin/media/press/{id}` | `manage_press` | Fetch single press record with translations |
| `PUT` | `/admin/media/press/{id}` | `manage_press` | Update press record (auto 301 on slug change) |
| `DELETE` | `/admin/media/press/{id}` | `manage_press` | Soft delete press record |
| `POST` | `/admin/media/press/reorder` | `manage_press` | Bulk update sequential sort order |
| `GET` | `/admin/media/press/{id}/preview`| `manage_press` | View draft/private article (`X-Robots-Tag: noindex`) |
| `GET` | `/admin/media/press/{id}/download`| `manage_press` | Download attached document |

### Electronic Media Appearances:
| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/media/appearances` | `manage_appearances` | Paginated listing with admin filters |
| `POST` | `/admin/media/appearances` | `manage_appearances` | Create appearance record with bilingual fields |
| `GET` | `/admin/media/appearances/{id}` | `manage_appearances` | Fetch single appearance record |
| `PUT` | `/admin/media/appearances/{id}` | `manage_appearances` | Update appearance record (auto 301 on slug change) |
| `DELETE` | `/admin/media/appearances/{id}` | `manage_appearances` | Soft delete appearance record |
| `POST` | `/admin/media/appearances/reorder` | `manage_appearances` | Bulk update sequential sort order |
| `GET` | `/admin/media/appearances/{id}/preview`| `manage_appearances` | View draft/private record (`X-Robots-Tag: noindex`) |
| `GET` | `/admin/media/appearances/{id}/download`| `manage_appearances` | Download attached document |
