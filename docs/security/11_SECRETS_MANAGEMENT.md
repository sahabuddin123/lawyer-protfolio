# Secrets Management & Environment Hygiene

## 1. Executive Summary
Secrets exposure is one of the leading causes of modern infrastructure compromises. The Advocate Nijam Uddin platform enforces a zero-secrets-in-code policy across all repositories and environments.

---

## 2. Secrets Inventory & Protection Scope

| Secret Category | Description | Storage Medium | Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Application Key (`APP_KEY`)** | Laravel AES-256 session and cookie encryption key | `.env` on server | Excluded via `.gitignore`; generated via `php artisan key:generate` |
| **Database Credentials** | MySQL root/user password (`DB_PASSWORD`) | `.env` on server | Excluded via `.gitignore`; restricted to localhost |
| **Sanctum Hash Salt** | Token hashing secret | Internal Framework | Cryptographically secure random tokens, hashed via SHA-256 |
| **Mail Server Credentials** | SMTP username and password | `.env` on server | Excluded via `.gitignore` |
| **Third-Party API Keys** | Analytics / Maps / Cloud APIs | `.env` on server | Excluded via `.gitignore` |

---

## 3. Git Repository Secrets Scan & Hygiene

### 3.1 Git Secret Audit Performed
During Phase 18, a comprehensive regular expression and entropy scan was conducted across the Git repository for tokens, private keys, passwords, and API secrets:
- Search patterns: `password`, `secret`, `token`, `api_key`, `private_key`, `APP_KEY`, `DB_PASSWORD`.
- **Findings:**
  - Zero private keys or production secrets exist in the git history or working tree.
  - Development placeholders (`base64:...` sample keys in `.env.example`) are clearly designated as non-production templates.

### 3.2 Gitignore Enforcements
Both frontend and backend repositories strictly ignore all local environment configuration:
- `backend/.gitignore`: Ignores `.env`, `.env.backup`, `.env.production`.
- `frontend/.gitignore`: Ignores `.env`, `.env.local`, `.env.*.local`, `.env.production` (exempting `.env.example`).
- Root `.gitignore`: Ignores root environment files and IDE/OS caches.

---

## 4. Frontend Environment Security
- The React application utilizes Vite's `import.meta.env` system.
- **Rule:** Only variables prefixed with `VITE_` are bundled into client-side JavaScript.
- **Audit Result:** No backend secrets, database connection strings, or administrative private keys are prefixed with `VITE_`.
- Publicly visible frontend environment variables are limited to:
  - `VITE_API_URL`
  - `VITE_APP_NAME`
  - `VITE_APP_URL`

---

## 5. Production Environment Separation
- **Development:** Uses local WAMP MySQL / SQLite for tests with debug enabled locally.
- **Staging/Production Requirements:**
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - Unique production `APP_KEY`
  - Dedicated least-privilege MySQL user (`SELECT`, `INSERT`, `UPDATE`, `DELETE` only; no `SUPER`, `FILE`, `GRANT`).
