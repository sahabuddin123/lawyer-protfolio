# 08. Motion & Micro-Interaction Guidelines

**Philosophy:** Restrained Editorial Motion — Precision over Spectacle  
**Engine:** Framer Motion & CSS Hardware-Accelerated Transitions  
**Lead Coordinator:** Senior UI/UX Engineer & Performance Engineer  

---

## 1. Editorial Motion Principles

In judicial and high-status legal environments, flashy animations, excessive bouncing, or spinning elements convey frivolity and undermine trust. Motion must be:
1. **Purposeful:** Enhances comprehension, spatial awareness, or indicates state changes.
2. **Subtle:** Modest displacement distances (8px to 16px) and gentle opacity fades.
3. **Snappy:** Durations clamped between 150ms and 350ms using smooth cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 2. Standardized Transition Tokens

| Animation Type | Trigger | Properties Changed | Duration | Easing Curve |
| :--- | :--- | :--- | :--- | :--- |
| **Card Hover** | Mouse Enter | `border-color`, `transform (translateY -2px)`, `box-shadow` | 200ms | `ease-out` |
| **Button Shimmer** | Mouse Enter | `background-color`, `box-shadow` | 150ms | `ease-in-out` |
| **Section Reveal** | Viewport Scroll | `opacity (0 -> 1)`, `transform (translateY 16px -> 0)` | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **Modal / Lightbox**| Click Open | `opacity (0 -> 1)`, `scale (0.97 -> 1)` | 200ms | `ease-out` |
| **Drawer Slide** | Menu Toggle | `transform (translateX 100% -> 0)` | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` |

---

## 3. Reduced Motion Compliance (`prefers-reduced-motion`)

For users who have enabled reduced motion in their operating system settings:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
In Framer Motion, all motion components query `useReducedMotion()` and immediately render at their final rest position (`opacity: 1, y: 0`) without intermediate transitions.
