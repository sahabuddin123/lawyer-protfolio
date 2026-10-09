# 08. Accessible Gallery Lightbox Architecture

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** Accessibility Specialist & Senior React/TypeScript Engineer  
**Component Reference:** `frontend/src/pages/AlbumDetailPage.tsx`

---

## 1. Lightbox Accessibility Principles

The Lightbox overlay provides a distraction-free, high-resolution viewing experience that complies fully with WCAG 2.1 Level AA standards.

### 1.1 Structural Modality
- **HTML Dialog / Overlay:** Rendered with `role="dialog"`, `aria-modal="true"`, and `aria-label="Image lightbox"`.
- **Background Scrim:** Obsidian backdrop (`bg-black/95`) with click-to-dismiss behavior.
- **Scroll Lock:** Automatically prevents background document scrolling (`document.body.style.overflow = 'hidden'`) while open, restoring original overflow upon closing.

---

## 2. Keyboard & Focus Management

| Key / Event | Lightbox Action | Notes |
| :--- | :--- | :--- |
| `Escape` | Close Lightbox | Restores keyboard focus directly to the originating thumbnail element. |
| `ArrowRight` | Next Image | Cycles forward; wraps to index 0 at end of list. |
| `ArrowLeft` | Previous Image | Cycles backward; wraps to end of list when at index 0. |
| `Tab` / `Shift+Tab` | Focus Cycle | Traps focus within modal controls (Close, Prev, Next, Thumbnails). |

### Focus Return Mechanism
When an image tile in the album grid is clicked or activated via keyboard `Enter` / `Space`, the component stores `triggerRef.current`. When the lightbox closes via `Escape` or the close button, focus is automatically programmatically returned to that exact grid button.

---

## 3. Touch & Mobile Gestures

On mobile and touch devices:
- **Touch Start / Move / End:** Registers horizontal swipe displacement.
- **Swipe Left (`deltaX < -50`):** Advances to next photograph.
- **Swipe Right (`deltaX > 50`):** Returns to previous photograph.
- **Tap Overlay:** Dismisses lightbox when tapped outside the active image container.

---

## 4. Metadata & Filmstrip Presentation

1. **Active Image Display:**
   - Eagerly loads high-resolution photo with fallback to standard card variant.
   - Smooth transition fade-in effect.
2. **Caption & Counter Bar:**
   - Formatted index pill: `e.g. 3 / 12`.
   - Bilingual caption (`caption[locale]`) rendered with serif styling.
   - Accessible alt text preserved on the `<img>` element.
3. **Filmstrip Thumbnail Bar:**
   - Horizontal scrollable ribbon of thumbnails at the bottom of the viewport.
   - Highlighted active border (`border-amber-400 ring-2 ring-amber-500/50`).
   - Click/tap any filmstrip thumbnail to jump directly to that photograph.
