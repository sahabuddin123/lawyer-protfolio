# Security Incident Response & Audit Runbook

## 1. Overview
This runbook defines standard operating procedures for detecting, containing, analyzing, and recovering from potential security events affecting the Advocate Nijam Uddin platform.

---

## 2. Incident Classification & Severity Levels

| Severity | Definition | Examples | Response Target |
| :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Active compromise, unauthorized data exfiltration, RCE, or admin takeover | Database dump leaked, admin account compromised, malicious file executed | Immediate (< 1 hour) |
| **SEV-2 (High)** | Exploitable vulnerability discovered without confirmed exploitation | Authorization flaw exposed, rate limiter bypass detected | < 4 hours |
| **SEV-3 (Medium)** | Flaw requiring high privileges or complex preconditions | Minor information disclosure, non-sensitive config leak | < 24 hours |
| **SEV-4 (Low)** | Informational or low-risk anomaly | Spam bot form flooding, minor header mismatch | < 72 hours |

---

## 3. Incident Response Workflow

```
[1. Detection & Alerting] ──► [2. Initial Triage] ──► [3. Containment]
                                                               │
[6. Post-Mortem & Docs]   ◄── [5. Recovery & Patch] ◄── [4. Eradication & Analysis]
```

### 3.1 Step 1: Detection & Alerting
- Monitor Laravel error logs: `storage/logs/laravel.log`.
- Monitor Web server access/error logs (Apache/Nginx).
- Key telemetry signals:
  - Spike in `429 Too Many Requests` (brute force attempt).
  - Spike in `401 Unauthorized` or `403 Forbidden` (privilege scanning).
  - Unhandled 500 errors containing SQL or file-path anomalies.

### 3.2 Step 2: Containment Procedures
If an active threat is identified:
1. **Revoke Compromised User Sessions:**
   ```bash
   php artisan tinker
   >>> \App\Models\User::where('email', 'compromised@domain.com')->first()->tokens()->delete();
   ```
2. **Deactivate User Account:**
   ```bash
   >>> \App\Models\User::where('email', 'compromised@domain.com')->update(['status' => 'inactive']);
   ```
3. **Lock Down Maintenance Mode (if critical):**
   ```bash
   php artisan down --secret="emergency-admin-access-token"
   ```

### 3.3 Step 3: Eradication & Token Invalidation
1. **Rotate Application Secrets (Phase 20 Runbook):**
   - Regenerate `APP_KEY` if key compromise is suspected: `php artisan key:generate`.
   - Rotate database password and update `.env`.
   - Invalidate all active Sanctum tokens across the system:
     ```bash
     php artisan tinker
     >>> \Laravel\Sanctum\PersonalAccessToken::truncate();
     ```
2. **Purge Malicious Uploads:**
   - Inspect `storage/app/public/media/` and `storage/app/secure_docs/` for newly created files matching anomaly timestamps.
   - Remove corrupted records from `media` database table.

### 3.4 Step 4: Recovery & Verification
1. Re-run complete security test suite:
   ```bash
   php artisan test tests/Feature/Security
   ```
2. Bring application back online:
   ```bash
   php artisan up
   ```

---

## 4. Audit Logging Architecture
- All administrative CRUD actions and authentication attempts are logged via `activity_log` or dedicated security log channels.
- Logs NEVER capture plain-text passwords, session keys, reset tokens, or confidential legal message contents.
- Audit logs are accessible strictly to `super_admin` roles.
