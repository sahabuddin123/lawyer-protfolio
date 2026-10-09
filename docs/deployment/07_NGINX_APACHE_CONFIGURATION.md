# 07 — Web Server Configurations (Nginx & Apache)
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Production Nginx Virtual Host Configuration

Save to `/etc/nginx/sites-available/nijamuddin.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name nijamuddin.com www.nijamuddin.com;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nijamuddin.com www.nijamuddin.com;

    # SSL Certificates managed via Certbot
    ssl_certificate /etc/letsencrypt/live/nijamuddin.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nijamuddin.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Root pointing to React Frontend Build
    root /var/www/nijamuddin.com/current/frontend/dist;
    index index.html;

    # Upload size limits for legal documents and high-res media
    client_max_body_size 25M;

    # Security: Deny access to hidden files (.env, .git, etc.)
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Static Assets with Immutable Cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Public Media Uploads
    location /storage/ {
        alias /var/www/nijamuddin.com/shared/storage/app/public/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    # Backend API & Sanctum Routing -> Laravel Public Root
    location ~ ^/(api|sanctum) {
        root /var/www/nijamuddin.com/current/backend/public;
        try_files $uri $uri/ /index.php?$query_string;

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/nijamuddin.com/current/backend/public/index.php;
            include fastcgi_params;
        }
    }

    # Frontend Single-Page App (SPA) Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Custom Error Pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
}
```

---

## 2. Production Apache Configuration (`.htaccess` / VirtualHost)

For environments running Apache 2.4 with `mod_rewrite` and `mod_proxy_fcgi`:

```apache
<VirtualHost *:443>
    ServerName nijamuddin.com
    ServerAlias www.nijamuddin.com
    DocumentRoot /var/www/nijamuddin.com/current/frontend/dist

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/nijamuddin.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/nijamuddin.com/privkey.pem

    # Proxy API requests to Laravel
    Alias /api /var/www/nijamuddin.com/current/backend/public/index.php
    Alias /storage /var/www/nijamuddin.com/shared/storage/app/public

    <Directory /var/www/nijamuddin.com/current/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted

        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [L]
    </Directory>

    <Directory /var/www/nijamuddin.com/current/backend/public>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted

        <FilesMatch \.php$>
            SetHandler "proxy:unix:/var/run/php/php8.2-fpm.sock|fcgi://localhost"
        </FilesMatch>
    </Directory>
</VirtualHost>
```
