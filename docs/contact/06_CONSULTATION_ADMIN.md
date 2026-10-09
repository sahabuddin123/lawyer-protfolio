# 06. Consultation Requests Admin Console

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** UI/UX Designer & Senior React/TypeScript Engineer  
**Component:** `frontend/src/features/contact/ContactInboxManager.tsx`  
**Permissions Required:** `view_consultations`, `manage_consultations`

---

## 1. Consultation Scheduling Workflow

The Consultations tab allows chamber coordinators to review case appointment requests:

```
[Consultations Datagrid] ──▶ [Filter by Status & Search] ──▶ [Detail & Matter Modal] ──▶ [Schedule & Notes]
```

### 1.1 Datagrid Columns
- **Client Name:** Submitter legal name.
- **Phone / Email:** Clickable telephone and email links.
- **Matter Subject:** Case classification preview.
- **Preferred Schedule:** Formatted date (`YYYY-MM-DD`) and requested time window (`Morning`, `Afternoon`, `Evening`).
- **Status Badge:** Visual indicator of workflow state (`new`, `contacted`, `in_progress`, `scheduled`, `completed`, `closed`, `spam`).
- **Submission Date:** Submission timestamp.

### 1.2 Detail Modal & Private Notes
- Full narrative overview and case summary rendered as sanitized plain text (zero XSS vulnerability).
- Status dropdown selector with instant persist.
- Dedicated textarea for confidential chamber notes (conflict checks, retainer quotes, phone logs).
