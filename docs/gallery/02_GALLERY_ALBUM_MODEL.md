# 02. Gallery Album Model Specification

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** Database Architect & Senior Laravel Engineer  
**Model:** `App\Models\GalleryAlbum`  
**Database Table:** `gallery_albums`

---

## 1. Schema Definition

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `unsignedBigInteger` | No | Auto-inc | Primary key |
| `title` | `json` | No | None | Bilingual title (`{"en": "...", "bn": "..."}`) |
| `slug` | `string(255)` | No | None | Unique lowercase URL-safe identifier |
| `description` | `json` | Yes | `null` | Bilingual description (`{"en": "...", "bn": "..."}`) |
| `cover_image_id` | `unsignedBigInteger` | Yes | `null` | Foreign key referencing `media.id` (`nullOnDelete`) |
| `category_id` | `unsignedBigInteger` | Yes | `null` | Foreign key referencing `categories.id` (`nullOnDelete`) |
| `event_date` | `date` | Yes | `null` | Historical or event occurrence date |
| `published_at` | `timestamp` | Yes | `null` | Timestamp when album was published |
| `status` | `enum` | No | `'draft'` | Editorial status: `draft`, `published`, `archived` |
| `visibility` | `enum` | No | `'public'` | Privacy gate: `public`, `private` |
| `is_featured` | `boolean` | No | `false` | Highlighted on public gallery archive |
| `sort_order` | `integer` | No | `0` | Manual display ordering |
| `created_at` | `timestamp` | Yes | `null` | Creation timestamp |
| `updated_at` | `timestamp` | Yes | `null` | Last update timestamp |
| `deleted_at` | `timestamp` | Yes | `null` | Soft deletion timestamp |

### Indexes
- `gallery_albums_slug_unique`: Unique index on `slug`
- `gallery_albums_event_date_index`: Index on `event_date`
- `gallery_albums_status_index`: Index on `status`
- `gallery_albums_visibility_index`: Index on `visibility`
- `gallery_albums_status_visibility_index`: Composite index on `['status', 'visibility']`
- `gallery_albums_is_featured_index`: Index on `is_featured`

---

## 2. Eloquent Relationships

```php
// Media asset for explicit cover
public function coverImage(): BelongsTo
{
    return $this->belongsTo(Media::class, 'cover_image_id');
}

// Taxonomy category
public function category(): BelongsTo
{
    return $this->belongsTo(Category::class);
}

// All attached gallery images ordered by sort_order
public function images(): HasMany
{
    return $this->hasMany(GalleryImage::class, 'album_id')->ordered();
}

// Publicly visible gallery images
public function publicImages(): HasMany
{
    return $this->hasMany(GalleryImage::class, 'album_id')
        ->where('visibility', 'public')
        ->ordered();
}

// Polymorphic SEO Metadata
public function seo(): MorphOne
{
    return $this->morphOne(SeoMeta::class, 'seoable');
}
```

---

## 3. Dynamic Accessors & Lazy-Load Protection

1. **`cover_image_url`:**
   - Returns `$this->coverImage->url` if defined.
   - If not set, checks if images or public images are loaded and returns the first public image's media URL.
   - Respects `Model::preventLazyLoading(!app()->isProduction())` by checking `relationLoaded()`.
2. **`image_count` & `public_image_count`:**
   - Efficient aggregate counts checking relationLoaded collection count or database query.
3. **`featured`:**
   - Standard boolean accessor/mutator for `is_featured`.
