# 04 — Profile Administrative Control Center

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 6: Profile & About Module

---

## 1. Overview

The Profile Administrative Control Center allows authorized users (`super_admin` and `admin`) to govern all aspects of Advocate Nijam Uddin's public persona, bio, credentials, educational records, career milestones, professional memberships, and SEO metadata.

---

## 2. Admin Endpoints Reference

All endpoints require `auth:sanctum` and verified granular permissions:

| Verb | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/profile` | `edit_profile` | Retrieve complete profile with full bilingual dictionaries & SEO |
| `PUT` | `/api/v1/admin/profile` | `edit_profile` | Update profile, sanitize long bio HTML, update polymorphic SEO |
| `GET` | `/api/v1/admin/credentials` | `manage_credentials` | List all credentials sorted by sort_order |
| `POST` | `/api/v1/admin/credentials` | `manage_credentials` | Create new credential badge / certificate |
| `POST` | `/api/v1/admin/credentials/reorder` | `manage_credentials` | Batch reorder credentials order array |
| `GET` | `/api/v1/admin/credentials/{id}` | `manage_credentials` | View credential details |
| `PUT` | `/api/v1/admin/credentials/{id}` | `manage_credentials` | Update credential details |
| `DELETE`| `/api/v1/admin/credentials/{id}` | `manage_credentials` | Delete credential record |
| `GET` | `/api/v1/admin/educations` | `manage_educations` | List academic qualifications |
| `POST` | `/api/v1/admin/educations` | `manage_educations` | Add new degree |
| `POST` | `/api/v1/admin/educations/reorder` | `manage_educations` | Batch reorder education records |
| `PUT` | `/api/v1/admin/educations/{id}` | `manage_educations` | Update academic record |
| `DELETE`| `/api/v1/admin/educations/{id}` | `manage_educations` | Delete academic record |
| `GET` | `/api/v1/admin/timeline` | `manage_timeline` | List career milestones |
| `POST` | `/api/v1/admin/timeline` | `manage_timeline` | Add career milestone |
| `POST` | `/api/v1/admin/timeline/reorder` | `manage_timeline` | Batch reorder career milestones |
| `PUT` | `/api/v1/admin/timeline/{id}` | `manage_timeline` | Update milestone |
| `DELETE`| `/api/v1/admin/timeline/{id}` | `manage_timeline` | Delete milestone |
| `GET` | `/api/v1/admin/memberships` | `manage_memberships` | List professional memberships |
| `POST` | `/api/v1/admin/memberships` | `manage_memberships` | Add professional membership |
| `POST` | `/api/v1/admin/memberships/reorder` | `manage_memberships` | Batch reorder memberships |
| `PUT` | `/api/v1/admin/memberships/{id}` | `manage_memberships` | Update membership |
| `DELETE`| `/api/v1/admin/memberships/{id}` | `manage_memberships` | Delete membership |

---

## 3. Admin UI Features (`ProfileManager.tsx`)

The React 18 admin interface is organized into 7 distinct editorial panels:
1. **Basic Info**: Name (EN/BN), Title/Headline (EN/BN), Subtitle (EN/BN), Status toggle, Enrollment status, Primary phone, email, and chambers addresses.
2. **Biography**: Bilingual short bio (1000 chars), full bio HTML editor (with preview), judicial philosophy, and legal approach.
3. **Credentials**: Interactive table with category tags, active/featured badges, modal editor for creating/editing credentials, and deletion protection.
4. **Education**: Degrees table, university selector, department, completion year, and modal editor.
5. **Timeline**: Career milestones, period badge, current status flag, and reordering.
6. **Memberships**: Professional bar associations, roles, membership numbers, and active toggles.
7. **SEO Metadata**: Dedicated controls for search engine title, meta description, canonical URL, and indexing directives.
