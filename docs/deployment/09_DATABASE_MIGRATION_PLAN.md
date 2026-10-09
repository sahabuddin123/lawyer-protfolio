# 09 — Production Database Migration & Provisioning Plan
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Production Database Provisioning

Execute the following commands on the production MySQL 8 instance:

```sql
-- 1. Create dedicated database with utf8mb4 encoding
CREATE DATABASE nijamuddin_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Create least-privilege application user
CREATE USER 'nijamuddin_user'@'localhost' IDENTIFIED BY 'REPLACE_WITH_SECURE_PASSWORD';

-- 3. Grant operational privileges (Strictly omit SUPER, FILE, GRANT OPTION)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, LOCK TABLES 
ON nijamuddin_production.* TO 'nijamuddin_user'@'localhost';

FLUSH PRIVILEGES;
```

---

## 2. Migration Execution Rules
1. **Never use `migrate:fresh` or `migrate:reset`:** Destructive schema resets are strictly forbidden on production.
2. **Execute with `--force` flag:**
   ```bash
   php artisan migrate --force
   ```
3. **Seed Initial RBAC & CMS Settings:**
   On initial deployment ONLY, execute targeted production seeders:
   ```bash
   php artisan db:seed --class=RolesAndPermissionsSeeder --force
   php artisan db:seed --class=CmsAndSettingsSeeder --force
   php artisan db:seed --class=ProfileAndCredentialsSeeder --force
   ```
   *Note: Seeders use `firstOrCreate()` / `findOrCreate()` to avoid duplicating existing data.*

---

## 3. Schema Rollback Limitations
- Migrations in Batch 1 contain initial table creations. Rolling back a migration drops the respective table and results in irreversible data loss if executed on a live database.
- **Rollback Rule:** Always restore from a pre-migration snapshot rather than running `artisan migrate:rollback` against live client data.
