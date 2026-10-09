# 14 — Monitoring, Observability & Incident Response
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Observability Baseline & Log Rotation

### 1.1 Logging Channels (`config/logging.php`)
- **Channel:** `daily` (Generates daily rotating files in `/var/www/nijamuddin.com/shared/storage/logs/laravel-YYYY-MM-DD.log`).
- **Log Level:** `error` (Suppresses debug traces; records critical and unhandled exceptions).
- **Log Retention:** 14 days.

### 1.2 System Logrotate Configuration
Save to `/etc/logrotate.d/nijamuddin`:
```
/var/www/nijamuddin.com/shared/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0660 www-data www-data
}
```

---

## 2. Health Endpoint Monitoring
The platform exposes an automated health verification endpoint at:
`GET https://nijamuddin.com/api/v1/health`

### Health Check Response
```json
{
  "success": true,
  "message": "Platform healthy.",
  "data": {
    "status": "healthy",
    "timestamp": 1728470000,
    "locale": "en",
    "database": "connected"
  }
}
```
External uptime monitors (e.g. UptimeRobot, Pingdom, BetterStack) should poll this URL every 60 seconds and alert if status != 200.

---

## 3. Incident Response Escalation Runbook

| Incident Type | Symptoms | Immediate Action | Escalation Target |
| :--- | :--- | :--- | :--- |
| **P0: Outage** | 502 Bad Gateway / Connection Refused | Check Nginx & PHP-FPM status (`systemctl status php8.2-fpm`) | DevOps Lead / SysAdmin |
| **P0: DB Lock** | 500 error / Deadlock found | Inspect MySQL process list (`SHOW FULL PROCESSLIST;`) | Database Specialist |
| **P1: Security Alert**| Rate limit spikes / Failed login flood | Inspect access logs; block offending IPs via `ufw` or Fail2ban | Security Lead |
| **P2: SSL Expiry** | SSL certificate warning | Run `certbot renew --force-renewal` | DevOps Lead |
