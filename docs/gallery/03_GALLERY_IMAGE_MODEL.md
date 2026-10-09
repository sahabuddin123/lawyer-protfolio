# 03. Gallery Image Model Specification

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** Database Architect & Media Architecture Specialist  
**Model:** `App\Models\GalleryImage`  
**Database Table:** `gallery_images`

---

## 1. Schema Definition

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `unsignedBigInteger` | No | Auto-inc | Primary key |
| `album_id` | `unsignedBigInteger` | No | None | Foreign key referencing `gallery_albums.id` (`cascadeOnDelete`) |
| `media_id` | `unsignedBigInteger` | No | None | Foreign key referencing `media.id` (`restrictOnDelete`) |
| `caption` | `json` | Yes | `null` | Bilingual caption (`{"en": "...", "bn": "..."}`) |
| `alt_text` | `json` | Yes | `null` | Bilingual accessibility alt text (`{"en": "...", "bn": "..."}`) |
| `sort_order` | `integer` | No | `0` | Ordinal position of photo within the album |
| `is_featured` | `boolean` | No | `false` | Highlighted photo within album |
| `visibility` | `enum` | No | `'public'` | Privacy gate: `public`, `private` |
| `metadata` | `json` | Yes | `null` | Technical metadata (focal length, camera, tags) |
| `created_at` | `timestamp` | Yes | `null` | Attachment timestamp |
| `updated_at` | `timestamp` | Yes | `null` | Last update timestamp |

### Indexes
- `gallery_images_album_id_foreign`: Foreign key index
- `gallery_images_media_id_foreign`: Foreign key index
- `gallery_images_visibility_index`: Index on `visibility`
- `gallery_images_album_id_sort_order_index`: Composite index on `['album_id', 'sort_order']`

---

## 2. Eloquent Relationships

```php
public function album(): BelongsTo
{
    return $this->belongsTo(GalleryAlbum::class, 'album_id');
}

public function media(): BelongsTo
{
    return $this->belongsTo(Media::class, 'media_id');
}
```

---

## 3. Media Preservation & Foreign Key Integrity

- `album_id` uses `cascadeOnDelete()`: When an album is hard deleted from the database, the intermediate `gallery_images` relation rows are purged.
- `media_id` uses `restrictOnDelete()`: A media asset referenced by a gallery image cannot be accidentally deleted from `media` table while active gallery links exist.
- Soft-deleting or destroying a `GalleryAlbum` or `GalleryImage` **never** deletes the physical file or the `Media` entity from the media registry.
