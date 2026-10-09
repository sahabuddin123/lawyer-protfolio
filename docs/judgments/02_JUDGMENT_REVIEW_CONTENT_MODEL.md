# 02. Judgment Reviews — Content Model & Schema Specification

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis  
**Entity:** `judgment_reviews` table

---

## 1. Database Schema Specification

The `judgment_reviews` table serves as the primary relational persistence unit for legal case reviews.

### Table Columns: `judgment_reviews`

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Primary Key. |
| `case_name` | `JSON` | No | — | Bilingual case title (`{"en": "...", "bn": "..."}`). |
| `slug` | `VARCHAR(255)` | No | — | Unique URL-safe slug for routing and canonical links. |
| `citation` | `VARCHAR(255)` | No | — | Legal law report citation (e.g., `76 DLR (AD) 142`, `28 BLD (HCD) 310`). |
| `court` | `VARCHAR(255)` | No | — | Competent judicial forum (e.g., `Appellate Division, Supreme Court of Bangladesh`). |
| `judgment_date`| `DATE` | Yes | `NULL` | Formal date when the judgment was pronounced. |
| `legal_area` | `JSON` | Yes | `NULL` | Area of jurisprudence (e.g., `Constitutional & Writ Jurisdiction`). |
| `summary` | `JSON` | No | — | Concise administrative synopsis of facts and context. |
| `key_issues` | `JSON` | Yes | `NULL` | Primary legal issues, questions of law, or constitutional provisions. |
| `court_decision`| `JSON` | No | — | **Official ratio decidendi and court ruling**. |
| `author_analysis`| `JSON`| No | — | **Editorial analysis and commentary by the Advocate**. |
| `practical_significance`| `JSON`| Yes | `NULL`| Commercial, transactional, or litigation impact. |
| `practice_area_id`| `BIGINT UNSIGNED`| Yes| `NULL` | Foreign key referencing `practice_areas.id` (RESTRICT on delete). |
| `category_id` | `BIGINT UNSIGNED`| Yes| `NULL` | Foreign key referencing `categories.id` (SET NULL on delete). |
| `legal_research_id`| `BIGINT UNSIGNED`| Yes| `NULL`| Optional relation to related monograph in `legal_researches.id`. |
| `author` | `JSON` | Yes | `NULL` | Bilingual author attribution (`{"en": "...", "bn": "..."}`). |
| `featured_image_id`| `BIGINT UNSIGNED`| Yes| `NULL`| Foreign key referencing `media.id` for visual header/card preview. |
| `pdf_media_id`| `BIGINT UNSIGNED`| Yes | `NULL` | Foreign key referencing `media.id` for the judgment PDF document. |
| `status` | `VARCHAR(20)` | No | `'draft'`| Lifecycle state (`draft`, `published`, `archived`). |
| `visibility` | `VARCHAR(20)` | No | `'public'`| Access tier (`public`, `private`). |
| `is_featured` | `BOOLEAN` | No | `FALSE` | Featured flag for editorial highlights and home surfaces. |
| `sort_order` | `INT` | No | `0` | Manual administrative sorting rank. |
| `published_at`| `TIMESTAMP` | Yes | `NULL` | Timestamp of public release. |
| `created_at` | `TIMESTAMP` | Yes | `NULL` | Eloquent creation timestamp. |
| `updated_at` | `TIMESTAMP` | Yes | `NULL` | Eloquent modification timestamp. |
| `deleted_at` | `TIMESTAMP` | Yes | `NULL` | Soft delete timestamp. |

---

## 2. Eloquent Model Relationships

1. **`practiceArea(): BelongsTo`**  
   Links the judgment review to an official practice area (e.g., Constitutional Law, Corporate Finance, Admiralty).
2. **`category(): BelongsTo`**  
   Connects the review to a high-level taxonomy category under the `judgments` namespace.
3. **`tags(): MorphToMany`**  
   Polymorphic many-to-many relationship via `taggables` allowing fine-grained classification.
4. **`legalResearch(): BelongsTo`**  
   Direct link to an in-depth academic research paper or doctrinal treatise analyzing the broader legal principle.
5. **`featuredImage(): BelongsTo`**  
   Associates a cover/banner graphic from the centralized `media` table.
6. **`pdfMedia(): BelongsTo`**  
   Associates an authentic judicial PDF document from the centralized `media` table.
7. **`seo(): MorphOne`**  
   Polymorphic link to `seo_meta` containing custom meta tags, OpenGraph data, and canonical definitions.

---

## 3. Strict Boundary Rules

- **Court Decision vs Author Analysis:**  
  Under no circumstances may `court_decision` and `author_analysis` be coalesced into a single field. Storing them in isolated JSON fields guarantees that API responses and frontend components can never accidentally display an advocate's personal critique as a binding statement of the Court.
- **Verification Mandate:**  
  All records must be populated with verified legal data entered by authenticated administrators. No synthetic citations or fabricated holdings.
