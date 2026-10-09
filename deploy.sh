#!/usr/bin/env bash
# ==============================================================================
# ADVOCATE NIJAM UDDIN (HAQ) — ENTERPRISE DEPLOYMENT SCRIPT
# Target: aaPanel / Ubuntu 24.04 LTS / Hostinger VPS / Nginx / MySQL
# Repository: https://github.com/sahabuddin123/lawyer-protfolio
# ==============================================================================
# Usage:
#   ./deploy.sh check     - Validate environment, prerequisites & connectivity
#   ./deploy.sh build     - Prepare a new release & compile static assets
#   ./deploy.sh deploy    - Atomically deploy release (Requires DEPLOY_APPROVED=true)
#   ./deploy.sh rollback  - Revert to previous known-good release atomically
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# ------------------------------------------------------------------------------
# CONFIGURATION & DIRECTORY HIERARCHY
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DEPLOY_DIR="${BASE_DEPLOY_DIR:-/www/wwwroot/nijamuddin-deploy}"
WWW_ROOT="${WWW_ROOT:-/www/wwwroot/nijamuddin.com}"
SHARED_DIR="${BASE_DEPLOY_DIR}/shared"
RELEASES_DIR="${BASE_DEPLOY_DIR}/releases"
CURRENT_SYMLINK="${BASE_DEPLOY_DIR}/current"
LOGS_DIR="${BASE_DEPLOY_DIR}/deployment-logs"
LOCK_FILE="/tmp/nijamuddin_deploy.lock"

TIMESTAMP="$(date +"%Y%m%d%H%M%S")"
NEW_RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"
LOG_FILE="${LOGS_DIR}/deploy_${TIMESTAMP}.log"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ------------------------------------------------------------------------------
# HELPER FUNCTIONS
# ------------------------------------------------------------------------------
log() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] $1"
    echo -e "${BLUE}${msg}${NC}"
    if [[ -d "${LOGS_DIR}" ]]; then
        echo "${msg}" >> "${LOG_FILE}"
    fi
}

log_success() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [SUCCESS] $1"
    echo -e "${GREEN}${msg}${NC}"
    if [[ -d "${LOGS_DIR}" ]]; then
        echo "${msg}" >> "${LOG_FILE}"
    fi
}

log_warn() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [WARNING] $1"
    echo -e "${YELLOW}${msg}${NC}"
    if [[ -d "${LOGS_DIR}" ]]; then
        echo "${msg}" >> "${LOG_FILE}"
    fi
}

log_err() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [ERROR] $1"
    echo -e "${RED}${msg}${NC}" >&2
    if [[ -d "${LOGS_DIR}" ]]; then
        echo "${msg}" >> "${LOG_FILE}"
    fi
}

acquire_lock() {
    if [[ -f "${LOCK_FILE}" ]]; then
        log_err "Deployment lock exists at ${LOCK_FILE}. Another deployment is currently in progress."
        exit 1
    fi
    touch "${LOCK_FILE}"
}

release_lock() {
    rm -f "${LOCK_FILE}"
}

trap release_lock EXIT

