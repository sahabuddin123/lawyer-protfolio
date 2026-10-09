# 05. Multilingual & Localization Architecture (i18n)

**Languages Supported:** English (`en`, default) and Bengali (`bn`)  
**Character Encoding:** UTF-8 (`utf8mb4_unicode_ci` at database level)  
**Lead Coordinator:** i18n & Data Architecture Specialist  

---

## 1. Architectural Strategy Evaluation & Decision

### 1.1 Approach 1: Dedicated Translation Tables
*Pattern:* Separate tables for every entity (e.g., `practice_areas` and `practice_area_translations`).
- **Pros:** Traditional relational model, easy to index foreign language text with standard B-Tree indexes.
- **Cons:** Table explosion (20+ extra tables), mandatory SQL `LEFT JOIN` on every single read query, dual-step inserts/updates during form submissions, and severe overhead for administrative CRUD forms.

### 1.2 Approach 2: JSON Translation Columns (Selected Standard)
*Pattern:* Native MySQL 8.0.31 JSON columns storing localized key-value pairs:
```json
{
  "en": "Constitutional & Administrative Law",
  "bn": "সাংবিধানিক এবং প্রশাসনিক আইন"
}
```
- **Pros:**
  - Zero SQL joins required for retrieval.
  - Atomic transactions during creation and editing.
  - Schema simplicity: exactly 22 clean domain tables.
  - Native MySQL 8.0 JSON path querying (`JSON_UNQUOTE(JSON_EXTRACT(title, '$.en'))`).
  - Seamless integration with Laravel Eloquent via `spatie/laravel-translatable` or native JSON casting.
  - Admin UI can effortlessly bind side-by-side English/Bengali input tabs.
- **Cons:** Standard fulltext indexing requires virtual generated columns for fulltext search. (Mitigated via MySQL generated stored columns for high-volume fulltext fields).

**Architectural Decision:** Approach 2 (JSON Translation Columns) is adopted across the entire platform.

---

## 2. Localized Field Matrix

The following attributes are stored as bilingual JSON structures:

| Domain Entity | Translatable Attributes | Non-Translatable (Shared) Attributes |
| :--- | :--- | :--- |
| **Profile** | `name`, `title`, `short_bio`, `long_bio`, `chambers_address`, `office_address`, `philosophy`, `legal_approach` | `phone`, `email`, `whatsapp`, `enrollment_numbers` |
| **Credentials** | `title`, `institution` | `category`, `year`, `sort_order`, `is_featured` |
| **Educations** | `degree`, `institution`, `department`, `distinction` | `year_completed`, `sort_order` |
| **Career Timeline** | `title`, `organization`, `description` | `period`, `sort_order` |
| **Practice Areas** | `title`, `short_description`, `full_description` | `slug`, `icon_name`, `status`, `sort_order` |
| **Courtroom Experiences** | `title`, `legal_area`, `role`, `summary`, `description`, `issues`, `arguments`, `outcome` | `slug`, `court`, `year`, `case_number`, `visibility`, `status` |
| **Legal Research** | `title`, `author`, `excerpt`, `content` | `slug`, `research_type`, `status`, `view_count` |
| **Judgment Reviews** | `case_name`, `legal_area`, `summary`, `key_issues`, `court_decision`, `author_analysis`, `practical_significance` | `citation`, `slug`, `court`, `judgment_date`, `status` |
| **Publications** | `title`, `publication_name`, `author`, `excerpt`, `content` | `slug`, `publication_type`, `publication_date`, `external_url` |
| **Media (Press & TV)** | `media_name`, `channel`, `program`, `title`, `description` | `slug`, `published_date`, `video_url` |
| **Videos** | `title`, `description` | `slug`, `platform`, `video_url`, `video_id`, `duration` |
| **Gallery Albums** | `title`, `description`, `caption`, `alt_text` | `slug`, `event_date`, `sort_order` |
| **CMS Pages & Sections** | `title`, `subtitle`, `content`, `settings.cta_text` | `section_key`, `sort_order`, `is_enabled` |
| **SEO Meta** | `seo_title`, `meta_description`, `og_title`, `og_description` | `canonical_url`, `robots`, `schema_type` |

---

## 3. URL & Slug Strategy

- **Slug Standardization:** All entity slugs (`slug`) are canonical Latin-script URL-friendly identifiers (e.g., `/courtroom/writ-petition-4102-2021`, `/practice-areas/constitutional-administrative-law`).
- **Rationale:** 
  1. Guaranteed stability across international and local browser address bars without ugly percent-encoding (`%E0%A6%B8%E0%A6%BE%E0%A6%82...`).
  2. Superior cross-platform sharing in emails, social apps, and SMS.
  3. Single canonical URL for search engines, avoiding duplicate content penalties.
- **Language Negotiation:**
  1. The API inspects the `Accept-Language` header (`en` or `bn`).
  2. Query parameter `?lang=bn` allows instantaneous override.
  3. In the React SPA, the user's selected language persists in `localStorage` under key `nijam_locale` and is dynamically injected into all outgoing Axios request headers.

---

## 4. Frontend Localization Architecture (React 19)

### 4.1 Dictionary Layout
```
frontend/src/i18n/
├── en.ts                # Static UI strings for English
├── bn.ts                # Static UI strings for Bengali
├── index.ts             # LocaleContext, useTranslation hook & provider
└── types.ts             # Strongly-typed dictionary interface
```

### 4.2 Dynamic Typography Adaptation
Bengali script has taller ascenders, lower descenders, and complex conjuncts (যুক্তাক্ষর). The UI adapts its typography dynamically:

```css
/* English Typographic Rhythm */
html[lang="en"] {
  --font-heading: 'Cinzel', 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --line-height-body: 1.6;
}

/* Bengali Typographic Rhythm (Enhanced line-height to avoid diacritic clipping) */
html[lang="bn"] {
  --font-heading: 'Hind Siliguri', 'Noto Serif Bengali', serif;
  --font-body: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
  --line-height-body: 1.8;
  letter-spacing: 0.01em;
}
```

### 4.3 Fallback Grace Policy
If a specific Bengali translation is missing in the database for newly created draft content, the API and frontend fallback automatically to the English value with a graceful log, ensuring the visitor never sees empty strings or broken layouts.
