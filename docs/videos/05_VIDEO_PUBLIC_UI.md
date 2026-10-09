# 05. Video Public UI Specification

**Public Routes:**  
- `/videos` (`VideosPage.tsx`)  
- `/videos/:slug` (`VideoDetailPage.tsx`)  

---

## 1. Aesthetic Design Standards

In alignment with the judicial platform's design guidelines:
- **Palette:** Deep Obsidian Black (`#000000`), Dark Charcoal Surfaces (`#0F0F0F`, `#1A1A1A`), with Judicial Gold Accents (`#D4AF37`, `#F3E5AB`).
- **Typography:** Serif headings (`Playfair Display`, `Cinzel`) evoking legal authority, paired with clean monospace labels for durations and dates.
- **Layout:** Generous negative space, responsive 16:9 poster ratios, subtle gold hover outlines, and understated micro-animations.

---

## 2. Click-to-Load Player Architecture

To achieve top Lighthouse scores and comply with international privacy best practices:
1. Video cards on the grid and initial detail page renders **do not load iframes or third-party tracking scripts**.
2. Instead, an optimized thumbnail poster is rendered with a prominent play button and duration pill.
3. The video player iframe (`youtube-nocookie.com` or `player.vimeo.com`) is injected **strictly upon user click**.
4. Accessible `title` attribute and `allowFullScreen` parameters are enforced on all players.

---

## 3. Responsive Breakpoints Verification
- **Mobile (320px – 375px):** Single-column grid, full-width touch-friendly play buttons, stacked metadata.
- **Tablet (768px):** Two-column card grid, compact filter pills.
- **Desktop (1024px – 1440px):** Three-column layout with expansive hero featured broadcast on top.
- **Ultra-Wide (1920px):** Max-width 7xl container preventing awkward stretching.
