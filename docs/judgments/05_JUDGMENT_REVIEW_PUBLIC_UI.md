# 05. Judgment Reviews — Public UI & Design System

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis  
**Routes:** `/judgments` (Directory) & `/judgments/:slug` (Detail Dossier)

---

## 1. Design Aesthetics & Visual Hierarchy

The Judgment Reviews frontend adheres to the platform's luxury judicial design system:
- **Color Palette:** Deep Obsidian Black (`#0a0a0c`), Charcoal Glassmorphism (`rgba(18, 18, 22, 0.7)`), and Muted Judicial Gold (`#C5A880`).
- **Typography:** Playfair Display / Cormorant Garamond for regal headings and case titles, paired with Inter for high-density legal citations and analytical body copy.
- **Micro-Interactions:** Subtle card scale on hover, golden glowing borders on active focus, and smooth tab transitions.

---

## 2. Public Directory Page (`/judgments`)

### Page Structure:
1. **Hero Header:**
   - Eyebrow badge: "Judicial Commentary & Jurisprudence"
   - H1 Title: "Judgment Reviews & Precedents"
   - Subtitle emphasizing objective legal analysis and doctrinal ratio decidendi reviews.
2. **Search & Filter Bar:**
   - Real-time text search for case names and legal citations.
   - Court forum dropdown filter.
   - Practice area filter.
   - Reset button.
3. **Featured Highlight:**
   - Prominent editorial card showcasing key rulings with distinct badges, citations, and summaries.
4. **Card Grid & Metadata:**
   - Each card displays:
     - Law report citation (e.g., `76 DLR (AD) 142`) in gold font.
     - Case name in bold serif.
     - Competent court forum.
     - Judgment date formatted according to current locale.
     - Practice Area badge.
     - Direct PDF download link (if available).
     - "Read Full Analysis" CTA.
5. **Pagination:** Accessible numerical pagination component.

---

## 3. Public Detail Dossier (`/judgments/:slug`)

### Structural Layout:
1. **Breadcrumb Navigation:** `Home / Judgment Reviews / [Case Title]`
2. **Dossier Header:**
   - Legal citation in gold monospace/serif badge.
   - Formal Case Name in prominent H1.
   - Metadata bar: Bench/Court, Pronouncement Date, Practice Area, Author Attribution.
3. **Judgment Summary:** Clean executive synopsis.
4. **Framed Legal Issues:** Bulleted points of law framed for adjudication.
5. **CRITICAL SPLIT SECTION: Court's Holding vs. Author's Analysis:**
   - **Section A: COURT'S DECISION & RATIO DECIDENDI**  
     Rendered in an authoritative gold-accented judicial block featuring a gavel icon and explicit label: *"Binding Ratio Decidendi & Official Judicial Holding Delivered by the Court"*.
   - **Section B: AUTHOR'S ANALYSIS & DOCTRINAL COMMENTARY**  
     Rendered in a scholarly blue/slate-accented card featuring an open book icon and explicit label: *"Scholarly Commentary & Precedent Analysis by Advocate Nijam Uddin"*.
6. **Practical Significance:** Commercial, corporate governance, or procedural impact of the decision.
7. **Document Action Center:** Authentic PDF download button with file size and format indicators.
8. **Associated Research Monograph:** Deep link to related academic treatise in the Legal Research module.
9. **Related Judgments:** Recommendations based on shared practice areas and courts.
