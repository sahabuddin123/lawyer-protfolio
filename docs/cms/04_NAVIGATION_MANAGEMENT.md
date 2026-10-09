# 04 — Navigation & Menu Management

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 5: CMS + Site Settings Engine

---

## 1. Overview

The Navigation Management system allows administrative control over all platform navigation menus (e.g. Header Main Menu, Footer Quick Links, Legal Disclaimers). It supports multi-level nested item trees, bilingual labels, internal route mapping vs. external URLs, customizable link targets, and link safety verification.

---

## 2. Menu Structure & Hierarchy

Navigation is split into two relational tiers:
1. **`Menu` (`menus` table)**: Represents a distinct layout placement container identified by an immutable system key (`location`):
   - `header`: Primary desktop/mobile header navigation.
   - `footer`: Main footer category links.
   - `legal`: Bottom-bar legal notices, disclaimers, and copyright links.
2. **`MenuItem` (`menu_items` table)**: Individual link nodes associated with a parent menu. Supports self-referential parent-child relationships for dropdowns and nested flyouts.

```
+-----------------------------------------------------------+
|                    Menu: 'header'                         |
+-----------------------------------------------------------+
  |
  +-- [Item 1] Home (/)
  |
  +-- [Item 2] About (/about)
  |      |
  |      +-- [Sub-item 2.1] Judicial Philosophy (/about#judicial)
  |      +-- [Sub-item 2.2] Professional Timeline (/about#timeline)
  |
  +-- [Item 3] Practice Areas (/practice-areas)
  |
  +-- [Item 4] Research & Judgments (/research)
  |
  +-- [Item 5] Contact (/contact)
```

---

## 3. Database Schema

### `menus`
- `id` (bigint, PK)
- `name` (varchar): Human-readable title (e.g. "Primary Navigation")
- `location` (varchar, UNIQUE): Machine key used by frontend layouts (`header`, `footer`, `legal`)
- `is_active` (boolean): Master enable/disable toggle for the menu container

### `menu_items`
- `id` (bigint, PK)
- `menu_id` (bigint, FK -> `menus.id`)
- `parent_id` (bigint, NULLABLE FK -> `menu_items.id`)
- `title` (json): Bilingual labels `{"en": "...", "bn": "..."}`
- `url` (varchar, NULLABLE): Fully qualified external or internal URL
- `route_name` (varchar, NULLABLE): Internal frontend route name
- `target` (varchar): `_self` or `_blank`
- `icon` (varchar, NULLABLE): Lucide/Tailwind icon identifier
- `sort_order` (integer): Ascending sort rank within its parent branch
- `is_active` (boolean): Active status flag

---

## 4. URL Safety & Protocol Controls

To protect users against open redirects and XSS injection via navigation links:
1. **Forbidden Schemes**: Form requests explicitly reject `javascript:`, `vbscript:`, and `data:` URI protocols.
2. **External Link Sanitization**: When `target = '_blank'`, public consumers append `rel="noopener noreferrer"` to prevent reverse tabnabbing vulnerabilities.
3. **Internal vs External Distinction**: Links can either specify a relative path/route or a validated `http://` / `https://` absolute URL.

---

## 5. API Reference

### Public API
- `GET /api/v1/navigation`
  - Returns all active menus with their active items structured as recursive hierarchical trees (`children` array).
  - Items are sorted in ascending order by `sort_order`.
  - Cached for 24 hours under `cms.public.navigation.{lang}`.

### Admin API
- `GET /api/v1/admin/menus`: List all menu containers with item counts.
- `POST /api/v1/admin/menus`: Create new menu container.
- `GET /api/v1/admin/menus/{id}`: Detailed menu view with complete nested item hierarchy.
- `PUT /api/v1/admin/menus/{id}`: Update menu details.
- `DELETE /api/v1/admin/menus/{id}`: Delete menu and cascade delete items.
- `POST /api/v1/admin/menus/{id}/items`: Add a new menu item.
- `PUT /api/v1/admin/menu-items/{item}`: Edit menu item properties.
- `DELETE /api/v1/admin/menu-items/{item}`: Remove menu item.
- `POST /api/v1/admin/menus/{id}/items/reorder`: Reorder items by sending an ordered array of IDs.
