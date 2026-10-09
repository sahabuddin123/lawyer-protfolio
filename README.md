# Advocate Nijam Uddin (Haq) — Professional Lawyer Portfolio & CMS

[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-777BB4?logo=php&logoColor=white)](https://php.net/)
[![Laravel Framework](https://img.shields.io/badge/Laravel-11.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![React Version](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-MySQL_8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Authentication](https://img.shields.io/badge/Auth-Laravel_Sanctum-red)](https://laravel.com/docs/sanctum)
[![Bilingual](https://img.shields.io/badge/Languages-English_%7C_%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE-green)](#bilingual-architecture-english--bangla)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](#license)

An enterprise-grade, authoritative digital portfolio and bespoke Content Management System (CMS) engineered for **Advocate Nijam Uddin (Haq)**, Advocate of the Supreme Court of Bangladesh. 

The platform pairs a high-performance **React + TypeScript + Vite** frontend with a robust, strictly typed **Laravel 11 RESTful API backend**, providing public legal authority representation, scholarly monograph publishing, judgment analysis, media records, and a protected back-office administration suite.

* **Production URL:** [https://nijamuddin.com](https://nijamuddin.com)
* **Repository:** [https://github.com/sahabuddin123/lawyer-protfolio](https://github.com/sahabuddin123/lawyer-protfolio)
* **Architecture:** Decoupled SPA (React) + REST API (Laravel) under a unified production domain

---

## Table of Contents

- [About Advocate Nijam Uddin (Haq)](#about-advocate-nijam-uddin-haq)
- [Project Overview & Objectives](#project-overview--objectives)
- [Core Features & Modules](#core-features--modules)
- [Admin Panel & Back-Office CMS](#admin-panel--back-office-cms)
- [Technology Stack](#technology-stack)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [System Requirements](#system-requirements)
- [Local Development Setup](#local-development-setup)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone Repository](#2-clone-repository)
  - [3. Backend Installation & Setup](#3-backend-installation--setup)
  - [4. Frontend Installation & Setup](#4-frontend-installation--setup)
  - [5. Initial Super Administrator Setup](#5-initial-super-administrator-setup)
  - [6. Running the Development Servers](#6-running-the-development-servers)
- [API Architecture & Endpoints](#api-architecture--endpoints)
- [Bilingual Architecture (English & Bangla)](#bilingual-architecture-english--bangla)
- [High-Performance Redis Caching Architecture](#high-performance-redis-caching-architecture)
  - [Overview & Architecture](#overview--architecture)
  - [Cache Invalidation & Atomic Versioning](#cache-invalidation--atomic-versioning)
  - [TTL Policy Matrix](#ttl-policy-matrix)
  - [Safe Diagnostic Verification (`redis:verify`)](#safe-diagnostic-verification-redisverify)
  - [Local Development Setup (Windows / Docker / WSL2)](#local-development-setup-windows--docker--wsl2)
  - [Production VPS Setup Guide (Hostinger / aaPanel / Ubuntu 24.04)](#production-vps-setup-guide-hostinger--aapanel--ubuntu-2404)
  - [Graceful Fallback & Instant Rollback](#graceful-fallback--instant-rollback)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Production Deployment Architecture](#production-deployment-architecture)
  - [Server Environment](#server-environment)
  - [Deployment Workflow with `deploy.sh`](#deployment-workflow-with-deploysh)
  - [Atomic Release Structure](#atomic-release-structure)
  - [Rollback Procedure](#rollback-procedure)
- [Security Posture & Configuration](#security-posture--configuration)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [License & Chamber Contact](#license--chamber-contact)

---

## About Advocate Nijam Uddin (Haq)

Advocate Nijam Uddin (Haq) is an enrolled legal practitioner before the Supreme Court of Bangladesh, dedicated to constitutional fidelity, criminal defense, civil litigation, and progressive jurisprudence.

* **Academic Pedigree:**
  * **LL.M. (Master of Laws)** — University of Chittagong
  * **LL.B. (Honours)** — University of Chittagong
* **Professional Credentials:**
  * **Advocate, Supreme Court of Bangladesh**
  * **Enrolled / Certified Advocate, Bangladesh Bar Council**
* **Chamber Philosophy:** Principled advocacy, procedural justice, ethical representation, and rigorous academic contribution to Bangladeshi law.

---

## Project Overview & Objectives

The platform was built from the ground up to establish an elite digital presence that reflects judicial dignity and credibility:

1. **Authoritative Digital Presence:** Communicate legal credentials, practice domains, high-profile case experiences, and scholarly contributions.
2. **Bilingual Accessibility:** Deliver native, fully localized legal content in both **English** and **Bangla (বাংলা)**.
3. **Decoupled Architecture:** Maintain separation of concerns between presentation (React/Vite) and domain logic/data persistence (Laravel/MySQL).
4. **Editorial CMS Autonomy:** Provide non-technical back-office tools for chamber managers to update litigation achievements, published articles, press appearances, and gallery records.
5. **Security & Data Privacy:** Implement tokenized authentication (Laravel Sanctum), Spatie Role-Based Access Control (RBAC), OWASP-compliant security headers, spam honeypots, and input sanitization.
6. **Zero-Downtime Operations:** Employ an atomic release symlink architecture (`deploy.sh`) supporting instant rollbacks.

---

## Core Features & Modules

### Public Portal
* **Homepage:** Dynamic hero presentation, lawyer profile highlights, featured litigation, scholarly research monographs, judgment commentary, video appearances, and client trust metrics.
* **Lawyer Biography & Credentials (`/about`):** Verified academic pedigree, enrollment status, bar memberships, and chronological career milestones.
* **Practice Areas (`/practice-areas`):** Specializations across Constitutional Law, Criminal Litigation, Civil Disputes, Corporate Governance, Appellate Matters, and Banking/Finance.
* **Courtroom Experience (`/courtroom`):** Historical and landmark case experiences categorized by jurisdiction, court hierarchy, and legal subject matter.
* **Legal Research & Monographs (`/research`):** Scholarly articles and legal research papers with searchable tags, abstracts, and downloadable PDF briefs.
* **Judgment Reviews (`/judgments`):** Detailed analysis of Supreme Court decisions, bench observations, and precedent commentary.
* **Publications (`/publications`):** Legal columns, journal entries, and press publications.
* **Media Center (`/media`, `/videos`, `/gallery`):** Print press mentions, broadcast appearances, video lectures, and chamber event galleries.
* **Client Inquiries & Consultation (`/contact`):** Encrypted contact forms and Chamber appointment booking requests with honeypot anti-spam verification.
* **Technical SEO:** Automatic generation of OpenGraph metadata, JSON-LD Schema.org (`LegalService` & `Person`), dynamic `sitemap.xml`, and search crawler directives (`robots.txt`).

---

## Admin Panel & Back-Office CMS

Administrative access is strictly protected and isolated from public users.

* **Admin Login Route:** `/admin/login` (with `/login` alias).
* **API Authentication Endpoint:** `POST /api/v1/auth/login`.
* **Security Guard:** Laravel Sanctum personal access tokens (`Bearer` tokens) stored securely in client storage.
* **Access Control:** Multi-tier Spatie RBAC matrix:
  * `super_admin`: Full unrestricted authority across all settings, users, and content.
  * `admin`: Complete content and inquiry management.
  * `editor`: Editorial drafting, content reviews, and updates.
  * `content_manager`: Articles, practice areas, publications, and judgments.
  * `media_manager`: Photo galleries, video lectures, and press records.
* **Back-Office Modules (`/admin/cms`):**
  * **Site Settings:** Chamber contacts, social links, SEO defaults, branding.
  * **Page Manager:** Custom static and legal pages with slug redirection safeguards.
  * **Navigation Manager:** Hierarchical header, footer, and legal menu items.
  * **Homepage Section Manager:** Dynamic section toggling and order resequencing.
  * **Litigation & Content Managers:** Domain managers for Practice Areas, Courtroom Cases, Research, Judgments, Publications, Media, and Gallery.
  * **Inquiries & Consultations Inbox:** Secure dashboard for reviewing confidential appointment requests and messages.
  * **Audit Logging:** Every login attempt, credential provisioning, and sensitive action is tracked in the database `activity_logs` table.

---

## Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                      │
│     React 19 • TypeScript • Vite • Tailwind CSS        │
│     React Router 7 • TanStack Query • Lucide React     │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS REST API (/api/v1)
┌──────────────────────────▼─────────────────────────────┐
│                    LARAVEL BACKEND                     │
│    Laravel 11 • PHP 8.2+ • Sanctum • Spatie RBAC       │
│    Custom Activity Logger • Polymorphic SEO System     │
└──────────────────────────┬─────────────────────────────┘
                           │ MySQL Protocol
┌──────────────────────────▼─────────────────────────────┐
│                   PERSISTENCE LAYER                    │
│                 MySQL 8.0 (Production)                 │
└────────────────────────────────────────────────────────┘
```

### Frontend
| Component | Technology | Version / Details |
|---|---|---|
| Framework | **React** | `^19.3.0` |
| Build Tool | **Vite** | `^8.3.0` |
| Language | **TypeScript** | `~6.0.2` |
| Routing | **React Router DOM** | `^7.18.4` |
| State & Query | **TanStack React Query** | `^5.104.1` |
| Styling | **Tailwind CSS** | `^3.4.19` (Custom legal palette) |
| Animations | **Framer Motion** | `^14.0.0` |
| Icons | **Lucide React** | `^1.52.0` |
| Validation | **React Hook Form + Zod** | `^7.89.0` / `^3.25.76` |

### Backend
| Component | Technology | Version / Details |
|---|---|---|
| Core Framework | **Laravel** | `^11.31` |
| Runtime | **PHP** | `^8.2` |
| Token Auth | **Laravel Sanctum** | `^4.3` |
| RBAC | **Spatie Laravel Permission** | `^6.25` |
| Testing | **PHPUnit** | `^11.0.1` |
| Code Standards | **Laravel Pint** | `^1.13` |

### Server & Production Infrastructure
| Component | Details |
|---|---|
| Hosting | **Hostinger VPS** |
| Operating System | **Ubuntu 24.04 LTS** |
| Control Panel | **aaPanel** |
| Web Server | **Nginx** (Reverse proxy + static file server) |
| PHP Handler | **PHP-FPM 8.2** |
| Database | **MySQL 8.0** |
| Deploy Tooling | **Bash Atomic Symlink Script (`deploy.sh`)** |

---

## Project Architecture & Directory Structure

```
nijamuddin.com/
├── .env.example                     # Production environment variable template
├── .gitignore                       # Repository exclusion rules
├── deploy.sh                        # Automated aaPanel/VPS deployment script
├── README.md                        # Project documentation (this file)
│
├── backend/                         # Laravel 11 Application
│   ├── app/
│   │   ├── Console/Commands/        # Artisan CLI commands (admin:create-super-admin)
│   │   ├── Http/Controllers/Api/V1/ # REST API Controllers (Public, Admin, Auth)
│   │   ├── Http/Requests/           # Form request validations & sanitization
│   │   ├── Http/Resources/V1/       # JSON API serialization envelopes
│   │   ├── Models/                  # Eloquent models with HasTranslations trait
│   │   ├── Services/                # Business logic, CMS Cache, Media Service
│   │   └── Traits/                  # Reusable Eloquent traits (HasTranslations)
│   ├── config/                      # Laravel config files (auth, cors, sanctum)
│   ├── database/
│   │   ├── migrations/              # Database schema migrations (24 migrations)
│   │   └── seeders/                 # Seeders (SuperAdmin, Roles, CMS, Profile)
│   ├── routes/
│   │   └── api.php                  # API v1 route declarations
│   ├── tests/
│   │   └── Feature/                 # Feature test suites (316 passing tests)
│   ├── composer.json                # PHP dependency declarations
│   └── phpunit.xml                  # Automated testing configuration
│
└── frontend/                        # React + Vite Application
    ├── src/
    │   ├── api/                     # Axios API clients (auth, cms, public)
    │   ├── components/              # UI building blocks (cards, buttons, modals)
    │   ├── features/                # Domain modules (auth, cms, profile, media)
    │   ├── i18n/                    # Localization dictionaries (en.ts, bn.ts)
    │   ├── layouts/                 # RootLayout (Navbar, Footer, Consultation Modal)
    │   ├── pages/                   # Route view pages (Public and AdminLoginPage)
    │   ├── routes/                  # React Router configuration
    │   ├── types/                   # TypeScript interfaces & API schemas
    │   └── utils/                   # Helper functions, formatters, cn utility
    ├── package.json                 # Node dependencies and scripts
    ├── tsconfig.json                # TypeScript compiler configuration
    └── vite.config.ts               # Vite bundler build pipeline configuration
```

---

## System Requirements

Ensure your development environment meets the following specifications:

* **PHP:** `>= 8.2` with extensions:
  * `pdo_mysql` (or `pdo_sqlite` for tests)
  * `mbstring`
  * `xml`
  * `curl`
  * `gd`
  * `zip`
  * `bcmath`
  * `intl`
* **Composer:** `>= 2.6`
* **Node.js:** `>= 18.x` or `20.x LTS`
* **npm:** `>= 9.x`
* **Database:** MySQL `8.0+` (or MariaDB `10.5+` / SQLite for tests)
* **Git:** `>= 2.30`

---

## Local Development Setup

Follow these step-by-step instructions to set up the complete stack locally.

### 1. Prerequisites
Verify your system tools:

```bash
php -v          # Must be 8.2 or higher
composer -V     # Must be 2.x
node -v         # Must be 18.x or 20.x LTS
npm -v          # Must be 9.x or higher
```

### 2. Clone Repository

```bash
git clone https://github.com/sahabuddin123/lawyer-protfolio.git nijamuddin
cd nijamuddin
```

---

### 3. Backend Installation & Setup

Open a terminal dedicated to the Laravel backend:

```bash
cd backend

# Install PHP dependencies
composer install

# Create environment configuration
cp .env.example .env

# Generate application encryption key
php artisan key:generate
```

#### Configure Database in `backend/.env`
Open `backend/.env` and update the database connection variables for your local MySQL server (or SQLite):

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nijamuddin_db
DB_USERNAME=root
DB_PASSWORD=your_local_password
```

*(Create the database in MySQL if it does not exist: `CREATE DATABASE nijamuddin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)*

#### Run Migrations & Core Seeds

```bash
# Execute schema migrations safely (never use migrate:fresh on production)
php artisan migrate

# Seed roles, permissions, baseline CMS content, and lawyer profile
php artisan db:seed
```

#### Link Storage Directory

```bash
php artisan storage:link
```

---

### 4. Frontend Installation & Setup

Open a second terminal window for the React frontend:

```bash
cd frontend

# Install Node dependencies
npm install

# Create local environment file
cp .env.example .env
```

Verify `frontend/.env` contains the API base path:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME="Advocate Nijam Uddin Platform"
```

---

### 5. Initial Super Administrator Setup

To access the back-office CMS at `/admin/login`, an administrative account with the `super_admin` role must be initialized.

#### Option A: Interactive CLI Command (Recommended)
Run the dedicated provisioning command in the `backend/` directory:

```bash
php artisan admin:create-super-admin
```

The command will interactively prompt for:
1. Administrator Full Name (e.g., `Advocate Nijam Uddin`)
2. Administrator Email Address (e.g., `admin@nijamuddin.com`)
3. Secure Password (minimum 12 characters, masked console input)
4. Password Confirmation

#### Option B: CLI Flags (Non-Interactive)

```bash
php artisan admin:create-super-admin \
  --name="Advocate Nijam Uddin" \
  --email="admin@nijamuddin.com" \
  --password="YourSecurePassword2026!#" \
  --no-interaction
```

#### Option C: Environment-Driven CLI Setup
If `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` are configured in your local `backend/.env`:

```bash
php artisan admin:create-super-admin --from-env
```

> **Security & Idempotency Guarantee:**  
> The provisioning command verifies database connectivity before running, validates password complexity (>= 12 characters), creates an entry in `activity_logs`, and **strictly refuses to overwrite or reset passwords** if the user account already exists.

---

### 6. Running the Development Servers

The application requires running both the backend and frontend development servers.

#### Terminal 1 — Backend API Server:

```bash
cd backend
php artisan serve
# Listening on http://127.0.0.1:8000
```

#### Terminal 2 — Frontend Vite Server:

```bash
cd frontend
npm run dev
# Local: http://localhost:5173
```

Now open your browser:
* **Public Chamber Website:** [http://localhost:5173](http://localhost:5173)
* **Back-Office Admin Login:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
* **Backend API Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## API Architecture & Endpoints

All backend API routes are versioned and served under the `/api/v1` prefix.

### Public Endpoints (Rate Limited)
| HTTP Method | Route | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Foundation health probe (Database & environment check) |
| `GET` | `/api/v1/home` | Aggregated homepage payload (Hero, highlights, metrics) |
| `GET` | `/api/v1/settings` | Public chamber settings, contact info, social links |
| `GET` | `/api/v1/navigation` | Header, footer, and legal menu hierarchies |
| `GET` | `/api/v1/pages/{slug}` | Dynamic CMS page detail |
| `GET` | `/api/v1/profile` | Lawyer biography, philosophy, addresses, and enrollments |
| `GET` | `/api/v1/credentials` | Academic degrees, bar admissions, and credentials |
| `GET` | `/api/v1/timeline` | Career timeline milestones and bar memberships |
| `GET` | `/api/v1/practice-areas` | Practice area directory and featured categories |
| `GET` | `/api/v1/courtroom` | Courtroom litigation archive and case documents |
| `GET` | `/api/v1/research` | Legal research monographs and downloadable PDF papers |
| `GET` | `/api/v1/judgments` | Precedent reviews and Supreme Court judgments |
| `GET` | `/api/v1/publications` | Published legal articles and editorial columns |
| `GET` | `/api/v1/media/press` | Press coverage and official mentions |
| `GET` | `/api/v1/videos` | Video lectures and TV appearance catalogue |
| `GET` | `/api/v1/gallery` | Photo albums and chamber media gallery |
| `POST` | `/api/v1/contact` | Client inquiries with honeypot spam verification |
| `POST` | `/api/v1/consultations` | Chamber appointment conference requests |
| `GET` | `/api/v1/sitemap.xml` | Dynamic XML sitemap for search engines |
| `GET` | `/api/v1/robots.txt` | Crawler indexing directives |

### Authentication Endpoints
| HTTP Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public (Throttled) | Authenticate admin, returns Sanctum token |
| `POST` | `/api/v1/auth/forgot-password` | Public (Throttled) | Send password reset token email |
| `POST` | `/api/v1/auth/reset-password` | Public (Throttled) | Reset password with token |
| `GET` | `/api/v1/auth/me` | Bearer Token | Return authenticated admin user & permissions |
| `POST` | `/api/v1/auth/logout` | Bearer Token | Invalidate and revoke current Sanctum token |

### Protected Admin Back-Office Endpoints (`/api/v1/admin/*`)
Requires `Authorization: Bearer <token>` header with corresponding Spatie permissions:
* `/api/v1/admin/settings` — Chamber site configuration
* `/api/v1/admin/pages` — CMS static pages & SEO metadata
* `/api/v1/admin/menus` & `/api/v1/admin/menu-items` — Navigation menu structure
* `/api/v1/admin/homepage/sections` — Homepage layout ordering and toggles
* `/api/v1/admin/redirects` — 301 permanent URL redirects
* `/api/v1/admin/profile/*` — Education, credentials, memberships, timeline
* `/api/v1/admin/practice-areas/*` — Practice area management
* `/api/v1/admin/courtroom/*` — Case records and document uploads
* `/api/v1/admin/research/*` — Research monograph publishing
* `/api/v1/admin/judgments/*` — Judgment reviews and precedents
* `/api/v1/admin/publications/*` — Editorial publications
* `/api/v1/admin/media/*` — Press, appearances, video index, and gallery albums
* `/api/v1/admin/contact-messages` — Review received inquiries
* `/api/v1/admin/consultation-requests` — Review appointment requests

---

## Bilingual Architecture (English & Bangla)

The application supports native bilingual representation throughout the stack:

1. **Database Schema:** Multilingual attributes (such as `title`, `name`, `content`, `description`, `bio`) are stored as structured JSON columns.
2. **Eloquent Translation Trait:** Models leverage `App\Traits\HasTranslations`, automatically resolving localized attributes based on the application locale.
3. **Locale Header Negotiation:** The frontend passes the active language in the standard HTTP header:
   ```http
   Accept-Language: en
   # or
   Accept-Language: bn
   ```
4. **Frontend Context:** Handled via `src/i18n/index.tsx` and custom dictionaries (`en.ts` and `bn.ts`), providing instant, zero-reload switching between English and Bangla.

---

## High-Performance Redis Caching Architecture

The platform integrates an in-memory **Redis** caching tier designed to deliver sub-millisecond response times for public visitors across both English and Bangla locales, while strictly protecting private administrative endpoints and client communications.

### Overview & Architecture

* **Engine:** In-memory key-value store (Redis 7.x) via the high-performance PHP extension `phpredis`.
* **Database Isolation:**
  * **Database Index 0 (`REDIS_DB=0`):** Reserved for general application operations and default connection.
  * **Database Index 1 (`REDIS_CACHE_DB=1`):** Dedicated exclusively to the application cache layer.
* **Key Prefixing:** All cache entries are namespaced with `CACHE_PREFIX` (e.g., `nijam_prod_cache_` or `nijam_`) to avoid cross-application collision.
* **Bilingual Locale Separation:** English (`en`) and Bangla (`bn`) payloads are stored under independent keys (e.g., `cms:settings:public:v1:en` vs `cms:settings:public:v1:bn`).
* **Strict Privacy Isolation:**
  * **Public Endpoints Cached:** Settings, navigation menus, homepage payload, lawyer profile/credentials/timeline, practice areas, courtroom experience, research papers, judgment reviews, publications, media appearances, videos, gallery albums, and XML sitemaps.
  * **Never Cached:** Administrative endpoints (`/api/v1/admin/*`), authentication tokens, user sessions, client inquiries (`/api/v1/contact`), consultation requests (`/api/v1/consultations`), or confidential legal briefs.

---

### Cache Invalidation & Atomic Versioning

Rather than issuing dangerous full-server flushes (`flushall` or `flushdb`) or relying on cache drivers that lack tag support, the platform implements an **Atomic Versioned Namespace** pattern in `App\Services\CmsCacheService`:

1. **Version Counters:** Each module namespace maintains an atomic version integer stored in cache (e.g., `cms:version:practice_areas`).
2. **List Key Permutations:** Listing queries incorporate the active version and an MD5 hash of sorting/filter/pagination parameters:
   ```
   cms:practice_areas:list:v{version}:{locale}:p{page}:s{searchHash}:f{featured}
   ```
3. **Instant Targeted Invalidation:** When an administrator creates, updates, reorders, or deletes an item in the CMS:
   * `CmsCacheService::bumpVersion($module)` atomically increments the module version counter.
   * All previous query, filter, and pagination permutations are instantly bypassed and garbage-collected upon TTL expiry.
   * Direct detail records (`cms:{module}:detail:{slug}:{locale}`) are explicitly forgotten.
   * No unrelated application cache entries or Redis databases are disturbed.

---

### TTL Policy Matrix

All cached resources operate under explicit, content-aware Time-To-Live (TTL) limits:

| Resource Type | Cache TTL | Implementation Constant | Rationale |
|---|---|---|---|
| **Chamber Settings** | 30 minutes | `CmsCacheService::TTL_SETTINGS = 1800` | Global settings, phone numbers, chamber addresses change infrequently |
| **Navigation & Menus** | 30 minutes | `CmsCacheService::TTL_NAVIGATION = 1800` | Header, footer, and legal menu hierarchies |
| **CMS Pages** | 30 minutes | `CmsCacheService::TTL_PAGE = 1800` | Static policy pages (Terms, Privacy, Disclaimers) |
| **Contact Configurations** | 30 minutes | `CmsCacheService::TTL_CONTACT = 1800` | Office hours, consultation preferences |
| **Lawyer Profile & Pedigree** | 15 minutes | `CmsCacheService::TTL_PROFILE = 900` | Biography, credentials, bar memberships, milestone timeline |
| **Practice Areas** | 15 minutes | `CmsCacheService::TTL_PRACTICE_AREAS = 900` | Core practice domain listings and practice detail pages |
| **Homepage Aggregation** | 10 minutes | `CmsCacheService::TTL_HOME = 600` | Aggregated hero, stats, and featured sections |
| **Litigation & Case Archive** | 10 minutes | `CmsCacheService::TTL_COURTROOM = 600` | Case experiences and milestone courtroom matters |
| **Research Monographs** | 10 minutes | `CmsCacheService::TTL_RESEARCH = 600` | Academic legal papers and monographs |
| **Judgment Commentary** | 10 minutes | `CmsCacheService::TTL_JUDGMENTS = 600` | Supreme Court judgment reviews and bench analysis |
| **Publications & Articles** | 10 minutes | `CmsCacheService::TTL_PUBLICATIONS = 600` | Press articles, legal columns, and journal entries |
| **Media, Press & Videos** | 10 minutes | `CmsCacheService::TTL_MEDIA / TTL_VIDEOS = 600` | Broadcast interviews, videos, and press mentions |
| **Photo Gallery Albums** | 10 minutes | `CmsCacheService::TTL_GALLERY = 600` | Chamber events and ceremonial photo albums |
| **XML Sitemap** | 24 hours | `CmsCacheService::TTL_SITEMAP = 86400` | Search engine crawl map (`/api/v1/sitemap.xml`) |

---

### Safe Diagnostic Verification (`redis:verify`)

The backend includes a dedicated, non-destructive Artisan verification command:

```bash
cd backend
php artisan redis:verify
```

#### Diagnostic Capabilities:
1. **Configuration Inspection:** Reports active `CACHE_STORE`, target connection, client driver, host:port, and DB index without printing credentials or exposing passwords.
2. **Runtime Driver Verification:** Validates that the active PHP runtime has loaded `phpredis` (or `predis/predis`).
3. **Safe Ping:** Issues a non-destructive `PING` probe against the target Redis connection.
4. **Isolated Read/Write/Delete Probe:** Writes an ephemeral test key with a 60-second TTL (`diag_verify_<random>`), reads and asserts value integrity, and immediately deletes the key.
5. **Cache Facade Verification:** Optionally tests the Laravel `Cache::store('redis')` store (`php artisan redis:verify --store`).

---

### Local Development Setup (Windows / Docker / WSL2)

In local development (e.g. Windows with WAMP), Redis is **not required**. The application defaults smoothly to `CACHE_STORE=file` or `CACHE_STORE=database`.

If you wish to run Redis locally for parity testing:

#### Option A: Docker (Recommended for Windows / Mac)
Run a lightweight Redis 7 container:

```bash
docker run -d --name nijam-redis -p 6379:6379 redis:7-alpine
```

Verify reachability:
```bash
docker exec -it nijam-redis redis-cli ping
# Expected: PONG
```

#### Option B: WSL2 (Ubuntu on Windows)
```bash
sudo apt update && sudo apt install -y redis-server
sudo service redis-server start
redis-cli ping
# Expected: PONG
```

#### Local Laravel Configuration (`backend/.env`):
```ini
CACHE_STORE=redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
REDIS_DB=0
REDIS_CACHE_DB=1
CACHE_PREFIX=nijam_dev_cache_
```

> **Note on Windows PHP Extensions:**  
> If using native Windows PHP without the `php_redis.dll` extension, keep `CACHE_STORE=file` in your local `.env`. All automated tests and CMS features function identically on file and database stores.

---

### Production VPS Setup Guide (Hostinger / aaPanel / Ubuntu 24.04)

Follow these verified steps on the Hostinger VPS to install and configure Redis for production:

#### 1. Verify Host System & Package Availability
SSH into the VPS and inspect the environment:

```bash
lsb_release -a
# Expected: Ubuntu 24.04 LTS
```

#### 2. Install Redis Server
```bash
sudo apt update
sudo apt install -y redis-server
```

#### 3. Secure & Harden Redis Configuration
Open `/etc/redis/redis.conf`:

```bash
sudo nano /etc/redis/redis.conf
```

Verify and enforce the following security parameters:
```conf
# 1. Bind strictly to localhost (NEVER expose to public internet)
bind 127.0.0.1 ::1

# 2. Enforce protected mode
protected-mode yes

# 3. Specify standard port
port 6379

# 4. Require strong authentication password (generate a 32+ character random string)
requirepass YOUR_STRONG_REDIS_PASSWORD_HERE

# 5. Set maximum memory policy for caching (e.g., 256MB)
maxmemory 256mb
maxmemory-policy allkeys-lru
```

#### 4. Firewall Hardening
Ensure port 6379 is blocked from external access:
```bash
sudo ufw status
# Port 6379 MUST NOT appear in the open external rules list
```

#### 5. Start and Enable Redis Systemd Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable redis-server
sudo systemctl restart redis-server
sudo systemctl status redis-server
```

Verify local response:
```bash
redis-cli -a YOUR_STRONG_REDIS_PASSWORD_HERE ping
# Expected: PONG
```

#### 6. Enable PHP Redis Extension in aaPanel
The live website uses PHP 8.2 (`enable-php-82.conf`).

1. Log in to the **aaPanel Web Dashboard** (`https://<vps-ip>:8888`).
2. Navigate to **App Store** -> **Installed**.
3. Locate **PHP 8.2** and click **Settings**.
4. Click on **Install Extensions**.
5. Find **redis** in the list and click **Install**.
6. Once installation completes, verify via SSH:
   ```bash
   /www/server/php/82/bin/php -m | grep -i redis
   # Expected output: redis
   ```
7. Reload PHP-FPM in aaPanel or via command line:
   ```bash
   sudo systemctl reload php8.2-fpm
   ```

#### 7. Configure Production Environment (`shared/.env`)
In `/www/wwwroot/nijamuddin-deploy/shared/.env`, configure:

```ini
CACHE_STORE=redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD_HERE
REDIS_DB=0
REDIS_CACHE_DB=1
REDIS_TIMEOUT=2.0
REDIS_READ_TIMEOUT=2.0
CACHE_PREFIX=nijam_prod_cache_
```

#### 8. Verify Connection & Cache Configuration
Run the non-destructive verification tool:

```bash
cd /www/wwwroot/nijamuddin-deploy/current/backend
php artisan redis:verify --store
```

Expected output:
```
==================================================================
Advocate Nijam Uddin CMS — Redis Diagnostic & Connectivity Check
==================================================================
+-------------------------+-------------------+
| Configuration Item      | Configured Value  |
+-------------------------+-------------------+
| Active CACHE_STORE      | redis             |
| Target Redis Connection | cache             |
| Redis Client Driver     | phpredis          |
| Redis Host:Port         | 127.0.0.1:6379    |
| Redis Database Index    | 1                 |
| Password Configured     | Yes (protected)   |
| Cache Key Prefix        | nijam_prod_cache_ |
+-------------------------+-------------------+

[1/4] Checking PHP Redis Client Extension...
  PASS: phpredis extension is active.
[2/4] Testing Redis Ping on connection 'cache'...
  PASS: Ping response received: PONG
[3/4] Performing Non-Destructive Key Write/Read/Delete...
  PASS: Test key successfully written, verified, and cleaned up.
[4/4] Verifying Laravel Cache Facade integration...
  PASS: Cache::store('redis') successfully stored, retrieved, and invalidated items.
==================================================================
STATUS: Redis connectivity & operations verified successfully!
==================================================================
```

---

### Graceful Fallback & Instant Rollback

If the Redis daemon requires maintenance, or if you need to bypass Redis at any point:

1. Open `/www/wwwroot/nijamuddin-deploy/shared/.env`:
   ```ini
   # Temporarily switch to file or database cache
   CACHE_STORE=file
   ```
2. Re-cache the configuration:
   ```bash
   cd /www/wwwroot/nijamuddin-deploy/current/backend
   php artisan config:clear
   php artisan config:cache
   ```
3. The application will instantly transition to file caching without throwing errors, dropping database queries, or disrupting visitors.

---

## Testing & Quality Assurance

The codebase enforces strict test coverage across authentication, authorization, CMS workflows, data sanitization, and security.

### Running Backend Tests (Laravel)

```bash
cd backend
php artisan test
```

* **Current Test Suite Status:** **322 tests passed (1,790 assertions)**, 1 skipped (real Redis integration test gracefully skipped when local phpredis is absent), 0 failures.
* **Test Suites Covered:**
  * `Tests\Feature\Auth`: Sanctum token lifecycle, login/logout, rate limiting, and password hashing.
  * `Tests\Feature\Auth\SuperAdminProvisioningTest`: Admin CLI provisioning, seeder idempotency, production guards, and overwrite prevention.
  * `Tests\Feature\Security`: OWASP headers, CORS origin verification, SQL injection immunity, XSS sanitization, mass assignment protection, and IDOR access barriers.
  * `Tests\Feature\Cms`: Homepage section sequencing, menu tree nesting, and 301 redirection integrity.
  * `Tests\Feature\Cms\RedisCacheIntegrationTest`: Versioned cache key permutations, Bangla/English locale separation, atomic namespace invalidation, TTL constant policy verification, safe CLI diagnostic execution, and real Redis integration.
  * Domain modules: Practice areas, courtroom cases, research papers, judgment reviews, publications, media, videos, and profile credentials.

### Running Frontend Typechecks & Production Build

```bash
cd frontend

# Run TypeScript compilation and Vite build
npm run build
```

* **Build Output:** Transforms all modules without TypeScript compilation errors into minified production assets in `frontend/dist/`.

---

## Production Deployment Architecture

The application is deployed to a **Hostinger VPS** running **Ubuntu 24.04 LTS** managed through **aaPanel** and **Nginx**.

### Server Environment
* **Domain:** `nijamuddin.com` / `www.nijamuddin.com`
* **Nginx Configuration:**
  * Static frontend assets are served directly from the compiled React build (`dist/assets/`).
  * API requests (`/api/v1/*`) and storage files (`/storage/*`) are routed to Laravel's `backend/public/index.php` via PHP-FPM 8.2 (`enable-php-82.conf`).
  * Single Page Application (SPA) client-side routing fallback is enabled (`try_files $uri $uri/ /index.html;`).
* **Database:** Production MySQL database (`nijam_mama_db`).

---

### Deployment Workflow with `deploy.sh`

The root directory contains an automated, multi-gate deployment script: [deploy.sh](deploy.sh).

```bash
./deploy.sh check     # 1. Audit server environment & prerequisites (read-only)
./deploy.sh build     # 2. Compile frontend assets & install composer dependencies
./deploy.sh deploy    # 3. Atomically activate release (Requires approval gate)
./deploy.sh rollback  # 4. Instant atomic rollback to previous known-good release
```

#### Step 1 — Pre-Flight Audit

```bash
./deploy.sh check
```
Verifies command binaries (`git`, `php`, `composer`, `node`, `npm`), required PHP extensions (`pdo_mysql`, `mbstring`, `gd`, `zip`, etc.), Nginx configuration syntax, and shared environment file existence.

#### Step 2 — Build Release Artifact

```bash
./deploy.sh build
```
Creates a timestamped release directory under `/www/wwwroot/nijamuddin-deploy/releases/<timestamp>`, builds the Vite frontend bundle (`npm run build`), and installs optimized Composer dependencies (`composer install --no-dev --optimize-autoloader`).

#### Step 3 — Live Release Activation
Deploying to production requires setting the explicit approval flag:

```bash
DEPLOY_APPROVED=true ./deploy.sh deploy
```
* Prompts operator for `ACTIVATE-PRODUCTION` confirmation (or consumes a single-use permit file in automated CI).
* Links persistent shared configuration (`shared/.env` and `shared/storage`).
* Executes safe database migrations: `php artisan migrate --force`.
* Re-caches framework config, routes, and views (`config:cache`, `route:cache`, `view:cache`).
* **Atomically switches** the live `current` symlink.
* Reloads PHP-FPM service (`systemctl reload php8.2-fpm`).
* Prunes older releases, retaining the last 5 builds.

---

### Atomic Release Structure

```
/www/wwwroot/nijamuddin-deploy/
├── shared/                          # Persistent data across releases
│   ├── .env                         # Server-only production environment file
│   └── storage/                     # Uploaded media, documents, and logs
│       ├── app/public/
│       ├── app/secure_docs/
│       └── logs/
├── releases/                        # Timestamped releases (last 5 retained)
│   ├── 20261009120000/
│   └── 20261009180000/
├── current -> releases/20261009180000/  # Active production symlink
└── deployment-logs/                 # Detailed execution logs
```

---

### Rollback Procedure

If an unexpected issue arises following a release activation:

```bash
./deploy.sh rollback
```

* Instantly points the `current` symlink to the previous timestamped release.
* Refreshes application caches.
* Restores frontend web root assets.
* Operates in seconds with zero database wiping.

---

## Security Posture & Configuration

1. **Credential Hygiene:** No real passwords, database secrets, or API keys are committed to Git. All templates use `.env.example`.
2. **Password Hashing:** Passwords utilize Bcrypt with `BCRYPT_ROUNDS=12`.
3. **Session & Token Invalidation:** Sanctum tokens are revocable and hashed in the database. Tokens are revoked upon logout.
4. **Mass-Assignment Protection:** All Eloquent models strictly declare `$fillable` fields.
5. **Form Sanitization & Anti-Spam:** Public contact and appointment submission forms are validated using Zod/Laravel form requests, sanitized against XSS payloads, and protected by invisible honeypots.
6. **Rate Limiting:** Authentication attempts are throttled by IP address (`throttle:auth`). Public API endpoints are bounded by rate limiters (`throttle:api`).
7. **OWASP Response Headers:** Nginx and Laravel middleware enforce `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Troubleshooting & FAQ

### 1. Database Connection Refused
* **Issue:** `SQLSTATE[HY000] [2002] Connection refused`.
* **Fix:** Verify MySQL is running (`sudo systemctl status mysql`) and confirm `DB_HOST`, `DB_PORT`, and `DB_DATABASE` in `backend/.env` match your database server.

### 2. Frontend API Calls Return 404 or CORS Error
* **Issue:** React app cannot communicate with Laravel API.
* **Fix:**
  * Confirm `VITE_API_BASE_URL` in `frontend/.env` points to `http://localhost:8000/api/v1`.
  * Ensure `CORS_ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:5173`.
  * Verify `php artisan serve` is active on port 8000.

### 3. Missing Storage Symlink
* **Issue:** Uploaded media or avatar images return 404.
* **Fix:** Run `php artisan storage:link` inside the `backend/` directory to recreate the `public/storage` symbolic link.

### 4. Admin Access Denied or Missing Super Admin
* **Issue:** Cannot log in at `/admin/login`.
* **Fix:** Provision or verify the super admin account:
  ```bash
  cd backend
  php artisan admin:create-super-admin
  ```

---

## License & Chamber Contact

### License
This software and associated legal portfolio content are proprietary. All rights reserved by **Advocate Nijam Uddin (Haq)**.

### Chamber Contact & Inquiries
* **Practitioner:** Advocate Nijam Uddin (Haq)
* **Jurisdiction:** Supreme Court of Bangladesh
* **Chamber Address:** Supreme Court Bar Association Building, Dhaka, Bangladesh
* **Official Website:** [https://nijamuddin.com](https://nijamuddin.com)
* **Repository:** [https://github.com/sahabuddin123/lawyer-protfolio](https://github.com/sahabuddin123/lawyer-protfolio)
