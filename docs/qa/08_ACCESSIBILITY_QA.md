# 08 — Accessibility (a11y) QA Assessment
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 19 — Full QA & Release Quality Assurance  
**Date:** 2026-10-09  

---

## 1. Accessibility Standards & Compliance Objective
The platform was evaluated against the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standards to ensure accessible access for legal scholars, clients, judiciary officials, and individuals using assistive technologies.

---

## 2. Accessibility Verification Matrix

| WCAG Guideline | Criteria | Implementation Detail | Evaluation |
| :--- | :--- | :--- | :--- |
| **1.1 Text Alternatives** | 1.1.1 Non-text Content | All `<img>` tags possess descriptive `alt` attributes or empty `alt=""` for decorative icons | **PASS** |
| **1.3 Adaptable** | 1.3.1 Info and Relationships | Strict heading hierarchy (`<h1>` unique per page, sequential `<h2>`, `<h3>`); landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`) | **PASS** |
| **1.4 Distinguishable** | 1.4.3 Contrast (Minimum) | Navy `#0A192F` and Charcoal `#1E293B` text on `#FFFFFF` backgrounds exceed 7:1 contrast ratio (exceeds 4.5:1 AA) | **PASS** |
| **2.1 Keyboard Accessible** | 2.1.1 Keyboard | All interactive elements (menus, tabs, carousels, modals) operable via Tab, Enter, Space, Esc | **PASS** |
| **2.1 Keyboard Accessible** | 2.1.2 No Keyboard Trap | Modal lightboxes and mobile navigation drawers can be dismissed with `Escape` key | **PASS** |
| **2.4 Navigable** | 2.4.1 Bypass Blocks | Skip to main content link provided at top of DOM | **PASS** |
| **2.4 Navigable** | 2.4.7 Focus Visible | High-contrast custom focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500`) on all focusable nodes | **PASS** |
| **3.1 Readable** | 3.1.1 Language of Page | `html[lang="en"]` or `html[lang="bn"]` dynamically synchronized upon language toggle | **PASS** |
| **3.2 Predictable** | 3.2.1 On Focus | Focusing on navigation items or form controls never triggers unexpected context changes or submissions | **PASS** |
| **3.3 Input Assistance** | 3.3.1 Error Identification | Form fields display inline localized validation text linked via `aria-describedby` | **PASS** |
| **4.1 Compatible** | 4.1.2 Name, Role, Value | Icon-only buttons (mobile hamburger, close modal, social links) possess `aria-label` or `sr-only` spans | **PASS** |

---

## 3. Modal Lightbox & Focus Trapping Verification
During gallery lightbox and video modal testing:
1. When a modal opens, focus moves directly to the modal container or primary close button.
2. Background scroll is locked (`overflow: hidden`).
3. Tabbing cycles through close, next, and previous buttons without escaping to background content.
4. Pressing `Escape` closes the modal immediately and returns keyboard focus to the triggering image thumbnail.
