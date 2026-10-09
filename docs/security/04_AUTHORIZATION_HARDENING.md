# 04. Authorization & RBAC Hardening

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Lead Coordinator:** Senior Laravel Security Engineer & Solution Architect  
**Status:** ENFORCED SERVER-SIDE  

---

## 1. Zero Trust Authorization Philosophy

The platform treats the frontend UI purely as a presentation layer. No authorization decisions rely on hidden buttons, disabled elements, or client-side routing. Every administrative mutation, query, or file stream is validated on the backend before execution.

---

## 2. RBAC Architecture

The role and permission architecture is governed by **Spatie Laravel-Permission** and structured as follows:

### Roles:
1. `super_admin`: Full unrestricted system access via `Gate::before(fn ($user) => $user->hasRole('super_admin') ? true : null)`.
2. `admin`: General chamber operations, editorial oversight, client intakes, consultations, and CMS configuration.
3. `editor`: Authoritative legal writing, case notes, research monographs, judgment reviews, and publication management.
4. `content_manager`: Content drafting, media attachment, event scheduling. Cannot manage users, settings, or delete critical records.
5. `media_manager`: Restricted strictly to gallery albums, media uploads, press items, and video broadcasts.

---

## 3. Enforcement Mechanisms

1. **Route Middleware (`routes/api.php`)**:
   - `permission:manage_settings` on site settings.
   - `permission:manage_users` on administrative user accounts.
   - `permission:manage_case_documents|view_confidential_cases` on courtroom archives.
   - `permission:manage_contacts` and `permission:manage_consultations` on client inquiries.
2. **Form Request Authorization**:
   - Every `FormRequest` class implements `authorize(): bool` checking `$this->user()?->can(...)`.
3. **Controller Guardrails**:
   - Deep methods call `$this->authorize()` or helper `$this->authorizePermission(...)` ensuring defensive checks even if route middleware is misconfigured.
4. **Draft & Visibility Filtering**:
   - Public controllers automatically apply Eloquent query scopes (`published()`, `publicVisibility()`) ensuring unpublished drafts or private items return HTTP 404 to unauthorized users.

---

## 4. Automated Verification

- Test Suite: `Tests\Feature\Security\AuthorizationAndRbacSecurityTest`
  - `✓ anonymous_user_blocked_from_admin_endpoints`
  - `✓ authenticated_user_without_permissions_is_forbidden`
  - `✓ content_manager_cannot_manage_system_settings_or_users`
  - `✓ media_manager_cannot_access_client_inquiries_or_consultations`
  - `✓ super_admin_has_unrestricted_access`
  - `✓ public_api_enforces_visibility_and_publication_status`
