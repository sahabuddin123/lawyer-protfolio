# 02. Typography & Script System

**Font Strategy:** Dual-Script Editorial Typography  
**English Headings:** *Cinzel* (Classical Roman/Judicial display) & *Playfair Display* (Editorial legal serif)  
**English Body:** *Inter* (Geometric, highly readable modern sans-serif)  
**Bangla Headings & Body:** *Hind Siliguri* (Primary) with fallback to *Noto Serif Bengali*  
**Lead Coordinator:** Senior UI/UX Engineer & i18n Specialist  

---

## 1. Font Family Evaluation & Selection

### 1.1 English Heading Evaluation: *Cinzel* vs *Playfair Display*
- **Cinzel:** Inspired by 1st-century Roman inscriptions, classical judicial architecture, and Supreme Court pediments. Best suited for high-level branding, legal insignia, Display titles, and authoritative hero eyebrows.
- **Playfair Display:** High-contrast transitional serif reminiscent of 18th-century European legal gazettes. Ideal for long-form case analysis headlines, article titles, and editorial quotes.
- **Decision:** A dual-tiered hierarchy:
  - **Display / H1 / Legal Insignia:** `font-serif-cinzel` (*Cinzel*, serif)
  - **H2 / H3 / Editorial Titles:** `font-serif-editorial` (*Playfair Display*, serif)
  - **Body / Metadata / UI:** `font-sans` (*Inter*, -apple-system, sans-serif)

### 1.2 Bengali Script Integration: *Hind Siliguri*
- Bengali script features complex conjuncts (যুক্তাক্ষর), upper vowel diacritics (ৈ, ৌ), and lower vowel diacritics (ু, ূ, ৃ).
- *Hind Siliguri* provides optical kerning, balanced ascender-to-descender clearance, and exceptional clarity on dark backgrounds.
- Standard English line-height (`1.5` - `1.6`) causes Bengali conjunct clipping. Our typography system dynamically increases line-height to `1.75` - `1.85` when `lang="bn"`.

---

## 2. Responsive Type Scale Matrix

| Semantic Token | Element | Desktop Size / Leading | Mobile Size / Leading | Weight | Tracking | Family |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Hero Main | 56px (3.5rem) / 1.15 | 36px (2.25rem) / 1.2 | 700 / Bold | -0.02em | Cinzel |
| **H1** | Page Title | 44px (2.75rem) / 1.2 | 30px (1.875rem) / 1.25 | 700 / Bold | -0.015em | Cinzel / Playfair |
| **H2** | Section Header | 32px (2.0rem) / 1.25 | 24px (1.5rem) / 1.3 | 600 / Semi | -0.01em | Playfair Display |
| **H3** | Card / Case Title | 22px (1.375rem) / 1.35 | 18px (1.125rem) / 1.4 | 600 / Semi | 0 | Playfair Display |
| **H4** | Subtitle / Stat | 18px (1.125rem) / 1.4 | 16px (1.0rem) / 1.4 | 600 / Semi | 0 | Inter / Playfair |
| **Body Large** | Lead / Excerpt | 18px (1.125rem) / 1.65 | 16px (1.0rem) / 1.6 | 400 / Normal | 0 | Inter / Hind Siliguri |
| **Body** | Standard Body | 15px (0.9375rem) / 1.6 | 14px (0.875rem) / 1.6 | 400 / Normal | 0 | Inter / Hind Siliguri |
| **Body Small** | Metadata / Date | 13px (0.8125rem) / 1.5 | 12px (0.75rem) / 1.5 | 400 / Normal | +0.01em | Inter / Hind Siliguri |
| **Caption** | Footnote / Tag | 11px (0.6875rem) / 1.4 | 11px (0.6875rem) / 1.4 | 500 / Medium | +0.03em | Inter |
| **Label / Eyebrow**| Section Eyebrow | 12px (0.75rem) / 1.4 | 11px (0.6875rem) / 1.4 | 600 / Semi | +0.12em (Caps)| Cinzel / Inter |

---

## 3. Typographic Utility Classes in CSS

```css
.font-display {
  font-family: var(--font-cinzel), 'Playfair Display', serif;
  letter-spacing: -0.02em;
}

.font-editorial {
  font-family: var(--font-playfair), serif;
}

.font-body {
  font-family: var(--font-inter), sans-serif;
}

/* Bengali Context Override */
[lang="bn"] .font-display,
[lang="bn"] .font-editorial,
[lang="bn"] .font-body {
  font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
  letter-spacing: 0.01em;
  line-height: 1.75;
}
```
