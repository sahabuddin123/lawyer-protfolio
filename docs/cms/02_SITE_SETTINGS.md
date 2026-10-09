# 02 — Site Settings System

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 5: CMS + Site Settings Engine

---

## 1. Overview

The Site Settings subsystem manages global configuration parameters for the platform. Settings are structured into discrete functional groups, support strict data type casting, enforce bilingual formatting where appropriate, and distinguish between **publicly accessible** parameters and **internal/administrative** parameters.

---

## 2. Configuration Categories

The platform implements 36 architectural site settings categorized into 7 core groups:

| Category | Description | Sample Keys | Publicly Exposed |
| :--- | :--- | :--- | :--- |
| `general` | Core website identity, timezones, copyright | `site_name`, `site_title`, `default_locale`, `copyright_text` | Yes (Public subset) |
| `branding` | Logos (light/dark/alt), favicons, share image | `logo_light`, `logo_dark`, `favicon`, `og_default_image` | Yes |
| `contact` | Primary chamber, address, telephone, email | `primary_email`, `primary_phone`, `chamber_address`, `office_hours`| Yes |
| `social` | Verified social media profiles | `social_facebook`, `social_linkedin`, `social_youtube`, `social_twitter` | Yes |
| `office` | Branch chambers, courtroom emergency contact | `emergency_contact_note`, `google_maps_embed_url` | Yes |
| `seo` | Default meta titles, robots directives, schema | `default_meta_title`, `default_meta_description`, `robots_default` | Yes (Public subset) |
| `system` | Maintenance mode, analytics tracking IDs, cache | `maintenance_mode`, `analytics_id`, `cache_ttl_minutes` | No (Admin only) |

---

## 3. Data Schema & Model Representation

### Database Table: `site_settings`
```sql
CREATE TABLE `site_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(191) NOT NULL,
  `group` varchar(50) NOT NULL DEFAULT 'general',
  `value` json DEFAULT NULL,
  `type` enum('string','text','boolean','integer','json','array','image','file') NOT NULL DEFAULT 'string',
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`),
  KEY `site_settings_group_index` (`group`),
  KEY `site_settings_is_public_index` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### JSON Value Storage
Settings that vary by language (e.g. `site_name`, `site_title`, `chamber_address`, `copyright_text`) are stored in `value` as JSON objects:
```json
{
  "en": "Advocate Nijam Uddin",
  "bn": "অ্যাডভোকেট নিজাম উদ্দিন"
}
```
Scalar settings (e.g. `maintenance_mode`, `default_locale`, `primary_email`) store direct scalars or primitive JSON values.

---

## 4. API Endpoints

### 4.1 Public Settings
- **Route**: `GET /api/v1/settings`
- **Controller**: `App\Http\Controllers\Api\v1\Public\SettingsController@index`
- **Access**: Public (Unauthenticated)
- **Response Format**: Grouped dictionary containing only settings with `is_public = true`.
- **Cache**: Cached for 24 hours via `cms.public.settings.{lang}`.

### 4.2 Admin Settings List
- **Route**: `GET /api/v1/admin/settings`
- **Controller**: `App\Http\Controllers\Api\v1\Admin\AdminSettingController@index`
- **Authorization**: Requires `manage_settings` permission.
- **Query Filters**: `?group=branding`, `?is_public=1`.
- **Response Format**: Complete list of all settings including system parameters and metadata.

### 4.3 Admin Settings Bulk Update
- **Route**: `POST /api/v1/admin/settings`
- **Controller**: `App\Http\Controllers\Api\v1\Admin\AdminSettingController@update`
- **Authorization**: Requires `manage_settings` permission.
- **Request Payload**:
  ```json
  {
    "settings": [
      {
        "key": "primary_phone",
        "value": "+880 1711 000000"
      },
      {
        "key": "site_name",
        "value": {
          "en": "Advocate Nijam Uddin (Haq)",
          "bn": "অ্যাডভোকেট নিজাম উদ্দিন (হক)"
        }
      }
    ]
  }
  ```
- **Validation**: Enforced via `App\Http\Requests\Admin\UpdateSettingsRequest`. Validates array structure, non-empty keys, and sanitizes string/HTML values.
- **Audit Log**: Dispatches `settings_updated` event recording old and new values.
- **Cache Eviction**: Invokes `CmsCacheService::purgeSettings()`.

---

## 5. Security & Boundary Enforcement

1. **Information Leakage Prevention**: Sensitive settings (`maintenance_mode`, internal API keys, database settings) have `is_public = 0`. The public `SettingsController` explicitly filters `where('is_public', true)`.
2. **System Keys Lock**: Core architectural keys have `is_system = 1` preventing arbitrary deletion or schema modification by lower-tier editors.
3. **Safe Protocol Filtering**: Social links and URLs are verified to prevent malicious `javascript:`, `data:`, or `vbscript:` URI schemes.
