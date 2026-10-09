# 11 — Application Rollback Runbook
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Rollback Triggers & Decision Criteria
A rollback must be initiated immediately upon detection of any of the following conditions within 60 minutes of release:
1. Spike in HTTP 500 errors exceeding 1% of total API requests.
2. Failure of the React frontend SPA to hydrate on root or child routes.
3. Administrative authentication or authorization failures across core roles.
4. Data loss or corruption in case documents or client consultation inbox.

---

## 2. Instant Zero-Downtime Rollback Procedure

Because releases utilize symlinked directories (`/var/www/nijamuddin.com/releases/`), rolling back to the previous release takes under 5 seconds:

```bash
# 1. Identify previous release timestamp
PREVIOUS_RELEASE=$(ls -td /var/www/nijamuddin.com/releases/*/ | sed -n '2p')

# 2. Atomically point symlink back to previous release
ln -nfs "$PREVIOUS_RELEASE" /var/www/nijamuddin.com/current_new
mv -Tf /var/www/nijamuddin.com/current_new /var/www/nijamuddin.com/current

# 3. Reload PHP-FPM to flush OPcache bytecode
sudo systemctl reload php8.2-fpm

# 4. Flush and re-cache Laravel application configurations
cd /var/www/nijamuddin.com/current/backend
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Run post-rollback smoke verification
curl -I https://nijamuddin.com/api/v1/health
```

---

## 3. Database Migration Rollback Caveats
- If the failed release included backward-compatible additive migrations (e.g. adding a new nullable column or index), **do not roll back the database schema**, as the older release code simply ignores unused columns.
- If the failed release included destructive or incompatible schema changes, execute the database snapshot restore described in `10_BACKUP_RESTORE_RUNBOOK.md`.
