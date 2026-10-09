# 01. Contact & Consultation Architecture

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** Senior Solution Architect & Senior Laravel Engineer  
**Domain Boundary:** Client Intake & Chamber Communications  

---

## 1. Executive Summary & Domain Scope

The Contact & Consultation Module governs all incoming citizen inquiries, correspondence with the legal chambers, and formal preliminary legal consultation bookings for Advocate Nijam Uddin.

```
┌─────────────────────────────────────────────────────────────┐
│                       PUBLIC LAYER                          │
│                                                             │
│   GET /api/v1/contact ──────▶ Public Contact Configuration  │
│   POST /api/v1/contact ─────▶ Rate-limited & Honeypot Guard │
│   POST /api/v1/consultation ▶ Rate-limited & Honeypot Guard │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                         │
│                                                             │
│   - Anti-Abuse & Tarpit Spam Defense                        │
│   - XSS Input Stripping & Normalization                     │
│   - Explicit Non-Retainer Legal Consent Verification       │
│   - CmsCacheService (24-hr Config Caching)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                      │
│                                                             │
│   contact_messages       ──────▶ SoftDeletes & Statuses    │
│   consultation_requests  ──────▶ SoftDeletes & Schedules   │
│   site_settings (contact)──────▶ Dynamic Chamber Config    │
│   activity_logs          ──────▶ Administrative Audit Trail│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Functional Capabilities

1. **Dynamic Chamber Configuration:**
   - Physical office and chamber addresses in Dhaka and Chattogram.
   - Hotlines and email addresses fetched dynamically from `site_settings`.
   - Verified WhatsApp desk and map navigation link.
2. **General Inquiries Intake (`contact_messages`):**
   - Direct correspondence intake with status tracking (`new`, `read`, `replied`, `archived`, `spam`).
   - Private administrative chamber notes.
3. **Formal Legal Consultation Intake (`consultation_requests`):**
   - Legal matter classification mapped dynamically to published practice areas.
   - Requested preference schedule (date picker and time window).
   - Multi-tier lifecycle states (`new`, `contacted`, `in_progress`, `scheduled`, `completed`, `closed`, `spam`).
4. **Strict Scope Safeguards (Anti-Creep):**
   - Zero CRM sales pipelines or lead scoring.
   - No automated calendar booking or appointment guarantees.
   - Explicit disclaimers ensuring no advocate-client relationship is formed upon submission.
