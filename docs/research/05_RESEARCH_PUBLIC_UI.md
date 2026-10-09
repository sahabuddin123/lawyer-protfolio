# 05. Legal Research — Public UI & Editorial Reading Experience

**Pages:**
- Research Catalog Hub: `/research` (`frontend/src/pages/ResearchPage.tsx`)
- Research Monograph Dossier: `/research/:slug` (`frontend/src/pages/ResearchDetailPage.tsx`)
**Design Aesthetic:** Premium Legal Editorial / Dark Mode with Polished Gold Accents / Serif Editorial Typography

---

## 1. Research Catalog Hub (`/research`)

### 1.1 Structural Hierarchy
1. **Editorial Page Header:**
   - Gold Eyebrow: *"Jurisprudential Scholarship"*
   - Title: *"Legal Research & Monographs"*
   - Description highlighting constitutional analyses, statutory interpretations, and academic treatises.
2. **Filter & Search Area:**
   - Debounced keyword input (350ms delay).
   - Category selector and Research Classification filter.
   - Active filter indicators with "Clear Filters" action.
3. **Monograph Grid:**
   - Rendered using responsive 3-column cards (`ResearchCard`).
   - Cards display category badge, classification, research date, estimated reading time, author credit, excerpt, and "Read Treatise" CTA.
   - Attached PDF indicator badge when verified documents are present.
4. **Accessible Pagination:**
   - Previous / Next buttons with page count summary and disabled boundaries.
5. **Verified Empty State:**
   - Clean empty state with zero fabricated legal records. Clear action to reset filters.

---

## 2. Research Monograph Dossier (`/research/:slug`)

### 2.1 Reading Architecture & Layout
1. **Breadcrumb & Action Bar:**
   - Direct navigation link back to `/research`.
   - Native one-click URL sharing button with feedback indicator.
2. **Authoritative Header:**
   - Category and classification tags.
   - Prominent serif heading (h1).
   - Metadata strip: Author name with user icon, research date with calendar icon, reading time, view count.
3. **Executive Excerpt Callout:**
   - Elegant left-border callout (`border-l-4 border-gold-primary`) in italicized editorial serif typography.
4. **Featured Visual Frame:**
   - High-resolution responsive image container with subtle border.
5. **Long-Form Reading Body:**
   - Tailored with `prose prose-invert lg:prose-lg font-sans`.
   - Responsive table containers with horizontal scroll.
   - Gold-accented blockquotes for legal maxims and judicial citations.
6. **Subject Tags Cloud:**
   - Categorized pill links for cross-topic discovery.
7. **PDF Treatise Download Card:**
   - Prominent download box with verified file name, document icon, and secure download CTA.
8. **Related Jurisprudence:**
   - Curated cards featuring up to 3 published monographs sharing category or classification.
