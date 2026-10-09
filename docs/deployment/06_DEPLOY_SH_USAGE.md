# 06 — `deploy.sh` Script Specification & Usage Guide
**Project:** Advocate Nijam Uddin (Haq) — Premium Lawyer Portfolio & Legal Authority Website  
**Script Path:** `/deploy.sh`  
**Target Environment:** Hostinger VPS (Ubuntu 24.04 LTS / aaPanel / Nginx / MySQL)  
**Execution Context:** Deployments must be run from `/www/wwwroot/nijamuddin-deploy` or the repository root.

---

## 1. Script Architecture & Philosophy

The `deploy.sh` script is an atomic, zero-downtime deployment automation engine designed with the following safety and reliability principles:

1. **Default-Disabled Activation Gate:** Live deployment (`./deploy.sh deploy`) requires the environment variable `DEPLOY_APPROVED=true`. Without this flag, the script immediately aborts with exit code 1 to prevent unintended production modifications.
2. **Atomic Symlink Switching:** The active application points to `/www/wwwroot/nijamuddin-deploy/current` via an atomic directory replacement (`mv -Tf`). If any build, dependency installation, or migration step fails, the live site remains completely unaffected.
3. **Lock Protection:** A mutex lock file `/tmp/nijamuddin_deploy.lock` prevents concurrent deployment processes.
4. **Persistent State Isolation:** `.env` credentials, public media uploads, and private confidential documents are stored in `/www/wwwroot/nijamuddin-deploy/shared/` and are symlinked into releases. No release file touches or overwrites persistent data.
5. **Release History & Rollback:** The script retains the 5 most recent releases in `/www/wwwroot/nijamuddin-deploy/releases/`, allowing sub-second rollbacks via `./deploy.sh rollback`.
6. **Detailed Audit Logging:** Every command logs timestamps and exit statuses to `/www/wwwroot/nijamuddin-deploy/deployment-logs/deploy_<timestamp>.log`.

---

## 2. Command Reference

```bash
./deploy.sh <command>
```

| Command | Purpose | Production Modification? | Approval Gate Required? |
|---|---|---|---|
| `check` | Verifies runtime tools, PHP extensions, Git state, and directories | **No** (Read-Only) | No |
| `build` | Clones/copies code, installs `npm` & `composer` deps, compiles Vite bundle | **No** (Builds into staging release) | No |
| `deploy`| Symlinks persistent data, runs safe migrations, caches configs, switches symlink | **Yes** (Activates release) | **Yes** (`DEPLOY_APPROVED=true`) |
| `rollback` | Reverts symlink to previous release in `/releases` directory | **Yes** (Reverts active release) | No (Immediate recovery) |

---

## 3. Subcommand Detailed Workflows

### 3.1 `check`
Audits the host environment without touching any live state.
```bash
./deploy.sh check
```
**Verification Steps Performed:**
- Confirms presence of `git`, `php`, `composer`, `node`, `npm`.
- Validates PHP 8.2 extensions: `pdo_mysql`, `mbstring`, `xml`, `curl`, `gd`, `zip`, `bcmath`, `intl`.
- Checks existence of shared directory and `/www/wwwroot/nijamuddin-deploy/shared/.env`.
- Audits active Git branch and short commit hash.
- Validates Nginx syntax (`nginx -t`) if available.

### 3.2 `build`
Prepares a release candidate artifact without affecting the active application.
```bash
./deploy.sh build
```
**Execution Steps:**
1. Acquires `/tmp/nijamuddin_deploy.lock`.
2. Creates unique timestamped directory: `/www/wwwroot/nijamuddin-deploy/releases/<TIMESTAMP>`.
3. Copies source files (`backend` and `frontend`).
4. Executes `npm ci` and `npm run build` in release frontend.
5. Executes `composer install --no-dev --optimize-autoloader` in release backend.
6. Releases mutex lock and reports release artifact location.

### 3.3 `deploy`
Activates the release candidate. **Requires explicit Project Director authorization.**
```bash
DEPLOY_APPROVED=true ./deploy.sh deploy
```
**Execution Steps:**
1. Checks `DEPLOY_APPROVED=true`. Exits if unset or false.
2. Acquires `/tmp/nijamuddin_deploy.lock`.
3. Ensures shared folders exist:
   - `shared/storage/app/public` (Public uploads)
   - `shared/storage/app/secure_docs` (Private case files)
   - `shared/storage/framework/{cache,sessions,views}`
   - `shared/storage/logs`
4. Symlinks `shared/.env` and `shared/storage` into release directory.
5. Runs `php artisan storage:link`.
6. Executes non-destructive database migrations: `php artisan migrate --force`.
7. Pre-caches Laravel runtime: `config:cache`, `route:cache`, `view:cache`, `event:cache`.
8. Atomically points symlink `/www/wwwroot/nijamuddin-deploy/current` to new release.
9. Copies compiled frontend assets into aaPanel web root `/www/wwwroot/nijamuddin.com`.
10. Reloads `php8.2-fpm` service if available.
11. Prunes releases older than the 5 most recent.
12. Releases lock.

### 3.4 `rollback`
Instantly restores the previous release if a regression is detected.
```bash
./deploy.sh rollback
```
**Execution Steps:**
1. Identifies the second most recent directory in `/releases/`.
2. Switches `/www/wwwroot/nijamuddin-deploy/current` symlink to that directory atomically.
3. Re-caches configuration on the rolled back release.
4. Reloads `php8.2-fpm`.
5. Logs rollback details.

---

## 4. Exit Codes & Error Handling

- `0`: Operation succeeded cleanly.
- `1`: Operation failed (e.g. missing dependency, failed build, database connection error, approval gate omitted).
- Automatic cleanup: Mutex lock is removed upon script exit via Bash `trap release_lock EXIT`.