# ------------------------------------------------------------------------------
# COMMAND: check
# ------------------------------------------------------------------------------
cmd_check() {
    log "=================================================================="
    log "Running Deployment Environment Audit & Prerequisite Check"
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
            log_warn "PHP extension '${ext}' is NOT loaded. Verify php.ini."
        fi
    done

    # 3. Check shared directory setup
    if [[ -d "${SHARED_DIR}" ]]; then
        log_success "Shared directory exists at ${SHARED_DIR}."
    else
        log_warn "Shared directory does NOT exist yet at ${SHARED_DIR}. Will be initialized during first deploy."
    fi

    # 4. Check shared .env
    if [[ -f "${SHARED_DIR}/.env" ]]; then
        log_success "Production shared .env exists at ${SHARED_DIR}/.env."
    else
        log_warn "Shared production .env does NOT exist at ${SHARED_DIR}/.env."
        log_warn "Please create ${SHARED_DIR}/.env using .env.example before running './deploy.sh deploy'."
    fi

    # 5. Check Git repository status
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        local current_branch
        current_branch="$(git branch --show-current)"
        local current_commit
        current_commit="$(git rev-parse --short HEAD)"
        log_success "Git repository verified on branch '${current_branch}' at commit ${current_commit}."
    else
        log_warn "Script is not running inside a Git repository."
    fi

    # 6. Verify Nginx syntax if nginx is available
    if command -v nginx >/dev/null 2>&1; then
        if nginx -t 2>/dev/null; then
            log_success "Nginx configuration syntax test: OK."
        else
            log_warn "Nginx configuration syntax test failed or requires sudo permissions."
        fi
    fi

    # 7. Check database connectivity and pending migrations safely
    if [[ -f "${SHARED_DIR}/.env" ]]; then
        log "Testing database connectivity and pending migrations (read-only)..."
        if (cd "${SCRIPT_DIR}/backend" && php artisan migrate:status >/dev/null 2>&1); then
            log_success "Database connectivity verified. Migration status: OK."
        else
            log_warn "Database connectivity check failed or migrations table uninitialized."
        fi

        # 8. Check Redis configuration if CACHE_STORE=redis
        local cache_store
        cache_store=$(grep -E '^CACHE_STORE=' "${SHARED_DIR}/.env" 2>/dev/null | cut -d '=' -f 2 | tr -d ' "' || echo "")
        if [[ "${cache_store}" == "redis" ]]; then
            log "Verifying Redis configuration (CACHE_STORE=redis)..."
            if php -m | grep -qi "^redis$"; then
                log_success "PHP extension 'redis' (phpredis) is loaded."
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
                log_info "redis-cli not installed; check Redis service via 'systemctl status redis-server'."
            fi
        fi
    fi

    log_success "Environment check completed successfully."
}

# ------------------------------------------------------------------------------
# COMMAND: build
# ------------------------------------------------------------------------------
cmd_build() {
    acquire_lock
    mkdir -p "${LOGS_DIR}" "${RELEASES_DIR}"
    log "=================================================================="
    log "Preparing New Release Artifact: ${TIMESTAMP}"
    log "=================================================================="

    mkdir -p "${NEW_RELEASE_DIR}"
    
    # 1. Copy application files into release directory
    log "Copying source repository to release directory..."
    mkdir -p "${NEW_RELEASE_DIR}/backend" "${NEW_RELEASE_DIR}/frontend"
    
    cp -r "${SCRIPT_DIR}/backend/." "${NEW_RELEASE_DIR}/backend/"
    cp -r "${SCRIPT_DIR}/frontend/." "${NEW_RELEASE_DIR}/frontend/"

    # 2. Build Frontend
    log "Installing frontend dependencies & compiling Vite production bundle..."
    (
        cd "${NEW_RELEASE_DIR}/frontend"
        npm ci --prefer-offline --no-audit
        npm run build
    )
    log_success "Frontend production bundle compiled successfully."

    # 3. Install Backend Dependencies
    log "Installing Laravel production dependencies via Composer..."
    (
        cd "${NEW_RELEASE_DIR}/backend"
        composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
    )
    log_success "Composer production dependencies installed successfully."

    log_success "Release build completed in ${NEW_RELEASE_DIR}."
    log "Active release remains untouched. Run './deploy.sh deploy' with DEPLOY_APPROVED=true to activate."
}

