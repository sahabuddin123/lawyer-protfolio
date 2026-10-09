# 02 — Production Deployment Architecture & Topology
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Production Topology & Component Architecture

```
                                  [ INTERNET ]
                                       │
                                       ▼ (HTTPS : 443 / HTTP : 80 -> 301 Redirect)
               +──────────────────────────────────────────────────+
               |             NGINX REVERSE PROXY / WEB SERVER     |
               |             (TLS Termination via Let's Encrypt)  |
               +──────────────────────────────────────────────────+
                        │                                  │
         (Static / SPA Requests)                 (Dynamic API Requests)
         / , /about , /assets/*                  /api/v1/* , /sanctum/*
                        │                                  │
                        ▼                                  ▼
         +────────────────────────────+          +─────────────────────────────+
         |     REACT / VITE SPA       |          |      LARAVEL 11 REST API    |
         |  (Precompiled Static Dist) |          |      (PHP-FPM 8.2 Engine)   |
         |  /var/www/nijamuddin/dist  |          |   /var/www/nijamuddin/backend|
         +────────────────────────────+          +─────────────────────────────+
                                                        │              │
                                                        ▼              ▼
                                                [ MySQL 8.0 ]    [ FILE SYSTEM ]
                                                - utf8mb4        - Public Media
                                                - Strict SQL     - Secure Docs
```

---

## 2. Directory Hierarchy & Release Layout
To enable zero-downtime atomic rollbacks, the release structure employs symlinked deployment directories:

```
/var/www/nijamuddin.com/
├── current -> releases/20261009180000/
├── shared/
│   ├── .env
│   ├── storage/
│   │   ├── app/
│   │   │   ├── public/
│   │   │   └── secure_docs/
│   │   ├── framework/
│   │   │   ├── cache/
│   │   │   ├── sessions/
│   │   │   └── views/
│   │   └── logs/
└── releases/
    ├── 20261009170000/
    └── 20261009180000/
        ├── backend/
        └── frontend/dist/
```

---

## 3. Storage Separation & Isolation
1. **Public Media (`/storage/`):** Symlinked to `shared/storage/app/public/`. Served directly by Nginx with aggressive caching (`Cache-Control: public, max-age=31536000, immutable`).
2. **Confidential Case Documents (`secure_docs`):** Stored in `shared/storage/app/secure_docs/` outside the web document root. Zero direct web access; served exclusively via authenticated controller streams.
