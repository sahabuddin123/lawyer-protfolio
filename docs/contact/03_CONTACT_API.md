# 03. Contact API Specifications

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** API Architect & Senior Laravel Engineer  
**Controllers:** `PublicContactController.php`, `AdminContactMessageController.php`

---

## 1. Public Endpoints

### 1.1 Retrieve Contact Configuration
- **Route:** `GET /api/v1/contact`
- **Rate Limit:** Standard public API (60 req/min)
- **Caching:** 24 Hours (`TTL_CONTACT = 86400`)
- **Response Shape:**
  ```json
  {
    "success": true,
    "data": {
      "office_name": "Chamber of Advocate Nijam Uddin",
      "chamber_name": "Supreme Court & District Court Chamber",
      "address": "Room No. 302, Supreme Court Bar Association...",
      "city": "Dhaka & Chattogram",
      "country": "Bangladesh",
      "phone": "+8801819000000",
      "email": "info@nijamuddin.com",
      "whatsapp": "+8801819000000",
      "office_hours": null,
      "map_url": "https://maps.google.com/...",
      "practice_areas": [
        { "id": 1, "slug": "constitutional-law", "title": { "en": "Constitutional Law", "bn": "সাংবিধানিক আইন" } }
      ],
      "legal_notice": {
        "en": "Submitting a message or consultation request through this platform does not create an advocate-client relationship...",
        "bn": "এই প্ল্যাটফর্মের মাধ্যমে বার্তা বা পরামর্শ অনুরোধ পাঠানো কোনো আইনজীবী-মক্কেল সম্পর্ক তৈরি করে না..."
      }
    }
  }
  ```

### 1.2 Submit Contact Inquiry
- **Route:** `POST /api/v1/contact`
- **Rate Limit:** 5 requests per minute (`throttle:intake`)
- **Anti-Spam:** Honeypot trap (`_honeypot`) silently drops bot submissions
- **Payload:**
  ```json
  {
    "name": "Rahim Ahmed",
    "phone": "+8801712345678",
    "email": "rahim@example.com",
    "subject": "Inquiry regarding land title dispute",
    "practice_area_id": 1,
    "message": "Seeking an initial legal inquiry concerning property documentation...",
    "consent": true
  }
  ```
- **Response:** HTTP 201 Created with acknowledgment message.

---

## 2. Admin Endpoints

- `GET /api/v1/admin/contacts` — Paginated list with filtering by status and text search.
- `GET /api/v1/admin/contacts/{id}` — Detailed view (auto-marks status `new` ➔ `read`).
- `PATCH /api/v1/admin/contacts/{id}` — Update status (`read`, `replied`, `archived`, `spam`) and `admin_notes`.
- `DELETE /api/v1/admin/contacts/{id}` — Soft delete contact message.
