# 10 — Production Backup & Disaster Recovery Runbook
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio Website  
**Server Target:** Hostinger VPS (aaPanel / Ubuntu 24.04 LTS)  
**Backup Destination:** `/www/backup/nijamuddin` (Outside public web root, `chmod 700`)  

---

## 1. Backup Scope & Asset Classification

The backup architecture encompasses all stateful assets required to restore the application from zero:

| Asset | Source Path | Backup Frequency | Retention |
|---|---|---|---|
| **MySQL Database (`nijam_mama_db`)** | MySQL Server | Daily at 02:00 UTC | 30 days |
| **Persistent Public Media** | `/www/wwwroot/nijamuddin-deploy/shared/storage/app/public` | Daily at 02:30 UTC | 30 days |
| **Confidential Legal Documents** | `/www/wwwroot/nijamuddin-deploy/shared/storage/app/secure_docs` | Daily at 02:30 UTC | 90 days |
| **Environment & Keys (`.env`)** | `/www/wwwroot/nijamuddin-deploy/shared/.env` | On change / Daily | 90 days |
| **Nginx Web Server Config** | `/www/server/panel/vhost/nginx/nijamuddin.com.conf` | On change | Indefinite |
| **Deployment & Audit Logs** | `/www/wwwroot/nijamuddin-deploy/deployment-logs` | Weekly | 60 days |

---

## 2. Automated Daily Backup Script

Place this script at `/www/backup/scripts/backup_nijamuddin.sh` with `chmod 700`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="/www/backup/nijamuddin"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
SHARED_DIR="/www/wwwroot/nijamuddin-deploy/shared"
DB_NAME="nijam_mama_db"
DB_USER="nijam_mama_db"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

echo "[$(date)] Starting backup of Advocate Nijam Uddin platform..."

# 1. Backup MySQL Database
echo "Dumping MySQL database ${DB_NAME}..."
mysqldump --single-transaction --quick --lock-tables=false \
    -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" | gzip > "${BACKUP_DIR}/database_${TIMESTAMP}.sql.gz"
chmod 600 "${BACKUP_DIR}/database_${TIMESTAMP}.sql.gz"

# 2. Backup Persistent Storage (Media & Secure Documents)
echo "Archiving shared storage..."
tar -czf "${BACKUP_DIR}/storage_${TIMESTAMP}.tar.gz" -C "${SHARED_DIR}" storage/
chmod 600 "${BACKUP_DIR}/storage_${TIMESTAMP}.tar.gz"

# 3. Backup Production Environment Configuration
echo "Archiving production .env..."
cp "${SHARED_DIR}/.env" "${BACKUP_DIR}/env_${TIMESTAMP}.backup"
chmod 600 "${BACKUP_DIR}/env_${TIMESTAMP}.backup"

# 4. Backup Nginx Configuration
echo "Backing up Nginx vhost..."
if [[ -f "/www/server/panel/vhost/nginx/nijamuddin.com.conf" ]]; then
    cp "/www/server/panel/vhost/nginx/nijamuddin.com.conf" "${BACKUP_DIR}/nginx_${TIMESTAMP}.conf"
fi

# 5. Prune backups older than 30 days
echo "Pruning backups older than 30 days..."
find "${BACKUP_ROOT}" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +

echo "[$(date)] Backup completed successfully in ${BACKUP_DIR}."
```

Configure via aaPanel Cron or system crontab:
```bash
0 2 * * * /www/backup/scripts/backup_nijamuddin.sh >> /www/backup/backup.log 2>&1
```

---

## 3. Disaster Recovery & Restoration Procedures

### 3.1 Restoring MySQL Database
```bash
# Locate the backup file
BACKUP_FILE="/www/backup/nijamuddin/20261009_020000/database_20261009_020000.sql.gz"

# Import into MySQL
gunzip < "${BACKUP_FILE}" | mysql -u nijam_mama_db -p nijam_mama_db

# Flush Laravel caches to reflect restored data
cd /www/wwwroot/nijamuddin-deploy/current/backend
php artisan cache:clear
```

### 3.2 Restoring Media & Confidential Legal Documents
```bash
STORAGE_BACKUP="/www/backup/nijamuddin/20261009_020000/storage_20261009_020000.tar.gz"

# Extract to shared storage
tar -xzf "${STORAGE_BACKUP}" -C /www/wwwroot/nijamuddin-deploy/shared/

# Enforce secure ownership and permissions
chown -R www:www /www/wwwroot/nijamuddin-deploy/shared/storage
chmod -R 775 /www/wwwroot/nijamuddin-deploy/shared/storage
chmod -R 700 /www/wwwroot/nijamuddin-deploy/shared/storage/app/secure_docs
```

### 3.3 Restoring Environment Configuration
```bash
ENV_BACKUP="/www/backup/nijamuddin/20261009_020000/env_20261009_020000.backup"

cp "${ENV_BACKUP}" /www/wwwroot/nijamuddin-deploy/shared/.env
chmod 600 /www/wwwroot/nijamuddin-deploy/shared/.env
chown www:www /www/wwwroot/nijamuddin-deploy/shared/.env
```
