# 02. Database Schema Specification

**Database Name:** `nijamuddin_db`  
**Engine:** InnoDB  
**Default Charset:** `utf8mb4`  
**Default Collation:** `utf8mb4_unicode_ci`  
**Standard Naming:** Tables are plural `snake_case`, foreign keys are `singular_table_id`, timestamps include `created_at` and `updated_at`. Soft deletes include `deleted_at`.

---

## 1. Domain Group 1: Identity & Access Control (RBAC)

### 1.1 `users`
Stores administrative and staff credentials.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(255) NOT NULL
- `email`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `phone`: VARCHAR(50) NULL
- `password`: VARCHAR(255) NOT NULL
- `avatar_media_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `is_active`: BOOLEAN NOT NULL DEFAULT 1 (Index)
- `last_login_at`: TIMESTAMP NULL
- `last_login_ip`: VARCHAR(45) NULL
- `remember_token`: VARCHAR(100) NULL
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 1.2 `roles` & `permissions` (Spatie Schema Integration)
- Standard Spatie RBAC tables:
  - `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`)
  - `permissions` (`id`, `name`, `guard_name`, `module`, `created_at`, `updated_at`)
  - `model_has_roles` (`role_id`, `model_type`, `model_id`)
  - `model_has_permissions` (`permission_id`, `model_type`, `model_id`)
  - `role_has_permissions` (`permission_id`, `role_id`)

---

## 2. Domain Group 2: Media Management & Taxonomy

### 2.1 `media`
Central media storage registry with full image variant breakdown and MIME validation.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `uuid`: CHAR(36) NOT NULL UNIQUE (Index)
- `disk`: VARCHAR(50) NOT NULL DEFAULT 'public'
- `directory`: VARCHAR(255) NOT NULL
- `filename`: VARCHAR(255) NOT NULL
- `original_name`: VARCHAR(255) NOT NULL
- `mime_type`: VARCHAR(100) NOT NULL (Index)
- `extension`: VARCHAR(20) NOT NULL
- `size_bytes`: BIGINT UNSIGNED NOT NULL
- `width`: INT UNSIGNED NULL
- `height`: INT UNSIGNED NULL
- `alt_text`: JSON NULL (Bilingual: `en`, `bn`)
- `caption`: JSON NULL (Bilingual: `en`, `bn`)
- `variants`: JSON NULL (URLs for `thumbnail`, `small`, `medium`, `large`, `hero` WebP)
- `uploaded_by`: BIGINT UNSIGNED NULL FK -> `users.id` ON DELETE SET NULL
- `created_at`, `updated_at`: TIMESTAMP

### 2.2 `categories`
Hierarchical taxonomy for legal research, publications, and gallery albums.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `parent_id`: BIGINT UNSIGNED NULL FK -> `categories.id` ON DELETE CASCADE
- `type`: VARCHAR(50) NOT NULL (Index: 'research', 'publication', 'courtroom', 'gallery')
- `name`: JSON NOT NULL (Bilingual: `en`, `bn`)
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `description`: JSON NULL (Bilingual: `en`, `bn`)
- `sort_order`: INT NOT NULL DEFAULT 0
- `is_active`: BOOLEAN NOT NULL DEFAULT 1
- `created_at`, `updated_at`: TIMESTAMP

### 2.3 `tags` & `taggables`
Polymorphic tagging for cross-content thematic discovery.
- `tags`:
  - `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `name`: JSON NOT NULL (Bilingual: `en`, `bn`)
  - `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
  - `created_at`, `updated_at`: TIMESTAMP
- `taggables`:
  - `tag_id`: BIGINT UNSIGNED NOT NULL FK -> `tags.id` ON DELETE CASCADE
  - `taggable_type`: VARCHAR(255) NOT NULL
  - `taggable_id`: BIGINT UNSIGNED NOT NULL
  - PRIMARY KEY (`tag_id`, `taggable_type`, `taggable_id`)
  - Index (`taggable_type`, `taggable_id`)

---

## 3. Domain Group 3: Advocate Profile, Credentials & Experience

### 3.1 `profiles`
Institutional profile and authority details for Advocate Nijam Uddin.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name`: JSON NOT NULL (`en`: 'Nijam Uddin (Haq)', `bn`: 'নিজাম উদ্দিন (হক)')
- `title`: JSON NOT NULL (`en`: 'Advocate, Supreme Court of Bangladesh', `bn`: 'এডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট')
- `short_bio`: JSON NOT NULL
- `long_bio`: JSON NOT NULL
- `profile_photo_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `court_robes_photo_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `bar_council_enrollment`: VARCHAR(255) NULL
- `high_court_enrollment`: VARCHAR(255) NULL
- `appellate_division_enrollment`: VARCHAR(255) NULL
- `chambers_address`: JSON NOT NULL
- `office_address`: JSON NOT NULL
- `phone`: VARCHAR(50) NOT NULL
- `email`: VARCHAR(100) NOT NULL
- `whatsapp`: VARCHAR(50) NULL
- `philosophy`: JSON NULL
- `legal_approach`: JSON NULL
- `created_at`, `updated_at`: TIMESTAMP

