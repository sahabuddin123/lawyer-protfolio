# 04. Consultation API Specifications

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** API Architect & Senior Laravel Engineer  
**Controllers:** `PublicContactController.php`, `AdminConsultationRequestController.php`

---

## 1. Public Endpoints

### 1.1 Submit Formal Consultation Request
- **Route:** `POST /api/v1/consultation`
- **Rate Limit:** 5 requests per minute (`throttle:intake`)
- **Anti-Spam:** Honeypot field (`_honeypot`) traps scrapers and drops inserts silently.
- **Validation Rules:**
  - `name`: string, required, max 255
  - `phone`: string, required, max 50
  - `email`: email, optional, max 255
  - `subject`: string, required, max 255
  - `practice_area_id`: integer, optional, exists in `practice_areas.id`
  - `preferred_date`: date, optional, after_or_equal:today
  - `preferred_time`: string, optional, max 50
  - `message`: string, required, min 15, max 5000
  - `consent`: boolean, required, accepted
- **Payload:**
  ```json
  {
    "name": "Shafiul Alam",
    "phone": "+8801711223344",
    "email": "shafiul@example.com",
    "subject": "Corporate Merger Consultation",
    "practice_area_id": 3,
    "preferred_date": "2026-10-18",
    "preferred_time": "Afternoon (2:00 PM - 5:00 PM)",
    "message": "Requires detailed legal consultation on corporate restructuring under RJSC...",
    "consent": true
  }
  ```
- **Response:** HTTP 201 Created with formal non-guaranteed appointment notice.

---

## 2. Admin Endpoints

- `GET /api/v1/admin/consultations` — Paginated list with filtering by `status`, `practice_area_id`, and text search.
- `GET /api/v1/admin/consultations/{id}` — Full consultation request detail.
- `PATCH /api/v1/admin/consultations/{id}` — Update status (`new`, `contacted`, `in_progress`, `scheduled`, `completed`, `closed`, `spam`) and confidential `admin_notes`.
- `DELETE /api/v1/admin/consultations/{id}` — Soft delete consultation request.
