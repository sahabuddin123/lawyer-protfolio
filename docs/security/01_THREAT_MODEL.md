# 01. Security Threat Model

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Lead Coordinator:** Project Director / Security Lead & Senior Solution Architect  
**Classification:** SECURE BY DEFAULT  

---

## 1. Executive Overview

This Threat Model defines the threat actors, asset classifications, attack surfaces, and threat categories for the judicial platform of Advocate Nijam Uddin (Haq), Senior Advocate of the Supreme Court of Bangladesh. 

Given the sensitive nature of constitutional litigation, corporate disputes, high-profile case documents, and client consultations, the platform enforces a **Zero Trust** architecture across all public, API, administrative, and storage boundaries.

---

## 2. Threat Actor Personas

| Persona | Motivation | Capabilities & Vectors | Impact Level |
| :--- | :--- | :--- | :--- |
| **Anonymous Public Visitor** | Casual inquiry, reading legal articles | GET requests to public pages; form submissions to contact/intake endpoints | Low |
| **Malicious Bot / Scraper** | Content scraping, email harvesting, form spam | Automated HTTP requests, distributed crawling, dictionary attacks | Medium |
| **Malicious Uploader** | Remote code execution, server compromise | Uploading webshells, double-extension files, active SVGs, decompression bombs | Critical |
| **Credential Stuffer / Attacker** | Account takeover, administrative hijacking | Password brute-forcing, credential stuffing, session hijacking, replay attacks | High |
| **Privilege Escalator (Insider)** | Accessing unauthorized case files or system settings | Exploiting broken object level authorization (BOLA/IDOR), parameter tampering | High |
| **Compromised Admin** | Unauthorized deletion, audit log tampering | Malicious data deletion, altering settings, mass content alteration | High |
| **Untrusted External Service** | SSRF, Open Redirect, phishing | Malicious target URLs, embedded iframe exploitation, cross-site leaks | Medium |

---

## 3. High-Value Asset Inventory

1. **Confidential Case Documents (`storage/app/secure`):** Petitions, constitutional writs, affidavits, and privileged client files.
2. **Client Consultation & Contact Data:** PII, case descriptions, phone numbers, email addresses, and private legal strategy notes.
3. **Administrative Access Tokens & Sessions:** Laravel Sanctum bearer tokens with hashed storage.
4. **Platform Integrity & Legal Content:** Supreme Court judgment reviews, research monographs, and public pedigree records.
5. **System Audit Logs (`activity_logs`):** Immutable historical records of administrative actions.

---

## 4. Threat Categories & Defense Matrix

