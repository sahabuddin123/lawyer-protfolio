# Metadata Architecture — Advocate Nijam Uddin (Haq)

### 1. Overview
Metadata across the platform provides search engine crawlers and social media graph bots with accurate, authoritative context regarding Advocate Nijam Uddin (Haq)'s Supreme Court practice. All metadata generation complies with professional legal conduct guidelines: zero unsubstantiated claims, zero keyword stuffing, and strictly verified academic and judicial credentials.

---

### 2. Core Metadata Tag Taxonomy

| Tag Type | Attribute / Name | Dynamic Source | Fallback Policy |
| :--- | :--- | :--- | :--- |
| **Title** | `<title>` | CMS SEO Title or localized record title + Brand | `[Title] \| Advocate Nijam Uddin (Haq)` |
| **Description** | `<meta name="description">` | CMS Meta Description / Excerpt / Abstract | Site Chamber Summary (en/bn) |
| **Robots** | `<meta name="robots">` | `index, follow` (public published) / `noindex, follow` (searches/filters) / `noindex, nofollow` (admin/error/draft) | `noindex, nofollow` on unknown routes |
| **Canonical** | `<link rel="canonical">` | Normalized HTTPS path (`/`, `/about`, `/practice-areas/[slug]`) | Current window pathname without query strings |
| **Hreflang (EN)** | `<link rel="alternate" hreflang="en">` | Normalized English path | Canonical URL |
| **Hreflang (BN)** | `<link rel="alternate" hreflang="bn">` | Normalized Bengali path (`?lang=bn`) | Canonical URL with `?lang=bn` |
| **Hreflang (Default)** | `<link rel="alternate" hreflang="x-default">`| Normalized default canonical path | Canonical URL |
| **Open Graph Title** | `<meta property="og:title">` | Title matching document title | Dynamic title string |
| **Open Graph Desc** | `<meta property="og:description">` | Description matching document description | Dynamic description string |
| **Open Graph URL** | `<meta property="og:url">` | Absolute Canonical URL | `https://nijamuddin.com/...` |
| **Open Graph Type** | `<meta property="og:type">` | `website`, `article`, `profile`, or `video.other` | `website` |
| **Open Graph Image** | `<meta property="og:image">` | Hero portrait, record featured media, album cover | `/images/portrait-nijamuddin.jpg` |
| **Twitter Card** | `<meta name="twitter:card">` | `summary_large_image` | `summary_large_image` |

---

### 3. Implementation Mechanism (`SeoHead.tsx`)
In a single-page React architecture, metadata is synchronized declaratively using the `<SeoHead />` component:

```tsx
<SeoHead
  title="Constitutional Writ Litigation | Chambers of Advocate Nijam Uddin (Haq)"
  description="Authoritative writ petition representation before the High Court and Appellate Divisions of the Supreme Court of Bangladesh."
  canonical="/practice-areas/constitutional-writ"
  ogType="article"
  breadcrumbs={[
    { name: 'Home', path: '/' },
    { name: 'Practice Areas', path: '/practice-areas' },
    { name: 'Constitutional Writ', path: '/practice-areas/constitutional-writ' },
  ]}
  structuredData={{ ... }}
/>
```

When unmounted or transitioned, `SeoHead` cleans up dynamic structured data script blocks and synchronizes the title and meta headers for the newly rendered view.
