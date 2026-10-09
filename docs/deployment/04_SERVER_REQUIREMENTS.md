# 04 — Production Server Requirements & OS Prerequisites
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Operating System & Hardware Baseline

| Category | Recommended Production Specification | Minimum Operational Baseline |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04 LTS / 24.04 LTS x86_64 | Debian 12 / AlmaLinux 9 |
| **CPU** | 2 vCPU cores | 1 vCPU core |
| **RAM** | 4 GB ECC RAM (allows OPcache & build pipelines) | 2 GB RAM + 2GB swap |
| **Disk Space** | 40 GB NVMe SSD | 20 GB SSD |
| **Network** | 1 Gbps port, static IPv4 + IPv6 | 100 Mbps port, static IPv4 |

---

## 2. Software Packages & Runtime Versions

### 2.1 PHP Runtime & Required Extensions
- **PHP Version:** PHP 8.2 (or PHP 8.3)
- **Required Extensions:**
  - `php8.2-fpm` (FastCGI process manager)
  - `php8.2-mysql` (PDO MySQL driver)
  - `php8.2-mbstring` (Multibyte string support for English & Bangla)
  - `php8.2-xml` (DOM, XML, SimpleXML for sitemaps)
  - `php8.2-curl` (HTTP client library)
  - `php8.2-gd` (Image resizing, WebP/AVIF generation)
  - `php8.2-zip` (Document and archive handling)
  - `php8.2-bcmath` (Arbitrary precision mathematics)
  - `php8.2-intl` (Internationalization and Unicode collation)
  - `php8.2-opcache` (Bytecode caching for high throughput)

### 2.2 Database Server
- **MySQL:** MySQL 8.0.30+ (or MariaDB 10.11 LTS)
- **Character Set:** `utf8mb4`
- **Collation:** `utf8mb4_unicode_ci`

### 2.3 Web Server & Utilities
- **Web Server:** Nginx 1.22+ (or Apache 2.4 with mod_rewrite & mod_proxy_fcgi)
- **SSL / TLS:** Certbot / Let's Encrypt automated client
- **Process Supervision:** Systemd (or Supervisor for queue workers)
- **Node.js:** Node 20 LTS (required only if building assets directly on the server)
