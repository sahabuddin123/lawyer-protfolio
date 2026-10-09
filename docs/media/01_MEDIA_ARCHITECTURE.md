# Media Module Architecture (Phase 12)

## 1. Executive Overview
The **Media Module** in the Advocate Nijam Uddin (Haq) platform provides a dynamic, admin-controlled, verified repository for all public and editorial appearances of Senior Advocate Nijam Uddin. It is strictly segmented into two fundamental pillars:
1. **Press / Print Media (`media_press`)**: Newspaper coverage, magazine interviews, legal editorial features, op-eds about the Advocate, and online investigative press coverage.
2. **Electronic Media Appearances (`media_appearances`)**: National and international television appearances, judicial panel discussions, radio interviews, talk shows, and digital broadcast debates.

This module strictly adheres to the platform's non-fabrication rule: **No fake production media records are generated or seeded**. All production content must be created and verified by authorized administrators.

---

## 2. Structural Separation from Future Phases
The platform architecture strictly decouples media coverage from other distinct multimedia modules:
- **Publications (Phase 11)**: Legal research treatises and scholarly monographs authored by Nijam Uddin himself.
- **Media Module (Phase 12)**: External press coverage, journalistic features, and broadcast appearances *about* or *featuring* Nijam Uddin.
- **Videos Module (Phase 13)**: Standalone video CMS, playlists, webinars, and educational video series.
- **Gallery Module (Phase 14)**: Photographic collections and visual event archives.

---

## 3. Data Architecture & Table Schemas

### 3.1 `media_press` Table
Enhanced via migration `2026_10_07_050000_enhance_media_press_and_appearances_tables.php`:
- `id`: Primary key (unsigned bigint)
- `category_id`: Foreign key to `categories` (`type = 'press'`)
- `media_type`: Controlled taxonomy (`newspaper`, `magazine`, `online`, `interview`, `press_release`, `column`, `other`)
- `media_name`: Bilingual JSON (`{"en": "...", "bn": "..."}`) representing the publication/source organization
- `title`: Bilingual JSON (`{"en": "...", "bn": "..."}`)
- `slug`: Unique lowercase URL-safe slug
- `published_date`: Date of publication in the source medium
- `article_url`: Validated HTTP/HTTPS external link to the original article
- `featured_image_id`: Foreign key to `media` table (thumbnail/editorial clipping image)
- `document_media_id`: Foreign key to `media` table (PDF clipping/facsimile)
- `description`: Bilingual JSON summary and contextual notes
- `status`: Content state (`draft`, `published`, `archived`)
- `visibility`: Access tier (`public`, `private`)
- `is_featured`: Boolean flag for prominent editorial display
- `sort_order`: Integer sorting sequence
- `published_at`: Canonical publishing timestamp
- `created_at`, `updated_at`, `deleted_at`: Timestamps and soft delete tracking

### 3.2 `media_appearances` Table
Enhanced via migration `2026_10_07_050000_enhance_media_press_and_appearances_tables.php`:
- `id`: Primary key (unsigned bigint)
- `category_id`: Foreign key to `categories` (`type = 'appearances'`)
- `media_type`: Controlled taxonomy (`tv`, `radio`, `interview`, `talk_show`, `discussion`, `podcast`, `digital`, `other`)
- `channel`: Bilingual JSON (`{"en": "...", "bn": "..."}`) broadcasting network/channel
- `program`: Bilingual JSON (`{"en": "...", "bn": "..."}`) program/show title
- `title`: Bilingual JSON discussion topic or appearance title
- `slug`: Unique lowercase URL-safe slug
- `broadcast_date`: Date of broadcast/telecast
- `video_url`: Validated HTTP/HTTPS external video URL (YouTube, Vimeo, broadcaster CDN)
- `thumbnail_id`: Foreign key to `media` table
- `document_media_id`: Foreign key to `media` table (transcript/press kit PDF)
- `description`: Bilingual JSON synopsis of legal commentary delivered
- `status`: Content state (`draft`, `published`, `archived`)
- `visibility`: Access tier (`public`, `private`)
- `is_featured`: Boolean flag for featured placement
- `sort_order`: Integer sorting sequence
- `published_at`: Canonical publishing timestamp
- `created_at`, `updated_at`, `deleted_at`: Timestamps and soft delete tracking

---

## 4. Multi-Layer Security & Caching
- **Draft Protection**: Only items where `status = 'published'` AND `visibility = 'public'` are exposed to public APIs and sitemaps. Draft or private items return `404 Not Found`.
- **Administrative Preview**: Accessible strictly by authorized roles (`manage_press`, `manage_appearances`). Injects `X-Robots-Tag: noindex, nofollow` to prevent search crawler indexing.
- **24-Hour Cache**: Public endpoints leverage 86,400s Redis/file caching, automatically tagged and purged upon CRUD, status transition, or reordering operations.
- **301 Redirect Automation**: When a slug is updated on a published record, a 301 permanent redirect record is automatically inserted into the `redirects` table.
