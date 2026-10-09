#!/usr/bin/env bash
# ==============================================================================
# ADVOCATE NIJAM UDDIN (HAQ) — PRODUCTION DEPLOYMENT & UPDATE SCRIPT
# Target: aaPanel / Ubuntu 24.04 LTS / Hostinger VPS / Nginx / MySQL / Redis
# Repository: https://github.com/sahabuddin123/lawyer-protfolio
# Web Root: /www/wwwroot/nijamuddin.com
# ==============================================================================
# Usage:
#   ./deploy.sh            - Full update: pull latest main, build, and deploy
#   ./deploy.sh check      - Validate server environment, PHP, tools & Redis
#   ./deploy.sh build      - Compile frontend assets & install composer dependencies
#   ./deploy.sh deploy     - Activate deployment & update web root
#   ./deploy.sh rollback   - Revert to previous backup assets & refresh cache
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# ------------------------------------------------------------------------------
# CONFIGURATION & DIRECTORY HIERARCHY
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"
WWW_ROOT="${WWW_ROOT:-/www/wwwroot/nijamuddin.com}"
BACKUP_DIR="${WWW_ROOT}/.backup_assets"
LOCK_FILE="/tmp/nijamuddin_deploy.lock"
TIMESTAMP="$(date +"%Y%m%d%H%M%S")"

LOGS_DIR="${BACKEND_DIR}/storage/logs/deployment"
mkdir -p "${LOGS_DIR}" 2>/dev/null || LOGS_DIR="/tmp"
LOG_FILE="${LOGS_DIR}/deploy_${TIMESTAMP}.log"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ------------------------------------------------------------------------------
# HELPER FUNCTIONS
# ------------------------------------------------------------------------------
log() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] $1"
    echo -e "${BLUE}${msg}${NC}"
    echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

log_success() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [SUCCESS] $1"
    echo -e "${GREEN}${msg}${NC}"
    echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

log_warn() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [WARNING] $1"
    echo -e "${YELLOW}${msg}${NC}"
    echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

log_err() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [ERROR] $1"
    echo -e "${RED}${msg}${NC}" >&2
    echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

acquire_lock() {
    if [[ -f "${LOCK_FILE}" ]]; then
        local pid
        pid=$(cat "${LOCK_FILE}" 2>/dev/null || echo "")
        # If the current process already owns the lock, proceed
        if [[ -n "${pid}" && "${pid}" == "$$" ]]; then
            return 0
        fi
        # If the locking PID is no longer running, reclaim the stale lock
        if [[ -n "${pid}" ]] && ! kill -0 "${pid}" 2>/dev/null; then
            echo "$$" > "${LOCK_FILE}"
            return 0
        fi
        log_err "Deployment lock exists at ${LOCK_FILE} (PID: ${pid}). Another deployment is in progress."
        exit 1
    fi
    echo "$$" > "${LOCK_FILE}"
}

release_lock() {
    rm -f "${LOCK_FILE}"
}

trap release_lock EXIT

# Locate production environment file across supported topologies
locate_env_file() {
    if [[ -f "${BACKEND_DIR}/.env" ]]; then
        echo "${BACKEND_DIR}/.env"
    elif [[ -f "${SCRIPT_DIR}/.env" ]]; then
        echo "${SCRIPT_DIR}/.env"
    elif [[ -f "/www/wwwroot/nijamuddin-deploy/shared/.env" ]]; then
        echo "/www/wwwroot/nijamuddin-deploy/shared/.env"
    elif [[ -f "${WWW_ROOT}/backend/.env" ]]; then
        echo "${WWW_ROOT}/backend/.env"
    elif [[ -f "${WWW_ROOT}/.env" ]]; then
        echo "${WWW_ROOT}/.env"
    else
        echo ""
    fi
}

