# Canonical URLs & Hreflang Architecture — Advocate Nijam Uddin (Haq)

### 1. Canonical URL Strategy
Canonicalization prevents indexing duplicate pages that arise from URL parameters, pagination, filtering, tracking tokens, and protocol/trailing-slash divergences.

#### Canonical URL Rules:
1. **Protocol and Host**: Strictly HTTPS using the primary canonical domain: `https://nijamuddin.com`.
2. **Path Normalization**: Lowercase, trimmed trailing slashes (e.g., `https://nijamuddin.com/about`, not `https://nijamuddin.com/about/`).
3. **Parameter Stripping**: Query parameters such as `?page=2`, `?search=writ`, `?filter=appellate`, and `?utm_*` are stripped from the canonical tag. All filtered variations point their canonical tag to the root domain index (e.g., `https://nijamuddin.com/practice-areas`).
4. **Detail Records**: Dynamic single-record views canonicalize directly to `/practice-areas/[slug]`, `/courtroom/[slug]`, `/research/[slug]`, `/judgments/[slug]`, `/publications/[slug]`, `/media/[slug]`, `/videos/[slug]`, and `/gallery/[slug]`.

---

### 2. Bilingual Hreflang Strategy
The platform supports English (`en`) and Bengali (`bn`).

#### Hreflang Tags:
For each public canonical URL (e.g., `https://nijamuddin.com/about`), three alternate tags are injected:

```html
<link rel="canonical" href="https://nijamuddin.com/about" />
<link rel="alternate" hreflang="en" href="https://nijamuddin.com/about" />
<link rel="alternate" hreflang="bn" href="https://nijamuddin.com/about?lang=bn" />
<link rel="alternate" hreflang="x-default" href="https://nijamuddin.com/about" />
```

#### XML Sitemap Alternate Links:
In `SitemapService.php`, every indexed URL entry includes corresponding `<xhtml:link>` elements:

```xml
<url>
  <loc>https://nijamuddin.com/practice-areas/constitutional-writ</loc>
  <lastmod>2026-03-15T10:30:00+06:00</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
  <xhtml:link rel="alternate" hreflang="en" href="https://nijamuddin.com/practice-areas/constitutional-writ" />
  <xhtml:link rel="alternate" hreflang="bn" href="https://nijamuddin.com/practice-areas/constitutional-writ?lang=bn" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://nijamuddin.com/practice-areas/constitutional-writ" />
</url>
```

#### Safety Boundaries:
- Administrative routes (`/admin/*`) NEVER output hreflang tags.
- Unpublished drafts and private records are NEVER rendered with alternate tags.
- Missing translations automatically fall back to `x-default` (primary English content).
