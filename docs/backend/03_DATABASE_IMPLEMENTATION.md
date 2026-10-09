# 03. Database Implementation Specification

**Database Name:** `nijamuddin_db`  
**Engine:** InnoDB  
**Default Charset:** `utf8mb4`  
**Default Collation:** `utf8mb4_unicode_ci`  
**Total Tables:** 45 (24 Domain Tables + Spatie RBAC + Sanctum + Laravel System)  

---

## 1. Domain Group Migration Inventory

All migrations strictly implement the schema defined in `docs/architecture/02_DATABASE_SCHEMA.md`:

| Batch / File | Domain Group | Tables Created | Key Relationships / Constraints |
| :--- | :--- | :--- | :--- |
| `000000_create_users_table.php` | 1. Identity & RBAC | `users`, `password_reset_tokens`, `sessions` | SoftDeletes, unique email, indexed `is_active` |
| `000001_create_cache_table.php` | System | `cache`, `cache_locks` | Framework cache drivers |
| `000002_create_jobs_table.php` | System | `jobs`, `job_batches`, `failed_jobs` | Framework queue drivers |
| `223505_create_permission_tables.php` | 1. Identity & RBAC | `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions` | Spatie RBAC with added `module` attribute |
| `223514_create_personal_access_tokens_table.php` | 1. Identity & RBAC | `personal_access_tokens` | Laravel Sanctum token engine |
| `224001_create_media_table.php` | 2. Media | `media` | Unique UUID, JSON `variants`, `alt_text`, `caption`, FK to `users` |
| `224002_create_categories_table.php` | 2. Media & Taxonomy | `categories` | Self-referencing FK `parent_id`, JSON `name`, `description` |
| `224003_create_tags_and_taggables_tables.php` | 2. Taxonomy | `tags`, `taggables` | Composite primary key `(tag_id, taggable_type, taggable_id)` |
| `224004_create_profile_and_credential_tables.php` | 3. Profile & Pedigree | `profiles`, `credentials`, `educations`, `career_timelines`, `professional_memberships` | FK to `media` for photo, robes, certificates |
| `224005_create_practice_areas_and_courtroom_tables.php` | 4. Practice & Litigation | `practice_areas`, `courtroom_experiences`, `case_documents` | SoftDeletes, FK `courtroom_experiences` cascade on `case_documents`, FK `media` |
| `224006_create_research_judgment_publication_tables.php` | 5. Research & Publications | `legal_researches`, `judgment_reviews`, `publications` | SoftDeletes, status ENUM, FK `categories`, FK `media` |
| `224007_create_media_press_videos_gallery_tables.php` | 6. Broadcast & Gallery | `media_press`, `media_appearances`, `videos`, `gallery_albums`, `gallery_images` | SoftDeletes, FK `gallery_albums` cascade on `gallery_images`, FK `media` |
| `224008_create_contact_and_consultation_tables.php` | 7. Interaction Intake | `contact_messages`, `consultation_requests` | Status ENUM, hidden admin notes, FK to `practice_areas` |
| `224009_create_cms_and_settings_tables.php` | 8. CMS, SEO & Settings | `homepage_sections`, `pages`, `menus`, `menu_items`, `seo_meta`, `site_settings`, `activity_logs`, `redirects` | Polymorphic `seo_meta`, nested `menu_items`, immutable `activity_logs` |
| `224010_add_avatar_foreign_key_to_users_table.php` | 1. Identity | `users` (Alter) | Circular foreign key resolved (`users.avatar_media_id` -> `media.id`) |

---

## 2. Eloquent Model Architecture & Traits

Each domain entity is represented by a dedicated Eloquent model utilizing specialized traits:

### 2.1 `HasTranslations`
Provides seamless bilingual JSON property extraction:
- `$model->getTranslated('title')` -> returns active locale (`en` or `bn`), falling back to English.
- Scope: `$model->whereTranslation('title', 'Criminal Law', 'en')`

### 2.2 `HasStatus`
Encapsulates publishing workflow:
- `scopePublished()`, `scopeDraft()`, `scopeArchived()`
- `isPublished()`, `isDraft()`, `isArchived()`

### 2.3 `HasSortOrder`
Provides deterministic display ordering:
- `scopeOrdered('asc'|'desc')`
- Auto-assigns next integer on entity creation.

### 2.4 `HasSeo`
Encapsulates polymorphic SEO metadata:
- `seo()` morphs to `SeoMeta` entity.
