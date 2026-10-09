# 08 — Domain, DNS Configuration & HTTPS Setup
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Required DNS Records

Prior to requesting SSL certificates, configure the following DNS records with the hosting DNS provider:

| Record Type | Host / Name | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (apex) | `<Production-Server-IPv4>` | 300 / 3600 | Points apex domain `nijamuddin.com` to web host |
| **AAAA** | `@` (apex) | `<Production-Server-IPv6>` | 300 / 3600 | IPv6 support (if configured on host) |
| **CNAME** | `www` | `nijamuddin.com.` | 300 / 3600 | Canonical alias for `www.nijamuddin.com` |
| **CAA** | `@` | `0 issue "letsencrypt.org"` | 3600 | Restricts certificate issuance to Let's Encrypt |

---

## 2. SSL/TLS Certificate Provisioning (Certbot)

Execute Let's Encrypt automated certificate issuance:

```bash
# 1. Install Certbot and Nginx plugin
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Issue certificate for both apex and www domains
sudo certbot --nginx -d nijamuddin.com -d www.nijamuddin.com --agree-tos --no-eff-email --redirect

# 3. Verify automated renewal systemd timer
sudo systemctl status certbot.timer

# 4. Dry-run renewal test
sudo certbot renew --dry-run
```

---

## 3. Strict-Transport-Security (HSTS) Policy
As established in Phase 18:
- The backend middleware automatically attaches:
  `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **HSTS Preload:** Deferred until 30 days of production stability without DNS changes.
