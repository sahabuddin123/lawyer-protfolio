# 08 — Continuous Update & Release Workflow Runbook
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio Website  
**Repository:** `https://github.com/sahabuddin123/lawyer-protfolio` (Branch: `main`)  
**Server Target:** Hostinger VPS (aaPanel / Ubuntu 24.04 LTS)  
**Execution Location:** `/www/wwwroot/nijamuddin-deploy/repo`  

---

## 1. Release Workflow Lifecycle

The standard release workflow guarantees zero-downtime, safe migrations, and instantaneous rollback capability.

```
[ Developer / CI ] ──push──> [ GitHub main ]
                                    │
                              (SSH to VPS)
                                    ▼
                     cd /www/wwwroot/nijamuddin-deploy/repo
                                    │
                             git fetch / pull
                                    │
                             ./deploy.sh check
                                    │
                             ./deploy.sh build
                                    │
                   [ PRE-ACTIVATION VALIDATION GATE ]
                                    │
                DEPLOY_APPROVED=true ./deploy.sh deploy
                                    │
                             Smoke Tests
```

---

## 2. Step-by-Step Release Instructions

### Step 1: Access Deployment Directory & Fetch Changes
```bash
cd /www/wwwroot/nijamuddin-deploy/repo

# Ensure working directory is clean
git status --short

# Fetch approved commits from origin
git fetch origin main

# Inspect incoming commit log
git log HEAD..origin/main --oneline

# Merge approved changes
git pull origin main
```

### Step 2: Review Database Migrations
Always inspect whether incoming changes include new database migrations:
```bash
git diff HEAD@{1} HEAD -- backend/database/migrations/
```
If new migrations alter table structures, ensure they are non-destructive and backward compatible.

### Step 3: Run Environment & Pre-Flight Checks
```bash
./deploy.sh check
```
Verifies command paths, PHP 8.2 modules, and Nginx syntax.

### Step 4: Build Release Candidate
```bash
./deploy.sh build
```
This performs:
- Asset compilation via `npm run build` in an isolated release folder.
- Backend dependency resolution via `composer install --no-dev`.
- **The live production website remains untouched during this step.**

### Step 5: Authorization Gate
Confirm with the Project Director:
- Commit hash to be activated.
- Tested features and bug fixes.
- Database migration safety.

### Step 6: Activate Release
```bash
DEPLOY_APPROVED=true ./deploy.sh deploy
```
This triggers:
1. Linking persistent storage (`uploads`, `secure_docs`) and `.env`.
2. Safe database migration execution (`php artisan migrate --force`).
3. Optimization caches: `config:cache`, `route:cache`, `view:cache`.
4. Atomic switch of `/www/wwwroot/nijamuddin-deploy/current`.
5. Frontend static asset sync to `/www/wwwroot/nijamuddin.com`.
6. Graceful reload of `php8.2-fpm`.

### Step 7: Post-Deployment Smoke Verification
```bash
# Run automated smoke test script
bash /www/wwwroot/nijamuddin-deploy/repo/docs/deployment/14_SMOKE_TESTS.sh
```

---

## 3. Handling Failed Releases

If any step in `./deploy.sh deploy` fails before completion:
- The atomic symlink is **NOT** switched.
- The previous release remains active and serving traffic.
- Check the detailed execution log in `/www/wwwroot/nijamuddin-deploy/deployment-logs/deploy_<TIMESTAMP>.log`.

If a post-activation defect is discovered:
```bash
./deploy.sh rollback
```
This reverts the application symlink to the previous known-good release in under 5 seconds.
