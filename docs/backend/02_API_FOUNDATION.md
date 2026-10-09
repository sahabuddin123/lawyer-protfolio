# 02. API Foundation & REST Contracts

**Protocol:** REST over HTTPS / HTTP (dev)  
**Base URL:** `/api/v1`  
**Content-Type:** `application/json`  
**Accept:** `application/json`  

---

## 1. Global Response Envelope

All API endpoints return predictable, standardized JSON envelopes matching `docs/architecture/04_API_SPEC.md`.

### 1.1 Success Envelope
```json
{
  "success": true,
  "message": "Resource retrieved successfully.",
  "data": {},
  "meta": {
    "timestamp": "2026-10-06T22:49:36+06:00",
    "locale": "en"
  }
}
```

### 1.2 Paginated List Envelope
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
    "locale": "en",
    "timestamp": "2026-10-06T22:49:36+06:00"
  }
}
```

### 1.3 Error Envelope
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "field": [
      "Validation failure description."
    ]
  },
  "error_code": "VALIDATION_FAILED"
}
```

---

## 2. Centralized Exception Handling

Centralized exception rendering is configured in `backend/bootstrap/app.php`:

| Exception Class | HTTP Status | Error Code | Description |
| :--- | :---: | :--- | :--- |
| `ValidationException` | 422 | `VALIDATION_FAILED` | Form request or validator errors |
| `AuthenticationException` | 401 | `UNAUTHENTICATED` | Missing or invalid Sanctum token |
| `AuthorizationException` | 403 | `FORBIDDEN` | Insufficient Spatie permissions |
| `ModelNotFoundException` | 404 | `NOT_FOUND` | Missing Eloquent entity |
| `NotFoundHttpException` | 404 | `NOT_FOUND` | Unmatched API route |
| `ThrottleRequestsException`| 429 | `RATE_LIMIT_EXCEEDED`| Exceeded rate limiter threshold |
| `HttpException` | 4xx / 5xx | `HTTP_ERROR` | Explicit HTTP exceptions |
| `Throwable` | 500 | `SERVER_ERROR` | Unhandled runtime errors (safe in prod) |

---

## 3. Localization Infrastructure

Language negotiation is handled seamlessly by `App\Http\Middleware\SetLocale`:
1. Checks for `?lang=bn` or `?lang=en` in the query string.
2. If omitted, checks `Accept-Language: bn` or `Accept-Language: en` header.
3. Falls back to English (`en`) if unspecified or unrecognized.
4. Model attributes cast with `HasTranslations` automatically output the active locale string or fallback smoothly to English.

---

## 4. API Health Probe

- **Endpoint:** `GET /api/v1/health`
- **Authentication:** None (Public)
- **Parameters:** `?lang=en|bn` (optional)
- **Response Sample:**
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "ok",
    "application": "Advocate Nijam Uddin Platform",
    "environment": "local",
    "database": "connected",
    "locale": "en",
    "timestamp": "2026-10-06T22:49:36+06:00"
  },
  "meta": {
    "timestamp": "2026-10-06T22:49:36+06:00",
    "locale": "en"
  }
}
```

---

## 5. Authentication & Session Management

Administrative authentication is implemented using Laravel Sanctum bearer tokens with brute-force rate limiting (`throttle:auth` = 5 attempts/min).

### 5.1 Endpoints Specification

| Route | Method | Auth Guard | Rate Limit | Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `/api/v1/auth/login` | `POST` | Public | 5 req/min | Validates credentials, issues Sanctum bearer token |
| `/api/v1/auth/logout` | `POST` | `auth:sanctum` | Standard | Invalidate caller's active bearer token |
| `/api/v1/auth/me` | `GET` | `auth:sanctum` | Standard | Returns authenticated user, roles, permissions |
| `/api/v1/auth/forgot-password` | `POST` | Public | 5 req/min | Generates 64-char reset token without enumeration |
| `/api/v1/auth/reset-password` | `POST` | Public | 5 req/min | Validates token (60 min expiry), updates password, revokes tokens |

### 5.2 Login Payload & Response

#### Request:
```json
{
  "email": "admin@nijamuddin.com",
  "password": "Haq@Judicial2026!#",
  "device_name": "Chrome-Windows"
}
```

#### Response (HTTP 200):
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "27|v4RKreEL52I5YaNfXdRsXGzzjpUUBglqR0M0GmXh61f4c351",
    "user": {
      "id": 1,
      "name": "Advocate Nijam Uddin (Super Admin)",
      "email": "admin@nijamuddin.com",
      "phone": "+8801700000000",
      "avatar": null,
      "is_active": true,
      "roles": ["super_admin"],
      "permissions": [
        "view_dashboard",
        "manage_settings",
        "manage_users",
        "manage_roles",
        "view_activity_logs",
        "manage_redirects",
        "edit_profile",
        "create_practice_area",
        "create_cases",
        "create_research",
        "create_judgments",
        "create_publications",
        "manage_press",
        "manage_gallery",
        "upload_media",
        "view_contacts",
        "manage_pages",
        "manage_seo"
      ],
      "last_login_at": "2026-10-06T23:11:21+06:00",
      "created_at": "2026-10-06T22:55:39+06:00"
    }
  },
  "meta": {
    "timestamp": "2026-10-06T23:11:22+06:00",
    "locale": "en"
  }
}
```

---

## 6. Role-Based Access Control (RBAC) Specification

The RBAC implementation leverages `spatie/laravel-permission` and strict `Gate::before` authorization.

### 6.1 Approved Roles
1. **`super_admin`:** Unrestricted authority across all system features and audit logs via `Gate::before` policy bypass.
2. **`admin`:** Full administrative authority over daily legal operations, client consultations, inquiries, publications, and CMS. Excluded from deleting staff accounts or modifying audit logs.
3. **`editor`:** Drafting and publishing authority for legal research papers, Supreme Court judgment reviews, courtroom briefs, and authored publications.
4. **`content_manager`:** Content creation and media coordination; can queue items for review but cannot unilaterally publish.
5. **`media_manager`:** Restricted strictly to media asset library, photo galleries, video broadcasts, and press entries.

### 6.2 Granular Permissions (48 Total)
Grouped by functional module:
- `analytics`: `view_dashboard`
- `system`: `manage_settings`, `manage_users`, `manage_roles`, `view_activity_logs`, `manage_redirects`
- `profile`: `edit_profile`, `manage_credentials`, `manage_educations`, `manage_timeline`, `manage_memberships`
- `practice`: `create_practice_area`, `edit_practice_area`, `delete_practice_area`, `publish_practice_area`
- `courtroom`: `create_cases`, `edit_cases`, `delete_cases`, `publish_cases`, `view_confidential_cases`, `manage_case_documents`
- `research`: `create_research`, `edit_research`, `delete_research`, `publish_research`
- `judgments`: `create_judgments`, `edit_judgments`, `delete_judgments`, `publish_judgments`
- `publications`: `create_publications`, `edit_publications`, `delete_publications`, `publish_publications`
- `media`: `manage_press`, `manage_appearances`, `manage_videos`
- `gallery`: `manage_gallery`
- `media_lib`: `upload_media`, `delete_media`, `browse_media`
- `inquiries`: `view_contacts`, `manage_contacts`, `view_consultations`, `manage_consultations`
- `cms`: `manage_pages`, `manage_menus`, `manage_homepage`
- `seo`: `manage_seo`

### 6.3 Route Protection Middleware
- `auth:sanctum`
- `role:super_admin|admin`
- `permission:view_dashboard`
- `role_or_permission:editor|publish_research`