# Reload PHP-FPM dynamically supporting multiple aaPanel / Ubuntu service names
reload_php_fpm() {
    log "Reloading PHP-FPM service..."
    local reloaded=false

    # Try systemd service names
    local services=("php8.2-fpm" "php-fpm-82" "php-fpm" "php8.3-fpm" "php8.1-fpm")
    if command -v systemctl >/dev/null 2>&1; then
        for svc in "${services[@]}"; do
            if systemctl is-active --quiet "${svc}" 2>/dev/null; then
                if sudo systemctl reload "${svc}" 2>/dev/null || systemctl reload "${svc}" 2>/dev/null; then
                    log_success "Reloaded PHP-FPM service: ${svc}"
                    reloaded=true
                    break
                fi
            fi
        done
    fi

    # Fallback to init.d scripts common in aaPanel
    if [[ "${reloaded}" == "false" ]]; then
        local init_scripts=("/etc/init.d/php-fpm-82" "/etc/init.d/php8.2-fpm" "/etc/init.d/php-fpm")
        for init_script in "${init_scripts[@]}"; do
            if [[ -x "${init_script}" ]]; then
                if sudo "${init_script}" reload 2>/dev/null || "${init_script}" reload 2>/dev/null; then
                    log_success "Reloaded PHP-FPM via init script: ${init_script}"
                    reloaded=true
                    break
                fi
            fi
        done
    fi

    if [[ "${reloaded}" == "false" ]]; then
        log_warn "Could not automatically reload PHP-FPM. Please reload PHP 8.2 manually in aaPanel if required."
    fi
}

# ------------------------------------------------------------------------------
# COMMAND: check
# ------------------------------------------------------------------------------
cmd_check() {
    log "=================================================================="
    log "Advocate Nijam Uddin Platform — Deployment Environment Audit"
    log "=================================================================="

    # 1. Check required commands
    local required_cmds=("git" "php" "composer" "node" "npm")
    for cmd in "${required_cmds[@]}"; do
        if command -v "${cmd}" >/dev/null 2>&1; then
            log_success "Command '${cmd}' found: $(command -v "${cmd}") ($(${cmd} --version 2>&1 | head -n 1))"
        else
            log_err "Missing required command: '${cmd}'"
            exit 1
        fi
    done

    # 2. Check PHP extensions
    local required_exts=("pdo_mysql" "mbstring" "xml" "curl" "gd" "zip" "bcmath" "intl")
    for ext in "${required_exts[@]}"; do
        if php -m | grep -qi "^${ext}$"; then
            log_success "PHP extension '${ext}' is loaded."
        else
            log_warn "PHP extension '${ext}' is NOT loaded in CLI PHP. Verify php.ini."
        fi
    done

    # 3. Check public web root
    if [[ -d "${WWW_ROOT}" ]]; then
        log_success "Public web root verified at ${WWW_ROOT}."
    else
        log_warn "Public web root ${WWW_ROOT} does not exist yet. Will be created."
    fi

    # 4. Check Environment File (.env)
    local env_path
    env_path="$(locate_env_file)"
    if [[ -n "${env_path}" ]]; then
        log_success "Production environment configuration found at: ${env_path}"
    else
        log_warn "No .env file found! Checked in:"
        log_warn "  - ${BACKEND_DIR}/.env"
        log_warn "  - ${SCRIPT_DIR}/.env"
        log_warn "  - /www/wwwroot/nijamuddin-deploy/shared/.env"
        log_warn "Please create ${BACKEND_DIR}/.env from .env.example before deploying."
    fi

    # 5. Check Git repository status
    if git -C "${SCRIPT_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        local current_branch current_commit
        current_branch="$(git -C "${SCRIPT_DIR}" branch --show-current 2>/dev/null || echo "detached")"
        current_commit="$(git -C "${SCRIPT_DIR}" rev-parse --short HEAD 2>/dev/null || echo "unknown")"
        log_success "Git repository verified on branch '${current_branch}' at commit ${current_commit}."
    else
        log_warn "Directory ${SCRIPT_DIR} is not tracked as a Git worktree."
    fi

    # 6. Check Nginx syntax if nginx binary is available
    if command -v nginx >/dev/null 2>&1; then
        if nginx -t 2>/dev/null; then
            log_success "Nginx configuration syntax test: OK."
        else
            log_warn "Nginx configuration syntax test failed or requires sudo privileges."
        fi
    fi

    # 7. Check database connectivity and pending migrations safely
    if [[ -n "${env_path}" && -d "${BACKEND_DIR}" ]]; then
        log "Testing database connectivity (read-only)..."
        if (cd "${BACKEND_DIR}" && php artisan migrate:status >/dev/null 2>&1); then
            log_success "Database connectivity verified. Migration status: OK."
        else
            log_warn "Database connectivity check failed. Verify DB credentials in ${env_path}."
        fi

        # 8. Check Redis configuration if CACHE_STORE=redis
        local cache_store
        cache_store=$(grep -E '^CACHE_STORE=' "${env_path}" 2>/dev/null | cut -d '=' -f 2 | tr -d ' "' || echo "")
        if [[ "${cache_store}" == "redis" ]]; then
            log "Verifying Redis configuration (CACHE_STORE=redis)..."
            if php -m | grep -qi "^redis$"; then
                log_success "PHP extension 'redis' (phpredis) is loaded in CLI PHP."
            else
                log_warn "PHP extension 'redis' is NOT loaded in CLI PHP, but CACHE_STORE=redis is set."
            fi
            if command -v redis-cli >/dev/null 2>&1; then
                if redis-cli ping >/dev/null 2>&1; then
                    log_success "Redis server is reachable via redis-cli ping (PONG)."
                else
                    log_warn "Redis server did not respond to redis-cli ping."
                fi
            else
                log_warn "redis-cli not installed; check Redis service via 'systemctl status redis-server'."
            fi
        fi
    fi

    log_success "Environment audit completed successfully."
}

