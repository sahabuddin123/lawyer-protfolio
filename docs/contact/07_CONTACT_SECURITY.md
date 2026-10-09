# 07. Contact & Consultation Security Architecture

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** Security Engineer & Privacy/Security Specialist  
**Reference:** `08_SECURITY_ARCHITECTURE.md`, `09_RBAC_MATRIX.md`

---

## 1. Authentication & Granular RBAC

Public intake endpoints (`GET/POST /api/v1/contact` and `POST /api/v1/consultation`) are open to citizens and clients without authentication, protected by rate limiting and honeypots.

All administrative routes are strictly secured behind `auth:sanctum` and role-based permissions:
- `view_contacts`: Authorizes viewing contact message lists and individual message details.
- `manage_contacts`: Authorizes status modification, private note updates, and soft deletions.
- `view_consultations`: Authorizes viewing consultation request lists and consultation details.
- `manage_consultations`: Authorizes consultation status modification, private note updates, and soft deletions.

---

## 2. Input Sanitization & Anti-XSS

To prevent cross-site scripting:
- All visitor-submitted strings (`name`, `phone`, `email`, `subject`, `message`, `preferred_time`) are stripped of HTML tags via `strip_tags()` before database persistence.
- In the frontend admin console, submission messages are rendered strictly as escaped plain text inside `<div className="whitespace-pre-wrap">`.
- Rich-text or HTML submission is explicitly rejected.

---

## 3. IDOR Protection

All administrative routes utilize Route Model Binding with authorization gates:
- Cross-tenant or unauthorized manipulation is intercepted before controller execution.
- Soft-deleted items are excluded from normal queries and cannot be updated.

---

## 4. Comprehensive Audit Logging

All administrative actions trigger immutable records in the `activity_logs` table:
- `contact_updated`: Triggered when status or notes change.
- `contact_deleted`: Triggered on message soft deletion.
- `consultation_updated`: Triggered on consultation status or note changes.
- `consultation_deleted`: Triggered on consultation soft deletion.
Recorded fields include authenticated user ID, client IP, action type, description, and old/new values.
