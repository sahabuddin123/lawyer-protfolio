# Media Module Public UI Design & Architecture (Phase 12)

## 1. Aesthetic Concept & Brand Identity
The Public Media interface embodies a **Premium Legal Authority & Editorial Archive** design system:
- **Backgrounds**: Deep obsidian black (`#000000`, `#07090E`) with radial gold undertones.
- **Accents**: Judicial burnished gold (`#D4A017`, `gold-primary`) with subtle metallic borders (`#262626`).
- **Typography**: Serif titles (Playfair / Cinzel style) for high judicial dignity, paired with crisp sans-serif for metadata and dates.
- **Micro-Interactions**: Smooth hover elevations, gold badge highlights, subtle icon transitions, and accessible focus outlines.

---

## 2. Public Pages & Routes

### 2.1 Media Landing Page (`/media`)
Implemented in `frontend/src/pages/MediaPage.tsx`:
1. **Editorial PageHeader**:
   - Eyebrow: `National Discourse & Public Record` / `জাতীয় বক্তব্য ও সমসাময়িক ভাষ্য`
   - Title: `Media Commentary & Press Analysis` / `মিডিয়া উপস্থিতি ও সংবাদ বিশ্লেষণ`
   - Description summarizing Advocate Nijam Uddin's commentary across national press and broadcast stations.
   - Accessible Breadcrumb navigation (`Home / Media`).
2. **Navigation Tabs**:
   - `All Coverage`: Aggregated editorial view.
   - `Press & Print`: Dedicated view for newspaper and magazine features.
   - `Electronic & Broadcast`: Dedicated view for TV and radio appearances.
3. **Featured Showcase (on All Tab)**:
   - Split card grid showcasing featured press reports and television appearances with gold badges and publication dates.
4. **Search & Filter Toolbar (on Press & Appearances Tabs)**:
   - Live debounced keyword search.
   - Taxonomy type filter dropdown.
   - Year filter dropdown (`All Years`, `2026`, `2025`, `2024`, etc.).
   - Reset filters button.
5. **Paginated Media Grid**:
   - 3-column responsive card layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
   - Cards display media type badge, outlet name, title, date, excerpt, and arrow link.
6. **Accessible Pagination Bar**:
   - Previous/Next controls, active page indicator, and result count summary.

### 2.2 Media Detail Page (`/media/:slug`)
Implemented in `frontend/src/pages/MediaDetailPage.tsx`:
1. **Navigation & Breadcrumb Header**:
   - Back button returning to `/media`.
   - Category / medium badge (`Newspaper`, `Television`, `Radio`, etc.).
   - Canonical title rendered in active language (`en` or `bn`).
   - Publication outlet and broadcast date metadata.
2. **Action Bar**:
   - Direct external link button with outbound indicator and safety notice.
   - Official document/clipping download button if PDF is attached.
3. **Featured Image / Video Preview**:
   - Clean aspect-ratio container with neutral fallback if no image is uploaded.
4. **Editorial Description & Synopsis**:
   - Richly formatted bilingual text summarizing the legal discourse and case context.
5. **Related Media Section**:
   - Deterministic 3-card grid of related articles or appearances from the same media type.
