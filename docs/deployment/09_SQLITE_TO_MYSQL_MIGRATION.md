# 09 — Database Migration & Audit Report: SQLite to MySQL
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio Website  
**Source Database Audit:** SQLite (`backend/database/database.sqlite`)  
**Target Production Engine:** MySQL 8.0+ / MariaDB 10.11+  
**Target Database Name:** `nijam_mama_db`  
**Target Database User:** `nijam_mama_db`  

---

## 1. Source Database Audit Findings

A thorough filesystem and configuration audit was conducted on the repository:

1. **SQLite Database Path:** `backend/database/database.sqlite`
2. **File Size & Content:** Exactly **0 bytes** (empty).
3. **Record Count:** **0 records across 0 tables**.
4. **Git Tracking Status:** **Untracked**. The `.gitignore` file strictly excludes `*.sqlite`, `*.sqlite3`, `*.sql`, and `*.dump` files to guarantee zero data leakage in public repositories.
5. **Development Environment Reality:** Local development and testing throughout Phases 1–19 were executed against a local MySQL instance (`nijamuddin_db`) using standard MySQL drivers (`pdo_mysql`). 

### Conclusion:
Because SQLite contains no historical or production records, **data extraction or ETL row-by-row conversion from SQLite is not required**. The production migration path is a clean, verified schema provisioning on `nijam_mama_db` using Laravel's standard migration engine.

---

## 2. Production Database Configuration (`nijam_mama_db`)

The aaPanel environment hosts a dedicated MySQL instance. The database credentials must be configured securely in `/www/wwwroot/nijamuddin-deploy/shared/.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nijam_mama_db
DB_USERNAME=nijam_mama_db
DB_PASSWORD=<CONFIGURE_SECURELY_ON_SERVER>
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
```

### Security Mandate:
- **Zero Hardcoded Passwords:** Never commit database credentials into version control.
- **Dedicated User Privileges:** The `nijam_mama_db` user must have restricted grants limited to `nijam_mama_db.*` only, with no global `SUPER` or `FILE` privileges.

---

## 3. Schema & MySQL Compatibility Analysis

All 28 migration files in `backend/database/migrations/` were audited for MySQL compatibility:

### 3.1 Character Set & Collation
- Default configured: `utf8mb4` with `utf8mb4_unicode_ci`.
- Fully supports multilingual Bengali (Bangla) text across all CMS tables, legal articles, case titles, and testimonials.

### 3.2 Index Lengths & VARCHAR Limits
- All string columns with unique indexes specify explicit lengths (`VARCHAR(191)` or `VARCHAR(255)`) to prevent MySQL `1071: Specified key was too long; max key length is 767 bytes` or `1000 bytes` errors on older storage engines.
- Schema builder utilizes `Schema::defaultStringLength(191)` in `AppServiceProvider`.

### 3.3 JSON Support
- Tables including `appointments`, `audit_logs`, `cms_sections`, and `activity_logs` use native JSON column types (`$table->json(...)`).
- Verified compatible with MySQL 5.7.8+ and 8.0+.

### 3.4 Foreign Keys & Referential Integrity
- All relationships enforce `foreignId()->constrained()->cascadeOnDelete()` or `restrictOnDelete()`.
- MySQL InnoDB engine guarantees referential constraint enforcement.

### 3.5 Auto-Increment Behavior
- Primary keys use `bigIncrements('id')` (BIGINT UNSIGNED AUTO_INCREMENT).

---

## 4. Execution Plan on Production

### Step 1: Pre-Migration Connection Test
Validate database credentials before running Artisan:
```bash
mysql -h 127.0.0.1 -u nijam_mama_db -p nijam_mama_db -e "SELECT 1;"
```

### Step 2: Safe Schema Migration
From the release directory:
```bash
cd /www/wwwroot/nijamuddin-deploy/current/backend
php artisan migrate --force
```

**FORBIDDEN IN PRODUCTION:**
- `php artisan migrate:fresh` (DROPS ALL TABLES)
- `php artisan db:wipe` (WIPES ENTIRE DATABASE)

### Step 3: Approved Initial Seeding (First Deployment Only)
Seed required CMS roles and core settings:
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder --force
php artisan db:seed --class=CmsAndSettingsSeeder --force
```

---

## 5. Test Database Isolation

To prevent test runs from ever connecting to the production database:
- `backend/phpunit.xml` configures an isolated in-memory or dedicated test database:
  ```xml
  <env name="DB_CONNECTION" value="sqlite"/>
  <env name="DB_DATABASE" value=":memory:"/>
  ```
- Automated test runs will never touch or truncate `nijam_mama_db`.
