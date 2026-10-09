# 12 — Production Security Hardening & Pre-Flight Checklist
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio Website  
**Repository Visibility:** Public (`https://github.com/sahabuddin123/lawyer-protfolio`)  
**Production Domain:** `nijamuddin.com` / `www.nijamuddin.com`  
**Host Environment:** Hostinger VPS / Ubuntu 24.04 LTS / aaPanel / Nginx / MySQL  

---

## 1. Public GitHub Repository Hygiene Checklist

Because the repository is public on GitHub, all team members and scripts must adhere to strict zero-leakage standards:

- [x] **No `.env` or credentials committed:** Root `.gitignore` strictly excludes `.env`, `.env.*` (except approved `.env.example`).
- [x] **No SQLite or database dumps committed:** `.gitignore` excludes `*.sqlite`, `*.sqlite3`, `*.sql`, `*.sql.gz`, `*.dump`, `*.backup`.
- [x] **No build artifacts or vendor trees:** `.gitignore` excludes `/backend/vendor/`, `/frontend/node_modules/`, `/frontend/dist/`.
- [x] **No private documents or uploaded media:** Storage files (`storage/app/secure_docs/*`, `storage/logs/*`) are excluded.
- [x] **No hardcoded secrets in code:** Audited codebase contains zero hardcoded API keys, JWT secrets, database passwords, or private encryption keys.

---

## 2. Server Filesystem Permissions & Access Control

Enforce strict POSIX permission boundaries on the server:

| Path | Owner:Group | Mode | Rationale |
|---|---|---|---|
| `/www/wwwroot/nijamuddin-deploy/shared/.env` | `www:www` | `600` | Read/write strictly by Nginx/PHP-FPM worker; unreadable to others |
| `/www/wwwroot/nijamuddin-deploy/shared/storage` | `www:www` | `775` | Required for Laravel application write access |
| `/www/wwwroot/nijamuddin-deploy/shared/storage/app/secure_docs` | `www:www` | `700` | Confidential client case files; inaccessible via web server |
| `/www/backup/` | `root:root` | `700` | Backup archive restricted exclusively to system root |
| `/www/wwwroot/nijamuddin.com` | `www:www` | `755` | Static HTML/CSS/JS delivery web root |

Execute command:
```bash
chmod 600 /www/wwwroot/nijamuddin-deploy/shared/.env
chmod -R 775 /www/wwwroot/nijamuddin-deploy/shared/storage
chmod -R 700 /www/wwwroot/nijamuddin-deploy/shared/storage/app/secure_docs
chmod -R 700 /www/backup
```

---

## 3. Production Application Hardening (`.env`)

Verify the following production settings in `/www/wwwroot/nijamuddin-deploy/shared/.env`:

- [x] `APP_ENV=production`
- [x] `APP_DEBUG=false` (CRITICAL: Never reveal stack traces, SQL queries, or file paths)
- [x] `APP_KEY` contains a valid 32-character base64 encryption key.
- [x] `SESSION_SECURE_COOKIE=true` (Enforces HTTPS-only cookies).
- [x] `SESSION_HTTP_ONLY=true` (Prevents client-side JavaScript from accessing cookies).
- [x] `SESSION_SAME_SITE=lax`
- [x] `SANCTUM_STATEFUL_DOMAINS=nijamuddin.com,www.nijamuddin.com`

---

## 4. Nginx Web Server Security Rules

Verify that the active Nginx configuration contains the following protection directives:

```nginx
# 1. Deny access to sensitive files and directories
location ~ /\.(env|git|htaccess|user\.ini|svn) {
    deny all;
    return 404;
}

# 2. Deny access to private storage, logs, and backups
location ~ ^/(storage/app/secure_docs|storage/logs|\.backup|\.sql|\.sqlite) {
    deny all;
    return 404;
}

# 3. Disable directory listing
autoindex off;

# 4. Mandatory Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://nijamuddin.com;" always;
```

---

## 5. Network, Firewall & Port Lockdown

Configure host firewall (via aaPanel Security panel or `ufw`):

- **Port 80 (HTTP):** Open (redirected to HTTPS).
- **Port 443 (HTTPS):** Open.
- **Port 22 (SSH):** Restricted by IP or protected with key-based authentication.
- **Port 3306 (MySQL):** Bound strictly to `127.0.0.1`. Never expose MySQL port 3306 to public IP.
- **Port 8888 (aaPanel):** Protected by custom port, security entrance key, and IP allowlist.
