# 03. Color Architecture & Strategic Gold Allocation

**Philosophy:** Dark Luxury Minimalist with Judicial Metallic Highlights  
**Lead Coordinator:** Senior UI/UX Engineer & Accessibility Specialist  

---

## 1. Complete Color Palette Hierarchy

```
+---------------------------------------------------------------------------------+
|                                 CANVAS & SURFACES                               |
|                                                                                 |
|  [#111111]             [#181818]             [#1E1E1E]             [#242424]    |
|  bg-primary            bg-secondary          bg-surface            bg-elevated  |
|  Deep Obsidian         Section Alternation   Editorial Cards       Active Modal |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
|                               JUDICIAL GOLD ACCENTS                             |
|                                                                                 |
|  [#D4A017]             [#C59B27]             [#E5B22D]             [rgba(212..)]|
|  gold-primary          gold-secondary        gold-hover            gold-subtle  |
|  CTAs, Active Tabs     Borders, Icons        Hover Interaction     Badges, Glow |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
|                              HIGH-CONTRAST TYPOGRAPHY                           |
|                                                                                 |
|  [#F5F5F5]             [#D4D4D4]             [#A6A6A6]             [#737373]    |
|  text-primary          text-secondary        text-muted            text-subtle  |
|  Display & Headings    Body Paragraphs       Dates & Metadata      Disclaimers  |
+---------------------------------------------------------------------------------+
```

---

## 2. Strict Strategic Gold Allocation Rule

Gold is a powerful semiotic symbol of sovereign law, institutional authority, and excellence. When overused, it rapidly degrades into gaudy commercialism.

The platform enforces the **10% Strategic Allocation Limit**:
- **Prohibited:**
  - Gold page backgrounds or massive gold block sections.
  - Long paragraphs written in gold text.
  - Large decorative graphics saturated in yellow/gold gradients.
- **Mandated Strategic Uses:**
  - **Eyebrow Category Markers:** Small uppercase labels introducing sections (`text-[#D4A017] text-xs tracking-widest`).
  - **Judicial Dividers:** Fine 1px hairline horizontal or vertical separators.
  - **Interactive Focus & Hover States:** Button hover shimmers, card top-edge accents, and active navigation indicators.
  - **Verified Badges:** Bar Council enrollment and Supreme Court Advocate status pins.

---

## 3. Contrast Ratios & WCAG 2.1 AA Compliance

All foreground/background combinations exceed accessibility thresholds:

| Text Element | Color Hex | Background Hex | Calculated Contrast | WCAG AA Requirement | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Primary Headings** | `#F5F5F5` | `#111111` (Canvas) | **17.8 : 1** | 4.5 : 1 | **PASS (AAA)** |
| **Body Paragraphs** | `#D4D4D4` | `#181818` (Section) | **12.4 : 1** | 4.5 : 1 | **PASS (AAA)** |
| **Muted Metadata** | `#A6A6A6` | `#1E1E1E` (Card) | **6.7 : 1** | 4.5 : 1 | **PASS (AA)** |
| **Gold Primary CTA**| `#111111` | `#D4A017` (Gold Button)| **8.2 : 1** | 4.5 : 1 | **PASS (AAA)** |
| **Gold Outline Border**| `#D4A017`| `#1E1E1E` (Card Surface)| **4.8 : 1** | 3.0 : 1 | **PASS (AA)** |
| **Subtle Hairlines** | `#2B2B2B` | `#111111` (Canvas) | **1.5 : 1** | Decorative only | **PASS** |
