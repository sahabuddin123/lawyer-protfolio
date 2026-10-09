# Courtroom Experiences — API Contract & Endpoints

## 1. Overview
All endpoints follow RESTful standards, returning unified JSON envelopes (`ApiResponse` / `ApiPaginatedResponse`).

## 2. Public Endpoints

### 2.1 `GET /api/v1/courtroom`
Retrieves a paginated catalog of published courtroom experiences with public visibility.
- **Query Parameters:**
  - `page` (integer, default 1)
  - `per_page` (integer, default 12, max 50)
  - `court` / `filter[court]` (string)
  - `case_type` / `filter[case_type]` (string)
  - `year` / `filter[year]` (integer)
  - `practice_area_id` (integer)
  - `q` / `search` (string: full text search on titles, case number, summary)
- **Response Structure:**
  ```json
  {
    "success": true,
    "message": "Courtroom experiences retrieved successfully.",
    "data": [
      {
        "id": 1,
        "slug": "constitutional-directive-challenge",
        "title": "Constitutional Directive Challenge",
        "case_number": "Writ Petition 1024/2023",
        "court": "Supreme Court of Bangladesh - High Court Division",
        "case_type": "Writ Petition",
        "year": 2024,
        "practice_area_id": 2,
        "practice_area": { "id": 2, "title": "Constitutional Law", "slug": "constitutional-law" },
        "legal_area": "Constitutional Law",
        "role": "Counsel",
        "summary": "High Court Division rule challenging executive order.",
        "judgment_date": "2024-03-15",
        "featured_image": null,
        "is_featured": true,
        "sort_order": 0,
        "published_at": "2024-03-16T10:00:00Z"
      }
    ],
    "meta": { "current_page": 1, "per_page": 12, "total": 1, "last_page": 1 }
  }
  ```

### 2.2 `GET /api/v1/courtroom/{slug}`
Retrieves complete public case dossier with non-confidential public documents and related cases.
- **Response Details:**
  Includes `description`, `issues`, `arguments`, `outcome`, `publicDocuments`, and `related_experiences`.

### 2.3 `GET /api/v1/courtroom/documents/{id}/download`
Downloads public non-confidential case order/brief. Increments `download_count`. Returns 404 if case is draft/private or document is confidential.

## 3. Administrative Endpoints (Sanctum Protected)

### 3.1 `GET /api/v1/admin/courtroom`
- **Permissions:** `create_cases` OR `edit_cases`
- Paginated administrative list supporting all workflow statuses, visibility filters, and raw bilingual structures.

### 3.2 `POST /api/v1/admin/courtroom`
- **Permissions:** `create_cases` (and `publish_cases` if setting `status = 'published'`)
- Validates data, cleans HTML rich text, attaches SEO, purges cache, logs `courtroom_created`.

### 3.3 `GET /api/v1/admin/courtroom/{id}`
- **Permissions:** `edit_cases`
- Retrieves complete administrative model including private documents and SEO.

### 3.4 `PUT /api/v1/admin/courtroom/{id}`
- **Permissions:** `edit_cases` (and `publish_cases` if setting `status = 'published'`)
- Updates model, checks for published slug change to generate 301 redirect, logs audit trail.

### 3.5 `DELETE /api/v1/admin/courtroom/{id}`
- **Permissions:** `delete_cases`
- Soft-deletes record, purges cache, records audit log.

### 3.6 `POST /api/v1/admin/courtroom/reorder`
- **Permissions:** `edit_cases`
- Batch updates sort order by array of IDs.

### 3.7 `POST /api/v1/admin/courtroom/{id}/documents`
- **Permissions:** `manage_case_documents`
- Attaches legal brief/order with `is_confidential` flag.

### 3.8 `PUT /api/v1/admin/case-documents/{id}`
- **Permissions:** `manage_case_documents`
- Updates document metadata or confidentiality tier.

### 3.9 `DELETE /api/v1/admin/case-documents/{id}`
- **Permissions:** `manage_case_documents`
- Removes document record.

### 3.10 `GET /api/v1/admin/case-documents/{id}/download`
- **Permissions:** `manage_case_documents` OR `view_confidential_cases`
- Secure authenticated stream for confidential and internal documents.
