# 07. Accessibility Specification (WCAG 2.1 AA)

**Compliance Target:** WCAG 2.1 Level AA Standard  
**Lead Coordinator:** Accessibility Specialist & QA Architect  

---

## 1. Core Accessibility Standards

### 1.1 Keyboard Navigation & Focus Visible
- All interactive controls (buttons, links, form inputs, modal dismissals, accordion triggers) are operable via keyboard alone.
- Focus outlines use high-visibility gold rings:
  `focus-visible:outline-2 focus-visible:outline-[#D4A017] focus-visible:outline-offset-2`.
- Focus is trapped inside active modals and the mobile navigation drawer. Pressing `Escape` closes the active overlay and returns focus to the initiating trigger.

### 1.2 Color Contrast & Low Vision
- Normal text (15px): Minimum contrast ratio **4.5:1** against the background.
- Large text (>= 18px bold or >= 24px normal): Minimum contrast ratio **3.0:1**.
- UI components and graphical objects: Minimum contrast ratio **3.0:1**.
- Information is never conveyed by color alone (e.g. required form fields include text markers, error states include iconography and descriptive error messages).

### 1.3 Screen Reader Optimization & Semantic HTML
- Landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Dynamic elements use ARIA attributes:
  - `aria-expanded` on mobile navigation triggers and accordion panels.
  - `aria-haspopup="dialog"` on modal triggers.
  - `aria-current="page"` on the active navigation item.
  - `role="alert"` on form validation error banners and dynamic toasts.
  - Descriptive `alt` attributes on all images in English and Bengali.

---

## 2. Forms Accessibility
- Form inputs have associated `<label>` elements matching `htmlFor` and `id`.
- Error messages are programmatically linked using `aria-describedby="field-error-id"`.
- Form validation is non-destructive (client errors do not wipe user inputs).
- Honeypot anti-spam fields are tagged with `aria-hidden="true"` and `tabIndex={-1}` so screen readers ignore them completely.
