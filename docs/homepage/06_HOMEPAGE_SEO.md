# Phase 16 — Homepage SEO & Structured Data

## 1. Meta Tags & HTML Foundations
- **Page Title**: `Advocate Nijam Uddin (Haq) | Advocate, Supreme Court of Bangladesh`
- **Meta Description**: Configurable via CMS site settings and `seo_meta` records; defaults to authoritative chamber summary.
- **Canonical URL**: Dynamic canonical link reflecting current domain and locale.
- **Open Graph**: Title, description, URL, and high-resolution portrait og:image.

---

## 2. Schema.org JSON-LD Structured Data
The homepage automatically injects an integrated `@graph` containing only verified factual claims:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://nijamuddin.com/#person",
      "name": "Advocate Nijam Uddin (Haq)",
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
        "Appellate Litigation",
        "Civil Jurisprudence",
        "Corporate Law"
      ]
    },
    {
      "@type": "LegalService",
      "@id": "https://nijamuddin.com/#chambers",
      "name": "Chambers of Advocate Nijam Uddin",
      "telephone": "+880 1819-000000",
      "email": "chambers@nijamuddin.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Supreme Court Bar Association Building",
        "addressLocality": "Dhaka",
        "addressCountry": "BD"
      }
    }
  ]
}
```

No unverified ranks, fictitious win rates, or unsubstantiated seniority claims are ever emitted.
