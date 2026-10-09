# 06. Centralized Media Architecture & Asset Pipeline

**Storage Engine:** Laravel Storage Abstraction (Local Disk for Development, S3/VPS-mountable for Production)  
**Lead Coordinator:** Senior Backend Engineer & Performance Engineer  

---

## 1. Storage Topography & Disk Isolation

To guarantee both high-performance delivery of public web assets and ironclad protection of confidential client litigation files, storage is partitioned into two physically distinct disks:

```
storage/app/
├── public/                     # Public Web Disk (Symlinked to public/storage)
│   └── media/
│       ├── {year}/{month}/     # Normalized asset folder structure
│       │   ├── {uuid}.webp     # Original converted WebP
│       │   ├── {uuid}-hero.webp
│       │   ├── {uuid}-large.webp
│       │   ├── {uuid}-medium.webp
│       │   ├── {uuid}-small.webp
│       │   └── {uuid}-thumb.webp
│       └── documents/          # Publicly accessible legal research PDFs & brochures
│           └── {uuid}.pdf
│
└── secure/                     # Private Secure Disk (NOT accessible via web server)
    └── case_documents/
        └── {uuid}.pdf          # Confidential court orders, pleadings, evidence
```

---

## 2. Image Processing & Variant Specification

Client DSLR photos (`IMG_9684.JPG` through `IMG_9692.JPG`) average **4.6 MB each at 6000x4000 resolution**. Directly embedding these into the public frontend would result in catastrophic Lighthouse scores and heavy mobile data consumption.

The automated `MediaService` ingests uploaded images, preserves the master record, and automatically generates responsive WebP variants:

| Variant Key | Max Dimensions | Quality | Crop Strategy | Typical Size | Usage Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`hero`** | 1920 × 1080 px | 85% WebP | Proportional Fit | ~180 KB | Homepage Hero, Page Banners |
| **`large`** | 1200 × 800 px | 82% WebP | Proportional Fit | ~95 KB | Courtroom Detail, Gallery Lightbox |
| **`medium`** | 800 × 533 px | 80% WebP | Proportional Fit | ~55 KB | Card Grids, Research Previews |
| **`small`** | 400 × 267 px | 78% WebP | Proportional Fit | ~25 KB | Mobile Grid Cards, Related Articles |
| **`thumbnail`** | 200 × 200 px | 75% WebP | Center Square Crop | ~10 KB | Admin Tables, Media Pickers, Avatars |

### 2.1 Variant JSON Schema in `media.variants`
```json
{
  "hero": "/storage/media/2026/10/550e8400-e29b-41d4-a716-446655440000-hero.webp",
  "large": "/storage/media/2026/10/550e8400-e29b-41d4-a716-446655440000-large.webp",
  "medium": "/storage/media/2026/10/550e8400-e29b-41d4-a716-446655440000-medium.webp",
  "small": "/storage/media/2026/10/550e8400-e29b-41d4-a716-446655440000-small.webp",
  "thumbnail": "/storage/media/2026/10/550e8400-e29b-41d4-a716-446655440000-thumb.webp"
}
```

---

## 3. Strict Media Upload Security Controls

Media uploads are common attack vectors for Remote Code Execution (RCE) and Cross-Site Scripting (XSS). The `MediaUploadRequest` enforces multi-layer verification:

1. **Extension Whitelisting:**
   - Allowed Images: `jpg`, `jpeg`, `png`, `webp`, `avif`.
   - Allowed Documents: `pdf`.
   - Explicitly Disallowed: `.php`, `.phtml`, `.exe`, `.bat`, `.sh`, `.js`, `.py`, `.html`, `.svg` (SVG upload is strictly disabled to prevent embedded `<script>` XML injection).
2. **Magic Byte / MIME Sniffing:**
   - Client-reported HTTP headers are ignored.
   - PHP `finfo_file()` verifies real file signatures:
     - JPEG: `image/jpeg`
     - PNG: `image/png`
     - WebP: `image/webp`
     - PDF: `application/pdf`
3. **Payload Size Guardrails:**
   - Images: Maximum 12 MB (to allow high-res DSLR master uploads prior to processing).
   - PDF Documents: Maximum 35 MB.
4. **Filename Sanitization & UUID Randomization:**
   - The user's original filename is stripped and stored purely as metadata (`original_name`).
   - The disk filename is replaced with a cryptographic UUIDv4 (`550e8400-e29b-41d4-a716-446655440000.webp`) to prevent directory traversal and overwrite attacks.

---

## 4. Protected / Confidential Case Document Streaming

Case documents marked `is_confidential = true` are stored on the `secure` disk.
- Direct web access via Apache or Nginx is blocked.
- Access is routed strictly through the controller:
  `GET /api/v1/admin/case-documents/{id}/download`
- Pipeline:
  1. Authenticates user via Sanctum.
  2. Verifies `view_confidential_cases` permission.
  3. Logs access in `activity_logs` (recording User ID, IP, and Document ID).
  4. Streams binary via `response()->download()` with `Content-Disposition: attachment; filename="..."` and `X-Content-Type-Options: nosniff`.