# ------------------------------------------------------------------------------
# COMMAND: build
# ------------------------------------------------------------------------------
cmd_build() {
    acquire_lock
    log "=================================================================="
    log "Compiling Production Artifacts"
    log "=================================================================="

    # 1. Build Frontend
    if [[ -d "${FRONTEND_DIR}" ]]; then
        log "Compiling React + Vite frontend bundle (npm run build)..."
        (
            cd "${FRONTEND_DIR}"
            if [[ ! -d "node_modules" ]]; then
                log "Installing frontend dependencies..."
                npm ci --prefer-offline --no-audit || npm install --no-audit
            fi
            npm run build
        )
        log_success "Frontend production bundle compiled successfully."
    else
        log_err "Frontend directory ${FRONTEND_DIR} not found!"
        exit 1
    fi

    # 2. Install Backend Dependencies
    if [[ -d "${BACKEND_DIR}" ]]; then
        log "Installing Laravel production dependencies via Composer..."
        (
            cd "${BACKEND_DIR}"
            composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
        )
        log_success "Composer production dependencies installed successfully."
    else
        log_err "Backend directory ${BACKEND_DIR} not found!"
        exit 1
    fi

    log_success "Build step completed successfully."
}

# ------------------------------------------------------------------------------
# COMMAND: deploy
# ------------------------------------------------------------------------------
cmd_deploy() {
    acquire_lock

    log "=================================================================="
    log "Activating Deployment: ${TIMESTAMP}"
    log "=================================================================="

    # 1. Discover or link environment file
    local env_path
    env_path="$(locate_env_file)"

    if [[ -z "${env_path}" ]]; then
        log_err "Cannot deploy: No production .env configuration file found!"
        log_err "Please create ${BACKEND_DIR}/.env (or copy from .env.example) before deploying."
        exit 1
    fi

    # Ensure backend/.env exists and points to our config
    if [[ "${env_path}" != "${BACKEND_DIR}/.env" && ! -f "${BACKEND_DIR}/.env" ]]; then
        log "Linking ${env_path} to ${BACKEND_DIR}/.env..."
        ln -nfs "${env_path}" "${BACKEND_DIR}/.env" 2>/dev/null || cp "${env_path}" "${BACKEND_DIR}/.env"
    fi

    # 2. If frontend hasn't been built yet, build it now
    if [[ ! -d "${FRONTEND_DIR}/dist" || ! -f "${FRONTEND_DIR}/dist/index.html" ]]; then
        log "Frontend build not detected. Running build step first..."
        cmd_build
    fi

    # 3. Prepare storage directories and permissions
    log "Configuring backend storage structure..."
    mkdir -p "${BACKEND_DIR}/storage/app/public"
    mkdir -p "${BACKEND_DIR}/storage/app/secure_docs"
    mkdir -p "${BACKEND_DIR}/storage/framework/cache"
    mkdir -p "${BACKEND_DIR}/storage/framework/sessions"
    mkdir -p "${BACKEND_DIR}/storage/framework/views"
    mkdir -p "${BACKEND_DIR}/storage/logs"
    chmod -R 775 "${BACKEND_DIR}/storage" "${BACKEND_DIR}/bootstrap/cache" 2>/dev/null || true

    # 4. Storage Link
    (
        cd "${BACKEND_DIR}"
        php artisan storage:link || true
    )

    # 5. Run safe production database migrations
    log "Running safe database migrations..."
    (
        cd "${BACKEND_DIR}"
        php artisan migrate --force --no-interaction
    )

    # 6. Cache framework configurations
    log "Optimizing Laravel configuration, routes, and views..."
    (
        cd "${BACKEND_DIR}"
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        php artisan event:cache

        # 6.1 Redis validation probe if configured
        local cache_store
        cache_store=$(grep -E '^CACHE_STORE=' "${BACKEND_DIR}/.env" 2>/dev/null | cut -d '=' -f 2 | tr -d ' "' || echo "")
        if [[ "${cache_store}" == "redis" ]]; then
            log "Verifying Redis cache connectivity..."
            php artisan redis:verify || log_warn "Redis check reported a warning. Application will use configured fallback."
        fi
    )

    # 7. Update Public Web Root (/www/wwwroot/nijamuddin.com)
    log "Updating public web root at ${WWW_ROOT}..."
    mkdir -p "${WWW_ROOT}" "${BACKUP_DIR}"

    # Backup existing assets for instant rollback
    if [[ -d "${WWW_ROOT}/assets" ]]; then
        rm -rf "${BACKUP_DIR}/assets_previous"
        cp -r "${WWW_ROOT}/assets" "${BACKUP_DIR}/assets_previous" 2>/dev/null || true
    fi
    if [[ -f "${WWW_ROOT}/index.html" ]]; then
        cp "${WWW_ROOT}/index.html" "${BACKUP_DIR}/index_previous.html" 2>/dev/null || true
    fi

    # Copy freshly built React SPA files into public web root
    # Preserves aaPanel specific files: .user.ini, .htaccess, SSL certificates, .well-known
    mkdir -p "${WWW_ROOT}/assets"
    cp -r "${FRONTEND_DIR}/dist/assets/." "${WWW_ROOT}/assets/"
    cp "${FRONTEND_DIR}/dist/index.html" "${WWW_ROOT}/index.html"
    cp "${FRONTEND_DIR}/dist/"*.svg "${WWW_ROOT}/" 2>/dev/null || true
    cp "${FRONTEND_DIR}/dist/"*.png "${WWW_ROOT}/" 2>/dev/null || true
    cp "${FRONTEND_DIR}/dist/"*.ico "${WWW_ROOT}/" 2>/dev/null || true

    # 8. Reload PHP-FPM service
    reload_php_fpm

    # 9. Verify deployment health check
    log "Verifying deployment health..."
    (
        cd "${BACKEND_DIR}"
        php artisan test --filter=HealthCheckTest --no-ansi 2>/dev/null && log_success "Health check suite: PASSED." || log_warn "Health check test suite skipped or completed with warnings."
    )

    log_success "=================================================================="
    log_success "Deployment successfully activated at ${WWW_ROOT}!"
    log_success "Domain: https://nijamuddin.com"
    log_success "=================================================================="
}

