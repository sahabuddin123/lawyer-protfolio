# 05 — Profile SEO, Open Graph & Structured Data Architecture

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 6: Profile & About Module

---

## 1. Overview

The Profile and About module establishes the primary authority signals for search engine recognition and social media sharing. It couples polymorphic database records with structured JSON-LD schemas.

---

## 2. Polymorphic SEO Metadata (`seo_meta`)

The `seo_meta` table is bound via `MorphOne` to `App\Models\Profile`:
- **`seo_title`**: Defaults to `{"en": "Profile & Legal Credentials | Advocate Nijam Uddin (Haq)", "bn": "জীবনবৃত্তান্ত ও সনদ | অ্যাডভোকেট নিজাম উদ্দিন (হক)"}`.
- **`meta_description`**: Authoritative summary highlighting enrollment before the Supreme Court of Bangladesh.
- **`canonical_url`**: Normalized URL pointing to `http://localhost:8000/about`.
- **`robots`**: Standard production directive `index, follow`.
- **`schema_type`**: `Person`.

---

## 3. Structured Data (JSON-LD `Person` Schema)

The public API returns structured JSON-LD ready for browser rendering:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Nijam Uddin (Haq)",
  "jobTitle": "Advocate, Supreme Court of Bangladesh",
  "worksFor": {
    "@type": "LegalService",
    "name": "Supreme Court of Bangladesh"
  },
  "alumniOf": [
    {
      "@type": "CollegeOrUniversity",
      "name": "University of Chittagong"
    }
  ],
  "knowsAbout": [
    "Constitutional Law",
    "Criminal Litigation",
    "Judicial Precedents"
  ]
}
```

---

## 4. Open Graph & Social Cards

- **OG Type**: `profile`.
- **OG Title**: Matches localized `seo_title`.
- **OG Description**: Authoritative legal bio overview.
- **OG Image**: Falls back to the global social sharing image or custom `profile_photo` WebP asset.
