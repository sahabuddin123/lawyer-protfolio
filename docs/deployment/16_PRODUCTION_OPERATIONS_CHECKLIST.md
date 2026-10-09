# 16 — Production Operations & Go-Live Checklist
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Pre-Flight Go-Live Gate

- [x] **Phase 19 Full QA Certified:** 307 tests pass (1,720 assertions), zero P0/P1 defects.
- [x] **Frontend Production Build Compiled:** `npm run build` succeeds cleanly in 2.79s.
- [x] **Environment Template Prepared:** `backend/.env.production.example` and `frontend/.env.example` ready.
- [x] **Nginx / Apache Configs Prepared:** VirtualHost templates ready with SSL and fastcgi directives.
- [x] **Disaster Recovery Prepared:** Database and media backup scripts tested and ready.
- [x] **Rollback Runbook Verified:** Atomic symlink rollback procedure documented.
- [ ] **Target Hosting Host Confirmed:** (Pending User / Project Director specification).
- [ ] **Production DNS Pointed:** (Pending User / DNS manager update).
- [ ] **Live SSL Certificate Issued:** (Pending target server DNS resolution).
- [ ] **Explicit Go-Live Authorization Granted:** (Pending Project Director sign-off).

---

## 2. Go-Live Execution Order (When Authorized)

```
[1. Verify Preconditions] ──► [2. Create DB Backup] ──► [3. Deploy Artifacts]
                                                               │
[6. Run Smoke Tests]     ◄── [5. Switch Symlink]    ◄── [4. Migrate DB & Cache]
```

1. Create target release directory `/var/www/nijamuddin.com/releases/<TIMESTAMP>`.
2. Extract or clone application code.
3. Build frontend or copy pre-built `dist/` directory.
4. Run `composer install --no-dev --optimize-autoloader`.
5. Link shared `/var/www/nijamuddin.com/shared/.env` to backend `.env`.
6. Link shared storage directory `/var/www/nijamuddin.com/shared/storage`.
7. Run `php artisan migrate --force`.
8. Seed initial system settings (`RolesAndPermissionsSeeder`, `CmsAndSettingsSeeder`).
9. Run `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache`.
10. Atomically switch `current` symlink to new release.
11. Reload PHP-FPM and Nginx (`systemctl reload php8.2-fpm nginx`).
12. Run `smoke-test.sh` and perform manual validation.

---

## 3. Post-Launch Handoff
- Configure daily backup cron jobs in `/etc/cron.daily/`.
- Ensure uptime monitoring monitors `https://nijamuddin.com/api/v1/health`.
- Schedule 30-day security review for HSTS Preload submission.
