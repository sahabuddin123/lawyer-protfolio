# 08. Video SEO & Structured Data Architecture

**Module:** Videos & Broadcast Archive (Phase 13)  
**Lead Coordinator:** Senior SEO Specialist & Frontend Architect  
**Standards:** Schema.org `VideoObject`, Open Graph, Twitter Cards, Indexing Safety

---

## 1. Overview

Video content must establish high judicial authority in Google and Bing video search indexes. To accomplish this without risk of algorithmic penalties or structured data validation errors, the system strictly follows Google Search Central guidelines for video structured data.

---

## 2. Schema.org `VideoObject` Specification

On the public detail endpoint (`GET /api/v1/videos/{slug}`) and rendered React page (`/videos/:slug`), a dynamic JSON-LD `VideoObject` is emitted **only when verified metadata is present**.

### 2.1 Emitted JSON-LD Structure
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Constitutional Safeguards in Appellate Practice",
  "description": "Comprehensive legal discourse delivered by Advocate Nijam Uddin regarding constitutional safeguards.",
  "thumbnailUrl": [
    "https://nijamuddin.com/storage/media/videos/thumb-constitutional.webp"
  ],
  "uploadDate": "2026-10-01T10:00:00+06:00",
  "duration": "PT45M30S",
  "embedUrl": "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### 2.2 Truth in Metadata Rules
- **No Fabricated Duration:** If `duration_seconds` is null, the `duration` property is completely omitted from the JSON-LD payload. ISO 8601 formatting (`PT...M...S`) is only applied to true stored seconds.
- **No Fabricated Upload Date:** The `uploadDate` defaults to verified `published_at` or `created_at`. If missing, the property is omitted.
- **Secure Thumbnail Fallback:** If custom thumbnail media is attached, its absolute URL is used; otherwise, the platform's canonical high-res poster is referenced.

---

## 3. Open Graph & Meta Tags

The detail page (`VideoDetailPage.tsx`) dynamically synchronizes `<Helmet>` / DOM `<meta>` tags:
- `title`: `{Video Title} | Advocate Nijam Uddin`
- `description`: Clean text excerpt from video description.
- `og:type`: `video.other`
- `og:title`: `{Video Title}`
- `og:description`: Clean excerpt.
- `og:image`: High-resolution thumbnail URL.
- `og:video:url`: Canonical embed URL.
- `canonical`: `https://nijamuddin.com/videos/{slug}`

---

## 4. Indexing Safety & Draft Shielding

1. **Public Listing & Detail Isolation:**
   - Only videos with `status = 'published'` AND `visibility = 'public'` are exposed to public endpoints or search crawler bots.
2. **Draft Preview Header (`X-Robots-Tag`):**
   - When an administrator previews an unpublished draft via `/admin/videos/{id}/preview`, the response explicitly injects:
     ```http
     X-Robots-Tag: noindex, nofollow, noarchive
     ```
   - This prevents search engine spiders from indexing work-in-progress judicial records.
3. **Automated 301 Redirects:**
   - When a published video's slug is updated, an entry in the `redirects` table guarantees legacy URLs resolve with HTTP 301, preserving incoming link equity.
