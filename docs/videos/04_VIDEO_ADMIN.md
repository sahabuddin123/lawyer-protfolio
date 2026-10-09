# 04. Video Admin Management Guide

**Component:** `VideosManager.tsx`  
**Route:** `/admin/videos` and `CmsAdminDashboard -> 🎥 Video Archive`  
**Permission:** `manage_videos`  

---

## 1. Administrative Capabilities

1. **Datagrid & Filters:**
   - Real-time search across English and Bengali titles, video IDs, and slugs.
   - Platform filter: All, YouTube, Vimeo, External.
   - Status filter: All, Published, Draft, Archived.
   - Visibility filter: All, Public, Private.
   - Featured filter: Featured vs Standard.
2. **Sort Order Reordering:**
   - Up and Down controls on each table row for intuitive manual sorting.
   - Bulk order persistence via `/api/v1/admin/videos/reorder`.
3. **URL Ingestion & Auto-Detection:**
   - As an admin pastes a video link into the form, `handleUrlChange` automatically classifies the platform and parses the video ID.
   - Real-time embed preview directly within the admin modal ensures valid links prior to saving.
4. **Draft Preview Mode:**
   - Inspect draft videos in a simulated playback environment.
   - Guarantees strict indexing safety with `X-Robots-Tag: noindex, nofollow, noarchive`.
