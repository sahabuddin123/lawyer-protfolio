# Courtroom Experiences — Document Security & Confidentiality Architecture

## 1. Core Threat Model & Defense In Depth
Legal case documents often contain privileged filings, client confidences, draft briefs, and sensitive judicial records. The document architecture enforces a strict two-tier security model:

```
                  Client Request for Case Document
                                │
                 Is Endpoint Admin or Public?
                ┌───────────────┴───────────────┐
                ▼                               ▼
          Public Route                     Admin Route
     (/courtroom/documents/{id})       (/admin/case-documents/{id})
                │                               │
       Check Document State:             Check Sanctum Auth
       `is_confidential == false`               │
                │                        Is Document Confidential?
       Check Parent Case:              ┌────────┴────────┐
     `status == 'published'`          No                Yes
     `visibility == 'public'`          │                 │
                │                 Allow Download    Check RBAC:
      Allow Stream Download                        `view_confidential_cases` OR
                                                   `manage_case_documents`
                                                         │
                                                   Allow Stream Download
```

## 2. Security Safeguards

### 2.1 Confidential Document Isolation
- Documents flagged as `is_confidential = true` are strictly excluded from all public API queries and resource serializers.
- Public route `/api/v1/courtroom/documents/{id}/download` returns HTTP 404 for any document where `is_confidential = true`.
- If a case is in `draft` or `private` state, even non-confidential documents return HTTP 404 on the public download route.

### 2.2 Direct Storage Path Concealment
- Internal file paths (e.g., `storage/app/documents/...`) are never exposed in public JSON responses.
- All downloads are served through parameterized streaming controllers (`downloadDocument`) that validate record existence and permissions before sending headers.

### 2.3 Path Traversal Prevention
- Storage paths are retrieved strictly from the database-verified `media` table record, eliminating any user-supplied path injection.
- Security response headers include `X-Content-Type-Options: nosniff`.

### 2.4 Audit Logging
- Every download of an internal/confidential document by an administrative user generates an immutable `activity_logs` entry:
  `action: 'case_document_downloaded'`, recording document ID, title, and user identity.
