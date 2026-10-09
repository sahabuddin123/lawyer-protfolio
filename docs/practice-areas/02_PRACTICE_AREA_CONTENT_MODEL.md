# 02. Practice Area Content Model & Database Specification

**Module:** Practice Areas & Jurisdictions  
**Phase:** 7  
**Database Table:** `practice_areas`  
**Migration:** `2026_10_06_224005_create_practice_areas_and_courtroom_tables.php`  

---

## 1. Schema Definition

```sql
CREATE TABLE `practice_areas` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` JSON NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `short_description` JSON NOT NULL,
  `full_description` JSON NOT NULL,
  `icon_name` VARCHAR(100) NULL,
  `featured_image_id` BIGINT UNSIGNED NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `is_featured` BOOLEAN NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  CONSTRAINT `fk_practice_areas_featured_image`
    FOREIGN KEY (`featured_image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. Field Specifications & Integrity Constraints

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `BIGINT UNSIGNED` | No | Auto | Primary surrogate key. |
| `title` | `JSON` | No | — | Bilingual headline (`{"en": "...", "bn": "..."}`). |
| `slug` | `VARCHAR(255)` | No | — | Unique, lowercase, URL-safe slug (`kebab-case`). |
| `short_description` | `JSON` | No | — | Concise 1-2 sentence excerpt for index cards and search results. |
| `full_description` | `JSON` | No | — | In-depth jurisdictional legal analysis, statutes, and precedent framework (HTML sanitized). |
| `icon_name` | `VARCHAR(100)` | Yes | `NULL` | Whitelisted icon identifier (`scale`, `landmark`, `shield`, etc.). |
| `featured_image_id` | `BIGINT UNSIGNED` | Yes | `NULL` | Foreign key referencing central `media` table. |
| `status` | `ENUM` | No | `'draft'` | Publication lifecycle: `'draft'`, `'published'`, or `'archived'`. |
| `is_featured` | `BOOLEAN` | No | `0` | Flag to highlight priority domains on Homepage or filter bar. |
| `sort_order` | `INT` | No | `0` | Manual display ordering index (ascending). |
| `published_at` | `TIMESTAMP` | Yes | `NULL` | Timestamp when item was officially published. |
| `created_at` | `TIMESTAMP` | Yes | `NULL` | Record creation timestamp. |
| `updated_at` | `TIMESTAMP` | Yes | `NULL` | Last update timestamp. |
| `deleted_at` | `TIMESTAMP` | Yes | `NULL` | Soft-delete timestamp (prevents permanent data loss). |

---

## 3. Approved Icon Whitelist

Arbitrary user-submitted HTML or inline SVGs are strictly forbidden to mitigate stored XSS risks. Only pre-vetted icon tokens are permitted:

1. `scale` — Justice & Jurisprudence
2. `balance` — Balance of Law
3. `landmark` — Supreme Court & Appellate Architecture
4. `gavel` — Judicial Precedents & Rulings
5. `shield` — Constitutional Defense & Rights
6. `briefcase` — Commercial Advisory & Corporate Matters
7. `building` — Banking, Financial Institutions & Artha Rin
8. `file-text` — Contracts, Agreements & Legal Documentation
9. `scroll` — High Court Writs & Petitions
10. `award` — Special Distinctions & Merits
11. `users` — Family, Guardianship & Civil Litigations
12. `book-open` — Statutory Interpretations & Legal Treatises
13. `globe` — Admiralty, Cross-Border & Maritime Laws

---

## 4. Eloquent Relationships

- **`featuredImage(): BelongsTo`**  
  `$this->belongsTo(Media::class, 'featured_image_id');`
- **`seo(): MorphOne`**  
  `$this->morphOne(SeoMeta::class, 'seotable');`
