# Media Document Security & Asset Handling (Phase 12)

## 1. Document Storage Architecture
Media records may have attached documents such as newspaper scan clippings, official press releases, certified broadcast transcripts, or case brief summaries:
- **Private vs. Public Storage**: Physical documents are stored via the centralized Media Library (`media` table).
- **No Raw Directory Exposure**: Physical file paths (`storage/app/...` or `storage/app/public/...`) are never exposed directly to client applications or crawlers.
- **Controlled Streaming Endpoints**: All downloads pass through controller action methods:
  - Public: `GET /api/v1/media/press/{slug}/download`
  - Public: `GET /api/v1/media/appearances/{slug}/download`
  - Admin: `GET /api/v1/admin/media/press/{id}/download`
  - Admin: `GET /api/v1/admin/media/appearances/{id}/download`

---

## 2. Authorization Rules & State Checking
1. **Public Download Verification**:
   - Query filters by `published()` and `publicVisibility()`.
   - If the associated media record is `draft`, `archived`, or `private`, the endpoint immediately aborts with `404 Not Found`.
   - Prevents unauthorized access or leaking of unverified media documents.
2. **Administrative Download Verification**:
   - Requires Sanctum bearer token and explicit permission (`manage_press` or `manage_appearances`).
   - Rejects unauthenticated (401) or unauthorized (403) requests.

---

## 3. Streaming Headers & MIME Enforcement
Documents are delivered using Laravel's `response()->download()` with strict security headers:
- `Content-Type`: Explicitly set to the verified MIME type (e.g., `application/pdf`).
- `X-Content-Type-Options: nosniff`: Prevents browsers from MIME-sniffing away from the declared content type.
- `Content-Disposition`: Attachment with sanitized original filename to prevent header injection or file path traversal.

---

## 4. Verification in Feature Tests
Automated tests verify that:
- Published public records successfully stream documents with 200 and valid MIME headers.
- Draft media records return 404 for document download requests.
- Private media records return 404 for document download requests.