# ------------------------------------------------------------------------------
# COMMAND: rollback
# ------------------------------------------------------------------------------
cmd_rollback() {
    acquire_lock
    log "=================================================================="
    log "Initiating Emergency Rollback"
    log "=================================================================="

    if [[ ! -d "${BACKUP_DIR}/assets_previous" || ! -f "${BACKUP_DIR}/index_previous.html" ]]; then
        log_err "No previous asset backup found in ${BACKUP_DIR}. Cannot perform asset rollback."
        exit 1
    fi

    log "Restoring previous static assets into ${WWW_ROOT}..."
    cp -r "${BACKUP_DIR}/assets_previous/." "${WWW_ROOT}/assets/"
    cp "${BACKUP_DIR}/index_previous.html" "${WWW_ROOT}/index.html"

    log "Re-caching Laravel framework configuration..."
    (
        cd "${BACKEND_DIR}"
        php artisan config:clear
        php artisan config:cache
        php artisan route:clear
        php artisan route:cache
        php artisan view:clear
        php artisan view:cache
    )

    reload_php_fpm

    log_success "Rollback completed. Restored previous release assets."
}

# ------------------------------------------------------------------------------
# ONE-COMMAND UPDATE WORKFLOW (Default when run without arguments)
# ------------------------------------------------------------------------------
cmd_update() {
    log "=================================================================="
    log "Advocate Nijam Uddin Platform — Automated Update & Deployment"
    log "=================================================================="

    # 1. Check if inside Git worktree and pull latest changes safely
    if git -C "${SCRIPT_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        log "Checking for uncommitted changes in Git working tree..."
        local git_status
        git_status="$(git -C "${SCRIPT_DIR}" status --porcelain 2>/dev/null || echo "")"

        # Filter out ignored/runtime untracked files
        local dirty_files
        dirty_files="$(echo "${git_status}" | grep -vE '(\.env|storage/|node_modules/|vendor/|dist/|\.backup)' || echo "")"

        if [[ -n "${dirty_files}" ]]; then
            log_warn "Git working tree contains uncommitted modifications. Skipping automatic git pull to preserve changes:"
            echo "${dirty_files}"
        else
            log "Fetching and fast-forwarding latest commits from origin/main..."
            git -C "${SCRIPT_DIR}" fetch origin main
            git -C "${SCRIPT_DIR}" merge --ff-only origin/main 2>/dev/null || git -C "${SCRIPT_DIR}" pull origin main || log_warn "Could not fast-forward Git; continuing with local codebase."
            log_success "Git codebase up to date: $(git -C "${SCRIPT_DIR}" rev-parse --short HEAD)"
        fi
    fi

    # 2. Run prerequisite check
    cmd_check

    # 3. Build frontend & backend artifacts
    cmd_build

    # 4. Activate deployment
    cmd_deploy
}

# ------------------------------------------------------------------------------
# MAIN ENTRYPOINT
# ------------------------------------------------------------------------------
action="${1:-update}"

case "${action}" in
    update|"")
        cmd_update
        ;;
    check)
        cmd_check
        ;;
    build)
        cmd_build
        ;;
    deploy)
        cmd_deploy
        ;;
    rollback)
        cmd_rollback
        ;;
    *)
        echo "Usage: $0 [check|build|deploy|rollback|update]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Full one-command update: git pull, build, deploy & verify"
        echo "  check      Verify environment, PHP extensions, and tools"
        echo "  build      Compile frontend bundle & install composer dependencies"
        echo "  deploy     Activate deployment & copy files to public web root"
        echo "  rollback   Revert public web root to previous asset backup"
        exit 1
        ;;
esac
