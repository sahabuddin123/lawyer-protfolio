# 10 — Production Backup & Disaster Recovery Runbook
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Automated Daily Backup Strategy

### 1.1 Database Dump Script (`/usr/local/bin/backup-nijamuddin-db.sh`)
```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/nijamuddin"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="nijamuddin_production"
DB_USER="nijamuddin_user"
# Password managed via ~/.my.cnf

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Generate gzipped SQL dump with single-transaction consistency
mysqldump --single-transaction --quick --routines --triggers "$DB_NAME" | gzip -9 > "$BACKUP_DIR/db_${TIMESTAMP}.sql.gz"

# Retain backups for 30 days
find "$BACKUP_DIR" -type f -name "db_*.sql.gz" -mtime +30 -delete
```

### 1.2 Media & Document Backup Script (`/usr/local/bin/backup-nijamuddin-storage.sh`)
```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/nijamuddin"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SOURCE_DIR="/var/www/nijamuddin.com/shared/storage"

mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/storage_${TIMESTAMP}.tar.gz" -C "$SOURCE_DIR" app/

# Retain storage backups for 30 days
find "$BACKUP_DIR" -type f -name "storage_*.tar.gz" -mtime +30 -delete
```

---

## 2. Restoration Runbook (Disaster Recovery)

If database corruption or hardware failure occurs:

```bash
# 1. Stop web traffic / place in maintenance mode
cd /var/www/nijamuddin.com/current/backend
php artisan down --secret="emergency-recovery"

# 2. Decompress and restore database
gunzip < /var/backups/nijamuddin/db_20261009_XXXXXX.sql.gz | mysql -u root -p nijamuddin_production

# 3. Restore media assets if storage was damaged
tar -xzf /var/backups/nijamuddin/storage_20261009_XXXXXX.tar.gz -C /var/www/nijamuddin.com/shared/storage/

# 4. Flush and re-cache application state
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# 5. Bring application back online
php artisan up
```
- **Target RPO (Recovery Point Objective):** <= 24 hours (daily backup) / <= 1 hour (if binlogs enabled).
- **Target RTO (Recovery Time Objective):** <= 30 minutes from disaster declaration.
