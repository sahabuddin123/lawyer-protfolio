# 05. Practice Area Public UI Specification

**Public Routes:**
- Listing: `/practice-areas` (`PracticeAreasPage.tsx`)
- Detail: `/practice-areas/:slug` (`PracticeAreaDetailPage.tsx`)
**Design System Foundations:** Dark Editorial Legal Foundation (`#06090E`, `#0D1522`, `#C5A059`), Playfair Display serif headings, Inter / Anek Bangla body typography.

---

## 1. Public Listing Page (`/practice-areas`)

### 1.1 Structural Layout
1. **Hero Header (`PageHeader`):**
   - Eyebrow: "Jurisdictional Specializations" (EN) / "আইনি বিশেষত্ব" (BN).
   - Headline: "Practice Areas & Jurisdictional Domains" (EN) / "প্র্যাকটিস এরিয়া ও আইনি পরামর্শ" (BN).
   - Authoritative lead describing High Court and Appellate Division representation.
2. **Control Bar:**
   - Debounced search bar with keyword matching across English and Bengali titles/descriptions.
   - Filter pill toggle: "All Domains" vs. "Featured Only".
3. **Card Grid (`PracticeAreaCard`):**
   - 3-column responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop).
   - Top gold accent border (`withTopGoldBorder`).
   - Monospace numeric badge (`01`, `02`, etc.).
   - Whitelisted icon in gold container.
   - Line-clamped short description.
   - Hover interaction: arrow icon and gold border transition.
4. **Empty State:**
   - When no practice areas match or exist, a dignified empty-state container appears with clean instructions and filter reset options.
5. **Pagination:**
   - Numeric counter and Previous/Next buttons.

---

## 2. Public Detail Page (`/practice-areas/:slug`)

### 2.1 Structural Layout
1. **Sticky Breadcrumbs:**
   - Root / Home -> Practice Areas -> [Current Area Title].
   - Quick link to return to the full index.
2. **Jurisdictional Hero:**
   - Icon badge and optional "Featured Domain" pill.
   - Large serif editorial headline.
   - Lead excerpt with vertical gold boundary border.
3. **Main Content Column (8 Columns Desktop):**
   - Full legal scope and jurisdictional treatise rendered cleanly via sanitized HTML.
   - Editorial prose styling with responsive typography.
4. **Sidebar Column (4 Columns Desktop):**
   - **Judicial Jurisdiction Card:** Explaining Supreme Court High Court & Appellate Division scope.
   - **Lead Counsel Card:** Nijam Uddin (Haq), Advocate, Supreme Court of Bangladesh, with link to `/about`.
   - **Chamber Consultation Card:** Direct inquiry action button linking to chamber contact channels.
