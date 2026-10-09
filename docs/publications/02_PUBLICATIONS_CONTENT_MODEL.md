# Publication Content Model & Data Schema (Phase 11)

## 1. Entity Definition: `Publication`
The `publications` table implements the approved Phase 1 entity schema, enhanced in Phase 11 to incorporate `visibility`, `sort_order`, `published_at`, and indexing optimizations.

### Table Schema: `publications`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | No | Primary Key |
| `category_id` | BIGINT UNSIGNED | Yes | Foreign Key to `categories.id` |
| `cover_image_id` | BIGINT UNSIGNED | Yes | Foreign Key to `media.id` (Front cover / spine artwork) |
| `pdf_media_id` | BIGINT UNSIGNED | Yes | Foreign Key to `media.id` (Downloadable monograph PDF) |
| `publication_type` | VARCHAR(50) | No | Taxonomy Type (`book`, `journal_article`, `research_paper`, etc.) |
| `title` | JSON | No | Translatable Title (`{"en": "...", "bn": "..."}`) |
| `slug` | VARCHAR(255) | No | Unique, URL-safe slug |
| `publication_name` | JSON | Yes | Translatable Source/Journal/Publisher name |
| `publication_date` | DATE | Yes | Official publication or volume date |
| `author` | JSON | Yes | Translatable Author/Researcher string |
| `excerpt` | JSON | Yes | Translatable Abstract / Editorial summary |
| `content` | LONGTEXT JSON | Yes | Translatable Full text, chapters, or HTML content |
| `external_url` | VARCHAR(500) | Yes | Validated HTTP/HTTPS external DOI/portal link |
| `visibility` | ENUM('public', 'private') | No | Access tier (default: `'public'`) |
| `status` | ENUM('draft', 'published', 'archived') | No | Editorial workflow state (default: `'draft'`) |
| `is_featured` | BOOLEAN | No | High-priority spotlight toggle (default: `false`) |
| `sort_order` | INT | No | Editorial display ranking (default: `0`) |
| `published_at` | TIMESTAMP | Yes | Timestamp of initial publication |
| `created_at` | TIMESTAMP | Yes | Record creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Record update timestamp |
| `deleted_at` | TIMESTAMP | Yes | Soft deletion timestamp |

### Indexes
- `PRIMARY (id)`
- `UNIQUE (slug)`
- `INDEX (publication_type)`
- `INDEX (status, visibility)`
- `INDEX (category_id)`
- `INDEX (publication_date)`
- `INDEX (sort_order)`
- `INDEX (is_featured)`

## 2. Controlled Publication Taxonomy Types
The system supports the following canonical types:
- `book`: Multi-chapter legal treaties, hardbound treatises, legal commentaries.
- `journal_article`: Peer-reviewed legal scholarly submissions.
- `research_paper`: In-depth empirical or doctrinal research papers.
- `conference_paper`: Presented papers at judicial or bar conferences.
- `legal_article`: Editorial columns and analytical legal essays.
- `case_note`: Analytical critique and summary of specific landmark decisions.
- `law_review`: Substantive doctrinal review articles.
- `legal_opinion`: Formal advisory briefs approved for public reference.
- `book_chapter`: Specific chapters contributed to third-party collections.
- `report`: Chamber or institutional research reports.
- `other`: Specialized legal monographs not classified above.

## 3. Bilingual Data Model
All textual fields leverage native JSON translation (`HasTranslations` trait):
```json
{
  "title": {
    "en": "Treatise on Constitutional Jurisprudence",
    "bn": "সংবিধান সংক্রান্ত তত্ত্ব ও প্রয়োগ"
  },
  "publication_name": {
    "en": "Bangladesh Supreme Court Bar Journal",
    "bn": "বাংলাদেশ সুপ্রিম কোর্ট বার জার্নাল"
  },
  "author": {
    "en": "Advocate Nijam Uddin",
    "bn": "অ্যাডভোকেট নিজাম উদ্দিন"
  },
  "excerpt": {
    "en": "An exhaustive analysis of writ jurisdiction under Article 102...",
    "bn": "অনুচ্ছেদ ১০২ এর অধীন রীট এখতিয়ারের একটি বিশদ বিশ্লেষণ..."
  }
}
```
If a Bangla translation is omitted, the model resolves to the English primary version cleanly without runtime errors.