### 3.2 `credentials`
Key professional distinctions and badges.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `category`: ENUM('academic', 'professional', 'court', 'certification') NOT NULL DEFAULT 'professional'
- `title`: JSON NOT NULL
- `institution`: JSON NOT NULL
- `year`: VARCHAR(50) NULL
- `credential_id`: VARCHAR(100) NULL
- `certificate_media_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `is_featured`: BOOLEAN NOT NULL DEFAULT 1
- `sort_order`: INT NOT NULL DEFAULT 0
- `created_at`, `updated_at`: TIMESTAMP

### 3.3 `educations`
Academic pedigree.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `degree`: JSON NOT NULL (`en`: 'LL.B. (Honours)', 'LL.M.', etc.)
- `institution`: JSON NOT NULL (`en`: 'University of Chittagong', etc.)
- `department`: JSON NULL
- `year_completed`: VARCHAR(20) NOT NULL
- `distinction`: JSON NULL
- `sort_order`: INT NOT NULL DEFAULT 0
- `created_at`, `updated_at`: TIMESTAMP

### 3.4 `career_timelines`
Curated career milestones.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `period`: VARCHAR(100) NOT NULL (`en`: '2018 - Present')
- `title`: JSON NOT NULL
- `organization`: JSON NOT NULL
- `description`: JSON NULL
- `sort_order`: INT NOT NULL DEFAULT 0
- `created_at`, `updated_at`: TIMESTAMP

### 3.5 `professional_memberships`
Bar associations and legal societies.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `organization`: JSON NOT NULL (`en`: 'Supreme Court Bar Association (SCBA)', etc.)
- `role`: JSON NOT NULL (`en`: 'Active Member')
- `membership_number`: VARCHAR(100) NULL
- `year_joined`: VARCHAR(20) NULL
- `is_active`: BOOLEAN NOT NULL DEFAULT 1
- `sort_order`: INT NOT NULL DEFAULT 0
- `created_at`, `updated_at`: TIMESTAMP

---

## 4. Domain Group 4: Legal Practice & Case Portfolio

### 4.1 `practice_areas`
Legal specializations.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `title`: JSON NOT NULL
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `short_description`: JSON NOT NULL
- `full_description`: JSON NOT NULL
- `icon_name`: VARCHAR(100) NULL
- `featured_image_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `sort_order`: INT NOT NULL DEFAULT 0
- `published_at`: TIMESTAMP NULL (Index)
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 4.2 `courtroom_experiences`
Litigation history, key precedents, and case portfolio.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `title`: JSON NOT NULL
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `case_number`: VARCHAR(255) NULL (Nullable for privacy protection)
- `court`: VARCHAR(255) NOT NULL (Index: 'Supreme Court - High Court Division', etc.)
- `case_type`: VARCHAR(100) NOT NULL (Index: 'Criminal Revision', 'Writ Petition', etc.)
- `year`: INT UNSIGNED NOT NULL (Index)
- `legal_area`: JSON NOT NULL
- `role`: JSON NOT NULL (`en`: 'Lead Counsel', 'Amicus Curiae', etc.)
- `summary`: JSON NOT NULL
- `description`: JSON NOT NULL
- `issues`: JSON NULL
- `arguments`: JSON NULL
- `outcome`: JSON NULL
- `judgment_date`: DATE NULL
- `featured_image_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `visibility`: ENUM('public', 'private') NOT NULL DEFAULT 'public' (Index)
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `sort_order`: INT NOT NULL DEFAULT 0
- `published_at`: TIMESTAMP NULL (Index)
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 4.3 `case_documents`
Case briefs, judgments, and legal orders.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `courtroom_experience_id`: BIGINT UNSIGNED NOT NULL FK -> `courtroom_experiences.id` ON DELETE CASCADE
- `title`: JSON NOT NULL
- `media_id`: BIGINT UNSIGNED NOT NULL FK -> `media.id` ON DELETE RESTRICT
- `is_confidential`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `sort_order`: INT NOT NULL DEFAULT 0
- `download_count`: INT UNSIGNED NOT NULL DEFAULT 0
- `created_at`, `updated_at`: TIMESTAMP

---

## 5. Domain Group 5: Research, Judgments & Publications

### 5.1 `legal_researches`
In-depth legal papers, analyses, and commentary.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `category_id`: BIGINT UNSIGNED NULL FK -> `categories.id` ON DELETE SET NULL
- `research_type`: ENUM('article', 'case_analysis', 'research_paper', 'constitutional_analysis', 'statutory_analysis', 'legal_opinion', 'commentary') NOT NULL (Index)
- `title`: JSON NOT NULL
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `author`: JSON NOT NULL
- `excerpt`: JSON NOT NULL
- `content`: JSON NOT NULL
- `featured_image_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `pdf_media_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `view_count`: INT UNSIGNED NOT NULL DEFAULT 0
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `published_at`: TIMESTAMP NULL (Index)
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 5.2 `judgment_reviews`
Authoritative reviews of Supreme Court landmark decisions.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `case_name`: JSON NOT NULL
- `citation`: VARCHAR(255) NOT NULL (Index: e.g. '75 DLR (AD) 142')
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `court`: VARCHAR(255) NOT NULL
- `judgment_date`: DATE NOT NULL (Index)
- `legal_area`: JSON NOT NULL
- `summary`: JSON NOT NULL
- `key_issues`: JSON NOT NULL
- `court_decision`: JSON NOT NULL
- `author_analysis`: JSON NOT NULL
- `practical_significance`: JSON NULL
- `featured_image_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `pdf_media_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `published_at`: TIMESTAMP NULL (Index)
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 5.3 `publications`
Authored books, law review papers, and published journal articles.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `category_id`: BIGINT UNSIGNED NULL FK -> `categories.id` ON DELETE SET NULL
- `publication_type`: ENUM('article', 'research_paper', 'case_note', 'law_review', 'legal_opinion', 'book', 'book_chapter') NOT NULL (Index)
- `title`: JSON NOT NULL
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `publication_name`: JSON NOT NULL (Journal or Publisher)
- `publication_date`: DATE NOT NULL (Index)
- `author`: JSON NOT NULL
- `excerpt`: JSON NOT NULL
- `content`: JSON NULL
- `external_url`: VARCHAR(500) NULL
- `cover_image_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `pdf_media_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

---

## 6. Domain Group 6: Media Appearances, Videos & Gallery

### 6.1 `media_press`
National and international press interviews and newspaper columns.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `media_name`: JSON NOT NULL (e.g. 'The Daily Star', 'দৈনিক প্রথম আলো')
- `title`: JSON NOT NULL
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `published_date`: DATE NOT NULL (Index)
- `article_url`: VARCHAR(500) NULL
- `featured_image_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `description`: JSON NOT NULL
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 6.2 `media_appearances`
Television debates and broadcast legal commentaries.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `channel`: JSON NOT NULL (e.g. 'Channel 24', 'Somoy TV')
- `program`: JSON NOT NULL (Program name)
- `title`: JSON NOT NULL
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `video_url`: VARCHAR(500) NOT NULL
- `thumbnail_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `broadcast_date`: DATE NOT NULL (Index)
- `description`: JSON NULL
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 6.3 `videos`
Dynamic video library (YouTube, Vimeo, external).
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `title`: JSON NOT NULL
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `platform`: ENUM('youtube', 'vimeo', 'external') NOT NULL DEFAULT 'youtube'
- `video_url`: VARCHAR(500) NOT NULL
- `video_id`: VARCHAR(100) NOT NULL
- `thumbnail_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `duration`: VARCHAR(20) NULL
- `description`: JSON NULL
- `published_date`: DATE NOT NULL (Index)
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 6.4 `gallery_albums` & `gallery_images`
Curated albums of chamber sessions, Supreme Court premises, and academic seminars.
- `gallery_albums`:
  - `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `title`: JSON NOT NULL
  - `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
  - `description`: JSON NULL
  - `cover_image_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
  - `category_id`: BIGINT UNSIGNED NULL FK -> `categories.id` ON DELETE SET NULL
  - `event_date`: DATE NULL (Index)
  - `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
  - `is_featured`: BOOLEAN NOT NULL DEFAULT 0 (Index)
  - `sort_order`: INT NOT NULL DEFAULT 0
  - `created_at`, `updated_at`: TIMESTAMP
  - `deleted_at`: TIMESTAMP NULL (SoftDeletes)
