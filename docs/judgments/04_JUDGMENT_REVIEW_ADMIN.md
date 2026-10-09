# 04. Judgment Reviews — Admin Management & Editorial Workflow

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis  
**Back-Office Interface:** `JudgmentManager.tsx` in `frontend/src/features/judgments/`

---

## 1. Overview of Administrative Capabilities

The Judgment Reviews management console allows verified legal administrators to publish, edit, review, and curate judicial commentary records.

Key capabilities:
- **Bilingual Authoring:** Tabular language switcher (`English` / `বাংলা`) for seamless entry of localized case names, legal areas, summaries, legal issues, holdings, analysis, and significance.
- **Visual Separation Controls:** Dedicated, color-coded input sections for:
  - **Court's Decision / Ratio Decidendi:** Accented with gold border and gavel icon (`#C5A880`), explicitly reminding staff that this text represents the authoritative judicial ruling.
  - **Author's Analysis & Doctrinal Commentary:** Accented with blue border and book icon (`#60A5FA`), establishing it as editorial scholarship.
- **Taxonomy Integration:** Single-click assignment of Practice Areas, Categories, and interactive tag chips.
- **Document & Media Binding:** Media asset picker for cover visuals and authentic certified PDFs.
- **Preview & Indexing Safety:** Instant editorial preview modal without polluting public search indices (`X-Robots-Tag: noindex, nofollow`).
- **Publication & Visibility Governance:** Independent controls for status (`draft`, `published`, `archived`) and visibility (`public`, `private`).

---

## 2. RBAC Permissions Matrix

Access to the admin endpoints is strictly governed by Spatie Laravel-Permissions:

| Action | Required Permission | Description |
|---|---|---|
| View Listing & Details | `view_cms` or `edit_judgments` | Browse directory, view metrics, access edit form. |
| Create New Review | `create_judgments` | Submit new draft or published judgment analysis. |
| Edit Review | `edit_judgments` | Modify case details, metadata, holding, or commentary. |
| Publish / Unpublish | `publish_judgments` | Transition status to `published` or retract to `draft`. |
| Soft Delete | `delete_judgments` | Archive or remove review from active directory. |
| Document Download | `view_cms` or `edit_judgments` | Download attached internal or public PDF files. |

---

## 3. Editorial Form Tabs Structure

1. **Basic Tab:**
   - Case Name (EN / BN)
   - Legal Citation (e.g. `27 BLD (AD) 84`)
   - Competent Court (e.g. `Appellate Division, Supreme Court of Bangladesh`)
   - Judgment Pronouncement Date
   - Associated Practice Area & Category
   - Taxonomy Tag selection
   - Author Attribution (EN / BN)
   - Status, Visibility, Sort Order, and Featured flag.
2. **Analysis Tab:**
   - Case Summary (Bilingual)
   - Key Legal Issues framed for consideration
   - **Court's Decision / Ratio Decidendi** (Official holding)
   - **Author's Analysis & Commentary** (Scholarly critique)
   - Practical & Commercial Significance
3. **Media & Documents Tab:**
   - Featured Image Asset ID
   - Judgment PDF Media Asset ID
   - Associated Research Treatise ID
4. **SEO & Meta Tab:**
   - Custom Meta Title (EN / BN)
   - Meta Description (EN / BN)
   - Canonical URL specification
