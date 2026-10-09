# 03 — Production Environment Setup (`.env` Configuration)
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Target File:** `/www/wwwroot/nijamuddin-deploy/shared/.env`  
**File Permissions:** `chmod 600` / `chown www:www`  

---

## 1. Production `.env` Setup on aaPanel Server

Create the persistent production configuration file under `/www/wwwroot/nijamuddin-deploy/shared/.env`:

```dotenv
# ==============================================================================
# ADVOCATE NIJAM UDDIN (HAQ) — PRODUCTION CONFIGURATION
# ==============================================================================

APP_NAME="Advocate Nijam Uddin Platform"
APP_ENV=production
APP_KEY=base64:GENERATE_ON_SERVER_VIA_ARTISAN_KEY_GENERATE
APP_DEBUG=false
APP_TIMEZONE=Asia/Dhaka
APP_URL=https://nijamuddin.com
FRONTEND_URL=https://nijamuddin.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US
SUPPORTED_LOCALES=en,bn

BCRYPT_ROUNDS=12

LOG_CHANNEL=daily
LOG_LEVEL=error
LOG_DEPRECATIONS_CHANNEL=null

# Database (MySQL via aaPanel)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nijam_mama_db
DB_USERNAME=nijam_mama_db
DB_PASSWORD=SET_YOUR_AAPANEL_DB_PASSWORD_HERE

# Sessions & Cookies
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Storage, Queues, Cache
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
CACHE_STORE=file

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=REPLACE_WITH_SMTP_USERNAME
MAIL_PASSWORD=REPLACE_WITH_SMTP_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="chambers@nijamuddin.com"
MAIL_FROM_NAME="${APP_NAME}"

# Security & CORS
CORS_ALLOWED_ORIGINS=https://nijamuddin.com,https://www.nijamuddin.com
SANCTUM_STATEFUL_DOMAINS=nijamuddin.com,www.nijamuddin.com
```

---

## 2. Generating the Production Application Key
On the server terminal, inside the release directory:
```bash
php artisan key:generate --show
```
Copy the resulting `base64:...` string and paste it into `/www/wwwroot/nijamuddin-deploy/shared/.env`.
Never change the `APP_KEY` after data is stored, as doing so invalidates encrypted database fields and active user sessions.
