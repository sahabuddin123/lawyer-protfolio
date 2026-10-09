# 07. Judgment Reviews — SEO, Structured Data & Indexing Architecture

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis

---

## 1. Search Engine Optimization Architecture

Legal case reviews generate high organic authority when properly optimized with structured metadata, canonical tags, and OpenGraph data.

Key architectural features:
1. **Dynamic Meta Title & Description:**  
   Crafted bilingually to reflect the case name, citation, and legal area without hyperbole or unsupported promotional claims (e.g. avoiding "historic landmark victory" unless verified).
2. **Canonical URL Management:**  
   Strict canonical URLs (`https://nijamuddin.com/judgments/{slug}`) prevent duplicate content penalties across localized or filtered routes.
3. **Automatic 301 Redirects:**  
   When a published judgment review has its `slug` changed by an administrator, the `AdminJudgmentReviewController` automatically creates a permanent 301 redirect in the `redirects` table to preserve search ranking equity.
4. **Editorial Previews with Noindex Header:**  
   The admin preview endpoint emits `X-Robots-Tag: noindex, nofollow` to prevent search crawlers from indexing unpublished drafts.

---

## 2. Structured Data (Schema.org)

To clearly reflect the nature of the page as an analytical review (and not misrepresent it as an official government court portal), structured data is injected as `Article` or `LegislationCommentary`:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Dr. Kamal Hossain & Others v. Bangladesh & Others — Judgment Review",
  "description": "Comprehensive legal commentary on 71 DLR (HCD) 345 regarding locus standi under Article 102...",
  "author": {
    "@type": "Person",
    "name": "Advocate Nijam Uddin",
    "jobTitle": "Advocate, Supreme Court of Bangladesh"
  },
  "publisher": {
    "@type": "LegalService",
    "name": "Advocate Nijam Uddin & Associates"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://nijamuddin.com/judgments/kamal-hossain-v-bangladesh-writ-841"
  },
  "datePublished": "2026-10-06",
  "about": {
    "@type": "Thing",
    "name": "Judicial Precedent: 71 DLR (HCD) 345"
  }
}
```

---

## 3. Indexing Safety Checklist

- [x] Only `status = 'published'` AND `visibility = 'public'` records are exposed to public sitemaps and API.
- [x] Draft reviews return `404 Not Found` on public endpoints.
- [x] Admin preview endpoints return `X-Robots-Tag: noindex, nofollow`.
- [x] Canonical tags match the official published URL.
