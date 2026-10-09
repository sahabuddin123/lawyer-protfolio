# Publication Document & Media Security (Phase 11)

## 1. Document Architecture Overview
Publications frequently incorporate official PDF treatises, conference proceedings, or research monographs. To balance open academic dissemination with asset protection, documents are managed through a dual-channel security architecture.

## 2. Storage & File Segregation
- **Filesystem Disks**:
  - Public Documents: Stored via configured storage disks with controlled access routing.
  - Raw storage paths are **never** exposed directly to public clients.
  - Downloads route through controller endpoints:
    - Public: `/api/v1/publications/{slug}/download`
    - Admin: `/api/v1/admin/publications/{id}/download`

## 3. Threat Model & Mitigations

### 3.1 IDOR & Unauthorized Document Access
- **Risk**: Direct file enumeration using predictable numeric media IDs.
- **Mitigation**:
  - The public download route accepts the publication's URL `slug` rather than an internal database ID.
  - The controller strictly executes:
    ```php
    $publication = Publication::where('slug', $slug)
        ->published()
        ->publicVisibility()
        ->firstOrFail();
    ```
  - If a publication is in `draft` or `private` status, the public download route returns `404 Not Found`.

### 3.2 Path Traversal & Arbitrary File Streaming
- **Risk**: Tampered parameters attempting directory traversal (`../../etc/passwd`).
- **Mitigation**:
  - All file resolution operates exclusively through foreign key relationships to validated `media` table entries.
  - Filenames and directory paths are fetched strictly from verified database records and streamed via `Storage::disk($media->disk)->download(...)`.

### 3.3 MIME Type & Header Security
- Download responses enforce:
  - `Content-Type: application/pdf` (or verified media MIME type)
  - Safe sanitized `filename` parameter in `Content-Disposition`.
  - OWASP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options: nosniff).

### 3.4 External URL Protocol Sanitization
- External links entered by administrators are strictly validated:
  - Only `http://` and `https://` protocols are allowed.
  - `javascript:`, `data:`, and relative schemes are rejected with validation errors (`422 Unprocessable Content`).
  - Public UI links always render with `rel="noopener noreferrer"` and `target="_blank"`.