| Threat Category | Potential Attack Vector | Applied Platform Defense | Defense Status |
| :--- | :--- | :--- | :--- |
| **Authentication Bypass** | Manipulating token headers or forged session cookies | Sanctum SHA-256 token hashing; strict token invalidation upon logout; account activity checks | **VERIFIED** |
| **Authorization Bypass / Privilege Escalation** | Low-privilege staff attempting to call super-admin or admin endpoints | Spatie RBAC route middleware (`permission:...`); controller policy checks; Gate::before isolation | **VERIFIED** |
| **Insecure Direct Object Reference (IDOR)** | Tampering with document IDs, contact IDs, or album image IDs in URL paths | Ownership and relationship verification; 403 on unauthorized confidential documents; 404 on cross-parent IDs | **VERIFIED** |
| **Cross-Site Scripting (XSS)** | Submitting `<script>` or event handlers in rich text CMS fields or inquiry forms | Multi-tier defense: server-side `HtmlSanitizer` + `strip_tags` on intake + client-side `sanitizeHtml` DOMParser | **VERIFIED** |
| **SQL Injection (SQLi)** | Injecting `' OR 1=1` or subqueries into search query parameters or sorting fields | 100% Eloquent Query Builder & PDO parameter binding; strict whitelist of sortable columns; 0 raw interpolations | **VERIFIED** |
| **Cross-Site Request Forgery (CSRF)** | Cross-origin form submission exploiting browser sessions | API is token-based Bearer authentication (`auth:sanctum`); CORS enforces origin whitelist; cookie SameSite=Lax | **VERIFIED** |
| **Server-Side Request Forgery (SSRF)** | Supplying internal loopback or cloud metadata URLs for fetching | **Zero Server-Side Fetching**: The application initiates zero external HTTP requests (no curl, no Http::, no file_get_contents) | **VERIFIED BY DESIGN** |
| **File Upload Abuse & Webshells** | Uploading `.php`, `.phtml`, `.phar`, `.exe`, or scripts | Strict extension whitelist, blacklisting 24 script types, file signature inspection via `finfo_file` | **VERIFIED** |
| **Double Extension Exploits** | Uploading `shell.php.jpg` or `image.jpg.php` | Rejection of any file where any prefix part contains dangerous extensions; server renames all files to UUIDs | **VERIFIED** |
| **Path Traversal** | Filenames containing `../`, `..\`, `/etc/passwd` | Rejection of filenames containing `..`, `/`, `\`; files stored strictly under randomized UUIDs | **VERIFIED** |
| **Malicious Active SVG** | SVGs containing embedded `<script>` or `onload` handlers | Explicit rejection of SVG uploads in media pipeline; only raster formats (JPEG, PNG, WebP, AVIF) permitted | **VERIFIED** |
| **Decompression Bombs (Zip/Image)** | Uploading extremely high-dimension images to exhaust server memory | Dimension bounding (max 4000x4000px); file size caps (10MB for images, 20MB for PDFs); memory exhaustion limits | **VERIFIED** |
| **Open Redirect** | Exploiting redirect routes with protocol-relative URLs (`//evil.com`) | `HtmlSanitizer::isSafeUrl` explicitly rejects `//`, `/\\`, `\\/`; validates approved protocols (`https://`, internal routes) | **VERIFIED** |
| **Credential Stuffing / Brute Force** | Rapid login attempts on `/api/v1/auth/login` | Dual-layer rate limiting: 5 req/min per IP, 5 req/min per compound email+IP key | **VERIFIED** |
| **API Information Disclosure** | Leaking stack traces, SQL syntax, or password hashes | Standardized `ApiResponse` envelope; `APP_DEBUG=false` in production; `hidden` attributes on models | **VERIFIED** |
| **Pagination & DoS Abuse** | Requesting `per_page=999999` to cause memory spikes | Strict bounding on all paginated endpoints: admin capped to 100, public capped to 50 | **VERIFIED** |
| **Clickjacking** | Embedding portal in external phishing iframe | `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'self'` applied on all HTTP responses | **VERIFIED** |

---

## 5. Security Boundary Architecture

```
[ Public Web Visitor ]
         │ (HTTPS / TLS 1.3)
         ▼
[ OWASP Security Headers Middleware ] ──► (X-Frame-Options, CSP, nosniff, Referrer, Permissions)
         │
[ CORS & Rate Limiter ] ──► (Origin Whitelist, 60 req/min API, 5 req/min Auth, 5 req/min Intake)
         │
[ Router & Authentication Guard ] ──► (Sanctum SHA-256 Bearer Token Verification)
         │
[ Spatie RBAC & Policy Authorization ] ──► (Role/Permission Matrix & Resource Ownership)
         │
[ FormRequest Validation & Sanitization ] ──► (HtmlSanitizer, MIME Inspection, Safe URLs)
         │
┌────────┴────────────────────────┬────────────────────────┐
▼                                 ▼                        ▼
[ Public Storage ]       [ Secure Isolated Disk ]  [ MySQL Database ]
(Public images & PDFs)   (Private case documents)  (Parameterized queries,
                         (Requires Auth + Policy)   Soft deletes, strict mass assignment)
```
