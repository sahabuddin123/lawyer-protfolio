# 02 — Public GitHub Repository Hygiene & Secret Protection
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Repository:** `https://github.com/sahabuddin123/lawyer-protfolio`  
**Visibility:** **PUBLIC**  

---

## 1. Public Repository Security Rules

Because `https://github.com/sahabuddin123/lawyer-protfolio` is a public repository, any committed file or commit in Git history is immediately visible to anyone worldwide.

### Mandatory Rules:
1. **Never commit `.env` or `.env.*`:** Only `.env.example` and `.env.production.example` (with dummy placeholders) are permitted.
2. **Never commit SQLite databases or SQL dumps:** Exclude `*.sqlite`, `*.sqlite3`, `*.sql`, `*.sql.gz`, `*.dump`.
3. **Never commit private client consultation records or confidential case evidence.**
4. **Never hardcode passwords or API keys in code or scripts:** The MySQL credentials for `nijam_mama_db` must exist ONLY in `/www/wwwroot/nijamuddin-deploy/shared/.env` on the private server.

---

## 2. Root `.gitignore` Implementation

The root `.gitignore` file enforces exclusion of sensitive files:

```gitignore
# System and IDE
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
*.bak
*.tmp

# Environment and secrets
.env
.env.*
!.env.example
!.env.production.example
!.env.testing.example
*.local

# Dependencies
/backend/vendor/
/frontend/node_modules/
node_modules/
vendor/

# Build artifacts & coverage
/frontend/dist/
/frontend/coverage/
dist/
dist-ssr/
public/build/
public/hot/

# Laravel runtime files
/backend/storage/logs/*
/backend/storage/framework/cache/*
/backend/storage/framework/sessions/*
/backend/storage/framework/views/*
/backend/bootstrap/cache/*.php
/backend/public/storage
storage/*.key
.phpunit.result.cache

# Database exports and backups
*.sql
*.sql.gz
*.dump
*.sqlite
*.sqlite3
*.backup
backend/database/*.sqlite
backend/database/*.sqlite3
```

---

## 3. Secret Rotation Advice
If any password, application key, or credential was ever pushed in previous commits or chat transcripts:
- **Rotate the credential immediately.**
- Simply deleting a secret in a new commit does not scrub it from Git history.
- On the server, generate a fresh `APP_KEY` via `php artisan key:generate` and set a newly generated, strong password for the MySQL user `nijam_mama_db`.
