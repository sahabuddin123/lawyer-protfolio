# 07 — Initial Server Setup & First Deployment Runbook
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio & Legal Authority Website  
**Server Target:** Hostinger VPS (Ubuntu 24.04 LTS / aaPanel / Nginx / MySQL)  
**Public Domain:** `nijamuddin.com` / `www.nijamuddin.com`  
**aaPanel Existing Root:** `/www/wwwroot/nijamuddin.com`  
**Deployment Workspace:** `/www/wwwroot/nijamuddin-deploy`  

---

## 1. Pre-Deployment Server Prerequisites Verification

Before executing any commands, log into the server via SSH and inspect the runtime environment:

```bash
# 1. Verify OS version
lsb_release -a

# 2. Verify PHP, Node.js, Composer versions
php -v            # Required: PHP 8.2+
composer -V       # Required: Composer 2.x
node -v           # Required: Node.js 18.x or 20.x+
npm -v            # Required: npm 9.x+
git --version     # Required: git 2.30+

# 3. Check PHP extensions for aaPanel PHP 8.2
php -m | grep -E "pdo_mysql|mbstring|xml|curl|gd|zip|bcmath|intl"
```

If aaPanel's PHP binary is not in global PATH, create a symlink or adjust PATH:
```bash
ln -sf /www/server/php/82/bin/php /usr/bin/php
ln -sf /www/server/php/82/bin/composer /usr/bin/composer
```

---

## 2. Directory Isolation Architecture Setup

**CRITICAL RULE:** Do NOT clone the repository into `/www/wwwroot/nijamuddin.com`. That directory is managed by aaPanel for public web delivery.

1. Verify destination does not already exist:
   ```bash
   ls -ld /www/wwwroot/nijamuddin-deploy
   ```
2. Create base deployment directories:
   ```bash
   mkdir -p /www/wwwroot/nijamuddin-deploy/shared/storage/app/public
   mkdir -p /www/wwwroot/nijamuddin-deploy/shared/storage/app/secure_docs
   mkdir -p /www/wwwroot/nijamuddin-deploy/shared/storage/framework/{cache,sessions,views}
   mkdir -p /www/wwwroot/nijamuddin-deploy/shared/storage/logs
   mkdir -p /www/wwwroot/nijamuddin-deploy/releases
   mkdir -p /www/wwwroot/nijamuddin-deploy/deployment-logs
   ```
3. Set secure permissions:
   ```bash
   chown -R www:www /www/wwwroot/nijamuddin-deploy
   chmod -R 775 /www/wwwroot/nijamuddin-deploy/shared/storage
   ```

---

## 3. Cloning the Approved Repository

Clone into `/www/wwwroot/nijamuddin-deploy/repo`:

```bash
cd /www/wwwroot/nijamuddin-deploy

git clone https://github.com/sahabuddin123/lawyer-protfolio.git repo

cd repo
git checkout main
git status --short
```

---

## 4. Production Environment Configuration (`.env`)

Create the shared production environment file:
```bash
cp /www/wwwroot/nijamuddin-deploy/repo/.env.example /www/wwwroot/nijamuddin-deploy/shared/.env
chmod 600 /www/wwwroot/nijamuddin-deploy/shared/.env
chown www:www /www/wwwroot/nijamuddin-deploy/shared/.env
```

Edit `/www/wwwroot/nijamuddin-deploy/shared/.env` with your secure server values:
```dotenv
APP_NAME="Advocate Nijam Uddin"
APP_ENV=production
APP_KEY=base64:ePj24N8...   # Generate or preserve existing key
APP_DEBUG=false
APP_URL=https://nijamuddin.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nijam_mama_db
DB_USERNAME=nijam_mama_db
DB_PASSWORD=<SET_STRONG_PASSWORD_HERE>

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=file

SANCTUM_STATEFUL_DOMAINS=nijamuddin.com,www.nijamuddin.com
SESSION_DOMAIN=.nijamuddin.com
```

Generate `APP_KEY` if not already generated:
```bash
php /www/wwwroot/nijamuddin-deploy/repo/backend/artisan key:generate --show
# Copy the output into APP_KEY in /www/wwwroot/nijamuddin-deploy/shared/.env
```

---

## 5. MySQL Database & Schema Verification

Verify connection to MySQL `nijam_mama_db`:
```bash
mysql -u nijam_mama_db -p -e "SHOW TABLES IN nijam_mama_db;"
```

Ensure the user has complete DDL and DML privileges (`CREATE`, `ALTER`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `INDEX`, `REFERENCES`).

---

## 6. Execution: `./deploy.sh check` and `./deploy.sh build`

From the cloned repository directory:
```bash
cd /www/wwwroot/nijamuddin-deploy/repo
chmod +x deploy.sh

# 1. Run environment check
./deploy.sh check

# 2. Run release build
./deploy.sh build
```

This compiles the React frontend (`npm run build`) and installs Laravel dependencies (`composer install --no-dev`).  
**At this stage, the live website is not yet modified.**

---

## 7. Pre-Activation Authorization Checkpoint

Before proceeding to live release activation, verify all checklist items:

- [ ] `.env` created in `/www/wwwroot/nijamuddin-deploy/shared/.env` with `APP_DEBUG=false`.
- [ ] MySQL `nijam_mama_db` database connection confirmed.
- [ ] Storage permissions verified (`www:www`, `775`).
- [ ] Nginx configuration updated per `05_NGINX_SAME_DOMAIN_API.md` and syntax tested (`nginx -t`).
- [ ] SSL certificate active on `nijamuddin.com` and `www.nijamuddin.com`.
- [ ] Project Director explicit approval received.

---

## 8. Live Release Activation

Once explicitly authorized, execute:

```bash
cd /www/wwwroot/nijamuddin-deploy/repo
DEPLOY_APPROVED=true ./deploy.sh deploy
```

### Initial Post-Deployment Seeding (First Deploy Only)
After the first migration runs, seed default roles and settings:
```bash
cd /www/wwwroot/nijamuddin-deploy/current/backend
php artisan db:seed --class=RolesAndPermissionsSeeder --force
php artisan db:seed --class=CmsAndSettingsSeeder --force
```

---

## 9. Verification & Smoke Testing

Execute health and smoke checks:
```bash
# Verify SPA index
curl -I https://nijamuddin.com/

# Verify API health
curl -s https://nijamuddin.com/api/v1/health | grep "status"

# Verify nested SPA route refresh
curl -I https://nijamuddin.com/about
```
All endpoints should return HTTP 200.
