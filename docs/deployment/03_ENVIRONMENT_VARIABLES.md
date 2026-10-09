# 03 — Production Environment Variables & Secrets Policy
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Secrets Management Rules
1. **Zero Production Secrets in Git:** No database passwords, encryption keys, or SMTP tokens may ever be committed to version control.
2. **Environment File Storage:** Production configuration lives exclusively at `/var/www/nijamuddin.com/shared/.env` with strict permissions:
   `chmod 600 /var/www/nijamuddin.com/shared/.env`
   `chown www-data:www-data /var/www/nijamuddin.com/shared/.env`
3. **No Secret Ingestion in Chat:** Placeholders are strictly used throughout all documentation.

---

## 2. Master Production Environment Reference (`.env`)

| Variable Name | Required Production Value | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `"Advocate Nijam Uddin Platform"` | Legal platform public name |
| `APP_ENV` | `production` | Enables production error suppression and security rules |
| `APP_KEY` | `base64:<32-byte-key>` | Generated via `php artisan key:generate --show` |
| `APP_DEBUG` | `false` | **CRITICAL:** Suppresses all stack traces and debug disclosure |
| `APP_URL` | `https://nijamuddin.com` | Base URL for signed URLs and canonical generation |
| `FRONTEND_URL` | `https://nijamuddin.com` | Base origin for SPA |
| `DB_CONNECTION` | `mysql` | Production database driver |
| `DB_HOST` | `127.0.0.1` | Local socket / localhost IP |
| `DB_PORT` | `3306` | Standard MySQL port |
| `DB_DATABASE` | `nijamuddin_prod` | Dedicated production database |
| `DB_USERNAME` | `nijamuddin_user` | Dedicated least-privilege database user |
| `DB_PASSWORD` | `<secure-generated-password>` | 32+ character random string |
| `SESSION_DRIVER` | `file` or `database` | Production session storage |
| `SESSION_LIFETIME`| `120` | Session expiry in minutes |
| `SESSION_SECURE_COOKIE` | `true` | Enforces HTTPS-only transmission for session cookies |
| `CORS_ALLOWED_ORIGINS` | `https://nijamuddin.com` | Restricts CORS to the primary production domain |
| `SANCTUM_STATEFUL_DOMAINS`| `nijamuddin.com` | Enables cookie authentication for first-party SPA |
| `MAIL_MAILER` | `smtp` | Mail driver for client consultation receipts |
| `MAIL_HOST` | `smtp.mailgun.org` (or SMTP provider) | Mail server host |
| `MAIL_PORT` | `587` | Standard STARTTLS port |
| `MAIL_ENCRYPTION` | `tls` | Enforced TLS transport for emails |
| `MAIL_FROM_ADDRESS` | `"chambers@nijamuddin.com"` | Legal chambers official email |
