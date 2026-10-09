# 13 — Cache, Queue & Scheduler Production Configuration
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Application Cache Management

### 1.1 Cache Driver Selection
- **Driver:** `file` (Default on single-server VPS) or `redis` (if Redis cluster available).
- **Directory:** `/var/www/nijamuddin.com/shared/storage/framework/cache/data`.

### 1.2 Cache Warmup & Invalidation Commands
During release deployment:
```bash
# Clear any stale application cache
php artisan cache:clear

# Optimize framework configuration & routing
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 2. Queue Configuration (Supervisor)

For asynchronous processing of client email notifications or media transcoding:

Create `/etc/supervisor/conf.d/nijamuddin-worker.conf`:
```ini
[program:nijamuddin-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/nijamuddin.com/current/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/nijamuddin.com/shared/storage/logs/worker.log
stopwaitsecs=3600
```

Deploying updates to queue workers:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart nijamuddin-worker:*
```

---

## 3. Scheduled Tasks (Cron)

Configure Laravel's schedule runner under the `www-data` user crontab:
```bash
# Edit www-data crontab
sudo crontab -u www-data -e

# Add schedule entry (runs every minute)
* * * * * cd /var/www/nijamuddin.com/current/backend && php artisan schedule:run >> /dev/null 2>&1
```
This powers automated tasks including:
- Purging expired Sanctum password reset tokens.
- Updating sitemap XML timestamps.
- Archiving expired client consultation slots.
