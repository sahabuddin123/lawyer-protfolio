# 04 — aaPanel Setup & Hostinger VPS Configuration Guide
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Control Panel:** aaPanel (Linux)  
**Web Server:** Nginx 1.22+ / PHP 8.2 / MySQL 8.0  

---

## 1. Prerequisites in aaPanel

Log into the aaPanel dashboard (`https://<VPS-IP>:8888`) and verify the following components:

### 1.1 App Store Installations:
- **Nginx 1.22+** (Running)
- **PHP 8.2** (Running with PHP-FPM)
- **MySQL 8.0** (Running)
- **Node.js Version Manager** (Install Node v20 LTS and NPM)
- **Composer** (Installed globally: `composer --version`)

### 1.2 PHP 8.2 Extensions & Limits:
In aaPanel -> **App Store** -> **PHP 8.2** -> **Install Extensions**:
- `fileinfo` (Required for server-side magic byte file verification)
- `intl` (Required for Unicode/Bangla string localization)
- `opcache` (Recommended for high performance)
- `redis` (Optional, if using Redis cache)

In **PHP 8.2** -> **Configuration**:
- `max_execution_time = 300`
- `memory_limit = 256M`
- `upload_max_filesize = 25M`
- `post_max_size = 30M`

---

## 2. MySQL Database Creation in aaPanel

In aaPanel -> **Databases** -> **Add Database**:
- **Database Name:** `nijam_mama_db`
- **Username:** `nijam_mama_db`
- **Password:** `<Generate strong 24+ character password>`
- **Character Set:** `utf8mb4`
- **Access Permission:** `Localhost (127.0.0.1)`

---

## 3. Website Creation in aaPanel

In aaPanel -> **Websites** -> **Add Site**:
- **Domain:** `nijamuddin.com`, `www.nijamuddin.com`
- **Root Directory:** `/www/wwwroot/nijamuddin.com`
- **PHP Version:** `PHP-82`
- **FTP:** Do not create
- **Database:** (Select the created `nijam_mama_db`)

After creation, navigate to **Site Settings** -> **SSL** -> **Let's Encrypt**:
- Select both `nijamuddin.com` and `www.nijamuddin.com`.
- Click **Apply** to generate and auto-renew the SSL certificate.
