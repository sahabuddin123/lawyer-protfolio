# Phase 16 — Homepage Section Registry & Components

## 1. Registered Homepage Sections

The homepage dynamically iterates and renders enabled sections according to their database `sort_order`:

| Section Key | Component | Dynamic Data Source | Empty State Behavior |
| --- | --- | --- | --- |
| `hero` | `<HeroSection />` | `Profile`, `SiteSetting` | Fallback verified facts (Never fake) |
| `credentials` | `<CredentialsSection />` | `Credential` (active, verified) | Hidden if 0 items |
| `about` | `<AboutPreviewSection />` | `Profile` (published) | Renders concise summary + CTA to `/about` |
| `practice_areas` | `<PracticeAreasSection />` | `PracticeArea` (published, featured) | Hidden if 0 items |
| `courtroom` | `<CourtroomSection />` | `CourtroomExperience` (published, public, featured) | Hidden if 0 items (No mock trials) |
| `judgments` | `<JudgmentReviewsSection />` | `JudgmentReview` (published, public, featured) | Hidden if 0 items |
| `research` | `<ResearchSection />` | `LegalResearch` (published, public, featured) | Hidden if 0 items |
| `publications` | `<PublicationsSection />` | `Publication` (published, public, featured) | Hidden if 0 items |
| `videos` | `<VideosSection />` | `Video` (published, public, featured) | Hidden if 0 items |
| `media` | `<MediaSection />` | `Media` (press & appearances, published, public) | Hidden if 0 items |
| `gallery` | `<GallerySection />` | `GalleryAlbum` (published, public, featured) | Hidden if 0 items |
| `consultation_cta` | `<ConsultationCtaSection />` | `SiteSetting` (contact info, hours) | Routes to `/contact` |

---

## 2. Section Details & Legal Integrity

### 2.1 Hero Section
- **Identity facts verified**: Advocate Nijam Uddin (Haq), LL.B. (Honours), LL.M., University of Chittagong. Enrolled Advocate, Supreme Court of Bangladesh, Bangladesh Bar Council.
- **CTAs**: Primary routes to `/contact` (or opens consultation modal), Secondary routes to `/practice-areas`.

### 2.2 Judgment Reviews Section
- **Strict Precedent Integrity**: Rigorously maintains the clear separation between:
  - **Court's Decision (`court_decision`)**: The formal ratio decidendi or order rendered by the bench.
  - **Author's Analysis (`author_analysis`)**: The scholar/practitioner's jurisprudential commentary.
- Prevents misleading summaries or deceptive attribution.

### 2.3 Videos Section
- **Performance & Bandwidth**: Employs click-to-load modal playback (`<VideoModal />`) using lazy image thumbnails. Zero autoplaying, zero heavy third-party iframes on page load.
