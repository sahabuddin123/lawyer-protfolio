# 12 — Media & Secure Document Storage Deployment
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Storage Disks & Permissions Layout

```
/var/www/nijamuddin.com/shared/storage/
├── app/
│   ├── public/                 <-- Symlinked to public/storage (Photos, Avatars, Press)
│   │   └── media/
│   │       ├── YYYY/MM/
│   │       └── documents/
│   └── secure_docs/            <-- OUTSIDE WEB ROOT (Confidential Case Documents)
│       └── case_documents/
├── framework/
│   ├── cache/
│   ├── sessions/
│   └── views/
└── logs/
    └── laravel.log
```

---

## 2. Public Storage Symlink Verification
In the Laravel backend directory:
```bash
php artisan storage:link
```
This creates:
`/var/www/nijamuddin.com/current/backend/public/storage -> /var/www/nijamuddin.com/shared/storage/app/public`

Nginx is configured to serve this alias directly:
```nginx
location /storage/ {
    alias /var/www/nijamuddin.com/shared/storage/app/public/;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
}
```

---

## 3. Confidential Document Isolation
- Confidential courtroom files and legal submissions are saved exclusively under the `secure` disk (`storage/app/secure_docs/`).
- Because this folder has no symlink and no Nginx `location` directive, direct web access via URL manipulation is impossible.
- File streaming is handled exclusively by `AdminCourtroomController::downloadDocument()` after checking policy permissions and sanitizing the `Content-Disposition` header.