# ------------------------------------------------------------------------------
# COMMAND: deploy
# ------------------------------------------------------------------------------
cmd_deploy() {
    # MANDATORY MULTI-FACTOR APPROVAL GATE
    if [[ "${DEPLOY_APPROVED:-false}" != "true" ]]; then
        log_err "=================================================================="
        log_err "DEPLOYMENT HALTED: EXPLICIT APPROVAL GATE REQUIRED."
        log_err "To execute a live release, you must explicitly set DEPLOY_APPROVED=true:"
        log_err "  DEPLOY_APPROVED=true ./deploy.sh deploy"
        log_err "=================================================================="
        exit 1
    fi

    # Defense-in-depth: Flag alone is insufficient without explicit operator confirmation
    local permit_file="${BASE_DEPLOY_DIR}/.deploy_permit"
    if [[ ! -f "${permit_file}" && "${CONFIRM_DEPLOYMENT:-false}" != "true" ]]; then
        if [ -t 0 ]; then
            echo -e "${YELLOW}==================================================================${NC}"
            echo -e "${YELLOW}LIVE PRODUCTION RELEASE ACTIVATION REQUESTED${NC}"
            echo -e "${YELLOW}==================================================================${NC}"
            read -r -p "Type 'ACTIVATE-PRODUCTION' to proceed: " confirm_input
            if [[ "${confirm_input}" != "ACTIVATE-PRODUCTION" ]]; then
                log_err "Deployment canceled by operator."
                exit 1
            fi
        else
            log_err "=================================================================="
            log_err "NON-INTERACTIVE DEPLOYMENT REJECTED: PERMIT FILE REQUIRED."
            log_err "A command-line flag alone cannot bypass the approval gate."
            log_err "Create single-use permit file or pass CONFIRM_DEPLOYMENT=true:"
            log_err "  touch ${permit_file}"
            log_err "=================================================================="
            exit 1
        fi
    fi
    # Consume single-use permit if present
    rm -f "${permit_file}"

    acquire_lock
    mkdir -p "${LOGS_DIR}" "${SHARED_DIR}" "${RELEASES_DIR}"

    # 1. Ensure shared directory structure exists
    mkdir -p "${SHARED_DIR}/storage/app/public"
    mkdir -p "${SHARED_DIR}/storage/app/secure_docs"
    mkdir -p "${SHARED_DIR}/storage/framework/cache"
    mkdir -p "${SHARED_DIR}/storage/framework/sessions"
    mkdir -p "${SHARED_DIR}/storage/framework/views"
    mkdir -p "${SHARED_DIR}/storage/logs"

    # 2. Verify shared .env file exists
    if [[ ! -f "${SHARED_DIR}/.env" ]]; then
        log_err "Cannot deploy: Production environment file ${SHARED_DIR}/.env is missing!"
        log_err "Please create it from .env.example before deploying."
        exit 1
    fi

    log "=================================================================="
    log "Starting Live Release Activation: ${TIMESTAMP}"
    log "=================================================================="

    # 3. If build hasn't run for this release, run it
    if [[ ! -d "${NEW_RELEASE_DIR}" ]]; then
        log "Release directory ${NEW_RELEASE_DIR} does not exist. Running build step first..."
        cmd_build
    fi

    # 4. Link persistent .env and storage into new release
    log "Linking shared storage and production environment configuration..."
    rm -rf "${NEW_RELEASE_DIR}/backend/storage"
    ln -nfs "${SHARED_DIR}/storage" "${NEW_RELEASE_DIR}/backend/storage"
    ln -nfs "${SHARED_DIR}/.env" "${NEW_RELEASE_DIR}/backend/.env"

    # 5. Run storage link
    (
        cd "${NEW_RELEASE_DIR}/backend"
        php artisan storage:link || true
    )

    # 6. Execute safe production migrations
    log "Running database migrations..."
    (
        cd "${NEW_RELEASE_DIR}/backend"
        php artisan migrate --force
    )

    # 7. Cache framework configurations
    log "Optimizing Laravel configuration, routes, and views..."
    (
        cd "${NEW_RELEASE_DIR}/backend"
        php artisan config:cache
        php artisan route:cache
        php artisan event:cache

        if grep -q "CACHE_STORE=redis" "${SHARED_DIR}/.env" 2>/dev/null; then
            log "Verifying Redis cache connectivity..."
            php artisan redis:verify || log_warn "Redis verification failed. Ensure Redis service is running."
        fi
    )

    # 8. Atomically switch current release symlink
    log "Atomically switching live application symlink to release ${TIMESTAMP}..."
    ln -nfs "${NEW_RELEASE_DIR}" "${BASE_DEPLOY_DIR}/current_tmp"
    mv -Tf "${BASE_DEPLOY_DIR}/current_tmp" "${CURRENT_SYMLINK}"

    # 9. Sync/link frontend dist to web root if configured
    if [[ -d "${WWW_ROOT}" && "${WWW_ROOT}" != "${CURRENT_SYMLINK}"* ]]; then
        log "Updating public web root at ${WWW_ROOT}..."
        # Preserve aaPanel files (.user.ini, .htaccess, ssl cert files)
        mkdir -p "${WWW_ROOT}/assets"
        cp -r "${NEW_RELEASE_DIR}/frontend/dist/assets/." "${WWW_ROOT}/assets/"
        cp "${NEW_RELEASE_DIR}/frontend/dist/index.html" "${WWW_ROOT}/index.html"
    fi

    # 10. Reload PHP-FPM if systemctl is available
    if command -v systemctl >/dev/null 2>&1; then
        if systemctl is-active --quiet php8.2-fpm; then
            log "Reloading php8.2-fpm service..."
            sudo systemctl reload php8.2-fpm || log_warn "Could not reload php8.2-fpm without sudo privileges."
        fi
    fi

    # 11. Clean old releases (keep latest 5)
    log "Pruning old releases (retaining latest 5)..."
    (
        cd "${RELEASES_DIR}"
        ls -td */ | tail -n +6 | xargs -I {} rm -rf "{}" || true
    )

    log_success "=================================================================="
    log_success "DEPLOYMENT COMPLETED SUCCESSFULLY: Release ${TIMESTAMP}"
    log_success "=================================================================="
}

