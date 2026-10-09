# 07. Gallery Centralized Media Pipeline Integration

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** Media/Image Architecture Specialist & Senior Solution Architect  
**Backend Reference:** `backend/app/Models/GalleryImage.php`, `backend/app/Models/Media.php`

---

## 1. Zero-Duplication Architecture

The Gallery module does not store physical image files or binary blobs in the `gallery_images` or `gallery_albums` tables. All visual assets reside within the unified Media Library (`media` table).

```
┌─────────────────────────────────┐
│          gallery_albums         │
│  - id                           │
│  - cover_image_id ──────────────┼──────┐
└────────────────┼────────────────┘      │
                 │ 1:N                   │ (FK)
┌────────────────▼────────────────┐      │
│          gallery_images         │      │
│  - id                           │      │
│  - album_id                     │      │
│  - media_id ────────────────────┼──┐   │
│  - caption                      │  │   │
│  - alt_text                     │  │   │
│  - sort_order                   │  │   │
└─────────────────────────────────┘  │   │
                                     │   │
                 ┌───────────────────▼───▼──┐
                 │          media           │
                 │  - id                    │
                 │  - file_path             │
                 │  - disk                  │
                 │  - mime_type             │
                 │  - width / height        │
                 │  - variants (thumb/card) │
                 └──────────────────────────┘
```

---

## 2. Shared Asset Delete Safety (Critical Constraint)

1. **Album Deletion:**
   - Triggers deletion of `GalleryAlbum` and cascades to delete related rows in `gallery_images`.
   - **Does NOT delete any record in `media`** or remove files from the storage disk.
   - Any other module (Courtroom, Publications, Profile) referencing the same media asset remains completely intact.
2. **Gallery Image Detach/Removal:**
   - Deletes only the pivot entry in `gallery_images`.
   - Preserves the physical file on storage and the record in `media`.

---

## 3. Direct Upload & Pipeline Processing

When an administrator uploads an image directly from the Gallery Manager (`POST /api/v1/admin/gallery/{id}/images/upload`):
1. **Validation:**
   - MIME types: `image/jpeg`, `image/png`, `image/webp`.
   - Max file size: 10MB (`10240 KB`).
   - Image integrity verification via Laravel's image validation rules.
2. **Media Record Creation:**
   - Stored on the configured disk (`public`).
   - Generates responsive variants (thumbnail: 300px, card: 600px, large: 1200px, original).
   - Extracts and records pixel dimensions (`width`, `height`) and byte size.
3. **Gallery Association:**
   - Associates the newly generated `media_id` with the current album.
   - Automatically sets the initial sort order (`max(sort_order) + 1`).
   - Sets the initial cover image if no cover was previously specified.
