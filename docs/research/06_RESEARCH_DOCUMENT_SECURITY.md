# 06. Legal Research — Document Security & Media Handling

**Lead Architect:** Security Engineer & Senior Solution Architect  
**Subsystem:** Attached Research Briefs, Whitepapers, and Monographs

---

## 1. Storage & Media Integration Architecture

Attached research documents integrate with the central `media` repository rather than arbitrary disk folders:
- `legal_researches.pdf_media_id` establishes a strict foreign key relationship with `media.id`.
- The physical assets reside on the storage disk (`public` or private disk) configured in Laravel filesystems.
- Internal physical storage paths (e.g. `storage/app/public/documents/research/xyz.pdf`) are strictly obfuscated and never exposed directly to client responses.

---

## 2. Public Download Security Guardrails

When a user requests a research document via `/api/v1/research/{slug}/download`:
1. **Parent Entity Verification:**  
   The system queries `LegalResearch` strictly matching `where('slug', $slug)`.
2. **Two-Tier Access Verification:**  
   `status === 'published'` AND `visibility === 'public'` must evaluate to `true`. Draft or private research downloads instantly return `HTTP 404 Not Found`.
3. **Storage Existence Probe:**  
   The controller verifies physical disk presence with `Storage::disk($media->disk)->exists($path)`.
4. **Header Sanitization & MIME Hardening:**  
   Responses are streamed with:
   - `Content-Type: application/pdf` (or verified MIME signature)
   - `X-Content-Type-Options: nosniff` (prevents MIME confusion and browser exploitation)
   - Clean filename download header defaulting to `original_name`.

---

## 3. Administrative Download Controls

Authenticated back-office personnel access document downloads via:  
`GET /api/v1/admin/research/{id}/download`
- Guarded by `auth:sanctum` and `permission:edit_research|create_research`.
- Permits staff to verify draft and private PDF monographs without exposing the asset to public networks.
- Logs administrative downloads to `activity_logs` (`research_document_downloaded`).