# ------------------------------------------------------------------------------
# COMMAND: rollback
# ------------------------------------------------------------------------------
cmd_rollback() {
    acquire_lock
    log "=================================================================="
    log "Initiating Emergency Rollback to Previous Release"
    log "=================================================================="

    local previous_release
    previous_release="$(ls -td "${RELEASES_DIR}"/*/ 2>/dev/null | sed -n '2p' || true)"

    if [[ -z "${previous_release}" ]]; then
        log_err "Cannot rollback: No previous release found in ${RELEASES_DIR}."
        exit 1
    fi

    log "Previous release identified: ${previous_release}"
    
    # Atomically point symlink back
    ln -nfs "${previous_release}" "${BASE_DEPLOY_DIR}/current_tmp"
    mv -Tf "${BASE_DEPLOY_DIR}/current_tmp" "${CURRENT_SYMLINK}"

    # Flush caches on rolled back release
    if [[ -d "${CURRENT_SYMLINK}/backend" ]]; then
        (
            cd "${CURRENT_SYMLINK}/backend"
            php artisan config:cache || true
            php artisan route:cache || true
            php artisan view:cache || true
        )
    fi

    # Sync rolled-back frontend assets to WWW_ROOT if configured
    if [[ -d "${WWW_ROOT}" && "${WWW_ROOT}" != "${CURRENT_SYMLINK}"* ]]; then
        log "Restoring frontend assets in ${WWW_ROOT} from rolled-back release..."
        mkdir -p "${WWW_ROOT}/assets"
        cp -r "${CURRENT_SYMLINK}/frontend/dist/assets/." "${WWW_ROOT}/assets/"
        cp "${CURRENT_SYMLINK}/frontend/dist/index.html" "${WWW_ROOT}/index.html"
    fi

    # Reload PHP-FPM
    if command -v systemctl >/dev/null 2>&1; then
        if systemctl is-active --quiet php8.2-fpm; then
            sudo systemctl reload php8.2-fpm || true
        fi
    fi

    log_success "Rollback completed. Application is now running on: ${previous_release}"
}

# ------------------------------------------------------------------------------
# MAIN ENTRYPOINT
# ------------------------------------------------------------------------------
case "${1:-}" in
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
        echo "Usage: $0 {check|build|deploy|rollback}"
        echo ""
        echo "Commands:"
        echo "  check     Verify environment, PHP extensions, and tools"
        echo "  build     Compile frontend & backend release artifact"
        echo "  deploy    Activate release (requires DEPLOY_APPROVED=true)"
        echo "  rollback  Atomically revert to the previous release"
        exit 1
        ;;
esac
