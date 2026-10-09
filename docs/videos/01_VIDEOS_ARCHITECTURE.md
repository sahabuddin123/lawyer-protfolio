# 01. Videos Module Architecture

**Module:** Videos & Broadcast Archive (Phase 13)  
**Lead Coordinator:** Solution Architect & Senior Laravel Engineer  
**System Classification:** Premium Judicial Video Library & Broadcast CMS  

---

## 1. Executive Architectural Overview

The **Videos Module** provides an authoritative, dynamic, and bilingual video archive for the Advocate Nijam Uddin (Haq) platform. It serves as the primary judicial audio-visual archive documenting high-level legal discussions, television panel roundtables, Supreme Court constitutional lectures, and academic seminars.

### 1.1 Separation of Concerns: Media vs. Videos vs. Gallery
- **Media Module (Phase 12):** Captures general newspaper features (`media_press`) and television appearances (`media_appearances`) as editorial citations and journalistic mentions.
- **Videos Module (Phase 13):** A standalone, curated video library providing rich embed capabilities, video duration metadata, direct player streaming (YouTube/Vimeo), and structured Schema.org `VideoObject` data.
- **Gallery Module (Phase 14):** Reserved exclusively for curated photo albums of chamber functions, bar gatherings, and judicial convocations.

---

## 2. Multi-Tier Subsystem Layout

```
Client Browser (React 19 / Vite / Tailwind)
   ├── Public Video Library (/videos)
   │     ├── Hero Featured Player
   │     ├── Platform & Category Filter Pills
   │     ├── Responsive Video Grid with Click-to-Load Posters
   │     └── Accessible Pagination
   │
   ├── Public Video Detail (/videos/:slug)
   │     ├── High-Performance Click-to-Load Player (Zero Scripts until click)
   │     ├── Bilingual Metadata & Legal Notes
   │     ├── Schema.org VideoObject Structured Data
   │     └── Deterministic Related Broadcasts
   │
   └── Admin CMS Console (/admin/videos)
         ├── VideosManager Datagrid with Filters & Real-Time Search
         ├── Dynamic URL Parser & Embed Validator
         ├── Bilingual Video Form (EN/BN)
         ├── Drag-and-Drop / Button Sort Order Reordering
         └── Sandboxed Draft Preview (X-Robots-Tag: noindex)
```

---

## 3. Core Architectural Highlights

1. **Deterministic Platform Detection (`VideoPlatformService`):**
   - Ingests raw user URLs, detects platform (`youtube`, `vimeo`, `external`), extracts canonical video IDs, and normalizes URLs.
2. **Embed Security & Allowlist Enforcement:**
   - Restricts iframe rendering strictly to privacy-enhanced endpoints (`youtube-nocookie.com`, `player.vimeo.com`). Arbitrary domains are blocked from iframe generation to prevent Cross-Site Scripting (XSS).
3. **High-Performance Click-to-Load Player:**
   - Iframe players are never preloaded on grid cards or initial detail renders, preventing massive third-party payload bloat and cookie tracking. The iframe loads strictly on user-initiated play.
4. **Collision-Safe Slugs & Automated 301 Redirects:**
   - Generates lowercase URL-safe slugs. When a published video's slug is updated, an automated 301 redirect is recorded in `redirects`.
5. **Zero Synthetic Production Content:**
   - Strict content safety: test fixtures are marked `TEST — ...`, and production content is 100% administrator-verified.
