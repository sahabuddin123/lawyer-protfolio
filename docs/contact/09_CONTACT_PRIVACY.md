# 09. Contact & Client Intake Privacy Architecture

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** Privacy/Security Specialist & Legal Content Structure Specialist  
**Reference:** Bangladesh Bar Council Canons of Professional Conduct

---

## 1. Minimal Information Collection Principle

In accordance with strict privacy safeguards:
- The intake forms collect only the minimum operational contact data necessary for communication: Name, Phone, Email (optional), Subject, Practice Area, and Message.
- **Strictly Prohibited Information:** Forms explicitly warn against submitting National ID (NID) copies, passport scans, bank account numbers, passwords, or confidential evidentiary records prior to formal engagement.

---

## 2. Explicit Non-Retainer Legal Consent

Every submission requires explicit user consent through an active checkbox:
- **English Consent Statement:**  
  *"I understand that submitting this message or consultation request does not create an advocate-client relationship. Do not submit sensitive financial information, banking credentials, or passwords."*
- **Bengali Consent Statement:**  
  *"এই প্ল্যাটফর্মের মাধ্যমে বার্তা বা পরামর্শ অনুরোধ পাঠানো কোনো আইনজীবী-মক্কেল সম্পর্ক তৈরি করে না। অনুগ্রহ করে সংবেদনশীল আর্থিক তথ্য, ব্যাংক বিবরণ বা গোপন পাসওয়ার্ড পাঠাবেন না।"*
- Consent status (`consent_given = true`) and verification timestamp (`consented_at = now()`) are immutably stored in the database.

---

## 3. Data Retention & Isolation

1. **Model Field Hiding:**
   - In both `ContactMessage` and `ConsultationRequest` Eloquent models, `admin_notes`, `ip_address`, and `user_agent` are registered in `$hidden`.
   - They are never serialized into public JSON responses.
2. **Soft Deletions:**
   - Records utilize Laravel's `SoftDeletes` trait.
   - Deletions are non-destructive and can only be performed by administrators with `manage_contacts` or `manage_consultations` privileges.
