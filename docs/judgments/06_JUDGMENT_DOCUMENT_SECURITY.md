# 06. Judgment Document Security & File Handling

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis  
**Component:** Judgment PDF Document Storage & Streaming

---

## 1. Document Architecture & Isolation

Attached judgment transcripts and certified court orders are managed through the centralized `media` system. Files are stored on private or protected storage disks with absolute path obfuscation.

```
┌─────────────────────────────────────────────────────────────┐
│                 DOCUMENT SECURITY LIFECYCLE                 │
└─────────────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │ Public Download    │          │ Admin Download     │
    │ /judgments/{slug}/ │          │ /admin/judgments/  │
    │ download           │          │ {id}/download      │
    └──────────┬─────────┘          └──────────┬─────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │ Check 1: Review is │          │ Check 1: User has  │
    │ published & public?│          │ valid Sanctum token│
    │ Check 2: Media is  │          │ Check 2: User has  │
    │ marked public?     │          │ view_cms / edit?   │
    └──────────┬─────────┘          └──────────┬─────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
    ┌─────────────────────────────────────────────────────────┐
    │ Storage Validation:                                     │
    │ 1. Disk path existence check                            │
    │ 2. MIME type verification (application/pdf)             │
    │ 3. Streaming response with security headers:            │
    │    - Content-Disposition: attachment; filename="..."    │
    │    - X-Content-Type-Options: nosniff                    │
    │    - Cache-Control: private, no-transform               │
    └─────────────────────────────────────────────────────────┘
```

---

## 2. Security Controls & Protections

1. **Anti-IDOR Verification:**  
   Public download endpoints do not accept raw database IDs or internal storage paths. They resolve exclusively via the public `slug`. If the parent judgment review is in `draft` or `private` status, the public download controller immediately returns a `404 Not Found`.
2. **Private Document Protection:**  
   If an attached media asset has its visibility set to `private`, public requests are rejected with `403 Forbidden` or `404 Not Found`.
3. **MIME Sniffing & Path Traversal Prevention:**  
   Streaming responses enforce `X-Content-Type-Options: nosniff`. Document paths are validated through Laravel Storage drivers, eliminating directory traversal vectors (`../../`).
4. **No Direct Storage URL Exposure:**  
   All downloads are routed through controlled API actions (`downloadPdf` / `downloadDocument`), allowing complete audit logging of document access.
