# Courtroom Experiences — Content & Data Model Specification

## 1. Entity Overview
The module comprises two relational database entities:
1. `CourtroomExperience` (`courtroom_experiences` table)
2. `CaseDocument` (`case_documents` table)

## 2. Table Schemas

### 2.1 `courtroom_experiences` Table
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | AUTO_INCREMENT, PRIMARY KEY | Unique surrogate identifier |
| `title` | JSON | NOT NULL | Bilingual title `{en: string, bn: string}` |
| `slug` | VARCHAR(255) | NOT NULL, UNIQUE, INDEX | URL-safe Latin slug |
| `case_number` | VARCHAR(255) | NULL | Official case identifier (e.g. Writ Petition 1024/2023) |
| `court` | VARCHAR(255) | NOT NULL, INDEX | Court or forum (e.g. High Court Division) |
| `case_type` | VARCHAR(100) | NOT NULL, INDEX | Classification (e.g. Criminal Revision, Civil Appeal) |
| `year` | INT UNSIGNED | NOT NULL, INDEX | Year of litigation |
| `practice_area_id` | BIGINT UNSIGNED | NULL, FK -> `practice_areas.id` | Optional association to practice domain |
| `legal_area` | JSON | NOT NULL | Bilingual field `{en: string, bn: string}` |
| `role` | JSON | NOT NULL | Verified role `{en: string, bn: string}` |
| `summary` | JSON | NOT NULL | Executive synopsis `{en: string, bn: string}` |
| `description` | JSON | NOT NULL | Detailed case background `{en: string, bn: string}` |
| `issues` | JSON | NULL | Substantive legal questions `{en: string, bn: string}` |
| `arguments` | JSON | NULL | Key arguments & citations `{en: string, bn: string}` |
| `outcome` | JSON | NULL | Order disposition `{en: string, bn: string}` |
| `judgment_date` | DATE | NULL | Date of final verdict or rule disposal |
| `featured_image_id`| BIGINT UNSIGNED | NULL, FK -> `media.id` | Thumbnail or courtroom photo |
| `visibility` | ENUM('public', 'private') | NOT NULL, DEFAULT 'public', INDEX | Case exposure level |
| `status` | ENUM('draft', 'published', 'archived') | NOT NULL, DEFAULT 'draft', INDEX | Publication workflow state |
| `is_featured` | BOOLEAN | NOT NULL, DEFAULT 0, INDEX | Featured landmark case flag |
| `sort_order` | INT | NOT NULL, DEFAULT 0 | Display priority |
| `published_at` | TIMESTAMP | NULL, INDEX | Release timestamp |
| `created_at`, `updated_at` | TIMESTAMP | NULL | Standard Eloquent timestamps |
| `deleted_at` | TIMESTAMP | NULL | Soft delete tracking |

### 2.2 `case_documents` Table
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | AUTO_INCREMENT, PRIMARY KEY | Unique identifier |
| `courtroom_experience_id` | BIGINT UNSIGNED | NOT NULL, FK -> `courtroom_experiences.id` ON DELETE CASCADE | Parent case reference |
| `title` | JSON | NOT NULL | Bilingual document title `{en: string, bn: string}` |
| `document_type` | VARCHAR(100) | NULL | Type: Judgment, Order, Petition, Written Submission |
| `media_id` | BIGINT UNSIGNED | NOT NULL, FK -> `media.id` ON DELETE RESTRICT | Physical file reference in Media library |
| `is_confidential`| BOOLEAN | NOT NULL, DEFAULT 0, INDEX | Confidentiality flag (true = internal only) |
| `sort_order` | INT | NOT NULL, DEFAULT 0 | Display order |
| `download_count` | INT UNSIGNED | NOT NULL, DEFAULT 0 | Metrics counter |
| `created_at`, `updated_at` | TIMESTAMP | NULL | Standard timestamps |

## 3. Relationships & Cardinality
- `CourtroomExperience` **1 : N** `CaseDocument` (`hasMany`, Cascade on Delete)
- `CourtroomExperience` **N : 1** `PracticeArea` (`belongsTo`, Null on Delete)
- `CourtroomExperience` **N : 1** `Media` (featured image, Null on Delete)
- `CourtroomExperience` **1 : 1** `SeoMeta` (Polymorphic `morphOne`, Cascade on Delete)
- `CaseDocument` **N : 1** `Media` (attachment file, Restrict on Delete)
