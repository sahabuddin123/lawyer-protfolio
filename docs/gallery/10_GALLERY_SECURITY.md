# 10. Gallery Security & Authorization Architecture

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** Security Engineer & Senior Laravel Engineer  
**Reference:** `backend/app/Http/Controllers/Api/V1/Admin/AdminGalleryAlbumController.php`

---

## 1. Role-Based Access Control (RBAC)

All gallery administration routes reside under the `auth:sanctum` middleware and enforce granular RBAC permissions via `GalleryAlbumPolicy` and route checks:

| Route Pattern | Required Permission | Action |
| :--- | :--- | :--- |
| `GET /api/v1/admin/gallery` | `gallery.view` or `manage_gallery` | View album index |
| `POST /api/v1/admin/gallery` | `gallery.create` or `manage_gallery` | Create album |
| `GET /api/v1/admin/gallery/{id}` | `gallery.view` or `manage_gallery` | View album detail |
| `PUT/PATCH /api/v1/admin/gallery/{id}` | `gallery.update` or `manage_gallery` | Update album |
| `DELETE /api/v1/admin/gallery/{id}` | `gallery.delete` or `manage_gallery` | Soft delete album |
| `POST /api/v1/admin/gallery/{id}/images` | `gallery.manage_images` or `manage_gallery` | Attach photo |
| `POST /api/v1/admin/gallery/{id}/images/upload` | `gallery.manage_images` or `manage_gallery` | Upload photo |
| `PATCH /api/v1/admin/gallery/{id}/images/{imageId}` | `gallery.manage_images` or `manage_gallery` | Update photo metadata |
| `DELETE /api/v1/admin/gallery/{id}/images/{imageId}` | `gallery.manage_images` or `manage_gallery` | Detach photo |
| `POST /api/v1/admin/gallery/{id}/reorder` | `gallery.update` or `manage_gallery` | Reorder photos |
| `POST /api/v1/admin/gallery/{id}/images/{imageId}/set-cover`| `gallery.update` or `manage_gallery` | Set cover |

Unauthenticated requests receive `401 Unauthorized`; requests lacking sufficient permissions receive `403 Forbidden`.

---

## 2. Insecure Direct Object Reference (IDOR) Protection

In photo sub-resource endpoints:
- Updating photo metadata (`PATCH /api/v1/admin/gallery/{album}/images/{image}`)
- Detaching a photo (`DELETE /api/v1/admin/gallery/{album}/images/{image}`)
- Setting a cover image (`POST /api/v1/admin/gallery/{album}/images/{image}/set-cover`)

The controller performs an explicit relational ownership check:
```php
if ($galleryImage->album_id !== $galleryAlbum->id) {
    abort(404, 'Image does not belong to this album.');
}
```
Attempting to manipulate image IDs belonging to another album is blocked immediately with a 404 response.

---

## 3. Upload & File Integrity Security

1. **MIME Verification:** Validates that incoming files match `image/jpeg`, `image/png`, or `image/webp`.
2. **File Size Capping:** Strict 10MB (`10240 KB`) upload limit prevents resource exhaustion.
3. **Safe Storage Naming:** Uploaded files receive cryptographically random SHA-256 hashes for storage paths, completely mitigating directory traversal and executable script injection.

---

## 4. Comprehensive Audit Trail

All administrative mutations automatically log an audit entry in the `activity_log` table:
- Album creation, modification, soft deletion, and reordering.
- Image attachment, upload, metadata update, and detachment.
- Cover image selection.
Recorded metadata includes authenticated `user_id`, client IP address, action description, and before/after attributes.
