# 06 — Laravel Backend Production Deployment & Optimization
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Production Deployment Sequence
When deploying the Laravel 11 application to the target production server, execute the following non-destructive sequence:

```bash
# 1. Navigate to release directory
cd /var/www/nijamuddin.com/releases/$(date +%Y%m%d%H%M%S)/backend

# 2. Install production dependencies only (no dev packages)
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 3. Link shared production environment file
ln -nfs /var/www/nijamuddin.com/shared/.env .env

# 4. Link shared storage directory
rm -rf storage
ln -nfs /var/www/nijamuddin.com/shared/storage storage

# 5. Create storage symlink for public uploads
php artisan storage:link

# 6. Run database migrations safely
php artisan migrate --force

# 7. Compile and cache framework configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 8. Restart PHP-FPM process pool to flush OPcache
sudo systemctl reload php8.2-fpm
```

---

## 2. Directory Permissions & Web Server Security
Only specific operational directories require write access by the web server user (`www-data`):

```bash
# Ensure secure permissions
sudo chown -R www-data:www-data /var/www/nijamuddin.com/shared/storage
sudo chown -R www-data:www-data /var/www/nijamuddin.com/shared/storage/framework/cache
sudo chown -R www-data:www-data /var/www/nijamuddin.com/shared/storage/framework/sessions
sudo chown -R www-data:www-data /var/www/nijamuddin.com/shared/storage/framework/views
sudo chown -R www-data:www-data /var/www/nijamuddin.com/shared/storage/logs

# Set directory permissions to 775 and files to 664
sudo find /var/www/nijamuddin.com/shared/storage -type d -exec chmod 775 {} \;
sudo find /var/www/nijamuddin.com/shared/storage -type f -exec chmod 664 {} \;

# Bootstrap cache write permissions
sudo chown -R www-data:www-data bootstrap/cache
sudo chmod -R 775 bootstrap/cache
```
Application code, controllers, and models remain read-only (`chmod 755` directories, `644` files) to prevent arbitrary code modification in the event of an application exploit.
