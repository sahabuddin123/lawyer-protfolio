# 13 — Production Operations & Troubleshooting Guide
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio Website  
**Server Target:** Hostinger VPS (aaPanel / Ubuntu 24.04 LTS / Nginx / PHP 8.2 / MySQL)  

---

## 1. Top Diagnostic Commands

When investigating any anomaly, run these first:

```bash
# 1. Check PHP 8.2 FPM service status
systemctl status php-fpm-82 || systemctl status php8.2-fpm

# 2. Check Nginx syntax and status
nginx -t
systemctl status nginx

# 3. Check live Laravel logs
tail -n 100 -f /www/wwwroot/nijamuddin-deploy/shared/storage/logs/laravel.log

# 4. Check Nginx error logs
tail -n 100 -f /www/wwwlogs/nijamuddin.com.error.log

# 5. Check deployment logs
tail -n 100 -f /www/wwwroot/nijamuddin-deploy/deployment-logs/*.log
```

---

## 2. Common Issues & Solutions

### Issue 1: `502 Bad Gateway` on `/api/*` Requests
- **Cause 1: PHP-FPM service is down.**
  - **Fix:** Restart PHP 8.2 service via aaPanel or command line:
    ```bash
    /etc/init.d/php-fpm-82 restart
    # or
    systemctl restart php8.2-fpm
    ```
- **Cause 2: Socket path mismatch.**
  - **Check:** Verify socket in `/www/server/panel/vhost/nginx/nijamuddin.com.conf`. aaPanel default is `unix:/tmp/php-cgi-82.sock`.
  - **Verify socket exists:**
    ```bash
    ls -l /tmp/php-cgi-82.sock
    ```

---

### Issue 2: `404 Not Found` when refreshing React routes (e.g. `/about`, `/practice-areas`)
- **Cause:** Nginx does not route unmatched requests back to the React SPA entry point `index.html`.
- **Fix:** Ensure the root location directive includes `try_files`:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
  Reload Nginx: `nginx -s reload`.

---

### Issue 3: aaPanel `open_basedir` Restriction Errors in Laravel
- **Symptoms:** PHP error in logs: `open_basedir restriction in effect. File(...) is not within the allowed path(s)`.
- **Cause:** aaPanel creates a `.user.ini` file that restricts PHP execution to `/www/wwwroot/nijamuddin.com`. However, Laravel runs from `/www/wwwroot/nijamuddin-deploy/current/backend`.
- **Fix:**
  1. Remove immutable attribute on `.user.ini`:
     ```bash
     chattr -i /www/wwwroot/nijamuddin.com/.user.ini || true
     rm -f /www/wwwroot/nijamuddin.com/.user.ini
     ```
  2. Disable `open_basedir` for `nijamuddin.com` inside aaPanel Web > Site Settings > Site Directory, OR update `.user.ini` to allow `/www/wwwroot/`:
     ```ini
     open_basedir=/www/wwwroot/:/tmp/
     ```

---

### Issue 4: `Permission Denied` in Laravel `storage/` or `bootstrap/cache`
- **Cause:** Web server worker (`www`) does not have write permissions to storage.
- **Fix:**
  ```bash
  chown -R www:www /www/wwwroot/nijamuddin-deploy/shared/storage
  chmod -R 775 /www/wwwroot/nijamuddin-deploy/shared/storage
  chown -R www:www /www/wwwroot/nijamuddin-deploy/current/backend/bootstrap/cache
  chmod -R 775 /www/wwwroot/nijamuddin-deploy/current/backend/bootstrap/cache
  ```

---

### Issue 5: Stuck Deployment Lock (`/tmp/nijamuddin_deploy.lock`)
- **Symptoms:** Running `./deploy.sh` prints: `Deployment lock exists at /tmp/nijamuddin_deploy.lock`.
- **Cause:** A previous deployment process was aborted abnormally (e.g. SSH disconnection or OOM killer).
- **Fix:**
  1. Verify no active deployment process is running:
     ```bash
     ps aux | grep deploy.sh
     ```
  2. Remove the stale lock file:
     ```bash
     rm -f /tmp/nijamuddin_deploy.lock
     ```

---

### Issue 6: MySQL Connection Refused or Access Denied (`nijam_mama_db`)
- **Symptoms:** `SQLSTATE[HY000] [2002] Connection refused` or `[1045] Access denied for user 'nijam_mama_db'`.
- **Fix:**
  1. Verify MySQL service is running:
     ```bash
     /etc/init.d/mysqld status || systemctl status mysql
     ```
  2. Test credentials from the CLI:
     ```bash
     mysql -h 127.0.0.1 -u nijam_mama_db -p
     ```
  3. Ensure credentials in `/www/wwwroot/nijamuddin-deploy/shared/.env` match the aaPanel database user settings.
  4. Clear Laravel config cache:
     ```bash
     cd /www/wwwroot/nijamuddin-deploy/current/backend
     php artisan config:clear
     ```

---

### Issue 7: Vite Build Out-Of-Memory (OOM) on Small VPS Instances
- **Symptoms:** `npm run build` exits with code 137 (killed by Linux OOM killer).
- **Fix:** Add a Linux swap file or increase Node.js memory limit:
  ```bash
  # Check swap
  free -m

  # If swap is 0, create a 2GB swap file
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile

  # Or build with Node max old space
  NODE_OPTIONS="--max-old-space-size=1536" npm run build
  ```