- `gallery_images`:
  - `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `album_id`: BIGINT UNSIGNED NOT NULL FK -> `gallery_albums.id` ON DELETE CASCADE
  - `media_id`: BIGINT UNSIGNED NOT NULL FK -> `media.id` ON DELETE RESTRICT
  - `caption`: JSON NULL
  - `alt_text`: JSON NULL
  - `sort_order`: INT NOT NULL DEFAULT 0
  - `is_featured`: BOOLEAN NOT NULL DEFAULT 0
  - `created_at`, `updated_at`: TIMESTAMP

---

## 7. Domain Group 7: Interaction & Client Intake

### 7.1 `contact_messages`
Direct communication from the contact page.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(255) NOT NULL
- `phone`: VARCHAR(50) NOT NULL
- `email`: VARCHAR(255) NULL (Optional per Bangladesh client requirements)
- `subject`: VARCHAR(255) NOT NULL
- `message`: TEXT NOT NULL
- `status`: ENUM('new', 'read', 'replied', 'archived', 'spam') NOT NULL DEFAULT 'new' (Index)
- `admin_notes`: TEXT NULL (Private, never exposed to API)
- `ip_address`: VARCHAR(45) NULL
- `user_agent`: TEXT NULL
- `created_at`, `updated_at`: TIMESTAMP

### 7.2 `consultation_requests`
Dedicated legal consultation booking engine.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(255) NOT NULL
- `phone`: VARCHAR(50) NOT NULL
- `email`: VARCHAR(255) NULL
- `subject`: VARCHAR(255) NOT NULL
- `practice_area_id`: BIGINT UNSIGNED NULL FK -> `practice_areas.id` ON DELETE SET NULL
- `preferred_date`: DATE NULL
- `message`: TEXT NOT NULL
- `status`: ENUM('new', 'contacted', 'in_progress', 'scheduled', 'completed', 'closed', 'spam') NOT NULL DEFAULT 'new' (Index)
- `admin_notes`: TEXT NULL (Private, never exposed to API)
- `ip_address`: VARCHAR(45) NULL
- `user_agent`: TEXT NULL
- `created_at`, `updated_at`: TIMESTAMP

---

## 8. Domain Group 8: CMS, Settings, SEO & Audit

### 8.1 `homepage_sections`
CMS controller for home page section ordering, titles, and layout configuration.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `section_key`: VARCHAR(100) NOT NULL UNIQUE (Index: 'hero', 'credentials', 'about', 'practice_areas', 'courtroom', 'judgments', 'research', 'publications', 'videos', 'media', 'gallery', 'cta')
- `title`: JSON NOT NULL
- `subtitle`: JSON NULL
- `content`: JSON NULL
- `settings`: JSON NOT NULL (Section-specific options: item limits, layout style, CTA button labels)
- `sort_order`: INT NOT NULL DEFAULT 0 (Index)
- `is_enabled`: BOOLEAN NOT NULL DEFAULT 1 (Index)
- `created_at`, `updated_at`: TIMESTAMP

### 8.2 `pages`
Standard CMS editorial pages (e.g. Terms, Privacy Policy, Chamber Constitution).
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `title`: JSON NOT NULL
- `slug`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `content`: JSON NOT NULL
- `status`: ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' (Index)
- `published_at`: TIMESTAMP NULL
- `created_at`, `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP NULL (SoftDeletes)

