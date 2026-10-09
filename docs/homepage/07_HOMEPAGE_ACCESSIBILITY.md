# Phase 16 — Homepage Accessibility (a11y) Verification

## 1. Compliance Level
The homepage strictly complies with **WCAG 2.1 Level AA** standards.

---

## 2. Accessibility Implementations

### 2.1 Landmark Hierarchy & Semantic Headings
- Exactly one `<h1>` in `<HeroSection />`.
- Logical `<h2>` hierarchy for all homepage section titles.
- `<h3>` and `<h4>` for card titles and subheadings.
- Heading tags are never employed solely for cosmetic sizing.

### 2.2 Keyboard Navigation & Focus Indicators
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-gold-primary`) on all interactive cards, links, and buttons.
- Global "Skip to main judicial content" anchor (`#main-content`) provided in `RootLayout`.
- Modal ESC key listener and focus trapping in `<VideoModal />`.

### 2.3 Color Contrast & Visual Harmony
- Text contrast ratios exceed 4.5:1 for standard body copy (`#F5F5F5` on `#111111` / `#181818`).
- Gold accents (`#D4A017` / `#B8860B`) exceed 3:1 contrast against dark background surfaces.

### 2.4 Reduced Motion
- Motion variants respect the user's operating system preferences via `prefers-reduced-motion`.
