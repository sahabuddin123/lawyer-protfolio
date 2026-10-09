# 06. Practice Area SEO & Structured Data

**Architecture:** Polymorphic SEO Metadata (`HasSeo` -> `SeoMeta`)  
**Sitemap Integration:** Dynamic routing under `/practice-areas/*`  
**Default Directives:** `index, follow`  

---

## 1. Metadata Schema Integration

Each practice area record has a polymorphic `MorphOne` relationship to `seo_metas`:
- `seotable_type`: `App\Models\PracticeArea`
- `seotable_id`: Practice Area ID

### Supported SEO Fields
- `seo_title`: Bilingual JSON title (`{"en": "...", "bn": "..."}`)
- `meta_description`: Bilingual JSON excerpt optimized for search engine SERP snippets (<160 chars)
- `canonical_url`: Custom canonical link if overriding the default URL
- `og_title`: Social sharing title
- `og_description`: Social sharing summary
- `og_image_id`: Media reference for OpenGraph image card
- `robots`: Directives (default: `index, follow`)

---

## 2. Structured Data Guidelines

In compliance with strict **Legal Truth Safety** guidelines:
- No unverified superlative claims are added to structured data (e.g., "Top Law Firm", "Leading Advocate").
- If schema markup is injected, it represents standard informational `Service` or `LegalService` references scoped strictly to the advocate's verified details:
  - Name: Advocate Nijam Uddin (Haq)
  - Court: Supreme Court of Bangladesh
  - Service: Specialized Legal Consultation & Litigation Advocacy in the defined domain.
