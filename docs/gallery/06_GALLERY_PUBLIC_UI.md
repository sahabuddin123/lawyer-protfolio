# 06. Gallery Public UI & Layout Architecture

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** UI/UX Designer & Senior React/TypeScript Engineer  
**Pages:**
- `frontend/src/pages/GalleryPage.tsx` (`/gallery`)
- `frontend/src/pages/AlbumDetailPage.tsx` (`/gallery/:slug`)

---

## 1. Aesthetic Design System Integration

The Public Gallery adheres strictly to the premium editorial legal identity of the platform:
- **Palette:** Rich obsidian dark background (`bg-navy-950`/`bg-slate-900`), warm gold metallic accents (`text-amber-500`/`border-amber-500/30`), crisp ivory typography (`text-slate-100`/`text-slate-300`).
- **Typography:** Serif headings (`Cinzel` / `Playfair Display`) paired with clean geometric sans-serif for metadata and body narrative (`Inter`).
- **Surface Elevation:** Translucent glassmorphism (`backdrop-blur-md`, subtle border glows `border-white/10`).

---

## 2. Public Gallery Listing Page (`/gallery`)

### 2.1 Layout Hierarchy
```
Page Header (Eyebrow, Title, Description)
   ↓
Filter & Search Toolbar (Category Pills, Search Input, Active Counts)
   ↓
Featured Albums Section (Highlighted Editorial Grid)
   ↓
Main Album Grid (3-Column Responsive Grid with Aspect Ratio Preservation)
   ↓
Pagination Controls (Accessible Next/Prev Buttons)
```

### 2.2 Album Card Structure
Each album card presents:
- **Aspect-Ratio Reserved Cover:** Uses `aspect-[4/3]` container to eliminate Cumulative Layout Shift (CLS).
- **Featured Ribbon / Gold Star:** Identifies highlighted editorial albums.
- **Category Badge:** Subdued amber pill indicating professional classification.
- **Photo Count Indicator:** Pill displaying count of public photographs.
- **Bilingual Title & Description:** Dynamic language switching (`en`/`bn`) with elegant line clamps (`line-clamp-2`).
- **Event Date:** Formatted localized calendar indicator.
- **Interactive States:** Smooth hover scale (`scale-105`), subtle gold border luminescence, and accessible link wrapper pointing to `/gallery/:slug`.

---

## 3. Public Album Detail Page (`/gallery/:slug`)

### 3.1 Layout Hierarchy
```
Breadcrumbs (Home > Gallery > [Album Title])
   ↓
Album Hero Section (Category, Event Date, Title, Photo Count, Full Narrative)
   ↓
Masonry / Grid Image Showcase (Multi-column responsive grid with varied aspect ratios)
   ↓
Accessible Lightbox Overlay (Triggered upon photo selection)
   ↓
Related Albums Section (Contextual recommendations in the same category)
   ↓
Back Navigation (Return to Full Gallery)
```

### 3.2 Responsive Masonry Presentation
- **Desktop (1024px+):** 3-column staggered grid.
- **Tablet (768px - 1023px):** 2-column balanced grid.
- **Mobile (320px - 767px):** Single-column full-width view with touch-friendly spacing.
- **Image Item Features:**
  - Dynamic aspect ratios computed from image metadata or standard aspect classes.
  - Hover zoom and dark vignette gradient.
  - Overlay captions (EN/BN) on hover/focus.
  - High-visibility keyboard focus indicators for accessibility.
  - Expand icon indicating lightbox trigger.
