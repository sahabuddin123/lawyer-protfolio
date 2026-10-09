# 02. Legal Research — Data Model & Schema Specification

**Entity:** `LegalResearch`  
**Database Table:** `legal_researches`  
**Related Tables:** `categories`, `tags`, `taggables`, `media`, `seo_metas`, `redirects`, `activity_logs`

---

## 1. Database Schema Specification

| Column | Type | Nullable | Default | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | No | AUTO_INC | PK | Primary Identifier |
| `category_id` | BIGINT UNSIGNED | Yes | NULL | FK | Foreign key -> `categories.id` (`nullOnDelete`) |
| `research_type` | ENUM | No | — | Yes | `article`, `case_analysis`, `research_paper`, `constitutional_analysis`, `statutory_analysis`, `legal_opinion`, `commentary` |
| `title` | JSON | No | — | No | Bilingual object: `{"en": "...", "bn": "..."}` |
| `slug` | VARCHAR(255) | No | — | Unique | Canonical URL slug (kebab-case) |
| `author` | JSON | No | — | No | Bilingual author name: `{"en": "...", "bn": "..."}` |
| `excerpt` | JSON | No | — | No | Short executive abstract: `{"en": "...", "bn": "..."}` |
| `content` | JSON | No | — | No | Sanitized rich text body: `{"en": "...", "bn": "..."}` |
| `research_date` | DATE | Yes | NULL | Yes | Date monograph was written, completed, or presented |
| `featured_image_id` | BIGINT UNSIGNED | Yes | NULL | FK | Foreign key -> `media.id` (`nullOnDelete`) |
| `pdf_media_id` | BIGINT UNSIGNED | Yes | NULL | FK | Foreign key -> `media.id` (`nullOnDelete`) |
| `external_url` | VARCHAR(500) | Yes | NULL | No | External law review or journal citation URL |
| `view_count` | INT UNSIGNED | No | 0 | No | Public read/view counter |
| `status` | ENUM | No | `'draft'` | Yes | `draft`, `published`, `archived` |
| `visibility` | ENUM | No | `'public'` | Yes | `public`, `private` |
| `is_featured` | BOOLEAN | No | 0 | Yes | Highlight flag for homepage and hub promotion |
| `sort_order` | INT | No | 0 | Yes | Manual display order weight |
| `published_at` | TIMESTAMP | Yes | NULL | Yes | System publication timestamp |
| `created_at` | TIMESTAMP | Yes | NULL | No | Laravel timestamp |
| `updated_at` | TIMESTAMP | Yes | NULL | No | Laravel timestamp |
| `deleted_at` | TIMESTAMP | Yes | NULL | No | Soft-delete timestamp |

---

## 2. Eloquent Model Relationships

```php
// App\Models\LegalResearch

public function category(): BelongsTo
{
    return $this->belongsTo(Category::class);
}

public function tags(): MorphToMany
{
    return $this->morphToMany(Tag::class, 'taggable');
}

public function featuredImage(): BelongsTo
{
    return $this->belongsTo(Media::class, 'featured_image_id');
}

public function pdfMedia(): BelongsTo
{
    return $this->belongsTo(Media::class, 'pdf_media_id');
}

public function seo(): MorphOne
{
    return $this->morphOne(SeoMeta::class, 'seoable');
}
```

---

## 3. Bilingual Data Contract

```json
{
  "title": {
    "en": "Judicial Review of Executive Discretion in Bangladesh",
    "bn": "বাংলাদেশে নির্বাহী সিদ্ধান্তের বিচারিক পর্যালোচনা"
  },
  "author": {
    "en": "Advocate Nijam Uddin (Haq)",
    "bn": "অ্যাডভোকেট নিজাম উদ্দিন (হক)"
  },
  "excerpt": {
    "en": "An exhaustive analysis of writ jurisdiction under Article 102 of the Constitution.",
    "bn": "সংবিধানের ১০২ অনুচ্ছেদের অধীনে রিট এখতিয়ার সংক্রান্ত বিশদ বিশ্লেষণ।"
  },
  "content": {
    "en": "<h2>1. Constitutional Foundations</h2><p>Article 102 guarantees...</p>",
    "bn": "<h2>১. সাংবিধানিক ভিত্তি</h2><p>১০২ অনুচ্ছেদ নিশ্চিত করে...</p>"
  }
}
```
