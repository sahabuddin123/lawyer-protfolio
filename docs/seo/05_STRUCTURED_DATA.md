# Structured Data Architecture (Schema.org) — Advocate Nijam Uddin (Haq)

### 1. Overview
Structured data provides machine-readable semantic context to search engines using Schema.org vocabulary in JSON-LD format.

All structured data adheres strictly to verified facts:
- **Practitioner**: Advocate Nijam Uddin (Haq)
- **Role**: Advocate, Supreme Court of Bangladesh
- **Alumni**: University of Chittagong (LL.B. Honours, LL.M.)
- **Affiliation**: Supreme Court Bar Association (SCBA)
- **Chambers**: Chambers of Advocate Nijam Uddin (Haq), Supreme Court Bar Association Building, Dhaka

---

### 2. Supported Schema.org Types

| Route / Page | Schema.org Type | Key Attributes |
| :--- | :--- | :--- |
| **Homepage (`/`)** | `Person`, `LegalService`, `WebSite` | `name`, `jobTitle`, `alumniOf`, `telephone`, `address`, `potentialAction` |
| **About (`/about`)** | `Person` | `name`, `jobTitle`, `alumniOf`, `sameAs`, `hasCredential` |
| **Practice Areas (`/practice-areas/[slug]`)** | `LegalService` | `name`, `description`, `provider`, `serviceType` |
| **Courtroom Experiences (`/courtroom/[slug]`)** | `Article` | `headline`, `description`, `author`, `publisher` |
| **Legal Research (`/research/[slug]`)** | `Article` / `ScholarlyArticle` | `headline`, `abstract`, `author`, `datePublished` |
| **Judgment Reviews (`/judgments/[slug]`)** | `Article` | `headline`, `description`, `author`, `about` |
| **Publications (`/publications/[slug]`)** | `Article` / `Book` | `headline`, `author`, `inLanguage`, `publisher` |
| **Broadcast Videos (`/videos/[slug]`)** | `VideoObject` | `name`, `description`, `thumbnailUrl`, `uploadDate` |
| **Photo Gallery (`/gallery/[slug]`)** | `ImageGallery` | `name`, `description`, `url` |
| **Contact (`/contact`)** | `ContactPage`, `LegalService` | `name`, `telephone`, `address`, `openingHours` |
| **All Nested Pages** | `BreadcrumbList` | `itemListElement`: position, name, item (canonical URL) |

---

### 3. Safety and Ethics Rules
1. **No Invented Awards/Appointments**: Structured data never asserts unverified awards, non-existent high court bench assignments, or speculative honorary titles.
2. **Proper Schema Disambiguation**: Judgment reviews and case commentaries are typed as `Article`, avoiding false claims of being the original court decision itself.
3. **No Private URL Exposure**: Only public, published media assets and pages are linked in JSON-LD representations.
