# 03. Database Entity Relationship Diagram (ERD)

**Project:** Nijam Uddin (Haq) — Legal Authority & Portfolio Platform  
**Database:** `nijamuddin_db` (MySQL 8.0.31 InnoDB)  
**Document Version:** 1.0.0 (Phase 1 Final)  
**Lead Coordinator:** Database Architect & Senior Solution Architect  

---

## 1. Complete System Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ACTIVITY_LOGS : performs
    USERS ||--o{ MEDIA : uploads
    USERS }o--o{ ROLES : assigned
    ROLES }o--o{ PERMISSIONS : contains

    MEDIA ||--o{ PROFILES : "profile/robe photo"
    MEDIA ||--o{ CREDENTIALS : "certificate"
    MEDIA ||--o{ PRACTICE_AREAS : "featured image"
    MEDIA ||--o{ COURTROOM_EXPERIENCES : "featured image"
    MEDIA ||--o{ CASE_DOCUMENTS : "document file"
    MEDIA ||--o{ LEGAL_RESEARCHES : "cover/pdf"
    MEDIA ||--o{ JUDGMENT_REVIEWS : "cover/pdf"
    MEDIA ||--o{ PUBLICATIONS : "cover/pdf"
    MEDIA ||--o{ MEDIA_PRESS : "thumbnail"
    MEDIA ||--o{ MEDIA_APPEARANCES : "thumbnail"
    MEDIA ||--o{ VIDEOS : "thumbnail"
    MEDIA ||--o{ GALLERY_ALBUMS : "cover image"
    MEDIA ||--o{ GALLERY_IMAGES : "gallery item"
    MEDIA ||--o{ SEO_META : "og image"

    CATEGORIES ||--o{ CATEGORIES : "parent-child"
    CATEGORIES ||--o{ LEGAL_RESEARCHES : classifies
    CATEGORIES ||--o{ PUBLICATIONS : classifies
    CATEGORIES ||--o{ GALLERY_ALBUMS : classifies

    TAGS ||--o{ TAGGABLES : categorizes
    LEGAL_RESEARCHES ||--o{ TAGGABLES : polymorphic
    JUDGMENT_REVIEWS ||--o{ TAGGABLES : polymorphic
    PUBLICATIONS ||--o{ TAGGABLES : polymorphic
    COURTROOM_EXPERIENCES ||--o{ TAGGABLES : polymorphic

    COURTROOM_EXPERIENCES ||--o{ CASE_DOCUMENTS : contains
    PRACTICE_AREAS ||--o{ CONSULTATION_REQUESTS : refers

    GALLERY_ALBUMS ||--o{ GALLERY_IMAGES : contains
    MENUS ||--o{ MENU_ITEMS : organizes
    MENU_ITEMS ||--o{ MENU_ITEMS : "parent-child"

    PAGES ||--o| SEO_META : polymorphic
    PRACTICE_AREAS ||--o| SEO_META : polymorphic
    COURTROOM_EXPERIENCES ||--o| SEO_META : polymorphic
    LEGAL_RESEARCHES ||--o| SEO_META : polymorphic
    JUDGMENT_REVIEWS ||--o| SEO_META : polymorphic
    PUBLICATIONS ||--o| SEO_META : polymorphic
```

---

## 2. Detailed Domain ER Diagrams

### 2.1 Identity, RBAC & Media Storage Core

```mermaid
erDiagram
    USERS {
        bigint id PK
        string name
        string email UK
        string phone
        string password
        bigint avatar_media_id FK
        boolean is_active
        timestamp last_login_at
        string last_login_ip
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    ROLES {
        bigint id PK
        string name UK
        string guard_name
    }

    PERMISSIONS {
        bigint id PK
        string name UK
        string guard_name
        string module
    }

    MEDIA {
        bigint id PK
        char uuid UK
        string disk
        string directory
        string filename
        string original_name
        string mime_type
        string extension
        bigint size_bytes
        int width
        int height
        json alt_text
        json caption
        json variants
        bigint uploaded_by FK
        timestamp created_at
    }

    USERS ||--o{ MEDIA : uploads
    USERS }o--o{ ROLES : "model_has_roles"
    ROLES }o--o{ PERMISSIONS : "role_has_permissions"
```

### 2.2 Profile, Academic Pedigree & Professional Honors

```mermaid
erDiagram
    PROFILES {
        bigint id PK
        json name
        json title
        json short_bio
        json long_bio
        bigint profile_photo_id FK
        bigint court_robes_photo_id FK
        string bar_council_enrollment
        string high_court_enrollment
        string appellate_division_enrollment
        json chambers_address
        json office_address
        string phone
        string email
        string whatsapp
        json philosophy
        json legal_approach
    }

    CREDENTIALS {
        bigint id PK
        enum category
        json title
        json institution
        string year
        string credential_id
        bigint certificate_media_id FK
        boolean is_featured
        int sort_order
    }

    EDUCATIONS {
        bigint id PK
        json degree
        json institution
        json department
        string year_completed
        json distinction
        int sort_order
    }

    CAREER_TIMELINES {
        bigint id PK
        string period
        json title
        json organization
        json description
        int sort_order
    }

    PROFESSIONAL_MEMBERSHIPS {
        bigint id PK
        json organization
        json role
        string membership_number
        string year_joined
        boolean is_active
        int sort_order
    }
```

### 2.3 Legal Practice & Courtroom Advocacy

```mermaid
erDiagram
    PRACTICE_AREAS {
        bigint id PK
        json title
        string slug UK
        json short_description
        json full_description
        string icon_name
        bigint featured_image_id FK
        enum status
        boolean is_featured
        int sort_order
        timestamp published_at
        timestamp deleted_at
    }

    COURTROOM_EXPERIENCES {
        bigint id PK
        json title
        string slug UK
        string case_number
        string court
        string case_type
        int year
        json legal_area
        json role
        json summary
        json description
        json issues
        json arguments
        json outcome
        date judgment_date
        bigint featured_image_id FK
        enum visibility
        enum status
        boolean is_featured
        int sort_order
        timestamp published_at
        timestamp deleted_at
    }

    CASE_DOCUMENTS {
        bigint id PK
        bigint courtroom_experience_id FK
        json title
        bigint media_id FK
        boolean is_confidential
        int sort_order
        int download_count
    }

    COURTROOM_EXPERIENCES ||--o{ CASE_DOCUMENTS : holds
```

### 2.4 Legal Research, Landmark Judgments & Publications

```mermaid
erDiagram
    CATEGORIES {
        bigint id PK
        bigint parent_id FK
        string type
        json name
        string slug UK
        json description
        int sort_order
        boolean is_active
    }

    LEGAL_RESEARCHES {
        bigint id PK
        bigint category_id FK
        enum research_type
        json title
        string slug UK
        json author
        json excerpt
        json content
        bigint featured_image_id FK
        bigint pdf_media_id FK
        int view_count
        enum status
        boolean is_featured
        timestamp published_at
        timestamp deleted_at
    }

    JUDGMENT_REVIEWS {
        bigint id PK
        json case_name
        string citation
        string slug UK
        string court
        date judgment_date
        json legal_area
        json summary
        json key_issues
        json court_decision
        json author_analysis
        json practical_significance
        bigint featured_image_id FK
        bigint pdf_media_id FK
        enum status
        boolean is_featured
        timestamp published_at
        timestamp deleted_at
    }

    PUBLICATIONS {
        bigint id PK
        bigint category_id FK
        enum publication_type
        json title
        string slug UK
        json publication_name
        date publication_date
        json author
        json excerpt
        json content
        string external_url
        bigint cover_image_id FK
        bigint pdf_media_id FK
        enum status
        boolean is_featured
        timestamp deleted_at
    }

    CATEGORIES ||--o{ LEGAL_RESEARCHES : categorizes
    CATEGORIES ||--o{ PUBLICATIONS : categorizes
```

### 2.5 Media Coverage, Video Broadcasts & Gallery

```mermaid
erDiagram
    MEDIA_PRESS {
        bigint id PK
        json media_name
        json title
        string slug UK
        date published_date
        string article_url
        bigint featured_image_id FK
        json description
        enum status
        boolean is_featured
        timestamp deleted_at
    }

    MEDIA_APPEARANCES {
        bigint id PK
        json channel
        json program
        json title
        string slug UK
        string video_url
        bigint thumbnail_id FK
        date broadcast_date
        json description
        enum status
        boolean is_featured
        timestamp deleted_at
    }

    VIDEOS {
        bigint id PK
        json title
        string slug UK
        enum platform
        string video_url
        string video_id
        bigint thumbnail_id FK
        string duration
        json description
        date published_date
        enum status
        boolean is_featured
        timestamp deleted_at
    }

    GALLERY_ALBUMS {
        bigint id PK
        json title
        string slug UK
        json description
        bigint cover_image_id FK
        bigint category_id FK
        date event_date
        enum status
        boolean is_featured
        int sort_order
        timestamp deleted_at
    }

    GALLERY_IMAGES {
        bigint id PK
        bigint album_id FK
        bigint media_id FK
        json caption
        json alt_text
        int sort_order
        boolean is_featured
    }

    GALLERY_ALBUMS ||--o{ GALLERY_IMAGES : contains
```

### 2.6 Client Communication & Intake Inquiries

```mermaid
erDiagram
    CONTACT_MESSAGES {
        bigint id PK
        string name
        string phone
        string email
        string subject
        text message
        enum status
        text admin_notes
        string ip_address
        text user_agent
        timestamp created_at
    }

    CONSULTATION_REQUESTS {
        bigint id PK
        string name
        string phone
        string email
        string subject
        bigint practice_area_id FK
        date preferred_date
        text message
        enum status
        text admin_notes
        string ip_address
        text user_agent
        timestamp created_at
    }

    PRACTICE_AREAS ||--o{ CONSULTATION_REQUESTS : routes
```

### 2.7 CMS, Dynamic Homepage, Audit & System

```mermaid
erDiagram
    HOMEPAGE_SECTIONS {
        bigint id PK
        string section_key UK
        json title
        json subtitle
        json content
        json settings
        int sort_order
        boolean is_enabled
    }

    PAGES {
        bigint id PK
        json title
        string slug UK
        json content
        enum status
        timestamp published_at
        timestamp deleted_at
    }

    MENUS {
        bigint id PK
        string location UK
        string title
    }

    MENU_ITEMS {
        bigint id PK
        bigint menu_id FK
        bigint parent_id FK
        json title
        string url
        enum target
        int sort_order
    }

    SEO_META {
        bigint id PK
        string seotable_type
        bigint seotable_id
        json seo_title
        json meta_description
        string canonical_url
        json og_title
        json og_description
        bigint og_image_id FK
        string robots
        string schema_type
        json structured_data
    }

    SITE_SETTINGS {
        bigint id PK
        string key UK
        json value
        string group
        boolean is_public
    }

    ACTIVITY_LOGS {
        bigint id PK
        bigint user_id FK
        string action
        string subject_type
        bigint subject_id
        string description
        json old_values
        json new_values
        string ip_address
        text user_agent
        timestamp created_at
    }

    REDIRECTS {
        bigint id PK
        string source_url UK
        string target_url
        smallint status_code
        boolean is_active
        int hit_count
    }

    MENUS ||--o{ MENU_ITEMS : contains
```

---

## 3. Structural Relationship Cardinality Matrix

| Relationship | Type | Parent | Child | Cascading Action | Business Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User to Media** | 1:N | `users` | `media` | `ON DELETE SET NULL` | Preserve media when staff accounts are removed. |
| **User to Audit Log** | 1:N | `users` | `activity_logs` | `ON DELETE SET NULL` | Audit trails must remain permanently intact. |
| **Role & Permission** | N:M | `roles` | `permissions` | Pivot cascade | Standard Spatie RBAC integrity. |
| **Media to Models** | 1:N | `media` | Various | `ON DELETE SET NULL` | Removing an image variant doesn't destroy content. |
| **Category to Items** | 1:N | `categories` | Research / Pubs | `ON DELETE SET NULL` | Deleting category does not destroy papers. |
| **Tags to Items** | Poly N:M | `tags` | `taggables` | `ON DELETE CASCADE` | Polymorphic tags cleanup on tag deletion. |
| **Case to Documents** | 1:N | `courtroom_experiences` | `case_documents` | `ON DELETE CASCADE` | Case documents belong strictly to their case. |
| **Album to Images** | 1:N | `gallery_albums` | `gallery_images` | `ON DELETE CASCADE` | Removing album cleans its image relationships. |
| **Menu to Items** | 1:N | `menus` | `menu_items` | `ON DELETE CASCADE` | Menu deletion cleans all nested items. |
| **Entity to SEO** | Poly 1:1 | Entities | `seo_meta` | Application Managed | SEO records attach cleanly to any routable entity. |
