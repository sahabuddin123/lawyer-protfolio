# 11 — Rollback & Emergency Recovery Runbook
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio Website  
**Server Target:** Hostinger VPS (Ubuntu 24.04 LTS / aaPanel / Nginx / MySQL)  
**Execution Context:** `/www/wwwroot/nijamuddin-deploy/repo` or via `deploy.sh`  

---

## 1. Rollback Architecture & Strategy

Our deployment architecture retains the 5 most recent timestamped releases in:
`/www/wwwroot/nijamuddin-deploy/releases/`

Live traffic is routed through the atomic symbolic link:
`/www/wwwroot/nijamuddin-deploy/current`

Because persistent storage (`.env`, `uploads`, `secure_docs`) resides in `/shared`, rolling back the application code **does not touch or delete user uploads, active session files, or database contents**.

---

## 2. Fast Automated Application Rollback

To instantly revert to the previous known-good release:

```bash
cd /www/wwwroot/nijamuddin-deploy/repo
./deploy.sh rollback
```

### What `deploy.sh rollback` does automatically:
1. Acquires deployment lock `/tmp/nijamuddin_deploy.lock`.
2. Identifies the previous directory in `/releases/` (chronologically second from top).
3. Atomically switches `/www/wwwroot/nijamuddin-deploy/current` to that previous release directory using `mv -Tf`.
4. Re-optimizes caches for the restored release (`config:cache`, `route:cache`, `view:cache`).
5. Reloads `php8.2-fpm` to invalidate OPcache bytecode.
6. Syncs corresponding frontend dist assets back to `/www/wwwroot/nijamuddin.com`.
7. Releases lock.

**Total execution time:** Less than 5 seconds.  
**Downtime:** Zero seconds.

---

## 3. Database Migration Policy During Rollback

### CRITICAL SAFETY RULE:
**Never automatically run `migrate:rollback` or reverse database migrations during an emergency application rollback.**

Why?
- Application releases are designed with **backward-compatible migrations** (e.g. adding nullable columns or new tables). The previous application code can continue functioning normally even if an extra column exists in MySQL.
- Automated `migrate:rollback` carries extreme risk of permanent data loss (dropping columns containing production data collected between deploy and rollback).

### Procedure for Database Corrections:
If a migration broke the schema or introduced a fatal constraint:
1. First, complete the application rollback above to restore the working UI/API.
2. Inspect the migration in question with the Database Specialist.
3. If necessary, write a forward migration or manually execute targeted SQL fixes after taking a verified database snapshot:
   ```bash
   mysqldump -u nijam_mama_db -p nijam_mama_db > /www/backup/pre_rollback_fix.sql
   ```

---

## 4. Post-Rollback Validation Checklist

Immediately after triggering a rollback:

1. **Verify Symlink Target:**
   ```bash
   ls -la /www/wwwroot/nijamuddin-deploy/current
   ```
2. **Execute Smoke Tests:**
   ```bash
   curl -I https://nijamuddin.com/
   curl -s https://nijamuddin.com/api/v1/health
   curl -I https://nijamuddin.com/about
   ```
3. **Inspect Application Error Logs:**
   ```bash
   tail -n 50 /www/wwwroot/nijamuddin-deploy/shared/storage/logs/laravel.log
   ```
4. **Inspect Nginx Error Logs:**
   ```bash
   tail -n 50 /www/wwwlogs/nijamuddin.com.error.log
   ```
5. **Notify Project Director:**
   Provide rollback timestamp, release ID restored, and initial root-cause analysis (RCA).