### 8.3 `menus` & `menu_items`
Dynamic navigation management.
- `menus`:
  - `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `location`: VARCHAR(50) NOT NULL UNIQUE (Index: 'primary_header', 'footer_quick_links', 'footer_practice_areas')
  - `title`: VARCHAR(100) NOT NULL
  - `created_at`, `updated_at`: TIMESTAMP
- `menu_items`:
  - `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  - `menu_id`: BIGINT UNSIGNED NOT NULL FK -> `menus.id` ON DELETE CASCADE
  - `parent_id`: BIGINT UNSIGNED NULL FK -> `menu_items.id` ON DELETE CASCADE
  - `title`: JSON NOT NULL
  - `url`: VARCHAR(255) NOT NULL
  - `target`: ENUM('_self', '_blank') NOT NULL DEFAULT '_self'
  - `sort_order`: INT NOT NULL DEFAULT 0
  - `created_at`, `updated_at`: TIMESTAMP

### 8.4 `seo_meta`
Polymorphic SEO container for public pages and entities.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `seotable_type`: VARCHAR(255) NOT NULL (Index)
- `seotable_id`: BIGINT UNSIGNED NOT NULL (Index)
- `seo_title`: JSON NULL
- `meta_description`: JSON NULL
- `canonical_url`: VARCHAR(500) NULL
- `og_title`: JSON NULL
- `og_description`: JSON NULL
- `og_image_id`: BIGINT UNSIGNED NULL FK -> `media.id` ON DELETE SET NULL
- `robots`: VARCHAR(100) NOT NULL DEFAULT 'index, follow'
- `schema_type`: VARCHAR(100) NULL (e.g. 'Person', 'LegalService', 'Article')
- `structured_data`: JSON NULL
- `created_at`, `updated_at`: TIMESTAMP
- UNIQUE (`seotable_type`, `seotable_id`)

