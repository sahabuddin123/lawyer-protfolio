# 04. Spacing, Container & Layout Architecture

**Base Grid Unit:** 4px / 8px Incremental Scale  
**Max Content Bounds:** 1280px (Standard Editorial Container) & 1440px (Wide Showcase)  
**Lead Coordinator:** Senior Frontend Engineer & UI/UX Specialist  

---

## 1. Mathematical Spacing Scale

The spacing scale is locked to standardized 4-pixel geometric multiples, eliminating arbitrary margin or padding values:

| Token | Rem Value | Pixels | Application Scope |
| :--- | :--- | :--- | :--- |
| `space-1` | 0.25rem | 4px | Micro-spacing, badge internal padding, icon offsets |
| `space-2` | 0.5rem | 8px | Button inline gaps, list item spacing |
| `space-3` | 0.75rem | 12px | Form input vertical padding, compact card gaps |
| `space-4` | 1.0rem | 16px | Standard button padding, mobile gutter |
| `space-6` | 1.5rem | 24px | Card internal padding, desktop component gaps |
| `space-8` | 2.0rem | 32px | Sub-section spacing, tablet container gutter |
| `space-10` | 2.5rem | 40px | Medium section header offsets |
| `space-12` | 3.0rem | 48px | Desktop container gutter, card grid vertical gap |
| `space-16` | 4.0rem | 64px | Standard section vertical padding |
| `space-20` | 5.0rem | 80px | Major section padding on desktop |
| `space-24` | 6.0rem | 96px | Hero padding, editorial separation |
| `space-32` | 8.0rem | 128px | Landmark section transitions |

---

## 2. Standardized Container Hierarchy

```
+-----------------------------------------------------------------------------------+
|  VIEWPORT (Up to 1920px+)                                                         |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  WIDE EDITORIAL WRAPPER (max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12)      |  |
|  |  (Used for Gallery Masonry, Full-bleed Timeline & Courtroom Case Carousel)  |  |
|  |                                                                             |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  |  STANDARD CONTAINER (max-w-7xl / 1280px mx-auto px-4 sm:px-6 lg:px-8) |  |  |
|  |  |  (Used for Section Headers, Card Grids, Practice Areas, Research)     |  |  |
|  |  |                                                                       |  |  |
|  |  |  +-----------------------------------------------------------------+  |  |  |
|  |  |  |  PROSE / EDITORIAL CONTAINER (max-w-3xl / 768px mx-auto)       |  |  |  |
|  |  |  |  (Used for Legal Case Analysis, Judgment Text, Long-form Bio)   |  |  |  |
|  |  |  +-----------------------------------------------------------------+  |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Responsive Column Grid Specifications

- **Desktop (>= 1024px):** 12-column grid, 32px column gutter, 48px margin.
- **Tablet (768px - 1023px):** 8-column grid, 24px column gutter, 32px margin.
- **Mobile (320px - 767px):** 4-column grid, 16px column gutter, 16px-20px margin.
- **Zero Horizontal Scroll Guarantee:** All containers utilize `box-sizing: border-box`, explicit max-width clamps, and zero hardcoded pixel widths on fluid child elements.
