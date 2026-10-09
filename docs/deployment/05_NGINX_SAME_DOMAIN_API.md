# 05 — Nginx Same-Domain `/api` Configuration in aaPanel
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Target Configuration:** aaPanel Website -> `nijamuddin.com` -> Configuration File  
**PHP Include:** `enable-php-82.conf`  

---

## 1. Nginx Routing Requirements
1. **Frontend SPA:** Root requests (`/`, `/about`, `/practice-areas`, etc.) must serve the compiled React app (`index.html`) with client-side SPA routing fallback.
2. **Backend API:** All requests to `/api/*` and `/sanctum/*` must route to Laravel's entrypoint `/www/wwwroot/nijamuddin-deploy/current/backend/public/index.php`.
3. **Public Storage:** All requests to `/storage/*` must serve uploaded assets directly from `/www/wwwroot/nijamuddin-deploy/shared/storage/app/public/`.
4. **Security:** Prohibit access to `.env`, `.git`, `.user.ini`, and private directories.
5. **Preserve aaPanel Includes:** Keep aaPanel SSL certificates, logs, and redirect directives intact.

---

## 2. Merged Nginx Configuration Snippet for aaPanel

Open aaPanel -> **Websites** -> `nijamuddin.com` -> **Configuration File**.
Update the server block to the following configuration:

```nginx
server
{
    listen 80;
    listen [::]:80;
    server_name nijamuddin.com www.nijamuddin.com;
    index index.html index.php;
    root /www/wwwroot/nijamuddin-deploy/current/frontend/dist;

    # SSL-START aaPanel Managed SSL Configuration (Preserve existing paths)
    # <aaPanel automatically manages ssl_certificate directives here>
    # SSL-END

    # ERROR-PAGE-START
    error_page 404 /index.html;
    # ERROR-PAGE-END

    # Upload size limit
    client_max_body_size 25M;

    # 1. Deny access to sensitive hidden files
    location ~ /\.(?!well-known).* {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 2. Public Storage Uploads
    location /storage/ {
        alias /www/wwwroot/nijamuddin-deploy/shared/storage/app/public/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    # 3. Static Assets (CSS, JS, Fonts, Images with content hashing)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # 4. Backend Laravel REST API & Sanctum
    location ~ ^/(api|sanctum) {
        root /www/wwwroot/nijamuddin-deploy/current/backend/public;
        try_files $uri $uri/ /index.php?$query_string;

        location ~ \.php$ {
            fastcgi_pass unix:/tmp/php-cgi-82.sock;
            fastcgi_index index.php;
            include fastcgi.conf;
            fastcgi_param SCRIPT_FILENAME /www/wwwroot/nijamuddin-deploy/current/backend/public/index.php;
            include fastcgi_params;
        }
    }

    # 5. Frontend React SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    access_log  /www/wwwlogs/nijamuddin.com.log;
    error_log  /www/wwwlogs/nijamuddin.com.error.log;
}
```

---

## 3. Testing and Reloading Nginx
In the aaPanel terminal:
```bash
nginx -t
sudo systemctl reload nginx
```
If `nginx -t` reports `syntax is ok`, the configuration is verified.
