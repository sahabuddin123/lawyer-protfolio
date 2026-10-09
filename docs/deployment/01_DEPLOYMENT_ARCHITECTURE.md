# 01 — Deployment Architecture & Hostinger aaPanel Topology
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Target Environment:** Hostinger VPS / Ubuntu 24.04 LTS / aaPanel / Nginx / MySQL  
**Repository:** `https://github.com/sahabuddin123/lawyer-protfolio` (Public)  
**Domains:** `nijamuddin.com`, `www.nijamuddin.com`  

---

## 1. Production Architecture Overview

The production system on the Hostinger VPS uses aaPanel to manage the Linux environment, Nginx web server, and MySQL database engine.

```
                          [ Client Browser ]
                                  │
                                  ▼ (HTTPS: 443)
              +───────────────────────────────────────+
              |           NGINX (aaPanel)             |
              |   SSL: Let's Encrypt / Certbot        |
              +───────────────────────────────────────+
                     │                         │
     (SPA & Static Assets)             (API Requests)
     / , /about , /assets/*            /api/* , /sanctum/*
                     │                         │
                     ▼                         ▼
        +────────────────────────+   +────────────────────────+
        |    REACT / VITE SPA    |   |     LARAVEL 11 API     |
        |  /www/wwwroot/         |   |  PHP-FPM 8.2           |
        |  nijamuddin-deploy/    |   |  (enable-php-82.conf)  |
        |  current/frontend/dist |   |  .../backend/public    |
        +────────────────────────+   +────────────────────────+
                                                │
                                                ▼
                                     [ MySQL: nijam_mama_db ]
                                     - Host: 127.0.0.1:3306
                                     - User: nijam_mama_db
```

---

## 2. Directory Layout & Isolation

To keep application source code, Git metadata, vendor libraries, and private documents outside the public web root, deployments are isolated under `/www/wwwroot/nijamuddin-deploy`:

```text
/www/wwwroot/
├── nijamuddin.com/              <-- aaPanel Website Root (contains .user.ini, .well-known, ssl certs)
│   ├── index.html               <-- Synced from current release
│   └── assets/                  <-- Synced from current release
│
└── nijamuddin-deploy/           <-- Isolated Deployment Root (OUTSIDE PUBLIC ACCESS)
    ├── shared/
    │   ├── .env                 <-- Persistent production environment file (chmod 600)
    │   └── storage/             <-- Persistent uploads, logs, and private documents
    │       ├── app/public/      <-- Public photos, portraits, press assets
    │       ├── app/secure_docs/ <-- Confidential case documents (NOT symlinked to web root)
    │       └── logs/            <-- Daily rotating logs
    ├── releases/
    │   ├── 20261009170000/
    │   └── 20261009180000/
    ├── current -> releases/20261009180000/
    └── deployment-logs/
```

---

## 3. Same-Domain `/api` Routing Principle
- Frontend client sends requests to relative `/api/v1/...` (e.g. `/api/v1/home`).
- Nginx routes all `/api` requests to `/www/wwwroot/nijamuddin-deploy/current/backend/public/index.php`.
- Eliminates CORS issues, avoids cross-origin preflight requests, and maintains single SSL certificate management for both frontend and backend.
