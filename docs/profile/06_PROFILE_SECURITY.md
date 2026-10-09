# 06 — Profile Security, Audit Logging & Access Control

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 6: Profile & About Module

---

## 1. Threat Modeling & Safeguards

The Profile module represents the official voice, reputation, and credentials of a Supreme Court Advocate. Security protections are implemented across multiple layers:

### 1.1 Server-Side Authorization (RBAC)
- All mutations (`PUT /admin/profile`, `POST|PUT|DELETE /admin/credentials`, etc.) enforce server-side Spatie permission checks (`edit_profile`, `manage_credentials`, `manage_educations`, `manage_timeline`, `manage_memberships`).
- Lower-tier roles (`editor`, `content_manager`, `media_manager`) and unauthenticated clients receive HTTP 403 or 401.

### 1.2 Stored XSS Mitigation
- User-supplied biography text (`long_bio`) is passed through `App\Services\HtmlSanitizer::cleanTranslations()`.
- Strips `<script>`, `<iframe>`, `<object>`, `<embed>`, inline event handlers (`onclick`, `onload`, `onerror`), and unsafe protocols (`javascript:`, `data:`).

### 1.3 Draft & Hidden State Suppression
- The public API strictly queries `Profile::published()`.
- If an admin toggles status to `draft` or `hidden`, public endpoints immediately return HTTP 404, preventing confidential or work-in-progress content leakage.

### 1.4 Cache Invalidation & Stale Content Prevention
- Any write, update, reordering, or deletion across the profile domain immediately flushes cache keys across both locales via `CmsCacheService::forgetProfile()`.

---

## 2. Comprehensive Audit Trail

All administrative modifications are logged into `activity_logs`:

| Event / Action | Description | Audited Payload |
| :--- | :--- | :--- |
| `profile_updated` | Modification of profile details or SEO | Pre- and post-mutation field diffs |
| `credential_created` | Addition of new credential | Full credential JSON |
| `credential_updated` | Update of existing credential | Pre- and post-mutation diffs |
| `credential_deleted` | Removal of credential | Record snapshot prior to deletion |
| `credentials_reordered` | Batch reordering of credentials | Action timestamp & user ID |
| `education_created` | Addition of academic degree | Full degree JSON |
| `education_updated` | Modification of degree record | Pre- and post-mutation diffs |
| `education_deleted` | Deletion of degree record | Record snapshot |
| `timeline_created` | Addition of career milestone | Full milestone record |
| `timeline_updated` | Update of milestone | Pre- and post-mutation diffs |
| `timeline_deleted` | Deletion of milestone | Record snapshot |
| `membership_created` | Addition of bar membership | Full membership record |
| `membership_updated` | Update of membership | Pre- and post-mutation diffs |
| `membership_deleted` | Deletion of membership | Record snapshot |

All logs record `user_id`, remote `ip_address`, `user_agent`, and timestamp.
