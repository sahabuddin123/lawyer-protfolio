# Phase 16 — Homepage CMS & Caching Architecture

## 1. CMS Architecture Overview
The homepage is driven by database-backed records and system settings:
- **Sections Table**: `homepage_sections` contains `section_key`, `title`, `subtitle`, `content`, `settings`, `sort_order`, `is_enabled`.
- **Site Settings**: `site_settings` contains public configuration for branding, telephone, chambers address, email, social links, and consultation office hours.

---

## 2. Caching Strategy

### 2.1 Cache Keys & Tagging
- Cache Key: `cms:home:{locale}` (e.g. `cms:home:en`, `cms:home:bn`)
- Cache TTL: 3600 seconds (1 hour)
- Redis Tag: `cms`

### 2.2 Invalidation Matrix
Cache is automatically cleared via `CmsCacheService::forgetHome()` upon any of the following lifecycle events:
1. Section configuration updated (`AdminHomepageController::update`)
2. Section order changed (`AdminHomepageController::reorder`)
3. Site settings updated (`AdminSettingController::update`)
4. Practice area published / unpublished / featured toggle
5. Courtroom experience published / unpublished / visibility change
6. Judgment review published / unpublished / featured toggle
7. Legal research published / unpublished / featured toggle
8. Publication published / unpublished / featured toggle
9. Video published / unpublished / featured toggle
10. Media coverage published / unpublished / featured toggle
11. Gallery album published / unpublished / featured toggle
12. Profile / credentials updated

This guarantees that stale content is never retained while avoiding expensive cold queries on high-traffic visits.
