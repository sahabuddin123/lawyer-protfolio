# 07. Search Engine Optimization & Structured Data Architecture

**Standard:** Google Search Central Guidelines & Schema.org Vocabularies  
**Lead Coordinator:** SEO Specialist & Frontend Engineer  

---

## 1. Polymorphic SEO Metadata System

Every public-facing entity (Practice Areas, Courtroom Experiences, Legal Research, Landmark Judgments, Publications, Media, Videos, and CMS Pages) attaches dynamically to the centralized `seo_meta` record:

```
+-------------------------------------------------------+
|                       SEO_META                        |
+-------------------------------------------------------+
| seotable_type: "App\Models\LegalResearch"             |
| seotable_id:   42                                     |
| seo_title:     {"en": "...", "bn": "..."}             |
| meta_desc:     {"en": "...", "bn": "..."}             |
| canonical_url: "https://nijamuddin.com/research/..."  |
| og_title:      {"en": "...", "bn": "..."}             |
| og_description:{"en": "...", "bn": "..."}             |
| og_image_id:   18 (FK -> media)                       |
| robots:        "index, follow"                        |
| schema_type:   "Article"                              |
| structured_data: JSON-LD override object              |
+-------------------------------------------------------+
```

---

## 2. Automated Structured Data (JSON-LD) Generators

Search engines require strict Schema.org markup to display rich legal authority snippets. The backend API compiles tailored JSON-LD blocks for each entity type:

### 2.1 Legal Authority & Identity (`Person` & `LegalService`)
Injected on the Homepage, About Page, and Contact Page:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://nijamuddin.com/#person",
      "name": "Nijam Uddin (Haq)",
      "jobTitle": "Advocate, Supreme Court of Bangladesh",
      "worksFor": {
        "@id": "https://nijamuddin.com/#chambers"
      },
      "alumnusOf": [
        {
          "@type": "EducationalOrganization",
          "name": "University of Chittagong",
          "department": "Faculty of Law"
        }
      ],
      "memberOf": [
        {
          "@type": "Organization",
          "name": "Bangladesh Bar Council"
        },
        {
          "@type": "Organization",
          "name": "Supreme Court Bar Association"
        }
      ],
      "knowsAbout": [
        "Constitutional Law",
        "Criminal Litigation",
        "Civil Law",
        "Appellate Advocacy"
      ],
      "url": "https://nijamuddin.com",
      "image": "https://nijamuddin.com/images/nijam-uddin-advocate.webp"
    },
    {
      "@type": "LegalService",
      "@id": "https://nijamuddin.com/#chambers",
      "name": "Chambers of Advocate Nijam Uddin",
      "telephone": "+8801XXXXXXXXX",
      "email": "chamber@nijamuddin.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dhaka",
        "addressCountry": "BD"
      },
      "priceRange": "$$$$"
    }
  ]
}
```

### 2.2 Legal Research & Analysis (`Article` / `ScholarlyArticle`)
Injected on `/research/:slug` and `/judgments/:slug`:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Constitutional Safeguards Under Article 32 of Bangladesh Constitution",
  "author": {
    "@type": "Person",
    "name": "Nijam Uddin (Haq)",
    "jobTitle": "Advocate, Supreme Court of Bangladesh"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Chambers of Advocate Nijam Uddin"
  },
  "datePublished": "2026-03-15T09:00:00Z",
  "image": "https://nijamuddin.com/storage/media/...",
  "description": "Comprehensive legal commentary on fundamental rights jurisprudence in Bangladesh."
}
```

---

## 3. Bilingual Hreflang Tag Implementation

To maximize organic search performance in both English and Bengali without triggering duplicate content flags:
```html
<link rel="alternate" hreflang="en-bd" href="https://nijamuddin.com/courtroom/writ-petition-4102-2021" />
<link rel="alternate" hreflang="bn-bd" href="https://nijamuddin.com/courtroom/writ-petition-4102-2021?lang=bn" />
<link rel="alternate" hreflang="x-default" href="https://nijamuddin.com/courtroom/writ-petition-4102-2021" />
```

---

## 4. OpenGraph & Social Media Authority Cards

Every social share on WhatsApp, Facebook, LinkedIn, and Twitter renders an editorial legal card:
- `og:site_name`: "Advocate Nijam Uddin — Supreme Court of Bangladesh"
- `og:type`: "article" (for research/judgments) or "profile" (for about/home)
- `og:title`: Tailored localized title
- `og:description`: 150-160 character curated legal excerpt
- `og:image`: High-contrast 1200x630px branded editorial thumbnail (featuring dark charcoal backdrop and gold emblem)
- `twitter:card`: "summary_large_image"

---

## 5. Dynamic Sitemap (`sitemap.xml`) & Crawl Rules (`robots.txt`)

- **Sitemap Pipeline (`GET /sitemap.xml`):**
  - Dynamically generated from database models with status `published`.
  - Frequency & Priority weighting:
    - Homepage (`/`): `priority: 1.0`, `changefreq: weekly`
    - Practice Areas (`/practice-areas/*`): `priority: 0.9`, `changefreq: monthly`
    - Courtroom (`/courtroom/*`): `priority: 0.85`, `changefreq: monthly`
    - Research & Judgments (`/research/*`, `/judgments/*`): `priority: 0.85`, `changefreq: weekly`
    - Media & Publications: `priority: 0.75`, `changefreq: monthly`
- **Robots Policy (`robots.txt`):**
  ```txt
  User-agent: *
  Allow: /
  Disallow: /admin/
  Disallow: /api/
  Disallow: /storage/secure/

  Sitemap: https://nijamuddin.com/sitemap.xml
  ```
