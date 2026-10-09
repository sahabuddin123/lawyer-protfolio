# 01. Backend Setup & Environment Guide

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Architecture Phase:** Phase 3 — Laravel Backend Foundation  
**Framework Version:** Laravel 11.57.0  
**PHP Runtime:** PHP 8.3.9 (CLI & FPM)  
**Database:** MySQL 8.0.31 (InnoDB, `utf8mb4_unicode_ci`)  

---

## 1. System Requirements & Architecture Alignment

The backend foundation is built according to the approved Phase 1 architecture (`docs/architecture/01_ARCHITECTURE.md`) and functions as a headless API service powering the React + Vite frontend platform.

| Component | Target Version | Installed / Verified |
| :--- | :--- | :--- |
| **PHP** | 8.3+ | PHP 8.3.9 (`ext-pdo_mysql`, `ext-intl`, `ext-mbstring`, `ext-openssl`) |
| **Laravel Framework** | 11.x | 11.57.0 |
| **Composer** | 2.x | 2.8.12 |
| **Database Server** | MySQL 8.0+ | MySQL 8.0.31 |
| **RBAC Framework** | Spatie | `spatie/laravel-permission` ^6.25 |
| **API Auth Framework** | Laravel Sanctum | `laravel/sanctum` ^4.3 |

---

## 2. Directory Layout

The backend resides strictly inside `backend/`:

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/   # API v1 Controllers
│   │   ├── Middleware/           # SetLocale, SecurityHeaders
│   │   ├── Requests/             # BaseApiRequest & Form Requests
│   │   ├── Resources/V1/         # BaseApiResource & BaseApiCollection
│   │   └── Responses/            # Standard ApiResponse envelope
│   ├── Models/                   # 29 Eloquent Domain Models
│   ├── Providers/                # AppServiceProvider (RateLimiters, Model::strict)
│   ├── Services/                 # BaseService, MediaService
│   └── Traits/                   # HasTranslations, HasStatus, HasSortOrder, HasSeo
├── config/                       # cors.php, database.php, filesystems.php, permission.php, etc.
├── database/
│   └── migrations/               # 15 Total Migrations (45 Tables)
├── routes/
│   └── api.php                   # API v1 Route Definitions (/api/v1 prefix)
├── storage/
│   └── app/
│       ├── public/media/         # Public media disk (Symlinked to public/storage)
│       └── secure/case_documents/# Private confidential disk (Streamed only)
└── tests/
    └── Feature/                  # Automated PHPUnit / Pest Test Suite
```

---

## 3. Environment Configuration (`.env`)

The application is configured via environment variables. Key configuration keys:

```dotenv
APP_NAME="Advocate Nijam Uddin Platform"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_TIMEZONE=Asia/Dhaka
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nijamuddin_db
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=public
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

---

## 4. Operational Commands

### 4.1 Dependency Installation & Maintenance
```powershell
composer install
```

### 4.2 Database Migrations
```powershell
php artisan migrate:status
php artisan migrate
```

### 4.3 Automated Verification Tests
```powershell
php artisan test
```

### 4.4 Local Development Server
```powershell
php artisan serve --port=8000
```
