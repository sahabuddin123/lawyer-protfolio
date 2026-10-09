# 06. Responsive Breakpoint & Multi-Device Architecture

**Standard:** Mobile-First Fluid Grid Architecture  
**Validated Widths:** 320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px  
**Lead Coordinator:** Senior Frontend Engineer & QA Engineer  

---

## 1. Breakpoint Spectrum & Device Mapping

```
+-----------------------------------------------------------------------------------+
|  Breakpoint  |  Target Devices                    |  Layout Behavior              |
+-----------------------------------------------------------------------------------+
|  < 640px     |  Mobile Phones (320px - 430px)     |  1-col stacked, Drawer Menu   |
|  sm (640px)  |  Large Phones / Phablets           |  1-2 col reflow               |
|  md (768px)  |  iPads & Small Tablets             |  2-col grid, Header compact   |
|  lg (1024px) |  Laptops & Desktop Screens         |  3-col grid, Full desktop nav |
|  xl (1280px) |  Large Desktop / Monitors          |  Standard container max clamp |
|  2xl (1536px)|  Ultra-wide & 4K Displays          |  Wide editorial container     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Responsive Transformation Patterns

### 2.1 Navigation Transformation
- **Desktop (>= 1024px):** Fixed top bar, glassmorphism surface on scroll, horizontal menu links with gold hover underlines, language selector, and consultation button.
- **Mobile (< 1024px):** Compact top bar with Lawyer name / emblem, language toggle, and accessible hamburger button triggering a full-height drawer with backdrop blur.

### 2.2 Editorial Hero Reflow
- **Desktop:** Two-column split layout: Left column showcases classical typography, credentials badge, and CTAs; Right column presents the full-length portrait of Advocate Nijam Uddin in judicial robes.
- **Mobile:** Single-column stacked order:
  1. Eyebrow badge (Advocate, Supreme Court of Bangladesh)
  2. Authority Name: Nijam Uddin (Haq)
  3. High-resolution portrait framed with a subtle gold rim
  4. Core credentials & consultation CTA buttons

### 2.3 Card Grid Reflow
- Desktop: 3 columns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`).
- Tablet: 2 columns (`gap-6`).
- Mobile: 1 column (`gap-4`).

---

## 3. Zero Horizontal Overflow Mandate

1. Every root wrapper uses `overflow-x: hidden` or strict box-sizing.
2. Form fields, tables, and images are bound by `max-w-full`. Tables are wrapped in a horizontally scrollable container with a custom gold scrollbar indicator.
3. Typography uses fluid CSS clamps (`clamp(2rem, 5vw, 3.5rem)`) to prevent rigid pixel text from breaking narrow mobile screens (320px).