### 8.5 `site_settings`
Global system configuration key-value storage with type hints.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `key`: VARCHAR(100) NOT NULL UNIQUE (Index)
- `value`: JSON NULL
- `group`: VARCHAR(50) NOT NULL DEFAULT 'general' (Index: 'general', 'contact', 'social', 'analytics', 'seo')
- `is_public`: BOOLEAN NOT NULL DEFAULT 1
- `created_at`, `updated_at`: TIMESTAMP

### 8.6 `activity_logs`
Immutable administrative audit log.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `user_id`: BIGINT UNSIGNED NULL FK -> `users.id` ON DELETE SET NULL
- `action`: VARCHAR(100) NOT NULL (Index: 'create', 'update', 'delete', 'publish', 'login', etc.)
- `subject_type`: VARCHAR(255) NULL
- `subject_id`: BIGINT UNSIGNED NULL
- `description`: VARCHAR(255) NOT NULL
- `old_values`: JSON NULL
- `new_values`: JSON NULL
- `ip_address`: VARCHAR(45) NULL
- `user_agent`: TEXT NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP (Index)

### 8.7 `redirects`
SEO link redirection engine (301/302).
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `source_url`: VARCHAR(255) NOT NULL UNIQUE (Index)
- `target_url`: VARCHAR(255) NOT NULL
- `status_code`: SMALLINT UNSIGNED NOT NULL DEFAULT 301
- `is_active`: BOOLEAN NOT NULL DEFAULT 1 (Index)
- `hit_count`: INT UNSIGNED NOT NULL DEFAULT 0
- `created_at`, `updated_at`: TIMESTAMP
