# 02. Video Content Model & Schema Specification

**Domain:** Video CMS & Media Library  
**Database Table:** `videos`  
**Migration:** `2026_10_06_224007_create_media_press_videos_gallery_tables.php` & `2026_10_07_060000_enhance_videos_table.php`  

---

## 1. Table Schema: `videos`

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | No | Auto | Primary Key |
| `title` | `JSON` | No | — | Bilingual title: `{"en": "...", "bn": "..."}` |
| `slug` | `VARCHAR(255)` | No | — | Lowercase, unique, URL-safe slug |
| `platform` | `ENUM('youtube','vimeo','external')`| No | `'youtube'` | Video provider platform |
| `video_url` | `VARCHAR(500)` | No | — | Normalized video or stream URL |
| `video_id` | `VARCHAR(100)` | Yes | `NULL` | Extracted platform video identifier (e.g. 11-char YouTube ID) |
| `thumbnail_id` | `BIGINT UNSIGNED` | Yes | `NULL` | Foreign key referencing `media.id` |
| `category_id` | `BIGINT UNSIGNED` | Yes | `NULL` | Foreign key referencing `categories.id` |
| `duration` | `VARCHAR(20)` | Yes | `NULL` | Display duration (e.g. `'45:30'`, `'01:15:00'`) |
| `description` | `JSON` | Yes | `NULL` | Bilingual synopsis: `{"en": "...", "bn": "..."}` |
| `published_date` | `DATE` | Yes | `NULL` | Date of broadcast or recording |
| `status` | `ENUM('draft','published','archived')` | No | `'draft'` | Publication lifecycle status |
| `visibility` | `ENUM('public','private')` | No | `'public'` | Access visibility tier |
| `is_featured` | `BOOLEAN` | No | `0` | Highlights video on home & library top |
| `sort_order` | `INT` | No | `0` | Manual ordering index |
| `published_at` | `TIMESTAMP` | Yes | `NULL` | Exact publication timestamp |
| `created_at` | `TIMESTAMP` | Yes | `NULL` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | Yes | `NULL` | Record last update timestamp |
| `deleted_at` | `TIMESTAMP` | Yes | `NULL` | Soft delete timestamp |

---

## 2. Eloquent Model Traits & Relationships

### 2.1 Traits Applied
- `HasFactory`: Database seeding and testing support.
- `HasStatus`: Provides `scopePublished()`, `scopeDraft()`, `scopeArchived()`.
- `HasTranslations`: Translatable attributes: `['title', 'description']`.
- `HasSortOrder`: Provides `scopeOrdered()`, automatic ordering.
- `HasSeo`: Polymorphic relationship to `SeoMeta` (`morphOne(SeoMeta::class, 'seoable')`).
- `SoftDeletes`: Non-destructive item removal.

### 2.2 Relationships
- `thumbnail()`: `BelongsTo(Media::class, 'thumbnail_id')`
- `category()`: `BelongsTo(Category::class, 'category_id')`
- `tags()`: `MorphToMany(Tag::class, 'taggable')`
- `seo()`: `MorphOne(SeoMeta::class, 'seoable')`
