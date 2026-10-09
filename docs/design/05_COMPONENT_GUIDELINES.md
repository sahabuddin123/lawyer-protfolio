# 05. UI Component Architecture & Inventory Guidelines

**Standard:** Atomic Reusable Primitives with Strict TypeScript Props  
**Lead Coordinator:** Design System Specialist & Senior Frontend Engineer  

---

## 1. Component Taxonomy & Architectural Principles

All components in `frontend/src/components/` adhere to three foundational rules:
1. **Zero Raw Styling Leaks:** All styles derive from semantic Tailwind utility classes mapped to CSS custom properties.
2. **Polymorphic As-Child Support:** Action components (Buttons, Cards, Links) support an `asChild` or explicit routing wrapper for seamless React Router integration.
3. **Strict Accessibility Compliance:** Native keyboard support, focus-visible outlines (`outline-offset-2 outline-[#D4A017]`), and proper ARIA labeling.

---

## 2. Complete Component Inventory Specification

### 2.1 Layout & Structural Primitives
- **`Container`:** Responsive viewport constraint (`default`: 1280px, `wide`: 1440px, `prose`: 768px).
- **`Section`:** Architectural layout block providing standardized vertical breathing room (`py-16` / `lg:py-24`) and alternating background shading (`bg-primary` vs `bg-secondary`).
- **`SectionHeader`:** Composed of an optional gold uppercase eyebrow (`SectionEyebrow`), an editorial serif title (`SectionTitle`), an optional lead subtitle (`SectionDescription`), and alignment controls (`center` or `left`).
- **`GoldDivider`:** Hairline geometric separator with subtle centered diamond/emblem or clean gradient fade.

### 2.2 Action & Interactive Primitives
- **`Button`:**
  - `primary`: Polished solid metallic gold (`bg-[#D4A017] text-[#111111] hover:bg-[#E5B22D] shadow-sm`).
  - `secondary`: Crisp outline (`border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017]/10`).
  - `ghost`: Transparent backdrop (`text-[#F5F5F5] hover:text-[#D4A017] hover:bg-white/5`).
  - `link`: Editorial text link with gold animated underline on hover.
  - States: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading` (with animated SVG spinner).
- **`IconButton`:** Accessible square/circular touch target (minimum 44x44px) for audio/video triggers, search toggles, and modal dismissals.
- **`Badge`:** Pill or micro-rectangle status and category markers (`gold`, `neutral`, `success`, `outline`).

### 2.3 Cards & Content Containers
- **`Card`:** Base surface (`bg-[#1E1E1E] border border-[#2B2B2B] rounded-lg transition-all duration-300 hover:border-[#D4A017]/50 hover:shadow-lg hover:shadow-black/50`).
- **`PracticeCard`:** Numbered legal specialization card featuring an icon slot, bilingual title, excerpt, and arrow hover slide.
- **`CaseCard`:** Courtroom litigation card with court badge, case number, legal domain, summary, and judgment date.
- **`ResearchCard`:** Journal-style article card with category tag, reading time, publication date, and author attribution.
- **`PublicationCard`:** Book or law review presentation card with cover aspect ratio and PDF download badge.
- **`VideoCard`:** Media video card with 16:9 thumbnail, gold duration badge, centered play icon overlay, and platform indicator.
- **`GalleryCard`:** Album presentation card with hover image scale and photo count badge.

### 2.4 Media & Visual Presentation
- **`LazyImage`:** High-performance responsive image wrapper. Handles blur-up loading, aspect ratio retention to eliminate Cumulative Layout Shift (CLS), WebP `srcset` resolution switching, and fallback state on broken image URLs.
- **`Avatar`:** Circular or squircle portrait container with gold rim accent for Advocate Nijam Uddin and staff.

### 2.5 Form Controls & Intake Elements
- **`Input`:** Dark-themed text input (`bg-[#181818] border border-[#2B2B2B] text-[#F5F5F5] focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]`).
- **`Textarea`:** Multi-line text field with auto-expand capability and character counters.
- **`Select`:** Accessible custom or native dropdown with gold chevron icon.
- **`DatePicker`:** Localized calendar input for consultation booking.
- **`SearchInput`:** Global instant search field with debounced query dispatch and keyboard clear button.

### 2.6 Overlays, Modals & Navigation
- **`Header`:** Desktop navigation with glassmorphism blur on scroll, language toggle, and consultation CTA.
- **`MobileNav`:** Accessible full-screen sliding drawer with focus-trap and Escape key dismissal.
- **`Footer`:** Multi-column institutional directory, bar council credentials, chamber contact, and legal disclaimers.
- **`Modal`:** Accessible dialog portal with backdrop blur, focus trap, and ARIA attributes.
- **`Lightbox`:** Full-screen responsive image viewer with keyboard navigation (`Left`, `Right`, `Escape`).
- **`VideoModal`:** Zero-iframe leak video player dialog that automatically pauses video upon closing.

### 2.7 Feedback & State Placeholders
- **`LoadingSpinner`:** Gold metallic dual-ring rotational loader.
- **`Skeleton`:** Dark shimmering placeholders preventing layout shift during TanStack Query fetching.
- **`EmptyState`:** Editorial placeholder featuring a minimal legal emblem and helpful prompt when no items match filters.
- **`ErrorState`:** Graceful error presentation with retry action trigger.
- **`Toast`:** Floating non-intrusive status notification.
