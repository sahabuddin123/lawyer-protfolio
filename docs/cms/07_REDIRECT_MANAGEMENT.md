# 07 — URL Redirect Management

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 5: CMS + Site Settings Engine

---

## 1. Overview

The Redirect Management subsystem enables administrators to define HTTP redirection rules (`301 Moved Permanently` or `302 Found`). It provides automatic redirection generation when published page slugs are modified, prevents infinite redirect loops, blocks open redirect exploits, and tracks usage hit counts.

---

## 2. Database Schema

### `redirects`
```sql
CREATE TABLE `redirects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_path` varchar(255) NOT NULL,
  `target_path` varchar(255) NOT NULL,
  `status_code` smallint unsigned NOT NULL DEFAULT '301',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `hits` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `redirects_source_path_unique` (`source_path`),
  KEY `redirects_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Path Normalization & Loop Prevention

### 3.1 Normalization
- Leading and trailing slashes are harmonized: `/old-path/` is normalized to `/old-path`.
- Whitespace is stripped, and paths are lowercased.

### 3.2 Loop & Self-Redirect Prevention
The `RedirectRequest` validation enforces:
- `source_path !== target_path`: Direct self-redirects are rejected with HTTP 422.
- Mutual loop prevention: If `/path-a` targets `/path-b`, an incoming rule targeting `/path-b` towards `/path-a` is blocked.

### 3.3 Open Redirect Protection
Target paths must either be relative root paths (starting with `/`) or conform to valid, secure absolute URLs (`https://`). Malicious external schemes (`javascript:`, `data:`) are strictly forbidden.

---

## 4. Automated Slug Redirects

When an existing page's slug changes in `AdminPageController@update`:
1. The controller compares `$oldSlug` with `$newSlug`.
2. If changed and the page was in `published` status, it executes:
   ```php
   Redirect::updateOrCreate(
       ['source_path' => "/pages/{$oldSlug}"],
       [
           'target_path' => "/pages/{$newSlug}",
           'status_code' => 301,
           'is_active' => true,
       ]
   );
   ```
3. An audit log event is recorded noting the automated redirect creation.

---

## 5. API Reference

### Admin API Endpoints
- `GET /api/v1/admin/redirects`: Paginated list of redirect rules with search filter and sorting.
- `POST /api/v1/admin/redirects`: Create redirect rule.
- `GET /api/v1/admin/redirects/{id}`: View redirect rule details.
- `PUT /api/v1/admin/redirects/{id}`: Update rule target, status code, or active state.
- `DELETE /api/v1/admin/redirects/{id}`: Delete redirect rule.
