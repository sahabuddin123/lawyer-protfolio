# Media & Document Access Security

## 1. Executive Summary
In a high-profile legal authority platform, media assets and legal documents span two distinct classifications:
1. **Public Marketing & Press Assets:** Images, public press appearance recordings, portraits, open publication documents, published judgments.
2. **Confidential & Restricted Legal Assets:** Pre-trial submissions, case evidence, private consultation attachments, draft publications, unredacted courtroom files.

This document outlines the access control architecture, storage isolation, and IDOR prevention models that govern document delivery.

---

## 2. Storage Disks & Segregation

```
+-------------------------------------------------------------------------+
|                              STORAGE TIERS                              |
+-------------------------------------------------------------------------+
|  Tier 1: Public Disk (public_uploads)                                  |
|  - Root: storage/app/public/                                            |
|  - Symlinked to public/storage                                          |
|  - Direct Nginx/Apache static serving with security headers             |
|  - Public portraits, press release images, verified logos               |
+-------------------------------------------------------------------------+
|  Tier 2: Protected Documents Disk (secure_docs)                         |
|  - Root: storage/app/secure_docs/                                       |
|  - NOT SYMLINKED to web root                                            |
|  - Zero direct web access                                               |
|  - All access mediated through authenticated Laravel controller         |
|  - Strict policy check -> File stream with secure Content-Disposition  |
+-------------------------------------------------------------------------+
```

---

## 3. IDOR Prevention & Authorization on Document Retrieval

### 3.1 Controlled Download Pipeline
All private or courtroom-related documents are fetched through the endpoint:
`GET /api/v1/admin/courtrooms/{courtroom}/documents/{document}/download`

```
User Request ──► Sanctum Auth ──► Gate / RBAC Check ──► Document Scope Check ──► Stream Response
                                (courtroom.view)     (document->courtroom_id)
```

### 3.2 Authorization Enforcement
```php
// Check user capability via Policy / Gate
$this->authorize('view', $courtroom);

// Verify Document belongs to the specified Courtroom (Prevent IDOR / Cross-Tenant mixing)
if ($document->courtroom_id !== $courtroom->id) {
    return response()->json([
        'success' => false,
        'error' => [
            'code' => 'DOCUMENT_NOT_FOUND',
            'message' => 'The requested document does not belong to this case.'
        ]
    ], 404);
}

// Check if confidential and verify elevated role
if ($document->is_confidential && !auth()->user()->hasRole(['super_admin', 'senior_advocate'])) {
    return response()->json([
        'success' => false,
        'error' => [
            'code' => 'ACCESS_DENIED',
            'message' => 'Confidential documents require elevated privilege clearance.'
        ]
    ], 403);
}
```

### 3.3 Path Traversal & Filename Sanitization on Streaming
When streaming downloads to clients:
1. Physical storage paths are constructed strictly from validated database records, never user-supplied parameters.
2. The `Content-Disposition` header uses a sanitized, ASCII-normalized filename to prevent header injection:
   ```php
   $safeFilename = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $document->title) . '.' . $extension;
   return response()->download($filePath, $safeFilename, [
       'Content-Type' => $document->mime_type,
       'X-Content-Type-Options' => 'nosniff',
       'Cache-Control' => 'private, no-cache, must-revalidate'
   ]);
   ```

---

## 4. Video & Third-Party Embed Security

### 4.1 Approved Video Platforms
To avoid arbitrary iframe injection or malicious cross-origin frame execution, video embeddings are restricted to:
- **YouTube:** `https://www.youtube-nocookie.com/embed/{id}`
- **Vimeo:** `https://player.vimeo.com/video/{id}`

### 4.2 Content-Security-Policy Guardrails
The application enforces strict `frame-src` directives:
```http
frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com;
```
Any attempt to embed an unauthorized domain (e.g. `http://malicious-tracker.com`) is blocked directly by modern browser rendering engines.

---

## 5. Verification & Test Evidence
Validated by automated test suite `backend/tests/Feature/Security/IdorAndDataPrivacySecurityTest.php`:
1. `it_prevents_unauthorized_download_of_confidential_courtroom_documents` -> PASS (403 for unauthorized viewer)
2. `it_prevents_cross_album_media_idor_manipulation` -> PASS (404 / 403 for cross-resource mixing)
3. `it_blocks_deleted_records_from_public_inspection` -> PASS (Draft and soft-deleted records hidden)
