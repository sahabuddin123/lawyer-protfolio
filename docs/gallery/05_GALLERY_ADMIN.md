# 05. Gallery Admin Console & Management UI

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** Senior React/TypeScript Engineer & UI/UX Designer  
**Component:** `frontend/src/features/gallery/GalleryManager.tsx`  
**Route:** `/admin/gallery` & Embedded in `CmsAdminDashboard` (`manage_gallery`)  

---

## 1. Administrative Workflow Architecture

The Gallery Manager empowers chamber staff and media administrators to curate visual collections through a four-part workflow:

```
[Album Datagrid] ──▶ [Tabbed Album Modal] ──▶ [In-Modal Photo Manager] ──▶ [Draft Preview & Publishing]
```

### 1.1 Datagrid Capabilities
- **Cover Previews:** Displays square thumbnails with fallback placeholders and featured gold star badges.
- **Bilingual Title Display:** Primary English headline alongside secondary Bengali representation.
- **Metadata Columns:** Category badge, photo count pill, event date, status (`published`, `draft`, `archived`), visibility (`public`, `private`).
- **Interactive Filtering:** Real-time search query debouncing, status filter, visibility filter, and featured state selector.
- **Action Triggers:** Draft preview, edit album, delete confirmation.

---

## 2. Tabbed Album Form Modal

1. **General Tab:**
   - English Title (Mandatory) & Bengali Title.
   - Slug generation and collision validation.
   - Category selector linked to taxonomy.
   - Event Date picker.
2. **Content Tab:**
   - English and Bengali narrative description editors with tabbed language toggling.
3. **Photos Tab (Image Manager):**
   - Active only when editing an album.
   - **Upload Button:** Triggers direct file selection, validating MIME types and sending multipart requests to the backend.
   - **Thumbnails Grid:** Displays all attached photos with ordinal badges (`#1`, `#2`, ...).
   - **Cover Selection:** "Set Cover" button updates the album's primary cover image.
   - **Sort Buttons:** Accessible "Move Up" and "Move Down" buttons for immediate reordering.
   - **Mini Metadata Editor:** Opens modal to edit individual photo captions (EN/BN), alt text (EN/BN), visibility, and featured flag.
   - **Remove Button:** Safely detaches photo from album while preserving the underlying file in the Media Library.
4. **Publishing Tab:**
   - Status: Draft, Published, Archived.
   - Visibility: Public, Private.
   - Featured checkbox.
   - Sort Order numeric input.
5. **SEO Tab:**
   - Meta Title (EN/BN), Meta Description (EN/BN), Canonical URL.
