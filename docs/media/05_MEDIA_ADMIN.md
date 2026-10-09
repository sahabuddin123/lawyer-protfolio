# Media Module Admin UI & Management (Phase 12)

## 1. Overview
The Media Administration Interface is integrated into the CMS control panel at `/admin` under the **Media Coverage** tab. It provides a tabbed workspace for managing Press/Print media articles and Electronic media appearances.

---

## 2. Key Components
- **`MediaManager.tsx`**: Main administrative dashboard component providing:
  - Sub-tabs for **Press / Print Coverage** and **Electronic Media Appearances**.
  - Real-time search by title, source, or channel.
  - Media type filtering and status filtering (`all`, `published`, `draft`, `archived`).
  - Featured status toggle and quick inline editing.
  - Drag-and-drop or sequential reordering controls.
  - Creation modal dialogs for Press and Electronic media.
  - Action buttons: Preview (opens draft in non-indexable view), Edit, Delete, View Public.

---

## 3. Press Media Form Fields
- **Basic Information**:
  - Title (English & Bengali)
  - Slug (Collision-safe, auto-generated from English title if blank)
  - Media Type (`newspaper`, `magazine`, `online`, `interview`, `press_release`, `column`, `other`)
  - Source Name (`Daily Star`, `Prothom Alo`, `Dhaka Tribune`, etc.)
  - Publication Date
- **Content & Description**:
  - Summary / Description (English & Bengali)
- **Links & Attachments**:
  - External URL (validated HTTP/HTTPS)
  - Thumbnail / Featured Image ID (via Media Library)
  - Document / Press Clipping PDF ID
- **Publishing & Visibility**:
  - Status (`draft`, `published`, `archived`)
  - Visibility (`public`, `private`)
  - Featured Flag (`true` / `false`)
  - Sort Order (`integer`)

---

## 4. Electronic Media Form Fields
- **Basic Information**:
  - Discussion Title / Headline (English & Bengali)
  - Slug (Collision-safe)
  - Broadcast Type (`tv`, `radio`, `interview`, `talk_show`, `discussion`, `podcast`, `digital`, `other`)
  - Channel / Network (`Channel 24`, `Somoy TV`, `ATN News`, etc.)
  - Program / Show Name (English & Bengali)
  - Appearance / Broadcast Date
- **Content & Notes**:
  - Synopsis / Description (English & Bengali)
- **Video & Media Reference**:
  - External Video URL (YouTube, Vimeo, broadcaster stream)
  - Broadcast Thumbnail ID
  - Document / Transcript PDF ID
- **Publishing & Visibility**:
  - Status (`draft`, `published`, `archived`)
  - Visibility (`public`, `private`)
  - Featured Flag (`true` / `false`)
  - Sort Order (`integer`)

---

## 5. Security & Verification
- **RBAC Enforcement**: UI controls conditionally render based on `user.can('manage_press')` and `user.can('manage_appearances')`.
- **Zero Fabrication**: Clear guidance informs editors that all media entries must correspond to verified real-world press coverage or broadcast appearances.
