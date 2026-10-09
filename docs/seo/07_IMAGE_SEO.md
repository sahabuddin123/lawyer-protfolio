# Image SEO & Media Delivery Architecture — Advocate Nijam Uddin (Haq)

### 1. Overview
The platform incorporates high-resolution professional portraiture and courtroom documentation of Advocate Nijam Uddin (Haq). To prevent severe Core Web Vitals degradation (LCP and CLS) while maximizing search visibility through Google Image Search, a structured media delivery pipeline is deployed.

---

### 2. Core Image SEO Requirements

| Metric / Attribute | Standard Implemented | Purpose |
| :--- | :--- | :--- |
| **Format** | WebP primary with AVIF / JPEG fallback | Modern compression reducing file size by 65–80% compared to uncompressed JPEG |
| **Alt Text** | Contextual, descriptive, factual descriptions | Accessibility compliance and semantic indexing without keyword stuffing |
| **Dimensions** | Explicit `width` and `height` or CSS `aspect-ratio` | Prevents Cumulative Layout Shift (CLS = 0.000) during image loading |
| **LCP Hero Image** | Eager loading with `fetchpriority="high"` | Optimizes Largest Contentful Paint (LCP < 1.8s) |
| **Below-Fold Images**| Native `loading="lazy"` | Defers offscreen image network requests until user scrolls |
| **Decorative Media** | `alt=""` or `aria-hidden="true"` | Eliminates screen reader noise for decorative borders, emblems, and accents |

---

### 3. Alt Text Policy

#### Compliant Examples:
- `alt="Advocate Nijam Uddin (Haq) in Supreme Court robes at the Dhaka Chamber"`
- `alt="Certificate of Enrollment with the Bangladesh Bar Council — Advocate Nijam Uddin"`
- `alt="Supreme Court Bar Association conference plenary discussion on constitutional writs"`

#### Prohibited Anti-patterns:
- `alt="photo"` (generic, low-value)
- `alt="image"` (redundant)
- `alt="best supreme court lawyer in bangladesh top advocate"` (spammy keyword stuffing)

---

### 4. Responsive Variants
The backend media processing pipeline automatically creates responsive variants:
- **Thumbnail**: 150x150, 300x300 (grid cards, avatar snippets)
- **Medium**: 600x600, 800x600 (article headers, mobile viewports)
- **Large**: 1200x800, 1920x1080 (hero showcases, high-DPI desktop viewports)

Client-side rendering employs `<picture>` tags or `srcset` attributes where appropriate to serve responsive variants tailored to screen resolution.
