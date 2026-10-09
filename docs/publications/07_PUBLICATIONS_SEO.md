# Publications SEO & Search Engine Indexing (Phase 11)

## 1. Overview
The Publications Module incorporates polymorphic SEO metadata conforming to `docs/architecture/07_SEO_ARCHITECTURE.md`. It balances rich visibility for published scholarship with absolute indexing protection for drafts and private monographs.

## 2. Polymorphic SEO Metadata
The `Publication` model utilizes the `HasSeo` trait, mapping to the `seo_metas` table via a polymorphic relation:
- `seo_title`: Bilingual meta title (`en`, `bn`).
- `meta_description`: Bilingual meta description (`en`, `bn`).
- `canonical_url`: Fully qualified canonical URL to prevent duplicate content indexing.
- `og_title`, `og_description`, `og_image_id`: Open Graph tags for social citations.

## 3. Structured Data (Schema.org)
Depending on the publication type, structured data output includes:
```json
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "Treatise on Constitutional Jurisprudence",
  "author": {
    "@type": "Person",
    "name": "Advocate Nijam Uddin"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bangladesh Supreme Court Bar Journal"
  },
  "datePublished": "2024-05-15",
  "description": "Comprehensive analysis of constitutional review...",
  "inLanguage": ["en", "bn"]
}
```
*Note: ScholarlyArticle, Book, and Article schema types are generated dynamically based on verified admin-entered metadata. No fake academic achievements or credentials are injected.*

## 4. Search Engine Indexing Safety
1. **Draft / Private Publications**:
   - Never included in sitemaps.
   - Public API routes return `404 Not Found`.
   - Admin preview endpoint explicitly delivers:
     ```
     X-Robots-Tag: noindex, nofollow, noarchive
     ```
2. **Slug Changes & Canonical Equity**:
   - When an existing published publication's slug is updated, a `301 Permanent Redirect` is automatically registered from the old path to the new path.
   - Preserves citation integrity and inbound search backlinks.
