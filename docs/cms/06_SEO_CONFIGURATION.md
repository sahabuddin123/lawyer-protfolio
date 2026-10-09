# 06 — Global & Polymorphic SEO Configuration

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 5: CMS + Site Settings Engine

---

## 1. Overview

The SEO engine provides dual-layer search engine optimization:
1. **Global Site Defaults**: Configured through Site Settings (`seo` group), providing fallback meta tags, canonical URL templates, default Open Graph assets, Twitter card attributes, and robots directives.
2. **Polymorphic Model Metadata**: Driven by the `seo_meta` table and `App\Models\SeoMeta`, allowing granular, entity-specific SEO overrides for `Page` models in Phase 5 and future domain models (Practice Areas, Courtroom cases, Publications, Research).

---

## 2. Global SEO Settings (`site_settings`)

| Key | Purpose | Default / Example |
| :--- | :--- | :--- |
| `default_meta_title` | Fallback browser title | `{"en": "Advocate Nijam Uddin | Supreme Court of Bangladesh", "bn": "অ্যাডভোকেট নিজাম উদ্দিন | বাংলাদেশ সুপ্রিম কোর্ট"}` |
| `meta_title_suffix` | Title suffix appended to page titles | `" | Advocate Nijam Uddin"` |
| `default_meta_description` | Fallback search description | Bilingual editorial summary |
| `default_meta_keywords` | Fallback keyword meta tag | `"supreme court advocate, constitutional lawyer dhaka, criminal defense bangladesh"` |
| `canonical_base_url` | Root domain for canonical URL generation | `http://localhost:8000` |
| `robots_default` | Default search indexing directive | `"index, follow"` |
| `og_site_name` | Open Graph site identifier | `"Advocate Nijam Uddin (Haq)"` |
| `og_default_image` | Default social preview image path | `"/images/branding/og-default.jpg"` |
| `twitter_card_type` | Twitter summary card format | `"summary_large_image"` |
| `twitter_site_handle` | Twitter attribution handle | `"@AdvNijamUddin"` |

---

## 3. Polymorphic SEO Architecture (`seo_meta`)

The `seo_meta` table uses a polymorphic relationship (`seoable_type`, `seoable_id`) to attach custom metadata to any content entity:

```sql
CREATE TABLE `seo_meta` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seoable_type` varchar(191) NOT NULL,
  `seoable_id` bigint unsigned NOT NULL,
  `meta_title` json DEFAULT NULL,
  `meta_description` json DEFAULT NULL,
  `meta_keywords` json DEFAULT NULL,
  `canonical_url` varchar(255) DEFAULT NULL,
  `og_title` json DEFAULT NULL,
  `og_description` json DEFAULT NULL,
  `og_image` varchar(255) DEFAULT NULL,
  `twitter_title` json DEFAULT NULL,
  `twitter_description` json DEFAULT NULL,
  `twitter_image` varchar(255) DEFAULT NULL,
  `robots` varchar(50) DEFAULT 'index, follow',
  `schema_type` varchar(50) DEFAULT 'WebPage',
  `schema_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `seo_meta_polymorphic_unique` (`seoable_type`,`seoable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Morphable Association in Models
In `App\Models\Page`:
```php
public function seoMeta(): MorphOne
{
    return $this->morphOne(SeoMeta::class, 'seoable');
}
```

---

## 4. Canonical URL & Robots Safety

1. **Safe Canonical Assembly**: Canonical URLs are normalized to strip trailing slashes, avoid duplicate query parameters, and resolve against the configured `canonical_base_url`.
2. **Environment Protection**: Production defaults to `index, follow`. In staging and testing environments, the robots directive can be toggled to `noindex, nofollow` to prevent accidental indexing.

---

## 5. API Integration & Serialization

- **Public Delivery**: When `GET /api/v1/pages/{slug}` is requested, the polymorphic relation `seoMeta` is eager-loaded and serialized through `App\Http\Resources\V1\SeoMetaResource`.
- **Administrative Control**: Managing pages through `AdminPageController` accepts nested `seo_meta` payload parameters, automatically executing an `updateOrCreate` operation on the relation.
