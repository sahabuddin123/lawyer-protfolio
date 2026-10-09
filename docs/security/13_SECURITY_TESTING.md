# Security Testing & Penetration Validation

## 1. Executive Summary
Security cannot rely solely on design assumptions; it must be continuously validated through rigorous, automated test suites and penetration simulations. In Phase 18, an automated security testing suite comprising **6 dedicated test classes, 31 test methods, and 173 assertions** was engineered within `backend/tests/Feature/Security/`.

---

## 2. Security Test Matrix

| Test Suite | File Path | Focus Areas | Tests | Assertions |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication Security** | `AuthenticationSecurityTest.php` | Account lockout, token revocation, timing/anti-enumeration, single-use reset, credential leak prevention | 5 | 28 |
| **Authorization & RBAC** | `AuthorizationAndRbacSecurityTest.php` | Anonymous blocks (401), unauthorized roles (403), role boundary checks, draft/private isolation | 6 | 32 |
| **File Upload & Media** | `FileUploadAndMediaSecurityTest.php` | 24-ext blacklist, double-exts, path traversal, SVGs, decompression bombs, UUID storage, disk isolation | 7 | 26 |
| **Headers & CORS** | `HeadersAndCorsSecurityTest.php` | CSP, nosniff, frame-ancestors, referrer policy, CORS untrusted origin rejection, error masking | 4 | 22 |
| **IDOR & Data Privacy** | `IdorAndDataPrivacySecurityTest.php` | Case doc clearance, cross-album IDOR, admin notes privacy, soft-delete isolation | 4 | 24 |
| **Injection & Abuse Defense** | `InjectionAndDefenseSecurityTest.php` | HTML XSS stripping, protocol-relative open redirect rejection, SQLi defense, sort whitelisting, pagination abuse | 5 | 41 |
| **TOTAL** | **6 Suites** | **Comprehensive OWASP Top 10 Coverage** | **31** | **173** |

---

## 3. Test Scenarios & Exploit Simulations

### 3.1 Authentication & Enumeration Simulation
- **Disabled Account Attack:** Verified that users with `status = 'inactive'` are blocked from authenticating even when supplying the correct password.
- **Token Invalidation on Logout:** Verified that when a user logs out, their Sanctum personal access token is immediately purged from the database, preventing replay attacks.
- **User Enumeration:** Verified that querying `/forgot-password` with non-existent emails returns the identical status envelope as existing emails without timing leaks.
- **Token Replay Attack:** Verified that resetting a password with an already-used token returns an invalid token error.

### 3.2 Authorization & Horizontal Privilege Escalation (IDOR)
- **Role Isolation:** Verified that a `content_manager` cannot access system settings or user directories (403 Forbidden).
- **Cross-Album / Cross-Case Traversal:** Verified that changing courtroom or gallery IDs in nested routes prevents modifying or downloading records belonging to other entities.
- **Admin Note Leakage:** Verified that admin-only internal consultation notes and lead IP addresses are never serialized in public API resources.

### 3.3 Injection & Malicious Payloads
- **Stored XSS:** Injected `<script>alert("pwned")</script>`, `<img src=x onerror=alert(1)>`, and `javascript:alert(1)`. Verified all malicious tags and event handlers are neutralized.
- **Open Redirect:** Injected `//evil-attacker.com/phish`, `/\evil.com`, and `\\evil.com`. Verified they are recognized as protocol-relative and rejected.
- **SQL Injection:** Injected `' OR '1'='1`, `'; DROP TABLE users; --`, and `UNION SELECT null, password FROM users`. Verified queries execute safely through parameterized PDO bindings with zero SQL syntax errors or data leaks.
- **Sorting Injection:** Injected `?sort=(SELECT+CASE+WHEN(1=1)+THEN+id+ELSE+name+END)`. Verified sort column is validated against an explicit whitelist.

### 3.4 File Upload & Binary Exploits
- **Webshell Uploads:** Uploaded `.php`, `.phtml`, `.phar`, `.sh`, `.exe`. All blocked.
- **Double Extension Bypass:** Uploaded `exploit.php.jpg`. Blocked via multi-segment inspection.
- **Path Traversal:** Filenames containing `../../exploit.jpg`. Blocked.
- **SVG XSS:** Uploaded valid SVG containing embedded script. Rejected.
- **Decompression Bombs:** Uploaded 2501x2501px image. Rejected before downstream processing.

---

## 4. Test Execution Instructions
Run the entire security suite directly:
```bash
php artisan test tests/Feature/Security
```
Or run individual test suites:
```bash
php artisan test tests/Feature/Security/AuthenticationSecurityTest.php
php artisan test tests/Feature/Security/AuthorizationAndRbacSecurityTest.php
php artisan test tests/Feature/Security/FileUploadAndMediaSecurityTest.php
php artisan test tests/Feature/Security/HeadersAndCorsSecurityTest.php
php artisan test tests/Feature/Security/IdorAndDataPrivacySecurityTest.php
php artisan test tests/Feature/Security/InjectionAndDefenseSecurityTest.php
```
