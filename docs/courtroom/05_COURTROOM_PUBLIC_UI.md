# Courtroom Experiences — Public Interface & UX Specification

## 1. Design System Alignment
The public courtroom interface adheres strictly to the approved Phase 2 design system:
- **Color Palette:** Luxury dark obsidian background (`#0A0A0A` / `#121212`), high-contrast off-white typography (`#F5F5F5`), muted borders (`#262626`), and judicial warm gold accents (`#D4AF37`, `#E5C158`).
- **Typography:** Editorial Serif headings paired with clean Sans-Serif body and monospace metadata (case numbers, years, court names).
- **Elevation & Surfaces:** Card containers with subtle border highlights and soft glassmorphic backdrop filters.

## 2. Public Catalog (`/courtroom`)
- **Editorial Header:** `PageHeader` component with judicial practice eyebrow badge, localized title, and description.
- **Search & Filter Bar:** Instant keyword query across case names, numbers, and summaries combined with court forum selector.
- **Case Cards (`CaseCard`):** Displays forum badge, litigation year, legal field, case number, serif title, summary snippet, advocate verification badge, and "Read Case" action button.
- **Dignified Empty & Error States:** Clear, professional messages guiding users when queries yield zero records.
- **Responsive Pagination:** Clean page navigation preserving search parameters.

## 3. Case Detail Dossier (`/courtroom/:slug`)
- **Breadcrumbs:** Return navigation to courtroom catalog.
- **Hero Header:** Badges for forum, year, legal field, case number, and prominent Advocate Role badge.
- **Executive Summary:** Highlighted lead paragraph.
- **Factual Background:** Full narrative rendered from sanitized HTML.
- **Substantive Legal Issues:** Structured breakdown of questions of law presented.
- **Advocacy Arguments:** Courtroom submissions and cited precedents.
- **Judicial Outcome:** Disposition, rule direction, and judgment terms.
- **Public Documents & Briefs:** Downloadable list of certified copies and orders with secure download stream.
- **Metadata Sidebar:** Quick-reference specifications table and direct link to the associated Practice Area.
- **Related Judicial Engagements:** Recommended cases sharing legal area or forum.
