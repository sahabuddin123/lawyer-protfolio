# 04. API Specification & REST Contracts

**Protocol:** REST over HTTPS / TLS 1.3  
**Base URL:** `/api/v1`  
**Content-Type:** `application/json`  
**Accept:** `application/json`  
**Localization:** `Accept-Language: en` (default) or `Accept-Language: bn` (query parameter fallback: `?lang=bn`)  
**Lead Coordinator:** API Architect & Senior Solution Architect  

---

## 1. Global Response Standards

### 1.1 Success Envelope
Every successful response returns HTTP 200/201 with this standardized payload:
```json
{
  "success": true,
  "message": "Resource retrieved successfully.",
  "data": {},
  "meta": {
    "timestamp": "2026-10-05T21:20:00Z",
    "locale": "en"
  }
}
```

### 1.2 Paginated Envelope
For multi-record endpoints:
```json
{
  "success": true,
  "message": "List retrieved successfully.",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "total": 48,
    "last_page": 4,
    "from": 1,
    "to": 12,
    "locale": "en"
  }
}
```

### 1.3 Error Envelope
Every failure returns the appropriate HTTP status code (400, 401, 403, 404, 422, 429, 500) and uniform schema:
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "phone": [
      "The phone number field must be a valid Bangladesh mobile format."
    ]
  },
  "error_code": "VALIDATION_FAILED"
}
```

---

## 2. Global Query Parameter Conventions

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `page` | Integer | `?page=2` | Current page number (1-based). |
| `per_page` | Integer | `?per_page=15` | Records per page (min: 1, max: 50, default: 12). |
| `sort` | String | `?sort=-published_at` | Sort field. Prefix `-` denotes descending order. |
| `filter[key]` | String | `?filter[category]=constitutional` | Dynamic filtering on indexed attributes. |
| `search` / `q` | String | `?q=writ+habeas+corpus` | Global or module-specific keyword search. |
| `lang` | String | `?lang=bn` | Override `Accept-Language` header (`en` or `bn`). |

---

## 3. Public Web API Endpoints

### 3.1 Aggregated Initial Bootstrap
- **`GET /api/v1/home`**
  - **Purpose:** Single-trip hydration endpoint for ultra-fast homepage first contentful paint (FCP).
  - **Auth:** None (Public).
  - **Response `data`:**
    ```json
    {
      "sections": [
        {
          "section_key": "hero",
          "title": "Nijam Uddin (Haq)",
          "subtitle": "Advocate, Supreme Court of Bangladesh",
          "content": "Committed to Justice. Dedicated to the Rule of Law.",
          "settings": { "show_cta": true, "cta_text": "Request Consultation" },
          "sort_order": 1,
          "is_enabled": true
        }
      ],
      "profile": { "name": "Nijam Uddin (Haq)", "title": "Advocate, Supreme Court of Bangladesh", "profile_photo": "https://..." },
      "featured_credentials": [],
      "featured_practice_areas": [],
      "featured_courtroom": [],
      "featured_judgments": [],
      "featured_research": [],
      "featured_publications": [],
      "featured_videos": [],
      "featured_media": [],
      "featured_gallery": [],
      "site_settings": { "site_name": "Advocate Nijam Uddin", "phone": "+8801...", "email": "info@nijamuddin.com" }
    }
    ```

### 3.2 Navigation & Site Metadata
- **`GET /api/v1/settings`**  
  Returns public branding, contact info, social links, and analytics tokens.
- **`GET /api/v1/navigation`**  
  Returns structured header and footer menus with nested children.

### 3.3 Profile & Academic Pedigree
- **`GET /api/v1/profile`**  
  Returns Advocate Nijam Uddin's full legal bio, enrollments (Bar Council, Supreme Court), philosophy, and chambers.
- **`GET /api/v1/credentials`**  
  Returns all verified credentials and academic degrees (University of Chittagong LL.B. & LL.M.).
- **`GET /api/v1/timeline`**  
  Returns career chronology and professional memberships.

### 3.4 Practice Areas
- **`GET /api/v1/practice-areas`**  
  Paginated list of active practice areas with icons and excerpts.
- **`GET /api/v1/practice-areas/{slug}`**  
  Full practice area detail, legal framework summary, and linked courtroom experiences.

### 3.5 Courtroom & Case Studies
- **`GET /api/v1/courtroom`**  
  Filtered case catalog. Parameters: `filter[court]`, `filter[case_type]`, `filter[year]`, `q`. Only records with `status = 'published'` and `visibility = 'public'` are exposed.
- **`GET /api/v1/courtroom/{slug}`**  
  Full case analysis: legal issues, arguments, judgment summary, and downloadable non-confidential orders.

### 3.6 Legal Research & Landmark Judgments
- **`GET /api/v1/research`**  
  Paginated research papers and analyses. Filters: `filter[category]`, `filter[research_type]`.
- **`GET /api/v1/research/{slug}`**  
  Full research text, citation references, and downloadable research PDF.
- **`GET /api/v1/judgments`**  
  Landmark Supreme Court judgment reviews. Filters: `filter[court]`, `filter[year]`, `filter[legal_area]`.
- **`GET /api/v1/judgments/{slug}`**  
  Full judgment briefing, ratio decidendi, and practical commentary.

### 3.7 Publications
- **`GET /api/v1/publications`**  
  Authored books, law reviews, and published papers.
- **`GET /api/v1/publications/{slug}`**  
  Publication overview, external citation links, and PDF brief.

### 3.8 Media, Videos & Gallery
- **`GET /api/v1/media/press`** & **`GET /api/v1/media/press/{slug}`**  
  Print and digital news coverage.
- **`GET /api/v1/media/appearances`** & **`GET /api/v1/media/appearances/{slug}`**  
  Television debates and talk shows.
- **`GET /api/v1/videos`** & **`GET /api/v1/videos/{slug}`**  
  Video talks, webinar appearances, and lectures.
- **`GET /api/v1/gallery`**  
  Albums with cover images.
- **`GET /api/v1/gallery/{slug}`**  
  Full masonry photo collection with captions and high-resolution responsive WebP URLs.

### 3.9 Global Search
- **`GET /api/v1/search?q={query}&type={optional_type}`**  
  Searches across Practice Areas, Courtroom, Research, Judgments, Publications, and Media. Returns polymorphic search items:
  ```json
  {
    "type": "courtroom",
    "title": "Writ Petition No. 4102 of 2021",
    "excerpt": "Constitutional challenge regarding regulatory compliance...",
    "url": "/courtroom/writ-petition-4102-2021",
    "date": "2021-11-14",
    "image": "https://..."
  }
  ```

### 3.10 Client Intake & Interactions
- **`POST /api/v1/contact`**  
  - **Rate Limit:** 5 requests per 10 minutes per IP (`throttle:5,10`).
  - **Payload Validation:**
    - `name`: string, required, max 255
    - `phone`: string, required, regex for valid BD or international format
    - `email`: string, optional, email format, max 255
    - `subject`: string, required, max 255
    - `message`: string, required, min 10, max 3000
    - `_honeypot`: string, must be empty (spam bot trap)
- **`POST /api/v1/consultation`**  
  - **Rate Limit:** 3 requests per 10 minutes per IP (`throttle:3,10`).
  - **Payload Validation:**
    - `name`: string, required, max 255
    - `phone`: string, required, valid phone
    - `email`: string, optional, email
    - `subject`: string, required, max 255
    - `practice_area_id`: integer, optional, exists in `practice_areas.id`
    - `preferred_date`: date, optional, after_or_equal:today
    - `message`: string, required, min 15, max 5000
    - `_honeypot`: string, must be empty

---

## 4. Authentication Endpoints

- **`POST /api/v1/auth/login`**
  - **Rate Limit:** 5 attempts per minute per IP.
  - **Payload:** `{ "email": "admin@nijamuddin.com", "password": "...", "device_name": "Chrome-Windows" }`
  - **Response:** `{ "token": "1|sanctum_token...", "user": { "id": 1, "name": "...", "email": "...", "roles": ["super_admin"] } }`
- **`POST /api/v1/auth/logout`**
  - **Auth:** `auth:sanctum`.
  - **Action:** Revokes current token.
- **`GET /api/v1/auth/me`**
  - **Auth:** `auth:sanctum`.
  - **Response:** Authenticated user profile, assigned roles, and granular permissions list.

---

## 5. Administrative Control Endpoints (`/api/v1/admin/*`)

All admin endpoints require `auth:sanctum` and verified RBAC permissions.

### 5.1 Dashboard
- `GET /api/v1/admin/dashboard/stats`: Returns counts for articles, cases, research, videos, unread messages, and pending consultations.
- `GET /api/v1/admin/dashboard/recent-inquiries`: Returns latest 10 consultations and contact messages.

### 5.2 Dynamic CMS Management
- `GET|PUT /api/v1/admin/homepage/sections`: Fetch section order and update settings/content.
- `POST /api/v1/admin/homepage/sections/reorder`: Reorders homepage sections array.
- `GET|POST|PUT|DELETE /api/v1/admin/pages`: Full CMS page management.
- `GET|POST|PUT|DELETE /api/v1/admin/menus` & `/menu-items`: Dynamic navigation management.
- `GET|PUT /api/v1/admin/settings`: Manage global site configuration and social connections.

### 5.3 Profile & Credentials Management
- `GET|PUT /api/v1/admin/profile`: Update bio, enrollments, philosophy, chamber addresses.
- `GET|POST|PUT|DELETE /api/v1/admin/credentials`: Manage awards and certifications.
- `GET|POST|PUT|DELETE /api/v1/admin/educations`: Manage academic qualifications.
- `GET|POST|PUT|DELETE /api/v1/admin/timeline`: Manage career milestones.
- `GET|POST|PUT|DELETE /api/v1/admin/memberships`: Manage professional memberships.

### 5.4 Practice Areas & Courtroom
- `GET|POST|PUT|DELETE /api/v1/admin/practice-areas`: CRUD for practice areas with rich text and icon selection.
- `GET|POST|PUT|DELETE /api/v1/admin/courtroom`: CRUD for courtroom experiences, case studies, and visibility toggles (`public` vs `private`).
- `POST /api/v1/admin/courtroom/{id}/documents`: Upload legal briefs or orders with `is_confidential` flags.
- `GET /api/v1/admin/case-documents/{id}/download`: Authenticated download stream for confidential documents.

### 5.5 Research, Judgments & Publications
- `GET|POST|PUT|DELETE /api/v1/admin/research`: Legal research editor with rich text HTML sanitization.
- `GET|POST|PUT|DELETE /api/v1/admin/judgments`: Landmark judgment review publisher.
- `GET|POST|PUT|DELETE /api/v1/admin/publications`: Authored publications and book repository.
- `GET|POST|PUT|DELETE /api/v1/admin/categories`: Hierarchical category taxonomy.
- `GET|POST|PUT|DELETE /api/v1/admin/tags`: Tag taxonomy.

### 5.6 Media & Assets
- `GET /api/v1/admin/media`: Paginated media library with folder and mime filtering.
- `POST /api/v1/admin/media/upload`: Upload file, validates MIME signature, generates WebP variants (`thumbnail`, `small`, `medium`, `large`, `hero`).
- `DELETE /api/v1/admin/media/{id}`: Soft or hard delete media record and remove physical files.

### 5.7 Inquiry & Consultation Operations
- `GET /api/v1/admin/contacts` & `GET /api/v1/admin/contacts/{id}`: View incoming messages.
- `PATCH /api/v1/admin/contacts/{id}`: Update status (`read`, `replied`, `archived`, `spam`) and private `admin_notes`.
- `GET /api/v1/admin/consultations` & `GET /api/v1/admin/consultations/{id}`: View consultation bookings.
- `PATCH /api/v1/admin/consultations/{id}`: Update status (`contacted`, `scheduled`, `completed`, `closed`) and private notes.

### 5.8 Security, RBAC & Audit Logs
- `GET|POST|PUT|DELETE /api/v1/admin/users`: Manage administrative user accounts.
- `GET|POST|PUT|DELETE /api/v1/admin/roles`: Manage Spatie roles and assigned permissions.
- `GET /api/v1/admin/permissions`: Read-only list of all system permissions.
- `GET /api/v1/admin/activity-logs`: Paginated audit log with filter by user, action, and date range.
