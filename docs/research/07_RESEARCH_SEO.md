# 07. Legal Research — Search Engine Optimization & Structured Data

**Subsystem:** SEO Meta Engine & Crawl Governance  
**Domain Group:** Academic & Jurisprudential Publications

---

## 1. Search Engine Optimization (SEO) Architecture

Each published legal research monograph supports polymorphic SEO metadata managed via `HasSeo` trait and `seo_metas` table:

```
[LegalResearch: id=1]
       │
       ▼ (morphOne: seoable)
[SeoMeta: seoable_type="App\Models\LegalResearch", seoable_id=1]
  - seo_title: {"en": "...", "bn": "..."}
  - meta_description: {"en": "...", "bn": "..."}
  - canonical_url: "https://nijamuddin.com/research/..."
  - og_title, og_description, og_image_id
  - robots: "index, follow"
  - schema_type: "ScholarlyArticle" / "Article"
```

### Fallback Hierarchy
If custom SEO metadata is omitted by the administrator, the system dynamically derives safe fallbacks:
1. `meta_title`: `{title} — Advocate Nijam Uddin (Haq)`
2. `meta_description`: Sanitized plain text derived from `excerpt`.
3. `canonical_url`: Derived from route `/research/{slug}`.

---

## 2. Crawler & Indexing Safety Rules

1. **Unpublished / Draft / Private Items:**  
   - Are strictly invisible to public endpoints.
   - Return `HTTP 404 Not Found` upon direct URL access.
   - Will never be included in sitemaps or public API feeds.
2. **Draft Preview Protection:**  
   - The administrative preview endpoint explicitly injects:  
     `X-Robots-Tag: noindex, nofollow`
   - Guarantees zero crawler indexing or accidental snippet caching.
3. **301 Permanent Redirect Engine:**  
   - When a published monograph's slug changes (e.g. from `/research/old-slug` to `/research/new-slug`), an automated 301 redirect is registered in `redirects` table to preserve external academic citations and search ranking authority.
